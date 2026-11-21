import { flatTone, shade, topTone } from '../../core';
import { EAVE, eaveShadow, ridgeFrame, slopeGradient, type RoofArgs } from './kit';

/**
 * Modern single-slope shed / skillion roof: rises from the back eave to a tall front edge with
 * a clerestory glass strip underneath and a bold overhanging fascia.
 */
export function paintShedRoof(args: RoofArgs) {
  const { iso, art, axis, H, roofColor, wall } = args;
  const rh = art.roofH ?? 7;
  const o = EAVE;
  const { A0, A1, C0, C1, P } = ridgeFrame(args);
  const sunny = axis === 'u';
  eaveShadow(args);

  // High side sits on the near edge (C1) so the clerestory glass band faces the viewer.
  const endFace = sunny ? 'se' : 'sw';
  // Triangular end wall under the slope.
  iso.poly([P(A1, C0, H), P(A1, C1, H), P(A1, C1, H + rh)], flatTone(wall, endFace));
  // Front high fascia wall with a clerestory glass ribbon.
  const frontFace = sunny ? 'sw' : 'se';
  iso.poly([P(A0, C1, H), P(A1, C1, H), P(A1, C1, H + rh), P(A0, C1, H + rh)], flatTone(wall, frontFace));
  if (rh >= 5) {
    const pad = Math.min(0.06, (A1 - A0) * 0.1);
    iso.poly([P(A0 + pad, C1, H + 1.2), P(A1 - pad, C1, H + 1.2), P(A1 - pad, C1, H + rh - 1.5), P(A0 + pad, C1, H + rh - 1.5)], '#355c7d');
    // Vertical mullions.
    for (let k = 1; k < 4; k++) {
      const a = A0 + pad + ((A1 - A0 - pad * 2) * k) / 4;
      iso.poly([P(a - 0.008, C1, H + 1.2), P(a + 0.008, C1, H + 1.2), P(a + 0.008, C1, H + rh - 1.5), P(a - 0.008, C1, H + rh - 1.5)], '#dce3ea');
    }
  }

  // Main sloped roof plane.
  const top = sunny ? topTone(roofColor) : shade(topTone(roofColor), -0.06);
  const backP = P((A0 + A1) / 2, C0 - o, H - 0.5);
  const frontP = P((A0 + A1) / 2, C1 + o, H + rh + 0.5);
  iso.poly(
    [P(A0 - o, C0 - o, H - 0.5), P(A1 + o, C0 - o, H - 0.5), P(A1 + o, C1 + o, H + rh + 0.5), P(A0 - o, C1 + o, H + rh + 0.5)],
    slopeGradient(iso, backP, frontP, shade(top, -0.14), shade(top, 0.14)),
  );
  // Standing seam ribs across the slope.
  for (let t = 0.2; t < 0.95; t += 0.2) {
    const a = A0 - o + (A1 - A0 + 2 * o) * t;
    iso.poly([P(a, C0 - o, H - 0.4), P(a + 0.012, C0 - o, H - 0.4), P(a + 0.012, C1 + o, H + rh + 0.6), P(a, C1 + o, H + rh + 0.6)], 'rgba(0,0,0,0.12)');
  }
  // Thick overhanging front & side fascia trim.
  iso.poly([P(A0 - o, C1 + o, H + rh + 0.5), P(A1 + o, C1 + o, H + rh + 0.5), P(A1 + o, C1 + o, H + rh - 1.2), P(A0 - o, C1 + o, H + rh - 1.2)], shade(roofColor, -0.35));
  iso.poly([P(A1 + o, C0 - o, H - 0.5), P(A1 + o, C1 + o, H + rh + 0.5), P(A1 + o, C1 + o, H + rh - 1.2), P(A1 + o, C0 - o, H - 2)], shade(roofColor, -0.42));
}
