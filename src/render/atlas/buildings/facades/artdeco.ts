import { flatTone, shade, wallOn } from '../../core';
import { glassFill, markWindow } from './glazing';
import { entrance, type FacadeArgs } from './kit';

/**
 * Art Deco vertical piers (`artdeco`): strong continuous limestone/terracotta piers rising
 * unbroken to the crown, with recessed dark-bronze spandrels and brass accent bands.
 */
export function paintArtDeco({ iso, art, m, f, isFront }: FacadeArgs) {
  const fh = art.floorH;
  const { a0, a1 } = f;
  const len = a1 - a0;
  const ground = m.z0 === 0;
  const H = m.z1;
  const cols = Math.max(2, Math.round(len * 3.6));
  const step = len / cols;
  const pier = flatTone(m.wall, f.face);
  const pierHighlight = flatTone(art.trim ?? shade(m.wall, 0.14), f.face);
  const spandrel = flatTone('#3a444d', f.face);
  const brass = flatTone('#c9a45c', f.face);

  // Recessed vertical window channels between piers.
  for (let c = 0; c < cols; c++) {
    const s0 = a0 + c * step + step * 0.22;
    const s1 = a0 + (c + 1) * step - step * 0.22;
    const zStart = m.z0 + (ground ? fh : 0);
    if (H > zStart) {
      // Dark bronze vertical backing for the whole column.
      wallOn(iso, f, s0, s1, zStart, H - 1.5, spandrel);
      for (let k = ground ? 1 : 0; k < m.floors; k++) {
        const z = m.z0 + k * fh;
        const wz0 = z + 2.2;
        const wz1 = z + fh - 1.2;
        wallOn(iso, f, s0 + 0.008, s1 - 0.008, wz0, wz1, glassFill(iso, f, s0, s1, wz0, wz1, art.glass ?? '#273f54'));
        // Brass chevron/bar ornament on the recessed spandrel panel.
        wallOn(iso, f, s0 + 0.015, s1 - 0.015, z + 0.7, z + 1.5, brass);
        markWindow(iso, f, s0 + 0.01, s1 - 0.01, wz0, wz1);
      }
    }
  }

  // Strong continuous vertical stone piers with fluted light catch.
  for (let c = 0; c <= cols; c++) {
    const a = a0 + c * step;
    const pw = step * 0.2;
    const p0 = Math.max(a0, a - pw);
    const p1 = Math.min(a1, a + pw);
    wallOn(iso, f, p0, p1, m.z0, H, pier);
    wallOn(iso, f, p0, p0 + (p1 - p0) * 0.35, m.z0, H, pierHighlight);
  }

  // Stepped Art Deco crown frieze & gold trim line.
  if (m.top && art.roof === 'flat') {
    wallOn(iso, f, a0, a1, H - 2.4, H, pierHighlight);
    wallOn(iso, f, a0 + 0.02, a1 - 0.02, H - 3.2, H - 2.4, brass);
  }

  if (ground && isFront) {
    entrance(iso, f, fh);
    // Brass marquee lintel over the Deco entrance.
    wallOn(iso, f, a0 + len * 0.25, a1 - len * 0.25, fh - 1.8, fh - 0.6, brass);
  }
}
