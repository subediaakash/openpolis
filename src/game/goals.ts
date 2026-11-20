import { buildingDef, PLACEABLE_IDS, type BuildingId } from '../sim/buildings/catalog';
import type { Simulation } from '../sim/core/Simulation';
import { GOAL_IDS, goalDef, heldDays, type GoalId } from '../sim/goals/catalog';
import type { ClaimResult } from '../sim/goals/state';
import type { GoalProgress } from '../sim/goals/system';
import { TECHS } from '../sim/research';
import { STAGES } from '../sim/stages';
import { lockOf, type Lock, type UnlockCity } from '../sim/unlocks';
import type { GoalInfo, GoalsInfo, LockInfo } from './events';

/**
 * Goals and locks as the HUD shows them (docs/specs/goals.md): the sim decides, this module
 * only words it. Kept out of Game so the game class stays orchestration.
 */

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/** Catalog position, for a stable order in the panel. */
const ORDER: ReadonlyMap<GoalId, number> = new Map(GOAL_IDS.map((id, i) => [id, i]));

function goalInfo(p: GoalProgress): GoalInfo {
  const def = goalDef(p.id);
  const days = heldDays(def);
  // A held goal whose condition holds shows the days; otherwise how far the condition is.
  const holding = days > 0 && p.streak > 0;
  return {
    id: p.id,
    title: def.title,
    hint: def.hint,
    stageName: STAGES[def.stage].name,
    status: p.status,
    have: p.status === 'ready' ? 1 : holding ? p.streak / days : p.measure.have,
    detail: days > 0 && p.status === 'open' ? `${p.measure.detail} · ${holding ? `day ${p.streak} of ${days}` : `hold ${days} days`}` : p.measure.detail,
    held: days > 0 ? { days, streak: p.streak } : null,
    reward: { funds: def.reward.funds, unlock: def.reward.unlock ? buildingDef(def.reward.unlock).name : null },
  };
}

/** The Goals panel's data, or null when the city doesn't track goals. */
export function goalsInfo(sim: Simulation): GoalsInfo | null {
  const state = sim.city.goals;
  if (!state.on) return null;
  const active = sim.goals
    .progress()
    .map(goalInfo)
    .sort((a, b) => Number(b.status === 'ready') - Number(a.status === 'ready') || (ORDER.get(a.id) ?? 0) - (ORDER.get(b.id) ?? 0));
  return { active, ready: state.ready.size, claimed: state.claimed.size, total: GOAL_IDS.length };
}

/** What a goal pays, in a sentence ("$1,500, and Central Park unlocks early."). */
export function rewardText(id: GoalId): string {
  const { reward } = goalDef(id);
  return reward.unlock ? `The reward: ${money(reward.funds)}, and the ${buildingDef(reward.unlock).name} unlocks early.` : `The reward: ${money(reward.funds)}.`;
}

/** The toast when a goal's condition is met. */
export function readyMessage(id: GoalId): string {
  const { title, reward } = goalDef(id);
  const unlock = reward.unlock ? ` and ${buildingDef(reward.unlock).name}` : '';
  return `Goal complete: ${title}! Claim ${money(reward.funds)}${unlock} in Goals.`;
}

/** The toast after claiming (or why it couldn't be claimed). */
export function claimMessage(result: ClaimResult): string {
  if (!result.ok) return result.reason === 'claimed' ? 'That reward is already claimed' : 'That goal isn’t finished yet';
  const unlock = result.reward.unlock ? ` ${buildingDef(result.reward.unlock).name} unlocked: find it in Civic.` : '';
  return `${result.goal.title}: +${money(result.reward.funds)}.${unlock}`;
}

/** Words for a lock (sim/unlocks.ts). */
export function lockInfo(lock: Lock, building: BuildingId): LockInfo {
  const name = buildingDef(building).name;
  if (lock.kind === 'tech') {
    const tech = TECHS.find((t) => t.id === lock.tech)?.name ?? lock.tech;
    return { short: tech, detail: `${name} needs the ${tech} research` };
  }
  const stage = STAGES[lock.stage];
  const when = `${name} unlocks when the city becomes a ${stage.name} (${stage.population.toLocaleString('en-US')} people and its basics)`;
  if (lock.goal === null) return { short: stage.name, detail: when };
  return { short: `${stage.name} or goal`, detail: `${when}, or sooner: finish the “${goalDef(lock.goal).title}” goal` };
}

/** Every placeable building the city can't build yet, with its words. */
export function buildingLocks(city: UnlockCity): Partial<Record<BuildingId, LockInfo>> {
  const out: Partial<Record<BuildingId, LockInfo>> = {};
  for (const id of PLACEABLE_IDS) {
    const lock = lockOf(city, id);
    if (lock) out[id] = lockInfo(lock, id);
  }
  return out;
}
