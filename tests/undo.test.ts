import { describe, expect, it } from 'vitest';
import { City } from '../src/sim/City';
import {
  applyClear,
  applyMove,
  applyPlace,
  applyRoad,
  applyZone,
  planClear,
  planMove,
  planPlace,
  planRoad,
  planZone,
} from '../src/sim/commands';
import { rectTiles, roadPath, RoadType } from '../src/sim/roads';
import { Terrain } from '../src/sim/terrain/types';
import { applyUndo, canUndo, captureUndo, finishUndo, type UndoRecord } from '../src/sim/undo';
import { World } from '../src/sim/World';
import { ZoneType } from '../src/sim/zones';
import { mulberry32 } from '../src/shared/rng';
import { gridTown } from './support/gridTown';
import { liveDay, violations } from './support/invariants';

function grassCity(n = 16, funds = 100_000) {
  const w = new World(n, n, 0);
  w.terrain.fill(Terrain.Grass);
  return { w, city: new City(w, funds) };
}

/** Every editable layer and the building ids, for before/after comparisons. */
function layers(w: World) {
  return [
    w.tree,
    w.decor,
    w.road,
    w.bridge,
    w.lane,
    w.pave,
    w.zone,
    w.rail,
    w.over,
    w.overAxis,
    w.building,
  ].map((a) => Array.from(a).join(','));
}

function must(rec: UndoRecord | null): UndoRecord {
  expect(rec).not.toBeNull();
  if (!rec) throw new Error('no undo record');
  return rec;
}

describe('undo (D-101)', () => {
  it('takes back a road and refunds it', () => {
    const { w, city } = grassCity();
    w.tree[w.index(3, 2)] = 2;
    const start = layers(w);
    const plan = planRoad(w, roadPath({ x: 1, y: 2 }, { x: 9, y: 2 }, true), RoadType.Road);
    const cap = captureUndo(city, plan.tiles);
    expect(applyRoad(city, plan, RoadType.Road).ok).toBe(true);
    const rec = must(finishUndo(city, cap));
    expect(rec.spent).toBe(plan.cost);
    expect(applyUndo(city, rec)).toMatchObject({ ok: true, refunded: plan.cost });
    expect(city.funds).toBe(100_000);
    expect(layers(w)).toEqual(start);
  });

  it('brings back a cleared building, the same one, with its residents', () => {
    const { w, city } = grassCity();
    applyPlace(city, planPlace(w, 'clinic', 5, 5), 0);
    const b = w.buildings.get(w.building[w.index(5, 5)]);
    if (!b) throw new Error('not placed');
    b.occupants = 3;
    const start = layers(w);
    const funds = city.funds;
    // Clearing one tile of it removes all of it.
    const plan = planClear(w, [{ x: 5, y: 5 }]);
    const cap = captureUndo(city, plan.tiles);
    applyClear(city, plan);
    expect(w.buildings.has(b.id)).toBe(false);
    applyUndo(city, must(finishUndo(city, cap)));
    expect(w.buildings.get(b.id)).toBe(b);
    expect(b.occupants).toBe(3);
    expect(layers(w)).toEqual(start);
    expect(city.funds).toBe(funds);
  });

  it('removes a placed building and refunds its price', () => {
    const { w, city } = grassCity();
    const start = layers(w);
    const plan = planPlace(w, 'park', 6, 6);
    const cap = captureUndo(city, plan.tiles);
    applyPlace(city, plan, 0);
    expect(w.buildings.size).toBe(1);
    applyUndo(city, must(finishUndo(city, cap)));
    expect(w.buildings.size).toBe(0);
    expect(layers(w)).toEqual(start);
    expect(city.funds).toBe(100_000);
  });

  it('puts a moved building back where it stood', () => {
    const { w, city } = grassCity();
    applyPlace(city, planPlace(w, 'clinic', 4, 4), 0);
    const id = w.building[w.index(4, 4)];
    const b = w.buildings.get(id);
    if (!b) throw new Error('not placed');
    const start = layers(w);
    const funds = city.funds;
    const plan = planMove(w, id, 10, 10);
    if (!plan) throw new Error('no move plan');
    const cap = captureUndo(city, [...plan.tiles, { x: b.x, y: b.y }]);
    applyMove(city, plan);
    expect(b.x).not.toBe(4);
    applyUndo(city, must(finishUndo(city, cap)));
    expect({ x: b.x, y: b.y }).toEqual({ x: 4, y: 4 });
    expect(layers(w)).toEqual(start);
    expect(city.funds).toBe(funds);
  });

  it('restores a grown home that rezoning removed', () => {
    const { w, city } = grassCity();
    applyZone(
      city,
      planZone(w, rectTiles({ x: 2, y: 2 }, { x: 4, y: 4 }), ZoneType.Residential),
      ZoneType.Residential,
    );
    const home = w.addBuilding(
      { def: 'cottage', x: 3, y: 3, variant: 0, grown: true, occupants: 4 },
      1,
      1,
    );
    const start = layers(w);
    const plan = planZone(w, rectTiles({ x: 2, y: 2 }, { x: 4, y: 4 }), ZoneType.Industrial);
    const cap = captureUndo(city, plan.tiles);
    applyZone(city, plan, ZoneType.Industrial);
    expect(w.buildings.has(home.id)).toBe(false);
    applyUndo(city, must(finishUndo(city, cap)));
    expect(w.buildings.get(home.id)?.occupants).toBe(4);
    expect(layers(w)).toEqual(start);
  });

  it('has nothing to undo when nothing changed', () => {
    const { w, city } = grassCity();
    const plan = planClear(w, rectTiles({ x: 1, y: 1 }, { x: 3, y: 3 }));
    const cap = captureUndo(city, plan.tiles);
    applyClear(city, plan);
    expect(finishUndo(city, cap)).toBeNull();
  });

  it('refuses once the city has changed those tiles since', () => {
    const { w, city } = grassCity();
    const zone = planZone(w, rectTiles({ x: 2, y: 2 }, { x: 4, y: 4 }), ZoneType.Residential);
    const cap = captureUndo(city, zone.tiles);
    applyZone(city, zone, ZoneType.Residential);
    const rec = must(finishUndo(city, cap));
    // A home grows on the new zone: undoing now would erase it, so it's refused.
    w.addBuilding({ def: 'cottage', x: 3, y: 3, variant: 0, grown: true }, 1, 1);
    expect(canUndo(w, rec)).toBe(false);
    const funds = city.funds;
    expect(applyUndo(city, rec)).toMatchObject({ ok: false, reason: 'changed-since' });
    expect(city.funds).toBe(funds);
    expect(w.zone[w.index(2, 2)]).toBe(ZoneType.Residential);
  });

  it('refuses a second undo of the same action (no double refund)', () => {
    const { w, city } = grassCity();
    const plan = planRoad(w, roadPath({ x: 1, y: 1 }, { x: 6, y: 1 }, true), RoadType.Road);
    const cap = captureUndo(city, plan.tiles);
    applyRoad(city, plan, RoadType.Road);
    const rec = must(finishUndo(city, cap));
    expect(applyUndo(city, rec).ok).toBe(true);
    expect(applyUndo(city, rec).ok).toBe(false);
    expect(city.funds).toBe(100_000);
  });

  it('keeps every invariant through a living city with random edits and undos', () => {
    const t = gridTown({ size: 48 });
    t.sim.runDays(60);
    const rng = mulberry32(7);
    const w = t.world;
    const pick = () => 9 + Math.floor(rng() * (w.width - 18));
    for (let round = 0; round < 40; round++) {
      const x = pick();
      const y = pick();
      const kind = Math.floor(rng() * 4);
      const tiles = rectTiles({ x, y }, { x: x + 2, y: y + 2 });
      const funds = t.city.funds;
      let rec: UndoRecord | null;
      if (kind === 0) {
        const p = planClear(w, tiles);
        const cap = captureUndo(t.city, p.tiles);
        applyClear(t.city, p);
        rec = finishUndo(t.city, cap);
      } else if (kind === 1) {
        const p = planRoad(w, roadPath({ x, y }, { x: x + 5, y }, true), RoadType.Road);
        const cap = captureUndo(t.city, p.tiles);
        applyRoad(t.city, p, RoadType.Road);
        rec = finishUndo(t.city, cap);
      } else if (kind === 2) {
        const p = planZone(w, tiles, ZoneType.Commercial);
        const cap = captureUndo(t.city, p.tiles);
        applyZone(t.city, p, ZoneType.Commercial);
        rec = finishUndo(t.city, cap);
      } else {
        const p = planPlace(w, 'park', x, y);
        const cap = captureUndo(t.city, p.tiles);
        applyPlace(t.city, p, 0);
        rec = finishUndo(t.city, cap);
      }
      t.sim.worldChanged({ roads: true });
      // Sometimes the city lives a little before the undo (as the toast waits), sometimes not.
      if (rng() < 0.5) liveDay(t.sim);
      if (rec && rng() < 0.7) {
        const res = applyUndo(t.city, rec);
        if (res.ok) expect(t.city.funds).toBeLessThanOrEqual(funds + 1e-6);
        t.sim.worldChanged({ roads: true });
      }
      liveDay(t.sim);
      expect(violations(t.sim)).toEqual([]);
    }
  });
});
