import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Game } from '../src/game/Game';
import { AUTH_HANDOFF_EVENT, CitySaver, type SaveStatus } from '../src/save/CitySaver';
import { readJournal } from '../src/save/journal';
import { City } from '../src/sim/City';
import { serialize } from '../src/sim/save';
import { generateTerrain } from '../src/sim/terrain/generate';
import { presetSettings } from '../src/sim/terrain/presets';

/** Device and account stores, recorded instead of IndexedDB and HTTP. */
const writes: string[] = [];
vi.mock('../src/save/localStore', () => ({
  localStore: {
    create: vi.fn(async () => {
      writes.push('local:create');
      return { id: 7 };
    }),
    update: vi.fn(async () => void writes.push('local:update')),
    remove: vi.fn(async () => void writes.push('local:remove')),
  },
}));
vi.mock('../src/save/cloudStore', () => ({
  cloudStore: {
    create: vi.fn(async () => {
      writes.push('cloud:create');
      return { id: 70 };
    }),
    update: vi.fn(async () => void writes.push('cloud:update')),
    remove: vi.fn(async () => void writes.push('cloud:remove')),
  },
}));

const terrain = presetSettings('coastal', 5, 64);

/** Just what CitySaver reads from a Game: a snapshot, the change stamp, the world and worldChanged. */
function fakeGame() {
  const city = new City(generateTerrain(terrain));
  let edits = 0;
  const game = {
    world: city.world,
    snapshot: () => serialize(city, terrain, 'T'),
    get changeStamp() {
      return { edits, day: city.day };
    },
    events: { on: () => () => undefined },
    edit: () => void edits++,
  };
  return game;
}

/**
 * CitySaver only touches the members above; the rest of Game (renderer, WebGL) can't exist in
 * a test, so the fake stands in for it through `unknown`.
 */
const asGame = (g: ReturnType<typeof fakeGame>) => g as unknown as Game;

beforeEach(() => {
  writes.length = 0;
  const items = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => items.get(k) ?? null,
    setItem: (k: string, v: string) => void items.set(k, v),
    removeItem: (k: string) => void items.delete(k),
  });
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('document', Object.assign(new EventTarget(), { visibilityState: 'visible' }));
});

function saver(store: () => 'local' | 'cloud' = () => 'local') {
  const g = fakeGame();
  const statuses: SaveStatus[] = [];
  const s = new CitySaver(asGame(g), {
    ref: { store: 'local', id: 7 },
    preferredStore: store,
    onStatus: (st) => statuses.push(st),
    onRef: () => undefined,
  });
  return { g, s, statuses };
}

describe('CitySaver pause (guest past the trial, D-103)', () => {
  it('saves nothing while paused: no store write, no journal, status "paused"', async () => {
    const { g, s, statuses } = saver();
    s.setPaused(true);
    g.edit();
    await s.autosave();
    await s.saveNow();
    s.journalNow();
    window.dispatchEvent(new Event('pagehide'));
    expect(writes).toEqual([]);
    expect(readJournal({ store: 'local', id: 7 })).toBeNull();
    expect(statuses.at(-1)).toEqual({ kind: 'paused' });
    s.dispose();
  });

  it('keeps the city for an OAuth trip even while paused', () => {
    const { g, s } = saver();
    s.setPaused(true);
    g.edit();
    window.dispatchEvent(new Event(AUTH_HANDOFF_EVENT));
    expect(readJournal({ store: 'local', id: 7 })).not.toBeNull();
    expect(writes).toEqual([]);
    s.dispose();
  });

  it('resuming after sign-up saves at once, moving the city into the account', async () => {
    let signedIn = false;
    const { g, s, statuses } = saver(() => (signedIn ? 'cloud' : 'local'));
    s.setPaused(true);
    g.edit();
    signedIn = true;
    // Resuming starts the save by itself.
    s.setPaused(false);
    await vi.waitFor(() => expect(writes).toEqual(['cloud:create', 'local:remove']));
    expect(statuses.at(-1)).toMatchObject({ kind: 'saved', store: 'cloud' });
    s.dispose();
  });

  it('saves normally when not paused', async () => {
    const { g, s } = saver();
    g.edit();
    await s.autosave();
    expect(writes).toEqual(['local:update']);
    s.dispose();
  });
});
