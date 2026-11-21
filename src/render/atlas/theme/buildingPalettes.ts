import { BUILDINGS, type BuildingId } from '../../../sim/buildings/catalog';
import type { BuildingArt } from '../buildings/recipes/types';
import type { Grade } from './grade';

/**
 * Building colour themes (Art Track, step 1): one palette per family of buildings, so a street
 * reads as designed instead of every variant bringing its own colours. A palette only recolours
 * a recipe (walls, units, roofs, trims, glass, awnings and signs); form and detail stay the same.
 * Harbour and Pastel are kept as alternatives; GAME_PALETTE picks the game's.
 */

/** Colours for one family of buildings. Variants pick from each list in turn. */
export interface PaletteFamily {
  readonly walls: readonly string[];
  readonly roofs: readonly string[];
  /** Cornices, lintels, frames and contrasting bases (shopfront bands). */
  readonly trims: readonly string[];
  /** Awnings, signs and shutters: the little splashes of colour. */
  readonly accents: readonly string[];
  /** Window tint; the theme's glass tokens when absent. */
  readonly glass?: string;
}

export type PaletteFamilyId = 'homes' | 'apartments' | 'shops' | 'offices' | 'industry' | 'civic';

/** A train's paint: engine and its stripe, carriages and their stripe, roofs. */
export interface TrainLivery {
  readonly eng: string;
  readonly engStripe: string;
  readonly car: string;
  readonly carStripe: string;
  readonly roof: string;
}

/** The rest of the town in the theme: transport colours and the grade for every built thing. */
export interface TownColours {
  /** Train liveries (agentArt.ts), one per variant. */
  readonly trains: readonly TrainLivery[];
  /** Bus body colours (agentArt.ts). */
  readonly buses: readonly string[];
  /** Station signs and pylons: [accent, glow] pairs, one per station style. */
  readonly signs: readonly (readonly [string, string])[];
  /** Neutral colours of roads, rail, stations, furniture and vehicles pull toward this (theme/grade.ts). */
  readonly grade: Grade;
}

export interface BuildingPalette {
  readonly id: string;
  readonly name: string;
  readonly mood: string;
  readonly families: Readonly<Record<PaletteFamilyId, PaletteFamily>>;
  readonly town: TownColours;
}

/** Which family a building takes its colours from. */
export function paletteFamily(id: BuildingId): PaletteFamilyId {
  const d = BUILDINGS[id];
  if (d.category === 'residential') return d.density === 'high' ? 'apartments' : 'homes';
  if (d.category === 'commercial') return d.level >= 2 && id !== 'supermarket' ? 'offices' : 'shops';
  if (d.category === 'industrial') return 'industry';
  return 'civic';
}

/** Pick from a list by variant, stepping by `stride` so neighbouring variants differ. */
function pick<T>(list: readonly T[], variant: number, stride = 1, offset = 0): T {
  return list[(variant * stride + offset) % list.length];
}

/** The recipe recoloured from the palette (a new object; the recipe itself is untouched). */
export function applyPalette(art: BuildingArt, id: BuildingId, variant: number, palette: BuildingPalette): BuildingArt {
  const f = palette.families[paletteFamily(id)];
  const wall = pick(f.walls, variant, 3);
  return {
    ...art,
    wall,
    roofColor: pick(f.roofs, variant, 2, 1),
    ...(art.trim !== undefined && { trim: pick(f.trims, variant, 1) }),
    ...(art.units !== undefined && { units: art.units.map((_, k) => pick(f.walls, variant + k, 3, 1)) }),
    ...(art.awning !== undefined && { awning: pick(f.accents, variant, 1) }),
    ...(art.signColor !== undefined && { signColor: pick(f.accents, variant, 1, 1) }),
    ...(f.glass !== undefined && art.glass !== undefined && { glass: f.glass }),
    masses: art.masses.map((m, k) => (m.wall === undefined ? m : { ...m, wall: k === 0 ? pick(f.trims, variant, 1, 1) : wall })),
  };
}

/** Warm render, cream stone and terracotta roofs, green shutters: an old-town European street. */
export const TERRACOTTA: BuildingPalette = {
  id: 'terracotta',
  name: 'Terracotta',
  mood: 'Warm old-town European: cream and ochre render, red tile roofs, green shutters.',
  families: {
    homes: {
      walls: ['#f2e6cf', '#e9cba3', '#deac86', '#f5ecdc', '#dcbc90', '#e7d3b2'],
      roofs: ['#b4553a', '#a44a31', '#c06846', '#934532'],
      trims: ['#fbf6ec', '#6e4a36', '#f3ead8'],
      accents: ['#2f6b5e', '#b8442f', '#d9a441', '#3a5f8a'],
    },
    apartments: {
      walls: ['#eadcc2', '#d9b58e', '#c98d69', '#f0e6d4', '#cfa57f'],
      roofs: ['#6f5c50', '#b4553a', '#7d6658'],
      trims: ['#faf4e8', '#7a5642'],
      accents: ['#2f6b5e', '#b8442f', '#d9a441'],
    },
    shops: {
      walls: ['#f1e5cd', '#e4c69d', '#d8a982', '#efe0c6'],
      roofs: ['#a44a31', '#6f5c50'],
      trims: ['#5c4636', '#3f4f48', '#f8f1e3'],
      accents: ['#2f6b5e', '#b8442f', '#d9a441', '#3a5f8a', '#7a3b52'],
    },
    offices: {
      walls: ['#e9ddc7', '#d6c4a7', '#c4ab8b', '#efe5d3'],
      roofs: ['#6f5c50', '#5d5048'],
      trims: ['#f8f1e3', '#8a6a50'],
      accents: ['#2f6b5e', '#b8442f'],
      glass: '#3d5668',
    },
    industry: {
      walls: ['#cdbca5', '#b5957c', '#a08068', '#c7b49a'],
      roofs: ['#7b6a5c', '#8a5a44', '#6b5d52'],
      trims: ['#8a705c', '#5c4a3e'],
      accents: ['#b8442f', '#d9a441'],
    },
    civic: {
      walls: ['#f5eddd', '#ecdcc0'],
      roofs: ['#a44a31', '#b4553a'],
      trims: ['#ffffff', '#6e4a36'],
      accents: ['#2f6b5e', '#b8442f'],
    },
  },
  town: {
    trains: [
      { eng: '#a8432f', engStripe: '#e9c46a', car: '#efe4cf', carStripe: '#2f6b5e', roof: '#5c4a3e' },
      { eng: '#2f6b5e', engStripe: '#f2e6cf', car: '#efe4cf', carStripe: '#a8432f', roof: '#4a4038' },
      { eng: '#d9a441', engStripe: '#5c4636', car: '#f2e6cf', carStripe: '#b4553a', roof: '#5c4a3e' },
      { eng: '#7a3b2e', engStripe: '#e9c46a', car: '#e8d8bc', carStripe: '#7a3b2e', roof: '#4a4038' },
    ],
    buses: ['#b4553a', '#2f6b5e', '#d9a441', '#a8432f', '#3f6e63', '#c9733f', '#7a3b52', '#2f5f73', '#b8442f', '#4f7a4a'],
    signs: [
      ['#b8442f', '#e8775f'],
      ['#2f6b5e', '#5fae96'],
      ['#c98a2e', '#efc46a'],
    ],
    grade: { hue: 32, warmth: 0.7 },
  },
};

/** White render, pale greys and timber, charcoal roofs, teal and navy: a modern harbour town. */
export const HARBOUR: BuildingPalette = {
  id: 'harbour',
  name: 'Harbour',
  mood: 'Sleek coastal modern: white and pale grey, warm timber, charcoal roofs, teal glass.',
  families: {
    homes: {
      walls: ['#f6f6f2', '#e8ebe8', '#d9cdbb', '#eef0ee', '#c9a57c', '#dde2e3'],
      roofs: ['#3d454f', '#4a5560', '#59636e'],
      trims: ['#c49a6c', '#ffffff', '#3d454f'],
      accents: ['#2b8a9a', '#1f4e6e', '#f2b544', '#e06c4f'],
    },
    apartments: {
      walls: ['#f3f4f2', '#dfe4e6', '#cbd4d9', '#e7ded1', '#bfc8cd'],
      roofs: ['#3d454f', '#4a5560'],
      trims: ['#c49a6c', '#ffffff', '#2f3740'],
      accents: ['#2b8a9a', '#1f4e6e', '#f2b544'],
      glass: '#2f6f84',
    },
    shops: {
      walls: ['#f4f5f3', '#e3e7e8', '#d7c6ad', '#eceee9'],
      roofs: ['#3d454f', '#59636e'],
      trims: ['#2f3740', '#c49a6c', '#ffffff'],
      accents: ['#2b8a9a', '#f2b544', '#e06c4f', '#1f4e6e', '#5aa36f'],
    },
    offices: {
      walls: ['#eef1f3', '#d5dde3', '#c3cdd5', '#f5f6f6'],
      roofs: ['#3d454f', '#2f3740'],
      trims: ['#ffffff', '#c49a6c'],
      accents: ['#2b8a9a', '#1f4e6e'],
      glass: '#2a6f86',
    },
    industry: {
      walls: ['#d8dde1', '#b9c2c9', '#9aa6b0', '#cdd3d8'],
      roofs: ['#4a5560', '#3d454f', '#5d6873'],
      trims: ['#6c7782', '#2f3740'],
      accents: ['#2b8a9a', '#f2b544'],
    },
    civic: {
      walls: ['#f7f7f4', '#e6eaec'],
      roofs: ['#3d454f', '#4a5560'],
      trims: ['#c49a6c', '#ffffff'],
      accents: ['#2b8a9a', '#1f4e6e'],
      glass: '#2a6f86',
    },
  },
  town: {
    trains: [
      { eng: '#f4f6f6', engStripe: '#2b8a9a', car: '#eef1f2', carStripe: '#2b8a9a', roof: '#3d454f' },
      { eng: '#1f4e6e', engStripe: '#f2b544', car: '#e6ebee', carStripe: '#1f4e6e', roof: '#3d454f' },
      { eng: '#2b8a9a', engStripe: '#ffffff', car: '#eef1f2', carStripe: '#2b8a9a', roof: '#4a5560' },
      { eng: '#3d454f', engStripe: '#f2b544', car: '#dfe4e6', carStripe: '#3d454f', roof: '#2f3740' },
    ],
    buses: ['#2b8a9a', '#1f4e6e', '#f4f6f6', '#e06c4f', '#3d454f', '#2f6f84', '#f2b544', '#5aa36f', '#c49a6c', '#59636e'],
    signs: [
      ['#2b8a9a', '#6fd0dc'],
      ['#1f4e6e', '#5a9fd0'],
      ['#e06c4f', '#ff9c84'],
    ],
    grade: { hue: 205, warmth: 0.25 },
  },
};

/** Soft mint, peach, butter, lavender and sky, with white trim: a cheerful garden suburb. */
export const PASTEL: BuildingPalette = {
  id: 'pastel',
  name: 'Pastel',
  mood: 'Cheerful garden town: mint, peach, butter, lavender and sky walls, white trim, warm grey roofs.',
  families: {
    homes: {
      walls: ['#bfe3cc', '#f4c4a8', '#f3df95', '#d2c5ec', '#bcd8ee', '#efbcc7'],
      roofs: ['#7d7570', '#8a6f66', '#6f7a85', '#9a7b6a'],
      trims: ['#ffffff', '#f7f3ea'],
      accents: ['#e07a5f', '#3d9970', '#5b8bd9', '#d9a441'],
    },
    apartments: {
      walls: ['#c8e6d3', '#f3cfb8', '#f0e1a8', '#d8cdef', '#c6dff0'],
      roofs: ['#6f7a85', '#7d7570'],
      trims: ['#ffffff', '#f2ede2'],
      accents: ['#e07a5f', '#3d9970', '#5b8bd9'],
    },
    shops: {
      walls: ['#f3df95', '#bfe3cc', '#f4c4a8', '#bcd8ee', '#efbcc7'],
      roofs: ['#7d7570', '#6f7a85'],
      trims: ['#ffffff', '#5a6472'],
      accents: ['#e07a5f', '#3d9970', '#5b8bd9', '#d9a441', '#b5679a'],
    },
    offices: {
      walls: ['#e4eef4', '#eef0e4', '#f1e6dc', '#e6e2f0'],
      roofs: ['#6f7a85', '#5f6873'],
      trims: ['#ffffff', '#c8d3db'],
      accents: ['#5b8bd9', '#3d9970'],
      glass: '#4a7a9c',
    },
    industry: {
      walls: ['#dfe3d6', '#d6d0c4', '#c9d3d8', '#e3dccd'],
      roofs: ['#6f7a85', '#7d7570'],
      trims: ['#8b96a0', '#ffffff'],
      accents: ['#e07a5f', '#5b8bd9'],
    },
    civic: {
      walls: ['#fbf7ee', '#eaf2ec'],
      roofs: ['#7d7570', '#6f7a85'],
      trims: ['#ffffff'],
      accents: ['#e07a5f', '#3d9970'],
    },
  },
  town: {
    trains: [
      { eng: '#e07a5f', engStripe: '#fbf7ee', car: '#f6efe0', carStripe: '#3d9970', roof: '#7d7570' },
      { eng: '#5b8bd9', engStripe: '#f3df95', car: '#eef2f6', carStripe: '#5b8bd9', roof: '#6f7a85' },
      { eng: '#3d9970', engStripe: '#fbf7ee', car: '#eef5ef', carStripe: '#e07a5f', roof: '#6f7a85' },
      { eng: '#b5679a', engStripe: '#f3df95', car: '#f5eef3', carStripe: '#b5679a', roof: '#7d7570' },
    ],
    buses: ['#e07a5f', '#5b8bd9', '#3d9970', '#d9a441', '#b5679a', '#f3df95', '#6fb7c9', '#f4c4a8', '#8fbf7a', '#d2c5ec'],
    signs: [
      ['#e07a5f', '#ffab95'],
      ['#3d9970', '#7fd1a8'],
      ['#5b8bd9', '#9cc0f2'],
    ],
    grade: { hue: 330, warmth: 0.2 },
  },
};

/** The game's building theme (D-107: the user picked Terracotta). */
export const GAME_PALETTE: BuildingPalette = TERRACOTTA;
/** The grade every built thing is painted through (theme/grade.ts). */
export const GAME_GRADE: Grade = GAME_PALETTE.town.grade;

/** Every candidate, in the order the preview shows them. */
export const BUILDING_PALETTES: readonly BuildingPalette[] = [TERRACOTTA, HARBOUR, PASTEL];
