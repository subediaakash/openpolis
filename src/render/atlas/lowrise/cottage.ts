import type { IsoFrame, Orient, Rng } from '../core';
import { block, door, gable, garden, hip, inOrder, LOW, pick, shadow, type Design } from './kit';

/**
 * Cottage (1×1, level 1): a small rendered house under a clay roof in a garden (D-108). Walls,
 * roof and shutters come from the theme, so a street of them reads as one town.
 */

const wall = (v: number) => pick(LOW.homeWalls, v * 3);
const roof = (v: number) => pick(LOW.roofs, v * 2 + 1);
const shutter = (v: number) => pick(LOW.shutters, v);

/** Gabled cottage, ridge along the front. */
const gabled: Design = (iso, o, v) => {
  shadow(iso, o, [0.5, 0.46], 0.26, 0.2, 16);
  block(iso, o, [0.5, 0.46], 0.26, 0.2, 0, 9, wall(v), { shutter: shutter(v), tall: 0.5 });
  gable(iso, o, [0.5, 0.46], 0.26, 0.2, 9, 8, roof(v), wall(v));
  door(iso, o, [0.5, 0.46], 0.26, 0.2);
};

/** Hipped cottage, a little square house. */
const hipped: Design = (iso, o, v) => {
  shadow(iso, o, [0.5, 0.46], 0.24, 0.22, 15);
  block(iso, o, [0.5, 0.46], 0.24, 0.22, 0, 9, wall(v + 1), { shutter: shutter(v + 1), tall: 0.5 });
  hip(iso, o, [0.5, 0.46], 0.24, 0.22, 9, 7, roof(v + 1));
  door(iso, o, [0.5, 0.46], 0.24, 0.22);
};

/** L-shaped cottage: the house and a lower wing, each under its own roof. */
const ell: Design = (iso, o, v) => {
  shadow(iso, o, [0.48, 0.44], 0.3, 0.24, 16);
  inOrder(o, [
    {
      p: [0.42, 0.42],
      draw: () => {
        block(iso, o, [0.42, 0.42], 0.22, 0.18, 0, 9, wall(v), { shutter: shutter(v), tall: 0.5 });
        gable(iso, o, [0.42, 0.42], 0.22, 0.18, 9, 8, roof(v), wall(v));
        door(iso, o, [0.42, 0.42], 0.22, 0.18);
      },
    },
    {
      p: [0.68, 0.56],
      draw: () => {
        block(iso, o, [0.68, 0.56], 0.1, 0.16, 0, 7, wall(v), { tall: 0.5, bay: 0.2 });
        gable(iso, o, [0.68, 0.56], 0.1, 0.16, 7, 6, roof(v), wall(v), 'v');
      },
    },
  ]);
};

/** Gable end to the street, with a white porch roof over the door. */
const gableFront: Design = (iso, o, v) => {
  shadow(iso, o, [0.5, 0.44], 0.2, 0.26, 18);
  block(iso, o, [0.5, 0.44], 0.2, 0.26, 0, 10, wall(v + 2), { shutter: shutter(v + 2), tall: 0.5 });
  gable(iso, o, [0.5, 0.44], 0.2, 0.26, 10, 9, roof(v + 2), wall(v + 2), 'v');
  door(iso, o, [0.5, 0.44], 0.2, 0.26);
};

const DESIGNS: readonly Design[] = [gabled, hipped, ell, gableFront];
export const COTTAGE_VARIANTS = 8;
export const COTTAGE_TOP = 34;

export function paintCottage(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = garden(iso, o, [0.5, 0.7], [[0.15, 0.2], [0.85, 0.82]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
