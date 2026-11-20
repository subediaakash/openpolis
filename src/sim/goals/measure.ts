import { BALANCE } from '../../shared/balance';
import { BUILDINGS, LIFESTYLE_NAMES, type BuildingId } from '../buildings/catalog';
import type { City } from '../City';
import type { ResearchState } from '../research';
import { isActive } from '../systems/access';
import type { AirReport } from '../systems/air';
import type { CommuteReport } from '../systems/commute';
import { lifestyleReport } from '../systems/lifestyle';
import type { NeedsReport } from '../systems/needs';
import { cityStats } from '../systems/population';
import { hasUtilities, isWorking } from '../systems/utilities';
import type { GoalMetric } from './catalog';

/**
 * Measuring goals (docs/specs/goals.md): the numbers every metric reads, gathered once, and
 * one function that turns a metric into progress the HUD can show.
 */

/** The reports goals read from other systems (Simulation passes them in). */
export interface GoalSources {
  readonly city: Pick<City, 'world'> & { readonly research: Readonly<ResearchState> };
  readonly needs: Readonly<NeedsReport>;
  readonly commute: Readonly<CommuteReport>;
  readonly air: Readonly<AirReport>;
}

/** A snapshot of everything any goal metric reads. */
export interface CityReadings {
  readonly residents: number;
  /** Working-age residents, and how many of them have a job. */
  readonly workforce: number;
  readonly employed: number;
  /** Occupied, road-connected homes, and those of them with power and water. */
  readonly homes: number;
  readonly homesWithUtilities: number;
  /** Working buildings (finished, on a road, not out of action) by kind. */
  readonly working: ReadonlyMap<BuildingId, number>;
  /** Residents per lifestyle tier: Basic, Comfortable, Prosperous. */
  readonly lifestyle: readonly [number, number, number];
  readonly happiness: number;
  /** Commuters a day by bus or train. */
  readonly riders: number;
  readonly commuters: number;
  readonly avgCommute: number;
  readonly aqi: number;
  readonly researchDone: number;
}

/** Read the city once (a few passes over the buildings; cheap next to the systems it reads). */
export function readCity(s: GoalSources): CityReadings {
  const world = s.city.world;
  const stats = cityStats(world);
  const workforce = Math.floor(stats.population * BALANCE.workforceShare);
  let homes = 0;
  let homesWithUtilities = 0;
  const working = new Map<BuildingId, number>();
  for (const b of world.buildings.values()) {
    if (BUILDINGS[b.def].category === 'residential') {
      // The same homes the stage gates count (sim/progression.ts).
      if (!isActive(b) || b.abandoned || b.occupants === 0) continue;
      homes++;
      if (hasUtilities(b)) homesWithUtilities++;
    } else if (isWorking(b)) {
      working.set(b.def, (working.get(b.def) ?? 0) + 1);
    }
  }
  return {
    residents: stats.population,
    workforce,
    employed: workforce - stats.unemployed,
    homes,
    homesWithUtilities,
    working,
    lifestyle: lifestyleReport(s.city).residents,
    happiness: s.needs.happiness,
    riders: s.commute.busRiders + s.commute.trainRiders,
    commuters: s.commute.commuters,
    avgCommute: s.commute.avgMinutes,
    aqi: s.air.cityAqi,
    researchDone: s.city.research.done,
  };
}

/** How far a goal's condition is: progress for the meter, whether it holds, and a line of text. */
export interface GoalMeasure {
  /** 0..1. */
  readonly have: number;
  readonly met: boolean;
  /** "320 / 500 residents", "71% / 75% happy". */
  readonly detail: string;
}

const count = (n: number) => Math.round(n).toLocaleString('en-US');
const percent = (share: number) => `${Math.round(share * 100)}%`;
const ratio = (have: number, need: number) => (need <= 0 ? 1 : Math.max(0, Math.min(1, have / need)));

/** A target to reach (more is better). */
function reach(have: number, need: number, detail: string): GoalMeasure {
  return { have: ratio(have, need), met: have >= need, detail };
}

/**
 * A condition that only counts once the city is big enough to mean it (e.g. 75% happy with at
 * least 150 residents). Progress is the slower of the two, like the stage ring.
 */
function withMinimum(base: GoalMeasure, size: number, minimum: number, sizeLabel: string): GoalMeasure {
  if (size >= minimum) return base;
  return { have: Math.min(base.have, ratio(size, minimum)), met: false, detail: `Needs ${count(minimum)} ${sizeLabel} first (${count(size)})` };
}

export function measure(metric: GoalMetric, r: CityReadings): GoalMeasure {
  switch (metric.kind) {
    case 'residents':
      return reach(r.residents, metric.target, `${count(r.residents)} / ${count(metric.target)} residents`);
    case 'utilities': {
      const share = r.homes === 0 ? 0 : r.homesWithUtilities / r.homes;
      const base = reach(share, metric.share, `${percent(share)} / ${percent(metric.share)} of homes powered and watered`);
      return withMinimum(base, r.homes, metric.minHomes, 'homes');
    }
    case 'built': {
      const n = r.working.get(metric.building) ?? 0;
      const name = BUILDINGS[metric.building].name;
      return reach(n, metric.count, metric.count === 1 ? (n > 0 ? `${name} working` : `No ${name} yet`) : `${count(n)} / ${count(metric.count)} built`);
    }
    case 'employment': {
      const share = r.workforce === 0 ? 0 : r.employed / r.workforce;
      const base = reach(share, metric.share, `${percent(share)} / ${percent(metric.share)} employed`);
      return withMinimum(base, r.workforce, metric.minWorkforce, 'workers');
    }
    case 'happiness': {
      const base = reach(r.happiness, metric.share, `${percent(r.happiness)} / ${percent(metric.share)} happy`);
      return withMinimum(base, r.residents, metric.minResidents, 'residents');
    }
    case 'lifestyle': {
      const n = r.lifestyle[metric.tier];
      return reach(n, metric.residents, `${count(n)} / ${count(metric.residents)} ${LIFESTYLE_NAMES[metric.tier]} residents`);
    }
    case 'riders':
      return reach(r.riders, metric.target, `${count(r.riders)} / ${count(metric.target)} riders a day`);
    case 'commute': {
      // Lower is better: full once at or under the limit.
      const minutes = r.avgCommute;
      const base: GoalMeasure = { have: minutes <= 0 ? 0 : ratio(metric.maxMinutes, minutes), met: r.commuters > 0 && minutes <= metric.maxMinutes, detail: `${Math.round(minutes)} / ${metric.maxMinutes} min average` };
      return withMinimum(base, r.commuters, metric.minCommuters, 'commuters');
    }
    case 'aqi': {
      const base: GoalMeasure = { have: r.aqi <= 0 ? 1 : ratio(metric.max, r.aqi), met: r.aqi <= metric.max, detail: `AQI ${Math.round(r.aqi)} / ${metric.max}` };
      return withMinimum(base, r.residents, metric.minResidents, 'residents');
    }
    case 'research':
      return reach(r.researchDone, metric.done, `${r.researchDone} / ${metric.done} projects finished`);
  }
}
