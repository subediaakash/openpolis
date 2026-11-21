import type { BuildingId } from './buildings/catalog';
import type { City } from './City';
import { goalUnlocking, type GoalId } from './goals/catalog';
import { earnedEarly } from './goals/state';
import { hasTech, type TechId } from './research';
import { unlockStage, unlockTech, type Stage } from './stages';

/**
 * The one rule for what a city may build (D-086, D-090, D-100): a building waits for its stage
 * unless a claimed goal unlocked it early, and some also wait for a research project. The
 * placement command, the picker and the "unlocks at" toast all read this.
 */
export type Lock =
  /** Waits for a stage; `goal` is a goal whose reward unlocks it sooner (still to claim). */
  | { readonly kind: 'stage'; readonly stage: Stage; readonly goal: GoalId | null }
  | { readonly kind: 'tech'; readonly tech: TechId };

export type UnlockCity = Pick<City, 'locked' | 'stage' | 'research' | 'goals'>;

/** Why `id` can't be placed yet, or null when it can. */
export function lockOf(city: UnlockCity, id: BuildingId): Lock | null {
  if (!city.locked) return null;
  const stage = unlockStage(id);
  if (city.stage < stage && !earnedEarly(city.goals, id)) {
    const goal = city.goals.on ? goalUnlocking(id) : null;
    return { kind: 'stage', stage, goal: goal !== null && !city.goals.claimed.has(goal) ? goal : null };
  }
  const tech = unlockTech(id);
  return tech && !hasTech(city, tech) ? { kind: 'tech', tech } : null;
}

export function isUnlocked(city: UnlockCity, id: BuildingId): boolean {
  return lockOf(city, id) === null;
}
