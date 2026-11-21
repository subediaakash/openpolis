import type { Box, IsoFrame, Orient, Rng } from '../../core';
import { at, drawItems, pole, type Item } from '../lot';

/**
 * 3×3 bus station (docs/specs/evolution.md, "Bus stations"): 3 distinct architectural styles ×
 * 4 street orientations (`side = variant % 4`, `style = Math.floor(variant / 4) % 3`).
 * - Style 0: Modern glass terminal with blue bay canopies & city buses.
 * - Style 1: Heritage brick & terracotta regional coach hub with clock tower & pitched canopies.
 * - Style 2: Eco-modern green-roof & solar-canopy intermodal bus hub with electric buses.
 */

export const BUS_STATION_STYLES = 3;

const STYLE_PALETTES = [
  {
    lot: '#c9c3b5',
    hallWall: '#e7ecf0',
    hallRoof: '#9aa4ad',
    fascia: '#f4f6f8',
    fasciaTop: '#5d6b78',
    canopy: '#2f7fd6',
    canopyTop: '#5aa2e6',
    sign: '#1f6fb2',
    signTop: '#2a85cf',
    buses: ['#f2a922', '#2f7fd6', '#d93b3b'] as const,
  },
  {
    lot: '#cfc4b2',
    hallWall: '#b85c42',
    hallRoof: '#6e3a2c',
    fascia: '#ebe0cc',
    fasciaTop: '#7a4a38',
    canopy: '#8f5f3b',
    canopyTop: '#b57b50',
    sign: '#9e362a',
    signTop: '#c44a3c',
    buses: ['#d43b3b', '#e8a832', '#356b48'] as const,
  },
  {
    lot: '#cfd6ce',
    hallWall: '#e6eee8',
    hallRoof: '#4f8c4a',
    fascia: '#f2f6f2',
    fasciaTop: '#63a85c',
    canopy: '#228a7c',
    canopyTop: '#36b09e',
    sign: '#1e7a6e',
    signTop: '#2da695',
    buses: ['#3cb878', '#2aa8b8', '#f2c43a'] as const,
  },
] as const;

export function paintBusStation(iso: IsoFrame, o: Orient, rng: Rng, variant: number) {
  const side = variant % 4;
  const style = Math.floor(variant / 4) % BUS_STATION_STYLES;
  const pal = STYLE_PALETTES[style];

  const turn = (u: number, v: number): [number, number] => {
    switch (side) {
      case 0:
        return [3 - u, 3 - v];
      case 1:
        return [v, 3 - u];
      case 3:
        return [3 - v, u];
      default:
        return [u, v];
    }
  };
  const box = (b: Box): Box => {
    const [a0, c0] = turn(b.u0, b.v0);
    const [a1, c1] = turn(b.u1, b.v1);
    return o.rect({ u0: Math.min(a0, a1), u1: Math.max(a0, a1), v0: Math.min(c0, c1), v1: Math.max(c0, c1) });
  };
  const point = (u: number, v: number) => {
    const [a, c] = turn(u, v);
    return at(o, a, c);
  };
  const floor = (b: Box, z: number, fill: string) => {
    const r = box(b);
    iso.floor(r.u0, r.u1, r.v0, r.v1, z, fill);
  };

  // Ground: kerbed lot, driveway asphalt with IN and OUT openings to the street.
  floor({ u0: 0, u1: 3, v0: 0, v1: 3 }, 0, pal.lot);
  floor({ u0: 0.15, u1: 2.85, v0: 0.95, v1: 3 }, 0.04, '#4a4e55');
  floor({ u0: 1.1, u1: 1.9, v0: 2.55, v1: 3 }, 0.06, pal.lot);
  for (const u of [0.35, 1.2, 2.05, 2.85]) floor({ u0: u - 0.02, u1: u + 0.02, v0: 1.0, v1: 1.95 }, 0.07, '#e9e6dc');
  for (const [u0, dir] of [
    [0.45, -1],
    [2.25, 1],
  ] as const) {
    const v = 2.75;
    floor({ u0, u1: u0 + 0.3, v0: v - 0.03, v1: v + 0.03 }, 0.07, '#f2f2ee');
    floor({ u0: u0 + 0.11, u1: u0 + 0.19, v0: v + (dir > 0 ? 0 : -0.12), v1: v + (dir > 0 ? 0.12 : 0) }, 0.07, '#f2f2ee');
  }

  const items: Item[] = [];
  // Terminal hall at the back.
  const hall = box({ u0: 0.2, u1: 2.8, v0: 0.12, v1: 0.85 });
  items.push({
    depth: hall.u1 + hall.v1,
    draw: () => {
      iso.solid(hall, 0, 15, pal.hallWall, pal.hallRoof);
      iso.wall('se', hall.u1, hall.v0 + 0.06, hall.v1 - 0.06, 2, 12, '#3a6b8f');
      iso.wall('sw', hall.v1, hall.u0 + 0.06, hall.u1 - 0.06, 2, 12, '#3a6b8f');
      for (let k = 1; k < 8; k++) {
        const t = k / 8;
        iso.wall('sw', hall.v1, hall.u0 + (hall.u1 - hall.u0) * t - 0.01, hall.u0 + (hall.u1 - hall.u0) * t + 0.01, 2, 12, pal.hallWall);
        iso.wall('se', hall.u1, hall.v0 + (hall.v1 - hall.v0) * t - 0.01, hall.v0 + (hall.v1 - hall.v0) * t + 0.01, 2, 12, pal.hallWall);
      }
      iso.solid({ u0: hall.u0 - 0.05, u1: hall.u1 + 0.05, v0: hall.v0 - 0.05, v1: hall.v1 + 0.05 }, 15, 17, pal.fascia, pal.fasciaTop);

      if (style === 1) {
        // Heritage regional coach terminal: brick clock tower rising from the middle of the hall.
        const cu = (hall.u0 + hall.u1) / 2;
        const cv = (hall.v0 + hall.v1) / 2;
        const tw = { u0: cu - 0.26, u1: cu + 0.26, v0: cv - 0.24, v1: cv + 0.24 };
        iso.solid(tw, 17, 30, '#b85c42', '#7a4a38');
        iso.solid({ u0: tw.u0 - 0.03, u1: tw.u1 + 0.03, v0: tw.v0 - 0.03, v1: tw.v1 + 0.03 }, 30, 32, '#ebe0cc', '#5a636e');
        iso.disc(cu, tw.v1 + 0.01, 0.09, 25, '#f8f4e8');
      } else if (style === 2) {
        // Eco hub: rooftop solar panels + green roof strips + teal sign.
        const cu = (hall.u0 + hall.u1) / 2;
        const cv = (hall.v0 + hall.v1) / 2;
        for (const off of [-0.55, 0.55]) {
          const panel = { u0: cu + off - 0.28, u1: cu + off + 0.28, v0: cv - 0.18, v1: cv + 0.18 };
          iso.solid(panel, 17, 18.6, '#26466d', '#3b6ea5');
        }
        const sign = { u0: cu - 0.25, u1: cu + 0.25, v0: cv - 0.08, v1: cv + 0.08 };
        iso.solid(sign, 17, 23.5, pal.sign, pal.signTop);
        iso.wall('sw', sign.v1, sign.u0 + 0.05, sign.u1 - 0.05, 19.5, 21.2, '#f4f6f8');
      } else {
        const sign = { u0: (hall.u0 + hall.u1) / 2 - 0.25, u1: (hall.u0 + hall.u1) / 2 + 0.25, v0: (hall.v0 + hall.v1) / 2 - 0.08, v1: (hall.v0 + hall.v1) / 2 + 0.08 };
        iso.solid(sign, 17, 24, pal.sign, pal.signTop);
        iso.wall('sw', sign.v1, sign.u0 + 0.05, sign.u1 - 0.05, 19.5, 21.5, '#f4f6f8');
      }
    },
  });

  // Buses parked nose-in to the terminal in the bays.
  const parked = 2 + Math.floor(rng() * 2);
  for (let k = 0; k < 3; k++) {
    if (k >= parked) continue;
    const u = 0.78 + k * 0.85;
    const bus = box({ u0: u - 0.13, u1: u + 0.13, v0: 1.05, v1: 1.8 });
    const color = pal.buses[(k + side) % pal.buses.length];
    items.push({
      depth: bus.u1 + bus.v1,
      draw: () => {
        iso.solid(bus, 1, 9, color, '#f4f4f0');
        iso.wall('se', bus.u1, bus.v0 + 0.04, bus.v1 - 0.04, 5, 8, '#253a4f');
        iso.wall('sw', bus.v1, bus.u0 + 0.03, bus.u1 - 0.03, 5, 8, '#253a4f');
      },
    });
  }

  // Boarding canopies over the bays.
  for (const u of [0.35, 1.2, 2.05, 2.85]) {
    const p = point(u, 0.98);
    items.push({ depth: p.depth, draw: () => pole(iso, p.u, p.v, 0, 13, 1.2, '#4b5864') });
  }
  for (let k = 0; k < 3; k++) {
    const u = 0.78 + k * 0.85;
    const roof = box({ u0: u - 0.36, u1: u + 0.36, v0: 0.9, v1: 1.38 });
    items.push({ depth: roof.u1 + roof.v1 + 0.4, draw: () => iso.solid(roof, 13, 14.4, pal.canopy, pal.canopyTop) });
  }

  // Trees on the forecourt corners (style 2 gets two trees for a greener intermodal plaza).
  const trees: readonly (readonly [number, number])[] = style === 2 ? [[0.3, 2.5], [1.5, 2.75]] : [[0.3, 2.5]];
  for (const [tu, tv] of trees) {
    const tree = point(tu, tv);
    items.push({
      depth: tree.depth,
      draw: () => {
        iso.disc(tree.u, tree.v, 0.14, 0.1, 'rgba(0,0,0,0.15)');
        pole(iso, tree.u, tree.v, 0, 6, 1.4, '#6b4a2f');
        iso.disc(tree.u, tree.v, 0.16, 10, '#4f9a4a');
      },
    });
  }
  drawItems(items);
}
