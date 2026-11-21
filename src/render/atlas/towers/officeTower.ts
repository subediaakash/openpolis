import type { IsoFrame, Orient, Rng } from '../core';
import { at } from '../civic/lot';
import { loft, planShadow, prism, sweep } from '../modern/loft';
import { lightRing, spire } from '../modern/parts';
import { chamfered, circle, rect, rotate, superellipse, type Pt } from '../modern/plans';
import { bands, glass, solid } from '../modern/skins';
import { towerLot } from './lot';

/**
 * Office Tower (2×2, zoned high-density commercial): six contemporary skyscrapers, each its own
 * form rather than a recolour: a twisting tower, a chamfered obelisk, a bullet, twin slabs with
 * a skybridge, a stepped tower with a spire, and a slanted-cut prism.
 */

const C: Pt = [1, 1];
const LOT = (o: Orient) => ({ u0: 0, u1: o.vw, v0: 0, v1: o.vh });

type Design = (iso: IsoFrame, o: Orient) => void;

/** A square tower turning a quarter turn on its way up. */
const twist: Design = (iso, o) => {
  const H = 196;
  planShadow(iso, o, C, rect(0.6, 0.6), H, LOT(o));
  prism(iso, o, C, superellipse(0.72, 0.72, 6, 32), 0, 10, glass({ tint: '#2f4f68', floorH: 10, mullion: 0.12 }), '#d5dbe1');
  const skin = glass({ tint: '#4d8aa6', frame: '#e6f1f6', floorH: 6, mullion: 0.11 });
  loft(iso, o, sweep(10, H, 30, C, (t) => rotate(superellipse(0.58, 0.58, 8, 32), t * (Math.PI / 2))), skin, '#dfe8ee');
  lightRing(iso, o, C, rotate(superellipse(0.56, 0.56, 8, 32), Math.PI / 2), H - 2, '#eaf8ff');
  spire(iso, o, C, H, 26, 0.06, '#e3eaf0');
};

/** A chamfered obelisk tapering to a pyramid top and spire. */
const obelisk: Design = (iso, o) => {
  const H = 188;
  planShadow(iso, o, C, rect(0.65, 0.65), H, LOT(o));
  const skin = glass({ tint: '#33557e', frame: '#d9e4f0', floorH: 6, mullion: 0.1 });
  loft(iso, o, sweep(0, H, 12, C, (t) => chamfered(0.72 - t * 0.28, 0.72 - t * 0.28, 0.2 - t * 0.08)), skin, null);
  loft(iso, o, sweep(H, H + 22, 3, C, (t) => chamfered(0.44 * (1 - t) + 0.03, 0.44 * (1 - t) + 0.03, 0.12 * (1 - t) + 0.01)), glass({ tint: '#6c93c0', floorH: 0, mullion: 0.08, lights: false }), null);
  spire(iso, o, C, H + 22, 30, 0.04, '#e7edf3');
};

/** A rounded bullet with a fine diagrid of mullions. */
const bullet: Design = (iso, o) => {
  const H = 176;
  planShadow(iso, o, C, circle(0.6), H, LOT(o));
  const r = (t: number) => 0.7 * Math.sin(Math.PI * (0.27 + 0.73 * t)) + 0.02;
  loft(iso, o, sweep(0, H, 26, C, (t) => circle(r(t), 28)), glass({ tint: '#4f8a7c', frame: '#e1f2ec', floorH: 5, mullion: 0.08 }), '#e7efeb');
};

/** Two slim slabs of different heights joined by a glass skybridge. */
const twins: Design = (iso, o) => {
  const skin = glass({ tint: '#7a6a55', frame: '#f1e8dc', floorH: 6, mullion: 0.1 });
  const a: Pt = [0.55, 1];
  const b: Pt = [1.45, 1];
  const plan = superellipse(0.3, 0.55, 6, 24);
  planShadow(iso, o, C, rect(0.75, 0.6), 180, LOT(o));
  const [far, near] = [
    { depth: at(o, a[0], a[1]).depth, draw: () => prism(iso, o, a, plan, 0, 182, skin, '#efe6da') },
    { depth: at(o, b[0], b[1]).depth, draw: () => prism(iso, o, b, plan, 0, 158, skin, '#efe6da') },
  ].sort((x, y) => x.depth - y.depth);
  far.draw();
  prism(iso, o, C, rect(0.2, 0.22), 118, 128, glass({ tint: '#a3c4d8', floorH: 0, mullion: 0.06, lights: false }), '#e9eef2');
  near.draw();
};

/** Three stepped tiers in stone bands and glass, finished with a spire. */
const stepped: Design = (iso, o) => {
  planShadow(iso, o, C, rect(0.7, 0.7), 190, LOT(o));
  const skin = bands({ wall: '#e9e4da', tint: '#3e5f7e', floorH: 7, glazed: 0.62 });
  const tiers: readonly [number, number, number][] = [
    [0, 92, 0.74],
    [92, 142, 0.6],
    [142, 176, 0.46],
  ];
  for (const [z0, z1, hw] of tiers) prism(iso, o, C, chamfered(hw, hw, hw * 0.25), z0, z1, skin, '#d9d3c7');
  prism(iso, o, C, chamfered(0.3, 0.3, 0.08), 176, 186, solid('#d6cfc1'));
  spire(iso, o, C, 186, 44, 0.08, '#dcd5c8');
};

/** A prism cut by one great slanting face that catches the sky. */
const slant: Design = (iso, o) => {
  const H = 190;
  planShadow(iso, o, C, rect(0.65, 0.65), H, LOT(o));
  const skin = glass({ tint: '#5f8fb5', frame: '#e8f1f8', floorH: 6, mullion: 0.1 });
  // The front recedes as it rises: depth shrinks and the centre moves back, keeping the back wall plumb.
  loft(
    iso,
    o,
    sweep(0, H, 1, (t) => [1, 1 - t * 0.38], (t) => rect(0.64, 0.66 - t * 0.38)),
    skin,
    '#e6eef4',
  );
};

/** Dramatic cantilevered stacked glass cubes with planted sky-terraces. */
const cantilever: Design = (iso, o) => {
  planShadow(iso, o, C, rect(0.7, 0.7), 186, LOT(o));
  const skin = glass({ tint: '#3b6a8c', frame: '#e6f0f6', floorH: 6, mullion: 0.1 });
  prism(iso, o, [1, 1], superellipse(0.68, 0.68, 6, 24), 0, 14, glass({ tint: '#284054', floorH: 14, mullion: 0.12 }), '#d4dce2');
  prism(iso, o, [0.92, 0.96], rect(0.56, 0.56), 14, 72, skin, '#72b862');
  prism(iso, o, [1.08, 1.04], rect(0.56, 0.54), 72, 132, skin, '#72b862');
  prism(iso, o, [0.96, 0.96], rect(0.48, 0.48), 132, 186, skin, '#dfe8ee');
  lightRing(iso, o, [0.96, 0.96], rect(0.47, 0.47), 184, '#d8f3ff');
};

/** Rotated octagonal crystal tower with a glowing crown ring and mast. */
const diamond: Design = (iso, o) => {
  const H = 194;
  planShadow(iso, o, C, rect(0.64, 0.64), H, LOT(o));
  const skin = glass({ tint: '#5a82a8', frame: '#edf4fa', floorH: 6, mullion: 0.09 });
  loft(iso, o, sweep(0, H, 10, C, (t) => rotate(chamfered(0.66 - t * 0.18, 0.66 - t * 0.18, 0.24 - t * 0.06), Math.PI / 4)), skin, '#e4edf5');
  lightRing(iso, o, C, rotate(chamfered(0.48, 0.48, 0.18), Math.PI / 4), H - 2, '#fff4cc');
  spire(iso, o, C, H, 34, 0.05, '#e8eef4');
};

/** Bronze & limestone Neo-Deco corporate tower with recessed sky-lobby. */
const neoDeco: Design = (iso, o) => {
  planShadow(iso, o, C, rect(0.72, 0.72), 192, LOT(o));
  const skin = bands({ wall: '#d8cbb6', tint: '#384e66', floorH: 6.5, glazed: 0.55 });
  prism(iso, o, C, chamfered(0.74, 0.74, 0.16), 0, 74, skin, '#c8bca6');
  prism(iso, o, C, chamfered(0.62, 0.62, 0.14), 74, 86, glass({ tint: '#6ca0c4', floorH: 0, mullion: 0.08, lights: false }), '#d8cbb6');
  prism(iso, o, C, chamfered(0.58, 0.58, 0.14), 86, 154, skin, '#c8bca6');
  prism(iso, o, C, chamfered(0.42, 0.42, 0.1), 154, 186, skin, '#e8dcc8');
  spire(iso, o, C, 186, 40, 0.06, '#e0d4be');
};

/** Sculptural tapering emerald-glass ellipse tower with twin crown fins. */
const emerald: Design = (iso, o) => {
  const H = 184;
  planShadow(iso, o, C, circle(0.62), H, LOT(o));
  const skin = glass({ tint: '#367a72', frame: '#dff2ee', floorH: 6, mullion: 0.09 });
  loft(iso, o, sweep(0, H, 18, C, (t) => superellipse(0.68 - t * 0.24, 0.52 - t * 0.16, 4, 28)), skin, '#d8ece6');
  lightRing(iso, o, C, superellipse(0.44, 0.36, 4, 24), H - 1.5, '#b8ffee');
  spire(iso, o, [0.92, 1], H, 28, 0.04, '#e4f0ec');
  spire(iso, o, [1.08, 1], H, 22, 0.04, '#e4f0ec');
};

const DESIGNS: readonly Design[] = [twist, obelisk, bullet, twins, stepped, slant, cantilever, diamond, neoDeco, emerald];
export const OFFICE_TOWER_VARIANTS = DESIGNS.length;
export const OFFICE_TOWER_TOP = 240;

export function paintOfficeTower(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = towerLot(iso, o, variant);
  DESIGNS[variant % DESIGNS.length](iso, o);
  lot.front();
  void rng;
}
