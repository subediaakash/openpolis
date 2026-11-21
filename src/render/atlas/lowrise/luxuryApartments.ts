import type { IsoFrame, Orient, Rng } from '../core';
import { prism } from '../modern/loft';
import { rect, superellipse, type Pt } from '../modern/plans';
import { solid } from '../modern/skins';
import { finGlass } from '../modern/towerSkins';
import { TOWER } from '../towers/skyscraper';
import { block, door, flatRoof, forecourt, LOW, shadow, wallSkin, type Design } from './kit';

/**
 * Luxury Apartments (2×2, level 3): terraced and garden-wrapped homes (D-108): stepped planted
 * terraces in cream stone, a curved block with terracotta balconies, and bronze-finned glass.
 */

const C: Pt = [1, 1];

const steppedGardens: Design = (iso, o) => {
  shadow(iso, o, C, 0.76, 0.7, 72);
  const tiers: readonly [number, number, number, number][] = [
    [0, 24, 0.78, 0.7],
    [24, 46, 0.64, 0.56],
    [46, 64, 0.5, 0.42],
  ];
  for (const [z0, z1, hw, hd] of tiers) block(iso, o, [1, 1 - (0.7 - hd) * 0.6], hw, hd, z0, z1, '#efe5d2', { bay: 0.16, glazed: 0.66, tall: 0.62 }, LOW.garden);
  door(iso, o, [1, 1], 0.78, 0.7);
};

const curvedBalconies: Design = (iso, o) => {
  shadow(iso, o, C, 0.7, 0.45, 64);
  const body = superellipse(0.7, 0.42, 3, 28);
  for (let k = 0; k < 8; k++) {
    const z = k * 8;
    prism(iso, o, [1, 0.95], body, z, z + 6.8, wallSkin('#f3e9d6', { bay: 0.14, glazed: 0.68, tall: 0.62 }), null);
    prism(iso, o, [1, 0.95], superellipse(0.77, 0.49, 3, 28), z + 6.8, z + 8, solid(TOWER.terracotta), k === 7 ? LOW.garden : TOWER.terracotta);
  }
};

const bronzeGlass: Design = (iso, o) => {
  shadow(iso, o, C, 0.66, 0.6, 70);
  prism(iso, o, C, rect(0.7, 0.62), 0, 6, solid(TOWER.sandstone));
  prism(iso, o, C, rect(0.66, 0.58), 6, 64, finGlass({ tint: TOWER.bronzeGlass, fin: TOWER.bronze, floorH: 8, bay: 0.13, finShare: 0.28 }), null);
  flatRoof(iso, o, C, 0.66, 0.58, 64, TOWER.bronze);
  prism(iso, o, [0.9, 0.9], rect(0.3, 0.26), 65.6, 72, finGlass({ tint: '#c9935a', fin: TOWER.bronze, floorH: 6.4, bay: 0.08, finShare: 0.35 }), TOWER.bronze);
  door(iso, o, C, 0.7, 0.62);
};

const DESIGNS: readonly Design[] = [steppedGardens, curvedBalconies, bronzeGlass];
export const LUXURY_APARTMENTS_VARIANTS = 6;
export const LUXURY_APARTMENTS_TOP = 92;

export function paintLuxuryApartments(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = forecourt(iso, o, [[0.16, 1.84], [1.84, 1.84], [1.84, 0.16]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
