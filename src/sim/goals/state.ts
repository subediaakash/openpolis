import type { BuildingId } from '../buildings/catalog';
import type { Stage } from '../stages';
import { GOAL_IDS, goalDef, isGoalId, type GoalDef, type GoalId, type GoalReward } from './catalog';

/**
 * A city's goals (docs/specs/goals.md): which are ready to claim, which are claimed, and how
 * many days in a row each held goal has kept its condition. Lives on `City`, saved with it.
 */
export interface GoalState {
  /** Goals are tracked: player cities (new and saved). Off for /demo, tests and the harness. */
  on: boolean;
  /** Condition met, reward waiting for the player. */
  readonly ready: Set<GoalId>;
  readonly claimed: Set<GoalId>;
  /** Held goals: days in a row their condition has held (absent = 0). */
  readonly streaks: Map<GoalId, number>;
  /**
   * Loaded from a save made before goals existed: the first check claims every instant goal the
   * city already meets, without a reward, so an old city isn't flooded with claims.
   */
  backfill: boolean;
}

export function emptyGoals(on = false): GoalState {
  return { on, ready: new Set(), claimed: new Set(), streaks: new Map(), backfill: false };
}

export type GoalStatus = 'open' | 'ready' | 'claimed';

export function goalStatus(state: GoalState, id: GoalId): GoalStatus {
  if (state.claimed.has(id)) return 'claimed';
  return state.ready.has(id) ? 'ready' : 'open';
}

/** Goals the city is working on or can claim: from stages it has reached, not yet claimed. */
export function activeGoals(state: GoalState, stage: Stage): GoalId[] {
  if (!state.on) return [];
  return GOAL_IDS.filter((id) => goalDef(id).stage <= stage && !state.claimed.has(id));
}

/** A claimed goal unlocked this building before its stage. */
export function earnedEarly(state: GoalState, building: BuildingId): boolean {
  for (const id of state.claimed) if (goalDef(id).reward.unlock === building) return true;
  return false;
}

export type ClaimResult =
  | { readonly ok: true; readonly goal: GoalDef; readonly reward: GoalReward }
  | { readonly ok: false; readonly reason: 'not-ready' | 'claimed' };

/** Take a ready goal's reward: its cash now, and its landmark from now on. */
export function claimGoal(city: { funds: number; readonly goals: GoalState }, id: GoalId): ClaimResult {
  const state = city.goals;
  if (state.claimed.has(id)) return { ok: false, reason: 'claimed' };
  if (!state.ready.has(id)) return { ok: false, reason: 'not-ready' };
  const goal = goalDef(id);
  state.ready.delete(id);
  state.claimed.add(id);
  city.funds += goal.reward.funds;
  return { ok: true, goal, reward: goal.reward };
}

// ---------------------------------------------------------------- saving

/** Goals in a save (sim/save.ts). Ids are strings so a retired goal can't break loading. */
export interface SavedGoals {
  readonly ready: readonly string[];
  readonly claimed: readonly string[];
  readonly streaks: Readonly<Record<string, number>>;
}

/** Nothing to save when goals are off. */
export function saveGoals(state: GoalState): SavedGoals | undefined {
  if (!state.on) return undefined;
  return { ready: [...state.ready], claimed: [...state.claimed], streaks: Object.fromEntries(state.streaks) };
}

/** A saved city's goals; a save from before goals turns them on with the quiet backfill. */
export function loadGoals(saved: SavedGoals | undefined): GoalState {
  const state = emptyGoals(true);
  if (!saved) {
    state.backfill = true;
    return state;
  }
  for (const id of saved.claimed) if (isGoalId(id)) state.claimed.add(id);
  for (const id of saved.ready) if (isGoalId(id) && !state.claimed.has(id)) state.ready.add(id);
  for (const [id, days] of Object.entries(saved.streaks)) {
    if (isGoalId(id) && Number.isFinite(days) && days > 0) state.streaks.set(id, Math.floor(days));
  }
  return state;
}

/** Validate the `goals` field of untrusted save JSON; anything malformed is dropped. */
export function parseGoals(v: unknown): SavedGoals | undefined {
  if (!isRecord(v)) return undefined;
  const { ready, claimed, streaks } = v;
  if (!isStringArray(ready) || !isStringArray(claimed) || !isRecord(streaks)) return undefined;
  const days: Record<string, number> = {};
  for (const [id, n] of Object.entries(streaks)) if (typeof n === 'number' && Number.isFinite(n)) days[id] = n;
  return { ready, claimed, streaks: days };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}
