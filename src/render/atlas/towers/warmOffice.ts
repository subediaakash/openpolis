import type { IsoFrame, Orient, Rng } from '../core';
import { loft, planShadow, prism, sweep } from '../modern/loft';
import { spire } from '../modern/parts';
import { chamfered, rect, superellipse, type Pt } from '../modern/plans';
import { at } from '../civic/lot';
import { solid } from '../modern/skins';
import { finGlass, stoneGrid } from '../modern/towerSkins';
import { towerLot } from './lot';
import { entrance, lantern, podium, TOWER } from './skyscraper';

/**
 * Office towers in warm materials (D-108, Terracotta theme): what a thriving office block grows
 * into downtown. Each is a base, a shaft and a crown (towers/skyscraper.ts).
 */

const C: Pt = [1, 1];
const LOT = (o: Orient) => ({ u0: 0, u1: o.vw, v0: 0, v1: o.vh });

type Design = (iso: IsoFrame, o: Orient) => void;

/** Bronze Spire: dark bronze glass between bronze fins, two setbacks, a lantern and a spire. */
const bronzeSpire: Design = (iso, o) => {
  const H = 178;
  planShadow(iso, o, C, rect(0.62, 0.62), H, LOT(o));
  podium(iso, o, C, chamfered(0.84, 0.84, 0.2), 16);
  entrance(iso, o, C, 0.84, 0.84);
  const skin = finGlass({ tint: TOWER.bronzeGlass, fin: TOWER.bronze, floorH: 7, bay: 0.13 });
  prism(iso, o, C, chamfered(0.6, 0.6, 0.15), 16, 120, skin, TOWER.bronze);
  prism(iso, o, C, chamfered(0.5, 0.5, 0.13), 120, 160, skin, TOWER.bronze);
  lantern(iso, o, C, chamfered(0.4, 0.4, 0.11), 160, 12);
  prism(iso, o, C, chamfered(0.42, 0.42, 0.11), 172, 174, solid(TOWER.bronze));
  spire(iso, o, C, 174, 34, 0.05, '#d8c7a6');
};

/** Limestone Deco: a stepped stone tower of recessed windows, crowned in gold light. */
const limestoneDeco: Design = (iso, o) => {
  const H = 196;
  planShadow(iso, o, C, rect(0.66, 0.66), H, LOT(o));
  podium(iso, o, C, rect(0.84, 0.84), 18, TOWER.sandstone);
  entrance(iso, o, C, 0.84, 0.84);
  const stone = (s: string) => stoneGrid({ stone: s, glass: TOWER.darkGlass, floorH: 7, bay: 0.13, glazed: 0.55, tall: 0.7 });
  prism(iso, o, C, rect(0.64, 0.64), 18, 128, stone(TOWER.limestone), TOWER.limestone);
  prism(iso, o, C, rect(0.53, 0.53), 128, 162, stone(TOWER.limestone), TOWER.limestone);
  prism(iso, o, C, rect(0.42, 0.42), 162, 186, stone(TOWER.limestone), TOWER.limestone);
  lantern(iso, o, C, rect(0.3, 0.3), 186, 10, '#c9a25e');
  spire(iso, o, C, 196, 22, 0.05, '#e0c690');
};

/** Terracotta Fins: dark glass behind terracotta fins, a sky garden halfway up, a roof garden on top. */
const terracottaFins: Design = (iso, o) => {
  const H = 170;
  const body = superellipse(0.62, 0.58, 5, 28);
  planShadow(iso, o, C, rect(0.64, 0.6), H, LOT(o));
  podium(iso, o, C, superellipse(0.86, 0.82, 5, 28), 13);
  entrance(iso, o, C, 0.8, 0.8);
  const skin = finGlass({ tint: TOWER.darkGlass, fin: TOWER.terracotta, floorH: 7, bay: 0.11, finShare: 0.3 });
  prism(iso, o, C, body, 13, 92, skin, TOWER.terracotta);
  // The sky garden: a recessed glass floor with a planted edge.
  prism(iso, o, C, superellipse(0.52, 0.48, 5, 28), 92, 100, finGlass({ tint: '#6f8d8a', fin: TOWER.limestone, floorH: 8, bay: 0.16 }), null);
  prism(iso, o, C, superellipse(0.64, 0.6, 5, 28), 100, 101.5, solid(TOWER.garden));
  prism(iso, o, C, body, 101.5, H, skin, TOWER.terracotta);
  prism(iso, o, C, superellipse(0.56, 0.52, 5, 28), H, H + 2, solid(TOWER.limestone), TOWER.garden);
};

/** Twin Bronze: two slender towers on one podium, joined high up by a glass sky bridge. */
const twinBronze: Design = (iso, o) => {
  const a: Pt = [0.62, 1.38];
  const b: Pt = [1.38, 0.62];
  planShadow(iso, o, C, rect(0.72, 0.72), 182, LOT(o));
  podium(iso, o, C, rect(0.86, 0.86), 14, TOWER.sandstone);
  entrance(iso, o, C, 0.86, 0.86);
  const skin = finGlass({ tint: TOWER.bronzeGlass, fin: TOWER.bronze, floorH: 7, bay: 0.12 });
  const plan = chamfered(0.3, 0.3, 0.08);
  const [far, near] = [a, b].sort((p, q) => at(o, p[0], p[1]).depth - at(o, q[0], q[1]).depth);
  const tall = (p: Pt) => (p === a ? 182 : 156);
  prism(iso, o, far, plan, 14, tall(far), skin, TOWER.bronze);
  lantern(iso, o, far, chamfered(0.22, 0.22, 0.06), tall(far), 8);
  // The sky bridge between them.
  prism(iso, o, C, rect(0.46, 0.12), 120, 128, finGlass({ tint: '#7e8f8c', fin: TOWER.bronze, floorH: 8, bay: 0.12 }), TOWER.bronze);
  prism(iso, o, near, plan, 14, tall(near), skin, TOWER.bronze);
  lantern(iso, o, near, chamfered(0.22, 0.22, 0.06), tall(near), 8);
};

/** Copper Wedge: a tower that tapers as it rises, copper fins over dark glass, a slim spire. */
const copperWedge: Design = (iso, o) => {
  const H = 188;
  planShadow(iso, o, C, rect(0.62, 0.62), H, LOT(o));
  podium(iso, o, C, chamfered(0.84, 0.84, 0.16), 15);
  entrance(iso, o, C, 0.84, 0.84);
  const skin = finGlass({ tint: TOWER.darkGlass, fin: '#b87a4a', floorH: 7, bay: 0.12, finShare: 0.26 });
  loft(iso, o, sweep(15, H, 6, C, (t) => chamfered(0.62 - 0.24 * t, 0.6 - 0.24 * t, 0.12 - 0.04 * t)), skin, '#b87a4a');
  spire(iso, o, C, H, 30, 0.05, '#d9b48a');
};

/** Ochre Bands: wide windows in warm ochre stone, a mechanical screen and a roof garden. */
const ochreBands: Design = (iso, o) => {
  const H = 158;
  planShadow(iso, o, C, rect(0.64, 0.64), H, LOT(o));
  podium(iso, o, C, rect(0.84, 0.84), 16);
  entrance(iso, o, C, 0.84, 0.84);
  const skin = stoneGrid({ stone: '#d9a86c', glass: TOWER.darkGlass, floorH: 7, bay: 0.2, glazed: 0.84, tall: 0.58 });
  prism(iso, o, C, rect(0.62, 0.62), 16, H, skin, '#cfa067');
  // A roof garden, and a screen of bronze fins hiding the plant at its back corner.
  prism(iso, o, C, rect(0.6, 0.6), H, H + 1, solid(TOWER.limestone), TOWER.garden);
  prism(iso, o, [0.86, 0.86], rect(0.3, 0.3), H + 1, H + 10, finGlass({ tint: '#2c2a26', fin: TOWER.bronze, floorH: 9, bay: 0.06, finShare: 0.6 }), TOWER.bronze);
};

const DESIGNS: readonly Design[] = [bronzeSpire, limestoneDeco, terracottaFins, twinBronze, copperWedge, ochreBands];
export const WARM_OFFICE_VARIANTS = DESIGNS.length;
export const WARM_OFFICE_TOP = 240;

export function paintWarmOffice(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const lot = towerLot(iso, o, variant);
  DESIGNS[variant % DESIGNS.length](iso, o);
  lot.front();
  void rng;
}
