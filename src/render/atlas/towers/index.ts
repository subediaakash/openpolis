import type { CivicArt } from '../civic/lot';
import { paintWarmCondo, WARM_CONDO_TOP, WARM_CONDO_VARIANTS } from './warmCondo';
import { paintWarmHotel, WARM_HOTEL_TOP, WARM_HOTEL_VARIANTS } from './warmHotel';
import { paintWarmOffice, WARM_OFFICE_TOP, WARM_OFFICE_VARIANTS } from './warmOffice';

/**
 * Modern towers (D-096, warm since D-108): zoned high-rises drawn with the modern kit and the
 * skyscraper kit (skyscraper.ts) instead of box recipes, one module per building.
 */
export type TowerArtId = 'office_tower' | 'condo_tower' | 'hotel';

export const TOWER_ART: Readonly<Record<TowerArtId, CivicArt>> = {
  // Warm skyscrapers (D-108): base, shaft and crown in limestone, bronze, terracotta and dark glass.
  office_tower: { variants: WARM_OFFICE_VARIANTS, headroom: () => WARM_OFFICE_TOP, paint: paintWarmOffice },
  condo_tower: { variants: WARM_CONDO_VARIANTS, headroom: () => WARM_CONDO_TOP, paint: paintWarmCondo },
  hotel: { variants: WARM_HOTEL_VARIANTS, headroom: () => WARM_HOTEL_TOP, paint: paintWarmHotel },
};
