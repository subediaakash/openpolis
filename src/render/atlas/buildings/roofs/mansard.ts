import { flatTone, shade, topTone } from '../../core';
import { EAVE, eaveShadow, slopeGradient, type RoofArgs } from './kit';

/**
 * Mansard roof (Parisian / Haussmann style): four steep sloped skirts rising to a recessed flat
 * deck with a crisp cornice trim and dormer window accents on both visible slopes.
 */
export function paintMansardRoof(args: RoofArgs) {
  const { iso, art, b, H, roofColor } = args;
  const rh = art.roofH ?? 8;
  const o = EAVE * 0.6;
  const inU = Math.min(0.14, (b.u1 - b.u0) * 0.18);
  const inV = Math.min(0.14, (b.v1 - b.v0) * 0.18);
  const u0 = b.u0 - o;
  const u1 = b.u1 + o;
  const v0 = b.v0 - o;
  const v1 = b.v1 + o;
  const tu0 = b.u0 + inU;
  const tu1 = b.u1 - inU;
  const tv0 = b.v0 + inV;
  const tv1 = b.v1 - inV;
  eaveShadow(args);

  // Far skirts (mostly hidden behind the crown, drawn for clean silhouette).
  iso.poly([iso.p(u0, v0, H), iso.p(u1, v0, H), iso.p(tu1, tv0, H + rh), iso.p(tu0, tv0, H + rh)], shade(roofColor, -0.32));
  iso.poly([iso.p(u0, v0, H), iso.p(u0, v1, H), iso.p(tu0, tv1, H + rh), iso.p(tu0, tv0, H + rh)], shade(roofColor, -0.22));

  // Visible SE skirt (shade).
  const seTone = flatTone(roofColor, 'se');
  iso.poly(
    [iso.p(u1, v0, H), iso.p(u1, v1, H), iso.p(tu1, tv1, H + rh), iso.p(tu1, tv0, H + rh)],
    slopeGradient(iso, iso.p(u1, (v0 + v1) / 2, H), iso.p(tu1, (tv0 + tv1) / 2, H + rh), shade(seTone, -0.1), shade(seTone, 0.12)),
  );
  // Visible SW skirt (sunlit).
  const swTone = topTone(roofColor);
  iso.poly(
    [iso.p(u0, v1, H), iso.p(u1, v1, H), iso.p(tu1, tv1, H + rh), iso.p(tu0, tv1, H + rh)],
    slopeGradient(iso, iso.p((u0 + u1) / 2, v1, H), iso.p((tu0 + tu1) / 2, tv1, H + rh), shade(swTone, -0.08), shade(swTone, 0.12)),
  );

  // Standing-seam ribs and dormer accents on the SW slope.
  const dormers = Math.max(1, Math.min(3, Math.round((b.u1 - b.u0) * 2.4)));
  for (let k = 0; k < dormers; k++) {
    const t = (k + 0.5) / dormers;
    const du = u0 + (u1 - u0) * t;
    const dtu = tu0 + (tu1 - tu0) * t;
    const hw = Math.min(0.055, (u1 - u0) / (dormers * 4));
    const dv0 = v1 + (tv1 - v1) * 0.22;
    const dv1 = v1 + (tv1 - v1) * 0.72;
    const z0 = H + rh * 0.18;
    const z1 = H + rh * 0.76;
    const au = du + (dtu - du) * 0.22;
    const bu = du + (dtu - du) * 0.72;
    iso.poly([iso.p(au - hw, dv0, z0), iso.p(au + hw, dv0, z0), iso.p(bu + hw, dv1, z1), iso.p(bu - hw, dv1, z1)], '#e8e2d5');
    iso.poly(
      [iso.p(au - hw * 0.7, dv0, z0 + 0.6), iso.p(au + hw * 0.7, dv0, z0 + 0.6), iso.p(bu + hw * 0.7, dv1, z1 - 0.6), iso.p(bu - hw * 0.7, dv1, z1 - 0.6)],
      '#324e68',
    );
  }

  // Flat crown deck + cornice rim.
  iso.floor(tu0, tu1, tv0, tv1, H + rh, shade(roofColor, 0.18));
  iso.floor(tu0 + 0.025, tu1 - 0.025, tv0 + 0.025, tv1 - 0.025, H + rh + 0.3, shade(roofColor, -0.08));
  // Crisp eave cornice strip.
  iso.poly([iso.p(u0, v1, H), iso.p(u1, v1, H), iso.p(u1, v1, H - 1.2), iso.p(u0, v1, H - 1.2)], shade(roofColor, -0.4));
  iso.poly([iso.p(u1, v0, H), iso.p(u1, v1, H), iso.p(u1, v1, H - 1.2), iso.p(u1, v0, H - 1.2)], shade(roofColor, -0.45));
}
