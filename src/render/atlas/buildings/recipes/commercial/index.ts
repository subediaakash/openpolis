import { techCampus } from './tech_campus';
import type { BuildingArt, RecipeId } from '../types';

/** The tech campus (towers live in render/atlas/towers; shops and mid-rise offices in render/atlas/lowrise). */
export const COMMERCIAL = {
  tech_campus: techCampus,
} satisfies Partial<Record<RecipeId, readonly BuildingArt[]>>;
