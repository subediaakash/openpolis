import type { IsoFrame, Orient, Rng } from '../core';
import { lawn } from '../civic/kit';
import { prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { solid } from '../modern/skins';
import { lantern, TOWER } from '../towers/skyscraper';
import { block, door, garden, hip, inOrder, shadow, sign, type Design } from './kit';

/**
 * University (3×3): a limestone great hall with a clock tower under clay roofs, two wings round a
 * lawn quad (D-110).
 */

const HALL: Pt = [1.5, 0.5];
const WEST: Pt = [0.45, 1.5];
const EAST: Pt = [2.55, 1.5];
const CLOCK: Pt = [1.5, 0.5];
const STONE = '#ece1cb';

const quad: Design = (iso, o) => {
  shadow(iso, o, [1.5, 1.2], 1.3, 1.0, 30);
  const wing = (p: Pt, hw: number, hd: number, h: number) => ({
    p,
    draw: () => {
      block(iso, o, p, hw, hd, 0, h, STONE, { bay: 0.16, glazed: 0.55, tall: 0.66, floorH: 9 });
      hip(iso, o, p, hw, hd, h, 9, TOWER.terracotta);
    },
  });
  inOrder(o, [
    {
      p: HALL,
      draw: () => {
        wing(HALL, 1.3, 0.3, 20).draw();
        door(iso, o, HALL, 1.3, 0.3);
        // The clock tower over the hall's middle, a lit lantern on top.
        prism(iso, o, CLOCK, rect(0.16, 0.16), 20, 44, solid(STONE));
        prism(iso, o, CLOCK, rect(0.2, 0.2), 44, 46, solid('#d9c29e'));
        lantern(iso, o, CLOCK, rect(0.13, 0.13), 46, 7);
        sign(iso, o, HALL, 1.3, 0.3, 16, 'UNIVERSITY', '#efc46a', 2.8);
      },
    },
    wing(WEST, 0.3, 0.8, 18),
    wing(EAST, 0.3, 0.8, 18),
  ]);
};

const DESIGNS: readonly Design[] = [quad];
export const UNIVERSITY_VARIANTS = 2;
export const UNIVERSITY_TOP = 70;

export function paintUniversity(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = garden(iso, o, [1.5, 0.8], [[1.1, 1.4], [1.9, 1.4], [1.1, 2.3], [1.9, 2.3]], variant);
  lawn(iso, o.rect({ u0: 1.0, u1: 2.0, v0: 1.1, v1: 2.6 }));
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
