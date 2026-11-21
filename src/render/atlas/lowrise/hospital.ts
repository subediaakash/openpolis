import type { IsoFrame, Orient, Rng } from '../core';
import { localFloor } from '../civic/kit';
import { prism } from '../modern/loft';
import { van } from '../modern/props';
import { rect, type Pt } from '../modern/plans';
import { solid } from '../modern/skins';
import { finGlass } from '../modern/towerSkins';
import { TOWER } from '../towers/skyscraper';
import { around, block, door, flatRoof, inOrder, redCross, shadow, sign, type Design } from './kit';
import { plaza } from '../landmarks/plaza';

/**
 * Hospital (3×2): a six-storey ward block in cream render with a glazed entrance wing, a red
 * cross, a helipad on the roof and ambulances at the door (D-110).
 */

const WARD: Pt = [1.5, 0.62];
const ENTRY: Pt = [1.05, 1.3];
const H = 48;

function helipad(iso: IsoFrame, o: Orient) {
  localFloor(iso, o, { u0: 1.75, u1: 2.35, v0: 0.36, v1: 0.88 }, H + 1.7, '#4a4f56');
  localFloor(iso, o, { u0: 1.82, u1: 2.28, v0: 0.42, v1: 0.82 }, H + 1.8, '#d9b44a');
  localFloor(iso, o, { u0: 1.86, u1: 2.24, v0: 0.46, v1: 0.78 }, H + 1.9, '#4a4f56');
}

const wards: Design = (iso, o) => {
  shadow(iso, o, WARD, 1.3, 0.44, H);
  inOrder(o, [
    {
      p: WARD,
      draw: () => {
        block(iso, o, WARD, 1.3, 0.44, 0, H, '#f3ece0', { bay: 0.14, glazed: 0.64, tall: 0.6 });
        prism(iso, o, WARD, rect(1.305, 0.445), H - 9, H - 7, solid('#2f6b5e'), null);
        flatRoof(iso, o, WARD, 1.3, 0.44, H, '#e6dccb', '#a69a88');
        helipad(iso, o);
        redCross(iso, o, WARD, 1.3, 0.44, H - 16, 0.16);
        sign(iso, o, WARD, 1.3, 0.44, H - 4, 'HOSPITAL', '#ff8a7a', 3);
      },
    },
    {
      p: ENTRY,
      draw: () => {
        prism(iso, o, ENTRY, rect(0.6, 0.24), 0, 12, finGlass({ tint: TOWER.lobby, fin: '#efe3cc', floorH: 6, bay: 0.14, finShare: 0.28 }), null);
        flatRoof(iso, o, ENTRY, 0.6, 0.24, 12, '#efe3cc', '#7cb35c');
        door(iso, o, ENTRY, 0.6, 0.24);
      },
    },
  ]);
};

const DESIGNS: readonly Design[] = [wards];
export const HOSPITAL_VARIANTS = 2;
export const HOSPITAL_TOP = 72;

export function paintHospital(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  plaza(iso, o, '#e6e1d6', 0.25);
  const ambulances = [van(iso, o, 2.1, 1.5, true, '#f4f4f0'), van(iso, o, 2.55, 1.5, true, '#f4f4f0')];
  around(o, WARD, ambulances, () => DESIGNS[variant % DESIGNS.length](iso, o, variant));
  void rng;
}
