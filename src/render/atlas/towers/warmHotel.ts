import type { IsoFrame, Orient, Rng } from '../core';
import { localFloor } from '../civic/kit';
import { loft, planShadow, prism } from '../modern/loft';
import { spire } from '../modern/parts';
import { rect, superellipse, type Pt } from '../modern/plans';
import { solid } from '../modern/skins';
import { finGlass, roofed, stoneGrid, tiles } from '../modern/towerSkins';
import { towerLot } from './lot';
import { entrance, lantern, podium, TOWER } from './skyscraper';

/**
 * Hotels in warm materials (D-108, Terracotta theme): a grand stone hotel under a tiled roof, a
 * curved resort tower over a pool deck, and a slim bronze boutique tower with a lit sky bar.
 */

const C: Pt = [1, 1];
const LOT = (o: Orient) => ({ u0: 0, u1: o.vw, v0: 0, v1: o.vh });

type Design = (iso: IsoFrame, o: Orient) => void;

/** Grand Hotel: a stone block with shuttered windows under a hipped terracotta roof and a flagpole. */
const grand: Design = (iso, o) => {
  const H = 96;
  planShadow(iso, o, C, rect(0.72, 0.6), H + 18, LOT(o));
  podium(iso, o, C, rect(0.84, 0.74), 12, TOWER.sandstone);
  entrance(iso, o, C, 0.84, 0.74);
  const wall = stoneGrid({ stone: '#f1e6d0', glass: TOWER.darkGlass, floorH: 8, bay: 0.15, glazed: 0.5, tall: 0.64, shutter: '#2f6b5e' });
  prism(iso, o, C, rect(0.7, 0.58), 12, H, wall, null);
  // Hipped roof: from the eaves up to a short ridge.
  loft(
    iso,
    o,
    [
      { z: H, plan: rect(0.76, 0.64), at: C },
      { z: H + 18, plan: rect(0.24, 0.02), at: C },
    ],
    roofed(tiles(TOWER.terracotta), solid('#f1e6d0')),
    null,
  );
  spire(iso, o, C, H + 18, 14, 0.03, '#e8dcc6');
};

/** Resort Tower: a curved tower of terraces over a podium deck with a pool. */
const resort: Design = (iso, o) => {
  const H = 150;
  const body = superellipse(0.62, 0.36, 3, 28);
  planShadow(iso, o, C, rect(0.62, 0.4), H, LOT(o));
  podium(iso, o, C, rect(0.86, 0.86), 10);
  // The pool deck on the podium roof, in front of the tower.
  localFloor(iso, o, { u0: 0.26, u1: 1.1, v0: 1.36, v1: 1.74 }, 10.05, '#efe7d6');
  localFloor(iso, o, { u0: 0.32, u1: 1.04, v0: 1.42, v1: 1.68 }, 10.1, '#4fb9d9');
  entrance(iso, o, C, 0.86, 0.86);
  const wall = stoneGrid({ stone: '#f3e9d6', glass: TOWER.darkGlass, floorH: 7, bay: 0.12, glazed: 0.7, tall: 0.6 });
  for (let k = 0; k < 20; k++) {
    const z = 10 + k * 7;
    prism(iso, o, [1, 0.9], body, z, z + 5.8, wall, null);
    prism(iso, o, [1, 0.9], superellipse(0.68, 0.42, 3, 28), z + 5.8, z + 7, solid(TOWER.terracotta), k === 19 ? TOWER.garden : TOWER.terracotta);
  }
};

/** Boutique Tower: slim and bronze, a lit sky bar crowning it. */
const boutique: Design = (iso, o) => {
  const H = 168;
  planShadow(iso, o, C, rect(0.46, 0.46), H, LOT(o));
  podium(iso, o, C, rect(0.8, 0.8), 14, TOWER.limestone);
  entrance(iso, o, C, 0.8, 0.8);
  prism(iso, o, C, rect(0.44, 0.44), 14, H, finGlass({ tint: TOWER.bronzeGlass, fin: TOWER.bronze, floorH: 7, bay: 0.1, finShare: 0.3 }), TOWER.bronze);
  lantern(iso, o, C, rect(0.38, 0.38), H, 9);
  prism(iso, o, C, rect(0.44, 0.44), H + 9, H + 11, solid(TOWER.bronze));
};

const DESIGNS: readonly Design[] = [grand, resort, boutique];
export const WARM_HOTEL_VARIANTS = DESIGNS.length;
export const WARM_HOTEL_TOP = 196;

export function paintWarmHotel(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = towerLot(iso, o, variant);
  DESIGNS[variant % DESIGNS.length](iso, o);
  lot.front();
  void rng;
}
