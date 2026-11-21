import type { CivicArt } from '../civic/lot';
import { APARTMENT_BLOCK_TOP, APARTMENT_BLOCK_VARIANTS, paintApartmentBlock } from './apartmentBlock';
import { COTTAGE_TOP, COTTAGE_VARIANTS, paintCottage } from './cottage';
import { CREATIVE_OFFICE_TOP, CREATIVE_OFFICE_VARIANTS, paintCreativeOffice } from './creativeOffice';
import { FAMILY_HOUSE_TOP, FAMILY_HOUSE_VARIANTS, paintFamilyHouse } from './familyHouse';
import { LUXURY_APARTMENTS_TOP, LUXURY_APARTMENTS_VARIANTS, paintLuxuryApartments } from './luxuryApartments';
import { paintSmallOffice, SMALL_OFFICE_TOP, SMALL_OFFICE_VARIANTS } from './smallOffice';
import { paintTownhouses, TOWNHOUSES_TOP, TOWNHOUSES_VARIANTS } from './townhouses';
import { paintVilla, VILLA_TOP, VILLA_VARIANTS } from './villa';
import { paintWalkup, WALKUP_TOP, WALKUP_VARIANTS } from './walkup';

/**
 * Homes and mid-rise offices drawn with the low-rise kit (D-108) instead of box recipes, one
 * module per building, in the Terracotta theme.
 */
export type LowriseArtId =
  | 'cottage'
  | 'family_house'
  | 'townhouses'
  | 'villa'
  | 'walkup'
  | 'apartment_block'
  | 'luxury_apartments'
  | 'small_office'
  | 'creative_office';

export const LOWRISE_ART: Readonly<Record<LowriseArtId, CivicArt>> = {
  cottage: { variants: COTTAGE_VARIANTS, headroom: () => COTTAGE_TOP, paint: paintCottage },
  family_house: { variants: FAMILY_HOUSE_VARIANTS, headroom: () => FAMILY_HOUSE_TOP, paint: paintFamilyHouse },
  townhouses: { variants: TOWNHOUSES_VARIANTS, headroom: () => TOWNHOUSES_TOP, paint: paintTownhouses },
  villa: { variants: VILLA_VARIANTS, headroom: () => VILLA_TOP, paint: paintVilla },
  walkup: { variants: WALKUP_VARIANTS, headroom: () => WALKUP_TOP, paint: paintWalkup },
  apartment_block: { variants: APARTMENT_BLOCK_VARIANTS, headroom: () => APARTMENT_BLOCK_TOP, paint: paintApartmentBlock },
  luxury_apartments: { variants: LUXURY_APARTMENTS_VARIANTS, headroom: () => LUXURY_APARTMENTS_TOP, paint: paintLuxuryApartments },
  small_office: { variants: SMALL_OFFICE_VARIANTS, headroom: () => SMALL_OFFICE_TOP, paint: paintSmallOffice },
  creative_office: { variants: CREATIVE_OFFICE_VARIANTS, headroom: () => CREATIVE_OFFICE_TOP, paint: paintCreativeOffice },
};
