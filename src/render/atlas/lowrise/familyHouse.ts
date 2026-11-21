import type { IsoFrame, Orient, Rng } from '../core';
import { prism } from '../modern/loft';
import { rect } from '../modern/plans';
import { finGlass } from '../modern/towerSkins';
import { block, balcony, door, flatRoof, gable, garden, hip, inOrder, LOW, pick, shadow, type Design } from './kit';

/**
 * Family House (1×1, level 2): two storeys in a garden (D-108): gabled, an L of two hipped
 * wings, a modern white house with a timber upper floor, and a front-gabled house with a garage.
 */

const wall = (v: number) => pick(LOW.homeWalls, v * 3 + 1);
const roof = (v: number) => pick(LOW.roofs, v * 2);
const shutter = (v: number) => pick(LOW.shutters, v + 1);

const twoStorey: Design = (iso, o, v) => {
  shadow(iso, o, [0.5, 0.45], 0.3, 0.22, 24);
  block(iso, o, [0.5, 0.45], 0.3, 0.22, 0, 16, wall(v), { shutter: shutter(v) });
  gable(iso, o, [0.5, 0.45], 0.3, 0.22, 16, 9, roof(v), wall(v));
  balcony(iso, o, [0.5, 0.45], 0.3, 0.22, 8, 0.3, 0.7);
  door(iso, o, [0.5, 0.45], 0.3, 0.22, 0.2);
};

const hippedEll: Design = (iso, o, v) => {
  shadow(iso, o, [0.5, 0.45], 0.32, 0.26, 22);
  inOrder(o, [
    {
      p: [0.4, 0.4],
      draw: () => {
        block(iso, o, [0.4, 0.4], 0.22, 0.2, 0, 16, wall(v), { shutter: shutter(v) });
        hip(iso, o, [0.4, 0.4], 0.22, 0.2, 16, 8, roof(v));
      },
    },
    {
      p: [0.66, 0.58],
      draw: () => {
        block(iso, o, [0.66, 0.58], 0.14, 0.16, 0, 9, wall(v + 1), { tall: 0.6, glazed: 0.6 });
        hip(iso, o, [0.66, 0.58], 0.14, 0.16, 9, 6, roof(v));
        door(iso, o, [0.66, 0.58], 0.14, 0.16);
      },
    },
  ]);
};

/** Modern: a white ground floor with wide glazing, a timber-finned upper floor, a roof garden. */
const modern: Design = (iso, o) => {
  shadow(iso, o, [0.5, 0.46], 0.32, 0.24, 20);
  block(iso, o, [0.5, 0.46], 0.32, 0.24, 0, 8.5, '#f6f2ea', { floorH: 8.5, bay: 0.22, glazed: 0.78, tall: 0.7 }, '#f6f2ea');
  prism(iso, o, [0.44, 0.42], rect(0.24, 0.2), 8.5, 17, finGlass({ tint: LOW.glass, fin: LOW.timber, floorH: 8.5, bay: 0.06, finShare: 0.45 }), null);
  flatRoof(iso, o, [0.44, 0.42], 0.24, 0.2, 17, '#f6f2ea');
  door(iso, o, [0.5, 0.46], 0.32, 0.24, 0.75);
};

/** Gable end to the street, and a flat-roofed garage at its side. */
const withGarage: Design = (iso, o, v) => {
  shadow(iso, o, [0.5, 0.44], 0.32, 0.24, 26);
  inOrder(o, [
    {
      p: [0.42, 0.42],
      draw: () => {
        block(iso, o, [0.42, 0.42], 0.2, 0.24, 0, 16, wall(v + 2), { shutter: shutter(v + 2) });
        gable(iso, o, [0.42, 0.42], 0.2, 0.24, 16, 10, roof(v + 1), wall(v + 2), 'v');
        door(iso, o, [0.42, 0.42], 0.2, 0.24);
      },
    },
    {
      p: [0.74, 0.5],
      draw: () => {
        block(iso, o, [0.74, 0.5], 0.11, 0.16, 0, 7.5, wall(v + 2), { bay: 0.3, glazed: 0.01 });
        flatRoof(iso, o, [0.74, 0.5], 0.11, 0.16, 7.5, wall(v + 2), '#a69a88');
      },
    },
  ]);
};

const DESIGNS: readonly Design[] = [twoStorey, hippedEll, modern, withGarage];
export const FAMILY_HOUSE_VARIANTS = 8;
export const FAMILY_HOUSE_TOP = 40;

export function paintFamilyHouse(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = garden(iso, o, [0.5, 0.72], [[0.14, 0.18], [0.86, 0.84]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
