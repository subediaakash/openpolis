import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world mid-rise offices, chambers, studios and boutique commercial blocks. */
export const smallOffice: readonly BuildingArt[] = variants(
  {
    floorH: 8,
    masses: [one(5, 0.14)],
    wall: '#c9ced6',
    roof: 'flat',
    roofColor: '#5d6168',
    facade: 'bands',
    ground: 'paved',
    extras: ['acunits'],
  },
  // 0: Classic mid-century banded office
  {},
  // 1: Brutalist concrete grid office
  { wall: '#d8d2c6', facade: 'grid', masses: [one(6, 0.14)], extras: ['acunits', 'skylight'] },
  // 2: Sleek ribbon-window corporate block
  { wall: '#bfc9cf', facade: 'ribbon', masses: [one(4, 0.12)], extras: ['acunits', 'antenna'] },
  // 3: Chicago-style heritage brick loft office
  { wall: '#a85a43', facade: 'brick', trim: '#efe3cf', masses: [one(1, 0.12, 'arch', '#d8cfc0'), one(4, 0.14)], extras: ['watertank'] },
  // 4: Finned glass curtain-wall boutique tower
  { wall: '#6f97b5', facade: 'curtain', fins: true, masses: [one(6, 0.16)], roofColor: '#3e4a56', extras: ['acunits'] },
  // 5: Lobby-podium limestone office with solar
  { wall: '#e2ddd2', facade: 'punched', masses: [one(1, 0.12, 'lobby'), one(5, 0.16)], extras: ['solar'] },
  // 6: Parisian Haussmann mansard chambers
  { wall: '#e8dec8', facade: 'arch', trim: '#ffffff', roof: 'mansard', roofH: 9, roofColor: '#435060', masses: [one(5, 0.14)], extras: ['canopy'] },
  // 7: Modern shed-roof glass studio
  { wall: '#dce6ec', facade: 'curtain', roof: 'shed', roofH: 8, roofColor: '#384654', masses: [one(4, 0.14)], extras: ['planters'] },
  // 8: Converted industrial brick agency with skylight
  { wall: '#9e5340', facade: 'brick', masses: [one(5, 0.14)], extras: ['skylight', 'acunits'] },
  // 9: Downtown billboard mixed-use office
  { wall: '#c6cfd8', facade: 'ribbon', masses: [one(1, 0.12, 'shopfront', '#4d5866'), one(5, 0.14)], extras: ['billboard', 'acunits'] },
  // 10: Art Deco limestone financial house with setback crown
  { wall: '#e6dcc8', facade: 'artdeco', trim: '#f8f3e6', masses: [one(4, 0.12), one(2, 0.22)], extras: ['crown'] },
  // 11: Contemporary steel-and-glass diagrid office
  { wall: '#78a4c2', facade: 'diagrid', trim: '#e8f0f6', masses: [one(6, 0.14)], extras: ['skylight'] },
  // 12: Biophilic timber-louvered eco consultancy
  { wall: '#e6e2d6', facade: 'louvers', trim: '#b88352', masses: [one(5, 0.14)], extras: ['roofgarden', 'solar'] },
  // 13: Stepped architectural firm with rooftop pergola
  { wall: '#d8e0dc', facade: 'bands', masses: [one(3, 0.12), one(2, 0.22)], extras: ['pergola', 'planters'] },
  // 14: Barrel-vaulted modern media chambers
  { wall: '#cfd8e0', facade: 'curtain', roof: 'barrel', roofH: 9, roofColor: '#4c6274', masses: [one(4, 0.14)], extras: ['canopy'] },
  // 15: Terracotta & bronze Art Deco tower-ette
  { wall: '#c47254', facade: 'artdeco', trim: '#f0dfca', masses: [one(5, 0.13), one(1, 0.24)], extras: ['antenna'] },
  // 16: Cantilevered glass-over-stone studio
  { wall: '#c2d2de', masses: [one(1, 0.2, 'lobby', '#525b66'), one(4, 0.12, 'curtain')], extras: ['roofgarden', 'planters'] },
  // 17: Classical arched law & banking chambers
  { wall: '#e0d6c2', facade: 'arch', trim: '#f7f2e6', masses: [one(4, 0.12)], extras: ['canopy', 'planters'] },
  // 18: Scandinavian cedar & glass workspace
  { wall: '#e8e2d4', facade: 'louvers', trim: '#8c5e38', roof: 'shed', roofH: 7, roofColor: '#3f4a52', masses: [one(4, 0.14)], extras: ['planters'] },
  // 19: Twin-stepped dark-glass corporate block with helipad
  { wall: '#4e6c84', facade: 'diagrid', trim: '#d6e2ec', masses: [one(2, 0.12, 'lobby', '#394856'), one(5, 0.18)], extras: ['antenna', 'acunits'] },
);
