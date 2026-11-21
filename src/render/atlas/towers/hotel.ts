import type { IsoFrame, Orient, Rng } from '../core';
import { loft, planShadow, prism, sweep } from '../modern/loft';
import { halo, lightRing } from '../modern/parts';
import { rect, rotate, sail, superellipse, type Pt } from '../modern/plans';
import { bands, glass, solid } from '../modern/skins';
import { towerLot } from './lot';

/**
 * Hotel (2×2, zoned high-density commercial): a crescent of balconied rooms over a pool deck, a
 * bronze-glass blade turned to the street, and a stack of cantilevered blocks with a rooftop bar.
 * Each carries a lit name on its crown.
 */

const C: Pt = [1, 1];
const LOT = (o: Orient) => ({ u0: 0, u1: o.vw, v0: 0, v1: o.vh });

type Design = (iso: IsoFrame, o: Orient) => void;

/** A lit name on a slim plate at the crown, facing whichever of front/side the camera sees. */
function crownSign(iso: IsoFrame, o: Orient, p: Pt, z: number, text: string, color: string) {
  const front = o.faceOf('front');
  const side = front ? 'front' : o.faceOf('right') ? 'right' : 'left';
  const face = o.faceOf(side);
  if (!face) return;
  const plate = side === 'front' ? rect(0.36, 0.025) : rect(0.025, 0.36);
  const off: Pt = side === 'front' ? [0, 0.04] : side === 'right' ? [0.04, 0] : [-0.04, 0];
  const q: Pt = [p[0] + off[0], p[1] + off[1]];
  prism(iso, o, q, plate, z, z + 7, solid('#2b3038'), '#3a4048');
  const [u, v] = o.point(q[0], q[1]);
  const d = 0.03;
  const [x, y] = face === 'sw' ? iso.p(u, v + d, z + 3.5) : iso.p(u + d, v, z + 3.5);
  halo(iso, x, y, 8, color);
  iso.text(face, face === 'sw' ? v + d : u + d, face === 'sw' ? u : v, z + 3.5, text, 4.2, '#fffaf0');
  iso.mark('beacon', face, x, y);
}

const crescent: Design = (iso, o) => {
  const H = 150;
  planShadow(iso, o, C, rect(0.8, 0.6), H, LOT(o));
  // Pool deck podium.
  prism(iso, o, [1, 1.05], rect(0.85, 0.8), 0, 10, glass({ tint: '#36576e', floorH: 10, mullion: 0.12 }), '#ede6d8');
  const [pu, pv] = o.point(1, 1.62);
  iso.floor(pu - 0.28, pu + 0.28, pv - 0.12, pv + 0.12, 10.2, '#47c2e8');
  loft(iso, o, sweep(10, H, 1, [1, 0.85], () => sail(0.8, 0.5, 1, 16)), bands({ wall: '#fbfaf6', tint: '#4a7896', floorH: 7, glazed: 0.58 }), '#e9e4da');
  crownSign(iso, o, [1, 0.85], H, 'HOTEL', '#ffcf6a');
};

const blade: Design = (iso, o) => {
  const H = 172;
  const plan = rotate(rect(0.82, 0.2), -Math.PI / 4);
  planShadow(iso, o, C, rect(0.6, 0.6), H, LOT(o));
  prism(iso, o, C, rotate(rect(0.9, 0.34), -Math.PI / 4), 0, 12, glass({ tint: '#3d3a36', floorH: 12, mullion: 0.12 }), '#e3dccd');
  prism(iso, o, C, plan, 12, H, glass({ tint: '#9a7c52', frame: '#f6ead6', floorH: 6, mullion: 0.09 }), '#d8cdb8');
  lightRing(iso, o, C, plan, H - 1.5, '#ffe7b0');
  crownSign(iso, o, C, H, 'GRAND', '#ffbf5a');
};

const stack: Design = (iso, o) => {
  const skin = bands({ wall: '#f2ede4', tint: '#2f7177', floorH: 7, glazed: 0.6 });
  const blocks: readonly [Pt, number, number][] = [
    [[0.88, 1.0], 0, 56],
    [[1.12, 1.08], 56, 112],
    [[0.95, 0.9], 112, 160],
  ];
  planShadow(iso, o, C, rect(0.7, 0.6), 160, LOT(o));
  for (const [p, z0, z1] of blocks) prism(iso, o, p, superellipse(0.56, 0.44, 8, 24), z0, z1, skin, '#ddd5c6');
  prism(iso, o, [0.95, 0.9], superellipse(0.4, 0.3, 6, 20), 160, 166, glass({ tint: '#5a9aa0', floorH: 0, mullion: 0.08, lights: false }), '#e7dfd0');
  lightRing(iso, o, [0.95, 0.9], superellipse(0.52, 0.42, 8, 24), 161, '#fff0c2');
  crownSign(iso, o, [0.95, 0.9], 166, 'SUITES', '#7ff0e0');
};

/** Stepped limestone Art Deco grand hotel with warm glowing crown. */
const decoHotel: Design = (iso, o) => {
  planShadow(iso, o, C, rect(0.72, 0.72), 168, LOT(o));
  const skin = bands({ wall: '#ece2cf', tint: '#38526a', floorH: 7, glazed: 0.56 });
  prism(iso, o, C, rect(0.74, 0.7), 0, 68, skin, '#dfd4be');
  prism(iso, o, C, rect(0.58, 0.54), 68, 128, skin, '#dfd4be');
  prism(iso, o, C, rect(0.42, 0.4), 128, 166, skin, '#e8dec8');
  lightRing(iso, o, C, rect(0.42, 0.4), 164, '#ffe5a8');
  crownSign(iso, o, C, 166, 'PLAZA', '#ffd27a');
};

/** Curved blue-glass resort tower rising above a landscaped pool deck. */
const resort: Design = (iso, o) => {
  const H = 162;
  planShadow(iso, o, C, rect(0.72, 0.64), H, LOT(o));
  prism(iso, o, C, superellipse(0.8, 0.76, 6, 24), 0, 12, glass({ tint: '#2d5870', floorH: 12, mullion: 0.12 }), '#78bf62');
  prism(iso, o, [1, 0.92], superellipse(0.56, 0.44, 3, 28), 12, H, glass({ tint: '#4688a8', frame: '#e8f4fa', floorH: 6.5, mullion: 0.1 }), '#dce8f0');
  lightRing(iso, o, [1, 0.92], superellipse(0.54, 0.42, 3, 28), H - 1.5, '#b8f0ff');
  crownSign(iso, o, [1, 0.92], H, 'PALACE', '#88e0ff');
};

/** Emerald-glass tapered luxury hotel with rooftop sky lounge. */
const crownHotel: Design = (iso, o) => {
  const H = 170;
  planShadow(iso, o, C, rect(0.68, 0.62), H, LOT(o));
  const skin = glass({ tint: '#367a6e', frame: '#e2f4ee', floorH: 6.5, mullion: 0.1 });
  loft(iso, o, sweep(0, H, 12, C, (t) => superellipse(0.68 - t * 0.2, 0.52 - t * 0.12, 6, 24)), skin, '#dceee8');
  lightRing(iso, o, C, superellipse(0.48, 0.4, 6, 24), H - 1.5, '#a8ffe0');
  crownSign(iso, o, C, H, 'CROWN', '#7ff0c8');
};

const DESIGNS: readonly Design[] = [crescent, blade, stack, decoHotel, resort, crownHotel];
export const HOTEL_VARIANTS = DESIGNS.length;
export const HOTEL_TOP = 196;

export function paintHotel(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = towerLot(iso, o, variant);
  DESIGNS[variant % DESIGNS.length](iso, o);
  lot.front();
  void rng;
}
