import type { IsoFrame, Orient, Rng } from '../core';
import { localFloor } from '../civic/kit';
import { plume, type SmokeSource } from '../civic/lot';
import { paintSmokestack, stackHeight } from '../buildings/lot/structures';
import { prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { sawtooth } from '../modern/sawtooth';
import { metal } from '../modern/skins';
import { block, inOrder, shadow, type Design } from './kit';

/**
 * Factory (2×2, level 3): brick works halls under sawtooth roofs, with tall chimneys whose smoke
 * the game animates (`factorySmoke`), and tanks in the yard (D-110).
 */

const HALL: Pt = [0.85, 0.8];
const HW = 0.68;
const HD = 0.56;
const WALL = 14;
/** Chimney spots (local) and the height of their tops. */
const STACKS: readonly Pt[] = [
  [1.68, 0.4],
  [1.68, 0.78],
];
const STACK_TOP = WALL + stackHeight(false);

/** A tank in the yard. */
const TANK: Pt = [1.66, 1.5];

/** Chimneys and the tank, drawn back to front with the hall. */
function yard(iso: IsoFrame, o: Orient, hall: () => void) {
  inOrder(o, [
    { p: HALL, draw: hall },
    ...STACKS.map((s) => ({ p: s, draw: () => paintSmokestack(iso, o.point(s[0], s[1]), WALL, false) })),
    { p: TANK, draw: () => prism(iso, o, TANK, rect(0.16, 0.16), 0, 16, metal('#d9d2c4'), '#c9c1b2') },
  ]);
}

const sawtoothHall: Design = (iso, o, v) => {
  shadow(iso, o, HALL, HW, HD, WALL + 8);
  yard(iso, o, () => {
    block(iso, o, HALL, HW, HD, 0, WALL, v % 2 === 0 ? '#b5654a' : '#a85a42', { floorH: WALL, bay: 0.2, glazed: 0.5, tall: 0.5 });
    sawtooth(iso, o, { u0: HALL[0] - HW, u1: HALL[0] + HW, v0: HALL[1] - HD, v1: HALL[1] + HD }, WALL, 8, 4, '#7a6a5c', '#5d7a86');
  });
};

const metalHall: Design = (iso, o) => {
  shadow(iso, o, HALL, HW, HD, WALL + 4);
  yard(iso, o, () => {
    prism(iso, o, HALL, rect(HW, HD), 0, WALL + 4, metal('#c99a5e'), '#9a9284');
  });
};

const DESIGNS: readonly Design[] = [sawtoothHall, metalHall];
export const FACTORY_VARIANTS = 4;
export const FACTORY_TOP = STACK_TOP + 10;

export function paintFactory(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  localFloor(iso, o, { u0: 0.02, u1: 1.98, v0: 0.02, v1: 1.98 }, 0, '#cfc8bb');
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  void rng;
}

/** Where the chimneys smoke (view space, at their tops). */
export function factorySmoke(o: Orient): SmokeSource[] {
  return STACKS.map(([u, v]) => plume(o, u, v, STACK_TOP, 'smoke'));
}
