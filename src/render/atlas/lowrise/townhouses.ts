import type { IsoFrame, Orient, Rng } from '../core';
import type { Pt } from '../modern/plans';
import { balcony, bed, block, door, flatRoof, gable, inOrder, LOW, pick, shadow, type Design } from './kit';
import { plaza } from '../landmarks/plaza';

/**
 * Townhouses (1×1, level 2): a terrace of three narrow houses, each its own colour from the
 * theme (D-108): gabled fronts, parapets with balconies, or stepped roof terraces.
 */

const UNITS: readonly number[] = [0.2, 0.5, 0.8];
const HW = 0.145;
const HD = 0.28;
const at = (u: number): Pt => [u, 0.44];

type Unit = (iso: IsoFrame, o: Orient, p: Pt, k: number, v: number) => void;

/** Three units drawn back to front, each by `unit`. */
const row = (unit: Unit, height: (k: number) => number): Design => (iso, o, v) => {
  shadow(iso, o, [0.5, 0.44], 0.44, HD, Math.max(...UNITS.map((_, k) => height(k))) + 6);
  inOrder(
    o,
    UNITS.map((u, k) => ({ p: at(u), draw: () => unit(iso, o, at(u), k, v) })),
  );
};

const wall = (k: number, v: number) => pick(LOW.homeWalls, k * 2 + v);

const gabledFronts = row(
  (iso, o, p, k, v) => {
    const h = 16 + (k % 2) * 4;
    block(iso, o, p, HW, HD, 0, h, wall(k, v), { bay: 0.13, shutter: pick(LOW.shutters, k + v) });
    gable(iso, o, p, HW, HD, h, 9, pick(LOW.roofs, k + v), wall(k, v), 'v');
    door(iso, o, p, HW, HD);
  },
  (k) => 25 + (k % 2) * 4,
);

const parapets = row(
  (iso, o, p, k, v) => {
    const h = 20 + ((k + 1) % 2) * 4;
    block(iso, o, p, HW, HD, 0, h, wall(k, v + 1), { bay: 0.13, tall: 0.6 });
    flatRoof(iso, o, p, HW, HD, h, wall(k, v + 1), '#a69a88');
    balcony(iso, o, p, HW, HD, 9, 0.2, 0.8);
    door(iso, o, p, HW, HD);
  },
  (k) => 24 + ((k + 1) % 2) * 4,
);

const terraces = row(
  (iso, o, p, k, v) => {
    const h = 14 + k * 4;
    block(iso, o, p, HW, HD, 0, h, wall(k, v + 2), { bay: 0.13, shutter: pick(LOW.shutters, k) }, LOW.garden);
    block(iso, o, [p[0], p[1] - 0.1], HW, HD - 0.1, h, h + 6, wall(k, v + 2), { bay: 0.13, glazed: 0.7, tall: 0.6 });
    flatRoof(iso, o, [p[0], p[1] - 0.1], HW, HD - 0.1, h + 6, wall(k, v + 2), '#a69a88');
    door(iso, o, p, HW, HD);
  },
  (k) => 21 + k * 4,
);

const DESIGNS: readonly Design[] = [gabledFronts, parapets, terraces];
export const TOWNHOUSES_VARIANTS = 6;
export const TOWNHOUSES_TOP = 44;

export function paintTownhouses(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  plaza(iso, o, '#e9e2d4', 0.25);
  bed(iso, o, { u0: 0.06, u1: 0.94, v0: 0.78, v1: 0.86 });
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  void rng;
}
