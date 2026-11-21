import type { Box, IsoFrame, Orient, Rng } from '../../core';
import { at, drawItems, pole, type Item } from '../lot';
import { tree } from '../kit';
import { plaza } from '../../landmarks/plaza';
import { prism } from '../../modern/loft';
import { halo } from '../../modern/parts';
import { rect, superellipse, type Pt } from '../../modern/plans';
import { bands, glass, solid } from '../../modern/skins';
import { vault } from '../../modern/vault';
import { GAME_PALETTE } from '../../theme/buildingPalettes';

const SIGNS = GAME_PALETTE.town.signs;

/**
 * 2×2 train station (docs/specs/evolution.md, E7b; restyled D-096): 3 distinct architectural
 * designs × 4 track orientations (`side = variant % 4`, `style = Math.floor(variant / 4) % 3`).
 * - Style 0: Modern glass barrel-vault concourse with white wave roof & red RAIL pylon.
 * - Style 1: Grand heritage brick & limestone station with clock tower, pitched slate roof & green METRO pylon.
 * - Style 2: High-speed glass-and-steel terminal with cantilevered ribbed glass hall & EXPRESS pylon.
 * Pylons and the terminal roof take the theme's sign colours (D-107).
 */

export const TRAIN_STATION_STYLES = 3;

export function paintTrainStation(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const side = variant % 4;
  const style = Math.floor(variant / 4) % TRAIN_STATION_STYLES;

  const strips: Readonly<Record<number, { platform: Box; edge: Box; hall: Box }>> = {
    0: { platform: { u0: 0.04, u1: 1.96, v0: 0.04, v1: 0.6 }, edge: { u0: 0.04, u1: 1.96, v0: 0.04, v1: 0.1 }, hall: { u0: 0.3, u1: 1.7, v0: 0.85, v1: 1.6 } },
    1: { platform: { u0: 1.4, u1: 1.96, v0: 0.04, v1: 1.96 }, edge: { u0: 1.9, u1: 1.96, v0: 0.04, v1: 1.96 }, hall: { u0: 0.4, u1: 1.15, v0: 0.3, v1: 1.7 } },
    2: { platform: { u0: 0.04, u1: 1.96, v0: 1.4, v1: 1.96 }, edge: { u0: 0.04, u1: 1.96, v0: 1.9, v1: 1.96 }, hall: { u0: 0.3, u1: 1.7, v0: 0.4, v1: 1.15 } },
    3: { platform: { u0: 0.04, u1: 0.6, v0: 0.04, v1: 1.96 }, edge: { u0: 0.04, u1: 0.1, v0: 0.04, v1: 1.96 }, hall: { u0: 0.85, u1: 1.6, v0: 0.3, v1: 1.7 } },
  };
  const s = strips[side];
  const along = side === 0 || side === 2;
  plaza(iso, o, style === 1 ? '#e0d6c6' : style === 2 ? '#dce3ea' : '#e7e2d8', 0.25);

  const platform = o.rect(s.platform);
  iso.solid(platform, 0, 3, style === 1 ? '#a89f90' : '#b9b3a6', style === 1 ? '#d8cfc0' : '#e2ddd2');
  const edge = o.rect(s.edge);
  iso.floor(edge.u0, edge.u1, edge.v0, edge.v1, 3.05, '#f2c94c');

  const items: Item[] = [];
  const h = s.hall;
  const hallAt: Pt = [(h.u0 + h.u1) / 2, (h.v0 + h.v1) / 2];
  const hw = (h.u1 - h.u0) / 2;
  const hd = (h.v1 - h.v0) / 2;

  items.push({
    depth: at(o, hallAt[0], hallAt[1]).depth,
    draw: () => {
      if (style === 1) {
        // Heritage brick & limestone station concourse with central clock tower.
        const hb = o.rect(h);
        iso.solid(hb, 0, 16, '#b55d43', '#525a66');
        iso.wall('sw', hb.v1, hb.u0 + 0.08, hb.u1 - 0.08, 3, 11, '#365872');
        iso.wall('se', hb.u1, hb.v0 + 0.08, hb.v1 - 0.08, 3, 11, '#2b475e');
        iso.solid({ u0: hb.u0 - 0.05, u1: hb.u1 + 0.05, v0: hb.v0 - 0.05, v1: hb.v1 + 0.05 }, 16, 18.5, '#ede2ce', '#485260');
        // Central brick clock tower with warm dial.
        const cu = (hb.u0 + hb.u1) / 2;
        const cv = (hb.v0 + hb.v1) / 2;
        const tw = { u0: cu - 0.22, u1: cu + 0.22, v0: cv - 0.22, v1: cv + 0.22 };
        iso.solid(tw, 18.5, 34, '#b55d43', '#485260');
        iso.solid({ u0: tw.u0 - 0.03, u1: tw.u1 + 0.03, v0: tw.v0 - 0.03, v1: tw.v1 + 0.03 }, 34, 37, '#485260', '#3a424e');
        iso.disc(cu, tw.v1 + 0.01, 0.08, 28, '#faf5e8');
      } else if (style === 2) {
        // High-speed sleek cyan-glass concourse with sweeping twin-tier roof.
        prism(iso, o, hallAt, superellipse(hw, hd, 5, 28), 0, 18, glass({ tint: '#5da6cf', frame: '#e6edf4', floorH: 9, mullion: 0.12, lights: true }), '#d6e2ec');
        vault(iso, o, { u0: h.u0 - 0.08, u1: h.u1 + 0.08, v0: h.v0 - 0.08, v1: h.v1 + 0.08 }, along ? 'v' : 'u', 18, 7, solid(SIGNS[2][0]), SIGNS[2][1]);
      } else {
        prism(iso, o, hallAt, superellipse(hw, hd, 7, 28), 0, 16, bands({ wall: '#f6f7f9', tint: '#3d6b8c', floorH: 16, glazed: 0.78 }), null);
        vault(iso, o, { u0: h.u0 - 0.06, u1: h.u1 + 0.06, v0: h.v0 - 0.06, v1: h.v1 + 0.06 }, along ? 'v' : 'u', 16, 6, solid('#f3f5f7'), '#cdd5dc');
      }
    },
  });

  // Columns along the platform + canopy vault.
  const colColor = style === 1 ? '#6e4c36' : style === 2 ? '#36485a' : '#eef1f4';
  for (let k = 0; k < 4; k++) {
    const t = 0.25 + k * 0.5;
    const mid = side === 0 || side === 3 ? 0.32 : 1.68;
    const [u, v] = along ? [t, mid] : [mid, t];
    const p = at(o, u, v);
    items.push({ depth: p.depth, draw: () => pole(iso, p.u, p.v, 3, 13, 1.3, colColor) });
  }
  const shed: Box = { u0: s.platform.u0 + 0.02, u1: s.platform.u1 - 0.02, v0: s.platform.v0 + 0.02, v1: s.platform.v1 - 0.02 };
  const sc = o.rect(shed);
  items.push({
    depth: sc.u1 + sc.v1 + 0.02,
    draw: () => {
      if (style === 1) {
        vault(iso, o, shed, along ? 'u' : 'v', 12.5, 7, solid('#5b6875'), '#d8cfc0');
      } else if (style === 2) {
        vault(iso, o, shed, along ? 'u' : 'v', 12.5, 8.5, glass({ tint: '#54a6d8', frame: '#dce6f0', floorH: 0, mullion: 0.12, lights: false }), SIGNS[2][1]);
      } else {
        vault(iso, o, shed, along ? 'u' : 'v', 12.5, 8, glass({ tint: '#8fb9d4', frame: '#ffffff', floorH: 0, mullion: 0.14, lights: false }), '#ffffff');
      }
    },
  });

  // Benches under the vault.
  for (const t of [0.6, 1.4]) {
    const [u, v] = along ? [t, side === 0 ? 0.45 : 1.55] : [side === 3 ? 0.45 : 1.55, t];
    const p = at(o, u, v);
    items.push({ depth: p.depth, draw: () => iso.box(p.u - 0.07, p.u + 0.07, p.v - 0.03, p.v + 0.03, 3, 5, '#7a5230', '#5c3d23', '#8a6038') });
  }

  // Forecourt: sign pylon and tree on the street side.
  const street: Pt = along ? [1.82, side === 0 ? 1.82 : 0.18] : [side === 3 ? 1.82 : 0.18, 1.82];
  const pylon = at(o, street[0], street[1]);
  // Sign colours from the theme (D-107).
  const [pylonAccent, pylonHalo] = SIGNS[style % SIGNS.length];
  const pylonText = style === 1 ? 'METRO' : style === 2 ? 'HSR' : 'RAIL';
  items.push({
    depth: pylon.depth,
    draw: () => {
      prism(iso, o, street, rect(0.05, 0.05), 0, 24, solid('#2c3440'), pylonAccent);
      const [x, y] = iso.p(pylon.u, pylon.v, 21);
      halo(iso, x, y, 6, pylonHalo);
      iso.ctx.fillStyle = '#ffffff';
      iso.ctx.font = "bold 3px 'IBM Plex Sans', system-ui, sans-serif";
      iso.ctx.textAlign = 'center';
      iso.ctx.fillText(pylonText, x, y + 1);
      iso.mark('beacon', 'sw', x, y);
    },
  });
  const treeAt: Pt = along ? [0.18, street[1]] : [street[0], 0.18];
  items.push(tree(iso, o, treeAt[0], treeAt[1], 0.42, variant + 2));
  drawItems(items);
  void rng;
}
