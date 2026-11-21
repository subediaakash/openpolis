import { flatTone, pOn, shade, wallOn } from '../../core';
import { glassFill, markWindow } from './glazing';
import { type FacadeArgs } from './kit';

/**
 * Classical arched facade (`arch`): ground-floor semicircular arcade colonnade with recessed
 * shadow, stone pilasters between bays, and tall arched upper windows with keystones and sills.
 */
export function paintArches({ iso, art, m, f, isFront, rng }: FacadeArgs) {
  const fh = art.floorH;
  const { a0, a1 } = f;
  const len = a1 - a0;
  const ground = m.z0 === 0;
  const H = m.z1;
  const cols = Math.max(2, Math.round(len * 3.1));
  const step = len / cols;
  const trim = flatTone(art.trim ?? shade(m.wall, 0.14), f.face);
  const darkRecess = 'rgba(18, 26, 38, 0.52)';
  const sw = f.face === 'sw';

  // Subtle horizontal stone courses on ground floor (rustication).
  if (ground) {
    for (let z = 1.5; z < fh - 0.5; z += 2.2) {
      wallOn(iso, f, a0, a1, z, z + 0.35, 'rgba(0,0,0,0.09)');
    }
  }

  for (let k = 0; k < m.floors; k++) {
    const z0 = m.z0 + k * fh;
    const isArcade = ground && k === 0;
    const winZ0 = isArcade ? z0 + 0.8 : z0 + 2.2;
    const winZ1 = z0 + fh - (isArcade ? 1.4 : 1.8);
    const archH = Math.min(2.6, (winZ1 - winZ0) * 0.32);

    // String course between floors.
    if (k > 0) {
      wallOn(iso, f, a0, a1, z0 - 0.5, z0 + 0.5, trim);
      wallOn(iso, f, a0, a1, z0 - 1.1, z0 - 0.5, 'rgba(0,0,0,0.14)');
    }

    for (let c = 0; c < cols; c++) {
      const s0 = a0 + c * step + step * (isArcade ? 0.14 : 0.2);
      const s1 = a0 + (c + 1) * step - step * (isArcade ? 0.14 : 0.2);
      const sm = (s0 + s1) / 2;

      // Arched opening: polygon with 5-point curved top.
      const glass = isArcade && isFront ? '#2a3e54' : (art.glass ?? '#2e4c68');
      const fill = glassFill(iso, f, s0, s1, winZ0, winZ1, glass);
      const archPts = [
        pOn(iso, f, s0, 0, winZ0),
        pOn(iso, f, s1, 0, winZ0),
        pOn(iso, f, s1, 0, winZ1 - archH),
        pOn(iso, f, s1 - (s1 - s0) * 0.16, 0, winZ1 - archH * 0.25),
        pOn(iso, f, sm, 0, winZ1),
        pOn(iso, f, s0 + (s1 - s0) * 0.16, 0, winZ1 - archH * 0.25),
        pOn(iso, f, s0, 0, winZ1 - archH),
      ];
      iso.poly(archPts, fill);

      // Warm interior glow inside ground-floor arches.
      if (isArcade && isFront) {
        wallOn(iso, f, s0 + 0.015, s1 - 0.015, winZ0 + 0.8, winZ0 + 3.4, 'rgba(255, 224, 168, 0.42)');
      } else if (rng() < 0.25) {
        wallOn(iso, f, s0 + 0.01, s1 - 0.01, winZ1 - archH - 1.2, winZ1 - archH, 'rgba(240, 234, 220, 0.35)');
      }

      // Arch top reveal shadow & keystone accent.
      wallOn(iso, f, sm - 0.014, sm + 0.014, winZ1 - 0.3, winZ1 + 0.9, trim);
      // Sill + wrought-iron Juliet railing on upper floors.
      if (!isArcade) {
        wallOn(iso, f, s0 - 0.015, s1 + 0.015, winZ0 - 0.7, winZ0 + 0.2, trim);
        wallOn(iso, f, s0, s1, winZ0 + 0.2, winZ0 + 1.5, darkRecess);
      }
      markWindow(iso, f, s0, s1, winZ0 + 0.4, winZ1 - archH * 0.5);
    }

    // Classical vertical pilasters between bays.
    for (let c = 0; c <= cols; c++) {
      const a = a0 + c * step;
      const pw = 0.014;
      wallOn(iso, f, Math.max(a0, a - pw), Math.min(a1, a + pw), z0 + 0.4, z0 + fh - 0.4, sw ? trim : shade(trim, -0.08));
    }
  }

  // Classical projecting cornice at top.
  if (m.top && art.roof === 'flat') {
    wallOn(iso, f, a0, a1, H - 1.8, H, trim);
    wallOn(iso, f, a0, a1, H - 2.8, H - 1.8, 'rgba(0,0,0,0.16)');
  }
}
