import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/shared/balance';
import { BUILDINGS, Lifestyle, type BuildingId } from '../src/sim/buildings/catalog';
import { City } from '../src/sim/City';
import { emptyOutcome } from '../src/sim/core/System';
import { residentsOf } from '../src/sim/stories/people';
import { StorySystem } from '../src/sim/stories/stories';
import type { NeedsReport } from '../src/sim/systems/needs';
import { Terrain } from '../src/sim/terrain/types';
import { World } from '../src/sim/World';

function town() {
  const w = new World(24, 24, 7);
  w.terrain.fill(Terrain.Grass);
  const city = new City(w, 1_000_000);
  const add = (def: BuildingId, x: number, y: number, occupants = 0) => {
    const { w: bw, h: bh } = BUILDINGS[def].size;
    return w.addBuilding({ def, x, y, variant: 0, grown: BUILDINGS[def].category !== 'civic', occupants }, bw, bh);
  };
  return { w, city, add };
}

const needs = (report: Partial<NeedsReport> = {}): (() => NeedsReport) => () => ({ happiness: 0.9, abandoned: 0, complaints: [], drags: [], ...report });

describe('citizen stories (D-111)', () => {
  it('a home has the same residents every time, none when empty, and jobs at real workplaces', () => {
    const { w, add } = town();
    const home = add('walkup', 4, 4, 20);
    add('police_station', 6, 4);
    expect(residentsOf(w, home)).toEqual(residentsOf(w, home));
    expect(residentsOf(w, home).length).toBe(3);
    for (const r of residentsOf(w, home)) {
      expect(r.name).toMatch(/^\S+ \S+$/);
      // The only workplace is the police station: adults work there, or are students or retired.
      expect(r.job).toMatch(/at the Police Station$|^Student$|^Retired$/);
    }
    const empty = add('cottage', 10, 10, 0);
    expect(residentsOf(w, empty)).toEqual([]);
  });

  it('tells stories about real changes: moving in, moving up, a burglary, a new clinic', () => {
    const { city, add } = town();
    const home = add('family_house', 4, 4, 0);
    const sys = new StorySystem(city, needs());
    const day = () => {
      city.day++;
      const out = emptyOutcome();
      sys.onDay(out);
      return out.stories;
    };
    home.occupants = 4;
    expect(day().map((s) => s.kind)).toEqual(['moved-in']);
    home.lifestyle = Lifestyle.Comfortable;
    expect(day()[0]?.kind).toBe('moved-up');
    home.robbed = 10;
    expect(day()[0]?.kind).toBe('robbed');
    add('clinic', 6, 4);
    const told = day();
    expect(told[0]?.kind).toBe('opened');
    expect(told[0]?.text).toContain('Clinic');
    expect(told[0]?.building).toBe(home.id);
    expect(sys.recent.length).toBeGreaterThanOrEqual(4);
  });

  it('writes a monthly edition with a headline, the numbers, its stories and an opinion', () => {
    const { city, add } = town();
    const home = add('family_house', 4, 4, 0);
    const sys = new StorySystem(city, needs({ drags: [{ kind: 'parks', loss: 0.05, homes: 1, building: home.id }] }));
    sys.cityName = 'Testville';
    home.occupants = 4;
    for (let d = 0; d < BALANCE.daysPerMonth; d++) {
      city.day++;
      sys.onDay(emptyOutcome());
    }
    const e = sys.onMonth();
    expect(e.headline).toContain('Testville');
    expect(e.lead).toMatch(/people .* happy .* out of work/);
    expect(e.stories.some((s) => s.kind === 'moved-in')).toBe(true);
    expect(e.opinion?.text).toContain('No parks');
    expect(sys.latest).toBe(e);
  });

  it('changes nothing in the city', () => {
    const { w, city, add } = town();
    add('family_house', 4, 4, 3);
    const before = JSON.stringify([...w.buildings.values()]);
    const sys = new StorySystem(city, needs());
    for (let d = 0; d < 40; d++) {
      city.day++;
      sys.onDay(emptyOutcome());
    }
    sys.onMonth();
    expect(JSON.stringify([...w.buildings.values()])).toBe(before);
  });
});
