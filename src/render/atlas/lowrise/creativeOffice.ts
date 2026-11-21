import type { IsoFrame, Orient, Rng } from '../core';
import { prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { sawtooth } from '../modern/sawtooth';
import { finGlass } from '../modern/towerSkins';
import { TOWER } from '../towers/skyscraper';
import { block, door, flatRoof, forecourt, LOW, shadow, type Design } from './kit';

/**
 * Creative Office (1×1, level 2): studios and converted warehouses (D-108). Brick under a
 * sawtooth roof, timber fins, a terracotta-finned cube and a stepped studio with a terrace.
 */

const C: Pt = [0.5, 0.5];

const warehouse: Design = (iso, o) => {
  shadow(iso, o, C, 0.38, 0.34, 28);
  block(iso, o, C, 0.38, 0.34, 0, 22, '#a85a42', { floorH: 11, bay: 0.18, glazed: 0.7, tall: 0.7 });
  sawtooth(iso, o, { u0: 0.12, u1: 0.88, v0: 0.16, v1: 0.84 }, 22, 6, 3, '#7a6a5c', '#5d7a86');
  door(iso, o, C, 0.38, 0.34);
};

const timberStudio: Design = (iso, o) => {
  shadow(iso, o, C, 0.36, 0.3, 32);
  prism(iso, o, C, rect(0.36, 0.3), 0, 30, finGlass({ tint: TOWER.darkGlass, fin: LOW.timber, floorH: 10, bay: 0.07, finShare: 0.4 }), null);
  flatRoof(iso, o, C, 0.36, 0.3, 30, LOW.timber);
  door(iso, o, C, 0.36, 0.3);
};

const terracottaCube: Design = (iso, o) => {
  shadow(iso, o, C, 0.35, 0.35, 38);
  prism(iso, o, C, rect(0.35, 0.35), 0, 38, finGlass({ tint: TOWER.darkGlass, fin: TOWER.terracotta, floorH: 9.5, bay: 0.1, finShare: 0.32 }), null);
  flatRoof(iso, o, C, 0.35, 0.35, 38, TOWER.terracotta);
  door(iso, o, C, 0.35, 0.35);
};

const steppedStudio: Design = (iso, o) => {
  shadow(iso, o, C, 0.38, 0.34, 34);
  block(iso, o, C, 0.38, 0.34, 0, 20, '#efe3cc', { floorH: 10, bay: 0.16, glazed: 0.68, tall: 0.62 }, LOW.garden);
  block(iso, o, [0.44, 0.42], 0.28, 0.24, 20, 34, '#efe3cc', { floorH: 7, bay: 0.14, glazed: 0.7, tall: 0.6 });
  flatRoof(iso, o, [0.44, 0.42], 0.28, 0.24, 34, '#e6d8bf', '#a69a88');
  door(iso, o, C, 0.38, 0.34);
};

const DESIGNS: readonly Design[] = [warehouse, timberStudio, terracottaCube, steppedStudio];
export const CREATIVE_OFFICE_VARIANTS = DESIGNS.length;
export const CREATIVE_OFFICE_TOP = 52;

export function paintCreativeOffice(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = forecourt(iso, o, [[0.1, 0.9]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
