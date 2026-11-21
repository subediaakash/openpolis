import { traumaCentre } from './trauma_centre';
import { recyclingCentre } from './recycling_centre';
import { incinerator } from './incinerator';
import { researchCentre } from './research_centre';
import { substation } from './substation';
import type { BuildingArt, RecipeId } from '../types';

/** Civic buildings still drawn by the generic recipe painter: trauma centre, recycling centre,
 * incinerator, research centre and substation (the rest are in render/atlas/lowrise). */
export const SERVICES = {
  trauma_centre: traumaCentre,
  recycling_centre: recyclingCentre,
  incinerator,
  research_centre: researchCentre,
  substation,
} satisfies Partial<Record<RecipeId, readonly BuildingArt[]>>;
