import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world mid-rise walkup apartments and European/urban mixed-use flats. */
export const walkup: readonly BuildingArt[] = variants(
  {
    floorH: 8,
    masses: [one(4, 0.1)],
    wall: '#b35a45',
    trim: '#e8dcc8',
    roof: 'flat',
    roofColor: '#5f6268',
    facade: 'brick',
    ground: 'paved',
    extras: ['balconies', 'acunits'],
  },
  // 0: Classic red-brick walkup
  {},
  // 1: NYC Lower East Side tenement with fire escape & water tower
  { wall: '#9c5040', extras: ['fireescape', 'watertank'] },
  // 2: 5-storey warm terracotta brick walkup
  { wall: '#c0785a', masses: [one(5, 0.1)], extras: ['balconies'] },
  // 3: Limestone punched-window flats
  { wall: '#e3d7c0', trim: '#8a6e5a', facade: 'punched', extras: ['balconies', 'acunits'] },
  // 4: Corner grocer ground-floor mixed-use walkup
  { wall: '#7d8a96', facade: 'punched', masses: [one(1, 0.1, 'shopfront', '#5a636c'), one(3, 0.1)], sign: 'GROCER', signColor: '#2e6b3e', extras: ['awning', 'acunits'], awning: '#2e8a5a' },
  // 5: Green-roof fire-escape brick loft
  { wall: '#a8653f', extras: ['fireescape', 'roofgarden'] },
  // 6: Parisian Haussmann mansard boulevard walkup
  { wall: '#ece3d0', trim: '#ffffff', facade: 'arch', roof: 'mansard', roofH: 8, roofColor: '#465260', masses: [one(4, 0.1)], extras: ['balconies'] },
  // 7: Modernist stepped terrace flats with pergola
  { wall: '#d8e0d8', facade: 'ribbon', masses: [one(3, 0.1), one(1, 0.2)], extras: ['pergola', 'solar'] },
  // 8: Converted industrial brick loft with skylight
  { wall: '#8f4a3a', facade: 'grid', masses: [one(4, 0.1)], extras: ['skylight', 'fireescape'] },
  // 9: Ground-floor bakery mixed-use walkup
  { wall: '#e6c9a8', facade: 'punched', masses: [one(1, 0.1, 'shopfront', '#4e5d6b'), one(4, 0.1)], sign: 'BAKERY', signColor: '#a63e2e', extras: ['awning', 'balconies', 'roofgarden'], awning: '#c94c38' },
  // 10: Art Deco limestone & bronze apartment house
  { wall: '#e8dec8', trim: '#faf4e6', facade: 'artdeco', masses: [one(5, 0.1)], extras: ['balconies'] },
  // 11: Contemporary timber-louvered eco flats
  { wall: '#e6e2d6', trim: '#b88352', facade: 'louvers', masses: [one(4, 0.1)], extras: ['roofgarden', 'solar'] },
  // 12: Barcelona Eixample warm stucco arched flats
  { wall: '#f0cfa8', trim: '#faf2e4', facade: 'arch', masses: [one(5, 0.1)], extras: ['balconies', 'pergola'] },
  // 13: Ground-floor bookshop + brick flats
  { wall: '#a85442', masses: [one(1, 0.1, 'shopfront', '#3d4c5c'), one(4, 0.1, 'brick')], sign: 'BOOKS', signColor: '#2d5c8a', awning: '#2d5c8a', extras: ['awning', 'bladesign', 'watertank'] },
  // 14: Ground-floor café + Parisian arched flats
  { wall: '#efe2ce', masses: [one(1, 0.1, 'shopfront', '#52443a'), one(3, 0.1, 'arch')], roof: 'mansard', roofH: 8, roofColor: '#485666', sign: 'CAFE', signColor: '#8c3c2e', awning: '#c44b38', extras: ['awning', 'tables'] },
  // 15: Scandinavian pale-brick & shed-roof flats
  { wall: '#dce2e6', facade: 'bands', roof: 'shed', roofH: 7, roofColor: '#3f4c58', masses: [one(4, 0.1)], extras: ['balconies'] },
  // 16: Half-timbered historic quarter walkup
  { wall: '#f2ead8', trim: '#4f3726', facade: 'timber', roof: 'gable', roofH: 8, roofColor: '#6d4032', masses: [one(4, 0.1)], extras: ['planters'] },
  // 17: Modern glass-and-concrete grid flats with skylight
  { wall: '#cfd6de', facade: 'grid', masses: [one(1, 0.1, 'lobby', '#525b66'), one(4, 0.12)], extras: ['skylight', 'balconies'] },
  // 18: Coastal pastel blue & white shuttered walkup
  { wall: '#c4d8e6', trim: '#ffffff', facade: 'punched', roof: 'hip', roofH: 7, roofColor: '#54687a', masses: [one(4, 0.1)], extras: ['balconies'] },
  // 19: Biophilic terraced penthouse walkup
  { wall: '#d6e2d8', facade: 'bands', masses: [one(3, 0.1), one(2, 0.22)], extras: ['terraces', 'roofgarden', 'pergola'] },
);
