import { HALF_W } from '../../../shared/constants';
import { alpha, mix, shade } from '../core/color';
import { GLASS, LIGHT } from '../theme/tokens';
import { facetGradient, fillShape, onQuad, toneOf, type ScreenFacet, type Skin } from './facets';

/**
 * Skyscraper skins (D-108): façades that read as real towers at city scale. Both keep a strong
 * contrast between the sunlit and the shaded face, which the plain glass skin lacked (towers
 * read as pale plastic): the lit face catches warm sky, the shaded face goes deep and dark.
 *   finGlass  - curtain glass behind deep vertical fins (bronze, terracotta or stone).
 *   stoneGrid - stone piers and spandrels with dark recessed windows, floor by floor.
 */

function footLength(f: ScreenFacet): number {
  const [a, b] = f.pts;
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function heightOf(f: ScreenFacet): number {
  return Math.max(...f.pts.map((p) => p[2])) - Math.min(...f.pts.map((p) => p[2]));
}

function baseZ(f: ScreenFacet): number {
  return Math.min(...f.pts.map((p) => p[2]));
}

/** A strip of a quad facet from fraction a0 to a1 along it and t0 to t1 up it. */
function strip(f: ScreenFacet, a0: number, a1: number, t0: number, t1: number): [number, number][] {
  return [onQuad(f, a0, t0), onQuad(f, a1, t0), onQuad(f, a1, t1), onQuad(f, a0, t1)];
}

/** Glass in its light: warm sky on the sunlit face, deep tint in the shade, brighter higher up. */
function glassTone(tint: string, side: number, t: number): string {
  const lit = mix(mix(GLASS.reflect, LIGHT.sun, 0.4), tint, 0.22 + 0.32 * (1 - t));
  const dark = shade(tint, -0.32 + 0.12 * t);
  return mix(lit, dark, Math.min(1, side * 1.15));
}

/** Night lights on the faces square to the box (sheared glows only match those). */
function markWindows(iso: Parameters<Skin['paint']>[0], f: ScreenFacet, cols: number, floorH: number) {
  if (f.up >= 0.1 || (f.side >= 0.12 && f.side <= 0.88)) return;
  const h = heightOf(f);
  const floors = Math.floor(h / floorH);
  const len = footLength(f);
  for (let r = 0; r < floors; r++) {
    for (let k = 0; k < cols; k++) {
      const [x, y] = onQuad(f, (k + 0.5) / cols, (r + 0.5) / Math.max(1, h / floorH));
      iso.mark('window', f.face, x, y, (len / cols) * HALF_W * 0.7, floorH * 0.55);
    }
  }
}

export interface FinGlassStyle {
  /** Deep glass tint. */
  readonly tint: string;
  /** Fin colour (bronze, terracotta, stone). */
  readonly fin: string;
  /** Floor height in px. */
  readonly floorH: number;
  /** Fin spacing in tiles. */
  readonly bay: number;
  /** Fin width as a share of a bay. */
  readonly finShare?: number;
}

export function finGlass(style: FinGlassStyle): Skin {
  const finShare = style.finShare ?? 0.22;
  return {
    base: style.fin,
    paint(iso, f) {
      if (f.up > 0.6) {
        fillShape(iso, f.xy, toneOf(shade(style.fin, -0.15), f.side, f.up, 1));
        return;
      }
      fillShape(iso, f.xy, facetGradient(iso, f, glassTone(style.tint, f.side, f.t1), glassTone(style.tint, f.side, f.t0)));
      if (f.xy.length !== 4) return;
      // A broad soft glint across glass that faces the sun.
      if (f.side < 0.5) fillShape(iso, [onQuad(f, 0.1, 1), onQuad(f, 0.45, 1), onQuad(f, 0.8, 0), onQuad(f, 0.45, 0)], `rgba(255, 246, 228, ${((0.5 - f.side) * 0.3).toFixed(3)})`, false);
      const h = heightOf(f);
      const z0 = baseZ(f);
      // Spandrels: a dark band at each floor slab.
      const band = alpha(shade(style.tint, -0.45), 0.45);
      for (let z = Math.ceil(z0 / style.floorH) * style.floorH; z < z0 + h - 0.5; z += style.floorH) {
        const t = (z - z0) / h;
        if (t > 0.01) fillShape(iso, strip(f, 0, 1, t, Math.min(1, t + 1.1 / h)), band, false);
      }
      // Fins, lit like solid piers: bright on the sun side with a light edge, dark in the shade.
      const cols = Math.max(1, Math.round(footLength(f) / style.bay));
      const fin = toneOf(style.fin, f.side, 0, 0.6);
      const edge = alpha('#fff6e6', f.side < 0.5 ? 0.45 : 0.12);
      for (let k = 0; k <= cols; k++) {
        const a = k / cols;
        const a0 = Math.max(0, a - finShare / cols / 2);
        const a1 = Math.min(1, a + finShare / cols / 2);
        fillShape(iso, strip(f, a0, a1, 0, 1), fin, false);
        fillShape(iso, strip(f, a0, Math.min(1, a0 + 0.04 / cols), 0, 1), edge, false);
      }
      markWindows(iso, f, cols, style.floorH);
    },
  };
}

export interface StoneGridStyle {
  readonly stone: string;
  /** Window glass tint. */
  readonly glass: string;
  readonly floorH: number;
  /** Window bay width in tiles. */
  readonly bay: number;
  /** Share of each bay that is window (the rest is pier). */
  readonly glazed?: number;
  /** Share of each floor that is window (the rest is spandrel). */
  readonly tall?: number;
  /** Shutters either side of each window (homes), or none. */
  readonly shutter?: string;
}

export function stoneGrid(style: StoneGridStyle): Skin {
  const glazed = style.glazed ?? 0.62;
  const tall = style.tall ?? 0.66;
  return {
    base: style.stone,
    paint(iso, f) {
      fillShape(iso, f.xy, facetGradient(iso, f, toneOf(style.stone, f.side, f.up, f.t1), toneOf(style.stone, f.side, f.up, f.t0)));
      if (f.xy.length !== 4 || f.up > 0.6) return;
      const h = heightOf(f);
      const z0 = baseZ(f);
      const cols = Math.max(1, Math.round(footLength(f) / style.bay));
      const floors = Math.floor(h / style.floorH);
      if (floors < 1) return;
      const reveal = alpha(shade(style.stone, -0.5), f.side < 0.5 ? 0.5 : 0.35);
      for (let r = 0; r < floors; r++) {
        const zb = z0 + r * style.floorH + style.floorH * (1 - tall) * 0.6;
        const t0 = (zb - z0) / h;
        const t1 = (zb + style.floorH * tall - z0) / h;
        const tone = glassTone(style.glass, f.side, (r + 0.5) / floors);
        for (let k = 0; k < cols; k++) {
          const a0 = (k + (1 - glazed) / 2) / cols;
          const a1 = (k + 1 - (1 - glazed) / 2) / cols;
          fillShape(iso, strip(f, a0, a1, t0, t1), tone, false);
          if (style.shutter) {
            const sw = (a1 - a0) * 0.32;
            const st = toneOf(style.shutter, f.side, 0, 0.5);
            fillShape(iso, strip(f, Math.max(0, a0 - sw), a0, t0, t1), st, false);
            fillShape(iso, strip(f, a1, Math.min(1, a1 + sw), t0, t1), st, false);
          }
          // The reveal: a shadowed inner edge on the sill and one jamb.
          fillShape(iso, strip(f, a0, a1, t1 - 0.6 / h, t1), reveal, false);
        }
      }
      markWindows(iso, f, cols, style.floorH);
    },
  };
}

/** Clay roof tiles: the lit slope warm, courses of tiles running across it. */
export function tiles(color: string): Skin {
  return {
    base: color,
    paint(iso, f) {
      fillShape(iso, f.xy, facetGradient(iso, f, toneOf(color, f.side, f.up, 0.9), toneOf(color, f.side, f.up, 0.2)));
      if (f.xy.length !== 4) return;
      const course = alpha(shade(color, -0.4), 0.4);
      for (let k = 1; k < 6; k++) fillShape(iso, strip(f, 0, 1, k / 6, k / 6 + 0.03), course, false);
    },
  };
}

/** Pitched-roof solids: sloped facets take the roof skin, upright ones (gable ends) the wall's. */
export function roofed(roof: Skin, wall: Skin): Skin {
  return {
    base: roof.base,
    paint(iso, f) {
      (f.up > 0.08 ? roof : wall).paint(iso, f);
    },
  };
}
