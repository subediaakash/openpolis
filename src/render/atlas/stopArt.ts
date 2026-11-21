import { HALF_W } from '../../shared/constants';
import { IsoFrame, shade } from './core';
import { GROUND_FRAME_H, GROUND_FRAME_W, GROUND_PAD } from './geometry';

/** Bus stop shelters (docs/specs/simulation.md): 5 architectural designs × 4 pavement sides. */

export const STOP_HEADROOM = 28;
export const STOP_FRAME_W = GROUND_FRAME_W;
export const STOP_FRAME_H = GROUND_FRAME_H + STOP_HEADROOM;
export const STOP_STYLES = 5;
/** Anchor that puts the tile's top vertex on the sprite position. */
export const STOP_ANCHOR = { x: (GROUND_PAD + HALF_W) / STOP_FRAME_W, y: (GROUND_PAD + STOP_HEADROOM) / STOP_FRAME_H } as const;

const GLASS = 'rgba(160, 205, 235, 0.58)';

interface Part {
  /** Depth for back-to-front drawing (u + v of the part's centre). */
  depth: number;
  draw: () => void;
}

/**
 * Shelter on side 0 (−v), 1 (+u), 2 (+v) or 3 (−u) of the tile, facing the road in the middle.
 * `style`: 0 classic glass, 1 dark-steel LED totem, 2 heritage brick/timber, 3 eco green-roof, 4 BRT express kiosk.
 */
export function paintBusStop(ctx: CanvasRenderingContext2D, side: 0 | 1 | 2 | 3, style = 0) {
  const iso = new IsoFrame(ctx, GROUND_PAD + HALF_W, GROUND_PAD + STOP_HEADROOM);
  const along = side % 2 === 0;
  const outer = side === 0 || side === 3 ? 0.05 : 0.95;
  const inward = side === 0 || side === 3 ? 1 : -1;
  const at = (a: number, d: number): [number, number] => {
    const off = outer + inward * (d * 0.14 - 0.06);
    return along ? [a, off] : [off, a];
  };
  const box = (a0: number, a1: number, d0: number, d1: number, z0: number, z1: number, lit: string, dark: string, top: string): Part => {
    const [p0u, p0v] = at(a0, d0);
    const [p1u, p1v] = at(a1, d1);
    const u0 = Math.min(p0u, p1u);
    const u1 = Math.max(p0u, p1u);
    const v0 = Math.min(p0v, p1v);
    const v1 = Math.max(p0v, p1v);
    return { depth: (u0 + u1 + v0 + v1) / 2, draw: () => iso.box(u0, u1, v0, v1, z0, z1, lit, dark, top) };
  };

  const s = style % STOP_STYLES;
  const post = s === 2 ? '#6e4c32' : s === 1 ? '#2d333b' : s === 3 ? '#4f6d54' : '#5b636e';
  const bench = s === 1 ? '#4a5562' : s === 4 ? '#2d6ea8' : '#9a6b3f';
  const sign = s === 1 ? '#d9483b' : s === 2 ? '#2e6b4a' : s === 3 ? '#3b9454' : s === 4 ? '#0f82b8' : '#2f7fd6';
  const roof = s === 1 ? '#2e3640' : s === 2 ? '#a84a36' : s === 3 ? '#5a9c4e' : s === 4 ? '#1e68a8' : '#e8ecef';

  const parts: Part[] = [
    // Back wall: brick lower wall for heritage (style 2), else full glass panel.
    s === 2
      ? box(0.28, 0.72, 0, 0.14, 0, 6.5, '#b86248', '#8c4733', '#d47c62')
      : box(0.28, 0.72, 0, 0.12, 0, 13, GLASS, GLASS, GLASS),
    box(0.35, 0.65, 0.2, 0.45, 0, 3.5, bench, shade(bench, -0.25), shade(bench, 0.15)),
    box(0.29, 0.33, 0.85, 1, 0, 13, post, shade(post, -0.25), post),
    box(0.67, 0.71, 0.85, 1, 0, 13, post, shade(post, -0.25), post),
  ];

  if (s === 2) {
    // Upper glazing on heritage brick shelter.
    parts.push(box(0.29, 0.71, 0.02, 0.12, 6.5, 13, GLASS, GLASS, GLASS));
  }

  // Commute transfer totem / ticket kiosk / sign pole beside the shelter.
  if (s === 1) {
    // Digital LED real-time arrival display totem.
    parts.push(box(0.77, 0.85, 0.75, 0.96, 0, 21, '#252a32', '#171a20', '#3d4450'));
    parts.push(box(0.78, 0.84, 0.78, 0.98, 13, 19, '#12151a', '#12151a', '#ffbe3d'));
  } else if (s === 4) {
    // BRT ticket kiosk + tall illuminated pylon.
    parts.push(box(0.14, 0.24, 0.15, 0.65, 0, 10, '#d8e0e8', '#a6b2be', '#eef2f6'));
    parts.push(box(0.77, 0.84, 0.8, 0.96, 0, 22, '#1e68a8', '#154b7a', '#48a8e8'));
  } else {
    parts.push(box(0.78, 0.81, 0.85, 0.95, 0, 17, post, shade(post, -0.25), post));
  }

  // Eco shelter (style 3) gets a tiny solar strip & bike stand beside it.
  if (s === 3) {
    parts.push(box(0.15, 0.25, 0.35, 0.85, 0, 2.2, '#4a5562', '#333b44', '#697686'));
  }

  parts.sort((p, q) => p.depth - q.depth);
  for (const p of parts) p.draw();

  // Roof canopy.
  if (s === 2) {
    // Pitched heritage roof cap.
    box(0.25, 0.75, -0.08, 1.08, 13, 15.2, roof, shade(roof, -0.25), shade(roof, 0.1)).draw();
    box(0.32, 0.68, 0.1, 0.9, 15.2, 17.5, shade(roof, 0.08), shade(roof, -0.2), shade(roof, 0.2)).draw();
  } else if (s === 3) {
    // Living green sedum roof with timber fascia.
    box(0.26, 0.74, -0.06, 1.06, 13, 14.5, '#8f6339', '#6b4827', '#a8784a').draw();
    box(0.28, 0.72, -0.02, 1.02, 14.5, 16, '#5a9c4e', '#407536', '#72b862').draw();
  } else if (s === 1) {
    // Sleek dark roof with bright red transit stripe.
    box(0.26, 0.74, -0.06, 1.06, 13, 14.8, roof, shade(roof, -0.25), '#444e5a').draw();
    box(0.26, 0.74, 0.92, 1.08, 13.4, 14.6, '#d9483b', '#a33228', '#ef6356').draw();
  } else if (s === 4) {
    // Bold cantilevered BRT double-layer canopy.
    box(0.22, 0.76, -0.08, 1.12, 13, 15.2, roof, shade(roof, -0.24), '#3288cc').draw();
    box(0.24, 0.74, 0.98, 1.14, 13.6, 14.8, '#48d1cc', '#2fa39e', '#72e6e1').draw();
  } else {
    box(0.27, 0.73, -0.05, 1.05, 13, 15, roof, shade(roof, -0.22), roof).draw();
  }

  // Sign plate for pole-sign styles (0, 2, 3).
  if (s === 0 || s === 2 || s === 3) {
    box(0.76, 0.83, 0.86, 0.94, 15, 21, sign, shade(sign, -0.25), shade(sign, 0.2)).draw();
  }
}
