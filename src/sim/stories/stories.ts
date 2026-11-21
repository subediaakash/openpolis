import { BUILDINGS, LIFESTYLE_NAMES, type BuildingDef, type BuildingInstance } from '../buildings/catalog';
import type { City } from '../City';
import type { DayOutcome, SimSystem } from '../core/System';
import { STAGES, type Stage } from '../stages';
import { cityStats } from '../systems/population';
import { COMPLAINT_TEXT, type NeedKind, type NeedsReport } from '../systems/needs';
import { hash, residentsOf, type Resident } from './people';

/**
 * Citizen stories and the monthly newspaper (docs/specs/stories.md, D-111). Each day the system
 * compares every home with yesterday (moved in, moved up, robbed, sick, left) and notices services
 * opening, and tells at most a couple of those as one-line stories about a named resident. At the
 * end of each month it writes an edition: a headline from the month's biggest change, the numbers,
 * the month's stories and a resident's opinion on what holds happiness back. Nothing here changes
 * the city or uses its random streams, and nothing is saved: a loaded city starts a fresh feed.
 */

export type StoryKind = 'moved-in' | 'moved-up' | 'robbed' | 'sick' | 'left' | 'opened' | 'life';

export interface Story {
  readonly id: number;
  readonly day: number;
  readonly kind: StoryKind;
  /** The home it happened at (for "Show me"). */
  readonly building: number;
  readonly x: number;
  readonly y: number;
  readonly who: string;
  readonly text: string;
}

export interface Edition {
  /** The month it covers (city date: year from 1, month 0–11). */
  readonly year: number;
  readonly month: number;
  readonly headline: string;
  readonly lead: string;
  readonly stories: readonly Story[];
  /** A resident's view on what most holds happiness back, or null when nothing does. */
  readonly opinion: { readonly who: string; readonly text: string; readonly building: number } | null;
}

/** How many stories a day at most, and how many recent ones the feed keeps. */
const PER_DAY = 2;
const KEEP = 30;

/** Story kinds in order of interest when more happen in a day than are told. */
const PRIORITY: readonly StoryKind[] = ['opened', 'moved-up', 'robbed', 'sick', 'left', 'moved-in'];

/** Civic buildings worth a story when they open. */
const NEWSWORTHY: ReadonlySet<string> = new Set(['parks', 'services', 'transport']);

interface HomeState {
  occupants: number;
  lifestyle: number;
  robbed: boolean;
  sick: boolean;
}

interface MonthStart {
  population: number;
  happiness: number;
  stage: Stage;
}

interface Candidate {
  kind: StoryKind;
  home: BuildingInstance;
  /** The building that opened (for 'opened'). */
  opened?: BuildingInstance;
}

export class StorySystem implements SimSystem {
  readonly name = 'stories';
  /** Recent stories, newest first. */
  recent: Story[] = [];
  /** The latest edition, or null before the first month ends. */
  latest: Edition | null = null;
  /** The city's name for headlines (set by the game; the sim doesn't know it). */
  cityName = 'the city';
  private readonly city: City;
  private readonly needs: () => NeedsReport;
  /** A home's need scores (0..1), for everyday stories. */
  private readonly scores: (id: number) => Partial<Record<NeedKind, number>> | undefined;
  private homes = new Map<number, HomeState>();
  private civic = new Set<number>();
  private month: Story[] = [];
  /** The month's starting numbers, taken on its first day (not at construction, before needs ran). */
  private monthStart: MonthStart | null = null;
  private openedThisMonth: BuildingInstance[] = [];
  private seq = 0;
  /** The need yesterday's everyday story was about (so the next is about something else). */
  private lastNeed: NeedKind | null = null;

  constructor(city: City, needs: () => NeedsReport, scores: (id: number) => Partial<Record<NeedKind, number>> | undefined = () => undefined) {
    this.city = city;
    this.needs = needs;
    this.scores = scores;
    this.prime();
  }

  /** Remember today's homes and civic buildings without telling stories (a new or loaded city). */
  private prime() {
    this.homes.clear();
    this.civic.clear();
    for (const b of this.city.world.buildings.values()) {
      const d: BuildingDef = BUILDINGS[b.def];
      if (d.category === 'residential') this.homes.set(b.id, stateOf(b));
      else if (d.category === 'civic' && b.construction === 0) this.civic.add(b.id);
    }
  }

  private snapshot(): MonthStart {
    return { population: cityStats(this.city.world).population, happiness: this.needs().happiness, stage: this.city.stage };
  }

  onDay(out: DayOutcome) {
    this.monthStart ??= this.snapshot();
    const w = this.city.world;
    const found: Candidate[] = [];
    const abandoned = new Set(out.abandoned);
    const seen = new Map<number, HomeState>();
    for (const b of w.buildings.values()) {
      const d: BuildingDef = BUILDINGS[b.def];
      if (d.category === 'residential') {
        const now = stateOf(b);
        seen.set(b.id, now);
        const was = this.homes.get(b.id);
        if (abandoned.has(b.id)) found.push({ kind: 'left', home: b });
        else if (b.construction > 0 || now.occupants === 0) continue;
        else if (!was || was.occupants === 0) found.push({ kind: 'moved-in', home: b });
        else if (now.lifestyle > was.lifestyle) found.push({ kind: 'moved-up', home: b });
        else if (now.robbed && !was.robbed) found.push({ kind: 'robbed', home: b });
        else if (now.sick && !was.sick) found.push({ kind: 'sick', home: b });
      } else if (d.category === 'civic' && b.construction === 0 && !this.civic.has(b.id)) {
        this.civic.add(b.id);
        if (d.group && NEWSWORTHY.has(d.group)) {
          this.openedThisMonth.push(b);
          const home = nearestHome(this.city, b);
          if (home) found.push({ kind: 'opened', home, opened: b });
        }
      }
    }
    this.homes = seen;
    const told = choose(found, this.city.day).map((c) => this.tell(c));
    // A quiet day: one everyday moment from a home picked by the day.
    if (told.length === 0) {
      const life = this.everyday([...seen.keys()]);
      if (life) told.push(life);
    }
    out.stories = told;
  }

  /** An everyday moment for a home: the need it is best or worst off for, told as a line. */
  private everyday(ids: readonly number[]): Story | null {
    if (ids.length === 0) return null;
    const home = this.city.world.buildings.get(ids[hash(this.city.day, ids.length) % ids.length]);
    if (!home || home.occupants === 0 || home.construction > 0) return null;
    const scores = this.scores(home.id);
    if (!scores) return null;
    const known = LIFE.filter((l) => scores[l.need] !== undefined);
    if (known.length === 0) return null;
    // A need the home really lacks is what people talk about; otherwise one of the things that go
    // well, picked by the day. Never the same need two days running.
    const fresh = known.filter((l) => l.need !== this.lastNeed);
    const poor = fresh.filter((l) => (scores[l.need] ?? 1) < 0.5).sort((a, b) => (scores[a.need] ?? 1) - (scores[b.need] ?? 1));
    const fine = fresh.filter((l) => (scores[l.need] ?? 0) >= 0.85);
    const bad = poor.length > 0 && hash(this.city.day, home.id) % 3 !== 0;
    const from = bad ? poor : fine;
    if (from.length === 0) return null;
    const pickFrom = bad ? from[0] : from[hash(this.city.day, home.id, 5) % from.length];
    const good = !bad;
    this.lastNeed = pickFrom.need;
    const people = residentsOf(this.city.world, home);
    const who = people[hash(home.id, this.city.day) % Math.max(1, people.length)];
    if (!who) return null;
    const text = (good ? pickFrom.good : pickFrom.bad).replace('{name}', who.name).replace('{first}', who.first);
    return this.record({ kind: 'life', home }, who.name, text);
  }

  /** The month ended: write the edition (returned, and kept as `latest`). */
  onMonth(): Edition {
    const now = this.snapshot();
    const start = this.monthStart ?? now;
    const { year, month } = lastMonth(this.city);
    // A quiet month still has its everyday moments.
    const stories = this.month.length > 0 ? this.month.slice(0, 4) : this.recent.slice(0, 3);
    const edition: Edition = {
      year,
      month,
      headline: this.headline(now, start),
      lead: lead(now, start, cityStats(this.city.world)),
      stories,
      opinion: this.opinion(),
    };
    this.latest = edition;
    this.month = [];
    this.openedThisMonth = [];
    this.monthStart = now;
    return edition;
  }

  private tell(c: Candidate): Story {
    const people = residentsOf(this.city.world, c.home);
    // A home that was just left has nobody in it any more: tell it about the family that went.
    const who: Resident | undefined = people[hash(c.home.id, this.city.day) % Math.max(1, people.length)];
    const name = who?.name ?? `The ${familyOf(this.city, c.home)} family`;
    const first = who?.first ?? name;
    return this.record(c, name, storyText(c, name, first, this.city.day));
  }

  private record(c: Candidate, who: string, text: string): Story {
    const story: Story = { id: ++this.seq, day: this.city.day, kind: c.kind, building: c.home.id, x: c.home.x, y: c.home.y, who, text };
    this.recent = [story, ...this.recent].slice(0, KEEP);
    // Everyday moments fill the feed; the newspaper keeps the month's events.
    if (c.kind !== 'life') this.month.push(story);
    return story;
  }

  private headline(now: MonthStart, start: MonthStart): string {
    const name = this.cityName;
    if (now.stage > start.stage) return `${name} is now a ${STAGES[now.stage].name}!`;
    const big = this.openedThisMonth.map((b) => BUILDINGS[b.def]).sort((a, b) => b.cost - a.cost)[0];
    if (big && big.cost >= 3000) return `New ${big.name} opens in ${name}`;
    const change = start.population > 0 ? (now.population - start.population) / start.population : 0;
    if (change >= 0.05) return `${name} grows to ${now.population.toLocaleString('en-US')} people`;
    if (change <= -0.03) return `Families are leaving ${name}`;
    const mood = now.happiness - start.happiness;
    if (mood >= 0.03) return `Spirits rise across ${name}`;
    if (mood <= -0.03) return `Grumbling grows in ${name}`;
    if (this.month.length > 0) return `A busy month for the people of ${name}`;
    return `A quiet month in ${name}`;
  }

  private opinion(): Edition['opinion'] {
    const drag = this.needs().drags[0];
    if (!drag || drag.loss < 0.01) return null;
    const home = this.city.world.buildings.get(drag.building);
    if (!home) return null;
    const who = residentsOf(this.city.world, home)[0];
    if (!who) return null;
    return { who: `${who.name}, ${who.age}`, text: `“${COMPLAINT_TEXT[drag.kind]}.”`, building: home.id };
  }
}

/** Everyday lines by need: when the home is well off for it, and when it isn't. */
const LIFE: readonly { need: NeedKind; good: string; bad: string }[] = [
  { need: 'parks', good: '{first} spent the evening in the park with friends.', bad: '{first} wishes there was a park nearby for the kids.' },
  { need: 'shopping', good: '{name} picked up groceries on the walk home.', bad: '{name} drove across town just to buy bread.' },
  { need: 'commute', good: "{first}'s commute takes only a few minutes.", bad: '{name} spent another hour stuck in traffic.' },
  { need: 'transit', good: '{name} caught the bus to work, right on time.', bad: '{first} has no bus or train to get to work.' },
  { need: 'air', good: '{first} hung the washing out in the clean air.', bad: '{first} keeps the windows shut: the air smells of smoke.' },
  { need: 'safety', good: '{first} walks home late and feels safe.', bad: '{name} worries about the street after dark.' },
  { need: 'health', good: '{name} saw a doctor the same day.', bad: '{name} waited all week to see a doctor.' },
  { need: 'education', good: "{first}'s children love their teacher.", bad: "{first}'s children have a long trip to school." },
  { need: 'jobs', good: '{name} landed a new job this week.', bad: '{name} is still looking for work.' },
  { need: 'garbage', good: "The bins on {first}'s street were emptied this morning.", bad: "Rubbish is piling up outside {first}'s door." },
];

function stateOf(b: BuildingInstance): HomeState {
  return { occupants: b.occupants, lifestyle: b.lifestyle, robbed: b.robbed > 0, sick: b.sick > 0 };
}

/** At most PER_DAY stories, the most interesting kinds first, one of each kind. */
function choose(found: readonly Candidate[], day: number): Candidate[] {
  const out: Candidate[] = [];
  for (const kind of PRIORITY) {
    const of = found.filter((c) => c.kind === kind);
    if (of.length === 0) continue;
    out.push(of[hash(day, kind.length, of.length) % of.length]);
    if (out.length === PER_DAY) break;
  }
  return out;
}

function nearestHome(city: City, b: BuildingInstance): BuildingInstance | null {
  let best: BuildingInstance | null = null;
  let bestD = 13;
  for (const h of city.world.buildings.values()) {
    if (BUILDINGS[h.def].category !== 'residential' || h.occupants === 0) continue;
    const d = Math.max(Math.abs(h.x - b.x), Math.abs(h.y - b.y));
    if (d < bestD) {
      bestD = d;
      best = h;
    }
  }
  return best;
}

function familyOf(city: City, home: BuildingInstance): string {
  const name = residentsOf(city.world, { ...home, occupants: 1 })[0]?.name ?? 'Novak';
  return name.split(' ').slice(1).join(' ');
}

/** The previous month's date (the edition comes out on its last day). */
function lastMonth(city: City): { year: number; month: number } {
  const { year, month } = city.date;
  return month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
}

function lead(now: MonthStart, start: MonthStart, stats: ReturnType<typeof cityStats>): string {
  const change = start.population > 0 ? ((now.population - start.population) / start.population) * 100 : 0;
  const sign = change >= 0 ? '+' : '−';
  const jobless = stats.workers + stats.unemployed > 0 ? (stats.unemployed / (stats.workers + stats.unemployed)) * 100 : 0;
  return `${now.population.toLocaleString('en-US')} people (${sign}${Math.abs(change).toFixed(1)}% this month) · ${Math.round(now.happiness * 100)}% happy · ${jobless.toFixed(1)}% out of work`;
}

/** One line about it, in a few wordings picked by the day so stories don't repeat. */
function storyText(c: Candidate, name: string, first: string, day: number): string {
  const v = hash(day, c.home.id) % 3;
  const d: BuildingDef = BUILDINGS[c.home.def];
  const home = d.name.toLowerCase();
  switch (c.kind) {
    case 'moved-in':
      return [`${name} just moved into a new ${home}.`, `${name} has the keys to a ${home} and is unpacking boxes.`, `New neighbours: ${name} moved into a ${home}.`][v];
    case 'moved-up':
      return [
        `${name}'s household is now ${LIFESTYLE_NAMES[c.home.lifestyle]}: a better job, a better life.`,
        `Things are looking up for ${first}: the family is now ${LIFESTYLE_NAMES[c.home.lifestyle]}.`,
        `${name} got a promotion. The household moved up to ${LIFESTYLE_NAMES[c.home.lifestyle]}.`,
      ][v];
    case 'robbed':
      return [`${name}'s home was broken into. “Where were the police?”`, `Thieves hit ${first}'s street last night.`, `${name} is fitting new locks after a burglary.`][v];
    case 'sick':
      return [`${name} is home sick and waiting for a doctor.`, `${first} caught something nasty this week.`, `${name} fell ill; the family hopes help comes soon.`][v];
    case 'left':
      return [`${name} packed up and left. The house stands empty.`, `${name} gave up on the neighbourhood and moved away.`, `Another empty home: ${name} has left.`][v];
    case 'life':
      return `${name} had an ordinary day.`;
    case 'opened': {
      const place = c.opened ? BUILDINGS[c.opened.def].name : 'service';
      return [`${name} is glad the new ${place} opened nearby.`, `“About time!” says ${first} as the new ${place} opens down the road.`, `${name} was first in line at the new ${place}.`][v];
    }
  }
}
