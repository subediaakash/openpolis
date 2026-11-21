import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/shared/balance';
import { City } from '../src/sim/City';
import { applyPlace, applyRoad, planPlace, planRoad } from '../src/sim/commands';
import { Simulation } from '../src/sim/core/Simulation';
import { roadPath, RoadType } from '../src/sim/roads';
import { cityStats } from '../src/sim/systems/population';
import { Terrain } from '../src/sim/terrain/types';
import { World } from '../src/sim/World';

/** A 40×40 town: one road along y = 20, with power and water at the east end. */
function town() {
  const w = new World(40, 40, 3);
  w.terrain.fill(Terrain.Grass);
  const city = new City(w, 1e9);
  applyRoad(city, planRoad(w, roadPath({ x: 0, y: 20 }, { x: 39, y: 20 }, true), RoadType.Road), RoadType.Road);
  const place = (id: Parameters<typeof planPlace>[1], x: number, y: number) => applyPlace(city, planPlace(w, id, x, y), 0);
  place('power_plant', 36, 21);
  place('water_tower', 35, 21);
  // Water reaches 14 tiles (D-093): towers along the road for the homes at the west end too.
  place('water_tower', 1, 21);
  place('water_tower', 18, 21);
  const sim = new Simulation(city);
  return { w, city, sim, place };
}

const building = (w: World, def: string, x: number) => [...w.buildings.values()].find((b) => b.def === def && b.x === x)!;

describe('needs and happiness', () => {
  it('a home with services, shops, parks and jobs nearby is happy; one without complains', () => {
    const { w, sim, place } = town();
    place('walkup', 4, 19); // serviced end
    place('walkup', 33, 19); // far end: nothing nearby but the power plant
    for (const id of ['police_station', 'fire_station', 'clinic'] as const) place(id, [5, 6, 7][['police_station', 'fire_station', 'clinic'].indexOf(id)], 21);
    place('school', 8, 21);
    place('corner_shop', 10, 21);
    place('small_office', 11, 21);
    place('park', 3, 19);
    place('park', 2, 19);
    sim.worldChanged({ roads: true });
    for (let d = 0; d < 20; d++) sim.day();
    const good = sim.needs.byBuilding.get(building(w, 'walkup', 4).id)!;
    const bad = sim.needs.byBuilding.get(building(w, 'walkup', 33).id)!;
    expect(good.happiness).toBeGreaterThan(0.7);
    expect(good.complaint).toBeNull();
    expect(bad.happiness).toBeLessThan(good.happiness);
    expect(bad.scores.safety).toBe(0);
    expect(bad.scores.air).toBeLessThan(1); // the power plant next door
    expect(sim.needs.report.complaints.length).toBeGreaterThan(0);
  });

  it('happier homes fill up more', () => {
    const { w, sim, place } = town();
    place('walkup', 4, 19);
    place('walkup', 30, 19);
    place('police_station', 5, 21);
    place('fire_station', 6, 21);
    place('clinic', 7, 21);
    place('school', 8, 21);
    place('small_office', 11, 21);
    sim.worldChanged({ roads: true });
    for (let d = 0; d < 60; d++) sim.day();
    expect(building(w, 'walkup', 4).occupants).toBeGreaterThan(building(w, 'walkup', 30).occupants);
  });

  it('a long unhappy spell abandons a building; fixing its needs brings it back', () => {
    const { w, sim, place } = town();
    place('factory', 20, 18); // industry with no services and nobody to work there
    const factory = building(w, 'factory', 20);
    sim.worldChanged({ roads: true });
    for (let d = 0; d < BALANCE.abandonDays + 5; d++) sim.day();
    expect(factory.abandoned).toBe(true);
    expect(factory.occupants).toBe(0);
    // Abandoned jobs don't count: only the power plant's and three water towers' 70 remain.
    expect(cityStats(w).jobs).toBe(70);
    expect(sim.needs.byBuilding.get(factory.id)?.complaint).toBe('abandoned');

    // Services and a neighbourhood of workers fix it.
    place('police_station', 22, 21);
    place('fire_station', 23, 21);
    for (let x = 0; x < 10; x++) place('walkup', x, 19);
    for (let x = 0; x < 6; x++) place('clinic', 12 + x, 21);
    sim.worldChanged({ roads: false });
    for (let d = 0; d < BALANCE.recoverDays + 20; d++) sim.day();
    expect(factory.abandoned).toBe(false);
  });

  describe("what's holding happiness back (D-105)", () => {
    /** The serviced home at the west end, a bare one at the far end, and a few days to settle. */
    function twoHomes() {
      const t = town();
      t.place('walkup', 4, 19);
      t.place('walkup', 33, 19);
      t.place('police_station', 5, 21);
      t.place('clinic', 7, 21);
      t.place('corner_shop', 10, 21);
      t.sim.worldChanged({ roads: true });
      for (let d = 0; d < 20; d++) t.sim.day();
      return t;
    }

    it("each building's losses add up to its missing happiness", () => {
      const { sim } = twoHomes();
      expect(sim.needs.byBuilding.size).toBeGreaterThan(0);
      for (const n of sim.needs.byBuilding.values()) {
        const sum = Object.values(n.losses).reduce((a, b) => a + (b ?? 0), 0);
        expect(sum).toBeCloseTo(1 - n.happiness, 9);
        for (const loss of Object.values(n.losses)) expect(loss).toBeGreaterThanOrEqual(0);
      }
    });

    it('the city breakdown adds up to the missing city happiness, largest first, pointing at homes', () => {
      const { w, sim } = twoHomes();
      const r = sim.needs.report;
      expect(r.happiness).toBeLessThan(1);
      expect(r.drags.length).toBeGreaterThan(0);
      // Every need, unfiltered, from the per-building losses, weighted by residents.
      let people = 0;
      const full = new Map<string, number>();
      for (const b of w.buildings.values()) {
        const n = sim.needs.byBuilding.get(b.id);
        if (!n || b.occupants === 0 || b.def !== 'walkup') continue;
        people += b.occupants;
        for (const [k, loss] of Object.entries(n.losses)) full.set(k, (full.get(k) ?? 0) + b.occupants * (loss ?? 0));
      }
      const total = [...full.values()].reduce((a, b) => a + b, 0) / people;
      expect(total).toBeCloseTo(1 - r.happiness, 9);
      // The report keeps the big ones, exactly, in order.
      for (const d of r.drags) {
        expect(d.loss).toBeCloseTo((full.get(d.kind) ?? 0) / people, 9);
        expect(d.loss).toBeGreaterThanOrEqual(0.005);
        expect(d.homes).toBeGreaterThan(0);
        const home = w.buildings.get(d.building);
        expect(home?.def).toBe('walkup');
        expect(home?.occupants).toBeGreaterThan(0);
      }
      for (let k = 1; k < r.drags.length; k++) expect(r.drags[k - 1].loss).toBeGreaterThanOrEqual(r.drags[k].loss);
      expect(r.drags.length).toBeLessThanOrEqual(5);
      // Neither home has a fire station, but only the far one also lacks police: it loses the most to safety.
      const safety = r.drags.find((d) => d.kind === 'safety');
      expect(safety?.building).toBe(building(w, 'walkup', 33).id);
    });

    it('a city with nobody living in it has nothing holding it back', () => {
      const { sim, place } = town();
      place('small_office', 11, 21);
      sim.worldChanged({ roads: true });
      for (let d = 0; d < 5; d++) sim.day();
      expect(sim.needs.report.happiness).toBe(1);
      expect(sim.needs.report.drags).toEqual([]);
    });
  });
});

