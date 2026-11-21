import { alpha, shade } from '../../core';
import { roofSpot } from '../context';
import type { RooftopArgs } from './kit';

/** Raised glazed atrium skylight on a flat roof: framed pyramid/ridge with sky reflection. */
export function paintSkylight({ p, top, tb, H }: RooftopArgs) {
  const { iso, o } = p;
  const [cu, cv] = roofSpot(o, top, 0.5, 0.5);
  const hw = Math.min(0.24, (tb.u1 - tb.u0) * 0.28);
  const hv = Math.min(0.2, (tb.v1 - tb.v0) * 0.26);
  const peak = H + 5.5;
  // Base curb.
  iso.box(cu - hw, cu + hw, cv - hv, cv + hv, H + 0.4, H + 1.6, '#d8dde3', '#9aa3ad', '#eef2f5');
  // Four glazed triangular slopes meeting at the apex.
  const apex = iso.p(cu, cv, peak);
  iso.poly([iso.p(cu - hw, cv - hv, H + 1.6), iso.p(cu + hw, cv - hv, H + 1.6), apex], '#426a8c');
  iso.poly([iso.p(cu + hw, cv - hv, H + 1.6), iso.p(cu + hw, cv + hv, H + 1.6), apex], '#5282aa');
  iso.poly([iso.p(cu - hw, cv + hv, H + 1.6), iso.p(cu + hw, cv + hv, H + 1.6), apex], '#7db5dc');
  iso.poly([iso.p(cu - hw, cv - hv, H + 1.6), iso.p(cu - hw, cv + hv, H + 1.6), apex], '#649cc4');
  // Crisp white mullion ridges.
  const c = iso.ctx;
  c.strokeStyle = alpha('#ffffff', 0.65);
  c.lineWidth = 0.7;
  for (const [u, v] of [
    [cu - hw, cv + hv],
    [cu + hw, cv + hv],
    [cu + hw, cv - hv],
  ] as const) {
    const [bx, by] = iso.p(u, v, H + 1.6);
    c.beginPath();
    c.moveTo(bx, by);
    c.lineTo(apex[0], apex[1]);
    c.stroke();
  }
}

/** Timber/steel rooftop terrace pergola with shade slats and planter boxes. */
export function paintPergola({ p, top, tb, H }: RooftopArgs) {
  const { iso, o } = p;
  const [cu, cv] = roofSpot(o, top, 0.5, 0.5);
  const hw = Math.min(0.26, (tb.u1 - tb.u0) * 0.3);
  const hv = Math.min(0.22, (tb.v1 - tb.v0) * 0.28);
  const zTop = H + 6.5;
  // Decking floor.
  iso.floor(cu - hw - 0.03, cu + hw + 0.03, cv - hv - 0.03, cv + hv + 0.03, H + 0.5, '#b8946e');
  // Four corner posts.
  for (const [u, v] of [
    [cu - hw, cv - hv],
    [cu + hw, cv - hv],
    [cu - hw, cv + hv],
    [cu + hw, cv + hv],
  ] as const) {
    iso.box(u - 0.015, u + 0.015, v - 0.015, v + 0.015, H + 0.5, zTop, '#7d5a38', '#5c4127', '#997049');
  }
  // Overhead timber slats.
  for (let k = 0; k <= 4; k++) {
    const t = k / 4;
    const u = cu - hw + 2 * hw * t;
    iso.box(u - 0.014, u + 0.014, cv - hv - 0.02, cv + hv + 0.02, zTop, zTop + 1, '#a67a4e', '#7c5937', '#c49566');
  }
}

const BILLBOARD_PALETTES = [
  ['#1f6fb2', '#52b2f5', '#ffffff'],
  ['#c93b3b', '#f2a922', '#fff7e6'],
  ['#228a62', '#6fe0a8', '#ffffff'],
  ['#6a3fb5', '#d966c8', '#ffffff'],
] as const;

/** Urban rooftop billboard on twin steel struts, facing the front. */
export function paintBillboard({ p, top, tb, H }: RooftopArgs) {
  const { iso, o } = p;
  const [cu, cv] = roofSpot(o, top, 0.5, 0.72);
  const hw = Math.min(0.28, (tb.u1 - tb.u0) * 0.34);
  const pal = BILLBOARD_PALETTES[Math.abs(Math.round((tb.u0 + tb.v0) * 37 + H)) % BILLBOARD_PALETTES.length];
  // Twin struts.
  for (const du of [-hw * 0.65, hw * 0.65]) {
    iso.box(cu + du - 0.015, cu + du + 0.015, cv - 0.015, cv + 0.015, H + 0.4, H + 6, '#5c646e', '#3e444c', '#767f8a');
  }
  // Board frame + colourful graphic stripes.
  iso.box(cu - hw, cu + hw, cv - 0.02, cv + 0.02, H + 4.5, H + 14.5, pal[0], shade(pal[0], -0.25), '#3c424a');
  iso.wall('sw', cv + 0.02, cu - hw + 0.02, cu + hw - 0.02, H + 5.5, H + 13.5, pal[0]);
  iso.wall('sw', cv + 0.02, cu - hw + 0.04, cu + hw * 0.15, H + 7.5, H + 11.5, pal[1]);
  iso.wall('sw', cv + 0.02, cu + hw * 0.25, cu + hw - 0.04, H + 8.5, H + 10.5, pal[2]);
}
