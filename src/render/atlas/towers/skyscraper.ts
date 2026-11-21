import type { IsoFrame, Orient } from '../core';
import { prism } from '../modern/loft';
import { lightRing } from '../modern/parts';
import { rect, type Plan, type Pt } from '../modern/plans';
import { panel, sideRef } from '../modern/sides';
import { solid } from '../modern/skins';
import { finGlass, stoneGrid } from '../modern/towerSkins';

/**
 * The skyscraper kit (D-108): every tower is a base, a shaft and a crown. The base (podium) gives
 * the scale cues a tower needs at street level: a stone plinth, a glass lobby and an entrance
 * canopy on the front. The crown ends the tower with a lit lantern or garden instead of a bare lid.
 */

/** Warm tower materials (Terracotta theme): limestone, bronze, terracotta and dark glass. */
export const TOWER = {
  limestone: '#e7dac2',
  sandstone: '#d9c29e',
  bronze: '#a9824f',
  terracotta: '#b4553a',
  darkGlass: '#2f3a42',
  bronzeGlass: '#3b342c',
  lobby: '#38434c',
  lantern: '#ffd98a',
  garden: '#7cb35c',
} as const;

/**
 * A stone podium with a glazed lobby floor: `plan` round `at`, from the ground to `h`. The lobby
 * takes the first 7 px; on the front, a recessed glass entrance and a bronze canopy.
 */
export function podium(iso: IsoFrame, o: Orient, at: Pt, plan: Plan, h: number, stone: string = TOWER.limestone) {
  const LOBBY = 7;
  prism(iso, o, at, plan, 0, LOBBY, finGlass({ tint: TOWER.lobby, fin: stone, floorH: LOBBY, bay: 0.2, finShare: 0.3 }), null);
  prism(iso, o, at, plan, LOBBY, h, stoneGrid({ stone, glass: TOWER.darkGlass, floorH: 6, bay: 0.16, glazed: 0.6 }), stone);
}

/** The entrance on the front of a rectangular base of half-size hw × hd: dark doors and a canopy. */
export function entrance(iso: IsoFrame, o: Orient, at: Pt, hw: number, hd: number) {
  // Only when the front faces the camera: from behind, the podium hides both.
  const s = sideRef(o, at, hw, hd, 'front');
  if (!s) return;
  panel(iso, s, 0.4, 0.6, 0, 5.5, '#1d2328');
  prism(iso, o, [at[0], at[1] + hd + 0.06], rect(0.2, 0.07), 6.2, 7.2, solid(TOWER.bronze));
}

/** A glowing glass lantern crowning a tower, ringed with lights at its rim. */
export function lantern(iso: IsoFrame, o: Orient, at: Pt, plan: Plan, z: number, h: number, frame: string = TOWER.bronze) {
  prism(iso, o, at, plan, z, z + h, finGlass({ tint: '#c9935a', fin: frame, floorH: h, bay: 0.08, finShare: 0.35 }), frame);
  lightRing(iso, o, at, plan, z + h - 0.6, TOWER.lantern);
  // The glow marks it as lit at night.
  const [u, v] = o.point(at[0], at[1]);
  const [x, y] = iso.p(u, v, z + h * 0.5);
  iso.mark('beacon', 'sw', x, y);
}
