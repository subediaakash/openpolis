import { Texture, type TextureSource } from 'pixi.js';
import { BuildingAtlas } from './BuildingAtlas';
import { BridgeAxis, type BuildableRoad } from '../../sim/roads';
import { Decor, DECOR_KINDS, GROUND_VARIANTS, Terrain, type DecorId, type TerrainId } from '../../sim/terrain/types';
import { OVERLAY_TERRAINS } from '../transitions';
import { AtlasBuilder, type FramePainter } from './AtlasBuilder';
import { DECOR_VARIANTS, paintDecor } from './nature/decor';
import { BRIDGE_FRAME_H, diamondPath, GROUND_FRAME_H, GROUND_FRAME_W, TREE_FRAME_H } from './geometry';
import { paintGround, WATER_PHASES } from './nature/ground';
import { DECK_LIFT, paintBridge, paintDeck, paintRoad } from './roadArt';
import { OVERPASS_LIFT, paintOverpass, paintTrack, paintTrackCurve, RAIL_CURVES, RAIL_LOOKS, type RailCurve, type RailLook } from './rail';

/** The four corner masks (two arms at right angles), the only pieces drawn as curves. */
const CORNER_MASKS: readonly number[] = [0b0011, 0b0110, 0b1100, 0b1001];
import { inTileSpace } from './roads/kit';
import { roadVariants } from './roads';
import { BUILDABLE_ROADS } from '../../sim/roadTypes';
import { AVENUE_STYLES } from './roads/avenueFurniture';
import { PEDESTRIAN_STYLES } from './roads/pedestrianFurniture';
import { WIDE_STYLES } from './roads/wideFurniture';
import type { BuildingRotation } from './buildings';
import {
  paintPerson,
  paintVehicle,
  PERSON_H,
  PERSON_VARIANTS,
  PERSON_W,
  VEHICLE_FRAME_H,
  VEHICLE_KINDS,
  VEHICLE_VARIANTS,
  paintRailCar,
  RAIL_CAR_PARTS,
  TRAIN_VARIANTS,
  type RailCarPart,
} from './agentArt';
import type { AgentKind } from '../../sim/systems/traffic';
import type { BuildingId } from '../../sim/buildings/catalog';
import { CHIP_SIZE, LEAF_SIZE, paintChip, paintLeaf, paintPuff, PUFF_SIZE } from './fxArt';
import type { FxTextures } from '../fx/Effects';
import { BEACON_SIZE, BIRD_H, BIRD_W, CLOUD_H, CLOUD_W, DROP_SIZE, GLOW_H, GLOW_W, paintBeacon, paintBird, paintCloudShadow, paintDroplet, paintWindowGlow } from './ambient';
import {
  foamOverlay,
  GRASS_SHAPE,
  LAND_SHAPE,
  maskedOverlay,
  SHALLOW_SHAPE,
  WOBBLE_VARIANTS,
  type MaskShape,
} from './transitionArt';
import { paintTreeCluster, TREE_VARIANTS } from './nature/trees';
import { paintBusStop, STOP_FRAME_H, STOP_FRAME_W, STOP_STYLES } from './stopArt';
import {
  FURNITURE_FRAME_H,
  FURNITURE_FRAME_W,
  GANTRY_STYLES,
  HIGHWAY_LAMP_STYLES,
  OVERBRIDGE_STYLES,
  paintFurniture,
  ROAD_AXES,
  STREET_STYLES,
  type FurniturePiece,
  type RoadAxis,
} from './streetArt';
import { paintSite, SITE_SIZES, SITE_STAGES, siteFrameSize, type SiteSize } from './constructionArt';
import { BUBBLE_H, BUBBLE_KINDS, BUBBLE_W, paintBubble } from './bubbleArt';
import type { ComplaintKind } from '../../sim/systems/needs';
import { GAME_GRADE } from './theme/buildingPalettes';
import { graded } from './theme/grade';

const ALL_TERRAINS: readonly TerrainId[] = [
  Terrain.DeepWater,
  Terrain.ShallowWater,
  Terrain.Sand,
  Terrain.Grass,
  Terrain.DryGrass,
  Terrain.Dirt,
  Terrain.Rock,
];

/** Overlay frames for a terrain, indexed [wobbleVariant][cornerMask]. Masks 0 and 15 are Texture.EMPTY (never drawn). */
export type MaskTextures = Texture[][];

export interface TerrainTextures {
  /** Static ground, indexed [variant]. Water entries are phase 0. */
  ground: Readonly<Record<TerrainId, Texture[]>>;
  /** Animated water, indexed [variant][phase]. */
  water: { deep: Texture[][]; shallow: Texture[][] };
  overlays: ReadonlyMap<TerrainId, MaskTextures>;
  foam: MaskTextures;
  /** Tree clusters, indexed [density 1..3][variant]. Index 0 is empty. */
  trees: Texture[][];
  /** Decorations, indexed [DecorId][variant]. Index 0 (None) is empty. */
  decor: Texture[][];
  /** Road pieces by road type, then `variant * 16 + mask` (use roadTexture). */
  roads: Readonly<Record<BuildableRoad, Texture[]>>;
  /** Rail track by look (track, crossing over a road, bridge) and connection mask (render/atlas/rail.ts). */
  rail: Readonly<Record<RailLook, Texture[]>>;
  /** Curved corner pieces of track on the ground, by curve and mask (only the four corner masks are painted). */
  railCurves: Readonly<Record<RailCurve, Texture[]>>;
  /** Flyover decks by road type, axis 1 (x) then 2 (y) (render/atlas/roadArt.ts paintDeck). */
  decks: Readonly<Record<BuildableRoad, readonly Texture[]>>;
  /** Overpass decks carrying track over roads, by connection mask (taller frames: OVERPASS_LIFT). */
  railOverpass: Texture[];
  /** Bridge spans (taller frames: see BRIDGE_HEADROOM) by road type, then `variant * 3 + BridgeAxis` (use bridgeTexture). */
  bridges: Readonly<Record<BuildableRoad, Texture[]>>;
  /** Street furniture (streetArt.ts). Mask-indexed arrays hold Texture.EMPTY where a mask has none. */
  furniture: StreetFurniture;
  /** Plain white diamond for tool previews (tinted at runtime). */
  selection: Texture;
  /** Zoned-lot diamond with an outline (tinted by zone at runtime). */
  zoneLot: Texture;
  /** Construction sites, indexed by footprint size then stage (0 foundation, 1 scaffold). */
  sites: Readonly<Record<SiteSize, readonly Texture[]>>;
  /**
   * Buildings for the current view rotation, on pages of their own (repainted when the view
   * turns: D-104). Look frames up with buildingTexture; sizes vary: see buildingFrameSize().
   */
  buildings: BuildingAtlas;
  fx: FxTextures;
  /** Animated details (render/ambient): window glows per wall face, beacons, spray, birds, cloud shadows. */
  ambient: AmbientTextures;
  /** Vehicles, indexed by kind, then variant, then direction (0 NE, 1 SE, 2 SW, 3 NW). */
  vehicles: Readonly<Record<Exclude<AgentKind, 'person'>, Texture[][]>>;
  /** Trains: locomotive and carriage, indexed [part][variant][dir] (render/atlas/agentArt.ts paintRailCar). */
  trains: Readonly<Record<RailCarPart, Texture[][]>>;
  /** Pedestrians, indexed by variant then walk frame (0/1). */
  people: Texture[][];
  /** Bus stop shelters, indexed [style][view side (0 −y, 1 +x, 2 +y, 3 −x)]. */
  busStops: Texture[][];
  /** Warning badges: no road access, no power, no water. */
  warnRoad: Texture;
  warnPower: Texture;
  /** Taxes waiting at the Town Hall: a gold coin. */
  taxCoin: Texture;
  warnWater: Texture;
  /** Traffic-light pole (lamp tinted red/green). */
  lamp: Texture;
  /** Complaint speech bubbles, by complaint kind. */
  bubbles: Readonly<Record<ComplaintKind, Texture>>;
  hover: Texture;
  gridLine: Texture;
  /** The terrain atlas pages (so their mesh shaders can be released). Buildings have their own. */
  sources: readonly TextureSource[];
  /** The terrain atlas itself: uploads the pages and repaints them after a lost context. */
  atlas: AtlasBuilder;
}

/** A building instance's frame: its variant wraps round the building's variant count. */
export function buildingTexture(tex: TerrainTextures, id: BuildingId, variant: number): Texture {
  return tex.buildings.texture(id, variant);
}

export interface StreetFurniture {
  /** Straight streets, indexed by axis then style. */
  street: Readonly<Record<RoadAxis, readonly Texture[]>>;
  /** A lamp on the outside of a bend, indexed by mask. */
  cornerLamp: readonly Texture[];
  highwayLamp: Readonly<Record<RoadAxis, readonly Texture[]>>;
  gantry: Readonly<Record<RoadAxis, readonly Texture[]>>;
  overbridge: Readonly<Record<RoadAxis, readonly Texture[]>>;
  /** Straight avenues, indexed by axis then style (roads/avenueFurniture.ts). */
  avenue: Readonly<Record<RoadAxis, readonly Texture[]>>;
  /** One-way carriageways, indexed by travel direction then style (roads/wideFurniture.ts). */
  boulevard: readonly (readonly Texture[])[];
  expressway: readonly (readonly Texture[])[];
  /** Pedestrian streets, indexed by axis then style. */
  pedestrian: Readonly<Record<RoadAxis, readonly Texture[]>>;
}

const armCount = (m: number) => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1);
const isBend = (m: number) => armCount(m) === 2 && m !== 0b0101 && m !== 0b1010;

/** Every furniture frame, by atlas name. */
function furniturePieces(): [string, FurniturePiece][] {
  const out: [string, FurniturePiece][] = [];
  for (const axis of ROAD_AXES) {
    for (let style = 0; style < STREET_STYLES; style++) out.push([`furn_street_${axis}_${style}`, { kind: 'street', axis, style }]);
    for (let style = 0; style < HIGHWAY_LAMP_STYLES; style++) out.push([`furn_hwlamp_${axis}_${style}`, { kind: 'highwayLamp', axis, style }]);
    for (let style = 0; style < GANTRY_STYLES; style++) out.push([`furn_gantry_${axis}_${style}`, { kind: 'gantry', axis, style }]);
    for (let style = 0; style < OVERBRIDGE_STYLES; style++) out.push([`furn_overbridge_${axis}_${style}`, { kind: 'overbridge', axis, style }]);
    for (let style = 0; style < AVENUE_STYLES; style++) out.push([`furn_avenue_${axis}_${style}`, { kind: 'avenue', axis, style }]);
    for (let style = 0; style < PEDESTRIAN_STYLES; style++) out.push([`furn_ped_${axis}_${style}`, { kind: 'pedestrian', axis, style }]);
  }
  for (let m = 0; m < 16; m++) {
    if (isBend(m)) out.push([`furn_corner_${m}`, { kind: 'cornerLamp', mask: m }]);
  }
  for (let dir = 0; dir < 4; dir++) {
    for (let style = 0; style < WIDE_STYLES; style++) {
      out.push([`furn_blvd_${dir}_${style}`, { kind: 'boulevard', dir, style }]);
      out.push([`furn_xway_${dir}_${style}`, { kind: 'expressway', dir, style }]);
    }
  }
  return out;
}

/** Every road type gets its pieces in the atlas (sim/roadTypes.ts). */
const ROAD_TYPES: readonly BuildableRoad[] = BUILDABLE_ROADS;

function shapeFor(t: TerrainId): MaskShape {
  if (t === Terrain.ShallowWater) return SHALLOW_SHAPE;
  if (t === Terrain.Grass) return GRASS_SHAPE;
  return LAND_SHAPE;
}

function paintToCanvas(w: number, h: number, r: number, paint: FramePainter): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * r);
  c.height = Math.ceil(h * r);
  const ctx = c.getContext('2d')!;
  ctx.setTransform(r, 0, 0, r, 0, 0);
  paint(ctx, w, h);
  return c;
}

/**
 * A painter that puts pixel data (already at atlas resolution) 1:1 at the frame's corner.
 * The pixels are made when the page paints, not kept: the atlas keeps its painters for
 * repainting after a lost context (D-104), and a canvas per frame would stay alive with them.
 */
function blitImage(make: () => ImageData): FramePainter {
  return (ctx) => {
    const t = ctx.getTransform();
    ctx.putImageData(make(), Math.round(t.e), Math.round(t.f));
  };
}

function paintHover(ctx: CanvasRenderingContext2D) {
  diamondPath(ctx, -1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function paintSelection(ctx: CanvasRenderingContext2D) {
  diamondPath(ctx, -0.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/** Map-pin style badge with a little road glyph: "this building has no road". */
/** Map-pin badge body in the given colours; the caller draws the glyph inside (centre 9, 8). */
function paintPin(ctx: CanvasRenderingContext2D, rim: string, fill: string) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(9, 18.5, 3.5, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(9, 8, 8, 0, Math.PI * 2);
  ctx.moveTo(5, 13);
  ctx.lineTo(9, 18);
  ctx.lineTo(13, 13);
  ctx.fill();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(9, 8, 6.8, 0, Math.PI * 2);
  ctx.fill();
}

/** Traffic light: a dark pole and head with a white lamp (tinted red or green at runtime). */
function paintLamp(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(3.5, 15, 2.2, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a3d44';
  ctx.fillRect(3, 5, 1, 10);
  ctx.fillRect(1.5, 0.5, 4, 5.5);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(3.5, 3.2, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

/** "No power": a lightning bolt. */
function paintWarnPower(ctx: CanvasRenderingContext2D) {
  paintPin(ctx, '#5a4512', '#f5c518');
  ctx.fillStyle = '#3b2b05';
  ctx.beginPath();
  ctx.moveTo(10, 2.8);
  ctx.lineTo(5.6, 9);
  ctx.lineTo(8.6, 9);
  ctx.lineTo(7.8, 13.2);
  ctx.lineTo(12.4, 7);
  ctx.lineTo(9.4, 7);
  ctx.closePath();
  ctx.fill();
}

/** "Taxes waiting": a gold coin with a dollar sign. */
function paintTaxCoin(ctx: CanvasRenderingContext2D) {
  paintPin(ctx, '#6b4a06', '#f5c518');
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(9, 8, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a00';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', 9, 8.4);
}

/** "No water": a drop. */
function paintWarnWater(ctx: CanvasRenderingContext2D) {
  paintPin(ctx, '#123a5a', '#3a9bf0');
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(9, 3);
  ctx.bezierCurveTo(9, 3, 5.4, 7.6, 5.4, 9.6);
  ctx.arc(9, 9.6, 3.6, Math.PI, 0, true);
  ctx.bezierCurveTo(12.6, 7.6, 9, 3, 9, 3);
  ctx.fill();
}

function paintWarnRoad(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(9, 18.5, 3.5, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a1d14';
  ctx.beginPath();
  ctx.arc(9, 8, 8, 0, Math.PI * 2);
  ctx.moveTo(5, 13);
  ctx.lineTo(9, 18);
  ctx.lineTo(13, 13);
  ctx.fill();
  ctx.fillStyle = '#ff6a3d';
  ctx.beginPath();
  ctx.arc(9, 8, 6.8, 0, Math.PI * 2);
  ctx.fill();
  // Road glyph: two edges and a dashed centre line.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(5.5, 4, 1.2, 8);
  ctx.fillRect(11.3, 4, 1.2, 8);
  ctx.fillRect(8.5, 4, 1, 2);
  ctx.fillRect(8.5, 7, 1, 2);
  ctx.fillRect(8.5, 10, 1, 2);
}

function paintZoneLot(ctx: CanvasRenderingContext2D) {
  diamondPath(ctx, -1.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 1.25;
  ctx.stroke();
}

function paintGridLine(ctx: CanvasRenderingContext2D) {
  diamondPath(ctx, -0.25);
  ctx.strokeStyle = 'rgba(10, 40, 10, 0.22)';
  ctx.lineWidth = 0.75;
  ctx.stroke();
}

/** Over-draw for overlay sources (logical px); cellCoords() trims it back to ~1px past the edge. */
const OVERLAY_SOURCE_GROW = 3;

const range = <T>(n: number, f: (i: number) => T): T[] => Array.from({ length: n }, (_, i) => f(i));

/** Paint every terrain frame procedurally and pack them into one atlas; buildings for view rotation `rotation`. */
/** Built things paint through the theme's grade (D-107); ground, trees, water and UI marks don't. */
const built = (paint: (ctx: CanvasRenderingContext2D) => void) => graded(GAME_GRADE, paint);

export function buildTerrainTextures(rotation: BuildingRotation = 0): TerrainTextures {
  const b = new AtlasBuilder(2);
  const r = b.resolution;
  const W = GROUND_FRAME_W;
  const H = GROUND_FRAME_H;

  for (const t of ALL_TERRAINS) {
    for (let v = 0; v < GROUND_VARIANTS; v++) b.add(`ground_${t}_${v}`, W, H, (ctx) => paintGround(ctx, t, v));
  }
  for (const t of [Terrain.DeepWater, Terrain.ShallowWater]) {
    for (let v = 0; v < GROUND_VARIANTS; v++) {
      for (let p = 0; p < WATER_PHASES; p++) b.add(`water_${t}_${v}_${p}`, W, H, (ctx) => paintGround(ctx, t, v, p));
    }
  }

  // Dual-grid overlays: the terrain painted once per wobble variant, then masked per corner case.
  for (const t of OVERLAY_TERRAINS) {
    const shape = shapeFor(t);
    for (let w = 0; w < WOBBLE_VARIANTS; w++) {
      // Painted oversized so the masked copy is fully opaque right up to the cell edge.
      const src = paintToCanvas(W, H, r, (ctx) => paintGround(ctx, t, w % GROUND_VARIANTS, 0, OVERLAY_SOURCE_GROW));
      const img = src.getContext('2d')!.getImageData(0, 0, src.width, src.height);
      // Free the scratch canvas now rather than at the next GC (iOS counts canvas memory).
      src.width = 0;
      src.height = 0;
      for (let m = 1; m < 15; m++) b.add(`ov_${t}_${w}_${m}`, W, H, blitImage(() => maskedOverlay(img, r, m, w, shape)));
    }
  }
  const fw = Math.ceil(W * r);
  const fh = Math.ceil(H * r);
  for (let w = 0; w < WOBBLE_VARIANTS; w++) {
    for (let m = 1; m < 15; m++) b.add(`foam_${w}_${m}`, W, H, blitImage(() => foamOverlay(fw, fh, r, m, w)));
  }

  for (const d of [1, 2, 3] as const) {
    for (let v = 0; v < TREE_VARIANTS; v++) b.add(`tree_${d}_${v}`, W, TREE_FRAME_H, (ctx) => paintTreeCluster(ctx, d, v));
  }
  const decorKinds = range(DECOR_KINDS, (k) => (k + 1) as Exclude<DecorId, typeof Decor.None>);
  for (const k of decorKinds) {
    for (let v = 0; v < DECOR_VARIANTS; v++) b.add(`decor_${k}_${v}`, W, TREE_FRAME_H, (ctx) => paintDecor(ctx, k, v));
  }
  for (const t of ROAD_TYPES) {
    for (let v = 0; v < roadVariants(t); v++) {
      for (let m = 0; m < 16; m++) b.add(`road_${t}_${v}_${m}`, W, H, built((ctx) => paintRoad(ctx, t, m, v)));
      for (const axis of [BridgeAxis.X, BridgeAxis.Y]) b.add(`bridge_${t}_${v}_${axis}`, W, BRIDGE_FRAME_H, built((ctx) => paintBridge(ctx, t, axis, v)));
    }
  }
  for (const look of RAIL_LOOKS) for (let m = 0; m < 16; m++) b.add(`rail_${look}_${m}`, W, H, built((ctx) => inTileSpace(ctx, () => paintTrack(ctx, m, look))));
  for (let m = 0; m < 16; m++) b.add(`rail_overpass_${m}`, W, H + OVERPASS_LIFT, built((ctx) => paintOverpass(ctx, m)));
  for (const t of ROAD_TYPES) for (const axis of [1, 2] as const) b.add(`deck_${t}_${axis}`, W, H + DECK_LIFT, built((ctx) => paintDeck(ctx, t, axis)));
  for (const curve of RAIL_CURVES) for (const m of CORNER_MASKS) b.add(`rail_${curve}_${m}`, W, H, built((ctx) => inTileSpace(ctx, () => paintTrackCurve(ctx, m, curve))));
  for (const [name, piece] of furniturePieces()) b.add(name, FURNITURE_FRAME_W, FURNITURE_FRAME_H, built((ctx) => paintFurniture(ctx, piece)));
  b.add('selection', W, H, paintSelection);
  b.add('zone_lot', W, H, paintZoneLot);
  for (const size of SITE_SIZES) {
    const f = siteFrameSize(size);
    for (const stage of SITE_STAGES) b.add(`site_${size}_${stage}`, f.w, f.h, built((ctx) => paintSite(ctx, size, stage)));
  }
  for (const k of VEHICLE_KINDS) {
    for (let v = 0; v < VEHICLE_VARIANTS; v++) {
      for (let d = 0; d < 4; d++) b.add(`veh_${k}_${v}_${d}`, W, VEHICLE_FRAME_H, built((ctx) => paintVehicle(ctx, k, v, d)));
    }
  }
  for (const part of RAIL_CAR_PARTS) {
    for (let v = 0; v < TRAIN_VARIANTS; v++) {
      for (let d = 0; d < 4; d++) b.add(`train_${part}_${v}_${d}`, W, VEHICLE_FRAME_H, built((ctx) => paintRailCar(ctx, part, d, v)));
    }
  }
  for (let v = 0; v < PERSON_VARIANTS; v++) {
    for (let f = 0; f < 2; f++) b.add(`person_${v}_${f}`, PERSON_W, PERSON_H, (ctx) => paintPerson(ctx, v, f));
  }
  for (let style = 0; style < STOP_STYLES; style++) {
    for (const side of [0, 1, 2, 3] as const) b.add(`stop_${style}_${side}`, STOP_FRAME_W, STOP_FRAME_H, built((ctx) => paintBusStop(ctx, side, style)));
  }
  b.add('warn_road', 18, 20, paintWarnRoad);
  b.add('warn_power', 18, 20, paintWarnPower);
  b.add('warn_water', 18, 20, paintWarnWater);
  b.add('tax_coin', 18, 20, paintTaxCoin);
  b.add('lamp', 7, 16, built(paintLamp));
  for (const k of BUBBLE_KINDS) b.add(`bubble_${k}`, BUBBLE_W, BUBBLE_H, (ctx) => paintBubble(ctx, k));
  b.add('fx_puff', PUFF_SIZE, PUFF_SIZE, paintPuff);
  b.add('fx_chip', CHIP_SIZE, CHIP_SIZE, paintChip);
  b.add('fx_leaf', LEAF_SIZE, LEAF_SIZE, paintLeaf);
  b.add('amb_glow_sw', GLOW_W, GLOW_H, (ctx) => paintWindowGlow(ctx, 'sw'));
  b.add('amb_glow_se', GLOW_W, GLOW_H, (ctx) => paintWindowGlow(ctx, 'se'));
  b.add('amb_beacon', BEACON_SIZE, BEACON_SIZE, paintBeacon);
  b.add('amb_drop', DROP_SIZE, DROP_SIZE, paintDroplet);
  b.add('amb_bird_0', BIRD_W, BIRD_H, (ctx) => paintBird(ctx, 0));
  b.add('amb_bird_1', BIRD_W, BIRD_H, (ctx) => paintBird(ctx, 1));
  b.add('amb_cloud', CLOUD_W, CLOUD_H, paintCloudShadow);
  b.add('hover', W, H, paintHover);
  b.add('grid', W, H, paintGridLine);

  const tex = b.build();
  const get = (name: string): Texture => {
    const t = tex.get(name);
    if (!t) throw new Error(`atlas frame missing: ${name}`);
    return t;
  };
  const masks = (prefix: string): MaskTextures =>
    range(WOBBLE_VARIANTS, (w) => range(16, (m) => (m === 0 || m === 15 ? Texture.EMPTY : get(`${prefix}_${w}_${m}`))));

  const ground = Object.fromEntries(
    ALL_TERRAINS.map((t) => [t, range(GROUND_VARIANTS, (v) => get(`ground_${t}_${v}`))]),
  ) as Record<TerrainId, Texture[]>;
  const water = (t: TerrainId) => range(GROUND_VARIANTS, (v) => range(WATER_PHASES, (p) => get(`water_${t}_${v}_${p}`)));

  return {
    ground,
    water: { deep: water(Terrain.DeepWater), shallow: water(Terrain.ShallowWater) },
    overlays: new Map(OVERLAY_TERRAINS.map((t) => [t, masks(`ov_${t}`)])),
    foam: masks('foam'),
    trees: [[], ...([1, 2, 3] as const).map((d) => range(TREE_VARIANTS, (v) => get(`tree_${d}_${v}`)))],
    decor: [[], ...decorKinds.map((k) => range(DECOR_VARIANTS, (v) => get(`decor_${k}_${v}`)))],
    roads: Object.fromEntries(ROAD_TYPES.map((t) => [t, range(roadVariants(t) * 16, (k) => get(`road_${t}_${Math.floor(k / 16)}_${k % 16}`))])) as Record<
      BuildableRoad,
      Texture[]
    >,
    bridges: Object.fromEntries(
      ROAD_TYPES.map((t) => [
        t,
        range(roadVariants(t) * 3, (k) => (k % 3 === 0 ? Texture.EMPTY : get(`bridge_${t}_${Math.floor(k / 3)}_${k % 3}`))),
      ]),
    ) as Record<BuildableRoad, Texture[]>,
    furniture: {
      street: { u: range(STREET_STYLES, (k) => get(`furn_street_u_${k}`)), v: range(STREET_STYLES, (k) => get(`furn_street_v_${k}`)) },
      cornerLamp: range(16, (m) => (isBend(m) ? get(`furn_corner_${m}`) : Texture.EMPTY)),
      highwayLamp: { u: range(HIGHWAY_LAMP_STYLES, (k) => get(`furn_hwlamp_u_${k}`)), v: range(HIGHWAY_LAMP_STYLES, (k) => get(`furn_hwlamp_v_${k}`)) },
      gantry: { u: range(GANTRY_STYLES, (k) => get(`furn_gantry_u_${k}`)), v: range(GANTRY_STYLES, (k) => get(`furn_gantry_v_${k}`)) },
      overbridge: { u: range(OVERBRIDGE_STYLES, (k) => get(`furn_overbridge_u_${k}`)), v: range(OVERBRIDGE_STYLES, (k) => get(`furn_overbridge_v_${k}`)) },
      avenue: { u: range(AVENUE_STYLES, (k) => get(`furn_avenue_u_${k}`)), v: range(AVENUE_STYLES, (k) => get(`furn_avenue_v_${k}`)) },
      boulevard: range(4, (d) => range(WIDE_STYLES, (k) => get(`furn_blvd_${d}_${k}`))),
      expressway: range(4, (d) => range(WIDE_STYLES, (k) => get(`furn_xway_${d}_${k}`))),
      pedestrian: { u: range(PEDESTRIAN_STYLES, (k) => get(`furn_ped_u_${k}`)), v: range(PEDESTRIAN_STYLES, (k) => get(`furn_ped_v_${k}`)) },
    },
    selection: get('selection'),
    zoneLot: get('zone_lot'),
    sites: { 1: SITE_STAGES.map((st) => get(`site_1_${st}`)), 2: SITE_STAGES.map((st) => get(`site_2_${st}`)) },
    buildings: new BuildingAtlas(rotation, r),
    vehicles: Object.fromEntries(
      VEHICLE_KINDS.map((k) => [k, range(VEHICLE_VARIANTS, (v) => range(4, (d) => get(`veh_${k}_${v}_${d}`)))]),
    ) as Record<Exclude<AgentKind, 'person'>, Texture[][]>,
    people: range(PERSON_VARIANTS, (v) => range(2, (f) => get(`person_${v}_${f}`))),
    trains: {
      engine: range(TRAIN_VARIANTS, (v) => range(4, (d) => get(`train_engine_${v}_${d}`))),
      carriage: range(TRAIN_VARIANTS, (v) => range(4, (d) => get(`train_carriage_${v}_${d}`))),
    },
    busStops: range(STOP_STYLES, (style) => range(4, (side) => get(`stop_${style}_${side}`))),
    warnRoad: get('warn_road'),
    rail: {
      track: range(16, (m) => get(`rail_track_${m}`)),
      bridge: range(16, (m) => get(`rail_bridge_${m}`)),
      shade: range(16, (m) => get(`rail_shade_${m}`)),
    },
    railOverpass: range(16, (m) => get(`rail_overpass_${m}`)),
    decks: Object.fromEntries(ROAD_TYPES.map((t) => [t, [get(`deck_${t}_1`), get(`deck_${t}_2`)]])) as Record<BuildableRoad, Texture[]>,
    railCurves: {
      arc: range(16, (m) => (CORNER_MASKS.includes(m) ? get(`rail_arc_${m}`) : Texture.EMPTY)),
      chord: range(16, (m) => (CORNER_MASKS.includes(m) ? get(`rail_chord_${m}`) : Texture.EMPTY)),
    },
    warnPower: get('warn_power'),
    taxCoin: get('tax_coin'),
    warnWater: get('warn_water'),
    lamp: get('lamp'),
    bubbles: Object.fromEntries(BUBBLE_KINDS.map((k) => [k, get(`bubble_${k}`)])) as Record<ComplaintKind, Texture>,
    fx: { puff: get('fx_puff'), chip: get('fx_chip'), leaf: get('fx_leaf') },
    ambient: {
      glow: { sw: get('amb_glow_sw'), se: get('amb_glow_se') },
      beacon: get('amb_beacon'),
      drop: get('amb_drop'),
      bird: [get('amb_bird_0'), get('amb_bird_1')],
      cloud: get('amb_cloud'),
    },
    hover: get('hover'),
    gridLine: get('grid'),
    sources: b.sources,
    atlas: b,
  };
}

/** A road piece's texture: its look (direction or pavement, roads/index.ts roadVariant) and connections. */
export function roadTexture(tex: TerrainTextures, type: BuildableRoad, mask: number, variant: number): Texture {
  return tex.roads[type][variant * 16 + mask] ?? tex.roads[type][mask];
}

export function bridgeTexture(tex: TerrainTextures, type: BuildableRoad, axis: number, variant: number): Texture {
  return tex.bridges[type][variant * 3 + axis] ?? tex.bridges[type][axis];
}

export interface AmbientTextures {
  /** Window glow sheared to match a wall face. */
  glow: Readonly<Record<'sw' | 'se', Texture>>;
  beacon: Texture;
  drop: Texture;
  /** Bird wings up, wings down. */
  bird: readonly [Texture, Texture];
  cloud: Texture;
}
