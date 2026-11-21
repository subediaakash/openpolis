import { flatTone, mix, pOn, shade, wallOn } from '../../core';
import { GLASS } from '../../theme/tokens';
import { markWindow } from './glazing';
import { entrance, type FacadeArgs } from './kit';

/**
 * Contemporary architectural diagrid (`diagrid`): full-height sky-reflecting curtain glass
 * wrapped in a bold criss-crossing diamond steel exoskeleton.
 */
export function paintDiagrid({ iso, art, m, f, isFront }: FacadeArgs) {
  const fh = art.floorH;
  const { a0, a1 } = f;
  const len = a1 - a0;
  const ground = m.z0 === 0;
  const H = m.z1;
  const sw = f.face === 'sw';
  const zStart = m.z0 + (ground ? 2 : 0);

  // Full glass skin.
  const top = mix(GLASS.reflect, m.wall, sw ? 0.35 : 0.65);
  const bottom = flatTone(shade(m.wall, -0.34), f.face);
  wallOn(iso, f, a0 + 0.01, a1 - 0.01, zStart, H, iso.wallGradient(f.face, f.at, a0, a1, zStart, H, top, bottom));

  // Subtle floor slab shadows behind the glass.
  for (let k = 1; k < m.floors; k++) {
    const z = m.z0 + k * fh;
    wallOn(iso, f, a0 + 0.01, a1 - 0.01, z - 0.3, z + 0.6, 'rgba(12, 22, 36, 0.22)');
  }

  // Sky reflection diagonal sheen on sunlit face.
  if (sw) {
    const h = H - zStart;
    iso.poly(
      [
        pOn(iso, f, a0 + len * 0.14, 0, zStart + h * 0.96),
        pOn(iso, f, a0 + len * 0.34, 0, zStart + h * 0.96),
        pOn(iso, f, a0 + len * 0.56, 0, zStart + h * 0.18),
        pOn(iso, f, a0 + len * 0.36, 0, zStart + h * 0.18),
      ],
      'rgba(255,255,255,0.16)',
    );
  }

  // Diamond steel diagrid bracing across the whole wall.
  const bays = Math.max(2, Math.round(len * 2.4));
  const step = len / bays;
  const tierH = fh * 2;
  const steel = flatTone(art.trim ?? '#e4eaf0', f.face);
  const ctx = iso.ctx;
  ctx.strokeStyle = steel;
  ctx.lineWidth = sw ? 1.15 : 0.95;
  for (let z = m.z0; z < H - 0.5; z += tierH) {
    const zTop = Math.min(H, z + tierH);
    for (let b = 0; b < bays; b++) {
      const s0 = a0 + b * step;
      const s1 = s0 + step;
      const [ax, ay] = pOn(iso, f, s0, 0, z);
      const [bx, by] = pOn(iso, f, s1, 0, zTop);
      const [cx, cy] = pOn(iso, f, s1, 0, z);
      const [dx, dy] = pOn(iso, f, s0, 0, zTop);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.moveTo(cx, cy);
      ctx.lineTo(dx, dy);
      ctx.stroke();
    }
    // Horizontal ring beam at each diagrid node level.
    wallOn(iso, f, a0, a1, zTop - 0.5, zTop + 0.5, steel);
  }

  // Night window marks inside the diagrid.
  for (let k = 0; k < m.floors; k++) {
    const z = m.z0 + k * fh;
    for (let b = 0; b < bays; b++) {
      const s0 = a0 + b * step + 0.03;
      const s1 = a0 + (b + 1) * step - 0.03;
      if (z + 1.5 >= zStart) markWindow(iso, f, s0, s1, z + 1.5, z + fh - 1.2);
    }
  }
  if (ground && isFront) entrance(iso, f, fh);
}
