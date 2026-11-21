import type { IsoFrame, Orient, Rng } from '../core';
import { plaza } from '../landmarks/plaza';
import { prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { panel, sideRef } from '../modern/sides';
import { solid } from '../modern/skins';
import { block, flatRoof, hip, inOrder, LOW, pick, shadow, sign, type Design } from './kit';

/**
 * Fire Station (1×1): red brick with two tall engine doors on the front and a hose-drying tower
 * (D-110).
 */

const C: Pt = [0.46, 0.46];
const HW = 0.3;
const HD = 0.3;
const TOWER_AT: Pt = [0.82, 0.24];

/** The engine bay doors, if the front faces the camera. */
function bayDoors(iso: IsoFrame, o: Orient) {
  const s = sideRef(o, C, HW, HD, 'front');
  if (!s) return;
  for (const a of [0.3, 0.7]) {
    panel(iso, s, a - 0.17, a + 0.17, 0, 9, '#8f2a22');
    panel(iso, s, a - 0.15, a + 0.15, 4, 8.6, 'rgba(255, 236, 200, 0.35)');
  }
}

const brick: Design = (iso, o, v) => {
  shadow(iso, o, C, HW, HD, 26);
  inOrder(o, [
    {
      p: C,
      draw: () => {
        block(iso, o, C, HW, HD, 0, 18, '#b5493b', { bay: 0.15, glazed: 0.5, tall: 0.5 });
        if (v % 2 === 0) flatRoof(iso, o, C, HW, HD, 18, '#a03f33', '#a69a88');
        else hip(iso, o, C, HW, HD, 18, 7, pick(LOW.roofs, v));
        bayDoors(iso, o);
        sign(iso, o, C, HW, HD, 14, 'FIRE', '#ff8a5a', 2.4);
      },
    },
    {
      p: TOWER_AT,
      draw: () => {
        prism(iso, o, TOWER_AT, rect(0.07, 0.07), 0, 34, solid('#b5493b'));
        prism(iso, o, TOWER_AT, rect(0.09, 0.09), 34, 36, solid('#ece1cb'));
      },
    },
  ]);
};

const DESIGNS: readonly Design[] = [brick];
export const FIRE_VARIANTS = 2;
export const FIRE_TOP = 44;

export function paintFireStation(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  plaza(iso, o, '#e6e1d6', 0.25);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  void rng;
}
