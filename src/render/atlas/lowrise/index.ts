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
import { paintCornerShop, CORNER_SHOP_TOP, CORNER_SHOP_VARIANTS } from './cornerShop';
import { paintCafe, CAFE_TOP, CAFE_VARIANTS } from './cafe';
import { paintSupermarket, SUPERMARKET_TOP, SUPERMARKET_VARIANTS } from './supermarket';
import { paintWorkshop, WORKSHOP_TOP, WORKSHOP_VARIANTS } from './workshop';
import { paintWarehouse, WAREHOUSE_TOP, WAREHOUSE_VARIANTS } from './warehouse';
import { paintFactory, FACTORY_TOP, FACTORY_VARIANTS, factorySmoke } from './factory';
import { paintSchool, SCHOOL_TOP, SCHOOL_VARIANTS } from './school';
import { paintPoliceStation, POLICE_TOP, POLICE_VARIANTS } from './policeStation';
import { paintFireStation, FIRE_TOP, FIRE_VARIANTS } from './fireStation';
import { paintClinic, CLINIC_TOP, CLINIC_VARIANTS } from './clinic';
import { paintHospital, HOSPITAL_TOP, HOSPITAL_VARIANTS } from './hospital';
import { paintUniversity, UNIVERSITY_TOP, UNIVERSITY_VARIANTS } from './university';

/**
 * Homes, mid-rise offices (D-109), shops, industry and services (D-110) drawn with the low-rise
 * kit instead of box recipes, one module per building, in the Terracotta theme.
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
  | 'creative_office'
  | 'corner_shop'
  | 'cafe'
  | 'supermarket'
  | 'workshop'
  | 'warehouse'
  | 'factory'
  | 'school'
  | 'police_station'
  | 'fire_station'
  | 'clinic'
  | 'hospital'
  | 'university';

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
  corner_shop: { variants: CORNER_SHOP_VARIANTS, headroom: () => CORNER_SHOP_TOP, paint: paintCornerShop },
  cafe: { variants: CAFE_VARIANTS, headroom: () => CAFE_TOP, paint: paintCafe },
  supermarket: { variants: SUPERMARKET_VARIANTS, headroom: () => SUPERMARKET_TOP, paint: paintSupermarket },
  workshop: { variants: WORKSHOP_VARIANTS, headroom: () => WORKSHOP_TOP, paint: paintWorkshop },
  warehouse: { variants: WAREHOUSE_VARIANTS, headroom: () => WAREHOUSE_TOP, paint: paintWarehouse },
  factory: { variants: FACTORY_VARIANTS, headroom: () => FACTORY_TOP, paint: paintFactory, smoke: factorySmoke },
  school: { variants: SCHOOL_VARIANTS, headroom: () => SCHOOL_TOP, paint: paintSchool },
  police_station: { variants: POLICE_VARIANTS, headroom: () => POLICE_TOP, paint: paintPoliceStation },
  fire_station: { variants: FIRE_VARIANTS, headroom: () => FIRE_TOP, paint: paintFireStation },
  clinic: { variants: CLINIC_VARIANTS, headroom: () => CLINIC_TOP, paint: paintClinic },
  hospital: { variants: HOSPITAL_VARIANTS, headroom: () => HOSPITAL_TOP, paint: paintHospital },
  university: { variants: UNIVERSITY_VARIANTS, headroom: () => UNIVERSITY_TOP, paint: paintUniversity },
};
