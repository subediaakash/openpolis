import { Container, Sprite, type Texture } from 'pixi.js';
import { BUILDINGS, type BuildingInstance } from '../../sim/buildings/catalog';
import { buildingHeadroom } from '../atlas/buildings';
import type { Rect } from '../Camera';
import { liftWorld } from '../view/lift';
import type { ViewRef } from '../Renderer';

/** A burning building, as the game reports it each time incidents change (sim/systems/incidents.ts). */
export interface FireSite {
  readonly building: BuildingInstance;
  /** 0..1: how far the fire has gone (it grows toward burning down, and shrinks as a truck works). */
  readonly heat: number;
  /** A fire truck is working on it: steam mixes into the smoke. */
  readonly fighting: boolean;
}

/** Below this zoom fires are only their badge. */
const MIN_ZOOM = 0.3;
const MAX_PUFFS = 420;
const MARGIN = 160;
/** Flames per building at full heat (a few more on big footprints). */
const FLAMES_MIN = 3;
const FLAMES_MAX = 9;
/** Smoke puffs a second per building, from a smoulder to a full blaze. */
const SMOKE_RATE = { min: 3, max: 11 } as const;
const FLAME_TINTS = [0xffb347, 0xff7a2f, 0xffd27a, 0xff5a1f] as const;
const SMOKE_TINTS = [0x2b2a2c, 0x3a3739, 0x47423f, 0x24221f] as const;
const STEAM_TINTS = [0xd9dde2, 0xc7ccd2, 0xeef1f4] as const;
/** Gentle wind, the same as chimney smoke (render/fx/Smoke.ts). */
const WIND_X = 7;

interface Puff {
  sprite: Sprite;
  age: number;
  life: number;
  vx: number;
  vy: number;
  scale0: number;
  scale1: number;
  alpha: number;
}

/** A small stable hash, so each flame keeps its place on the building between frames. */
function jitter(id: number, k: number): number {
  const h = Math.sin(id * 12.9898 + k * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

/**
 * Burning buildings (docs/specs/evolution.md, E3): flickering flames across the building and a
 * column of dark smoke that grows as the fire goes on, with steam once a truck is on it. Drawn
 * additively over the night tint, so a fire glows after dark. Pooled; only on-screen fires draw.
 */
export class Fires {
  readonly container = new Container();
  private readonly smokeLayer = new Container();
  private readonly flameLayer = new Container();
  private sites: readonly FireSite[] = [];
  private readonly flames: Sprite[] = [];
  private readonly puffs: Puff[] = [];
  private readonly freePuffs: Sprite[] = [];
  /** Fractional puffs carried to the next frame, per building id. */
  private readonly budget = new Map<number, number>();
  private t = 0;

  constructor(
    private readonly flameTexture: Texture,
    private readonly puffTexture: Texture,
    private readonly viewRef: ViewRef,
  ) {
    this.container.addChild(this.smokeLayer, this.flameLayer);
  }

  setSites(sites: readonly FireSite[]) {
    this.sites = sites;
    for (const id of this.budget.keys()) if (!sites.some((s) => s.building.id === id)) this.budget.delete(id);
  }

  update(dt: number, view: Rect, zoom: number) {
    this.t += dt;
    let used = 0;
    if (zoom >= MIN_ZOOM) {
      for (const site of this.sites) used = this.drawSite(site, dt, view, used);
    }
    for (let k = used; k < this.flames.length; k++) this.flames[k].visible = false;
    this.updatePuffs(dt);
  }

  private drawSite(site: FireSite, dt: number, view: Rect, used: number): number {
    const b = site.building;
    const { w, h } = BUILDINGS[b.def].size;
    const base = liftWorld(this.viewRef, b.x + w / 2, b.y + h / 2);
    if (base.x < view.minX - MARGIN || base.x > view.maxX + MARGIN || base.y < view.minY - MARGIN || base.y > view.maxY + MARGIN) return used;
    // The roof is about the art's headroom less its padding (render/atlas/buildings).
    const roof = Math.max(10, buildingHeadroom(b.def, b.variant) - 26);
    const halfWidth = (w + h) * 8;
    const heat = Math.max(0.15, Math.min(1, site.heat));
    const count = Math.round(FLAMES_MIN + (FLAMES_MAX - FLAMES_MIN) * heat * Math.min(1, (w * h) / 4 + 0.4));
    for (let k = 0; k < count; k++) {
      let s = this.flames[used];
      if (!s) {
        s = new Sprite(this.flameTexture);
        s.anchor.set(0.5, 1);
        s.blendMode = 'add';
        this.flames.push(s);
        this.flameLayer.addChild(s);
      }
      used++;
      // Spread over the building's face, from its lower floors to the roof line.
      const u = jitter(b.id, k) * 2 - 1;
      const v = 0.25 + 0.75 * jitter(b.id, k + 31);
      const flicker = 0.75 + 0.25 * Math.sin(this.t * 13 + k * 2.1) + 0.12 * Math.sin(this.t * 29 + k);
      const size = (1.15 + 0.95 * heat) * (0.8 + 0.4 * jitter(b.id, k + 7));
      s.position.set(base.x + u * halfWidth * 0.8, base.y - roof * v + 4);
      s.scale.set(size * (0.9 + 0.1 * flicker), size * flicker * 1.25);
      s.tint = FLAME_TINTS[(k + Math.floor(this.t * 6)) % FLAME_TINTS.length];
      s.alpha = 0.55 + 0.45 * heat;
      s.visible = true;
    }
    // Smoke from the roof: more of it, and darker, the hotter the fire.
    const rate = SMOKE_RATE.min + (SMOKE_RATE.max - SMOKE_RATE.min) * heat;
    let budget = (this.budget.get(b.id) ?? Math.random()) + rate * dt;
    while (budget >= 1 && this.puffs.length < MAX_PUFFS) {
      budget -= 1;
      const steam = site.fighting && Math.random() < 0.55;
      this.spawnPuff(base.x + (Math.random() - 0.5) * halfWidth, base.y - roof, heat, steam);
    }
    this.budget.set(b.id, Math.min(budget, 1));
    return used;
  }

  private spawnPuff(x: number, y: number, heat: number, steam: boolean) {
    const s = this.freePuffs.pop() ?? new Sprite(this.puffTexture);
    if (!s.parent) this.smokeLayer.addChild(s);
    s.anchor.set(0.5);
    const tints = steam ? STEAM_TINTS : SMOKE_TINTS;
    s.tint = tints[Math.floor(Math.random() * tints.length)];
    s.position.set(x, y);
    s.alpha = 0;
    s.visible = true;
    const scale0 = 0.7 + 0.5 * heat;
    this.puffs.push({
      sprite: s,
      age: 0,
      life: 2.6 + Math.random() * 1.4 + heat,
      vx: (Math.random() - 0.5) * 4,
      vy: -(16 + 10 * heat) * (0.8 + Math.random() * 0.4),
      scale0,
      scale1: scale0 * (3.2 + Math.random()),
      alpha: steam ? 0.7 : 0.75 + 0.2 * heat,
    });
  }

  private updatePuffs(dt: number) {
    for (let k = this.puffs.length - 1; k >= 0; k--) {
      const p = this.puffs[k];
      p.age += dt;
      const f = p.age / p.life;
      if (f >= 1) {
        p.sprite.visible = false;
        this.freePuffs.push(p.sprite);
        this.puffs[k] = this.puffs[this.puffs.length - 1];
        this.puffs.pop();
        continue;
      }
      const s = p.sprite;
      s.x += (p.vx + WIND_X * f) * dt;
      s.y += p.vy * dt * (1 - 0.5 * f);
      s.scale.set(p.scale0 + (p.scale1 - p.scale0) * f);
      // Quick fade in, long fade out.
      s.alpha = p.alpha * Math.min(1, f * 6) * (1 - f);
    }
  }
}
