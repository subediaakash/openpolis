import type { IsoFrame, Orient, Rng } from '../core';
import { localFloor } from '../civic/kit';
import type { Pt } from '../modern/plans';
import { block, door, garden, hip, inOrder, LOW, pick, shadow, sign, type Design } from './kit';

/**
 * School (2×2): an L of two-storey classroom wings under clay roofs round a playground and a
 * sports court (D-110).
 */

const MAIN: Pt = [1, 0.42];
const WING: Pt = [0.4, 1.1];

function court(iso: IsoFrame, o: Orient) {
  localFloor(iso, o, { u0: 0.95, u1: 1.85, v0: 0.95, v1: 1.6 }, 0.1, '#d9774f');
  localFloor(iso, o, { u0: 1.0, u1: 1.8, v0: 1.0, v1: 1.55 }, 0.12, '#e2865e');
  localFloor(iso, o, { u0: 1.39, u1: 1.41, v0: 1.0, v1: 1.55 }, 0.14, '#f6efe3');
}

const ell: Design = (iso, o, v) => {
  shadow(iso, o, [1, 0.8], 0.82, 0.6, 22);
  const wall = pick(['#efe3cc', '#e9cba3', '#d9b58e'], v);
  const roof = pick(LOW.roofs, v);
  inOrder(o, [
    {
      p: MAIN,
      draw: () => {
        block(iso, o, MAIN, 0.82, 0.24, 0, 16, wall, { bay: 0.16, glazed: 0.6, tall: 0.6 });
        hip(iso, o, MAIN, 0.82, 0.24, 16, 8, roof);
        door(iso, o, MAIN, 0.82, 0.24);
        sign(iso, o, MAIN, 0.82, 0.24, 13, 'SCHOOL', '#efc46a', 2.6);
      },
    },
    {
      p: WING,
      draw: () => {
        block(iso, o, WING, 0.24, 0.46, 0, 16, wall, { bay: 0.16, glazed: 0.6, tall: 0.6 });
        hip(iso, o, WING, 0.24, 0.46, 16, 8, roof);
      },
    },
  ]);
};

const DESIGNS: readonly Design[] = [ell];
export const SCHOOL_VARIANTS = 3;
export const SCHOOL_TOP = 40;

export function paintSchool(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = garden(iso, o, [1, 0.66], [[1.85, 0.2], [0.2, 1.85]], variant);
  court(iso, o);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
