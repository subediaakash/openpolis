import type { CanvasSource, Texture } from 'pixi.js';
import { BUILDING_IDS, type BuildingId } from '../../sim/buildings/catalog';
import { AtlasBuilder, type TextureUploader } from './AtlasBuilder';
import { buildingFrameSize, buildingVariantCount, paintBuilding, type BuildingRotation } from './buildings';

/**
 * Every building frame for one view rotation, on pages of its own (D-103).
 *
 * Only one rotation is ever on screen, and building frames are about 80% of the art, so
 * painting all four rotations kept most of the atlas in memory for nothing. Turning the
 * view repaints this atlas for the new rotation; the terrain atlas stays as it is.
 */
export class BuildingAtlas {
  private pages: AtlasBuilder;
  private frames: ReadonlyMap<BuildingId, readonly Texture[]>;

  constructor(
    private rot: BuildingRotation,
    private readonly resolution: number,
  ) {
    [this.pages, this.frames] = this.paint(rot);
  }

  /** The rotation the frames are painted for. */
  get rotation(): BuildingRotation {
    return this.rot;
  }

  /** The current pages (debug overlay, dev atlas page). */
  get sources(): readonly CanvasSource[] {
    return this.pages.sources;
  }

  /** A building's frame for the painted rotation; the variant wraps round its variant count. */
  texture(id: BuildingId, variant: number): Texture {
    const set = this.frames.get(id);
    if (!set) throw new Error(`no building frames: ${id}`);
    return set[variant % set.length];
  }

  /**
   * Repaint every building for rotation `r`. Returns the previous pages: destroy them once
   * nothing draws their textures any more. Null when `r` is already painted.
   */
  setRotation(r: BuildingRotation): AtlasBuilder | null {
    if (r === this.rot) return null;
    const old = this.pages;
    this.rot = r;
    [this.pages, this.frames] = this.paint(r);
    return old;
  }

  /** Send the pages to the GPU and empty their canvases (AtlasBuilder.upload). */
  upload(gpu: TextureUploader) {
    this.pages.upload(gpu);
  }

  /** Paint the current pages again after a lost GPU context (call `upload` after). */
  repaint() {
    this.pages.repaint();
  }

  private paint(r: BuildingRotation): [AtlasBuilder, Map<BuildingId, readonly Texture[]>] {
    const b = new AtlasBuilder(this.resolution);
    for (const id of BUILDING_IDS) {
      for (let v = 0; v < buildingVariantCount(id); v++) {
        const f = buildingFrameSize(id, v);
        b.add(`bld_${id}_${v}`, f.w, f.h, (ctx) => paintBuilding(ctx, id, v, r, { record: true }));
      }
    }
    const tex = b.build();
    const frames = new Map<BuildingId, readonly Texture[]>();
    for (const id of BUILDING_IDS) {
      frames.set(id, Array.from({ length: buildingVariantCount(id) }, (_, v) => {
        const t = tex.get(`bld_${id}_${v}`);
        if (!t) throw new Error(`atlas frame missing: bld_${id}_${v}`);
        return t;
      }));
    }
    return [b, frames];
  }
}
