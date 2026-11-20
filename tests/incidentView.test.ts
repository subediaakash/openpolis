import { describe, expect, it } from 'vitest';
import { fireSites, IncidentFeed, incidentInfo, incidentMarks, responderInfo } from '../src/game/incidents';
import type { BuildingId, BuildingInstance } from '../src/sim/buildings/catalog';
import { City } from '../src/sim/City';
import { applyPlace, applyRoad, planPlace, planRoad } from '../src/sim/commands';
import { Simulation } from '../src/sim/core/Simulation';
import { roadPath, RoadType } from '../src/sim/roads';
import { INCIDENTS, type IncidentEvent } from '../src/sim/systems/incidents';
import { Terrain } from '../src/sim/terrain/types';
import { World } from '../src/sim/World';

/** How incidents are shown (docs/specs/evolution.md, E3, "On the map and in the HUD"): one street with homes and stations. */
function street(stations: readonly (readonly [BuildingId, number])[] = []) {
  const w = new World(64, 64, 3);
  w.terrain.fill(Terrain.Grass);
  const city = new City(w, 1e9);
  applyRoad(city, planRoad(w, roadPath({ x: 2, y: 10 }, { x: 62, y: 10 }, true), RoadType.Road), RoadType.Road);
  const place = (id: BuildingId, x: number, y: number): BuildingInstance => {
    const r = applyPlace(city, planPlace(w, id, x, y), 0);
    if (!r.ok) throw new Error(`could not place ${id} at ${x},${y}`);
    const b = w.buildings.get(w.building[w.index(x, y)]);
    if (!b) throw new Error('placed building not found');
    return b;
  };
  const placed = stations.map(([id, x]) => place(id, x, 9));
  const sim = new Simulation(city);
  const home = (x: number) => {
    const b = place('cottage', x, 11);
    sim.worldChanged({ roads: false });
    b.occupants = 3;
    return b;
  };
  sim.worldChanged({ roads: true });
  return { w, sim, home, stations: placed };
}

describe('incident badges and fires', () => {
  it('marks each building with its most urgent incident, and homes robbed lately', () => {
    const t = street();
    const a = t.home(20);
    const b = t.home(30);
    const c = t.home(40);
    t.sim.incidents.start('theft', a);
    t.sim.incidents.start('fire', a);
    t.sim.incidents.start('illness', b);
    c.robbed = 12;
    const marks = incidentMarks(t.sim);
    expect(marks.get(a.id)).toBe('fire');
    expect(marks.get(b.id)).toBe('patient');
    expect(marks.get(c.id)).toBe('theft');
    expect(marks.size).toBe(3);
  });

  it('a fire grows while nobody comes, and dies back while a truck works on it', () => {
    const t = street();
    const b = t.home(20);
    const fire = t.sim.incidents.start('fire', b);
    const heat = () => fireSites(t.sim)[0].heat;
    const early = heat();
    fire.age = INCIDENTS.burnAfter * 0.8;
    const late = heat();
    expect(late).toBeGreaterThan(early);
    expect(fireSites(t.sim)[0].fighting).toBe(false);
    fire.answered = true;
    fire.work = INCIDENTS.fireWork * 0.7;
    expect(heat()).toBeLessThan(late);
    expect(fireSites(t.sim)[0].fighting).toBe(true);
  });
});

describe('incident notices', () => {
  const building = (id: number): BuildingInstance => {
    const t = street();
    const b = t.home(20 + id);
    return b;
  };

  it('a fire is news you can click to watch; its end clears any "nobody can reach" alert', () => {
    const feed = new IncidentFeed();
    const b = building(1);
    const started = feed.read([{ type: 'started', kind: 'fire', building: b }], 0);
    expect(started.notices).toHaveLength(1);
    expect(started.notices[0]).toMatchObject({ kind: 'error', focus: b.id, sound: 'alarm' });
    expect(started.notices[0].message).toMatch(/^Fire at a Cottage!/);

    const unreached = feed.read([{ type: 'unreached', kind: 'fire', building: b }], 0);
    expect(unreached.notices[0].key).toBe(`incident-fire-${b.id}`);

    const out = feed.read([{ type: 'resolved', kind: 'fire', building: b }], 0);
    expect(out.resolved).toContain(`incident-fire-${b.id}`);
    expect(out.notices[0]).toMatchObject({ kind: 'info', focus: b.id });
  });

  it('thefts and illness stay quiet unless help fails, and a miss is told once a month per kind', () => {
    const feed = new IncidentFeed();
    const b = building(2);
    const quiet: IncidentEvent[] = [
      { type: 'started', kind: 'theft', building: b },
      { type: 'started', kind: 'illness', building: b },
      { type: 'resolved', kind: 'theft', building: b },
    ];
    expect(feed.read(quiet, 0).notices).toEqual([]);
    const missed: IncidentEvent = { type: 'missed', kind: 'theft', building: b };
    expect(feed.read([missed], 0).notices).toHaveLength(1);
    expect(feed.read([missed], 0).notices).toHaveLength(0);
    expect(feed.read([{ type: 'missed', kind: 'illness', building: b }], 0).notices).toHaveLength(1);
    expect(feed.read([missed], 1).notices).toHaveLength(1);
  });
});

describe('incidents in the info panel', () => {
  it('says what is happening and who is coming', () => {
    const t = street([['fire_station', 20]]);
    const b = t.home(26);
    expect(incidentInfo(t.sim, b)).toBeNull();
    t.sim.incidents.start('fire', b);
    expect(incidentInfo(t.sim, b)?.title).toBe('On fire!');
    // After a few ticks a truck is dispatched and on its way.
    for (let k = 0; k < 3; k++) t.sim.tick();
    expect(incidentInfo(t.sim, b)?.status).toMatch(/fire truck is on its way|Firefighters at work/);
    const station = responderInfo(t.sim, t.stations[0]);
    expect(station).toMatchObject({ vehicles: 'Fire trucks', fleet: 2 });
    expect(station?.out).toBe(1);
    expect(responderInfo(t.sim, b)).toBeNull();
  });

  it('a fire nobody can reach says when it burns down', () => {
    const t = street();
    const b = t.home(26);
    const fire = t.sim.incidents.start('fire', b);
    fire.reported = true;
    expect(incidentInfo(t.sim, b)?.status).toMatch(/No fire truck can reach it.*burns down in about 3 days/);
  });

  it('remembers a recent robbery after the incident is over', () => {
    const t = street();
    const b = t.home(26);
    b.robbed = 1;
    expect(incidentInfo(t.sim, b)).toMatchObject({ kind: 'theft', title: 'Robbed recently' });
    expect(incidentInfo(t.sim, b)?.status).toMatch(/1 more day\./);
  });
});
