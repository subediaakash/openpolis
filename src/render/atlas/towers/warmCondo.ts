import type { IsoFrame, Orient, Rng } from '../core';
import { at } from '../civic/lot';
import { planShadow, prism } from '../modern/loft';
import { circle, rect, superellipse, type Plan, type Pt } from '../modern/plans';
import { solid } from '../modern/skins';
import { finGlass, stoneGrid } from '../modern/towerSkins';
import { towerLot } from './lot';
import { entrance, podium, TOWER } from './skyscraper';

/**
 * Condo towers in warm materials (D-108, Terracotta theme): homes stacked high, so balconies,
 * terraces and gardens show it is lived in. Base, shaft and crown like the office towers.
 */

const C: Pt = [1, 1];
const LOT = (o: Orient) => ({ u0: 0, u1: o.vw, v0: 0, v1: o.vh });
const FLOOR = 8;

type Design = (iso: IsoFrame, o: Orient) => void;

/** Render walls with deep windows, the shared skin of the condos. */
const walls = (stone: string, shutter?: string) => stoneGrid({ stone, glass: TOWER.darkGlass, floorH: FLOOR, bay: 0.15, glazed: 0.58, tall: 0.62, shutter });

/** A shaft of `floors` floors, each with a white balcony slab that runs past the walls. */
function balconied(iso: IsoFrame, o: Orient, p: Pt, plan: Plan, slab: Plan, z0: number, floors: number, stone: string, roof: string) {
  const skin = walls(stone);
  for (let k = 0; k < floors; k++) {
    const z = z0 + k * FLOOR;
    prism(iso, o, p, plan, z, z + FLOOR - 1.2, skin, null);
    prism(iso, o, p, slab, z + FLOOR - 1.2, z + FLOOR, solid('#f6f1e6'), k === floors - 1 ? roof : '#f6f1e6');
  }
}

/** Garden Steps: limestone tiers stepping back, each terrace planted. */
const gardenSteps: Design = (iso, o) => {
  planShadow(iso, o, C, rect(0.7, 0.7), 150, LOT(o));
  podium(iso, o, C, rect(0.86, 0.86), 12);
  entrance(iso, o, C, 0.86, 0.86);
  const tiers: readonly [number, number, number][] = [
    [12, 64, 0.68],
    [64, 106, 0.56],
    [106, 138, 0.45],
    [138, 154, 0.34],
  ];
  for (const [z0, z1, r] of tiers) {
    prism(iso, o, C, superellipse(r, r, 6, 24), z0, z1, walls(TOWER.limestone, '#2f6b5e'), TOWER.garden);
  }
};

/** Terracotta Slab: a brick-red tower wrapped in white balconies on every floor. */
const terracottaSlab: Design = (iso, o) => {
  planShadow(iso, o, C, rect(0.6, 0.66), 158, LOT(o));
  podium(iso, o, C, rect(0.86, 0.86), 14, TOWER.sandstone);
  entrance(iso, o, C, 0.86, 0.86);
  balconied(iso, o, C, rect(0.48, 0.58), rect(0.56, 0.66), 14, 18, '#c0694e', TOWER.garden);
};

/** Round Balconies: a cream drum whose balconies ripple round it, a garden on top. */
const roundBalconies: Design = (iso, o) => {
  planShadow(iso, o, C, circle(0.6), 150, LOT(o));
  podium(iso, o, C, superellipse(0.86, 0.86, 4, 28), 12);
  entrance(iso, o, C, 0.8, 0.8);
  const skin = walls('#efe3cc');
  for (let k = 0; k < 17; k++) {
    const z = 12 + k * FLOOR;
    const wobble = 0.04 * Math.sin(k * 0.7);
    prism(iso, o, C, circle(0.5, 24), z, z + FLOOR - 1, skin, null);
    prism(iso, o, C, superellipse(0.55 + wobble, 0.55 - wobble, 3, 24), z + FLOOR - 1, z + FLOOR, solid('#f8f3e8'), k === 16 ? TOWER.garden : '#f8f3e8');
  }
};

/** Twin Courts: two sandstone towers of different heights round a garden court, bronze-trimmed. */
const twinCourts: Design = (iso, o) => {
  const a: Pt = [0.6, 1.4];
  const b: Pt = [1.4, 0.6];
  planShadow(iso, o, C, rect(0.74, 0.74), 150, LOT(o));
  podium(iso, o, C, rect(0.86, 0.86), 10, TOWER.sandstone);
  entrance(iso, o, C, 0.86, 0.86);
  const [far, near] = [a, b].sort((p, q) => at(o, p[0], p[1]).depth - at(o, q[0], q[1]).depth);
  const height = (p: Pt) => (p === a ? 150 : 118);
  for (const p of [far, near]) {
    prism(iso, o, p, rect(0.32, 0.32), 10, height(p), walls(TOWER.sandstone, TOWER.bronze), TOWER.garden);
    prism(iso, o, p, rect(0.24, 0.24), height(p), height(p) + 6, finGlass({ tint: '#c9935a', fin: TOWER.bronze, floorH: 6, bay: 0.08, finShare: 0.35 }), TOWER.bronze);
  }
};

const DESIGNS: readonly Design[] = [gardenSteps, terracottaSlab, roundBalconies, twinCourts];
export const WARM_CONDO_VARIANTS = DESIGNS.length;
export const WARM_CONDO_TOP = 180;

export function paintWarmCondo(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = towerLot(iso, o, variant);
  DESIGNS[variant % DESIGNS.length](iso, o);
  lot.front();
  void rng;
}
