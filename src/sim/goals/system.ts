import type { City } from '../City';
import type { SimSystem } from '../core/System';
import { goalDef, heldDays, type GoalId } from './catalog';
import { measure, readCity, type GoalMeasure, type GoalSources } from './measure';
import { activeGoals, type GoalStatus } from './state';

/** One active goal's progress, for the HUD. */
export interface GoalProgress {
  readonly id: GoalId;
  readonly status: Exclude<GoalStatus, 'claimed'>;
  readonly measure: GoalMeasure;
  /** Held goals: days in a row the condition has held so far. */
  readonly streak: number;
}

/**
 * Decides when goals are ready (docs/specs/goals.md). Instant goals are checked after every
 * change and each day, so the third park ticks "A green start" as it opens; held goals count
 * a day at the end of each day. Runs last after a change, when the reports it reads are fresh.
 */
export class GoalSystem implements SimSystem {
  readonly name = 'goals';
  private readonly city: City;
  private readonly sources: () => GoalSources;
  /** Goals that became ready since the game last asked (for its toasts). */
  private fresh: GoalId[] = [];

  constructor(city: City, sources: () => GoalSources) {
    this.city = city;
    this.sources = sources;
  }

  onWorldChanged() {
    this.check(false);
  }

  onDay() {
    this.check(true);
  }

  /** Goals that became ready since the last call, oldest first. */
  takeReady(): GoalId[] {
    const out = this.fresh;
    this.fresh = [];
    return out;
  }

  /** Every active goal's progress, ready ones included (empty when goals are off). */
  progress(): GoalProgress[] {
    const state = this.city.goals;
    const ids = activeGoals(state, this.city.stage);
    if (ids.length === 0) return [];
    const readings = readCity(this.sources());
    return ids.map((id) => ({
      id,
      status: state.ready.has(id) ? 'ready' : 'open',
      measure: measure(goalDef(id).metric, readings),
      streak: state.streaks.get(id) ?? 0,
    }));
  }

  private check(dayEnded: boolean) {
    const state = this.city.goals;
    const open = activeGoals(state, this.city.stage).filter((id) => !state.ready.has(id));
    if (open.length === 0) return;
    const readings = readCity(this.sources());
    const quiet = state.backfill;
    state.backfill = false;
    for (const id of open) {
      const def = goalDef(id);
      const { met } = measure(def.metric, readings);
      const days = heldDays(def);
      if (days === 0) {
        if (!met) continue;
        if (quiet) state.claimed.add(id);
        else this.complete(id);
        continue;
      }
      if (!dayEnded) continue;
      const streak = met ? (state.streaks.get(id) ?? 0) + 1 : 0;
      if (streak >= days) this.complete(id);
      else if (streak > 0) state.streaks.set(id, streak);
      else state.streaks.delete(id);
    }
  }

  private complete(id: GoalId) {
    const state = this.city.goals;
    state.streaks.delete(id);
    state.ready.add(id);
    this.fresh.push(id);
  }
}
