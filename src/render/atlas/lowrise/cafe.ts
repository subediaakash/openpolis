import type { IsoFrame, Orient, Rng } from '../core';
import { parasol } from '../modern/props';
import type { Pt } from '../modern/plans';
import { around, awning, block, flatRoof, gable, LOW, pick, shadow, shopfront, sign, type Design } from './kit';
import { plaza } from '../landmarks/plaza';

/**
 * Café (1×1, level 1): a small café with an awning and parasols on its terrace (D-110), the
 * building set back so the tables sit on the street side.
 */

const C: Pt = [0.5, 0.4];
const wall = (v: number) => pick(LOW.homeWalls, v * 2);
const accent = (v: number) => pick(LOW.accents, v + 1);

const gabled: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.3, 0.22, 22);
  shopfront(iso, o, C, 0.3, 0.22, wall(v));
  block(iso, o, C, 0.3, 0.22, 7, 13, wall(v), { shutter: pick(LOW.shutters, v) });
  gable(iso, o, C, 0.3, 0.22, 13, 8, pick(LOW.roofs, v), wall(v));
  awning(iso, o, C, 0.3, 0.22, 6.4, accent(v), 0.1);
};

const pavilion: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.32, 0.22, 12);
  shopfront(iso, o, C, 0.32, 0.22, LOW.timber);
  block(iso, o, C, 0.32, 0.22, 7, 9, LOW.timber, { floorH: 2, glazed: 0.01 });
  flatRoof(iso, o, C, 0.32, 0.22, 9, LOW.timber, LOW.garden);
  awning(iso, o, C, 0.32, 0.22, 6.4, accent(v + 1), 0.1);
  sign(iso, o, C, 0.32, 0.22, 8, 'CAFÉ', accent(v + 1), 2.2);
};

const DESIGNS: readonly Design[] = [gabled, pavilion];
export const CAFE_VARIANTS = 6;
export const CAFE_TOP = 34;

export function paintCafe(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  plaza(iso, o, '#ece3d1', 0.2);
  // The terrace: parasols over the tables in front of the café.
  const parasols = [parasol(iso, o, 0.28, 0.8, accent(variant)), parasol(iso, o, 0.7, 0.82, pick(LOW.accents, variant + 3))];
  around(o, C, parasols, () => DESIGNS[variant % DESIGNS.length](iso, o, variant));
  void rng;
}
