import { type IsoFrame } from '../core';
import { LAMP, onRoad, pole, type RoadAxis } from '../streetArt';
import { gratedTree } from './avenueFurniture';

/** What stands on a pedestrian street: benches, planters, lamps, café parasols, market stalls, festoon arches. */
export const PEDESTRIAN_STYLES = 6;

function bench(iso: IsoFrame, axis: RoadAxis, s: number, o: number) {
  const [u0, v0] = onRoad(axis, s - 0.07, o - 0.025);
  const [u1, v1] = onRoad(axis, s + 0.07, o + 0.025);
  const box = { u0: Math.min(u0, u1), u1: Math.max(u0, u1), v0: Math.min(v0, v1), v1: Math.max(v0, v1) };
  iso.box(box.u0, box.u1, box.v0, box.v1, 1.6, 2.6, '#a8784a', '#7f5a36', '#c89262');
  for (const k of [-0.05, 0.05]) {
    const [u, v] = onRoad(axis, s + k, o);
    pole(iso, u, v, 0, 1.6, 0.8);
  }
}

function planter(iso: IsoFrame, axis: RoadAxis, s: number, o: number, tone: number) {
  const [u, v] = onRoad(axis, s, o);
  iso.box(u - 0.06, u + 0.06, v - 0.06, v + 0.06, 0, 3, '#c9c2b5', '#a59d90', '#5f8f45');
  gratedTree(iso, u, v, tone, 0.42);
}

function postLamp(iso: IsoFrame, axis: RoadAxis, s: number, o: number) {
  const [u, v] = onRoad(axis, s, o);
  iso.disc(u, v, 0.02, 0, 'rgba(0, 0, 0, 0.2)');
  pole(iso, u, v, 0, 12, 1.1);
  const [x, y] = iso.p(u, v, 12);
  iso.ctx.fillStyle = 'rgba(255, 236, 160, 0.3)';
  iso.ctx.beginPath();
  iso.ctx.arc(x, y, 3, 0, Math.PI * 2);
  iso.ctx.fill();
  iso.ctx.fillStyle = LAMP;
  iso.ctx.fillRect(x - 1.3, y - 1.3, 2.6, 2.6);
}

/** Café parasol umbrella table with two chairs. */
function cafeParasol(iso: IsoFrame, axis: RoadAxis, s: number, o: number, color: string) {
  const [u, v] = onRoad(axis, s, o);
  iso.disc(u, v, 0.08, 0.1, 'rgba(0, 0, 0, 0.16)');
  pole(iso, u, v, 0, 9.5, 0.9);
  iso.disc(u, v, 0.055, 3.2, '#e8e2d5');
  iso.disc(u, v, 0.11, 9.5, color);
  iso.disc(u, v, 0.04, 10.2, '#ffffff');
}

/** Artisan market stall / flower kiosk with striped awning. */
function marketStall(iso: IsoFrame, axis: RoadAxis, s: number, o: number) {
  const [u0, v0] = onRoad(axis, s - 0.1, o - 0.06);
  const [u1, v1] = onRoad(axis, s + 0.1, o + 0.06);
  const b = { u0: Math.min(u0, u1), u1: Math.max(u0, u1), v0: Math.min(v0, v1), v1: Math.max(v0, v1) };
  iso.box(b.u0, b.u1, b.v0, b.v1, 0, 4.2, '#b37e4a', '#855a32', '#d49d66');
  for (const ds of [-0.09, 0.09]) {
    const [pu, pv] = onRoad(axis, s + ds, o);
    pole(iso, pu, pv, 4.2, 10, 0.8);
  }
  iso.box(b.u0 - 0.015, b.u1 + 0.015, b.v0 - 0.015, b.v1 + 0.015, 9.5, 11, '#2b8a6e', '#1e6650', '#3ca685');
}

/** Overhead warm festoon string-light arch spanning the promenade. */
function festoonArch(iso: IsoFrame, axis: RoadAxis, s: number) {
  const [u0, v0] = onRoad(axis, s, -0.36);
  const [u1, v1] = onRoad(axis, s, 0.36);
  pole(iso, u0, v0, 0, 14, 1.1);
  pole(iso, u1, v1, 0, 14, 1.1);
  const a = iso.p(u0, v0, 14);
  const b = iso.p(u1, v1, 14);
  const c = iso.ctx;
  c.strokeStyle = '#4a4e54';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(a[0], a[1]);
  c.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 4, b[0], b[1]);
  c.stroke();
  for (let k = 1; k <= 5; k++) {
    const t = k / 6;
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 2.2;
    c.fillStyle = '#ffec9e';
    c.beginPath();
    c.arc(x, y, 1.2, 0, Math.PI * 2);
    c.fill();
  }
}

export function paintPedestrianFurniture(iso: IsoFrame, axis: RoadAxis, style: number) {
  if (style === 0) {
    planter(iso, axis, 0.3, -0.3, 0);
    bench(iso, axis, 0.65, 0.33);
  } else if (style === 1) {
    postLamp(iso, axis, 0.25, 0.36);
    planter(iso, axis, 0.7, 0.3, 2);
  } else if (style === 2) {
    bench(iso, axis, 0.35, -0.33);
    postLamp(iso, axis, 0.7, -0.36);
  } else if (style === 3) {
    cafeParasol(iso, axis, 0.3, -0.3, '#d9534f');
    cafeParasol(iso, axis, 0.72, 0.3, '#2e86ab');
  } else if (style === 4) {
    marketStall(iso, axis, 0.45, -0.31);
    planter(iso, axis, 0.78, 0.32, 1);
  } else {
    festoonArch(iso, axis, 0.5);
    bench(iso, axis, 0.24, 0.33);
  }
}
