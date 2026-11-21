import { BUILDINGS, type BuildingInstance } from './buildings/catalog';
import type { City } from './City';
import type { TilePos } from './roads';
import type { World } from './World';

/**
 * Undo for the last player action (docs/specs/buildings.md, "Undo"; D-101). Touch builds on
 * release, so a slipped finger must be cheap to take back.
 *
 * How: before an action we snapshot every player-editable layer on the tiles it can touch, and
 * the buildings standing there; after it, the same tiles again. Undo puts the "before" back and
 * refunds what was spent, but only while those tiles still look exactly like "after": once the
 * city has changed them (a home grew on the new zone, a later edit), undoing would erase that
 * too, so it is refused instead.
 */

/** The layers a player action can change (terrain, elevation and variant never do). */
const LAYERS = [
  'tree',
  'decor',
  'road',
  'bridge',
  'lane',
  'pave',
  'zone',
  'rail',
  'over',
  'overAxis',
] as const;
type Layer = (typeof LAYERS)[number];

type LayerValues = Readonly<Record<Layer, Uint8Array>>;

/** Tiles and buildings as they were before an action. */
export interface UndoCapture {
  /** Tile indices covered, sorted. */
  readonly indices: Int32Array;
  readonly layers: LayerValues;
  readonly building: Int32Array;
  /** The buildings standing on those tiles: the live objects, and where each stood. */
  readonly buildings: ReadonlyMap<
    number,
    { readonly instance: BuildingInstance; readonly x: number; readonly y: number }
  >;
  readonly funds: number;
}

/** A finished action that can be taken back. */
export interface UndoRecord {
  readonly before: UndoCapture;
  readonly afterLayers: LayerValues;
  readonly afterBuilding: Int32Array;
  /** Money the action cost (refunded on undo). */
  readonly spent: number;
}

export interface UndoResult {
  ok: boolean;
  reason?: 'changed-since';
  /** Bounding box of the restored tiles, for render refresh. */
  changed?: { minX: number; minY: number; maxX: number; maxY: number };
  refunded?: number;
}

/**
 * Snapshot what an action over `tiles` can change. Any building on those tiles is covered as a
 * whole (clearing or rezoning one tile removes all of it), so pass a moved building's own tile too.
 */
export function captureUndo(city: City, tiles: readonly TilePos[]): UndoCapture {
  const w = city.world;
  const set = new Set<number>();
  for (const t of tiles) if (w.inBounds(t.x, t.y)) set.add(w.index(t.x, t.y));
  const buildings = new Map<number, { instance: BuildingInstance; x: number; y: number }>();
  for (const i of [...set]) {
    const b = w.buildings.get(w.building[i]);
    if (!b || buildings.has(b.id)) continue;
    buildings.set(b.id, { instance: b, x: b.x, y: b.y });
    for (const j of footprint(w, b)) set.add(j);
  }
  const indices = Int32Array.from([...set].sort((a, b) => a - b));
  return {
    indices,
    layers: readLayers(w, indices),
    building: readBuilding(w, indices),
    buildings,
    funds: city.funds,
  };
}

/** Close a capture after the action ran. Null when nothing changed (nothing to undo). */
export function finishUndo(city: City, before: UndoCapture): UndoRecord | null {
  const w = city.world;
  const afterLayers = readLayers(w, before.indices);
  const afterBuilding = readBuilding(w, before.indices);
  const moved = [...before.buildings.values()].some(
    (b) => b.instance.x !== b.x || b.instance.y !== b.y,
  );
  if (!moved && same(before.layers, afterLayers) && equal(before.building, afterBuilding))
    return null;
  return { before, afterLayers, afterBuilding, spent: Math.max(0, before.funds - city.funds) };
}

/** Whether the record's tiles still look exactly as the action left them. */
export function canUndo(world: World, rec: UndoRecord): boolean {
  const idx = rec.before.indices;
  return (
    same(readLayers(world, idx), rec.afterLayers) &&
    equal(readBuilding(world, idx), rec.afterBuilding)
  );
}

/** Take the action back: restore the tiles and buildings, refund the cost. */
export function applyUndo(city: City, rec: UndoRecord): UndoResult {
  const w = city.world;
  if (!canUndo(w, rec)) return { ok: false, reason: 'changed-since' };
  const { indices, layers, building, buildings } = rec.before;

  // Buildings the action put down (placed, or the grown one zoning removed and something else) go.
  const after = new Set<number>();
  for (const id of rec.afterBuilding) if (id !== -1) after.add(id);
  for (const id of after) if (!buildings.has(id)) w.buildings.delete(id);
  // Buildings it removed come back as they were; a moved one returns to its old tile.
  for (const [id, b] of buildings) {
    b.instance.x = b.x;
    b.instance.y = b.y;
    w.buildings.set(id, b.instance);
  }
  for (let k = 0; k < indices.length; k++) {
    const i = indices[k];
    for (const l of LAYERS) w[l][i] = layers[l][k];
    w.building[i] = building[k];
  }
  city.funds += rec.spent;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const i of indices) {
    const x = i % w.width;
    const y = (i - x) / w.width;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { ok: true, changed: { minX, minY, maxX, maxY }, refunded: rec.spent };
}

function footprint(w: World, b: BuildingInstance): number[] {
  const { w: bw, h: bh } = BUILDINGS[b.def].size;
  const out: number[] = [];
  for (let y = b.y; y < b.y + bh; y++)
    for (let x = b.x; x < b.x + bw; x++) if (w.inBounds(x, y)) out.push(w.index(x, y));
  return out;
}

function readLayers(w: World, indices: Int32Array): LayerValues {
  const read = (l: Layer) => {
    const src = w[l];
    const a = new Uint8Array(indices.length);
    for (let k = 0; k < indices.length; k++) a[k] = src[indices[k]];
    return a;
  };
  return {
    tree: read('tree'),
    decor: read('decor'),
    road: read('road'),
    bridge: read('bridge'),
    lane: read('lane'),
    pave: read('pave'),
    zone: read('zone'),
    rail: read('rail'),
    over: read('over'),
    overAxis: read('overAxis'),
  } satisfies LayerValues;
}

function readBuilding(w: World, indices: Int32Array): Int32Array {
  const a = new Int32Array(indices.length);
  for (let k = 0; k < indices.length; k++) a[k] = w.building[indices[k]];
  return a;
}

function same(a: LayerValues, b: LayerValues): boolean {
  return LAYERS.every((l) => equal(a[l], b[l]));
}

function equal(a: Uint8Array | Int32Array, b: Uint8Array | Int32Array): boolean {
  if (a.length !== b.length) return false;
  for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) return false;
  return true;
}
