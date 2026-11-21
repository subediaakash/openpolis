import { buildingDef } from '../../src/sim/buildings/catalog';
import type { Simulation } from '../../src/sim/core/Simulation';
import { TECHS } from '../../src/sim/research';
import { RoadType } from '../../src/sim/roads';
import { INCIDENTS } from '../../src/sim/systems/incidents';
import { materialStorage } from '../../src/sim/systems/materials';
import { cityStats } from '../../src/sim/systems/population';

/**
 * Invariants across every system (docs/02-architecture.md, "Simulation Systems"): rules that
 * must hold every day whatever the player does. A long run with random edits (bulldozing
 * buildings and roads, new stations, tax changes) is where systems that are each fine alone
 * break each other: dangling ids, NaN, negative stock, over-full buildings, cars on removed road.
 */

/** Every rule, as a list of what broke (empty when all hold). */
export function violations(sim: Simulation): string[] {
  const out: string[] = [];
  const bad = (msg: string) => out.length < 20 && out.push(msg);
  const w = sim.world;
  const city = sim.city;
  const finite = (n: number) => Number.isFinite(n);

  // City.
  if (!finite(city.funds)) bad(`funds ${city.funds}`);
  if (!finite(city.materials) || city.materials < 0) bad(`materials ${city.materials}`);
  if (city.needsMaterials && city.materials > materialStorage(city) + 1e-6)
    bad(`materials ${city.materials} over storage ${materialStorage(city)}`);
  if (!finite(city.uncollected) || city.uncollected < 0) bad(`uncollected ${city.uncollected}`);
  if (city.research.done < 0 || city.research.done > TECHS.length || !finite(city.research.points))
    bad(`research ${JSON.stringify(city.research)}`);

  // Buildings.
  for (const b of w.buildings.values()) {
    const d = buildingDef(b.def);
    const tag = `${b.def}#${b.id}@${b.x},${b.y}`;
    if (!Number.isInteger(b.occupants) || b.occupants < 0 || b.occupants > d.capacity)
      bad(`${tag} occupants ${b.occupants}/${d.capacity}`);
    if (!finite(b.happiness) || b.happiness < 0 || b.happiness > 1)
      bad(`${tag} happiness ${b.happiness}`);
    if (!finite(b.garbage) || b.garbage < 0) bad(`${tag} garbage ${b.garbage}`);
    if (d.garbage?.holds !== undefined && b.filled > d.garbage.holds + 1e-6)
      bad(`${tag} landfill over-full ${b.filled}`);
    if (b.condition < 0 || b.condition > 1 || b.repairDays < 0)
      bad(`${tag} condition ${b.condition} repair ${b.repairDays}`);
    if (b.construction < 0) bad(`${tag} construction ${b.construction}`);
    if (b.abandoned && b.occupants > 0) bad(`${tag} abandoned with ${b.occupants} occupants`);
    if (b.robbed < 0 || b.robbed > INCIDENTS.markDays || b.sick < 0 || b.sick > INCIDENTS.markDays)
      bad(`${tag} marks ${b.robbed}/${b.sick}`);
    if (b.entrance !== -1 && w.road[b.entrance] === RoadType.None)
      bad(`${tag} entrance ${b.entrance} is not a road`);
    if (b.entrance === -1 && b.occupants > 0 && d.category !== 'civic')
      bad(`${tag} has occupants but no road`);
    for (let y = b.y; y < b.y + d.size.h; y++) {
      for (let x = b.x; x < b.x + d.size.w; x++) {
        if (!w.inBounds(x, y)) bad(`${tag} off the map`);
        else {
          const i = w.index(x, y);
          if (w.building[i] !== b.id) bad(`${tag} tile ${x},${y} owned by ${w.building[i]}`);
          if (w.road[i] !== RoadType.None) bad(`${tag} stands on a road at ${x},${y}`);
        }
      }
    }
  }
  // No tile points at a building that is gone.
  for (let i = 0; i < w.building.length; i++)
    if (w.building[i] !== -1 && !w.buildings.has(w.building[i]))
      bad(`tile ${i} owned by missing building ${w.building[i]}`);

  // People.
  const s = cityStats(w);
  if (s.population > s.housing) bad(`population ${s.population} over housing ${s.housing}`);

  // Incidents.
  const seen = new Set<string>();
  const perKind = new Map<string, number>();
  for (const inc of sim.incidents.active) {
    if (!w.buildings.has(inc.building))
      bad(`incident ${inc.id} on missing building ${inc.building}`);
    const key = `${inc.kind}:${inc.building}`;
    if (seen.has(key)) bad(`two ${inc.kind} incidents on building ${inc.building}`);
    seen.add(key);
    perKind.set(inc.kind, (perKind.get(inc.kind) ?? 0) + 1);
    if (inc.kind === 'fire' && !inc.answered && inc.age > INCIDENTS.burnAfter)
      bad(`fire ${inc.id} older than burnAfter (${inc.age})`);
  }
  for (const [kind, n] of perKind)
    if (n > INCIDENTS.maxActive + (kind === 'injury' ? INCIDENTS.maxActive : 0))
      bad(`${n} ${kind} incidents at once`);
  const perStation = new Map<number, number>();
  for (const r of sim.incidents.responders) {
    const st = w.buildings.get(r.station);
    if (!st) bad(`vehicle from missing station ${r.station}`);
    perStation.set(r.station, (perStation.get(r.station) ?? 0) + 1);
    if (r.elapsed < 0 || r.duration < 0 || !finite(r.duration))
      bad(`vehicle timing ${r.elapsed}/${r.duration}`);
  }
  for (const [id, n] of perStation) {
    const st = w.buildings.get(id);
    const fleet = st ? (buildingDef(st.def).responder?.vehicles ?? 0) : 0;
    if (n > fleet) bad(`station ${id} has ${n} vehicles out of a fleet of ${fleet}`);
  }

  // Traffic: cars only on road that still exists.
  for (const a of sim.traffic.traffic.agents) {
    for (let k = a.seg; k < a.path.length; k++) {
      if (w.road[a.path[k]] === RoadType.None) {
        bad(`${a.kind} on a removed road tile ${a.path[k]}`);
        break;
      }
    }
  }
  // Commute and air numbers stay real.
  for (let i = 0; i < w.road.length; i++) {
    const c = sim.commute.congestion[i];
    if (!finite(c) || c < 0) {
      bad(`congestion ${c} at ${i}`);
      break;
    }
  }
  if (!finite(sim.commute.report.avgMinutes)) bad(`avg commute ${sim.commute.report.avgMinutes}`);
  for (const v of sim.air.aqi) {
    if (!finite(v) || v < 0) {
      bad(`AQI ${v}`);
      break;
    }
  }
  return out;
}

/** One day through tick() and frame(), so traffic and emergency vehicles really move. */
export function liveDay(sim: Simulation) {
  for (let t = 0; t < 60; t++) {
    sim.tick();
    sim.frame(0.1);
    sim.incidents.takeEvents();
  }
}
