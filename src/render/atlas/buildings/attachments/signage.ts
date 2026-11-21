import { faceRef, flatTone, pOn, shade, wallOn, type FaceRef } from '../../core';
import type { AttachArgs } from './kit';

/**
 * Storefront awnings, refined architectural fascia trims, and understated parapet plaques.
 * Cafés and shops read through architecture, warm glowing interiors, awnings, and patio life
 * rather than oversized floating text banners.
 */

/** Muted, realistic architectural fabric tone from a recipe's awning colour. */
function fabricTone(hex: string): string {
  return shade(hex, -0.08);
}

/** Realistic storefront awning: French striped fabric, tailored solid canopy, or slim cantilevered visor. */
export function paintAwning({ p, lf }: AttachArgs) {
  if (!lf) return;
  const { iso, art, rng } = p;
  const c = fabricTone(art.awning ?? '#8c3b32');
  const z = art.floorH - 1.4;
  const len = lf.a1 - lf.a0;
  const pad = Math.min(0.03, len * 0.04);
  const a0 = lf.a0 + pad;
  const a1 = lf.a1 - pad;
  const span = a1 - a0;
  const style = Math.floor(rng() * 3);

  // Soft cast shadow on the storefront glass underneath the awning.
  wallOn(iso, lf, a0, a1, z - 5.2, z - 2.6, 'rgba(12, 18, 28, 0.24)');

  if (style === 1) {
    // Sleek cantilevered modern architectural visor (matte metal/timber with thin light edge).
    const top = flatTone(shade(c, -0.05), lf.face);
    iso.poly([pOn(iso, lf, a0, 0, z), pOn(iso, lf, a1, 0, z), pOn(iso, lf, a1, 0.14, z - 0.9), pOn(iso, lf, a0, 0.14, z - 0.9)], top);
    wallOn(iso, lf, a0, a1, z - 2.0, z - 0.9, flatTone(shade(c, -0.28), lf.face), 0.14);
    wallOn(iso, lf, a0, a1, z - 1.15, z - 0.9, 'rgba(255, 248, 232, 0.35)', 0.14);
    return;
  }

  // Sloped café fabric awning (style 0: tailored classic stripes, style 2: solid rich fabric).
  const stripes = style === 2 ? 1 : 10;
  for (let k = 0; k < stripes; k++) {
    const sa = a0 + (span / stripes) * k;
    const sb = sa + span / stripes;
    const fill = stripes === 1 ? c : k % 2 ? '#f3ede0' : c;
    const g = iso.ctx.createLinearGradient(...pOn(iso, lf, sa, 0, z), ...pOn(iso, lf, sa, 0.15, z - 3.4));
    g.addColorStop(0, shade(flatTone(fill, lf.face), -0.1));
    g.addColorStop(1, shade(flatTone(fill, lf.face), 0.08));
    iso.poly([pOn(iso, lf, sa, 0, z), pOn(iso, lf, sb, 0, z), pOn(iso, lf, sb, 0.15, z - 3.4), pOn(iso, lf, sa, 0.15, z - 3.4)], g);
  }
  // Crisp narrow valance skirt along the front lip.
  wallOn(iso, lf, a0, a1, z - 4.4, z - 3.4, flatTone(shade(c, -0.18), lf.face), 0.15);
  wallOn(iso, lf, a0, a1, z - 4.6, z - 4.4, 'rgba(255, 246, 228, 0.28)', 0.15);
}

/** Small, subtle wrought-iron hanging blade plaque on a shop/café corner. */
export function paintBladeSign({ p, lf }: AttachArgs) {
  if (!lf) return;
  const { iso, art } = p;
  const c = flatTone(shade(art.signColor ?? art.awning ?? '#3b322c', -0.12), lf.face);
  const a = lf.a1 - 0.04;
  const z0 = art.floorH - 2.2;
  const z1 = z0 + 3.6;
  // Thin iron bracket + small framed hanging sign (no giant blob).
  iso.poly([pOn(iso, lf, a, 0, z1), pOn(iso, lf, a, 0.1, z1), pOn(iso, lf, a, 0.1, z1 + 0.45), pOn(iso, lf, a, 0, z1 + 0.45)], '#2c3138');
  iso.poly([pOn(iso, lf, a, 0.02, z0), pOn(iso, lf, a, 0.095, z0), pOn(iso, lf, a, 0.095, z1 - 0.2), pOn(iso, lf, a, 0.02, z1 - 0.2)], c);
  iso.poly([pOn(iso, lf, a, 0.035, z0 + 0.8), pOn(iso, lf, a, 0.08, z0 + 0.8), pOn(iso, lf, a, 0.08, z1 - 1.0), pOn(iso, lf, a, 0.035, z1 - 1.0)], 'rgba(248, 240, 222, 0.72)');
}

/**
 * Refined architectural storefront fascia trim flush above the ground-floor glazing.
 * Replaces loud floating text banners with realistic timber/slate/brass shopfront friezes.
 */
export function paintShopSign({ p, lf, base }: AttachArgs) {
  const { iso, art } = p;
  if (!lf || base.facade !== 'shopfront') return;
  const fascia = flatTone(shade(art.signColor ?? art.awning ?? '#3b3733', -0.18), lf.face);
  const trim = flatTone('#e8dcc4', lf.face);
  const a0 = lf.a0 + 0.04;
  const a1 = lf.a1 - 0.04;
  const z0 = art.floorH - 2.2;
  const z1 = art.floorH - 0.2;
  // Flush fascia board with subtle brass/cream top cornice & bottom molding.
  wallOn(iso, lf, a0, a1, z0, z1, fascia);
  wallOn(iso, lf, a0, a1, z1 - 0.35, z1, trim);
  wallOn(iso, lf, a0, a1, z0, z0 + 0.28, 'rgba(0, 0, 0, 0.22)');
  // Subtle centred gold/cream nameplate emblem (reads like real shop lettering at city scale).
  const mid = (a0 + a1) / 2;
  const hw = Math.min(0.14, (a1 - a0) * 0.24);
  wallOn(iso, lf, mid - hw, mid + hw, z0 + 0.65, z1 - 0.65, 'rgba(248, 240, 220, 0.65)');
}

/**
 * Understated architectural parapet sign ONLY for large flat-roofed civic/campus buildings
 * (never on pitched roofs, never on 1×1 cafés/shops/substations).
 */
export function paintRoofSign({ p, base, top }: AttachArgs) {
  const { iso, o, art } = p;
  if (!art.sign || base.facade === 'shopfront' || art.roof !== 'flat') return;
  // Skip small 1×1 buildings so cafés, shops, and substations never have floating roof billboards.
  if (o.w <= 1 && o.h <= 1) return;
  const l = top.local;
  const sc = shade(art.signColor ?? '#3b4a5a', -0.12);
  const mid = (l.u0 + l.u1) / 2;
  const half = Math.min(0.42, (l.u1 - l.u0) * 0.28);
  const vv = l.v1 - 0.04;
  const [pu0, pv0] = o.point(mid - half, vv);
  const [pu1, pv1] = o.point(mid + half, vv);
  const sf: FaceRef =
    Math.abs(pv0 - pv1) < 1e-6
      ? { face: 'sw', at: pv0, a0: Math.min(pu0, pu1), a1: Math.max(pu0, pu1) }
      : { face: 'se', at: pu0, a0: Math.min(pv0, pv1), a1: Math.max(pv0, pv1) };
  const z0 = top.z1 + 0.4;
  const z1 = top.z1 + 5.6;
  wallOn(iso, sf, sf.a0, sf.a1, z0, z1, flatTone(sc, sf.face));
  wallOn(iso, sf, sf.a0, sf.a1, z1 - 0.4, z1, 'rgba(255,255,255,0.4)');
  iso.text(sf.face, sf.at, (sf.a0 + sf.a1) / 2, (z0 + z1) / 2, art.sign, art.sign.length > 6 ? 3.4 : 4, '#f8f6f0');
}

/** Clinic / hospital red cross on both visible walls of the top mass. */
export function paintRedCross({ p, top }: AttachArgs) {
  const { iso } = p;
  for (const face of ['sw', 'se'] as const) {
    const f = faceRef(face, top.view);
    const mid = (f.a0 + f.a1) / 2;
    const z = top.z1 - 7;
    wallOn(iso, f, mid - 0.09, mid + 0.09, z - 4.5, z + 4.5, flatTone('#ffffff', face));
    wallOn(iso, f, mid - 0.025, mid + 0.025, z - 3.5, z + 3.5, flatTone('#e0393f', face));
    wallOn(iso, f, mid - 0.07, mid + 0.07, z - 1, z + 1, flatTone('#e0393f', face));
  }
}
