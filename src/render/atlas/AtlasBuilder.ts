import { CanvasSource, Rectangle, Texture, type TextureSource } from 'pixi.js';

/** Draw callback: paint into `ctx` with (0, 0) at the frame's top-left, in logical pixels. */
export type FramePainter = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** The part of Pixi's texture system the atlas needs: upload a source to the GPU now. */
export interface TextureUploader {
  initSource(source: TextureSource): unknown;
}

interface PendingFrame {
  name: string;
  w: number;
  h: number;
  paint: FramePainter;
}

/** Gap between frames so mipmapping/linear filtering doesn't bleed neighbours. */
const PADDING = 4;
const MAX_ROW_WIDTH = 2048;
/**
 * Page height in logical px. At 2× resolution a page is at most 4096 px on each side,
 * which every WebGL2 device supports. Frames that don't fit start a new page.
 */
const MAX_PAGE_HEIGHT = 2048;

interface Placed {
  f: PendingFrame;
  page: number;
  x: number;
  y: number;
}

interface PageSize {
  w: number;
  h: number;
}

/**
 * Collects procedurally painted frames and shelf-packs them into as few canvas
 * textures ("pages") as possible. Sprites sharing a page batch into one draw call.
 *
 * Memory (D-104): after `upload` the canvases are emptied, so each page lives only on
 * the GPU. The builder keeps the painters, so `repaint` can paint the pages again
 * when a lost WebGL context drops the GPU copies.
 */
export class AtlasBuilder {
  private readonly frames: PendingFrame[] = [];
  private placed: readonly Placed[] = [];
  private pageSizes: readonly PageSize[] = [];
  /** The canvas behind each page (the same objects as `sources[k].resource`). */
  private canvases: HTMLCanvasElement[] = [];

  /** Atlas is painted at `resolution`× so tiles stay crisp when zoomed in. */
  constructor(readonly resolution = 2) {}

  add(name: string, w: number, h: number, paint: FramePainter): this {
    this.frames.push({ name, w, h, paint });
    return this;
  }

  /** Number of pages the last build produced (for the debug overlay). */
  pageCount = 0;
  /** The pages of the last build. */
  sources: CanvasSource[] = [];

  build(): Map<string, Texture> {
    // Tallest first, so each shelf holds frames of similar height (about 13% less page area).
    const order = [...this.frames].sort((a, b) => b.h - a.h);
    const placed: Placed[] = [];
    const pageSizes: PageSize[] = [];
    let page = 0;
    let x = PADDING;
    let y = PADDING;
    let rowH = 0;
    let width = 0;
    const closePage = () => pageSizes.push({ w: width, h: y + rowH + PADDING });
    for (const f of order) {
      if (x + f.w + PADDING > MAX_ROW_WIDTH) {
        x = PADDING;
        y += rowH + PADDING;
        rowH = 0;
      }
      if (y + f.h + PADDING > MAX_PAGE_HEIGHT) {
        closePage();
        page++;
        x = PADDING;
        y = PADDING;
        rowH = 0;
        width = 0;
      }
      placed.push({ f, page, x, y });
      x += f.w + PADDING;
      rowH = Math.max(rowH, f.h);
      width = Math.max(width, x);
    }
    closePage();
    this.placed = placed;
    this.pageSizes = pageSizes;
    this.pageCount = pageSizes.length;

    const r = this.resolution;
    this.canvases = pageSizes.map(() => document.createElement('canvas'));
    const sources = this.canvases.map((canvas, k) => {
      this.paintPage(canvas, k);
      // Never garbage-collected off the GPU: the canvas is emptied after upload, so a
      // re-upload from it would be blank (Pixi's default, stated here because it matters).
      return new CanvasSource({ resource: canvas, resolution: r, scaleMode: 'linear', autoGenerateMipmaps: true, autoGarbageCollect: false });
    });

    this.sources = sources;
    const textures = new Map<string, Texture>();
    for (const p of placed) {
      textures.set(p.f.name, new Texture({ source: sources[p.page], frame: new Rectangle(p.x, p.y, p.f.w, p.f.h) }));
    }
    return textures;
  }

  /** Size `canvas` for page `k` and paint every frame on it. */
  private paintPage(canvas: HTMLCanvasElement, k: number) {
    const r = this.resolution;
    const size = this.pageSizes[k];
    canvas.width = Math.ceil(size.w * r);
    canvas.height = Math.ceil(size.h * r);
    const ctx = canvas.getContext('2d')!;
    for (const p of this.placed) {
      if (p.page !== k) continue;
      ctx.save();
      ctx.setTransform(r, 0, 0, r, p.x * r, p.y * r);
      ctx.beginPath();
      ctx.rect(0, 0, p.f.w, p.f.h);
      ctx.clip();
      p.f.paint(ctx, p.f.w, p.f.h);
      ctx.restore();
    }
  }

  /**
   * Upload every page to the GPU now, then empty its canvas. Without this the browser keeps
   * a second full copy of the atlas in canvas memory, which iOS Safari caps.
   */
  upload(gpu: TextureUploader) {
    this.sources.forEach((source, k) => {
      gpu.initSource(source);
      this.canvases[k].width = 0;
      this.canvases[k].height = 0;
    });
  }

  /** Paint every page again into its own canvas (call `upload` after). */
  repaint() {
    this.canvases.forEach((canvas, k) => this.paintPage(canvas, k));
  }

  /** Free the pages on the GPU. Textures from this build must no longer be drawn. */
  destroy() {
    for (const source of this.sources) source.destroy();
    this.sources = [];
    this.canvases = [];
  }
}
