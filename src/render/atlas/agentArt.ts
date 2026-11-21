import type { AgentKind } from '../../sim/systems/traffic';
import { IsoFrame, shade } from './core';
import { GROUND_PAD, GROUND_FRAME_H } from './geometry';
import { HALF_H, HALF_W } from '../../shared/constants';

/** Room above the tile diamond for tall vehicles (double-decker buses, trucks, trains). */
export const VEHICLE_HEADROOM = 16;
export const VEHICLE_FRAME_H = GROUND_FRAME_H + VEHICLE_HEADROOM;
/** Anchor that puts the tile centre of a vehicle frame on the sprite position. */
export const VEHICLE_ANCHOR_Y = (VEHICLE_HEADROOM + GROUND_PAD + HALF_H) / VEHICLE_FRAME_H;

export const PERSON_W = 8;
export const PERSON_H = 14;

export const VEHICLE_KINDS: readonly Exclude<AgentKind, 'person'>[] = ['car', 'taxi', 'bus', 'truck'];
export const VEHICLE_VARIANTS = 10;
export const TRAIN_VARIANTS = 4;
export const PERSON_VARIANTS = 14;

const CAR_COLORS = ['#d93b3b', '#2f6fd6', '#f2f2ee', '#3a3f48', '#2f9e5a', '#f08c2e', '#6f4fc9', '#1e8c9e', '#c94b78', '#8d99a6'] as const;
const BUS_COLORS = ['#f2a922', '#2f7fd6', '#d42f2f', '#2f9e5a', '#1e7fb8', '#7a4fc9', '#e8682c', '#268a78', '#c83e3e', '#469e4a'] as const;
const TRUCK_COLORS = ['#d93b3b', '#2f6fd6', '#f2f2ee', '#3a3f48', '#2f9e5a', '#f08c2e', '#2b5f9e', '#b84434', '#d9a422', '#4c6678'] as const;
const CONTAINER_COLORS = ['#2665ad', '#c83e32', '#2d8a52', '#d97a26', '#5e4b9e'] as const;

const GLASS = '#253a4f';
const HEADLIGHT = '#fff3b0';
const TAILLIGHT = '#ff4a3d';

interface Dims {
  /** Length and width in tile units. */
  len: number;
  wid: number;
}

const DIMS: Readonly<Record<Exclude<AgentKind, 'person'>, Dims>> = {
  car: { len: 0.32, wid: 0.16 },
  taxi: { len: 0.32, wid: 0.16 },
  bus: { len: 0.56, wid: 0.19 },
  truck: { len: 0.48, wid: 0.18 },
  fire_truck: { len: 0.52, wid: 0.19 },
  ambulance: { len: 0.4, wid: 0.18 },
  police_car: { len: 0.34, wid: 0.16 },
};

const LIVERY = {
  fire_truck: { cab: '#d42f2f', body: '#e03b3b' },
  ambulance: { cab: '#f4f4f0', body: '#f7f7f3' },
} as const;

/**
 * A vehicle centred on the tile, facing `dir` (0 NE, 1 SE, 2 SW, 3 NW).
 * Variants change real 2D body silhouettes (hatchback, SUV, pickup, coupe, double-decker bus,
 * articulated BRT, tanker, flatbed, dump truck, container truck, London cab, eco-taxi) as well as colour.
 */
export function paintVehicle(ctx: CanvasRenderingContext2D, kind: Exclude<AgentKind, 'person'>, variant: number, dir: number) {
  const iso = new IsoFrame(ctx, GROUND_PAD + HALF_W, GROUND_PAD + VEHICLE_HEADROOM);
  const v = variant % VEHICLE_VARIANTS;
  const baseDims = DIMS[kind];
  // Adjust length slightly for compact hatchbacks, minibuses, etc.
  const len = kind === 'car' && (v === 1 || v === 7) ? 0.28 : kind === 'bus' && (v === 4 || v === 9) ? 0.44 : baseDims.len;
  const wid = baseDims.wid;
  const alongU = dir === 1 || dir === 3;
  const a0 = 0.5 - len / 2;
  const a1 = 0.5 + len / 2;
  const b0 = 0.5 - wid / 2;
  const b1 = 0.5 + wid / 2;
  const box = (s0: number, s1: number, z0: number, z1: number, lit: string, dark: string, top: string) =>
    alongU ? iso.box(s0, s1, b0, b1, z0, z1, lit, dark, top) : iso.box(b0, b1, s0, s1, z0, z1, lit, dark, top);
  const endFace = alongU ? 'se' : 'sw';
  const endAt = a1;
  const sideFace = alongU ? 'sw' : 'se';
  const sideAt = b1;
  const forward = dir === 1 || dir === 2;
  const side = (s0: number, s1: number, z0: number, z1: number, fill: string) => iso.wall(sideFace, sideAt, s0, s1, z0, z1, fill);
  const end = (c0: number, c1: number, z0: number, z1: number, fill: string) => iso.wall(endFace, endAt, c0, c1, z0, z1, fill);

  // Shadow.
  iso.floor(alongU ? a0 + 0.03 : b0 + 0.03, alongU ? a1 + 0.05 : b1 + 0.05, alongU ? b0 + 0.03 : a0 + 0.03, alongU ? b1 + 0.05 : a1 + 0.05, 0, 'rgba(0,0,0,0.28)');

  if (kind === 'bus') {
    const c = BUS_COLORS[v % BUS_COLORS.length];
    if (v === 2 || v === 8) {
      // Double-decker city bus (taller with two window levels!).
      box(a0, a1, 1, 13.5, c, shade(c, -0.25), shade(c, 0.2));
      side(a0 + 0.03, a1 - 0.03, 4.2, 6.8, GLASS);
      side(a0 + 0.03, a1 - 0.03, 9.2, 12, GLASS);
      for (let s = a0 + 0.1; s < a1 - 0.05; s += 0.09) {
        side(s, s + 0.01, 4.2, 6.8, c);
        side(s, s + 0.01, 9.2, 12, c);
      }
      side(a0, a1, 7.3, 8.2, '#f4f4f0');
      end(b0 + 0.02, b1 - 0.02, 4.2, 6.8, GLASS);
      end(b0 + 0.02, b1 - 0.02, 9.2, 12, GLASS);
    } else if (v === 3 || v === 7) {
      // Modern eco / BRT express bus with white upper body, bold transit stripe & roof AC pods.
      box(a0, a1, 1, 10, '#f2f4f6', '#cfd6de', '#ffffff');
      side(a0, a1, 1.4, 4.4, c);
      side(a0 + 0.03, a1 - 0.03, 5, 8.6, GLASS);
      for (let s = a0 + 0.12; s < a1 - 0.05; s += 0.11) side(s, s + 0.01, 5, 8.6, '#f2f4f6');
      box(a0 + 0.12, a1 - 0.12, 10, 11.4, '#cfd6de', '#9aa3ad', '#e6ebf0');
      end(b0 + 0.02, b1 - 0.02, 5, 8.6, GLASS);
    } else {
      // Standard city bus / compact shuttle (v === 4, 9 are shorter shuttles).
      box(a0, a1, 1, 9.8, c, shade(c, -0.25), shade(c, 0.2));
      side(a0 + 0.03, a1 - 0.03, 5, 8.3, GLASS);
      for (let s = a0 + 0.1; s < a1 - 0.05; s += 0.09) side(s, s + 0.01, 5, 8.3, c);
      side(a0, a1, 2.5, 3.3, '#f4f4f0');
      end(b0 + 0.02, b1 - 0.02, 5, 8.3, GLASS);
    }
    end(b0 + 0.02, b0 + 0.05, 2, 3.5, forward ? HEADLIGHT : TAILLIGHT);
    end(b1 - 0.05, b1 - 0.02, 2, 3.5, forward ? HEADLIGHT : TAILLIGHT);
  } else if (kind === 'truck' || kind === 'fire_truck' || kind === 'ambulance') {
    const livery = kind === 'truck' ? null : LIVERY[kind];
    const c = livery ? livery.cab : TRUCK_COLORS[v % TRUCK_COLORS.length];
    const cabFront = forward;
    const split = cabFront ? a1 - 0.14 : a0 + 0.14;
    const [boxS0, boxS1] = cabFront ? [a0, split] : [split, a1];
    const [cabS0, cabS1] = cabFront ? [split + 0.01, a1] : [a0, split - 0.01];
    box(cabS0, cabS1, 1, 6.5, c, shade(c, -0.25), shade(c, 0.2));
    side(cabS0 + 0.02, cabS1 - 0.02, 3.8, 6, GLASS);

    if (livery) {
      box(boxS0, boxS1, 1, 10, livery.body, shade(livery.body, -0.18), shade(livery.body, 0.1));
      side(boxS0 + 0.02, boxS1 - 0.02, 4, 5, kind === 'ambulance' ? '#d23b3b' : '#f4f4f0');
      const mid = (cabS0 + cabS1) / 2;
      box(mid - 0.03, mid + 0.03, 6.5, 7.6, '#3b82f6', '#2a5fb8', '#ff4a3d');
    } else if (v === 2 || v === 7) {
      // Tanker truck (sleek rounded metallic tank on chassis).
      box(boxS0, boxS1, 1, 2.6, '#484e56', '#32373e', '#626a74');
      box(boxS0 + 0.02, boxS1 - 0.02, 2.6, 8.8, '#dce2e8', '#a6b0ba', '#f4f7fa');
      side(boxS0 + 0.04, boxS1 - 0.04, 4.8, 6.2, '#e85d38');
    } else if (v === 3 || v === 8) {
      // Flatbed cargo truck loaded with timber / crates.
      box(boxS0, boxS1, 1, 3, '#5c626b', '#41464d', '#7a818c');
      box(boxS0 + 0.03, boxS1 - 0.03, 3, 6.5, '#b8824c', '#8c5f34', '#d49d64');
    } else if (v === 4 || v === 9) {
      // Dump truck with yellow/orange hopper bed and gravel load.
      box(boxS0, boxS1, 1, 7.5, '#e8a825', '#b57e16', '#7d7870');
    } else if (v === 1 || v === 6) {
      // Corrugated intermodal shipping container hauler.
      const cc = CONTAINER_COLORS[v % CONTAINER_COLORS.length];
      box(boxS0, boxS1, 1, 10.2, cc, shade(cc, -0.25), shade(cc, 0.15));
      for (let s = boxS0 + 0.05; s < boxS1 - 0.03; s += 0.06) side(s, s + 0.01, 1.5, 9.6, shade(cc, -0.15));
    } else {
      // Classic box delivery truck.
      box(boxS0, boxS1, 1, 10, '#eceae4', shade('#eceae4', -0.18), shade('#eceae4', 0.1));
    }

    if (cabFront) end(b0 + 0.02, b1 - 0.02, 3.8, 6, GLASS);
    end(b0 + 0.02, b0 + 0.05, 1.8, 3, forward ? HEADLIGHT : TAILLIGHT);
    end(b1 - 0.05, b1 - 0.02, 1.8, 3, forward ? HEADLIGHT : TAILLIGHT);
  } else {
    // Cars, taxis, police cars.
    const isLondonCab = kind === 'taxi' && (v === 2 || v === 7);
    const isEcoTaxi = kind === 'taxi' && (v === 3 || v === 8);
    const c =
      kind === 'police_car'
        ? '#1f3a68'
        : kind === 'taxi'
          ? isLondonCab
            ? '#232830'
            : isEcoTaxi
              ? '#f2f5f4'
              : '#f5c518'
          : CAR_COLORS[v % CAR_COLORS.length];

    const isSuv = (kind === 'car' && (v === 2 || v === 6)) || (kind === 'taxi' && (v === 4 || v === 9));
    const isPickup = kind === 'car' && (v === 4 || v === 9);
    const isCoupe = kind === 'car' && (v === 5 || v === 8);
    const bodyTop = isCoupe ? 4.0 : isSuv ? 5.0 : 4.5;
    const roofTop = isCoupe ? 6.8 : isSuv || isLondonCab ? 8.4 : 7.5;

    box(a0, a1, 1, bodyTop, c, shade(c, -0.25), shade(c, 0.15));
    const back = forward ? a0 : a1;
    const front = forward ? a1 : a0;
    const cStart = isPickup ? 0.36 : isSuv ? 0.08 : 0.18;
    const cEnd = isPickup ? 0.72 : isSuv ? 0.72 : 0.68;
    const cab0 = Math.min(back + (front - back) * cStart, back + (front - back) * cEnd);
    const cab1 = Math.max(back + (front - back) * cStart, back + (front - back) * cEnd);
    const roofCol = kind === 'car' && v === 7 ? '#262b33' : shade(c, 0.05);
    box(cab0, cab1, bodyTop, roofTop, roofCol, shade(roofCol, -0.22), shade(roofCol, 0.2));
    side(cab0 + 0.015, cab1 - 0.015, bodyTop + 0.4, roofTop - 0.5, GLASS);
    end(b0 + 0.02, b1 - 0.02, bodyTop + 0.4, roofTop - 0.5, GLASS);
    end(b0 + 0.015, b0 + 0.045, 2.2, 3.4, forward ? HEADLIGHT : TAILLIGHT);
    end(b1 - 0.045, b1 - 0.015, 2.2, 3.4, forward ? HEADLIGHT : TAILLIGHT);

    if (kind === 'taxi') {
      const mid = (cab0 + cab1) / 2;
      box(mid - 0.03, mid + 0.03, roofTop, roofTop + 1.4, '#ffffff', '#d8d8d8', '#ffffff');
      if (isEcoTaxi) side(a0 + 0.02, a1 - 0.02, 2.2, 3.3, '#22a68a');
      else if (!isLondonCab && v % 2 === 1) side(a0 + 0.02, a1 - 0.02, 2.3, 3.2, '#22252a');
    } else if (kind === 'police_car') {
      side(a0 + 0.02, a1 - 0.02, 2.2, 3.4, '#f4f4f0');
      const mid = (cab0 + cab1) / 2;
      box(mid - 0.04, mid + 0.04, roofTop, roofTop + 1.1, '#3b82f6', '#2a5fb8', '#ff4a3d');
    }
  }

  // Wheels on the visible side.
  const wheelAt = [a0 + len * 0.18, a1 - len * 0.18];
  for (const s of wheelAt) side(s - 0.03, s + 0.03, 0, 1.8, '#1d1f23');
}

const SKIN = ['#f1c9a5', '#d9a47a', '#a8714a', '#7a4a2e'] as const;
const SHIRTS = [
  '#e04848',
  '#3d7dd8',
  '#f2c43a',
  '#4bb36b',
  '#f3f1ea',
  '#9b59b6',
  '#ef8a3a',
  '#2a2f3a',
  '#22a699',
  '#d9578a',
  '#c47e42',
  '#5c7394',
  '#d8e036',
  '#7e4b3c',
] as const;
const HATS = ['#2c3440', '#b84238', '#d9a838', '#3c6e4e'] as const;

/** A tiny pedestrian, 8×14 px, with backpacks, hats, coats and umbrellas across 14 variants. */
export function paintPerson(ctx: CanvasRenderingContext2D, variant: number, frame: number) {
  const cx = PERSON_W / 2;
  const base = PERSON_H - 1;
  const skin = SKIN[variant % SKIN.length];
  const shirt = SHIRTS[variant % SHIRTS.length];
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, base, 2.6, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Legs.
  ctx.fillStyle = variant % 3 === 0 ? '#3f4b5e' : '#2b3140';
  if (frame === 0) {
    ctx.fillRect(cx - 1.5, base - 4, 1.2, 4);
    ctx.fillRect(cx + 0.3, base - 4, 1.2, 4);
  } else {
    ctx.fillRect(cx - 2, base - 4, 1.2, 3.6);
    ctx.fillRect(cx + 0.8, base - 3.6, 1.2, 3.6);
  }
  // Commuter backpack on variants 3, 7, 11.
  if (variant % 4 === 3) {
    ctx.fillStyle = '#4c3e32';
    ctx.fillRect(cx - 2.6, base - 8, 1.2, 3.8);
  }
  // Body and arms (long coat on variants 4, 10).
  const bodyH = variant % 6 === 4 ? 6.2 : 4.8;
  ctx.fillStyle = shirt;
  ctx.fillRect(cx - 1.8, base - 8.5, 3.6, bodyH);
  ctx.fillStyle = shade(shirt, -0.2);
  ctx.fillRect(cx + 0.2, base - 8.5, 1.6, bodyH);
  // Head.
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(cx, base - 10.2, 1.7, 0, Math.PI * 2);
  ctx.fill();
  // Hat/cap on every 3rd variant, else hair.
  if (variant % 3 === 1) {
    ctx.fillStyle = HATS[variant % HATS.length];
    ctx.fillRect(cx - 2.1, base - 12.2, 4.2, 1.3);
  } else {
    ctx.fillStyle = '#3a2a1e';
    ctx.fillRect(cx - 1.7, base - 12, 3.4, 1.1);
  }
}

/** Parts of a train (docs/specs/evolution.md, E7b): one per tile along the track. */
export const RAIL_CAR_PARTS = ['engine', 'carriage'] as const;
export type RailCarPart = (typeof RAIL_CAR_PARTS)[number];

const TRAIN_LIVERIES = [
  // 0: Classic red locomotive + silver/blue commuter carriages
  { eng: '#c8382f', engStripe: '#f2d24a', car: '#d9dee4', carStripe: '#1f6fb2', roof: '#3a3f46' },
  // 1: Sleek white-and-blue high-speed bullet train
  { eng: '#f0f4f8', engStripe: '#1e6ec8', car: '#eef3f7', carStripe: '#1e6ec8', roof: '#c4d0dc' },
  // 2: Emerald green & cream regional express train
  { eng: '#26784e', engStripe: '#f2c94c', car: '#e8e4d4', carStripe: '#26784e', roof: '#3e4a44' },
  // 3: Bright yellow & charcoal urban metro / light-rail train
  { eng: '#e8b024', engStripe: '#2c323a', car: '#f0c438', carStripe: '#2c323a', roof: '#464d56' },
] as const;

/**
 * One rail vehicle centred on the tile, facing `dir` (0 NE, 1 SE, 2 SW, 3 NW), in 4 liveries.
 */
export function paintRailCar(ctx: CanvasRenderingContext2D, part: RailCarPart, dir: number, variant = 0) {
  const iso = new IsoFrame(ctx, GROUND_PAD + HALF_W, GROUND_PAD + VEHICLE_HEADROOM);
  const liv = TRAIN_LIVERIES[variant % TRAIN_LIVERIES.length];
  const len = 0.86;
  const wid = 0.17;
  const alongU = dir === 1 || dir === 3;
  const a0 = 0.5 - len / 2;
  const a1 = 0.5 + len / 2;
  const b0 = 0.5 - wid / 2;
  const b1 = 0.5 + wid / 2;
  const box = (s0: number, s1: number, z0: number, z1: number, lit: string, dark: string, top: string) =>
    alongU ? iso.box(s0, s1, b0, b1, z0, z1, lit, dark, top) : iso.box(b0, b1, s0, s1, z0, z1, lit, dark, top);
  const sideFace = alongU ? 'sw' : 'se';
  const endFace = alongU ? 'se' : 'sw';
  const side = (s0: number, s1: number, z0: number, z1: number, fill: string) => iso.wall(sideFace, b1, s0, s1, z0, z1, fill);
  const end = (c0: number, c1: number, z0: number, z1: number, fill: string) => iso.wall(endFace, a1, c0, c1, z0, z1, fill);
  const forward = dir === 1 || dir === 2;

  iso.floor(alongU ? a0 + 0.03 : b0 + 0.03, alongU ? a1 + 0.05 : b1 + 0.05, alongU ? b0 + 0.03 : a0 + 0.03, alongU ? b1 + 0.05 : a1 + 0.05, 0, 'rgba(0,0,0,0.3)');
  if (part === 'engine') {
    box(a0, a1, 1.5, 10, liv.eng, shade(liv.eng, -0.25), shade(liv.eng, 0.16));
    box(a0 + 0.1, a1 - 0.1, 10, 11.4, liv.roof, shade(liv.roof, -0.2), shade(liv.roof, 0.15));
    side(a0 + 0.04, a1 - 0.04, 3, 4.1, liv.engStripe);
    // Bullet train (variant 1) gets a sleek panoramic cab glass band.
    if (variant % TRAIN_LIVERIES.length === 1) {
      side(a0 + 0.06, a1 - 0.06, 5.8, 8.6, GLASS);
    } else {
      side(forward ? a1 - 0.2 : a0 + 0.04, forward ? a1 - 0.04 : a0 + 0.2, 6, 8.5, GLASS);
    }
    end(b0 + 0.03, b1 - 0.03, 6, 8.5, GLASS);
    end(b0 + 0.03, b0 + 0.07, 2.5, 4, forward ? HEADLIGHT : TAILLIGHT);
    end(b1 - 0.07, b1 - 0.03, 2.5, 4, forward ? HEADLIGHT : TAILLIGHT);
  } else {
    box(a0, a1, 1.5, 10, liv.car, shade(liv.car, -0.2), shade(liv.car, 0.08));
    side(a0 + 0.04, a1 - 0.04, 5.5, 8.5, GLASS);
    for (let s = a0 + 0.14; s < a1 - 0.06; s += 0.14) side(s, s + 0.015, 5.5, 8.5, liv.car);
    side(a0 + 0.04, a1 - 0.04, 3, 3.9, liv.carStripe);
    end(b0 + 0.04, b1 - 0.04, 2, 9.5, shade(liv.car, -0.12));
  }
}
