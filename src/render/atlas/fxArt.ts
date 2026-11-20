/** Small white particle sprites; they're tinted at runtime. */

export const PUFF_SIZE = 16;
export const CHIP_SIZE = 6;
export const LEAF_SIZE = 8;
export const FLAME_W = 10;
export const FLAME_H = 16;

/**
 * A tongue of flame, white-hot at the base and fading out at the tip. Painted white-yellow so a
 * tint can push it toward orange or red; drawn additively over burning buildings.
 */
export function paintFlame(ctx: CanvasRenderingContext2D) {
  const cx = FLAME_W / 2;
  const g = ctx.createLinearGradient(0, FLAME_H, 0, 0);
  g.addColorStop(0, 'rgba(255, 250, 225, 1)');
  g.addColorStop(0.35, 'rgba(255, 214, 120, 0.95)');
  g.addColorStop(0.75, 'rgba(255, 150, 60, 0.6)');
  g.addColorStop(1, 'rgba(255, 110, 40, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.bezierCurveTo(cx + 1.5, FLAME_H * 0.3, FLAME_W, FLAME_H * 0.55, FLAME_W - 0.5, FLAME_H * 0.75);
  ctx.arc(cx, FLAME_H * 0.75, cx - 0.5, 0, Math.PI);
  ctx.bezierCurveTo(0, FLAME_H * 0.55, cx - 1.5, FLAME_H * 0.3, cx, 0);
  ctx.fill();
}

/** Soft round dust puff. */
export function paintPuff(ctx: CanvasRenderingContext2D) {
  const r = PUFF_SIZE / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  g.addColorStop(0.55, 'rgba(255, 255, 255, 0.55)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PUFF_SIZE, PUFF_SIZE);
}

/** Chunky pixel chip (rock grit, wood splinter). */
export function paintChip(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(1, 1, CHIP_SIZE - 2, CHIP_SIZE - 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(1, CHIP_SIZE - 2, CHIP_SIZE - 2, 1);
}

/** Tiny leaf: a pointed oval with a darker midrib. */
export function paintLeaf(ctx: CanvasRenderingContext2D) {
  const c = LEAF_SIZE / 2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(1, c);
  ctx.quadraticCurveTo(c, 0, LEAF_SIZE - 1, c);
  ctx.quadraticCurveTo(c, LEAF_SIZE, 1, c);
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(2, c - 0.5, LEAF_SIZE - 4, 1);
}
