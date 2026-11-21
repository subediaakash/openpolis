import type { IsoFrame, Orient, Rng } from '../core';
import type { Pt } from '../modern/plans';
import { balcony, block, door, flatRoof, forecourt, hip, inOrder, LOW, pick, shadow, type Design } from './kit';

/**
 * Apartment Block (2×2, level 3): five- and six-storey housing round gardens (D-108): a long bar
 * under a clay roof with balconies, an L of two wings with roof gardens, and a courtyard block.
 */

const wall = (v: number) => pick(LOW.aptWalls, v * 3 + 1);
const FLOORS = 6;
const H = FLOORS * 8;

const bar: Design = (iso, o, v) => {
  const p: Pt = [1, 0.82];
  shadow(iso, o, p, 0.82, 0.36, H + 10);
  block(iso, o, p, 0.82, 0.36, 0, H, wall(v), { bay: 0.15, shutter: pick(LOW.shutters, v) });
  hip(iso, o, p, 0.82, 0.36, H, 10, pick(LOW.roofs, v));
  for (let k = 1; k < FLOORS; k++) balcony(iso, o, p, 0.82, 0.36, k * 8, 0.1, 0.9);
  door(iso, o, p, 0.82, 0.36);
};

const ell: Design = (iso, o, v) => {
  shadow(iso, o, [1, 1], 0.8, 0.8, H);
  const wing = (p: Pt, hw: number, hd: number, h: number) => ({
    p,
    draw: () => {
      block(iso, o, p, hw, hd, 0, h, wall(v + 1), { bay: 0.15, glazed: 0.55, tall: 0.6 });
      flatRoof(iso, o, p, hw, hd, h, wall(v + 1));
      door(iso, o, p, hw, hd);
    },
  });
  inOrder(o, [wing([1, 0.52], 0.82, 0.3, H), wing([0.5, 1.3], 0.3, 0.48, H - 16)]);
};

const court: Design = (iso, o, v) => {
  shadow(iso, o, [1, 1], 0.82, 0.82, H - 8);
  const roof = pick(LOW.roofs, v + 1);
  const wing = (p: Pt, hw: number, hd: number) => ({
    p,
    draw: () => {
      block(iso, o, p, hw, hd, 0, H - 8, wall(v + 2), { bay: 0.15, shutter: pick(LOW.shutters, v + 2) });
      hip(iso, o, p, hw, hd, H - 8, 8, roof);
    },
  });
  inOrder(o, [wing([1, 0.36], 0.82, 0.2), wing([0.36, 1.1], 0.2, 0.54), wing([1.64, 1.1], 0.2, 0.54), wing([1, 1.62], 0.44, 0.2)]);
  door(iso, o, [1, 1.62], 0.44, 0.2);
};

const DESIGNS: readonly Design[] = [bar, ell, court];
export const APARTMENT_BLOCK_VARIANTS = 6;
export const APARTMENT_BLOCK_TOP = 72;

export function paintApartmentBlock(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = forecourt(iso, o, [[0.18, 1.82], [1.82, 1.82]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
