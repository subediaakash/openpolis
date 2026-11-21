import { Lifestyle, type BuildingId } from '../buildings/catalog';
import { Stage } from '../stages';

/**
 * City goals (docs/specs/goals.md, D-100): four optional targets per stage, each paying cash
 * and some unlocking a landmark early. Data only: sim/goals/measure.ts measures the metrics and
 * sim/goals/system.ts decides when a goal is ready.
 */

/** What a goal measures. Every variant is handled by one `switch` in measure.ts. */
export type GoalMetric =
  | { readonly kind: 'residents'; readonly target: number }
  /** Share of occupied homes with power and water, once there are `minHomes` of them. */
  | { readonly kind: 'utilities'; readonly share: number; readonly minHomes: number }
  /** Finished, road-connected buildings of one kind. */
  | { readonly kind: 'built'; readonly building: BuildingId; readonly count: number }
  /** Share of the workforce with a job, once the workforce is at least `minWorkforce`. */
  | { readonly kind: 'employment'; readonly share: number; readonly minWorkforce: number }
  /** City happiness (0..1), once at least `minResidents` live here. */
  | { readonly kind: 'happiness'; readonly share: number; readonly minResidents: number }
  /** Residents living at a lifestyle tier. */
  | { readonly kind: 'lifestyle'; readonly tier: Lifestyle; readonly residents: number }
  /** Commuters a day by bus or train. */
  | { readonly kind: 'riders'; readonly target: number }
  /** Average commute at most `maxMinutes`, once at least `minCommuters` commute. */
  | { readonly kind: 'commute'; readonly maxMinutes: number; readonly minCommuters: number }
  /** Residents' average AQI at most `max`, once at least `minResidents` live here. */
  | { readonly kind: 'aqi'; readonly max: number; readonly minResidents: number }
  /** Research projects finished. */
  | { readonly kind: 'research'; readonly done: number };

export interface GoalReward {
  readonly funds: number;
  /** A building unlocked before its stage (cities that lock by stage). */
  readonly unlock?: BuildingId;
}

export interface GoalDef {
  readonly stage: Stage;
  readonly title: string;
  /** How to get there, in a short sentence. */
  readonly hint: string;
  readonly metric: GoalMetric;
  /** Held goals: the condition must hold this many days in a row. Instant goals omit it. */
  readonly days?: number;
  readonly reward: GoalReward;
}

/**
 * Every goal, in the order the panel lists them (by stage, then as written). Ids are saved:
 * never rename one; retire a goal by deleting it (saves drop unknown ids).
 */
export const GOALS = {
  // Hamlet
  firstResidents: {
    stage: Stage.Hamlet,
    title: 'First residents',
    hint: 'Zone homes along a road and they move in.',
    metric: { kind: 'residents', target: 50 },
    reward: { funds: 1000 },
  },
  lightsOn: {
    stage: Stage.Hamlet,
    title: 'Lights on',
    hint: 'A power plant and a water tower reach homes on the same roads.',
    metric: { kind: 'utilities', share: 0.9, minHomes: 5 },
    reward: { funds: 1500 },
  },
  townHall: {
    stage: Stage.Hamlet,
    title: 'Seat of government',
    hint: 'Build a Town Hall by a road. Taxes are collected there.',
    metric: { kind: 'built', building: 'town_hall', count: 1 },
    reward: { funds: 1000 },
  },
  greenStart: {
    stage: Stage.Hamlet,
    title: 'A green start',
    hint: 'Build three parks by a road. Homes near parks are happier.',
    metric: { kind: 'built', building: 'park', count: 3 },
    reward: { funds: 500, unlock: 'central_park' },
  },
  // Village
  growingVillage: {
    stage: Stage.Village,
    title: 'Growing village',
    hint: 'Keep residential demand up with jobs, services and room to grow.',
    metric: { kind: 'residents', target: 500 },
    reward: { funds: 3000 },
  },
  fullEmployment: {
    stage: Stage.Village,
    title: 'Everyone at work',
    hint: 'Zone shops and industry until the jobs bar is full.',
    metric: { kind: 'employment', share: 0.9, minWorkforce: 60 },
    days: 10,
    reward: { funds: 2500 },
  },
  happyVillage: {
    stage: Stage.Village,
    title: 'Happy villagers',
    hint: 'Answer what "Citizens say": services, shops, parks and clean air.',
    metric: { kind: 'happiness', share: 0.75, minResidents: 150 },
    days: 10,
    reward: { funds: 3000 },
  },
  marketDay: {
    stage: Stage.Village,
    title: 'Market day',
    hint: 'Build a Riverside Market by a road (Civic, Parks & Places).',
    metric: { kind: 'built', building: 'riverside_market', count: 1 },
    reward: { funds: 2000 },
  },
  // Town
  bustlingTown: {
    stage: Stage.Town,
    title: 'Bustling town',
    hint: 'Denser zones hold more people as land value rises.',
    metric: { kind: 'residents', target: 5000 },
    reward: { funds: 8000 },
  },
  movingUp: {
    stage: Stage.Town,
    title: 'Moving up',
    hint: 'Happy, well-served homes become Comfortable. They want a hospital nearby.',
    metric: { kind: 'lifestyle', tier: Lifestyle.Comfortable, residents: 500 },
    reward: { funds: 5000, unlock: 'observation_wheel' },
  },
  allAboard: {
    stage: Stage.Town,
    title: 'All aboard',
    hint: 'Bus stations take nearby commuters off the roads.',
    metric: { kind: 'riders', target: 300 },
    reward: { funds: 6000 },
  },
  contentTown: {
    stage: Stage.Town,
    title: 'Content town',
    hint: 'Keep the city happy for a whole month.',
    metric: { kind: 'happiness', share: 0.8, minResidents: 2500 },
    days: 30,
    reward: { funds: 6000, unlock: 'theme_park' },
  },
  // City
  bigCity: {
    stage: Stage.City,
    title: 'Big city',
    hint: 'Grow upward: towers need high land value and full services.',
    metric: { kind: 'residents', target: 20000 },
    reward: { funds: 15000 },
  },
  prosperity: {
    stage: Stage.City,
    title: 'Prosperity',
    hint: 'Comfortable homes near a university become Prosperous.',
    metric: { kind: 'lifestyle', tier: Lifestyle.Prosperous, residents: 1000 },
    reward: { funds: 12000 },
  },
  cleanAir: {
    stage: Stage.City,
    title: 'Clean air',
    hint: 'Swap coal for wind, solar or gas, and keep industry away from homes. Press O for the AQI view.',
    metric: { kind: 'aqi', max: 50, minResidents: 10000 },
    days: 30,
    reward: { funds: 10000, unlock: 'sky_tower' },
  },
  quickCommute: {
    stage: Stage.City,
    title: 'Quick commute',
    hint: 'Put jobs near homes, widen busy roads and add transit. Press T for the traffic view.',
    metric: { kind: 'commute', maxMinutes: 20, minCommuters: 3000 },
    days: 15,
    reward: { funds: 10000 },
  },
  // Metropolis
  metropolis: {
    stage: Stage.Metropolis,
    title: 'Metropolis',
    hint: 'A city of fifty thousand.',
    metric: { kind: 'residents', target: 50000 },
    reward: { funds: 40000 },
  },
  brainCity: {
    stage: Stage.Metropolis,
    title: 'Brain city',
    hint: 'Research Centres next to a university research fastest.',
    metric: { kind: 'research', done: 3 },
    reward: { funds: 25000 },
  },
  transitCity: {
    stage: Stage.Metropolis,
    title: 'Transit city',
    hint: 'Trains and buses carry commuters the roads can’t.',
    metric: { kind: 'riders', target: 3000 },
    reward: { funds: 25000 },
  },
  skyline: {
    stage: Stage.Metropolis,
    title: 'Skyline',
    hint: 'Build the Sky Tower by a road (Civic, Parks & Places).',
    metric: { kind: 'built', building: 'sky_tower', count: 1 },
    reward: { funds: 20000 },
  },
} as const satisfies Readonly<Record<string, GoalDef>>;

export type GoalId = keyof typeof GOALS;

/** Every goal id, in catalog order. */
export const GOAL_IDS: readonly GoalId[] = Object.keys(GOALS).filter(isGoalId);

export function isGoalId(id: string): id is GoalId {
  return Object.hasOwn(GOALS, id);
}

export function goalDef(id: GoalId): GoalDef {
  return GOALS[id];
}

/** Held goals need their condition on this many days in a row; instant goals 0. */
export function heldDays(def: GoalDef): number {
  return def.days ?? 0;
}

/** The goal whose reward unlocks `building` early, if any (for the picker's lock note). */
export function goalUnlocking(building: BuildingId): GoalId | null {
  return GOAL_IDS.find((id) => goalDef(id).reward.unlock === building) ?? null;
}
