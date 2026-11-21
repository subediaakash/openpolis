import { mulberry32, subSeed } from '../shared/rng';
import { ART_VARIANTS, BUILDINGS, startLevel, zonedBuildings, type BuildingDef, type BuildingId } from './buildings/catalog';
import { BALANCE } from '../shared/balance';
import { Decor, Terrain } from './terrain/types';
import { isWaterTile } from './terrain/elevation';
import type { City } from './City';
import type { World } from './World';
import { applyPlace, applyRail, applyRoad, applyZone, planPlace, planRail, planRoad, planZone } from './commands';
import { growDay } from './systems/growth';
import { refreshCity } from './core/Simulation';
import { findEntrance } from './systems/access';
import { simulateDay } from './systems/population';
import { rectTiles, roadPath, RoadType } from './roads';
import { PAVEMENTS } from './roadTypes';
import { needsUtilities, roadIslands } from './systems/utilities';
import { isZoned, ZONE_DENSITY, ZONE_LETTER, ZoneType, type ZonedType } from './zones';

/**
 * The /demo city (docs/specs/demo.md, D-106): a planned, fully grown town on any map, the same
 * for the same seed. Districts ring a civic core: the town hall on its green and the campus,
 * then a downtown of offices and towers inside a ring of tree-lined avenues, apartments with
 * shopping streets along the axes, and houses on the outskirts round three park quarters.
 * Every neighbourhood gets the same kit on a regular pattern: a pocket park in each home block,
 * a police, clinic and fire row on a lattice of local centres, and a bus station, school and
 * recycling centre every third block. Industry and gas power sit in one corner behind a belt of
 * offices, the riverbanks are parks, and blocks that are mostly river stay wild. Then a couple
 * of years of growth are simulated, adding plants and towers whenever the city runs short.
 */

/** Street spacing: 5×5 blocks between roads. */
const PITCH = 6;
/** Blocks from the centre to the edge of the planned area. */
const BLOCKS = 5;
/** Simulated days, and growth steps per day (several, so the city matures quickly). */
const DAYS = 640;
const GROWTH_STEPS = 3;
/** Days simulated after the empty lots are built out. */
const SETTLE_DAYS = 40;
/** The inland landmarks and the blocks they stand in. */
const LANDMARKS: readonly { bx: number; by: number; id: BuildingId }[] = [
  { bx: 3, by: 3, id: 'sky_tower' },
  { bx: 6, by: 6, id: 'theme_park' },
];
/** Landmarks that stand on the riverbank, in the waterfront blocks nearest the centre. */
const WATERFRONT_LANDMARKS: readonly BuildingId[] = ['sail_hotel', 'observation_wheel', 'riverside_market'];
/** Within this many tiles of water a block is waterfront (towers and the promenade). */
const BANK = 1;
/** Within this many tiles of water a block is near the river (apartments). */
const NEAR_RIVER = 7;
/**
 * The park quarters: a big park framed by lawns and trees beside the Sky Tower and the Sail Hotel
 * (so each landmark stands in a green), and one in the south-west homes (industry has the fourth
 * corner). Off the rail row, which would cut them in half.
 */
const GREENS: readonly { bx: number; by: number; id: BuildingId }[] = [
  { bx: 2, by: 3, id: 'botanical_garden' },
  { bx: 7, by: 3, id: 'park' },
  { bx: 2, by: 7, id: 'central_park' },
];
/** Inland, a park block on a sparse lattice among the houses, in turn a lawn, a central park and a garden. */
const HOUSE_PARKS: readonly BuildingId[] = ['park', 'central_park', 'botanical_garden'];
/** The row of blocks the rail line runs through (north of the town hall). */
const RAIL_ROW = 2;
/** Downtown: the blocks inside the avenue ring (street lines DOWNTOWN[0]..DOWNTOWN[1]). */
const DOWNTOWN = [BLOCKS - 2, BLOCKS + 2] as const;
/** Street lines that are tree-lined avenues: the city's frame, the two central axes and the ring round downtown. */
const AVENUES: readonly number[] = [0, DOWNTOWN[0], BLOCKS, DOWNTOWN[1], 2 * BLOCKS];
/** Footpaths (World.pave is an index into PAVEMENTS plus one): promenades on the axes, setts downtown. */
const PAVE_AXIS = PAVEMENTS.indexOf('promenade') + 1;
const PAVE_DOWNTOWN = PAVEMENTS.indexOf('setts') + 1;
/** A block with fewer buildable tiles than this (mostly river or rock) is left as nature. */
const MIN_LAND = 8;
/** A block whose middle is further than this (tiles each way) from a station gets a bus station (bus stations serve 10). */
const TRANSIT_WALK = 6;
/** Power plants for this much more than the evening peak (the city keeps growing). */
const POWER_HEADROOM = 1.4;
/** The city's power: gas burns half as dirty as coal for more power (sim/systems/air.ts). */
const PLANT = 'gas_plant' satisfies BuildingId;

type BlockUse =
  /** Zoned. `civic` blocks are local centres (police, clinic and fire along the north street). */
  | { kind: 'zone'; zone: ZonedType; civic: boolean }
  | { kind: 'landmark'; id: BuildingId }
  | { kind: 'green'; id: BuildingId }
  | { kind: 'services' }
  | { kind: 'utilities' }
  | { kind: 'hall' }
  | { kind: 'campus' }
  /** Mostly river or rock: no streets of its own, no buildings. */
  | { kind: 'wild' };

export interface DemoCity {
  /** Tile at the middle of the planned area (for the camera). */
  centre: { x: number; y: number };
}

export function buildDemoCity(city: City, seed: number): DemoCity {
  const w = city.world;
  const rng = mulberry32(subSeed(seed, 0xde70));
  const cx = Math.floor(w.width / 2);
  const cy = Math.floor(w.height / 2);
  const x0 = cx - BLOCKS * PITCH;
  const y0 = cy - BLOCKS * PITCH;
  const span = 2 * BLOCKS * PITCH;
  const n = 2 * BLOCKS;

  // What each block is for: density follows the river (towers on the banks, houses inland).
  // Blocks that are mostly river stay wild.
  const shore = (bx: number, by: number) => waterDistance(w, x0 + bx * PITCH + 1, y0 + by * PITCH + 1);
  const waterfront = WATERFRONT_LANDMARKS.length > 0 ? pickWaterfront(n, shore, (bx, by) => buildableTiles(w, x0 + bx * PITCH + 1, y0 + by * PITCH + 1)) : [];
  const uses: BlockUse[][] = [];
  for (let by = 0; by < n; by++) {
    const row: BlockUse[] = [];
    for (let bx = 0; bx < n; bx++) {
      const land = buildableTiles(w, x0 + bx * PITCH + 1, y0 + by * PITCH + 1);
      const k = waterfront.findIndex((b) => b.bx === bx && b.by === by);
      row.push(land < MIN_LAND ? { kind: 'wild' } : k !== -1 ? { kind: 'landmark', id: WATERFRONT_LANDMARKS[k] } : blockUse(bx, by, shore(bx, by)));
    }
    uses.push(row);
  }
  const used = (bx: number, by: number) => bx >= 0 && by >= 0 && bx < n && by < n && uses[by][bx].kind !== 'wild';

  /** Between two blocks of houses, every other north–south street is a green lane: lawns and trees, no cars. */
  const houses = (bx: number, by: number) => {
    const u = bx >= 0 && bx < n ? uses[by][bx] : null;
    return u !== null && u.kind === 'zone' && u.zone === ZoneType.Residential && !u.civic;
  };
  const greenLane = (k: number, s: number) => k % 2 === 0 && houses(k - 1, s) && houses(k, s);

  // Streets: each line is planned as runs of whole segments, so a river crossing is one straight
  // bridge. The avenues run the whole way; a street only runs beside used blocks. Avenues go first
  // so they keep their junctions; tiles that can't be built (rock, a bridge too long) are skipped.
  for (const avenues of [true, false]) {
    for (let k = 0; k <= n; k++) {
      if (AVENUES.includes(k) !== avenues) continue;
      const type = avenues ? RoadType.Avenue : RoadType.Road;
      // The central axes are promenades.
      const pave = k === BLOCKS ? PAVE_AXIS : 0;
      for (const vertical of [true, false]) {
        const wanted = (s: number) =>
          avenues || (vertical ? (used(k - 1, s) || used(k, s)) && !greenLane(k, s) : used(s, k - 1) || used(s, k));
        const at = (s: number) => (vertical ? { x: x0 + k * PITCH, y: y0 + s * PITCH } : { x: x0 + s * PITCH, y: y0 + k * PITCH });
        for (let s = 0; s < n; s++) {
          if (!wanted(s)) continue;
          let e = s;
          while (e + 1 < n && wanted(e + 1)) e++;
          applyRoad(city, planRoad(w, roadPath(at(s), at(e + 1), true), type), type, pave);
          s = e;
        }
      }
    }
  }
  // Downtown's streets are paved in setts.
  for (let y = y0 + DOWNTOWN[0] * PITCH + 1; y < y0 + DOWNTOWN[1] * PITCH; y++) {
    for (let x = x0 + DOWNTOWN[0] * PITCH + 1; x < x0 + DOWNTOWN[1] * PITCH; x++) {
      const i = w.index(x, y);
      if (w.road[i] === RoadType.Road && w.pave[i] === 0) w.pave[i] = PAVE_DOWNTOWN;
    }
  }

  const utilitySlots: UtilitySlot[] = [];
  const place = (id: BuildingId, x: number, y: number) => applyPlace(city, planPlace(w, id, x, y), Math.floor(rng() * ART_VARIANTS)).ok;
  /** Place by the footprint's top-left tile. */
  const placeAt = (id: BuildingId, left: number, top: number) => {
    const { w: bw, h: bh } = BUILDINGS[id].size;
    return place(id, left + Math.floor((bw - 1) / 2), top + Math.floor((bh - 1) / 2));
  };
  const parks = (ix: number, iy: number) => {
    for (let y = iy; y < iy + 5; y++) for (let x = ix; x < ix + 5; x++) place('park', x, y);
  };

  for (let k = 1; k < n; k++) {
    if (AVENUES.includes(k)) continue;
    for (let s = 0; s < n; s++) {
      if (!greenLane(k, s)) continue;
      for (let y = y0 + s * PITCH + 1; y < y0 + (s + 1) * PITCH; y++) place('park', x0 + k * PITCH, y);
    }
  }

  // A rail line across the city through the middle of one row of blocks (E7b), crossing the
  // north–south streets at right angles, with a station in every other block along it.
  const lineY = y0 + RAIL_ROW * PITCH + 3;
  applyRail(city, planRail(w, roadPath({ x: x0 + 1, y: lineY }, { x: x0 + span - 1, y: lineY }, true)));
  for (let bx = 0; bx < n; bx += 2) {
    const kind = uses[RAIL_ROW][bx].kind;
    if (kind === 'zone') place('train_station', x0 + bx * PITCH + 2, lineY - 2);
  }
  // Power substations on a 12-tile grid (every other block's south corner, by the street):
  // every building is within a substation's 12-tile reach (docs/specs/energy.md). Water towers
  // on the same grid: every building within a tower's 14-tile reach (D-093); downtown's towers
  // and offices drink far more, so its blocks each get their own tower too.
  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      if (uses[by][bx].kind === 'wild') continue;
      const ix = x0 + bx * PITCH + 1;
      const iy = y0 + by * PITCH + 1;
      if (bx % 2 === 0 && by % 2 === 0) place('substation', ix + 4, iy + 4);
      if ((bx % 2 === 0 && by % 2 === 0) || ringOf(bx, by) <= 1) place('water_tower', ix, iy + 4);
    }
  }

  // Every block within a short walk of a bus or train station (apartments and better-off homes
  // want one): where the services blocks and the railway don't reach, the block gets its own.
  // The services blocks' own bus stations first (by the north-west corner).
  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      if (uses[by][bx].kind !== 'services') continue;
      const ix = x0 + bx * PITCH + 1;
      const iy = y0 + by * PITCH + 1;
      if (!placeAt('bus_station', ix, iy)) placeInBlock(city, 'bus_station', ix, iy, rng);
    }
  }
  const stations: { x: number; y: number }[] = [];
  for (const b of w.buildings.values()) {
    if (b.def === 'bus_station' || b.def === 'train_station') stations.push({ x: b.x + 1, y: b.y + 1 });
  }
  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      const use = uses[by][bx];
      if (use.kind !== 'zone' || ZONE_LETTER[use.zone] === 'I') continue;
      const ix = x0 + bx * PITCH + 1;
      const iy = y0 + by * PITCH + 1;
      const c = { x: ix + 2, y: iy + 2 };
      if (stations.some((st) => Math.max(Math.abs(st.x - c.x), Math.abs(st.y - c.y)) <= TRANSIT_WALK)) continue;
      // At the back of the block, behind a local centre's front row.
      if (placeAt('bus_station', ix + 2, iy + 1) || placeInBlock(city, 'bus_station', ix, iy, rng)) stations.push(c);
    }
  }

  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      const use = uses[by][bx];
      if (use.kind === 'wild') continue;
      // Block interior: the 5×5 between the streets.
      const ix = x0 + bx * PITCH + 1;
      const iy = y0 + by * PITCH + 1;
      /** Zone rows `from`..4 of the block. */
      const zone = (z: ZonedType, from = 0) => applyZone(city, planZone(w, rectTiles({ x: ix, y: iy + from }, { x: ix + 4, y: iy + 4 }), z), z);
      if (use.kind === 'landmark') {
        // A showpiece on the street corner (or wherever the riverbank leaves room), the rest of the block a park round it.
        if (!placeAt(use.id, ix, iy)) placeInBlock(city, use.id, ix, iy, rng);
        parks(ix, iy);
      } else if (use.kind === 'green') {
        // A park quarter: the big park in the middle, framed by lawns and trees.
        if (use.id !== 'park') placeAt(use.id, ix + 1, iy + 1);
        parks(ix, iy);
      } else if (use.kind === 'hall') {
        placeAt('town_hall', ix + 1, iy + 1);
        parks(ix, iy);
      } else if (use.kind === 'campus') {
        // Downtown hospital and university, the expectations of better-off residents.
        placeAt('hospital', ix, iy);
        placeAt('university', ix, iy + 2);
        zone(ZoneType.CommercialHigh);
      } else if (use.kind === 'services') {
        // A neighbourhood centre: the bus station (placed earlier), school and recycling, with the
        // emergency services in a row beneath, and shops along the south street (zoning skips their tiles).
        for (const [id, ox, oy] of [
          ['recycling_centre', 3, 2],
          ['school', 3, 0],
          ['police_station', 0, 3],
          ['clinic', 1, 3],
          ['fire_station', 2, 3],
        ] as const) {
          if (!placeAt(id, ix + ox, iy + oy)) placeInBlock(city, id, ix, iy, rng);
        }
        zone(ZoneType.Commercial);
      } else if (use.kind === 'zone') {
        // A local centre: police, the school, clinic and fire along the north street, with two
        // rows of shops behind them; the district's homes further back. Industry only needs the
        // emergency services.
        const centre = use.civic && ZONE_LETTER[use.zone] !== 'I';
        if (use.civic) {
          const civic = centre
            ? ([['police_station', 0, 0], ['school', 1, 0], ['clinic', 3, 0], ['fire_station', 4, 0]] as const)
            : ([['police_station', 0, 0], ['fire_station', 4, 0]] as const);
          for (const [id, ox, oy] of civic) if (!placeAt(id, ix + ox, iy + oy)) placeInBlock(city, id, ix, iy, rng);
        }
        // Every home block keeps a pocket park in its middle (behind the shops in a local centre).
        if (ZONE_LETTER[use.zone] === 'R') placeAt('park', ix + 2, iy + (centre ? 3 : 2));
        if (ZONE_LETTER[use.zone] !== 'I') shoreParks(city, ix, iy, place);
        if (centre) zone(ZoneType.Commercial);
        zone(use.zone, centre ? 3 : 0);
      } else {
        // Utility district: gas plants and water towers are added as the city needs them; the
        // industrial corner's police and fire stations stand by its north-east street.
        placeAt('police_station', ix + 4, iy);
        placeAt('fire_station', ix + 4, iy + 1);
        for (const [ox, oy] of [
          [0, 0],
          [2, 0],
          [0, 2],
          [2, 2],
        ] as const) {
          utilitySlots.push({ id: PLANT, x: ix + ox, y: iy + oy });
        }
        for (let k = 0; k < 5; k++) utilitySlots.push({ id: 'water_tower', x: ix + k, y: iy + 4 });
        for (let k = 2; k < 4; k++) utilitySlots.push({ id: 'water_tower', x: ix + 4, y: iy + k });
      }
    }
  }

  // Start with one plant and one tower in the district; add more wherever the city runs short.
  for (const id of [PLANT, 'water_tower'] as const) {
    const k = utilitySlots.findIndex((s) => s.id === id && place(s.id, s.x, s.y));
    if (k !== -1) utilitySlots.splice(k, 1);
  }

  const grow = mulberry32(subSeed(seed, 0x6077));
  refreshCity(w);
  for (let day = 0; day < DAYS; day++) {
    for (let k = 0; k < GROWTH_STEPS; k++) growDay(w, grow, city.taxRate);
    refreshCity(w);
    if (day % 5 === 0) serveIslands(city, utilitySlots, rng);
    simulateDay(w);
  }
  serveIslands(city, utilitySlots, rng);

  // A showcase shouldn't have empty blocks: build out every lot growth hasn't reached yet,
  // then simulate a month so people move in and utilities catch up.
  fillLots(city, rng);
  refreshCity(w);
  // The build-out jumps demand: add plants and towers until everyone is supplied.
  for (let k = 0; k < 60 && serveIslands(city, utilitySlots, rng); k++);
  for (let day = 0; day < SETTLE_DAYS; day++) {
    refreshCity(w);
    if (day % 5 === 0) serveIslands(city, utilitySlots, rng);
    simulateDay(w);
  }
  for (let k = 0; k < 60 && serveIslands(city, utilitySlots, rng); k++);
  powerHeadroom(city, utilitySlots, rng);
  refreshCity(w);
  city.day = DAYS + SETTLE_DAYS;
  return { centre: { x: x0 + span / 2, y: y0 + span / 2 } };
}

/** Buildable tiles (land that isn't rock) in the 5×5 block interior at (ix, iy). */
function buildableTiles(w: World, ix: number, iy: number): number {
  let n = 0;
  for (let y = iy; y < iy + 5; y++) {
    for (let x = ix; x < ix + 5; x++) {
      if (!w.inBounds(x, y)) continue;
      const i = w.index(x, y);
      if (!isWaterTile(w, i) && w.terrain[i] !== Terrain.Rock) n++;
    }
  }
  return n;
}

/** Place `id` on the first spot in the 5×5 block at (ix, iy) where it fits (its planned tile was river or rock). */
function placeInBlock(city: City, id: BuildingId, ix: number, iy: number, rng: () => number): boolean {
  const { w: bw, h: bh } = BUILDINGS[id].size;
  for (let y = iy; y + bh <= iy + 5; y++) {
    for (let x = ix; x + bw <= ix + 5; x++) {
      const plan = planPlace(city.world, id, x + Math.floor((bw - 1) / 2), y + Math.floor((bh - 1) / 2));
      if (plan.ok && applyPlace(city, plan, Math.floor(rng() * ART_VARIANTS)).ok) return true;
    }
  }
  return false;
}

/** The riverbank as a park: every land tile of the block that touches water. */
function shoreParks(city: City, ix: number, iy: number, place: (id: BuildingId, x: number, y: number) => boolean) {
  const w = city.world;
  const wet = (x: number, y: number) => w.inBounds(x, y) && isWaterTile(w, w.index(x, y));
  for (let y = iy; y < iy + 5; y++) {
    for (let x = ix; x < ix + 5; x++) {
      if (wet(x, y)) continue;
      let shore = false;
      for (let dy = -1; dy <= 1 && !shore; dy++) for (let dx = -1; dx <= 1 && !shore; dx++) shore = wet(x + dx, y + dy);
      if (shore) place('park', x, y);
    }
  }
}

/**
 * Build a finished building on every empty zoned lot with road access: 2×2 at the top level
 * where a whole square of the zone is free (towers downtown, factories in industry), otherwise
 * the zone's best 1×1 (houses on the outskirts mix levels 1 and 2).
 */
function fillLots(city: City, rng: () => number) {
  const w = city.world;
  const free = (x: number, y: number, z: number) =>
    w.inBounds(x, y) && w.zone[w.index(x, y)] === z && w.building[w.index(x, y)] === -1;
  const build = (def: BuildingId, x: number, y: number) => {
    const { w: bw, h: bh } = BUILDINGS[def].size;
    for (let ty = y; ty < y + bh; ty++) {
      for (let tx = x; tx < x + bw; tx++) {
        const i = w.index(tx, ty);
        w.tree[i] = 0;
        w.decor[i] = Decor.None;
      }
    }
    w.addBuilding({ def, x, y, variant: Math.floor(rng() * ART_VARIANTS), grown: true }, bw, bh);
  };
  for (let y = 0; y < w.height; y++) {
    for (let x = 0; x < w.width; x++) {
      const z = w.zone[w.index(x, y)];
      if (!isZoned(z) || !free(x, y, z)) continue;
      if (findEntrance(w, x, y, 1, 1, BALANCE.roadAccessRange) === -1) continue;
      const letter = ZONE_LETTER[z];
      const density = ZONE_DENSITY[z];
      const square = free(x + 1, y, z) && free(x, y + 1, z) && free(x + 1, y + 1, z);
      const big = [3, 2].map((level) => zonedBuildings(letter, density, level, 2)).find((ids) => ids.length > 0) ?? [];
      // Most free squares become one big building; some stay small for variety.
      if (square && big.length > 0 && rng() < 0.75) {
        build(big[Math.floor(rng() * big.length)], x, y);
        continue;
      }
      const top = startLevel(letter, density) + (rng() < 0.6 ? 1 : 0);
      const small = zonedBuildings(letter, density, top, 1);
      const ids = small.length > 0 ? small : zonedBuildings(letter, density, startLevel(letter, density), 1);
      if (ids.length > 0) build(ids[Math.floor(rng() * ids.length)], x, y);
    }
  }
}

interface UtilitySlot {
  id: BuildingId;
  x: number;
  y: number;
}

/**
 * Every road island with buildings short of power or water gets one more plant or tower:
 * in a free utility-district slot on that island if there is one, otherwise on the first
 * free land next to its roads (islands cut off by the river need their own).
 */
function serveIslands(city: City, slots: UtilitySlot[], rng: () => number): boolean {
  const w = city.world;
  const islands = roadIslands(w);
  /** Per road island: what's short, and where (the first building short of power, for a plant beside it). */
  const lacking = new Map<number, { power: boolean; water: boolean; x: number; y: number }>();
  for (const b of w.buildings.values()) {
    const d: BuildingDef = BUILDINGS[b.def];
    if (b.entrance === -1 || !needsUtilities(d) || b.construction > 0 || (b.powered && b.watered)) continue;
    const island = islands[b.entrance];
    const l = lacking.get(island) ?? { power: false, water: false, x: b.x, y: b.y };
    const at = !l.power && !b.powered ? { x: b.x, y: b.y } : { x: l.x, y: l.y };
    lacking.set(island, { power: l.power || !b.powered, water: l.water || !b.watered, ...at });
  }
  if (lacking.size === 0) return false;
  const supply = (id: BuildingId, island: number, near: { x: number; y: number }) => {
    const { w: bw, h: bh } = BUILDINGS[id].size;
    for (let k = 0; k < slots.length; k++) {
      const s = slots[k];
      if (s.id !== id) continue;
      const entrance = findEntrance(w, s.x, s.y, bw, bh, 3);
      if (entrance === -1 || islands[entrance] !== island) continue;
      const plan = planPlace(w, id, s.x, s.y);
      slots.splice(k, 1);
      if (plan.ok && applyPlace(city, plan, Math.floor(rng() * ART_VARIANTS)).ok) return;
      k--;
    }
    placeOnIsland(city, id, island, islands, near, rng);
  };
  for (const [island, need] of lacking) if (need.power) supply(PLANT, island, need);
  // Water reaches by distance (D-093): put a tower right beside a building that's still dry.
  const dry = [...w.buildings.values()].find((b) => {
    const d: BuildingDef = BUILDINGS[b.def];
    return b.entrance !== -1 && needsUtilities(d) && b.construction === 0 && !b.watered;
  });
  if (dry) placeNear(city, 'water_tower', dry.x, dry.y, rng);
  refreshCity(w);
  return true;
}

/**
 * Plants for the evening peak plus room for the city to keep growing, so a visitor's demo
 * doesn't brown out or wear its plants down (docs/specs/energy.md). Substations pool every
 * plant into one grid, so any free spot by a road will do.
 */
function powerHeadroom(city: City, slots: UtilitySlot[], rng: () => number) {
  const w = city.world;
  let peak = 0;
  let capacity = 0;
  for (const b of w.buildings.values()) {
    const d: BuildingDef = BUILDINGS[b.def];
    if (needsUtilities(d)) peak += d.capacity;
    if (d.energy && d.energy.source !== 'battery') capacity += d.supplies?.power ?? 0;
  }
  const want = peak * POWER_HEADROOM;
  const plant = BUILDINGS[PLANT].supplies.power;
  const islands = roadIslands(w);
  for (let guard = 0; capacity < want && guard < 40; guard++) {
    const k = slots.findIndex((s) => s.id === PLANT && applyPlace(city, planPlace(w, s.id, s.x, s.y), Math.floor(rng() * ART_VARIANTS)).ok);
    if (k !== -1) slots.splice(k, 1);
    else {
      const road = findCentreRoad(w);
      placeOnIsland(city, PLANT, islands[road], islands, { x: road % w.width, y: Math.floor(road / w.width) }, rng);
    }
    capacity += plant;
  }
}

/** A road tile at (or nearest) the map centre. */
function findCentreRoad(w: World): number {
  const cx = Math.floor(w.width / 2);
  const cy = Math.floor(w.height / 2);
  for (let r = 0; r < w.width; r++) {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) if (w.inBounds(x, y) && w.road[w.index(x, y)] !== RoadType.None) return w.index(x, y);
    }
  }
  return 0;
}

/** Place `id` on the free spot with road access nearest to (x, y), within 8 tiles. */
function placeNear(city: City, id: BuildingId, x: number, y: number, rng: () => number) {
  const w = city.world;
  for (let r = 1; r <= 8; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const tx = x + dx;
        const ty = y + dy;
        if (!w.inBounds(tx, ty) || findEntrance(w, tx, ty, 1, 1, 1) === -1) continue;
        const plan = planPlace(w, id, tx, ty);
        if (plan.ok && applyPlace(city, plan, Math.floor(rng() * ART_VARIANTS)).ok) return;
      }
    }
  }
}

/**
 * Place `id` on the free spot nearest `near` whose entrance road is on `island` (searching
 * outwards ring by ring, so a plant lands beside the buildings that need it, not at the map edge).
 */
function placeOnIsland(city: City, id: BuildingId, island: number, islands: Int32Array, near: { x: number; y: number }, rng: () => number) {
  const w = city.world;
  const { w: bw, h: bh } = BUILDINGS[id].size;
  for (let r = 0; r < Math.max(w.width, w.height); r++) {
    for (let y = near.y - r; y <= near.y + r; y++) {
      for (let x = near.x - r; x <= near.x + r; x++) {
        if (Math.max(Math.abs(x - near.x), Math.abs(y - near.y)) !== r || !w.inBounds(x, y)) continue;
        const entrance = findEntrance(w, x, y, bw, bh, 1);
        if (entrance === -1 || islands[entrance] !== island) continue;
        const plan = planPlace(w, id, x, y);
        if (plan.ok && applyPlace(city, plan, Math.floor(rng() * ART_VARIANTS)).ok) return;
      }
    }
  }
}

/** Distance from the centre in blocks: 0 for the four middle blocks, BLOCKS − 1 at the edge. */
function ringOf(bx: number, by: number): number {
  const c = BLOCKS - 0.5;
  return Math.max(Math.abs(bx - c), Math.abs(by - c)) - 0.5;
}

/**
 * The district plan (no dice: a planned city reads as one). Density follows the river: towers
 * and offices on the banks, apartments near the water and round the civic core, houses inland
 * among park blocks. Local centres sit on a lattice so every home has shops, police, a clinic
 * and a fire station within reach; industry is in the south-east corner behind offices.
 * `water` is the block's distance to the river in tiles.
 */
function blockUse(bx: number, by: number, water: number): BlockUse {
  const last = 2 * BLOCKS - 1;
  const ring = ringOf(bx, by);
  if (bx === BLOCKS - 1 && by === BLOCKS - 1) return { kind: 'hall' };
  if (bx === BLOCKS && by === BLOCKS) return { kind: 'campus' };
  // The civic square: the town hall's green runs on into a central park and a garden, ringed by towers.
  if (bx === BLOCKS && by === BLOCKS - 1) return { kind: 'green', id: 'central_park' };
  if (bx === BLOCKS - 1 && by === BLOCKS) return { kind: 'green', id: 'botanical_garden' };
  const landmark = LANDMARKS.find((l) => l.bx === bx && l.by === by);
  if (landmark) return { kind: 'landmark', id: landmark.id };
  const green = GREENS.find((g) => g.bx === bx && g.by === by);
  if (green) return { kind: 'green', id: green.id };
  // Industry and gas power in the far corner, behind a belt of offices and shops.
  if (bx >= last - 2 && by >= last - 2) {
    if (bx === last && by >= last - 1) return { kind: 'utilities' };
    if (bx === last - 2 && by === last - 2) return { kind: 'zone', zone: ZoneType.Commercial, civic: true };
    return { kind: 'zone', zone: ZoneType.Industrial, civic: (bx + 2 * by) % 5 === 0 };
  }
  if ((bx === last - 3 && by >= last - 2) || (by === last - 3 && bx >= last - 2)) return { kind: 'zone', zone: ZoneType.Commercial, civic: false };
  // A neighbourhood centre every three blocks: bus station, school, recycling, emergency services.
  if (bx % 3 === 1 && by % 3 === 1) return { kind: 'services' };
  const axis = bx === BLOCKS - 1 || bx === BLOCKS || by === BLOCKS - 1 || by === BLOCKS;
  // Local centres on a knight's-move lattice: every block is at most one block from one.
  const civic = (bx + 2 * by) % 5 === 0;
  const bank = water <= BANK;
  const near = water <= NEAR_RIVER;
  // Open green among the houses inland.
  if (!near && !civic && ring >= 2 && (bx + 3 * by) % 7 === 0) return { kind: 'green', id: HOUSE_PARKS[Math.floor((bx + 3 * by) / 7) % HOUSE_PARKS.length] };
  const zone = ((): ZonedType => {
    if (bank) return (bx + by) % 2 === 0 && ring <= 3 ? ZoneType.CommercialHigh : ZoneType.ResidentialHigh;
    if (ring === 0) return ZoneType.CommercialHigh;
    if (ring === 1) return axis ? ZoneType.CommercialHigh : ZoneType.ResidentialHigh;
    return near ? ZoneType.ResidentialHigh : ZoneType.Residential;
  })();
  return { kind: 'zone', zone, civic };
}

/** Distance in tiles (Chebyshev) from the 5×5 block at (ix, iy) to the nearest water, up to 3 blocks. */
function waterDistance(w: World, ix: number, iy: number): number {
  const far = 3 * PITCH;
  let best = far;
  for (let y = iy - far; y < iy + 5 + far; y++) {
    for (let x = ix - far; x < ix + 5 + far; x++) {
      if (!w.inBounds(x, y) || !isWaterTile(w, w.index(x, y))) continue;
      const dx = x < ix ? ix - x : x > ix + 4 ? x - ix - 4 : 0;
      const dy = y < iy ? iy - y : y > iy + 4 ? y - iy - 4 : 0;
      best = Math.min(best, Math.max(dx, dy));
    }
  }
  return best;
}

/**
 * The waterfront blocks for WATERFRONT_LANDMARKS: on the bank, with room to build, nearest the
 * centre, and not wanted for anything fixed (civic core, landmarks, services, rail, industry).
 */
function pickWaterfront(n: number, water: (bx: number, by: number) => number, land: (bx: number, by: number) => number): { bx: number; by: number }[] {
  const picks: { bx: number; by: number; d: number }[] = [];
  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      const fixed = blockUse(bx, by, Infinity);
      if (fixed.kind !== 'zone' || fixed.zone === ZoneType.Industrial || fixed.civic || by === RAIL_ROW) continue;
      if (water(bx, by) > BANK || land(bx, by) < 18) continue;
      picks.push({ bx, by, d: ringOf(bx, by) });
    }
  }
  picks.sort((a, b) => a.d - b.d || a.by - b.by || a.bx - b.bx);
  // Spread them out: no two landmarks in neighbouring blocks.
  const out: { bx: number; by: number }[] = [];
  for (const p of picks) {
    if (out.length === WATERFRONT_LANDMARKS.length) break;
    if (out.every((o) => Math.max(Math.abs(o.bx - p.bx), Math.abs(o.by - p.by)) > 1)) out.push(p);
  }
  return out;
}
