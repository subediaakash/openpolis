import { describe, expect, it } from 'vitest';
import { City } from '../src/sim/City';
import { applyPlace, applyRoad, planPlace, planRoad } from '../src/sim/commands';
import { Simulation } from '../src/sim/core/Simulation';
import { GOAL_IDS, goalDef } from '../src/sim/goals/catalog';
import { measure, type CityReadings } from '../src/sim/goals/measure';
import { claimGoal, emptyGoals, loadGoals, parseGoals, saveGoals } from '../src/sim/goals/state';
import { GoalSystem } from '../src/sim/goals/system';
import { roadPath, RoadType } from '../src/sim/roads';
import { deserialize, parseSave, serialize } from '../src/sim/save';
import { Stage } from '../src/sim/stages';
import type { CommuteReport } from '../src/sim/systems/commute';
import { Terrain } from '../src/sim/terrain/types';
import { presetSettings } from '../src/sim/terrain/presets';
import { lockOf } from '../src/sim/unlocks';
import { World } from '../src/sim/World';

/** A 64×64 grass map with a road along y = 10, and a player city tracking goals. */
function town() {
  const w = new World(64, 64, 7);
  w.terrain.fill(Terrain.Grass);
  const city = new City(w, 1e6);
  city.goals = emptyGoals(true);
  applyRoad(city, planRoad(w, roadPath({ x: 0, y: 10 }, { x: 63, y: 10 }, true), RoadType.Road), RoadType.Road);
  const sim = new Simulation(city);
  const place = (id: Parameters<typeof planPlace>[1], x: number, y: number) => {
    const r = applyPlace(city, planPlace(w, id, x, y), 0);
    sim.worldChanged({ roads: false });
    return r;
  };
  return { w, city, sim, place };
}

const READINGS: CityReadings = {
  residents: 0,
  workforce: 0,
  employed: 0,
  homes: 0,
  homesWithUtilities: 0,
  working: new Map(),
  lifestyle: [0, 0, 0],
  happiness: 1,
  riders: 0,
  commuters: 0,
  avgCommute: 0,
  aqi: 0,
  researchDone: 0,
};

describe('goal catalog', () => {
  it('has four goals per stage, each with a reward', () => {
    for (const stage of Object.values(Stage)) {
      expect(GOAL_IDS.filter((id) => goalDef(id).stage === stage)).toHaveLength(4);
    }
    for (const id of GOAL_IDS) expect(goalDef(id).reward.funds).toBeGreaterThan(0);
  });
});

describe('measuring goals', () => {
  it('reaches a target and reports progress', () => {
    const m = measure({ kind: 'residents', target: 50 }, { ...READINGS, residents: 20 });
    expect(m).toEqual({ have: 0.4, met: false, detail: '20 / 50 residents' });
    expect(measure({ kind: 'residents', target: 50 }, { ...READINGS, residents: 60 }).met).toBe(true);
  });

  it('a condition with a minimum does not count until the city is big enough', () => {
    const metric = { kind: 'happiness', share: 0.75, minResidents: 150 } as const;
    const small = measure(metric, { ...READINGS, residents: 30, happiness: 1 });
    expect(small.met).toBe(false);
    expect(small.have).toBeCloseTo(0.2);
    expect(small.detail).toContain('Needs 150 residents first');
    expect(measure(metric, { ...READINGS, residents: 200, happiness: 0.8 }).met).toBe(true);
  });

  it('lower is better for commute and air', () => {
    const commute = { kind: 'commute', maxMinutes: 20, minCommuters: 100 } as const;
    expect(measure(commute, { ...READINGS, commuters: 500, avgCommute: 18 }).met).toBe(true);
    const slow = measure(commute, { ...READINGS, commuters: 500, avgCommute: 40 });
    expect(slow.met).toBe(false);
    expect(slow.have).toBeCloseTo(0.5);
    const air = { kind: 'aqi', max: 50, minResidents: 0 } as const;
    expect(measure(air, { ...READINGS, aqi: 100 }).have).toBeCloseTo(0.5);
    expect(measure(air, { ...READINGS, aqi: 40 }).met).toBe(true);
  });
});

describe('goals in a city', () => {
  it('an instant goal is ready as soon as the change happens, and pays once when claimed', () => {
    const { city, sim, place } = town();
    place('park', 2, 11);
    place('park', 3, 11);
    expect(city.goals.ready.has('greenStart')).toBe(false);
    place('park', 4, 11);
    expect(city.goals.ready.has('greenStart')).toBe(true);
    expect(sim.goals.takeReady()).toContain('greenStart');
    expect(sim.goals.takeReady()).toEqual([]);

    const before = city.funds;
    const claimed = claimGoal(city, 'greenStart');
    expect(claimed.ok).toBe(true);
    expect(city.funds).toBe(before + goalDef('greenStart').reward.funds);
    expect(claimGoal(city, 'greenStart')).toEqual({ ok: false, reason: 'claimed' });
    expect(claimGoal(city, 'firstResidents')).toEqual({ ok: false, reason: 'not-ready' });
    expect(city.funds).toBe(before + goalDef('greenStart').reward.funds);
  });

  it('only shows goals from stages the city has reached', () => {
    const { city, sim } = town();
    const stages = () => new Set(sim.goals.progress().map((p) => goalDef(p.id).stage));
    expect(stages()).toEqual(new Set([Stage.Hamlet]));
    city.stage = Stage.Town;
    expect(stages()).toEqual(new Set([Stage.Hamlet, Stage.Village, Stage.Town]));
  });

  it('a held goal needs its days in a row; a bad day starts the count again', () => {
    const w = new World(8, 8, 1);
    const city = new City(w, 0);
    city.goals = emptyGoals(true);
    city.stage = Stage.City;
    const commute: CommuteReport = { commuters: 5000, trainRiders: 0, busRiders: 0, avgMinutes: 12, jammedTiles: 0 };
    const goals = new GoalSystem(city, () => ({ city, needs: { happiness: 1, abandoned: 0, complaints: [] }, commute, air: { cityAqi: 0, worstAqi: 0 } }));
    const days = goalDef('quickCommute').days ?? 0;
    for (let d = 0; d < days - 1; d++) goals.onDay();
    expect(city.goals.streaks.get('quickCommute')).toBe(days - 1);
    // Edits never count a day.
    goals.onWorldChanged();
    expect(city.goals.streaks.get('quickCommute')).toBe(days - 1);
    commute.avgMinutes = 35;
    goals.onDay();
    expect(city.goals.streaks.has('quickCommute')).toBe(false);
    commute.avgMinutes = 12;
    for (let d = 0; d < days; d++) goals.onDay();
    expect(city.goals.ready.has('quickCommute')).toBe(true);
    expect(city.goals.streaks.has('quickCommute')).toBe(false);
  });

  it('a city without goals (demo, tests, harness) tracks none', () => {
    const w = new World(8, 8, 1);
    const sim = new Simulation(new City(w, 0));
    sim.runDays(2);
    expect(sim.goals.progress()).toEqual([]);
    expect(sim.city.goals.ready.size).toBe(0);
  });
});

describe('landmarks earned early', () => {
  it('a claimed goal unlocks its landmark before its stage', () => {
    const { city, place } = town();
    city.locked = true;
    expect(lockOf(city, 'central_park')).toEqual({ kind: 'stage', stage: Stage.Village, goal: 'greenStart' });
    expect(place('central_park', 10, 12).ok).toBe(false);
    place('park', 2, 11);
    place('park', 3, 11);
    place('park', 4, 11);
    claimGoal(city, 'greenStart');
    expect(lockOf(city, 'central_park')).toBeNull();
    expect(place('central_park', 10, 12).ok).toBe(true);
    // Other Village buildings still wait for the stage, with no goal to name.
    expect(lockOf(city, 'school')).toEqual({ kind: 'stage', stage: Stage.Village, goal: null });
  });

  it('research locks still apply once the stage is reached', () => {
    const { city } = town();
    city.locked = true;
    city.stage = Stage.Metropolis;
    expect(lockOf(city, 'train_station')).toEqual({ kind: 'tech', tech: 'rapidTransit' });
  });
});

describe('saving goals', () => {
  it('ready, claimed and held goals survive a save', () => {
    const { city } = town();
    city.goals.ready.add('lightsOn');
    city.goals.claimed.add('greenStart');
    city.goals.streaks.set('happyVillage', 4);
    const back = deserialize(parseSave(JSON.parse(JSON.stringify(serialize(city, presetSettings('riverValley', 7, 64), 'Goalville')))));
    expect([...back.goals.ready]).toEqual(['lightsOn']);
    expect([...back.goals.claimed]).toEqual(['greenStart']);
    expect(back.goals.streaks.get('happyVillage')).toBe(4);
    expect(back.goals.on).toBe(true);
    expect(back.goals.backfill).toBe(false);
  });

  it('drops unknown or malformed goal data', () => {
    expect(parseGoals({ ready: 'lightsOn', claimed: [], streaks: {} })).toBeUndefined();
    const state = loadGoals(parseGoals({ ready: ['lightsOn', 'retiredGoal'], claimed: ['greenStart', 'greenStart'], streaks: { happyVillage: 3, nope: 2, contentTown: -1 } }));
    expect([...state.ready]).toEqual(['lightsOn']);
    expect([...state.claimed]).toEqual(['greenStart']);
    expect([...state.streaks]).toEqual([['happyVillage', 3]]);
  });

  it('nothing is saved while goals are off', () => {
    expect(saveGoals(emptyGoals(false))).toBeUndefined();
  });

  it('a save from before goals claims what it already did, quietly and without paying', () => {
    const { city, place } = town();
    place('park', 2, 11);
    place('park', 3, 11);
    place('park', 4, 11);
    // As saved before goals existed: no goals field.
    const { goals: _dropped, ...oldCity } = serialize(city, presetSettings('riverValley', 7, 64), 'Old town').city;
    void _dropped;
    const data = { ...serialize(city, presetSettings('riverValley', 7, 64), 'Old town'), city: oldCity };
    const loaded = deserialize(parseSave(JSON.parse(JSON.stringify(data))));
    expect(loaded.goals.backfill).toBe(true);
    const funds = loaded.funds;
    const sim = new Simulation(loaded);
    sim.worldChanged({ roads: true });
    expect(loaded.goals.claimed.has('greenStart')).toBe(true);
    expect(loaded.goals.ready.size).toBe(0);
    expect(sim.goals.takeReady()).toEqual([]);
    expect(loaded.funds).toBe(funds);
    expect(loaded.goals.backfill).toBe(false);
  });
});
