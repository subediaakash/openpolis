import { DIRS } from '../../../sim/roads';
import { type IsoFrame } from '../core';
import { LAMP, pole, POLE } from '../streetArt';
import { gratedTree } from './avenueFurniture';

/**
 * What stands on one-way carriageways (docs/specs/transport.md): boulevard median trees,
 * promenade lamps, benches, kiosks & bike docks; expressway high-mast lamps, acoustic sound
 * barriers, cantilever VMS boards & SOS call boxes. Positions use the carriageway's own frame
 * (roads/oneway.ts): lateral 0 = median edge, 1 = outer edge.
 */

export const WIDE_STYLES = 5;

/** View-tile point at lateral `l`, along `s`, on a one-way tile travelling in direction `d`. */
function at(d: number, l: number, s: number): [number, number] {
  const [lx, ly] = DIRS[(d + 3) % 4];
  const lat = lx + ly < 0 ? l : 1 - l;
  return d % 2 === 1 ? [s, lat] : [lat, s];
}

function wideBox(d: number, l0: number, l1: number, s0: number, s1: number) {
  const [u0, v0] = at(d, l0, s0);
  const [u1, v1] = at(d, l1, s1);
  return { u0: Math.min(u0, u1), u1: Math.max(u0, u1), v0: Math.min(v0, v1), v1: Math.max(v0, v1) };
}

/** A lamp at lateral `l` whose arm reaches toward lateral `to`. */
function lamp(iso: IsoFrame, d: number, l: number, to: number, s: number, h: number) {
  const [u, v] = at(d, l, s);
  const [hu, hv] = at(d, to, s);
  iso.disc(u, v, 0.02, 0, 'rgba(0, 0, 0, 0.22)');
  pole(iso, u, v, 0, h, h > 20 ? 1.6 : 1.2);
  const ctx = iso.ctx;
  const a = iso.p(u, v, h);
  const b = iso.p(hu, hv, h + 1);
  ctx.strokeStyle = POLE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 236, 160, 0.28)';
  ctx.beginPath();
  ctx.ellipse(b[0], b[1] + 1.6, 3.4, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = LAMP;
  ctx.fillRect(b[0] - 1.5, b[1] - 0.2, 3, 1.4);
}

export function paintBoulevardFurniture(iso: IsoFrame, d: number, style: number) {
  // Trees along this side of the median; the twin tile fills the other side, offset.
  gratedTree(iso, ...at(d, 0.045, style % 2 === 0 ? 0.3 : 0.75), style % 4, 0.48);
  if (style === 1) {
    lamp(iso, d, 0.9, 0.7, 0.35, 16);
  } else if (style === 2) {
    // Promenade wooden bench + flowering planter.
    const b = wideBox(d, 0.87, 0.94, 0.22, 0.46);
    iso.box(b.u0, b.u1, b.v0, b.v1, 1.4, 2.5, '#a8784a', '#7f5a36', '#c89262');
    const p = wideBox(d, 0.86, 0.95, 0.62, 0.8);
    iso.box(p.u0, p.u1, p.v0, p.v1, 0, 2.6, '#c7bfb2', '#9e978b', '#528f44');
  } else if (style === 3) {
    // Heritage double-globe lamp + ornamental shrub on the promenade.
    const [u, v] = at(d, 0.9, 0.55);
    pole(iso, u, v, 0, 14, 1.2);
    const [ax, ay] = iso.p(u, v, 14);
    for (const dx of [-2.8, 2.8]) {
      iso.ctx.fillStyle = '#fff4c4';
      iso.ctx.beginPath();
      iso.ctx.arc(ax + dx, ay - 0.8, 1.5, 0, Math.PI * 2);
      iso.ctx.fill();
    }
    gratedTree(iso, ...at(d, 0.9, 0.2), 2, 0.36);
  } else if (style === 4) {
    // Compact promenade kiosk / transit info totem.
    const k = wideBox(d, 0.86, 0.95, 0.35, 0.62);
    iso.solid(k, 0, 8.5, '#2b6b8f', '#e2e8ee');
    iso.box(k.u0 - 0.01, k.u1 + 0.01, k.v0 - 0.01, k.v1 + 0.01, 8.5, 9.8, '#e05d4a', '#a83c2e', '#f27866');
  }
}

export function paintExpresswayFurniture(iso: IsoFrame, d: number, style: number) {
  if (style === 0) {
    // High-mast median lamp.
    lamp(iso, d, 0.025, 0.3, 0.5, 26);
  } else if (style === 1) {
    // Acoustic glass & concrete sound-barrier wall along the outer shoulder.
    const w = wideBox(d, 0.92, 0.98, 0.04, 0.96);
    iso.solid(w, 0, 3.8, '#b4b0a6', '#ccc8be');
    iso.box(w.u0, w.u1, w.v0, w.v1, 3.8, 12, 'rgba(135, 180, 212, 0.55)', 'rgba(95, 138, 172, 0.55)', '#ccd5dd');
  } else if (style === 2) {
    // Cantilever digital speed / lane-status VMS pole on the outer edge.
    const [u, v] = at(d, 0.94, 0.5);
    const [hu, hv] = at(d, 0.55, 0.5);
    pole(iso, u, v, 0, 22, 1.6);
    const a = iso.p(u, v, 21);
    const b = iso.p(hu, hv, 21);
    iso.ctx.strokeStyle = '#68707a';
    iso.ctx.lineWidth = 1.6;
    iso.ctx.beginPath();
    iso.ctx.moveTo(a[0], a[1]);
    iso.ctx.lineTo(b[0], b[1]);
    iso.ctx.stroke();
    const board = wideBox(d, 0.55, 0.88, 0.44, 0.56);
    iso.box(board.u0, board.u1, board.v0, board.v1, 18, 22.5, '#1b2028', '#11151b', '#3a414c');
    const [bx, by] = iso.p(...at(d, 0.72, 0.5), 20.2);
    iso.ctx.fillStyle = '#ffbe3d';
    iso.ctx.fillRect(bx - 3, by - 1, 6, 2);
  } else if (style === 3) {
    // Orange emergency SOS call box + reflector marker post.
    const sos = wideBox(d, 0.91, 0.97, 0.44, 0.52);
    iso.box(sos.u0, sos.u1, sos.v0, sos.v1, 0, 6.5, '#e86f24', '#b55216', '#ff8c42');
    const [mu, mv] = at(d, 0.94, 0.8);
    pole(iso, mu, mv, 0, 4.5, 1);
  }
  // style === 4: open stretch for realistic expressway visual spacing.
}
