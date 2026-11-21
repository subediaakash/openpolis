import { HALF_W } from '../../shared/constants';
import { GROUND_FRAME_H, GROUND_FRAME_W, GROUND_PAD } from './geometry';
import { IsoFrame, shade, type Box } from './core';
import { paintRoundTree } from './nature/trees';
import { paintAvenueFurniture } from './roads/avenueFurniture';
import { paintPedestrianFurniture } from './roads/pedestrianFurniture';
import { paintBoulevardFurniture, paintExpresswayFurniture } from './roads/wideFurniture';

/**
 * Street furniture (docs/specs/city-art.md): one sprite per road tile, drawn in the objects
 * layer so it sorts with buildings and trees. All positions are in view tile space; a road
 * "along u" has mask 0b1010, "along v" has mask 0b0101. The near side of a road is its +lateral
 * side (larger u or v), the side facing the camera. Junction traffic lights are live
 * (AgentRenderer draws them from the traffic sim's phases), so they aren't furniture.
 */

export const FURNITURE_HEADROOM = 44;
export const FURNITURE_FRAME_W = GROUND_FRAME_W;
export const FURNITURE_FRAME_H = GROUND_FRAME_H + FURNITURE_HEADROOM;

export type RoadAxis = 'u' | 'v';
export const ROAD_AXES: readonly RoadAxis[] = ['u', 'v'];
/** Straight-street layouts: trees, lamps, benches, kiosks, bike racks, heritage lamps. */
export const STREET_STYLES = 7;
/** Highway lighting & roadside treatments: cobra lamp, twin median mast, acoustic barrier. */
export const HIGHWAY_LAMP_STYLES = 3;
/** Highway overhead gantries: green signs, digital VMS, express toll arch, split cantilever. */
export const GANTRY_STYLES = 4;
/** Highway foot overbridges: glazed skybridge, tied-arch, cable-stayed, eco green-roof. */
export const OVERBRIDGE_STYLES = 4;

export type FurniturePiece =
  | { kind: 'street'; axis: RoadAxis; style: number }
  | { kind: 'cornerLamp'; mask: number }
  | { kind: 'highwayLamp'; axis: RoadAxis; style: number }
  | { kind: 'gantry'; axis: RoadAxis; style: number }
  | { kind: 'overbridge'; axis: RoadAxis; style: number }
  | { kind: 'avenue'; axis: RoadAxis; style: number }
  | { kind: 'boulevard'; dir: number; style: number }
  | { kind: 'expressway'; dir: number; style: number }
  | { kind: 'pedestrian'; axis: RoadAxis; style: number };

export const POLE = '#545b64';
export const LAMP = '#fff1b8';

/** (along, lateral) on a road → view (u, v). Lateral is measured from the centre line. */
export function onRoad(axis: RoadAxis, s: number, o: number): [number, number] {
  return axis === 'u' ? [s, 0.5 + o] : [0.5 + o, s];
}

function roadBox(axis: RoadAxis, s0: number, s1: number, o0: number, o1: number): Box {
  const [u0, v0] = onRoad(axis, s0, o0);
  const [u1, v1] = onRoad(axis, s1, o1);
  return { u0: Math.min(u0, u1), u1: Math.max(u0, u1), v0: Math.min(v0, v1), v1: Math.max(v0, v1) };
}

export function pole(iso: IsoFrame, u: number, v: number, z0: number, z1: number, w = 1) {
  const [x, y] = iso.p(u, v, z0);
  iso.ctx.fillStyle = POLE;
  iso.ctx.fillRect(x - w / 2, y - (z1 - z0), w, z1 - z0);
  iso.ctx.fillStyle = 'rgba(255,255,255,0.25)';
  iso.ctx.fillRect(x - w / 2, y - (z1 - z0), w / 2, z1 - z0);
}

/** Street lamp at lateral `o`, its arm reaching toward the road centre. */
function lamp(iso: IsoFrame, axis: RoadAxis, s: number, o: number, h = 15) {
  const [u, v] = onRoad(axis, s, o);
  const [hu, hv] = onRoad(axis, s, o - Math.sign(o) * 0.1);
  iso.disc(u, v, 0.025, 0, 'rgba(0,0,0,0.25)');
  pole(iso, u, v, 0, h, 1.2);
  const a = iso.p(u, v, h);
  const b = iso.p(hu, hv, h + 1);
  const c = iso.ctx;
  c.strokeStyle = POLE;
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(a[0], a[1]);
  c.lineTo(b[0], b[1]);
  c.stroke();
  c.fillStyle = 'rgba(255, 236, 160, 0.3)';
  c.beginPath();
  c.ellipse(b[0], b[1] + 1.5, 3, 1.6, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = LAMP;
  c.fillRect(b[0] - 1.4, b[1] - 0.2, 2.8, 1.4);
}

/** Heritage double-globe street lamp. */
function heritageLamp(iso: IsoFrame, axis: RoadAxis, s: number, o: number) {
  const [u, v] = onRoad(axis, s, o);
  iso.disc(u, v, 0.028, 0, 'rgba(0,0,0,0.25)');
  pole(iso, u, v, 0, 14, 1.3);
  const [ax, ay] = iso.p(u, v, 14);
  const c = iso.ctx;
  c.strokeStyle = '#3c434c';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(ax - 3, ay);
  c.lineTo(ax + 3, ay);
  c.stroke();
  for (const dx of [-3, 3]) {
    c.fillStyle = 'rgba(255, 238, 175, 0.35)';
    c.beginPath();
    c.arc(ax + dx, ay - 1, 2.6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#fff5cc';
    c.beginPath();
    c.arc(ax + dx, ay - 1, 1.4, 0, Math.PI * 2);
    c.fill();
  }
}

function streetTree(iso: IsoFrame, u: number, v: number, tone: number) {
  iso.floor(u - 0.04, u + 0.04, v - 0.04, v + 0.04, 0.2, '#6b6256');
  iso.floor(u - 0.03, u + 0.03, v - 0.03, v + 0.03, 0.3, '#5a4c3c');
  const [x, y] = iso.p(u, v, 0);
  paintRoundTree(iso.ctx, x, y, 0.58, tone);
}

/** Sidewalk bench + flower planter box. */
function sidewalkBench(iso: IsoFrame, axis: RoadAxis, s: number, o: number) {
  const b = roadBox(axis, s - 0.09, s + 0.09, o - 0.025, o + 0.025);
  iso.box(b.u0, b.u1, b.v0, b.v1, 1.5, 2.6, '#a8784a', '#7f5a36', '#c89262');
  for (const ds of [-0.06, 0.06]) {
    const [u, v] = onRoad(axis, s + ds, o);
    pole(iso, u, v, 0, 1.5, 0.8);
  }
}

function flowerBox(iso: IsoFrame, axis: RoadAxis, s: number, o: number, bloom: string) {
  const b = roadBox(axis, s - 0.07, s + 0.07, o - 0.035, o + 0.035);
  iso.box(b.u0, b.u1, b.v0, b.v1, 0, 2.4, '#c7bfb2', '#9c9589', '#4f8c42');
  const [u, v] = onRoad(axis, s, o);
  const [x, y] = iso.p(u, v, 2.8);
  iso.ctx.fillStyle = bloom;
  for (const [dx, dy] of [
    [-2, -0.5],
    [0.5, -1.2],
    [2, 0.2],
  ] as const) {
    iso.ctx.beginPath();
    iso.ctx.arc(x + dx, y + dy, 1.1, 0, Math.PI * 2);
    iso.ctx.fill();
  }
}

/** Compact corner newsstand / street kiosk with striped awning. */
function streetKiosk(iso: IsoFrame, axis: RoadAxis, s: number, o: number) {
  const b = roadBox(axis, s - 0.11, s + 0.11, o - 0.045, o + 0.045);
  iso.solid(b, 0, 8.5, '#3b6b58', '#d8d4c8');
  iso.box(b.u0 - 0.015, b.u1 + 0.015, b.v0 - 0.015, b.v1 + 0.015, 8.5, 10, '#c84b3a', '#963428', '#e05d4a');
}

/** Commuter bicycle rack + fire hydrant on the sidewalk. */
function bikeRack(iso: IsoFrame, axis: RoadAxis, s: number, o: number) {
  const b = roadBox(axis, s - 0.12, s + 0.12, o - 0.03, o + 0.03);
  iso.floor(b.u0, b.u1, b.v0, b.v1, 0.15, '#7c828a');
  const colors = ['#d94a3d', '#2f7fd6', '#e8a82e'];
  for (let k = 0; k < 3; k++) {
    const [u, v] = onRoad(axis, s - 0.07 + k * 0.07, o);
    const [x, y] = iso.p(u, v, 0);
    const c = iso.ctx;
    c.strokeStyle = '#2c3036';
    c.lineWidth = 0.8;
    c.beginPath();
    c.arc(x - 1.5, y - 1.2, 1.1, 0, Math.PI * 2);
    c.arc(x + 1.5, y - 1.2, 1.1, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = colors[k];
    c.beginPath();
    c.moveTo(x - 1.5, y - 1.4);
    c.lineTo(x, y - 3.2);
    c.lineTo(x + 1.5, y - 1.4);
    c.stroke();
  }
}

function hydrant(iso: IsoFrame, axis: RoadAxis, s: number, o: number) {
  const [u, v] = onRoad(axis, s, o);
  iso.box(u - 0.014, u + 0.014, v - 0.014, v + 0.014, 0, 3.2, '#d4362e', '#9c241e', '#ef4c43');
}

const CORNER = 0.42;

/** Paint one piece into a FURNITURE frame (tile diamond's top vertex FURNITURE_HEADROOM below the top). */
export function paintFurniture(ctx: CanvasRenderingContext2D, piece: FurniturePiece) {
  const iso = new IsoFrame(ctx, GROUND_PAD + HALF_W, GROUND_PAD + FURNITURE_HEADROOM);
  switch (piece.kind) {
    case 'street': {
      const { axis, style } = piece;
      if (style === 0) {
        lamp(iso, axis, 0.5, -0.42);
        streetTree(iso, ...onRoad(axis, 0.5, 0.41), 0);
      } else if (style === 1) {
        streetTree(iso, ...onRoad(axis, 0.3, 0.41), 1);
        lamp(iso, axis, 0.75, 0.43);
      } else if (style === 2) {
        streetTree(iso, ...onRoad(axis, 0.22, 0.41), 2);
        streetTree(iso, ...onRoad(axis, 0.74, 0.41), 3);
      } else if (style === 3) {
        flowerBox(iso, axis, 0.26, -0.41, '#e85d75');
        sidewalkBench(iso, axis, 0.48, 0.42);
        flowerBox(iso, axis, 0.76, 0.42, '#f2c14e');
      } else if (style === 4) {
        lamp(iso, axis, 0.25, -0.42);
        streetKiosk(iso, axis, 0.62, 0.42);
      } else if (style === 5) {
        bikeRack(iso, axis, 0.34, 0.42);
        hydrant(iso, axis, 0.62, 0.43);
        streetTree(iso, ...onRoad(axis, 0.8, 0.41), 1);
      } else {
        heritageLamp(iso, axis, 0.35, 0.42);
        flowerBox(iso, axis, 0.68, 0.42, '#8b68d8');
      }
      return;
    }
    case 'cornerLamp': {
      // The corner opposite the two arms is the outside of the bend.
      const m = piece.mask;
      const u = m & 0b0010 ? 0.5 - CORNER : 0.5 + CORNER;
      const v = m & 0b0100 ? 0.5 - CORNER : 0.5 + CORNER;
      if (u < 0.5 && v < 0.5) return;
      iso.disc(u, v, 0.025, 0, 'rgba(0,0,0,0.25)');
      pole(iso, u, v, 0, 15, 1.2);
      const [hx, hy] = iso.p(u + (0.5 - u) * 0.25, v + (0.5 - v) * 0.25, 16);
      const [px, py] = iso.p(u, v, 15);
      const c = iso.ctx;
      c.strokeStyle = POLE;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(hx, hy);
      c.stroke();
      c.fillStyle = LAMP;
      c.fillRect(hx - 1.4, hy - 0.2, 2.8, 1.4);
      return;
    }
    case 'highwayLamp': {
      paintHighwayLamp(iso, piece.axis, piece.style);
      return;
    }
    case 'gantry':
      paintGantry(iso, piece.axis, piece.style);
      return;
    case 'overbridge':
      paintOverbridge(iso, piece.axis, piece.style);
      return;
    case 'avenue':
      paintAvenueFurniture(iso, piece.axis, piece.style);
      return;
    case 'boulevard':
      paintBoulevardFurniture(iso, piece.dir, piece.style);
      return;
    case 'expressway':
      paintExpresswayFurniture(iso, piece.dir, piece.style);
      return;
    case 'pedestrian':
      paintPedestrianFurniture(iso, piece.axis, piece.style);
      return;
  }
}

/** Highway roadside lighting & acoustic walls (3 distinct styles). */
function paintHighwayLamp(iso: IsoFrame, axis: RoadAxis, style: number) {
  if (style === 0) {
    lamp(iso, axis, 0.5, 0.48, 19);
    return;
  }
  if (style === 1) {
    // Tall twin-arm median mast lamp illuminating both highway carriageways.
    const [u, v] = onRoad(axis, 0.5, 0);
    iso.disc(u, v, 0.025, 0, 'rgba(0,0,0,0.25)');
    pole(iso, u, v, 0, 23, 1.5);
    const top = iso.p(u, v, 23);
    const c = iso.ctx;
    for (const side of [-1, 1]) {
      const [hu, hv] = onRoad(axis, 0.5, side * 0.16);
      const head = iso.p(hu, hv, 24);
      c.strokeStyle = POLE;
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(top[0], top[1]);
      c.lineTo(head[0], head[1]);
      c.stroke();
      c.fillStyle = 'rgba(255, 236, 160, 0.3)';
      c.beginPath();
      c.ellipse(head[0], head[1] + 1.5, 3.2, 1.7, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = LAMP;
      c.fillRect(head[0] - 1.5, head[1] - 0.2, 3, 1.4);
    }
    return;
  }
  // Style 2: Acoustic glass-and-concrete sound barrier wall along the near shoulder + LED pole.
  const wall = roadBox(axis, 0.04, 0.96, 0.45, 0.49);
  iso.solid(wall, 0, 3.5, '#b8b4aa', '#d2cec4');
  iso.box(wall.u0, wall.u1, wall.v0, wall.v1, 3.5, 11.5, 'rgba(130, 178, 210, 0.58)', 'rgba(95, 140, 175, 0.58)', '#cad4dc');
  for (const s of [0.1, 0.5, 0.9]) {
    const [pu, pv] = onRoad(axis, s, 0.47);
    pole(iso, pu, pv, 0, 12, 1.1);
  }
  lamp(iso, axis, 0.5, 0.47, 19);
}

/** Overhead highway gantries (4 distinct designs). */
function paintGantry(iso: IsoFrame, axis: RoadAxis, style: number) {
  const s = 0.5;
  const Z = 20;
  const far = onRoad(axis, s, -0.49);
  const near = onRoad(axis, s, 0.49);
  const face = axis === 'u' ? 'se' : 'sw';
  const a = iso.p(far[0], far[1], Z);
  const b = iso.p(near[0], near[1], Z);
  const c = iso.ctx;

  if (style === 1) {
    // Digital VMS (Variable Message Sign) dark LED matrix gantry with amber & green lane arrows.
    pole(iso, far[0], far[1], 0, Z + 3, 1.7);
    c.strokeStyle = '#5f6770';
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(b[0], b[1]);
    c.stroke();
    iso.wall(face, s, 0.08, 0.92, Z - 5.5, Z + 4, '#242930');
    iso.wall(face, s, 0.1, 0.9, Z - 4.7, Z + 3.2, '#14171c');
    iso.text(face, s, 0.5, Z - 0.5, '80  CLEAR', 3.4, '#ffbe3d');
    // Green lane status dots underneath.
    for (const lo of [0.22, 0.4, 0.6, 0.78]) {
      iso.wall(face, s, lo - 0.025, lo + 0.025, Z - 4.2, Z - 2.6, '#4ade80');
    }
    pole(iso, near[0], near[1], 0, Z + 3, 1.7);
    return;
  }

  if (style === 2) {
    // Electronic Express Toll / E-Pass arch gantry with blue canopy & overhead sensor pods.
    const farPier = roadBox(axis, 0.44, 0.56, -0.5, -0.42);
    iso.solid(farPier, 0, Z + 3, '#cfd5dc', '#e4e8ee');
    const beam = roadBox(axis, 0.44, 0.56, -0.48, 0.48);
    iso.solid(beam, Z - 2, Z + 3.5, '#1f5ea8', '#2c76cc');
    iso.wall(face, 0.56, 0.14, 0.86, Z - 1, Z + 2.5, '#1b4f8f');
    iso.text(face, 0.56, 0.5, Z + 0.4, 'EXPRESS', 3.4, '#ffffff');
    // Overhead toll sensor pods.
    for (const lo of [-0.3, -0.12, 0.12, 0.3]) {
      const [pu, pv] = onRoad(axis, 0.5, lo);
      iso.box(pu - 0.02, pu + 0.02, pv - 0.02, pv + 0.02, Z - 4, Z - 2, '#f2c43a', '#c99b1e', '#ffe078');
    }
    const nearPier = roadBox(axis, 0.44, 0.56, 0.42, 0.5);
    iso.solid(nearPier, 0, Z + 3, '#cfd5dc', '#e4e8ee');
    return;
  }

  // Style 0 (CITY / EXIT) and Style 3 (NORTH / METRO with blue-accent truss).
  pole(iso, far[0], far[1], 0, Z + 2, 1.6);
  c.strokeStyle = style === 3 ? '#5a6a7c' : '#7d848c';
  c.lineWidth = 1.3;
  for (const dz of [0, 3]) {
    c.beginPath();
    c.moveTo(a[0], a[1] - dz);
    c.lineTo(b[0], b[1] - dz);
    c.stroke();
  }
  const labels =
    style === 3
      ? ([
          [-0.44, -0.06, 'NORTH'],
          [0.06, 0.44, 'METRO'],
        ] as const)
      : ([
          [-0.44, -0.06, 'CITY'],
          [0.06, 0.44, 'EXIT'],
        ] as const);
  const bg = style === 3 ? (face === 'se' ? '#1c5c96' : '#2673b8') : face === 'se' ? '#1f7a45' : '#2a9457';
  for (const [o0, o1, label] of labels) {
    const lo = 0.5 + o0;
    const hi = 0.5 + o1;
    iso.wall(face, s, lo, hi, Z - 6, Z + 4, '#ffffff');
    iso.wall(face, s, lo + 0.01, hi - 0.01, Z - 5.4, Z + 3.4, bg);
    iso.text(face, s, (lo + hi) / 2, Z - 0.5, label, 3.6, '#ffffff');
  }
  pole(iso, near[0], near[1], 0, Z + 2, 1.6);
}

/**
 * Foot overbridges across a highway (4 architectural designs):
 * 0: glazed skybridge, 1: steel tied-arch, 2: cable-stayed A-pylon, 3: eco green-roof timber bridge.
 */
function paintOverbridge(iso: IsoFrame, axis: RoadAxis, style: number) {
  const Z = 18;
  const T = 3;
  const deckHalf = 0.08;
  const box = (s0: number, s1: number, o0: number, o1: number): Box => roadBox(axis, s0, s1, o0, o1);

  const towerColor = style === 3 ? '#c9b496' : style === 1 ? '#e2e6eb' : '#dcd6c8';
  const capColor =
    style === 1
      ? ['#d43f3a', '#a32c28', '#ea5852']
      : style === 2
        ? ['#3a4452', '#262d38', '#525f70']
        : style === 3
          ? ['#4e8f48', '#396b34', '#69ad62']
          : ['#2f7fd6', '#24609f', '#4a95e4'];

  const tower = (o0: number, o1: number) => {
    const t = box(0.5 - 0.13, 0.5 + 0.13, o0, o1);
    iso.solid(t, 0, Z + 7, towerColor);
    iso.wall('sw', t.v1, t.u0 + 0.03, t.u1 - 0.03, 4, Z + 4, 'rgba(70, 110, 140, 0.75)');
    iso.wall('se', t.u1, t.v0 + 0.03, t.v1 - 0.03, 4, Z + 4, 'rgba(50, 85, 110, 0.75)');
    for (let z = 6; z < Z + 4; z += 4) {
      iso.wall('sw', t.v1, t.u0 + 0.03, t.u1 - 0.03, z, z + 0.6, 'rgba(255,255,255,0.4)');
      iso.wall('se', t.u1, t.v0 + 0.03, t.v1 - 0.03, z, z + 0.6, 'rgba(255,255,255,0.25)');
    }
    iso.box(t.u0 - 0.02, t.u1 + 0.02, t.v0 - 0.02, t.v1 + 0.02, Z + 7, Z + 9, capColor[0], capColor[1], capColor[2]);
  };

  tower(-0.5, -0.36);

  // Median support: cable-stayed pylon (style 2) or standard slim pier (others).
  if (style === 2) {
    const pylon = box(0.5 - 0.04, 0.5 + 0.04, -0.04, 0.04);
    iso.solid(pylon, 0, Z + 21, '#e8ecf0', '#ffffff');
    // Diagonal stay cables radiating from pylon top to deck edges.
    const topP = iso.p(...onRoad(axis, 0.5, 0), Z + 19.5);
    const c = iso.ctx;
    c.strokeStyle = 'rgba(235, 240, 246, 0.9)';
    c.lineWidth = 0.85;
    for (const o of [-0.34, -0.22, -0.12, 0.12, 0.22, 0.34]) {
      const dp = iso.p(...onRoad(axis, 0.5, o), Z + 1);
      c.beginPath();
      c.moveTo(topP[0], topP[1]);
      c.lineTo(dp[0], dp[1]);
      c.stroke();
    }
  } else {
    const pier = box(0.5 - 0.03, 0.5 + 0.03, -0.03, 0.03);
    iso.solid(pier, 0, Z - T, '#b9b6ad');
  }

  const deck = box(0.5 - deckHalf, 0.5 + deckHalf, -0.38, 0.38);
  iso.solid(deck, Z - T, Z, style === 3 ? '#a67b50' : '#c9c4b8');
  iso.floor(deck.u0, deck.u1, deck.v0, deck.v1, Z, '#9a9488');

  const lit = axis === 'u' ? 'se' : 'sw';
  const at = lit === 'se' ? deck.u1 : deck.v1;
  const [a0, a1] = lit === 'se' ? [deck.v0, deck.v1] : [deck.u0, deck.u1];

  if (style === 1) {
    // Tied-arch steel rib spanning across the highway + vertical hangers.
    iso.wall(lit, at, a0, a1, Z, Z + 3.2, 'rgba(150, 200, 230, 0.65)');
    const c = iso.ctx;
    c.strokeStyle = '#f2f5f8';
    c.lineWidth = 2;
    c.beginPath();
    for (let k = 0; k <= 12; k++) {
      const t = k / 12;
      const o = -0.38 + 0.76 * t;
      const [px, py] = iso.p(...onRoad(axis, 0.5, o), Z + Math.sin(t * Math.PI) * 14);
      if (k === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.stroke();
    c.strokeStyle = 'rgba(220, 228, 236, 0.85)';
    c.lineWidth = 0.7;
    for (let k = 2; k <= 10; k += 2) {
      const t = k / 12;
      const o = -0.38 + 0.76 * t;
      const [ax, ay] = iso.p(...onRoad(axis, 0.5, o), Z);
      const [bx, by] = iso.p(...onRoad(axis, 0.5, o), Z + Math.sin(t * Math.PI) * 14);
      c.beginPath();
      c.moveTo(ax, ay);
      c.lineTo(bx, by);
      c.stroke();
    }
  } else if (style === 2) {
    // Open sleek railing deck for the cable-stayed bridge.
    iso.wall(lit, at, a0, a1, Z, Z + 3.4, 'rgba(170, 212, 238, 0.58)');
    iso.wall(lit, at, a0, a1, Z + 3.1, Z + 3.7, '#eef2f6');
  } else if (style === 3) {
    // Timber slatted sides + living green eco-roof canopy.
    iso.wall(lit, at, a0, a1, Z, Z + 5, 'rgba(165, 210, 195, 0.52)');
    for (let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 8) iso.wall(lit, at, a - 0.008, a + 0.008, Z, Z + 5, '#8f6339');
    iso.box(deck.u0 - 0.015, deck.u1 + 0.015, deck.v0, deck.v1, Z + 5, Z + 6.4, '#5a994d', '#3e7334', '#72b862');
  } else {
    // Classic glazed skybridge with light canopy.
    iso.wall(lit, at, a0, a1, Z, Z + 5, 'rgba(150, 200, 230, 0.55)');
    for (let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 6) iso.wall(lit, at, a - 0.006, a + 0.006, Z, Z + 5, '#e8e4da');
    iso.box(deck.u0 - 0.01, deck.u1 + 0.01, deck.v0, deck.v1, Z + 5, Z + 6, '#f2efe8', shade('#f2efe8', -0.2), '#f7f5f0');
  }
  tower(0.36, 0.5);
}
