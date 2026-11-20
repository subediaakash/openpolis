import { BUILDINGS, type BuildingDef, type BuildingInstance, type ResponderKind } from '../sim/buildings/catalog';
import { TICKS_PER_DAY, type Simulation } from '../sim/core/Simulation';
import { INCIDENTS, responderFor, type Incident, type IncidentEvent, type IncidentKind } from '../sim/systems/incidents';
import type { FireSite } from '../render/fx/Fires';
import type { IncidentMark } from '../render/overlays/Indicators';
import type { SoundId } from './audio';
import type { IncidentInfo, Notice, ResponderInfo } from './events';

/**
 * Incidents as the player sees them (docs/specs/evolution.md, E3, "On the map and in the HUD"):
 * badges, fires, toasts and info-panel lines. The sim decides everything; this module only
 * reads it and words it, so Game stays orchestration.
 */

const VEHICLE: Readonly<Record<ResponderKind, string>> = { fire: 'fire truck', police: 'police car', ambulance: 'ambulance' };
const VEHICLES: Readonly<Record<ResponderKind, string>> = { fire: 'Fire trucks', police: 'Patrol cars', ambulance: 'Ambulances' };

const nameOf = (b: BuildingInstance) => {
  const d: BuildingDef = BUILDINGS[b.def];
  return d.name;
};
const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a');
const aName = (b: BuildingInstance) => `${article(nameOf(b))} ${nameOf(b)}`;

// ---------------------------------------------------------------- map

/** Badge rank: a fire outranks a patient, who outranks a theft. */
const MARK_RANK: Readonly<Record<IncidentMark, number>> = { fire: 3, patient: 2, theft: 1 };

function markOf(kind: IncidentKind): IncidentMark {
  return kind === 'fire' ? 'fire' : kind === 'theft' ? 'theft' : 'patient';
}

/** The badge over each building with something going on (active incidents, and homes robbed lately). */
export function incidentMarks(sim: Simulation): Map<number, IncidentMark> {
  const marks = new Map<number, IncidentMark>();
  const put = (id: number, mark: IncidentMark) => {
    const had = marks.get(id);
    if (!had || MARK_RANK[mark] > MARK_RANK[had]) marks.set(id, mark);
  };
  for (const b of sim.world.buildings.values()) if (b.robbed > 0) put(b.id, 'theft');
  for (const inc of sim.incidents.active) put(inc.building, markOf(inc.kind));
  return marks;
}

/**
 * How fierce each fire looks: it grows toward the moment it would burn the building down, and
 * dies back as a truck works on it.
 */
export function fireSites(sim: Simulation): FireSite[] {
  const sites: FireSite[] = [];
  for (const inc of sim.incidents.active) {
    if (inc.kind !== 'fire') continue;
    const building = sim.world.buildings.get(inc.building);
    if (!building) continue;
    const growth = 0.35 + 0.65 * Math.min(1, inc.age / INCIDENTS.burnAfter);
    const fighting = inc.answered;
    const heat = fighting ? growth * Math.max(0.2, 1 - inc.work / INCIDENTS.fireWork) : growth;
    sites.push({ building, heat, fighting });
  }
  return sites;
}

// ---------------------------------------------------------------- notices

/** What to tell the player about an incident event. */
export interface IncidentNotice {
  readonly kind: Notice['kind'];
  readonly message: string;
  /** Kept in the alerts inbox under this key. */
  readonly key?: string;
  /** The building a click on the toast shows. */
  readonly focus?: number;
  readonly sound?: SoundId;
}

/** The inbox key for "nobody can reach" one incident; any ending clears it. */
const unreachedKey = (kind: IncidentKind, building: number) => `incident-${kind}-${building}`;

/** Spoken name of each incident kind, for "nobody can reach …" lines. */
const UNREACHED: Readonly<Record<IncidentKind, (b: BuildingInstance) => string>> = {
  fire: (b) => `No fire truck can reach the fire at ${aName(b)}. Build a Fire Station nearby, on a connected road.`,
  theft: (b) => `No police car can reach a theft at ${aName(b)}. Build a Police Station nearby.`,
  illness: (b) => `No ambulance can reach a sick resident at ${aName(b)}. Build a Clinic or Hospital nearby.`,
  injury: (b) => `No hospital ambulance can reach people hurt in the fire at ${aName(b)}. Clinics can't treat injuries: build a Hospital.`,
};

const MISSED: Readonly<Record<Exclude<IncidentKind, 'fire'>, (b: BuildingInstance) => string>> = {
  theft: (b) => `${capitalise(aName(b))} was robbed and no police came. Its people feel less safe for a month.`,
  illness: (b) => `Nobody came for a sick resident at ${aName(b)}. Its people trust the city's care less for a month.`,
  injury: (b) => `People hurt in the fire at ${aName(b)} weren't treated in time. Build a Hospital within reach.`,
};

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Turns incident events into notices (docs/specs/evolution.md, E3, "Alerts"). Fires are news:
 * a toast you can click to watch, and another when it's out. Thefts and illness stay quiet
 * unless help can't come or came too late, and a missed call is told at most once a month per
 * kind, so a struggling city isn't buried in toasts. Burned buildings are batched by the game.
 */
export class IncidentFeed {
  /** Per kind: the game month a "missed" notice last went out. */
  private readonly missedMonth = new Map<IncidentKind, number>();

  /** Notices for these events, and the inbox keys they settle. */
  read(events: readonly IncidentEvent[], month: number): { notices: IncidentNotice[]; resolved: string[] } {
    const notices: IncidentNotice[] = [];
    const resolved: string[] = [];
    for (const e of events) {
      switch (e.type) {
        case 'started':
          if (e.kind === 'fire') {
            notices.push({ kind: 'error', message: `Fire at ${aName(e.building)}! Click to watch the fire trucks.`, focus: e.building.id, sound: 'alarm' });
          }
          break;
        case 'unreached':
          notices.push({ kind: 'error', message: UNREACHED[e.kind](e.building), key: unreachedKey(e.kind, e.building.id), focus: e.building.id, sound: 'error' });
          break;
        case 'resolved':
          resolved.push(unreachedKey(e.kind, e.building.id));
          if (e.kind === 'fire') notices.push({ kind: 'info', message: `The fire at ${aName(e.building)} is out.`, focus: e.building.id });
          break;
        case 'missed':
          resolved.push(unreachedKey(e.kind, e.building.id));
          if (e.kind !== 'fire' && this.missedMonth.get(e.kind) !== month) {
            this.missedMonth.set(e.kind, month);
            notices.push({ kind: 'error', message: MISSED[e.kind](e.building), key: `missed-${e.kind}`, focus: e.building.id });
          }
          break;
        case 'burned':
          resolved.push(unreachedKey('fire', e.building.id));
          break;
      }
    }
    return { notices, resolved };
  }
}

// ---------------------------------------------------------------- info panel

const TITLE: Readonly<Record<IncidentKind, string>> = {
  fire: 'On fire!',
  theft: 'Being robbed',
  illness: 'A resident is sick',
  injury: 'People hurt in the fire',
};

const days = (ticks: number) => {
  const d = Math.max(0, ticks) / TICKS_PER_DAY;
  return d < 1 ? 'less than a day' : `about ${Math.round(d)} day${Math.round(d) === 1 ? '' : 's'}`;
};

function incidentStatus(sim: Simulation, inc: Incident): string {
  const vehicle = VEHICLE[responderFor(inc.kind)];
  const r = sim.incidents.vehicleFor(inc.id);
  if (r?.phase === 'out') return `${capitalise(article(vehicle))} ${vehicle} is on its way.`;
  if (r?.phase === 'scene' || inc.answered) {
    if (inc.kind === 'fire') return `Firefighters at work: ${Math.min(99, Math.round((inc.work / INCIDENTS.fireWork) * 100))}% put out.`;
    return `The ${vehicle} is at the scene.`;
  }
  const waiting = inc.reported ? `No ${vehicle} can reach it: none is free, built or connected by road.` : `Waiting for ${article(vehicle)} ${vehicle}.`;
  if (inc.kind === 'fire') return `${waiting} It burns down in ${days(INCIDENTS.burnAfter - inc.age)}.`;
  const window = inc.kind === 'theft' ? INCIDENTS.theftWindow : INCIDENTS.patientWindow;
  return `${waiting} Help must arrive within ${days(window - inc.age)}.`;
}

/** What's happening at a building, for the top of its info panel; null when nothing is. */
export function incidentInfo(sim: Simulation, b: BuildingInstance): IncidentInfo | null {
  const inc = sim.incidents.incidentAt(b.id);
  if (inc) return { kind: inc.kind, title: TITLE[inc.kind], status: incidentStatus(sim, inc) };
  if (b.robbed > 0) return { kind: 'theft', title: 'Robbed recently', status: `No police came in time. Its people feel less safe for ${b.robbed} more day${b.robbed === 1 ? '' : 's'}.` };
  if (b.sick > 0) return { kind: 'illness', title: 'A patient went untreated', status: `Its people trust the city's care less for ${b.sick} more day${b.sick === 1 ? '' : 's'}.` };
  return null;
}

/** A fire, police or health station's vehicles and this month's calls; null for other buildings. */
export function responderInfo(sim: Simulation, b: BuildingInstance): ResponderInfo | null {
  const def: BuildingDef = BUILDINGS[b.def];
  const r = def.responder;
  if (!r) return null;
  const calls = sim.incidents.calls.get(b.id);
  return { vehicles: VEHICLES[r.kind], out: sim.incidents.out(b.id), fleet: r.vehicles, inTime: calls?.answered ?? 0, late: calls?.late ?? 0 };
}
