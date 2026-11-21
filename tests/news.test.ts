import { describe, expect, it } from 'vitest';
import { Newsroom, type DayFacts } from '../src/game/news/newsroom';
import { residentName, residentsOf, type HomeContext } from '../src/game/news/people';

const facts = (over: Partial<DayFacts> = {}): DayFacts => ({
  day: 1,
  date: 'Jan 2, Y1',
  population: 0,
  happiness: 1,
  jammedTiles: 0,
  aqi: 20,
  voice: null,
  budget: null,
  ...over,
});

const home = (over: Partial<HomeContext> = {}): HomeContext => ({
  seed: 42,
  buildingId: 7,
  occupants: 4,
  happiness: 0.9,
  complaint: null,
  jobless: 0,
  jobs: { shop: 10, office: 10, industry: 10 },
  ...over,
});

describe('named residents', () => {
  it('are the same people every time for a home, and differ between homes', () => {
    expect(residentsOf(home())).toEqual(residentsOf(home()));
    expect(residentsOf(home()).map((r) => r.name)).not.toEqual(residentsOf(home({ buildingId: 8 })).map((r) => r.name));
    expect(residentName(42, 7, 0)).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
  });

  it('a home shows at most three residents, none when empty', () => {
    expect(residentsOf(home({ occupants: 40 }))).toHaveLength(3);
    expect(residentsOf(home({ occupants: 1 }))).toHaveLength(1);
    expect(residentsOf(home({ occupants: 0 }))).toHaveLength(0);
  });

  it('speak their home’s complaint when unhappy, and are pleased when happy', () => {
    const unhappy = residentsOf(home({ happiness: 0.3, complaint: 'We need a clinic nearby' }));
    const working = unhappy.filter((r) => r.role !== 'jobless');
    expect(working.every((r) => r.says === 'We need a clinic nearby.')).toBe(true);
    const happy = residentsOf(home({ happiness: 0.95 }));
    expect(happy.every((r) => !r.says.includes('clinic'))).toBe(true);
  });

  it('follow the city’s jobs: with no jobs at all, working-age residents are looking for work', () => {
    const rs = residentsOf(home({ occupants: 3, jobs: { shop: 0, office: 0, industry: 0 } }));
    for (const r of rs) {
      if (r.age > 22 && r.age < 67) expect(r.role).toBe('jobless');
    }
  });
});

describe('the newspaper', () => {
  it('opens with a founding story for a new city and a welcome back for a saved one', () => {
    const a = new Newsroom('Bayport', 1);
    a.open(facts(), 'Bayport', 'Hamlet', 'new');
    expect(a.edition().paper).toBe('The Bayport Courier');
    expect(a.edition().stories[0].headline).toBe('Bayport is founded');
    const b = new Newsroom('Bayport', 1);
    b.open(facts({ population: 1200, happiness: 0.8 }), 'Bayport', 'Village', 'saved');
    expect(b.edition().stories[0].headline).toBe('Welcome back to Bayport');
    expect(b.edition().stories[0].body).toContain('1,200 people');
  });

  it('reports population milestones once, as they are crossed', () => {
    const n = new Newsroom('Bayport', 1);
    n.open(facts({ population: 400 }), 'Bayport', 'Village', 'new');
    n.onDay(facts({ day: 2, population: 600 }));
    n.onDay(facts({ day: 3, population: 650 }));
    const marks = n.edition().stories.filter((s) => s.section === 'milestone');
    expect(marks).toHaveLength(1);
    expect(marks[0].headline).toMatch(/500/);
  });

  it('writes a weekly review with a named resident’s quote', () => {
    const n = new Newsroom('Bayport', 1);
    n.open(facts({ population: 100, happiness: 0.7 }), 'Bayport', 'Hamlet', 'new');
    n.onDay(facts({ day: 7, population: 160, happiness: 0.8, voice: { building: 12, home: 'Cottage', text: 'We need a clinic nearby' } }));
    const review = n.edition().stories[0];
    expect(review.section).toBe('review');
    expect(review.headline).toBe('This week: 60 new residents');
    expect(review.body).toContain('spirits are rising');
    expect(review.quote?.text).toBe('We need a clinic nearby');
    expect(review.quote?.by).toBe(`${residentName(1, 12, 0)}, from the Cottage`);
    expect(review.focus).toBe(12);
  });

  it('reports gridlock and smog, but not every day', () => {
    const n = new Newsroom('Bayport', 1);
    n.open(facts({ population: 5000, jammedTiles: 10 }), 'Bayport', 'Town', 'new');
    for (let d = 1; d <= 6; d++) n.onDay(facts({ day: d, population: 5000, jammedTiles: 60, aqi: 180 }));
    const trouble = n.edition().stories.filter((s) => s.section === 'trouble');
    expect(trouble.filter((s) => s.body.includes('over capacity'))).toHaveLength(1);
    expect(trouble.filter((s) => s.headline === 'Smog settles over the city')).toHaveLength(1);
  });

  it('only big openings make the paper; brownouts once a day; reading clears the unread count', () => {
    const n = new Newsroom('Bayport', 1);
    n.open(facts(), 'Bayport', 'Hamlet', 'new');
    n.opened('park', 'Park', 3);
    n.opened('hospital', 'Hospital', 4);
    n.brownout(19, 12);
    n.brownout(20, 3);
    const stories = n.edition().stories;
    expect(stories.filter((s) => s.headline.startsWith('Hospital'))).toHaveLength(1);
    expect(stories.some((s) => s.headline.startsWith('Park'))).toBe(false);
    expect(stories.filter((s) => s.headline === 'Lights go out across the city')).toHaveLength(1);
    expect(n.edition().unread).toBe(3);
    n.markRead();
    expect(n.edition().unread).toBe(0);
  });

  it('keeps the latest 40 stories, newest first', () => {
    const n = new Newsroom('Bayport', 1);
    n.open(facts(), 'Bayport', 'Hamlet', 'new');
    for (let k = 0; k < 50; k++) n.fireStarted('Cottage', k);
    const { stories } = n.edition();
    expect(stories).toHaveLength(40);
    expect(stories[0].id).toBeGreaterThan(stories[1].id);
  });
});
