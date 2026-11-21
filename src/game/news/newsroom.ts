import { mulberry32, subSeed } from '../../shared/rng';
import type { BuildingId } from '../../sim/buildings/catalog';
import { residentName } from './people';

/**
 * The city newspaper (docs/specs/news.md): facts from the game in, stories out. Pure and
 * deterministic for a given seed, so it can be tested without a renderer; Game reports facts
 * where it already handles them and shows `edition()`.
 */

export type StorySection = 'milestone' | 'trouble' | 'life' | 'review';

export interface StoryQuote {
  readonly text: string;
  /** "Lora Kestley, from the Cottage". */
  readonly by: string;
}

export interface Story {
  readonly id: number;
  /** Game day it happened. */
  readonly day: number;
  /** "Jul 9, Y3". */
  readonly date: string;
  readonly section: StorySection;
  readonly headline: string;
  readonly body: string;
  readonly quote: StoryQuote | null;
  /** A building the story is about ("Show"). */
  readonly focus: number | null;
}

export interface Edition {
  /** "The Bayport Courier". */
  readonly paper: string;
  /** Newest first. */
  readonly stories: readonly Story[];
  readonly unread: number;
}

/** A resident to quote: their home's id and a few words about it. */
export interface Voice {
  readonly building: number;
  /** "Cottage". */
  readonly home: string;
  readonly text: string;
}

/** The day's numbers the paper reads (Game gathers them once a day). */
export interface DayFacts {
  readonly day: number;
  readonly date: string;
  readonly population: number;
  /** 0..1. */
  readonly happiness: number;
  readonly jammedTiles: number;
  readonly aqi: number;
  /** The city's top complaint and a home that has it, for the week's quote. */
  readonly voice: Voice | null;
  /** Month end: last month's budget. */
  readonly budget: { readonly income: number; readonly expenses: number; readonly net: number } | null;
}

const KEEP = 40;
const POPULATION_MARKS = [500, 1000, 2500, 5000, 10000, 20000, 30000, 50000, 100000] as const;
const WEEK = 7;
/** Gridlock is news when jams jump this much over last week, and are at least this many tiles. */
const GRIDLOCK = { rise: 1.4, minTiles: 20 } as const;
const SMOG_AQI = 150;
const SMOG_EVERY = 30;

const money = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString('en-US')}`;
const count = (n: number) => Math.round(n).toLocaleString('en-US');

/** Opening landmarks and big services: headline fragments (the building's name is added). */
const OPENINGS: Readonly<Partial<Record<BuildingId, string>>> = {
  town_hall: 'opens its doors',
  hospital: 'opens: the city has its first beds',
  trauma_centre: 'opens with a fleet of rapid ambulances',
  university: 'welcomes its first students',
  research_centre: 'opens its labs',
  train_station: 'opens to its first passengers',
  bus_station: 'sends out its first buses',
  central_park: 'opens to the public',
  botanical_garden: 'blooms into life',
  observation_wheel: 'turns for the first time',
  theme_park: 'opens: queues around the block',
  sail_hotel: 'checks in its first guests',
  sky_tower: 'tops out over the skyline',
};

export class Newsroom {
  readonly paper: string;
  private readonly seed: number;
  private stories: Story[] = [];
  private nextId = 1;
  private unread = 0;
  /** What the paper last looked at, so it reports changes. */
  private lastPopulation = -1;
  private weekStart: { population: number; happiness: number; jams: number } | null = null;
  private lastGridlockDay = -Infinity;
  private lastSmogDay = -Infinity;
  private lastBrownoutDay = -Infinity;
  private date = '';
  private day = 0;

  constructor(cityName: string, seed: number) {
    this.paper = `The ${cityName.trim() || 'City'} Courier`;
    this.seed = seed;
  }

  /**
   * The front page: a new city's founding, a welcome back for a saved one, or a welcome to the
   * showcase city.
   */
  open(facts: DayFacts, cityName: string, stageName: string, kind: 'new' | 'saved' | 'showcase') {
    this.track(facts);
    this.lastPopulation = facts.population;
    this.weekStart = { population: facts.population, happiness: facts.happiness, jams: facts.jammedTiles };
    if (kind !== 'new' && facts.population > 0) {
      const people = `${count(facts.population)} people call this ${stageName.toLowerCase()} home, and ${Math.round(facts.happiness * 100)}% of them are happy.`;
      this.publish('life', kind === 'saved' ? `Welcome back to ${cityName}` : `Welcome to ${cityName}`, `${people} Here's what happens next.`, null, null);
    } else {
      this.publish('life', `${cityName} is founded`, 'A fresh map, a little money and a lot of empty land. Lay a road, zone some homes and the first families will follow.', null, null);
    }
  }

  // ------------------------------------------------------------ events

  stage(name: string, news: string) {
    this.publish('milestone', this.choose([`${this.city()} is now a ${name}`, `Officially a ${name}!`, `Welcome to the ${name} of ${this.city()}`]), news || 'The city keeps climbing.', null, null);
  }

  goal(title: string, reward: string) {
    this.publish('milestone', `Goal met: ${title}`, `City hall celebrates another target reached. ${reward}`, null, null);
  }

  research(name: string, effect: string) {
    this.publish('milestone', `Breakthrough: ${name}`, `${effect}.`, null, null);
  }

  lifestyle(tier: 'Comfortable' | 'Prosperous') {
    this.publish(
      'milestone',
      tier === 'Comfortable' ? 'Families move up in the world' : 'Prosperity arrives',
      tier === 'Comfortable'
        ? 'The first homes are now Comfortable: they pay more tax, and they expect a hospital nearby.'
        : 'The first homes are Prosperous: the city’s best-off residents want a university close by.',
      null,
      null,
    );
  }

  /** A building opened; only landmarks and big services make the paper. */
  opened(buildingDef: BuildingId, name: string, building: number) {
    const fragment = OPENINGS[buildingDef];
    if (!fragment) return;
    this.publish('life', `${name} ${fragment}`, this.choose(['Crowds gathered for the opening.', 'Residents turned out to take a look.', 'The mayor cut the ribbon this morning.']), null, building);
  }

  fireStarted(home: string, building: number) {
    this.publish('trouble', this.choose([`Fire at the ${home}`, `Blaze breaks out at the ${home}`, `Smoke over the city: fire at the ${home}`]), 'Fire crews have been called. Residents are urged to keep clear.', null, building);
  }

  fireOut(home: string, building: number) {
    this.publish('trouble', `Fire crews save the ${home}`, 'The blaze is out and the building still stands. Firefighters are heading back to their station.', null, building);
  }

  burned(home: string) {
    this.publish('trouble', `Fire destroys the ${home}`, 'No fire crew reached it in time. Residents ask why their street has no fire station in reach.', null, null);
  }

  brownout(hour: number, buildings: number) {
    if (this.day === this.lastBrownoutDay) return;
    this.lastBrownoutDay = this.day;
    this.publish('trouble', 'Lights go out across the city', `At ${String(hour).padStart(2, '0')}:00 the grid ran short and ${count(buildings)} building${buildings === 1 ? '' : 's'} lost power.`, null, null);
  }

  // ------------------------------------------------------------ the day

  /** Daily: population milestones, trouble the numbers show, the budget, and the week in review. */
  onDay(facts: DayFacts) {
    this.track(facts);
    this.populationMarks(facts);
    this.trouble(facts);
    if (facts.budget) this.budget(facts.budget);
    if (facts.day % WEEK === 0) this.review(facts);
  }

  private populationMarks(facts: DayFacts) {
    const before = this.lastPopulation;
    this.lastPopulation = facts.population;
    if (before < 0) return;
    const crossed = POPULATION_MARKS.filter((m) => before < m && facts.population >= m);
    const mark = crossed[crossed.length - 1];
    if (mark === undefined) return;
    this.publish('milestone', this.choose([`${count(mark)} residents and counting`, `${this.city()} passes ${count(mark)} people`, `Population hits ${count(mark)}`]), 'New families keep arriving. Keep homes, jobs and services growing together.', null, null);
  }

  private trouble(facts: DayFacts) {
    const lastWeek = this.weekStart?.jams ?? 0;
    if (facts.jammedTiles >= GRIDLOCK.minTiles && facts.jammedTiles > lastWeek * GRIDLOCK.rise && facts.day - this.lastGridlockDay >= WEEK) {
      this.lastGridlockDay = facts.day;
      this.publish('trouble', this.choose(['Gridlock grips the city', 'Commuters stuck in traffic', 'Jams spread at rush hour']), `${count(facts.jammedTiles)} stretches of road are over capacity. Wider roads, buses and jobs near homes would help.`, null, null);
    }
    if (facts.aqi >= SMOG_AQI && facts.day - this.lastSmogDay >= SMOG_EVERY) {
      this.lastSmogDay = facts.day;
      this.publish('trouble', 'Smog settles over the city', `The air quality index reached ${Math.round(facts.aqi)}. Doctors advise staying indoors; cleaner power would clear the air.`, null, null);
    }
  }

  private budget(b: NonNullable<DayFacts['budget']>) {
    const headline = b.net >= 0 ? `City books show a ${money(b.net)} surplus` : `City runs a ${money(b.net)} deficit`;
    this.publish('life', headline, `Taxes brought in ${money(b.income)} against ${money(b.expenses)} in upkeep last month.`, null, null);
  }

  private review(facts: DayFacts) {
    const start = this.weekStart ?? { population: facts.population, happiness: facts.happiness, jams: facts.jammedTiles };
    this.weekStart = { population: facts.population, happiness: facts.happiness, jams: facts.jammedTiles };
    if (facts.population === 0) return;
    const change = facts.population - start.population;
    const mood = facts.happiness - start.happiness;
    const growth = change > 0 ? `${count(change)} new residents` : change < 0 ? `${count(-change)} residents left` : 'A steady population';
    const feeling = mood > 0.02 ? 'and spirits are rising' : mood < -0.02 ? 'and the mood is souring' : 'and the mood holds';
    const quote = facts.voice ? { text: facts.voice.text, by: `${residentName(this.seed, facts.voice.building, 0)}, from the ${facts.voice.home}` } : null;
    this.publish(
      'review',
      `This week: ${growth}`,
      `${growth} this week, ${feeling} (${Math.round(facts.happiness * 100)}% happy). ${count(facts.population)} people live here now.`,
      quote,
      facts.voice?.building ?? null,
    );
  }

  // ------------------------------------------------------------ reading

  edition(): Edition {
    return { paper: this.paper, stories: this.stories, unread: this.unread };
  }

  markRead() {
    this.unread = 0;
  }

  // ------------------------------------------------------------ helpers

  private track(facts: DayFacts) {
    this.day = facts.day;
    this.date = facts.date;
  }

  private city(): string {
    return this.paper.replace(/^The /, '').replace(/ Courier$/, '');
  }

  /** One of a few phrasings, picked by a roll seeded on the story number (stable for a seed). */
  private choose(options: readonly string[]): string {
    const roll = mulberry32(subSeed(this.seed, this.nextId))();
    return options[Math.min(options.length - 1, Math.floor(roll * options.length))];
  }

  private publish(section: StorySection, headline: string, body: string, quote: StoryQuote | null, focus: number | null) {
    this.stories = [{ id: this.nextId++, day: this.day, date: this.date, section, headline, body, quote, focus }, ...this.stories].slice(0, KEEP);
    this.unread = Math.min(KEEP, this.unread + 1);
  }
}
