import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world high-density apartment blocks and urban residential mid/high-rises. */
export const apartmentBlock: readonly BuildingArt[] = variants(
  {
    floorH: 8,
    masses: [one(8, 0.18)],
    wall: '#e9e2d4',
    roof: 'flat',
    roofColor: '#6a6d73',
    facade: 'punched',
    ground: 'paved',
    extras: ['balconies', 'watertank', 'acunits'],
    trees: 2,
  },
  // 0: Classic cream apartment block
  {},
  // 1: Brutalist concrete grid block with roof garden
  { wall: '#d9dfe6', facade: 'grid', masses: [one(9, 0.18)], extras: ['roofgarden', 'acunits'], ground: 'plaza' },
  // 2: Retail-podium mixed-use apartments
  { wall: '#efe0c8', masses: [one(1, 0.12, 'shopfront', '#6d5a4a'), one(7, 0.18)], extras: ['balconies', 'watertank'] },
  // 3: Classic red-brick pre-war apartment block
  { wall: '#c98f6a', facade: 'brick', trim: '#efe3cf', masses: [one(7, 0.16)], extras: ['acunits', 'watertank'] },
  // 4: Stepped green-terrace garden block
  { wall: '#b8c9b0', masses: [one(6, 0.16), one(3, 0.36)], extras: ['balconies', 'roofgarden'], ground: 'garden', trees: 3 },
  // 5: Tall white ribbon-window slab with solar
  { wall: '#f2efe8', facade: 'ribbon', masses: [one(10, 0.22)], extras: ['solar', 'acunits'], ground: 'plaza' },
  // 6: Parisian grand mansard apartment block
  { wall: '#e8dec8', trim: '#ffffff', facade: 'arch', roof: 'mansard', roofH: 10, roofColor: '#465464', masses: [one(7, 0.16)], extras: ['balconies'] },
  // 7: Biophilic stepped eco-block with pergola
  { wall: '#d2ded4', facade: 'bands', masses: [one(5, 0.14), one(4, 0.26)], extras: ['pergola', 'roofgarden', 'solar'], ground: 'garden', trees: 3 },
  // 8: Lobby-podium concrete grid with skylight
  { wall: '#c4cad2', facade: 'grid', masses: [one(2, 0.12, 'lobby', '#646d78'), one(7, 0.2)], extras: ['skylight', 'acunits'], ground: 'plaza' },
  // 9: Coastal peach ribbon-window pool residence
  { wall: '#f5e4d4', facade: 'ribbon', masses: [one(8, 0.18)], extras: ['balconies', 'pool', 'planters'], ground: 'plaza', trees: 2 },
  // 10: Art Deco stepped limestone residential tower
  { wall: '#e6dcc8', trim: '#faf4e6', facade: 'artdeco', masses: [one(6, 0.14), one(4, 0.24)], extras: ['crown', 'balconies'], ground: 'plaza' },
  // 11: Contemporary timber-louvered residential block
  { wall: '#e8e4d8', trim: '#b88352', facade: 'louvers', masses: [one(8, 0.16)], extras: ['roofgarden', 'pergola', 'solar'], ground: 'garden', trees: 3 },
  // 12: Diagrid modern glass-and-steel residential tower
  { wall: '#7aa4be', trim: '#edf4f8', facade: 'diagrid', masses: [one(2, 0.14, 'lobby', '#3c4f5e'), one(8, 0.2)], extras: ['skylight', 'pool'], ground: 'plaza' },
  // 13: Classical arched European courtyard residence
  { wall: '#efe4d0', trim: '#ffffff', facade: 'arch', masses: [one(8, 0.16)], extras: ['balconies', 'roofgarden'], ground: 'garden', trees: 2 },
  // 14: Terracotta brick & fire-escape loft block
  { wall: '#a85440', trim: '#efe3cf', facade: 'brick', masses: [one(1, 0.12, 'shopfront', '#48525c'), one(7, 0.16)], extras: ['fireescape', 'watertank', 'awning'] },
  // 15: Cantilevered modernist glass & concrete block
  { wall: '#d6e0e8', masses: [one(2, 0.22, 'lobby', '#525b66'), one(7, 0.14, 'curtain')], extras: ['roofgarden', 'solar'], ground: 'plaza', trees: 2 },
  // 16: Scandinavian pale-grey & cedar terraced block
  { wall: '#dce2e6', facade: 'louvers', trim: '#8c5e38', masses: [one(6, 0.14), one(3, 0.26)], extras: ['terraces', 'solar'], ground: 'garden', trees: 3 },
  // 17: Barrel-vaulted penthouse apartment block
  { wall: '#e4e8ec', facade: 'bands', roof: 'barrel', roofH: 10, roofColor: '#4e6578', masses: [one(7, 0.16)], extras: ['balconies'], ground: 'plaza' },
  // 18: Warm sandstone Art Deco courtyard block
  { wall: '#d8c2a6', trim: '#f4ead8', facade: 'artdeco', masses: [one(8, 0.16)], extras: ['terraces', 'watertank'], ground: 'plaza' },
  // 19: Twin-stepped sky-garden residential slab
  { wall: '#c8dcd6', facade: 'curtain', fins: true, masses: [one(5, 0.14), one(5, 0.26)], extras: ['roofgarden', 'pool', 'antenna'], ground: 'garden', trees: 3 },
);
