import { describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/sim/buildings/catalog';
import { City } from '../src/sim/City';
import { buildDemoCity } from '../src/sim/demo';
import { Simulation } from '../src/sim/core/Simulation';
import { cityStats } from '../src/sim/systems/population';
import { generateTerrain } from '../src/sim/terrain/generate';
import { presetSettings } from '../src/sim/terrain/presets';

function demo(seed: number) {
  const world = generateTerrain(presetSettings('riverValley', seed, 128));
  const city = new City(world, 1e12);
  const t0 = performance.now();
  buildDemoCity(city, seed);
  return { world, city, ms: performance.now() - t0 };
}

describe('demo city', () => {
  it('grows a big, serviced city with towers, quickly and the same every time', () => {
    const a = demo(42);
    const stats = cityStats(a.world);
    const defs = [...a.world.buildings.values()].map((b) => b.def);
    expect(stats.population).toBeGreaterThan(3000);
    expect(defs).toContain('town_hall');
    expect(defs.some((d) => BUILDINGS[d].level === 3)).toBe(true);
    // Nobody is left without utilities.
    for (const b of a.world.buildings.values()) {
      if (BUILDINGS[b.def].category !== 'civic' && b.construction === 0) expect(b.powered && b.watered).toBe(true);
    }
    const b = demo(42);
    expect([...b.world.buildings.values()].map((x) => `${x.def}@${x.x},${x.y}`)).toEqual(
      [...a.world.buildings.values()].map((x) => `${x.def}@${x.x},${x.y}`),
    );
  }, 20_000); // builds the demo twice; ~1.5 s each, slower when the suite runs in parallel
  it('stands its showpiece landmarks round downtown', () => {
    const { world } = demo(42);
    const ids = new Set([...world.buildings.values()].map((b) => b.def));
    for (const id of ['sky_tower', 'sail_hotel', 'theme_park', 'observation_wheel', 'riverside_market'] as const) expect(ids.has(id)).toBe(true);
  });
  it('is a planned, happy city: every need met, gas power, no coal (D-106)', () => {
    const { city, world } = demo(42);
    const defs = [...world.buildings.values()].map((b) => b.def);
    expect(defs).not.toContain('power_plant');
    expect(defs).toContain('gas_plant');
    const sim = new Simulation(city);
    sim.worldChanged({ roads: true });
    const report = sim.needs.report;
    expect(report.happiness).toBeGreaterThan(0.93);
    // Only commuting (jobs are in town, homes on the outskirts) may cost more than a point.
    for (const d of report.drags) if (d.kind !== 'commute') expect(d.loss).toBeLessThan(0.01);
    expect(sim.air.report.cityAqi).toBeLessThan(50);
  }, 20_000);
});
