import type { Painting } from '../context';
import type { Extra } from '../recipes';
import { paintAntenna, paintCrown, paintSpire } from './crowns';
import { paintHoseTower, paintHvac, paintWaterTank } from './equipment';
import { paintBillboard, paintPergola, paintSkylight } from './features';
import type { RooftopPainter } from './kit';
import { paintHelipad, paintPool, paintRoofGarden, paintSolar } from './leisure';

/** Rooftop extras in drawing order (flat surfaces first, tall items last). */
const ROOFTOP: readonly (readonly [Extra, RooftopPainter])[] = [
  ['solar', paintSolar],
  ['roofgarden', paintRoofGarden],
  ['pool', paintPool],
  ['pergola', paintPergola],
  ['skylight', paintSkylight],
  ['acunits', paintHvac],
  ['helipad', paintHelipad],
  ['watertank', paintWaterTank],
  ['hosetower', paintHoseTower],
  ['billboard', paintBillboard],
  ['crown', paintCrown],
  ['antenna', paintAntenna],
  ['spire', paintSpire],
];

/** Everything on a flat roof. */
export function paintRooftop(p: Painting) {
  if (p.art.roof !== 'flat') return;
  const top = p.ms[p.ms.length - 1];
  const ex = new Set(p.art.extras);
  for (const [extra, paint] of ROOFTOP) if (ex.has(extra)) paint({ p, top, tb: top.view, H: top.z1 });
}
