import type { IsoFrame, Orient, Rng } from '../core';
import { at, drawItems } from '../civic/lot';
import { localFloor } from '../civic/kit';
import { prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { van } from '../modern/props';
import { sideRef } from '../modern/sides';
import { vault } from '../modern/vault';
import { solid } from '../modern/skins';
import { finGlass } from '../modern/towerSkins';
import { TOWER } from '../towers/skyscraper';
import { LOW, pick, shadow, sign, type Design } from './kit';

/**
 * Supermarket (2×2, level 2): a market hall at the back of its car park (D-110): a glazed front
 * under a timber barrel roof, or a terracotta-finned hall with a deep canopy.
 */

const HALL: Pt = [1, 0.62];
const HW = 0.82;
const HD = 0.44;

/** The car park in front: asphalt with white bays. */
function carPark(iso: IsoFrame, o: Orient) {
  localFloor(iso, o, { u0: 0.06, u1: 1.94, v0: 1.12, v1: 1.94 }, 0.05, '#5a5f66');
  for (let k = 0; k < 7; k++) {
    const u = 0.2 + k * 0.25;
    localFloor(iso, o, { u0: u, u1: u + 0.02, v0: 1.3, v1: 1.7 }, 0.08, '#e9e6dc');
  }
}

const barrelHall: Design = (iso, o, v) => {
  shadow(iso, o, HALL, HW, HD, 22);
  prism(iso, o, HALL, rect(HW, HD), 0, 10, finGlass({ tint: TOWER.lobby, fin: '#efe3cc', floorH: 10, bay: 0.16, finShare: 0.25 }), null);
  vault(iso, o, { u0: HALL[0] - HW, u1: HALL[0] + HW, v0: HALL[1] - HD, v1: HALL[1] + HD }, 'u', 10, 9, solid(LOW.timber), '#c9a27a');
  sign(iso, o, HALL, HW, HD, 8.5, 'MARKET', pick(LOW.accents, v), 3);
};

const finnedHall: Design = (iso, o, v) => {
  shadow(iso, o, HALL, HW, HD, 18);
  prism(iso, o, HALL, rect(HW, HD), 0, 16, finGlass({ tint: TOWER.darkGlass, fin: TOWER.terracotta, floorH: 16, bay: 0.12, finShare: 0.3 }), '#a69a88');
  if (sideRef(o, HALL, HW, HD, 'front')) prism(iso, o, [HALL[0], HALL[1] + HD + 0.08], rect(HW * 0.7, 0.08), 8, 9, solid('#efe3cc'));
  sign(iso, o, HALL, HW, HD, 13, 'MARKET', pick(LOW.accents, v + 1), 3);
};

const DESIGNS: readonly Design[] = [barrelHall, finnedHall];
export const SUPERMARKET_VARIANTS = 4;
export const SUPERMARKET_TOP = 40;

export function paintSupermarket(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  localFloor(iso, o, { u0: 0.02, u1: 1.98, v0: 0.02, v1: 1.98 }, 0, '#e9e2d4');
  carPark(iso, o);
  // Parked vans behind the hall first, the rest after it (by depth, in any rotation).
  const vans = [van(iso, o, 0.4, 1.4, false, pick(LOW.accents, variant + 2)), van(iso, o, 1.35, 1.4, false, '#ece8df')];
  const middle = at(o, HALL[0], HALL[1]).depth;
  drawItems(vans.filter((x) => x.depth < middle));
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  drawItems(vans.filter((x) => x.depth >= middle));
  void rng;
}
