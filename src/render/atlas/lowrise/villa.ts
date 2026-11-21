import type { IsoFrame, Orient, Rng } from '../core';
import { at, drawItems } from '../civic/lot';
import { palm, pool } from '../landmarks/plaza';
import { prism } from '../modern/loft';
import { rect } from '../modern/plans';
import { finGlass } from '../modern/towerSkins';
import { block, door, flatRoof, garden, hip, inOrder, LOW, pick, shadow, type Design } from './kit';

/**
 * Villa (2×2, level 2): a house in its own grounds with a pool (D-108): a Mediterranean villa of
 * hipped clay roofs, a modern white villa with a timber upper floor, and a courtyard villa.
 */

const wall = (v: number) => pick(LOW.homeWalls, v * 5);
const roof = (v: number) => pick(LOW.roofs, v);

const mediterranean: Design = (iso, o, v) => {
  shadow(iso, o, [0.9, 0.8], 0.6, 0.4, 26);
  inOrder(o, [
    {
      p: [0.85, 0.75],
      draw: () => {
        block(iso, o, [0.85, 0.75], 0.5, 0.32, 0, 16, wall(v), { bay: 0.18, shutter: pick(LOW.shutters, v) });
        hip(iso, o, [0.85, 0.75], 0.5, 0.32, 16, 9, roof(v));
        door(iso, o, [0.85, 0.75], 0.5, 0.32, 0.35);
      },
    },
    {
      p: [1.45, 0.95],
      draw: () => {
        block(iso, o, [1.45, 0.95], 0.2, 0.3, 0, 9, wall(v), { bay: 0.2, tall: 0.6, glazed: 0.6 });
        hip(iso, o, [1.45, 0.95], 0.2, 0.3, 9, 6, roof(v));
      },
    },
  ]);
};

const modernWhite: Design = (iso, o) => {
  shadow(iso, o, [0.9, 0.8], 0.6, 0.38, 20);
  block(iso, o, [0.9, 0.8], 0.6, 0.36, 0, 9, '#f6f2ea', { floorH: 9, bay: 0.24, glazed: 0.8, tall: 0.72 }, '#f6f2ea');
  prism(iso, o, [0.75, 0.72], rect(0.36, 0.26), 9, 18, finGlass({ tint: LOW.glass, fin: LOW.timber, floorH: 9, bay: 0.07, finShare: 0.45 }), null);
  flatRoof(iso, o, [0.75, 0.72], 0.36, 0.26, 18, '#f6f2ea');
  door(iso, o, [0.9, 0.8], 0.6, 0.36, 0.7);
};

const courtyard: Design = (iso, o, v) => {
  shadow(iso, o, [0.9, 0.8], 0.6, 0.45, 24);
  const wing = (p: readonly [number, number], hw: number, hd: number) => ({
    p,
    draw: () => {
      block(iso, o, p, hw, hd, 0, 14, wall(v + 1), { bay: 0.18, shutter: pick(LOW.shutters, v + 1) });
      hip(iso, o, p, hw, hd, 14, 7, roof(v + 1));
    },
  });
  inOrder(o, [wing([0.9, 0.45], 0.6, 0.14), wing([0.42, 0.85], 0.12, 0.3), wing([1.38, 0.85], 0.12, 0.3)]);
};

const DESIGNS: readonly Design[] = [mediterranean, modernWhite, courtyard];
export const VILLA_VARIANTS = 6;
export const VILLA_TOP = 46;

export function paintVilla(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = garden(iso, o, [0.9, 1.15], [[0.2, 0.2], [1.82, 0.22]], variant);
  pool(iso, o, { u0: 1.2, u1: 1.75, v0: 1.4, v1: 1.75 });
  // Palms behind the house first, the rest after it (by depth, in any rotation).
  const palms = [palm(iso, o, 0.25, 1.75, 15), palm(iso, o, 1.88, 1.2, 13, -1)];
  const middle = at(o, 1, 1).depth;
  drawItems(palms.filter((p) => p.depth < middle));
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  drawItems(palms.filter((p) => p.depth >= middle));
  lot.front();
  void rng;
}
