/**
 * How good is the /demo city? Builds it, runs it like a player would watch it, and prints
 * population, happiness and what holds happiness back (D-106).
 *
 *   bun scripts/demo-report.ts [--seed 42] [--days 30]
 */
import { parseArgs } from 'node:util';
import { BUILDINGS } from '../src/sim/buildings/catalog';
import { City } from '../src/sim/City';
import { Simulation } from '../src/sim/core/Simulation';
import { buildDemoCity } from '../src/sim/demo';
import { cityStats } from '../src/sim/systems/population';
import { generateTerrain } from '../src/sim/terrain/generate';
import { presetSettings } from '../src/sim/terrain/presets';

const { values: args } = parseArgs({
  options: { seed: { type: 'string', default: '42' }, days: { type: 'string', default: '30' } },
});
const seed = Number(args.seed);

const t0 = performance.now();
const city = new City(generateTerrain(presetSettings('riverValley', seed, 128)), 1e9);
buildDemoCity(city, seed);
const buildMs = performance.now() - t0;
const sim = new Simulation(city);
sim.worldChanged({ roads: true });
const report = (label: string) => {
  const s = cityStats(city.world);
  const n = sim.needs.report;
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  console.log(`\n[${label}] day ${city.day}: population ${s.population}, happiness ${pct(n.happiness)}, AQI ${sim.air.report.cityAqi.toFixed(0)} (worst ${sim.air.report.worstAqi.toFixed(0)}), abandoned ${n.abandoned}`);
  for (const d of n.drags) console.log(`  -${pct(d.loss)} ${d.kind} (${d.homes} homes)`);
  for (const c of n.complaints) console.log(`  "${c.text}" ×${c.count}`);
};
report('built');
sim.runDays(Number(args.days));
report(`after ${args.days} days`);
let unpowered = 0;
for (const b of city.world.buildings.values()) if (BUILDINGS[b.def].category !== 'civic' && b.construction === 0 && !(b.powered && b.watered)) unpowered++;
console.log(`\nbuild ${buildMs.toFixed(0)} ms, ${city.world.buildings.size} buildings, ${unpowered} without power or water`);
