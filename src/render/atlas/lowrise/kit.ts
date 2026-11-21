import type { IsoFrame, Orient } from '../core';
import { at, drawItems, type Item } from '../civic/lot';
import { lawn, localFloor, path, tree } from '../civic/kit';
import { plaza } from '../landmarks/plaza';
import { loft, planShadow, prism } from '../modern/loft';
import { rect, type Pt } from '../modern/plans';
import { panel, sideRef } from '../modern/sides';
import { solid } from '../modern/skins';
import { finGlass, roofed, stoneGrid, tiles } from '../modern/towerSkins';
import { nameBand } from '../modern/props';
import { GAME_PALETTE } from '../theme/buildingPalettes';

/**
 * The low-rise kit (D-108): homes and mid-rise offices in the Terracotta theme. Walls are render
 * or stone with deep windows (and shutters on homes), roofs are clay-tiled gables and hips or flat
 * with a parapet, and every lot is a garden or a paved forecourt with trees.
 */

const P = GAME_PALETTE.families;
/** Colours by family, picked by variant so neighbours differ. */
export const LOW = {
  homeWalls: P.homes.walls,
  aptWalls: P.apartments.walls,
  roofs: P.homes.roofs,
  shutters: ['#2f6b5e', '#6e4a36', '#3a5f8a', '#8a3b2e'],
  /** Awnings and signs for shops. */
  accents: P.shops.accents,
  glass: '#33414a',
  door: '#5a3a28',
  timber: '#a8784c',
  stone: '#ece1cb',
  slab: '#f6f1e6',
  garden: '#7cb35c',
} as const;

export const pick = <T>(list: readonly T[], k: number): T => list[((k % list.length) + list.length) % list.length];

/** The lot as a view box (for shadows). */
export const lotBox = (o: Orient) => ({ u0: 0, u1: o.vw, v0: 0, v1: o.vh });

export interface WallStyle {
  readonly floorH?: number;
  readonly bay?: number;
  readonly glazed?: number;
  readonly tall?: number;
  readonly shutter?: string;
}

/** Render walls with deep windows (and shutters if given). */
export const wallSkin = (wall: string, s: WallStyle = {}) =>
  stoneGrid({ stone: wall, glass: LOW.glass, floorH: s.floorH ?? 8, bay: s.bay ?? 0.17, glazed: s.glazed ?? 0.46, tall: s.tall ?? 0.56, shutter: s.shutter });

/** A rectangular block of walls from z0 to z1, half-size hw × hd round p, open at the top. */
export function block(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, z0: number, z1: number, wall: string, s: WallStyle = {}, top: string | null = null) {
  prism(iso, o, p, rect(hw, hd), z0, z1, wallSkin(wall, s), top);
}

/** A clay-tiled gable roof over a block, its ridge along local u (`ridge` 'u') or v. */
export function gable(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, z: number, rise: number, roof: string, wall: string, ridge: 'u' | 'v' = 'u') {
  const e = 0.05;
  const top = ridge === 'u' ? rect(hw + e, 0.004) : rect(0.004, hd + e);
  loft(iso, o, [{ z, plan: rect(hw + e, hd + e), at: p }, { z: z + rise, plan: top, at: p }], roofed(tiles(roof), solid(wall)), null);
}

/** A clay-tiled hipped roof: slopes on all four sides up to a short ridge. */
export function hip(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, z: number, rise: number, roof: string) {
  const e = 0.05;
  const ridge = hw >= hd ? rect(Math.max(0.01, hw - hd), 0.004) : rect(0.004, Math.max(0.01, hd - hw));
  loft(iso, o, [{ z, plan: rect(hw + e, hd + e), at: p }, { z: z + rise, plan: ridge, at: p }], roofed(tiles(roof), solid(roof)), null);
}

/** A flat roof with a low parapet and a garden or gravel top. */
export function flatRoof(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, z: number, wall: string, top: string = LOW.garden) {
  prism(iso, o, p, rect(hw + 0.015, hd + 0.015), z, z + 1.6, solid(wall), top);
}

/** A front door (and a step) on the front side of a block. */
export function door(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, a = 0.5, color: string = LOW.door) {
  const s = sideRef(o, p, hw, hd, 'front');
  if (!s) return;
  panel(iso, s, a - 0.09, a + 0.09, 0, 5.6, color);
  panel(iso, s, a - 0.07, a + 0.07, 4.4, 5.2, 'rgba(255, 235, 190, 0.45)');
}

/** A balcony on the front: a white slab and a glass rail at height z. */
export function balcony(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, z: number, a0 = 0.25, a1 = 0.75) {
  // Only when the front faces the camera: from behind, the building hides it.
  if (!sideRef(o, p, hw, hd, 'front')) return;
  const w = (a1 - a0) * hw;
  const c: Pt = [p[0] - hw + (a0 + a1) * hw, p[1] + hd + 0.05];
  prism(iso, o, c, rect(w, 0.05), z, z + 1, solid(LOW.slab));
  prism(iso, o, c, rect(w, 0.05), z + 1, z + 3.2, solid('#c9dbe0'), null);
}

/**
 * A home's garden: lawn, a path from the front door to the street edge, and trees; `trees`
 * behind the house are drawn now, the rest by `front()` once the house is up.
 */
export function garden(iso: IsoFrame, o: Orient, entry: Pt, trees: readonly Pt[], variant: number): { front(): void } {
  lawn(iso, o.rect({ u0: 0, u1: o.w, v0: 0, v1: o.h }));
  path(iso, o, { u0: entry[0] - 0.06, u1: entry[0] + 0.06, v0: entry[1], v1: o.h - 0.02 });
  return standing(iso, o, trees, variant, 0.34);
}

/** A paved forecourt with trees (mid-rise offices and apartments). */
export function forecourt(iso: IsoFrame, o: Orient, trees: readonly Pt[], variant: number): { front(): void } {
  plaza(iso, o, '#e9e2d4', 0.25);
  return standing(iso, o, trees, variant, 0.3);
}

/** A planted strip (local box) on a lot: hedge-green ground with a lighter edge. */
export function bed(iso: IsoFrame, o: Orient, b: { u0: number; u1: number; v0: number; v1: number }) {
  localFloor(iso, o, b, 0.15, '#6fa24f');
}

function standing(iso: IsoFrame, o: Orient, trees: readonly Pt[], variant: number, size: number): { front(): void } {
  const items: Item[] = trees.map(([u, v], k) => tree(iso, o, u, v, size, (variant * 3 + k) % 9));
  const c = at(o, o.w / 2, o.h / 2);
  const behind = (it: Item) => it.depth < c.depth;
  drawItems(items.filter(behind));
  return { front: () => drawItems(items.filter((it) => !behind(it))) };
}

/** The cast shadow of a block of height h. */
export function shadow(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, h: number) {
  planShadow(iso, o, p, rect(hw, hd), h, lotBox(o));
}

/** Parts of a building drawn back to front by their centres (multi-volume designs in any rotation). */
export function inOrder(o: Orient, parts: readonly { readonly p: Pt; readonly draw: () => void }[]) {
  drawItems(parts.map((x) => ({ depth: at(o, x.p[0], x.p[1]).depth, draw: x.draw })));
}

/** A painter for a building family: its designs, picked by variant. */
export type Design = (iso: IsoFrame, o: Orient, variant: number) => void;

/** A glazed ground floor (shopfront, lobby, café) from 0 to 7 px, framed in `frame`. */
export function shopfront(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, frame: string) {
  prism(iso, o, p, rect(hw, hd), 0, 7, finGlass({ tint: '#38434c', fin: frame, floorH: 7, bay: 0.13, finShare: 0.28 }), null);
}

/** A striped awning over the front at height z, seen only when the front faces the camera. */
export function awning(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, z: number, color: string, depth = 0.07) {
  if (!sideRef(o, p, hw, hd, 'front')) return;
  prism(iso, o, [p[0], p[1] + hd + depth / 2], rect(hw * 0.92, depth / 2), z, z + 1, finGlass({ tint: color, fin: '#f6f1e6', floorH: 1, bay: 0.06, finShare: 0.5 }));
}

/** A lit name sign on whichever side of the block faces the camera. */
export function sign(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, z: number, text: string, glow: string, size = 2.6) {
  nameBand(iso, o, p, hw, hd, z, text, glow, size);
}

/** Standing props round a building: those behind `centre` first, then `draw`, then the rest (any rotation). */
export function around(o: Orient, centre: Pt, props: readonly Item[], draw: () => void) {
  const middle = at(o, centre[0], centre[1]).depth;
  drawItems(props.filter((x) => x.depth < middle));
  draw();
  drawItems(props.filter((x) => x.depth >= middle));
}

/** A red cross on a white panel, on whichever side of the block faces the camera (clinics, hospitals). */
export function redCross(iso: IsoFrame, o: Orient, p: Pt, hw: number, hd: number, z: number, size = 0.12) {
  for (const side of ['front', 'right', 'left'] as const) {
    const s = sideRef(o, p, hw, hd, side, 0.01);
    if (!s) continue;
    const span = (side === 'front' ? hw : hd) * 2;
    const a = size / span;
    panel(iso, s, 0.5 - a, 0.5 + a, z - 4, z + 4, '#f8f6f1');
    panel(iso, s, 0.5 - a * 0.25, 0.5 + a * 0.25, z - 3, z + 3, '#d23b3b');
    panel(iso, s, 0.5 - a * 0.75, 0.5 + a * 0.75, z - 0.9, z + 0.9, '#d23b3b');
    return;
  }
}
