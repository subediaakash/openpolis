import type { IsoFrame, Orient, Rng } from '../core';
import { prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { sideRef } from '../modern/sides';
import { finGlass } from '../modern/towerSkins';
import { TOWER } from '../towers/skyscraper';
import { balcony, block, door, flatRoof, forecourt, gable, hip, LOW, pick, shadow, type Design } from './kit';

/**
 * Walk-up (1×1, level 2): three- and four-storey apartment houses (D-108), rendered with
 * shutters under clay roofs, brick with balconies and a roof garden, or over a corner shop.
 */

const C: Pt = [0.5, 0.48];
const wall = (v: number) => pick(LOW.aptWalls, v * 2);

const hipped: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.34, 0.28, 40);
  block(iso, o, C, 0.34, 0.28, 0, 32, wall(v), { bay: 0.14, shutter: pick(LOW.shutters, v) });
  hip(iso, o, C, 0.34, 0.28, 32, 9, pick(LOW.roofs, v));
  door(iso, o, C, 0.34, 0.28);
};

const brickBalconies: Design = (iso, o) => {
  shadow(iso, o, C, 0.34, 0.28, 34);
  block(iso, o, C, 0.34, 0.28, 0, 32, '#b86a4e', { bay: 0.14, glazed: 0.55, tall: 0.62 });
  for (const z of [8, 16, 24]) balcony(iso, o, C, 0.34, 0.28, z, 0.15, 0.85);
  flatRoof(iso, o, C, 0.34, 0.28, 32, '#a85a42');
  door(iso, o, C, 0.34, 0.28);
};

const gabled: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.34, 0.26, 34);
  block(iso, o, C, 0.34, 0.26, 0, 24, wall(v + 1), { bay: 0.14, shutter: pick(LOW.shutters, v + 2) });
  gable(iso, o, C, 0.34, 0.26, 24, 10, pick(LOW.roofs, v + 1), wall(v + 1));
  door(iso, o, C, 0.34, 0.26);
};

/** Over a corner shop: a glazed ground floor with an awning, three floors of flats above. */
const overShop: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.36, 0.3, 34);
  prism(iso, o, C, rect(0.36, 0.3), 0, 7, finGlass({ tint: TOWER.lobby, fin: wall(v + 2), floorH: 7, bay: 0.14, finShare: 0.3 }), null);
  block(iso, o, C, 0.36, 0.3, 7, 31, wall(v + 2), { bay: 0.14, shutter: pick(LOW.shutters, v + 3) });
  flatRoof(iso, o, C, 0.36, 0.3, 31, wall(v + 2));
  // The striped awning over the shop window, seen only from the front.
  if (sideRef(o, C, 0.36, 0.3, 'front')) prism(iso, o, [C[0], C[1] + 0.34], rect(0.32, 0.05), 6.5, 7.3, finGlass({ tint: TOWER.terracotta, fin: '#f6f1e6', floorH: 1, bay: 0.06, finShare: 0.5 }));
};

const DESIGNS: readonly Design[] = [hipped, brickBalconies, gabled, overShop];
export const WALKUP_VARIANTS = 8;
export const WALKUP_TOP = 52;

export function paintWalkup(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = forecourt(iso, o, [[0.1, 0.9]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
