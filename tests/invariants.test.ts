import { describe, expect, it } from 'vitest';
import { BUILDING_IDS, buildingDef, type BuildingId } from '../src/sim/buildings/catalog';
import { cityStats } from '../src/sim/systems/population';
import { applyClear, planClear } from '../src/sim/commands';
import type { Simulation } from '../src/sim/core/Simulation';
import { loadSimulation, parseSave, serialize } from '../src/sim/save';
import { presetSettings } from '../src/sim/terrain/presets';
import { mulberry32 } from '../src/shared/rng';
import { gridTown } from './support/gridTown';
import { liveDay, violations } from './support/invariants';

const STATIONS: readonly BuildingId[] = [
  'fire_station',
  'police_station',
  'clinic',
  'hospital',
  'landfill',
  'water_tower',
  'power_plant',
  'park',
];

/** A random player: bulldozes a building or a stretch of road, places a station, nudges the tax. */
function randomEdit(
  sim: Simulation,
  place: (id: BuildingId, x: number, y: number) => unknown,
  rng: () => number,
) {
  const w = sim.world;
  const roll = rng();
  const x = 2 + Math.floor(rng() * (w.width - 4));
  const y = 2 + Math.floor(rng() * (w.height - 4));
  if (roll < 0.35) {
    const ids = [...w.buildings.keys()];
    const b = w.buildings.get(ids[Math.floor(rng() * ids.length)]);
    if (b) applyClear(sim.city, planClear(w, [{ x: b.x, y: b.y }]));
  } else if (roll < 0.55) {
    // A short stretch of road (often splitting the network).
    applyClear(
      sim.city,
      planClear(w, [
        { x, y },
        { x: x + 1, y },
        { x, y: y + 1 },
      ]),
    );
  } else if (roll < 0.9) {
    place(STATIONS[Math.floor(rng() * STATIONS.length)], x, y);
  } else {
    sim.city.taxRate = Math.floor(rng() * 21);
  }
  sim.worldChanged({ roads: true });
}

describe('simulation invariants', () => {
  it('a serviced town keeps every rule every day for a year of play with random edits', () => {
    const t = gridTown({ size: 64 });
    const rng = mulberry32(7);
    let stage = t.city.stage;
    const failures: string[] = [];
    for (let day = 1; day <= 360 && failures.length === 0; day++) {
      liveDay(t.sim);
      if (day > 60 && day % 5 === 0) randomEdit(t.sim, t.place, rng);
      if (t.city.stage < stage) failures.push(`day ${day}: stage went down`);
      stage = t.city.stage;
      for (const v of violations(t.sim)) failures.push(`day ${day}: ${v}`);
    }
    expect(failures).toEqual([]);
    expect(cityStats(t.world).population).toBeGreaterThan(500); // it really was a living city
  }, 120_000);

  it('a city with nothing working (no power, water or services, broke, top tax) degrades without breaking', () => {
    const t = gridTown({ size: 48, utilities: false, services: false, funds: 0 });
    t.city.taxRate = 20;
    const failures: string[] = [];
    for (let day = 1; day <= 120 && failures.length === 0; day++) {
      liveDay(t.sim);
      for (const v of violations(t.sim)) failures.push(`day ${day}: ${v}`);
    }
    expect(failures).toEqual([]);
    expect(cityStats(t.world).population).toBe(0);
  }, 60_000);

  it('an empty map runs a year: no roads, no buildings, no crash', () => {
    const t = gridTown({ size: 32 });
    applyClear(
      t.city,
      planClear(
        t.world,
        [...Array(32 * 32).keys()].map((i) => ({ x: i % 32, y: Math.floor(i / 32) })),
      ),
    );
    t.sim.worldChanged({ roads: true });
    expect(t.world.buildings.size).toBe(0);
    t.sim.runDays(360);
    expect(violations(t.sim)).toEqual([]);
    expect(Number.isFinite(t.city.funds)).toBe(true);
  });

  it('every catalog building placed alone on a road works for a month without breaking a rule', () => {
    for (const id of BUILDING_IDS) {
      const t = gridTown({ size: 32, services: false });
      const d = buildingDef(id);
      // Rail stations need track; skip what can't stand by a road alone.
      if (d.railStation) continue;
      const b = t.place(id, 18, 13);
      if (!b) continue; // footprint doesn't fit this test lot; covered by the catalog tests
      t.sim.worldChanged({ roads: false });
      t.sim.runDays(30);
      expect(violations(t.sim), id).toEqual([]);
    }
  }, 120_000);

  it('saving and loading at any point mid-year changes nothing about the future', () => {
    const terrain = { ...presetSettings('plains', 11, 64) };
    const days = [45, 120];
    for (const at of days) {
      const running = gridTown();
      running.sim.runDays(at + 20);
      const first = gridTown();
      first.sim.runDays(at);
      const json: unknown = JSON.parse(
        JSON.stringify(serialize(first.city, terrain, 'Twin', first.sim)),
      );
      const loaded = loadSimulation(parseSave(json));
      loaded.runDays(20);
      const sig = (sim: Simulation) => ({
        funds: sim.city.funds,
        buildings: [...sim.world.buildings.values()].map((b) => [
          b.def,
          b.x,
          b.y,
          b.occupants,
          b.happiness,
          b.garbage,
          b.robbed,
          b.sick,
          b.lifestyle,
        ]),
        incidents: sim.incidents.active.map((i) => [i.kind, i.age]),
        streams: [sim.streams.growth.state, sim.streams.fire.state],
      });
      expect(sig(loaded), `saved at day ${at}`).toEqual(sig(running.sim));
    }
  }, 120_000);
});
