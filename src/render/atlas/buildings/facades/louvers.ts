import { flatTone, shade, wallOn } from '../../core';
import { glassFill, markWindow } from './glazing';
import { entrance, type FacadeArgs } from './kit';

/**
 * Contemporary vertical timber/terracotta brise-soleil louvers (`louvers`): deep recessed
 * floor-to-ceiling glazing veiled by rhythmic vertical sun-shading fins and crisp floor slabs.
 */
export function paintLouvers({ iso, art, m, f, isFront }: FacadeArgs) {
  const fh = art.floorH;
  const { a0, a1 } = f;
  const len = a1 - a0;
  const ground = m.z0 === 0;
  const H = m.z1;
  const sw = f.face === 'sw';
  const louverColor = flatTone(art.trim ?? '#b88352', f.face);
  const louverShade = shade(louverColor, -0.28);
  const slabColor = flatTone(m.wall, f.face);

  for (let k = 0; k < m.floors; k++) {
    const z = m.z0 + k * fh;
    if (ground && k === 0 && isFront) {
      entrance(iso, f, fh);
      continue;
    }
    const z0 = z + 1.3;
    const z1 = z + fh - 1.1;
    // Recessed full-width glass behind the fins.
    wallOn(iso, f, a0 + 0.02, a1 - 0.02, z0, z1, glassFill(iso, f, a0, a1, z0, z1, art.glass ?? '#243c50'));
    // Crisp overhanging concrete/plaster floor slab.
    wallOn(iso, f, a0, a1, z, z + 1.3, slabColor);
    wallOn(iso, f, a0, a1, z + fh - 1.1, z + fh, shade(slabColor, -0.1));

    // Rhythmic vertical louvers (alternating open view bays and dense slatted screens).
    const fins = Math.max(5, Math.round(len * 11));
    const step = len / fins;
    for (let i = 1; i < fins; i++) {
      // Leave an occasional clear picture-window gap every 5th fin so it reads as living architecture.
      if ((i + k * 2) % 5 === 0) continue;
      const a = a0 + i * step;
      wallOn(iso, f, a - 0.008, a + 0.008, z0, z1, louverColor);
      if (sw) wallOn(iso, f, a + 0.008, a + 0.015, z0, z1, louverShade);
    }

    const bays = Math.max(2, Math.round(len * 3));
    const bStep = len / bays;
    for (let b = 0; b < bays; b++) {
      markWindow(iso, f, a0 + b * bStep + 0.03, a0 + (b + 1) * bStep - 0.03, z0 + 0.5, z1 - 0.5);
    }
  }
  if (m.top && art.roof === 'flat') {
    wallOn(iso, f, a0, a1, H - 1.4, H, slabColor);
  }
}
