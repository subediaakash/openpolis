import { Container, Sprite } from 'pixi.js';
import { agentPose, type Agent, type BusStop, type TrafficLight } from '../../sim/systems/traffic';
import type { World } from '../../sim/World';
import type { RailCarPose } from '../../sim/systems/trains';
import type { Rect } from '../Camera';
import { VEHICLE_ANCHOR_Y } from '../atlas/agentArt';
import { OVERPASS_LIFT } from '../atlas/rail';
import { DECK_LIFT } from '../atlas/roadArt';
import { STOP_ANCHOR } from '../atlas/stopArt';
import type { TerrainTextures } from '../atlas/tiles';
import { tileToWorld } from '../iso';
import { liftView, tileLift } from '../view/lift';
import type { ViewRef } from '../Renderer';

/** Below these zoom levels agents are too small to read, so they're skipped entirely. */
const MIN_ZOOM_VEHICLES = 0.32;
const MIN_ZOOM_PEOPLE = 0.6;
/** Walk-cycle frame length in seconds. */
const STEP_TIME = 0.22;
/** Cull margin around the view (world px), so agents don't pop at the screen edge. */
const MARGIN = 40;
/** Emergency light bars: flashes a second, how high over the vehicle's anchor (px), and size. */
const FLASH_HZ = 3;
const LIGHT_LIFT = 7;
const LIGHT_SCALE = 0.55;
/** Two colours per vehicle, alternating (police blue and red; fire and ambulance red and white). */
const FLASH: Readonly<Partial<Record<Agent['kind'], readonly [number, number]>>> = {
  police_car: [0x3b82f6, 0xef4444],
  fire_truck: [0xef4444, 0xfff4e0],
  ambulance: [0xef4444, 0xfff4e0],
};
const FLASH_DEFAULT: readonly [number, number] = [0xef4444, 0xfff4e0];

/**
 * Draws cars and pedestrians from sim/traffic.ts. Sprites are pooled and only
 * on-screen agents get one; the layer sorts by depth (x + y) so agents overlap
 * each other correctly. It sits under the objects layer, so trees and buildings
 * in front of a road cover the cars behind them.
 */
export class AgentRenderer {
  readonly container = new Container({ sortableChildren: true });
  /** Trains up on overpass decks: above the objects layer, so the deck doesn't hide them. */
  readonly raised = new Container({ sortableChildren: true });
  /** Emergency light bars: added over the night tint, so they glow after dark. */
  readonly beacons = new Container();
  private readonly pool: Sprite[] = [];
  private readonly stopPool: Sprite[] = [];
  private readonly lampPool: Sprite[] = [];
  private readonly trainPool: Sprite[] = [];
  private readonly beaconPool: Sprite[] = [];
  visible = 0;

  constructor(
    private readonly tex: TerrainTextures,
    private readonly viewRef: ViewRef,
  ) {}

  /**
   * Draw one frame. `emergency` are the fire trucks, police cars and ambulances out on calls
   * (sim/systems/incidents.ts): drawn like traffic, plus a flashing light bar.
   */
  update(
    world: World,
    agents: readonly Agent[],
    stops: readonly BusStop[],
    lights: readonly TrafficLight[],
    view: Rect,
    zoom: number,
    trains: readonly RailCarPose[] = [],
    emergency: readonly Agent[] = [],
  ) {
    this.drawTrains(zoom >= MIN_ZOOM_VEHICLES ? trains : [], view);
    this.drawStops(world, zoom >= MIN_ZOOM_VEHICLES ? stops : [], view);
    this.drawLights(world, zoom >= MIN_ZOOM_PEOPLE ? lights : [], view);
    let used = 0;
    let beacons = 0;
    if (zoom >= MIN_ZOOM_VEHICLES) {
      const people = zoom >= MIN_ZOOM_PEOPLE;
      for (const a of agents) {
        if (a.kind === 'person' && !people) continue;
        if (this.placeAgent(world, a, view, used)) used++;
      }
      const phase = Math.floor((performance.now() / 1000) * FLASH_HZ * 2);
      for (let k = 0; k < emergency.length; k++) {
        const s = this.placeAgent(world, emergency[k], view, used);
        if (!s) continue;
        used++;
        this.placeBeacon(beacons++, s, emergency[k].kind, phase + k);
      }
    }
    for (let k = used; k < this.pool.length; k++) this.pool[k].visible = false;
    for (let k = beacons; k < this.beaconPool.length; k++) this.beaconPool[k].visible = false;
    this.visible = used;
  }

  /** Pool sprite `slot` drawn for `a`; null when it's off-screen (the slot stays free). */
  private placeAgent(world: World, a: Agent, view: Rect, slot: number): Sprite | null {
    const isPerson = a.kind === 'person';
    const pose = agentPose(world, a);
    const vt = this.viewRef.current;
    const vp = vt.pointToView(pose.x, pose.y);
    const p = liftView(this.viewRef.ground, vp.x, vp.y);
    if (p.x < view.minX - MARGIN || p.x > view.maxX + MARGIN || p.y < view.minY - MARGIN || p.y > view.maxY + MARGIN) return null;

    // On a flyover deck (driving along it), a car rides up there: lifted, and drawn over the deck.
    const tile = a.t < 0.5 ? a.path[a.seg] : a.path[Math.min(a.seg + 1, a.path.length - 1)];
    const onDeck = !isPerson && world.over[tile] !== 0 && world.overAxis[tile] === (pose.dir % 2 === 1 ? 1 : 2);
    let s = this.pool[slot];
    if (!s) {
      s = new Sprite();
      this.pool.push(s);
    }
    const layer = onDeck ? this.raised : this.container;
    if (s.parent !== layer) layer.addChild(s);
    if (a.kind === 'person') {
      s.texture = this.tex.people[a.variant % this.tex.people.length][Math.floor(a.age / STEP_TIME) % 2];
      s.anchor.set(0.5, 1);
    } else {
      const variants = this.tex.vehicles[a.kind];
      s.texture = variants[a.variant % variants.length][vt.dir(pose.dir)];
      s.anchor.set(0.5, VEHICLE_ANCHOR_Y);
    }
    s.position.set(p.x, p.y - (onDeck ? DECK_LIFT : 0));
    s.zIndex = vp.x + vp.y;
    s.visible = true;
    return s;
  }

  /** A light bar over an emergency vehicle, switching colour a few times a second. */
  private placeBeacon(slot: number, vehicle: Sprite, kind: Agent['kind'], phase: number) {
    let b = this.beaconPool[slot];
    if (!b) {
      b = new Sprite(this.tex.ambient.beacon);
      b.anchor.set(0.5);
      b.blendMode = 'add';
      b.scale.set(LIGHT_SCALE);
      this.beaconPool.push(b);
      this.beacons.addChild(b);
    }
    const colours = FLASH[kind] ?? FLASH_DEFAULT;
    b.tint = colours[phase % 2];
    b.position.set(vehicle.x, vehicle.y - LIGHT_LIFT);
    b.visible = true;
  }

  /** Train cars (sim/systems/trains.ts), sorted with everything else by depth. */
  private drawTrains(cars: readonly RailCarPose[], view: Rect) {
    const vt = this.viewRef.current;
    let used = 0;
    for (const c of cars) {
      const vp = vt.pointToView(c.x, c.y);
      const p = liftView(this.viewRef.ground, vp.x, vp.y);
      if (p.x < view.minX - MARGIN || p.x > view.maxX + MARGIN || p.y < view.minY - MARGIN || p.y > view.maxY + MARGIN) continue;
      let s = this.trainPool[used];
      if (!s) {
        s = new Sprite();
        s.anchor.set(0.5, VEHICLE_ANCHOR_Y);
        this.trainPool.push(s);
      }
      used++;
      // On an overpass the car rides the deck: lifted, and drawn over it.
      const layer = c.raised ? this.raised : this.container;
      if (s.parent !== layer) layer.addChild(s);
      s.texture = this.tex.trains[c.part][vt.dir(c.dir)];
      s.position.set(p.x, p.y - (c.raised ? OVERPASS_LIFT : 0));
      s.zIndex = vp.x + vp.y;
      s.visible = true;
    }
    for (let k = used; k < this.trainPool.length; k++) this.trainPool[k].visible = false;
  }

  /**
   * Traffic lights: two poles per junction on opposite corners, one for each axis, tinted
   * green or red. Positions are in world tiles, so the colours stay right in every rotation.
   */
  private drawLights(world: World, lights: readonly TrafficLight[], view: Rect) {
    let used = 0;
    for (const l of lights) {
      const x = l.tile % world.width;
      const y = (l.tile - x) / world.width;
      // Axis 0 (traffic along y) on one corner, axis 1 (along x) on the opposite one.
      for (const [axis, ox, oy] of [
        [0, 0.88, 0.12],
        [1, 0.12, 0.88],
      ] as const) {
        const vp = this.viewRef.current.pointToView(x + ox, y + oy);
        const p = liftView(this.viewRef.ground, vp.x, vp.y);
        if (p.x < view.minX - MARGIN || p.x > view.maxX + MARGIN || p.y < view.minY - MARGIN || p.y > view.maxY + MARGIN) continue;
        let s = this.lampPool[used];
        if (!s) {
          s = new Sprite(this.tex.lamp);
          s.anchor.set(0.5, 0.94);
          this.lampPool.push(s);
          this.container.addChild(s);
        }
        used++;
        s.position.set(p.x, p.y);
        s.tint = l.greenAxis === axis ? 0x4ade80 : 0xf87171;
        s.zIndex = vp.x + vp.y;
        s.visible = true;
      }
    }
    for (let k = used; k < this.lampPool.length; k++) this.lampPool[k].visible = false;
  }

  /** Shelters sort with the agents (by their spot on the pavement), so cars pass in front or behind correctly. */
  private drawStops(world: World, stops: readonly BusStop[], view: Rect) {
    const vt = this.viewRef.current;
    let used = 0;
    for (const stop of stops) {
      const x = stop.tile % world.width;
      const y = (stop.tile - x) / world.width;
      const vtile = vt.tileToView(x, y);
      const p = tileToWorld(vtile.x, vtile.y);
      p.y -= tileLift(this.viewRef.ground, vtile.x, vtile.y);
      if (p.x < view.minX - MARGIN || p.x > view.maxX + MARGIN || p.y < view.minY - MARGIN || p.y > view.maxY + MARGIN) continue;
      const side = vt.dir(stop.side);
      let s = this.stopPool[used];
      if (!s) {
        s = new Sprite();
        s.anchor.set(STOP_ANCHOR.x, STOP_ANCHOR.y);
        this.stopPool.push(s);
        this.container.addChild(s);
      }
      used++;
      s.texture = this.tex.busStops[side];
      s.position.set(p.x, p.y);
      // Depth of the shelter's spot: tile centre pushed toward its side.
      const push = [
        [0, -0.4],
        [0.4, 0],
        [0, 0.4],
        [-0.4, 0],
      ][side];
      s.zIndex = vtile.x + 0.5 + push[0] + vtile.y + 0.5 + push[1];
      s.visible = true;
    }
    for (let k = used; k < this.stopPool.length; k++) this.stopPool[k].visible = false;
  }
}
