import type { IsoFrame, Orient, Rng } from '../core';
import { prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { solid } from '../modern/skins';
import { finGlass } from '../modern/towerSkins';
import { TOWER } from '../towers/skyscraper';
import { block, door, flatRoof, forecourt, shadow, type Design } from './kit';

/**
 * Small Office (1×1, level 2): the mid-rise offices that fill downtown before towers replace
 * them (D-108). A glass lobby floor under stone, brick, bronze or ochre floors.
 */

const C: Pt = [0.5, 0.5];
/** The planted terrace on a setback. */
const LOW_TERRACE = '#86b866';

/** A glazed ground floor (lobby or shop) under the walls. */
function lobby(iso: IsoFrame, o: Orient, hw: number, hd: number, frame: string) {
  prism(iso, o, C, rect(hw, hd), 0, 7, finGlass({ tint: TOWER.lobby, fin: frame, floorH: 7, bay: 0.14, finShare: 0.3 }), null);
}

const stone: Design = (iso, o) => {
  shadow(iso, o, C, 0.34, 0.32, 48);
  lobby(iso, o, 0.34, 0.32, TOWER.limestone);
  block(iso, o, C, 0.34, 0.32, 7, 46, TOWER.limestone, { floorH: 7, bay: 0.12, glazed: 0.6, tall: 0.64 });
  flatRoof(iso, o, C, 0.34, 0.32, 46, TOWER.limestone, '#a69a88');
  prism(iso, o, [0.42, 0.42], rect(0.12, 0.1), 47.6, 52, solid('#cfc6b8'));
  door(iso, o, C, 0.34, 0.32);
};

const bronze: Design = (iso, o) => {
  shadow(iso, o, C, 0.33, 0.3, 44);
  prism(iso, o, C, rect(0.36, 0.33), 0, 5, solid(TOWER.sandstone));
  prism(iso, o, C, rect(0.33, 0.3), 5, 44, finGlass({ tint: TOWER.bronzeGlass, fin: TOWER.bronze, floorH: 7, bay: 0.11 }), null);
  flatRoof(iso, o, C, 0.33, 0.3, 44, TOWER.bronze);
  door(iso, o, C, 0.36, 0.33);
};

const brickLoft: Design = (iso, o) => {
  shadow(iso, o, C, 0.35, 0.32, 42);
  lobby(iso, o, 0.35, 0.32, '#a85a42');
  block(iso, o, C, 0.35, 0.32, 7, 40, '#b5654a', { floorH: 8, bay: 0.15, glazed: 0.66, tall: 0.68 });
  flatRoof(iso, o, C, 0.35, 0.32, 40, '#a85a42');
  door(iso, o, C, 0.35, 0.32);
};

const ochreGlassTop: Design = (iso, o) => {
  shadow(iso, o, C, 0.36, 0.32, 46);
  lobby(iso, o, 0.36, 0.32, '#d9a86c');
  block(iso, o, C, 0.36, 0.32, 7, 28, '#d9a86c', { floorH: 7, bay: 0.14, glazed: 0.58 }, LOW_TERRACE);
  prism(iso, o, [0.46, 0.46], rect(0.27, 0.24), 28, 44, finGlass({ tint: TOWER.darkGlass, fin: '#d9a86c', floorH: 8, bay: 0.1 }), null);
  flatRoof(iso, o, [0.46, 0.46], 0.27, 0.24, 44, '#cfa067');
  door(iso, o, C, 0.36, 0.32);
};

const DESIGNS: readonly Design[] = [stone, bronze, brickLoft, ochreGlassTop];
export const SMALL_OFFICE_VARIANTS = DESIGNS.length;
export const SMALL_OFFICE_TOP = 64;

export function paintSmallOffice(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = forecourt(iso, o, [[0.12, 0.88]], variant);
  DESIGNS[variant % DESIGNS.length](iso, o, variant);
  lot.front();
  void rng;
}
