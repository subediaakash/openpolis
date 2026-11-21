/**
 * The theme's colour grade (D-107): every built thing (buildings, roads, bridges, rail, street
 * furniture, stops, vehicles, trains) is painted through a context that pulls its neutral
 * colours (greys, off-whites, slate) toward the theme's warm hue, so painters written with cool
 * grey literals still sit in the theme. Saturated colours (glass, water, signs, liveries) and pure
 * white and black pass unchanged; the ground, trees and water are never graded.
 */

export interface Grade {
  /** Hue the neutrals are pulled toward (degrees). */
  readonly hue: number;
  /** 0 = off, 1 = full: how far toward the hue, and how much colour neutrals gain. */
  readonly warmth: number;
}

/** Colours at or below this saturation count as neutral and are graded. */
const NEUTRAL = 0.2;
/** Most saturation a fully graded mid-tone gains. */
const TINT = 0.26;

type Rgba = [number, number, number, number];

function parse(css: string): Rgba | null {
  const s = css.trim();
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    const full = hex.length === 3 || hex.length === 4 ? [...hex].map((c) => c + c).join('') : hex;
    if (full.length !== 6 && full.length !== 8) return null;
    const n = (k: number) => parseInt(full.slice(k, k + 2), 16);
    const rgba: Rgba = [n(0), n(2), n(4), full.length === 8 ? n(6) / 255 : 1];
    return rgba.some((v) => Number.isNaN(v)) ? null : rgba;
  }
  const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(s);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), a];
}

function toHsl(r: number, g: number, b: number): [number, number, number] {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === R ? ((G - B) / d + (G < B ? 6 : 0)) * 60 : max === G ? ((B - R) / d + 2) * 60 : ((R - G) / d + 4) * 60;
  return [h, s, l];
}

function toRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const cache = new Map<string, string>();

/** One CSS colour through the grade (unparseable values, like gradients' names, pass through). */
export function gradeColour(css: string, grade: Grade): string {
  if (grade.warmth <= 0) return css;
  const key = `${grade.hue}|${grade.warmth}|${css}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  let out = css;
  const rgba = parse(css);
  if (rgba) {
    const [, s, l] = toHsl(rgba[0], rgba[1], rgba[2]);
    if (s <= NEUTRAL && l > 0.06 && l < 0.975) {
      // Mid-tones take the most colour; near-black and near-white hardly any (asphalt stays asphalt).
      // Blended in RGB toward a warm tone of the same lightness, so a cool grey passes through
      // neutral grey, never through green; the more colour it already has, the less it moves.
      const mid = 1 - Math.abs(2 * l - 1);
      const lift = Math.min(1, Math.max(0, (l - 0.22) / 0.3));
      const t = grade.warmth * lift * (1 - s / NEUTRAL) ** 0.5;
      const target = toRgb(grade.hue, TINT * mid, l);
      const mix = (k: number) => Math.round(rgba[k] + (target[k] - rgba[k]) * t);
      const [r, g, b] = [mix(0), mix(1), mix(2)];
      out = rgba[3] >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${rgba[3]})`;
    }
  }
  cache.set(key, out);
  return out;
}

/** Context properties that take a colour. */
const COLOUR_PROPS = new Set<PropertyKey>(['fillStyle', 'strokeStyle', 'shadowColor']);

/**
 * `ctx` with every colour it is given passed through the grade: fill, stroke and shadow colours,
 * and gradient stops. Painters use it exactly like the context it wraps.
 */
export function gradedContext(ctx: CanvasRenderingContext2D, grade: Grade): CanvasRenderingContext2D {
  if (grade.warmth <= 0) return ctx;
  const bound = new Map<PropertyKey, unknown>();
  const gradient = (g: CanvasGradient): CanvasGradient => {
    const add = g.addColorStop.bind(g);
    g.addColorStop = (offset: number, colour: string) => add(offset, gradeColour(colour, grade));
    return g;
  };
  return new Proxy(ctx, {
    get(target, prop) {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient' || prop === 'createConicGradient') {
        const make = Reflect.get(target, prop, target);
        if (typeof make !== 'function') return make;
        return (...args: number[]) => gradient(Reflect.apply(make, target, args));
      }
      const value: unknown = Reflect.get(target, prop, target);
      if (typeof value !== 'function') return value;
      // Native methods must run on the real context, not the proxy.
      let fn = bound.get(prop);
      if (fn === undefined) {
        fn = value.bind(target);
        bound.set(prop, fn);
      }
      return fn;
    },
    set(target, prop, value: unknown) {
      return Reflect.set(target, prop, COLOUR_PROPS.has(prop) && typeof value === 'string' ? gradeColour(value, grade) : value, target);
    },
  });
}

/** A frame painter that paints through the grade (for AtlasBuilder.add). */
export function graded<A extends unknown[]>(grade: Grade, paint: (ctx: CanvasRenderingContext2D, ...args: A) => void) {
  return (ctx: CanvasRenderingContext2D, ...args: A) => paint(gradedContext(ctx, grade), ...args);
}
