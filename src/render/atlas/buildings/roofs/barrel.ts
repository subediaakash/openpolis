import { flatTone, shade, topTone } from '../../core';
import { EAVE, eaveShadow, ridgeFrame, type RoofArgs } from './kit';

/**
 * Curved barrel-vault roof: faceted parabolic arch running along `axis` with structural ribs
 * and a glazed arched end gable. Great for modern markets, studios, depots and civic halls.
 */
export function paintBarrelRoof(args: RoofArgs) {
  const { iso, art, axis, H, roofColor, wall } = args;
  const rh = art.roofH ?? 8;
  const o = EAVE * 0.5;
  const { A0, A1, C0, C1, P } = ridgeFrame(args);
  const sunny = axis === 'u';
  const span = C1 - C0;
  const steps = 8;
  eaveShadow(args);

  const archZ = (t: number) => H + Math.sin(t * Math.PI) * rh;
  const cAt = (t: number) => C0 - o + (span + 2 * o) * t;

  // Faceted barrel shell from far side (t = 0) to near side (t = 1).
  const baseTone = sunny ? topTone(roofColor) : flatTone(roofColor, 'se');
  for (let k = 0; k < steps; k++) {
    const t0 = k / steps;
    const t1 = (k + 1) / steps;
    const c0 = cAt(t0);
    const c1 = cAt(t1);
    const z0 = archZ(t0);
    const z1 = archZ(t1);
    // Shading curves smoothly across the arch: darkest on far side, brightest near the crest.
    const light = -0.28 + Math.sin(((t0 + t1) / 2) * Math.PI * 0.85) * 0.45;
    iso.poly([P(A0 - o, c0, z0), P(A1 + o, c0, z0), P(A1 + o, c1, z1), P(A0 - o, c1, z1)], shade(baseTone, light));
  }

  // Structural arch ribs along the barrel.
  const ctx = iso.ctx;
  ctx.strokeStyle = shade(roofColor, -0.32);
  ctx.lineWidth = 0.7;
  for (let r = 1; r < 4; r++) {
    const a = A0 + ((A1 - A0) * r) / 4;
    ctx.beginPath();
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const [px, py] = P(a, cAt(t), archZ(t) + 0.2);
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Arched end gable wall + semi-circular glass fanlight.
  const endFace = sunny ? 'se' : 'sw';
  const endPts: [number, number][] = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    endPts.push(P(A1, C0 + span * t, archZ(t)));
  }
  endPts.push(P(A1, C1, H), P(A1, C0, H));
  iso.poly(endPts, flatTone(wall, endFace));

  if (rh >= 5) {
    const glassPts: [number, number][] = [];
    for (let k = 1; k < steps; k++) {
      const t = k / steps;
      glassPts.push(P(A1, C0 + span * t, H + Math.sin(t * Math.PI) * (rh - 1.4)));
    }
    glassPts.push(P(A1, C0 + span * 0.88, H + 0.8), P(A1, C0 + span * 0.12, H + 0.8));
    iso.poly(glassPts, '#365f82');
  }
}
