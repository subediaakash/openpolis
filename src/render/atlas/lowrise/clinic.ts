import type { IsoFrame, Orient, Rng } from '../core';
import type { Pt } from '../modern/plans';
import { block, door, flatRoof, garden, hip, LOW, pick, redCross, shadow, type Design } from './kit';

/**
 * Clinic (1×1): a bright two-storey surgery in a small garden, a red cross on its wall (D-110).
 */

const C: Pt = [0.5, 0.44];

const flat: Design = (iso, o) => {
  shadow(iso, o, C, 0.32, 0.24, 18);
  block(iso, o, C, 0.32, 0.24, 0, 16, '#f6f2ea', { bay: 0.15, glazed: 0.62, tall: 0.6 });
  flatRoof(iso, o, C, 0.32, 0.24, 16, '#f6f2ea', LOW.garden);
  door(iso, o, C, 0.32, 0.24, 0.3);
  redCross(iso, o, C, 0.32, 0.24, 11);
};

const hipped: Design = (iso, o, v) => {
  shadow(iso, o, C, 0.3, 0.24, 22);
  block(iso, o, C, 0.3, 0.24, 0, 16, '#f3ece0', { bay: 0.15, shutter: '#2f6b5e' });
  hip(iso, o, C, 0.3, 0.24, 16, 7, pick(LOW.roofs, v));
  door(iso, o, C, 0.3, 0.24, 0.3);
  redCross(iso, o, C, 0.3, 0.24, 11);
};

const DESIGNS: readonly Design[] = [flat, hipped];
export const CLINIC_VARIANTS = 4;
export const CLINIC_TOP = 32;

export function paintClinic(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = garden(iso, o, [0.35, 0.68], [[0.85, 0.85]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
