import type { IsoFrame, Orient, Rng } from '../core';
import { localFloor } from '../civic/kit';
import { prism } from '../modern/loft';
import { truck } from '../modern/props';
import { rect, type Pt } from '../modern/plans';
import { panel, sideRef } from '../modern/sides';
import { vault } from '../modern/vault';
import { metal, solid } from '../modern/skins';
import { around, flatRoof, LOW, pick, shadow, sign, type Design } from './kit';

/**
 * Warehouse (2×2, level 2): a distribution hall with loading docks and lorries (D-110): warm
 * metal cladding under a barrel roof, or a long flat shed with a terracotta band.
 */

const HALL: Pt = [1, 0.8];
const HW = 0.82;
const HD = 0.56;

/** Loading bays on the front, if it faces the camera. */
function docks(iso: IsoFrame, o: Orient) {
  const s = sideRef(o, HALL, HW, HD, 'front');
  if (!s) return;
  for (const a of [0.2, 0.4, 0.6, 0.8]) panel(iso, s, a - 0.07, a + 0.07, 0, 7, '#5e574f');
}

const barrel: Design = (iso, o, v) => {
  shadow(iso, o, HALL, HW, HD, 24);
  prism(iso, o, HALL, rect(HW, HD), 0, 14, metal(v % 2 === 0 ? '#c99a5e' : '#cdb48e'), null);
  vault(iso, o, { u0: HALL[0] - HW, u1: HALL[0] + HW, v0: HALL[1] - HD, v1: HALL[1] + HD }, 'u', 14, 8, metal('#9a8d7c'));
  docks(iso, o);
};

const longShed: Design = (iso, o, v) => {
  shadow(iso, o, HALL, HW, HD, 18);
  prism(iso, o, HALL, rect(HW, HD), 0, 16, metal('#ddd2bf'), null);
  prism(iso, o, HALL, rect(HW + 0.005, HD + 0.005), 12, 15, solid(pick(['#b4553a', '#2f6b5e'], v)), null);
  flatRoof(iso, o, HALL, HW, HD, 16, '#a69a88', '#a69a88');
  docks(iso, o);
  sign(iso, o, HALL, HW, HD, 13.5, 'DEPOT', '#efc46a', 2.8);
};

const DESIGNS: readonly Design[] = [barrel, longShed];
export const WAREHOUSE_VARIANTS = 4;
export const WAREHOUSE_TOP = 36;

export function paintWarehouse(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  localFloor(iso, o, { u0: 0.02, u1: 1.98, v0: 0.02, v1: 1.98 }, 0, '#cfc8bb');
  localFloor(iso, o, { u0: 0.1, u1: 1.9, v0: 1.42, v1: 1.92 }, 0.05, '#6b6f75');
  const lorries = [truck(iso, o, 0.5, 1.5, false, pick(LOW.accents, variant)), truck(iso, o, 1.3, 1.5, false, '#ece8df')];
  around(o, HALL, lorries, () => DESIGNS[variant % DESIGNS.length](iso, o, variant));
  void rng;
}
