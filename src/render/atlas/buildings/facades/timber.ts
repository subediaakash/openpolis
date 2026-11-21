import { flatTone, shade, wallOn } from '../../core';
import { glazing } from './glazing';
import { type FacadeArgs } from './kit';

/**
 * Half-timbered / Craftsman / Japanese wood-frame facade (`timber`): warm plaster bays
 * framed by dark exposed timber posts, floor beams, and divided-lite casement windows.
 */
export function paintTimber({ iso, art, m, f, isFront, rng }: FacadeArgs) {
  const fh = art.floorH;
  const { a0, a1 } = f;
  const len = a1 - a0;
  const ground = m.z0 === 0;
  const H = m.z1;
  const cols = Math.max(2, Math.round(len * 3.2));
  const step = len / cols;
  const wood = flatTone(art.trim ?? '#4f3726', f.face);
  const stoneBase = flatTone(shade(m.wall, -0.25), f.face);

  // Stone plinth on the ground floor.
  if (ground) wallOn(iso, f, a0, a1, 0, 2.2, stoneBase);

  for (let k = 0; k < m.floors; k++) {
    const z = m.z0 + k * fh;
    // Horizontal timber beam at each floor.
    wallOn(iso, f, a0, a1, z, z + 1.1, wood);
    wallOn(iso, f, a0, a1, z + fh - 1, z + fh, wood);

    const isDoor = isFront && ground && k === 0;
    const mid = a0 + len * 0.5;
    if (isDoor) {
      wallOn(iso, f, mid - 0.08, mid + 0.08, 1.2, Math.min(fh - 0.8, 9.5), wood);
      wallOn(iso, f, mid - 0.06, mid + 0.06, 1.4, Math.min(fh - 1.4, 8.8), flatTone('#6f472a', f.face));
      wallOn(iso, f, mid - 0.04, mid + 0.04, 5, Math.min(fh - 2.2, 7.6), 'rgba(255, 232, 180, 0.55)');
    }

    for (let c = 0; c < cols; c++) {
      const s0 = a0 + c * step + step * 0.2;
      const s1 = a0 + (c + 1) * step - step * 0.2;
      if (isDoor && Math.abs((s0 + s1) / 2 - mid) < step * 0.55) continue;
      glazing(iso, f, s0, s1, z + 2.4, z + fh - 2, rng, { glass: art.glass });
      // Timber window frame & center mullion cross.
      const wm = (s0 + s1) / 2;
      wallOn(iso, f, wm - 0.006, wm + 0.006, z + 2.4, z + fh - 2, wood);
      wallOn(iso, f, s0, s1, z + 2.4, z + 3, wood);
    }
  }

  // Vertical exposed timber posts between bays.
  for (let c = 0; c <= cols; c++) {
    const a = a0 + c * step;
    wallOn(iso, f, Math.max(a0, a - 0.015), Math.min(a1, a + 0.015), m.z0, H, wood);
  }
}
