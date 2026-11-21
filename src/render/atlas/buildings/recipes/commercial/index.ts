import { cornerShop } from './corner_shop';
import { cafe } from './cafe';
import { supermarket } from './supermarket';
import { techCampus } from './tech_campus';
import type { BuildingArt, RecipeId } from '../types';

/** Shops, cafés and campuses (towers live in render/atlas/towers, mid-rise offices in render/atlas/lowrise). One file per building. */
export const COMMERCIAL = {
  corner_shop: cornerShop,
  cafe,
  supermarket,
  tech_campus: techCampus,
} satisfies Partial<Record<RecipeId, readonly BuildingArt[]>>;
