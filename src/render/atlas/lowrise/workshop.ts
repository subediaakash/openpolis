import type { IsoFrame, Orient, Rng } from '../core';
import { prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { sideRef, panel } from '../modern/sides';
import { metal } from '../modern/skins';
import { block, flatRoof, forecourt, gable, LOW, pick, shadow, type Design } from './kit';

/**
 * Workshop (1×1, level 1): a small works yard (D-110): a brick shed with a roller door under a
 * clay gable, or a corrugated metal shed in warm ochre or terracotta.
 */

const C: Pt = [0.5, 0.44];

/** A roller door on the front, if the front faces the camera. */
function rollerDoor(iso: IsoFrame, o: Orient, hw: number, hd: number) {
  const s = sideRef(o, C, hw, hd, 'front');
  if (s) panel(iso, s, 0.3, 0.7, 0, 7, '#6b6258');
}

const brickShed: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.32, 0.26, 20);
  block(iso, o, C, 0.32, 0.26, 0, 11, '#b5654a', { floorH: 11, bay: 0.22, glazed: 0.4, tall: 0.4 });
  gable(iso, o, C, 0.32, 0.26, 11, 7, pick(LOW.roofs, v), '#b5654a');
  rollerDoor(iso, o, 0.32, 0.26);
};

const metalShed: Design = (iso, o, v) => {
  const colour = v % 2 === 0 ? '#c99a5e' : '#b86a4e';
  shadow(iso, o, C, 0.34, 0.28, 14);
  prism(iso, o, C, rect(0.34, 0.28), 0, 12, metal(colour), null);
  flatRoof(iso, o, C, 0.34, 0.28, 12, '#8a8378', '#9a9284');
  rollerDoor(iso, o, 0.34, 0.28);
};

const DESIGNS: readonly Design[] = [brickShed, metalShed];
export const WORKSHOP_VARIANTS = 4;
export const WORKSHOP_TOP = 30;

export function paintWorkshop(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = forecourt(iso, o, [[0.12, 0.88]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
