import { describe, expect, it } from 'vitest';
import { ART } from '../src/render/atlas/buildings/recipes';
import { applyPalette, BUILDING_PALETTES, GAME_GRADE, paletteFamily, TERRACOTTA } from '../src/render/atlas/theme/buildingPalettes';
import { gradeColour } from '../src/render/atlas/theme/grade';

const rgb = (css: string) => {
  const m = /rgba?\((\d+), (\d+), (\d+)/.exec(css);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  const n = parseInt(css.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

describe('building colour themes (D-107)', () => {
  it('recolours walls and roofs from the family palette and keeps the form', () => {
    const art = ART.cafe[5];
    const out = applyPalette(art, 'cafe', 5, TERRACOTTA);
    const fam = TERRACOTTA.families[paletteFamily('cafe')];
    expect(fam.walls).toContain(out.wall);
    expect(fam.roofs).toContain(out.roofColor);
    expect(out.roof).toBe(art.roof);
    expect(out.facade).toBe(art.facade);
    expect(out.masses.length).toBe(art.masses.length);
    expect(ART.cafe[5]).toBe(art); // the recipe itself is untouched
  });
  it('every palette has a colour for every family and a livery for every train', () => {
    for (const p of BUILDING_PALETTES) {
      for (const f of Object.values(p.families)) expect(f.walls.length * f.roofs.length * f.trims.length * f.accents.length).toBeGreaterThan(0);
      expect(p.town.trains.length).toBe(4);
      expect(p.town.signs.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('the grade warms greys but leaves glass, signs, white and black alone', () => {
    const [r, , b] = rgb(gradeColour('#8a8f98', GAME_GRADE));
    expect(r).toBeGreaterThan(b); // a cool grey turns warm
    for (const c of ['#2e4a66', '#3d6b8c', '#b8442f', '#ffffff', '#000000']) expect(gradeColour(c, GAME_GRADE)).toBe(c);
    // Cool blue-grey glass never turns green on its way to warm.
    const [gr, gg, gb] = rgb(gradeColour('#c9d3d8', GAME_GRADE));
    expect(gg).toBeLessThanOrEqual(Math.max(gr, gb) + 1);
    // Alpha survives.
    expect(gradeColour('rgba(120, 124, 130, 0.5)', GAME_GRADE)).toMatch(/0\.5\)$/);
  });
});
