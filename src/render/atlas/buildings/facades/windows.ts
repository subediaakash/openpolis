import { flatTone, shade, wallOn, type FaceRef, type IsoFrame } from '../../core';
import { glassFill, glazing, markWindow } from './glazing';
import { entrance, type FacadeArgs } from './kit';

/** Brick: mortar courses, a soft speckle of darker bricks, and a string course at every floor. */
function brickTexture(iso: IsoFrame, f: FaceRef, z0: number, z1: number, floors: number, fh: number, wall: string) {
  for (let z = z0 + 2.6; z < z1 - 1; z += 1.5) iso.wall(f.face, f.at, f.a0, f.a1, z, z + 0.28, 'rgba(255,255,255,0.07)');
  const dark = shade(flatTone(wall, f.face), -0.12);
  const n = Math.round((f.a1 - f.a0) * 30);
  for (let k = 0; k < n; k++) {
    const a = f.a0 + ((k * 0.618) % 1) * (f.a1 - f.a0);
    const z = z0 + 3 + ((k * 0.377) % 1) * (z1 - z0 - 4);
    iso.wall(f.face, f.at, a, a + 0.03, z, z + 1.2, dark);
  }
  for (let k = 1; k < floors; k++) iso.wall(f.face, f.at, f.a0, f.a1, z0 + k * fh, z0 + k * fh + 0.7, 'rgba(0,0,0,0.12)');
}

/** Timber siding: lap boards, each with a lit lower lip and a shadow line. */
function sidingTexture(iso: IsoFrame, f: FaceRef, z0: number, z1: number) {
  for (let z = z0 + 2.5; z < z1 - 0.5; z += 1.6) {
    iso.wall(f.face, f.at, f.a0, f.a1, z, z + 0.35, 'rgba(0,0,0,0.1)');
    iso.wall(f.face, f.at, f.a0, f.a1, z + 0.35, z + 0.6, 'rgba(255,255,255,0.08)');
  }
}

/**
 * Shop ground floor on the front: four real-world storefront layouts picked by rng so neighbouring
 * shops and cafés never look like identical boxes:
 * 0: classic display window + warm shelves + side door
 * 1: Parisian dual-bay symmetrical windows flanking a recessed centre entry
 * 2: full-height modern frameless showcase glazing with hanging warm pendant lamps
 * 3: warm cedar-slatted bulkhead with wide coffee/boutique pass-through counter
 */
function shopfront(iso: IsoFrame, f: FaceRef, fh: number, wall: string, rng: () => number) {
  const { a0, a1 } = f;
  const len = a1 - a0;
  const style = Math.floor(rng() * 4);

  if (style === 1) {
    // Symmetrical Parisian dual-bay storefront with recessed centre glass door.
    const mid = a0 + len * 0.5;
    wallOn(iso, f, a0 + 0.03, a1 - 0.03, 0.5, 2.2, flatTone(shade(wall, -0.38), f.face));
    for (const [w0, w1] of [
      [a0 + 0.05, mid - len * 0.14],
      [mid + len * 0.14, a1 - 0.05],
    ] as const) {
      wallOn(iso, f, w0, w1, 2.2, fh - 2.3, glassFill(iso, f, w0, w1, 2.2, fh - 2.3, '#385c78'));
      wallOn(iso, f, w0 + 0.015, w1 - 0.015, 2.6, 4.8, 'rgba(255, 224, 170, 0.48)');
      markWindow(iso, f, w0, w1, 2.2, fh - 2.3);
    }
    wallOn(iso, f, mid - len * 0.11, mid + len * 0.11, 0.8, fh - 1.8, '#efe8da');
    wallOn(iso, f, mid - len * 0.09, mid + len * 0.09, 0.8, fh - 2.3, '#3c291e');
    wallOn(iso, f, mid - len * 0.06, mid + len * 0.06, 2.8, fh - 3.6, 'rgba(255, 228, 176, 0.55)');
    return;
  }

  if (style === 2) {
    // Modern frameless floor-to-ceiling showcase glass with warm hanging pendant lamps.
    wallOn(iso, f, a0 + 0.04, a1 - 0.04, 0.6, fh - 1.6, glassFill(iso, f, a0, a1, 0.6, fh - 1.6, '#2b475e'));
    wallOn(iso, f, a0 + 0.06, a1 - 0.06, 1.4, 4.2, 'rgba(255, 232, 185, 0.4)');
    for (let k = 1; k <= 3; k++) {
      const a = a0 + (len * k) / 4;
      wallOn(iso, f, a - 0.005, a + 0.005, fh - 4.2, fh - 1.6, 'rgba(30, 36, 44, 0.5)');
      wallOn(iso, f, a - 0.018, a + 0.018, fh - 5.2, fh - 4.0, 'rgba(255, 238, 178, 0.85)');
    }
    markWindow(iso, f, a0 + 0.04, a1 - 0.04, 1.2, fh - 1.8);
    return;
  }

  if (style === 3) {
    // Warm cedar-slatted bulkhead with wide coffee/boutique counter window.
    wallOn(iso, f, a0 + 0.03, a1 - 0.03, 0.5, 3.6, flatTone('#8f5d38', f.face));
    for (let a = a0 + 0.06; a < a1 - 0.05; a += 0.045) wallOn(iso, f, a, a + 0.012, 0.6, 3.5, 'rgba(40, 22, 10, 0.25)');
    const w1 = a1 - len * 0.28;
    wallOn(iso, f, a0 + 0.05, w1, 3.6, fh - 2.1, glassFill(iso, f, a0, w1, 3.6, fh - 2.1, '#314f66'));
    wallOn(iso, f, a0 + 0.06, w1 - 0.01, 3.6, 4.4, '#e8dcc8'); // wooden counter ledge
    wallOn(iso, f, a0 + 0.07, w1 - 0.02, 4.4, 6.2, 'rgba(255, 224, 166, 0.45)');
    markWindow(iso, f, a0 + 0.05, w1, 3.6, fh - 2.1);
    const d0 = a1 - len * 0.23;
    const d1 = a1 - len * 0.07;
    wallOn(iso, f, d0, d1, 0.8, fh - 2.2, '#3d2a1e');
    wallOn(iso, f, d0 + 0.02, d1 - 0.02, 3.2, fh - 3.6, 'rgba(175, 212, 236, 0.68)');
    return;
  }

  // Style 0: classic display window with warm interior shelves & side door.
  wallOn(iso, f, a0 + 0.04, a1 - 0.04, 0.6, 2.2, flatTone(shade(wall, -0.45), f.face));
  const w1 = a1 - len * 0.32;
  wallOn(iso, f, a0 + 0.06, w1, 2.2, fh - 2.5, glassFill(iso, f, a0, w1, 2.2, fh - 2.5, '#3f6280'));
  wallOn(iso, f, a0 + 0.08, w1 - 0.02, 2.6, 5, 'rgba(255, 228, 176, 0.45)');
  for (let a = a0 + 0.12; a < w1 - 0.06; a += 0.09) wallOn(iso, f, a, a + 0.04, 3, 4.6, 'rgba(120, 70, 40, 0.35)');
  wallOn(iso, f, a0 + 0.06, w1, fh - 3.3, fh - 2.5, 'rgba(10, 16, 26, 0.35)');
  markWindow(iso, f, a0 + 0.06, w1, 2.2, fh - 2.5);
  const d0 = a1 - len * 0.26;
  const d1 = a1 - len * 0.1;
  wallOn(iso, f, d0 - 0.01, d1 + 0.01, 1, fh - 2, '#efe8da');
  wallOn(iso, f, d0, d1, 1, fh - 2.5, '#4f3322');
  wallOn(iso, f, d0 + 0.02, d1 - 0.02, 3, fh - 4, 'rgba(170, 205, 230, 0.65)');
}

/** Punched windows in a plain, brick or sided wall, with shopfronts, front doors, lintels and shutters. */
export function paintWindows({ iso, art, m, f, isFront, rng }: FacadeArgs) {
  const fh = art.floorH;
  const { a0, a1 } = f;
  const len = a1 - a0;
  const ground = m.z0 === 0;
  const H = m.z1;
  const facade = m.facade;
  const cols = Math.max(2, Math.round(len * (facade === 'brick' ? 4 : 3.4)));
  const step = len / cols;
  if (facade === 'brick') brickTexture(iso, f, m.z0, H, m.floors, fh, m.wall);
  if (facade === 'siding') sidingTexture(iso, f, m.z0, H);

  const shop = facade === 'shopfront';
  const lintel = facade === 'brick' ? (art.trim ?? '#e8dcc8') : facade === 'punched' ? art.trim : undefined;
  const shutters = facade === 'siding';
  const shutterColor = flatTone(['#3f6b4f', '#2f5577', '#7a3a32'][Math.floor(rng() * 3)], f.face);
  for (let k = 0; k < m.floors; k++) {
    const z0 = m.z0 + k * fh;
    if (shop && k === 0 && ground) {
      if (isFront) {
        shopfront(iso, f, fh, m.wall, rng);
      } else {
        // Side street display window with stone kick-plate, mullions and warm interior ambiance.
        wallOn(iso, f, a0 + 0.05, a1 - 0.05, 0.6, 2.2, flatTone(shade(m.wall, -0.4), f.face));
        wallOn(iso, f, a0 + 0.07, a1 - 0.07, 2.2, fh - 2.4, glassFill(iso, f, a0, a1, 2.2, fh - 2.4, '#365874'));
        wallOn(iso, f, a0 + 0.09, a1 - 0.09, 2.6, 4.8, 'rgba(255, 224, 170, 0.35)');
        const mid = (a0 + a1) / 2;
        wallOn(iso, f, mid - 0.01, mid + 0.01, 2.2, fh - 2.4, flatTone(shade(m.wall, -0.2), f.face));
        markWindow(iso, f, a0 + 0.07, a1 - 0.07, 2.2, fh - 2.4);
      }
      continue;
    }
    const door = isFront && k === 0 && ground;
    if (door && m.floors <= 4) {
      const mid = a0 + len * 0.5;
      const top = Math.min(fh, 10);
      wallOn(iso, f, mid - 0.085, mid + 0.085, 1.5, top, '#f1ebdf');
      wallOn(iso, f, mid - 0.065, mid + 0.065, 1.5, top - 1, flatTone('#6b4428', f.face));
      wallOn(iso, f, mid - 0.065, mid + 0.065, top - 2.6, top - 1, 'rgba(255, 236, 190, 0.5)');
      wallOn(iso, f, mid + 0.035, mid + 0.045, 4.6, 5.4, '#d9b64a');
      for (let c = 0; c < cols; c++) {
        const s0 = a0 + c * step + step * 0.22;
        if (Math.abs(s0 + step * 0.28 - mid) < step * 0.6) continue;
        glazing(iso, f, s0, s0 + step * 0.56, z0 + 3, z0 + fh - 2.5, rng, { glass: art.glass });
      }
      continue;
    }
    if (door) {
      entrance(iso, f, fh);
      continue;
    }
    for (let c = 0; c < cols; c++) {
      const s0 = a0 + c * step + step * 0.22;
      const s1 = s0 + step * 0.56;
      glazing(iso, f, s0, s1, z0 + 2.5, z0 + fh - 2, rng, { glass: art.glass });
      if (lintel) wallOn(iso, f, s0 - 0.012, s1 + 0.012, z0 + fh - 2, z0 + fh - 1.2, flatTone(lintel, f.face));
      if (shutters) {
        wallOn(iso, f, s0 - 0.042, s0 - 0.006, z0 + 2.5, z0 + fh - 2, shutterColor);
        wallOn(iso, f, s1 + 0.006, s1 + 0.042, z0 + 2.5, z0 + fh - 2, shutterColor);
      }
    }
  }
  // Cornice: a projecting band with the shadow it casts on the wall below.
  if (m.top && art.roof === 'flat') {
    wallOn(iso, f, a0, a1, H - 1.4, H, flatTone(art.trim ?? shade(m.wall, -0.12), f.face));
    wallOn(iso, f, a0, a1, H - 2.4, H - 1.4, 'rgba(0,0,0,0.12)');
  }
}
