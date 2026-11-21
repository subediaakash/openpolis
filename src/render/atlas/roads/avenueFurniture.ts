import type { IsoFrame } from '../core';
import { paintRoundTree } from '../nature/trees';
import { LAMP, onRoad, pole, POLE, type RoadAxis } from '../streetArt';

/**
 * What stands on an avenue's median (docs/specs/transport.md): grated trees, double-headed lamps,
 * clipped hedges, ornamental flowerbeds, tall accent trees and public-art plinths.
 */

export const AVENUE_STYLES = 6;

const TREE_SIZE = 0.5;

/** A tree in a square iron grate on the median. */
export function gratedTree(iso: IsoFrame, u: number, v: number, tone: number, size = TREE_SIZE) {
  iso.floor(u - 0.045, u + 0.045, v - 0.045, v + 0.045, 0.3, '#5d544a');
  iso.floor(u - 0.032, u + 0.032, v - 0.032, v + 0.032, 0.4, '#4a3e33');
  const [x, y] = iso.p(u, v, 0);
  paintRoundTree(iso.ctx, x, y, size, tone);
}

/** A low clipped hedge block along the road axis. */
export function hedge(iso: IsoFrame, axis: RoadAxis, s0: number, s1: number, o: number, w = 0.03, h = 2.2) {
  const [u0, v0] = onRoad(axis, s0, o - w);
  const [u1, v1] = onRoad(axis, s1, o + w);
  iso.box(Math.min(u0, u1), Math.max(u0, u1), Math.min(v0, v1), Math.max(v0, v1), 0.3, h, '#4f9a3c', '#3c7d2e', '#6cbc4f');
}

/** Ornamental flowerbed planter along the median. */
function flowerBed(iso: IsoFrame, axis: RoadAxis, s0: number, s1: number) {
  const [u0, v0] = onRoad(axis, s0, -0.035);
  const [u1, v1] = onRoad(axis, s1, 0.035);
  iso.box(Math.min(u0, u1), Math.max(u0, u1), Math.min(v0, v1), Math.max(v0, v1), 0.2, 2, '#cbc4b7', '#9e978b', '#5b9646');
  const blooms = ['#e85b6f', '#f4c842', '#f28c38', '#c26de6'];
  for (let k = 0; k < 4; k++) {
    const [u, v] = onRoad(axis, s0 + ((s1 - s0) * (k + 0.5)) / 4, 0);
    const [x, y] = iso.p(u, v, 2.5);
    iso.ctx.fillStyle = blooms[k];
    iso.ctx.beginPath();
    iso.ctx.arc(x, y, 1.3, 0, Math.PI * 2);
    iso.ctx.fill();
  }
}

/** A median lamp: one pole, two arms over both carriageways. */
export function medianLamp(iso: IsoFrame, axis: RoadAxis, s: number, reach: number, h = 17) {
  const [u, v] = onRoad(axis, s, 0);
  iso.disc(u, v, 0.02, 0, 'rgba(0, 0, 0, 0.22)');
  pole(iso, u, v, 0, h, 1.2);
  const ctx = iso.ctx;
  const top = iso.p(u, v, h);
  for (const side of [-1, 1]) {
    const [hu, hv] = onRoad(axis, s, side * reach);
    const head = iso.p(hu, hv, h + 1);
    ctx.strokeStyle = POLE;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(top[0], top[1]);
    ctx.lineTo(head[0], head[1]);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 236, 160, 0.26)';
    ctx.beginPath();
    ctx.ellipse(head[0], head[1] + 1.4, 2.8, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = LAMP;
    ctx.fillRect(head[0] - 1.3, head[1] - 0.2, 2.6, 1.2);
  }
}

export function paintAvenueFurniture(iso: IsoFrame, axis: RoadAxis, style: number) {
  if (style === 0) {
    hedge(iso, axis, 0.08, 0.3, 0);
    gratedTree(iso, ...onRoad(axis, 0.55, 0), 0);
  } else if (style === 1) {
    hedge(iso, axis, 0.1, 0.38, 0);
    medianLamp(iso, axis, 0.5, 0.11);
    hedge(iso, axis, 0.62, 0.9, 0);
  } else if (style === 2) {
    gratedTree(iso, ...onRoad(axis, 0.35, 0), 1);
    hedge(iso, axis, 0.6, 0.9, 0);
  } else if (style === 3) {
    flowerBed(iso, axis, 0.12, 0.88);
  } else if (style === 4) {
    gratedTree(iso, ...onRoad(axis, 0.24, 0), 2, 0.44);
    medianLamp(iso, axis, 0.56, 0.11, 15);
    gratedTree(iso, ...onRoad(axis, 0.82, 0), 3, 0.44);
  } else {
    // Public-art stone obelisk plinth flanked by clipped hedges.
    hedge(iso, axis, 0.08, 0.34, 0);
    const [u, v] = onRoad(axis, 0.5, 0);
    iso.box(u - 0.04, u + 0.04, v - 0.04, v + 0.04, 0.2, 3.2, '#d9d3c7', '#aba498', '#ece7dc');
    iso.box(u - 0.022, u + 0.022, v - 0.022, v + 0.022, 3.2, 11, '#58829e', '#3d5f78', '#78a5c4');
    hedge(iso, axis, 0.66, 0.92, 0);
  }
}
