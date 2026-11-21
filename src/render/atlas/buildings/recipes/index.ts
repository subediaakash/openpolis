import { COMMERCIAL } from './commercial';
import { INDUSTRIAL } from './industrial';
import { SERVICES } from './services';
import type { BuildingArt, RecipeId } from './types';

export * from './types';

/** Every recipe building's variants, by id (docs/specs/city-art.md). */
export const ART: Readonly<Record<RecipeId, readonly BuildingArt[]>> = { ...COMMERCIAL, ...INDUSTRIAL, ...SERVICES };
