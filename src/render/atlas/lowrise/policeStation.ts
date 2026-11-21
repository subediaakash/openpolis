import type { IsoFrame, Orient, Rng } from '../core';
import { van } from '../modern/props';
import { prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { solid } from '../modern/skins';
import { plaza } from '../landmarks/plaza';
import { around, block, flatRoof, hip, LOW, pick, shadow, sign, type Design } from './kit';

/**
 * Police Station (1×1): a stone station with a navy band and its sign, patrol cars parked in
 * front (D-110).
 */

const C: Pt = [0.5, 0.38];
const NAVY = '#24406b';

const stone: Design = (iso, o) => {
  shadow(iso, o, C, 0.34, 0.24, 20);
  block(iso, o, C, 0.34, 0.24, 0, 16, '#ece1cb', { bay: 0.15, glazed: 0.55, tall: 0.6 });
  prism(iso, o, C, rect(0.345, 0.245), 7, 9, solid(NAVY), null);
  flatRoof(iso, o, C, 0.34, 0.24, 16, '#ece1cb', '#a69a88');
  sign(iso, o, C, 0.34, 0.24, 12.5, 'POLICE', '#5a9fd0', 2.4);
};

const hipped: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.32, 0.24, 24);
  block(iso, o, C, 0.32, 0.24, 0, 16, '#e3d3b6', { bay: 0.15, shutter: NAVY });
  hip(iso, o, C, 0.32, 0.24, 16, 7, pick(LOW.roofs, v));
  sign(iso, o, C, 0.32, 0.24, 8, 'POLICE', '#5a9fd0', 2.4);
};

const DESIGNS: readonly Design[] = [stone, hipped];
export const POLICE_VARIANTS = 4;
export const POLICE_TOP = 34;

export function paintPoliceStation(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  plaza(iso, o, '#e6e1d6', 0.25);
  const cars = [van(iso, o, 0.28, 0.82, true, NAVY), van(iso, o, 0.7, 0.82, true, '#f2f2ee')];
  around(o, C, cars, () => DESIGNS[variant % DESIGNS.length](iso, o, variant));
  void rng;
}
