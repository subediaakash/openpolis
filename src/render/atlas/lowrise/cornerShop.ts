import type { IsoFrame, Orient, Rng } from '../core';
import type { Pt } from '../modern/plans';
import { awning, block, flatRoof, forecourt, gable, hip, LOW, pick, shadow, shopfront, sign, type Design } from './kit';

/**
 * Corner Shop (1×1, level 1): a neighbourhood shop with a striped awning and a flat above
 * (D-110), under a clay roof or a parapet, in the Terracotta palette.
 */

const C: Pt = [0.5, 0.48];
const wall = (v: number) => pick(LOW.homeWalls, v * 2 + 1);
const accent = (v: number) => pick(LOW.accents, v);

/** A shop with one floor of flat over it under a hipped roof. */
const hipped: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.32, 0.28, 24);
  shopfront(iso, o, C, 0.32, 0.28, wall(v));
  block(iso, o, C, 0.32, 0.28, 7, 15, wall(v), { shutter: pick(LOW.shutters, v) });
  hip(iso, o, C, 0.32, 0.28, 15, 7, pick(LOW.roofs, v));
  awning(iso, o, C, 0.32, 0.28, 6.4, accent(v));
};

/** Gable end to the street, the shop window under the awning. */
const gabled: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.26, 0.3, 26);
  shopfront(iso, o, C, 0.26, 0.3, wall(v + 1));
  block(iso, o, C, 0.26, 0.3, 7, 15, wall(v + 1), { shutter: pick(LOW.shutters, v + 1) });
  gable(iso, o, C, 0.26, 0.3, 15, 9, pick(LOW.roofs, v + 1), wall(v + 1), 'v');
  awning(iso, o, C, 0.26, 0.3, 6.4, accent(v + 1));
};

/** A low flat-roofed shop with a lit sign on the parapet. */
const parapet: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.34, 0.3, 14);
  shopfront(iso, o, C, 0.34, 0.3, wall(v + 2));
  block(iso, o, C, 0.34, 0.3, 7, 11, wall(v + 2), { floorH: 4, glazed: 0.01 });
  flatRoof(iso, o, C, 0.34, 0.3, 11, wall(v + 2), '#a69a88');
  awning(iso, o, C, 0.34, 0.3, 6.4, accent(v + 2));
  sign(iso, o, C, 0.34, 0.3, 9, 'SHOP', accent(v + 2));
};

const DESIGNS: readonly Design[] = [hipped, gabled, parapet];
export const CORNER_SHOP_VARIANTS = 6;
export const CORNER_SHOP_TOP = 40;

export function paintCornerShop(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = forecourt(iso, o, [[0.12, 0.12]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
