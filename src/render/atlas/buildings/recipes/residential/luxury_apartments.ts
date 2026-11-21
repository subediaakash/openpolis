import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world luxury residential towers and upscale high-rise condominiums. */
export const luxuryApartments: readonly BuildingArt[] = variants(
  {
    floorH: 9,
    masses: [one(10, 0.2), { floors: 3, box: { u0: 0.42, u1: 1.58, v0: 0.42, v1: 1.58 } }],
    wall: '#d9e3eb',
    trim: '#ffffff',
    roof: 'flat',
    roofColor: '#3e5666',
    facade: 'ribbon',
    ground: 'plaza',
    extras: ['terraces', 'roofgarden', 'pool', 'crown'],
    trees: 2,
  },
  {},
  { wall: '#e7d6c3', facade: 'punched', extras: ['balconies', 'roofgarden', 'pool'] },
  { wall: '#b7d5d4', facade: 'curtain', fins: true, extras: ['terraces', 'crown'] },
  { wall: '#e8e9e4', facade: 'grid', extras: ['terraces', 'roofgarden', 'solar'] },
  { wall: '#9eabc2', facade: 'ribbon', extras: ['balconies', 'pool', 'antenna'] },
  { wall: '#d3c4b5', facade: 'punched', extras: ['terraces', 'roofgarden', 'planters'] },
  // 6: Art Deco stepped spire residence
  { wall: '#e6dcc8', facade: 'artdeco', trim: '#faf4e6', masses: [one(8, 0.18), one(4, 0.3), one(2, 0.44)], extras: ['terraces', 'crown', 'spire'] },
  // 7: Biophilic pergola residence
  { wall: '#cfe0d4', facade: 'louvers', trim: '#b88352', masses: [one(9, 0.18), one(3, 0.34)], extras: ['terraces', 'pergola', 'roofgarden', 'solar'], ground: 'garden', trees: 3 },
  // 8: Parisian grand mansard residence
  { wall: '#ebe2d4', facade: 'arch', roof: 'mansard', roofH: 11, roofColor: '#455464', masses: [one(9, 0.18)], extras: ['balconies', 'planters'] },
  // 9: Glass skylight penthouse tower
  { wall: '#bfd2e0', facade: 'curtain', fins: true, masses: [one(2, 0.14, 'lobby', '#4a5a6a'), one(10, 0.22)], extras: ['skylight', 'pool', 'terraces'] },
  // 10: Contemporary diagrid luxury residence
  { wall: '#78a8c4', facade: 'diagrid', trim: '#edf6fc', masses: [one(2, 0.14, 'lobby', '#394c5c'), one(11, 0.2)], extras: ['pool', 'crown', 'helipad'] },
  // 11: Warm limestone & brass Fifth Ave residence
  { wall: '#e8dec8', facade: 'artdeco', trim: '#f8f3e6', masses: [one(9, 0.16), one(3, 0.3)], extras: ['balconies', 'roofgarden', 'crown'] },
  // 12: Barrel-vaulted penthouse glass residence
  { wall: '#d6e2ea', facade: 'curtain', roof: 'barrel', roofH: 11, roofColor: '#4c6578', masses: [one(10, 0.18)], extras: ['terraces', 'planters'] },
  // 13: Terracotta louver & sky-garden tower
  { wall: '#d6906c', facade: 'louvers', trim: '#f4e8d8', masses: [one(8, 0.16), one(4, 0.28)], extras: ['roofgarden', 'pergola', 'pool'] },
  // 14: Classical arched grand boulevard residence
  { wall: '#efe4d2', facade: 'arch', trim: '#ffffff', masses: [one(9, 0.16), one(2, 0.32)], extras: ['balconies', 'crown', 'planters'] },
  // 15: Dark bronze-and-glass monolith residence
  { wall: '#546474', facade: 'curtain', fins: true, masses: [one(2, 0.14, 'lobby', '#323c46'), one(11, 0.2)], extras: ['crown', 'pool', 'antenna'] },
  // 16: Stepped cantilevered white coastal residence
  { wall: '#f4f4f0', facade: 'ribbon', masses: [one(5, 0.14), one(5, 0.22), one(3, 0.34)], extras: ['terraces', 'pool', 'pergola'] },
  // 17: Pre-war red-brick & limestone grand residence
  { wall: '#a85442', facade: 'brick', trim: '#f2e8d4', masses: [one(2, 0.14, 'arch', '#e8dec8'), one(8, 0.18)], extras: ['balconies', 'watertank', 'roofgarden'] },
  // 18: Emerald-glass diagrid eco-tower
  { wall: '#5e9e8e', facade: 'diagrid', trim: '#e4f4ee', masses: [one(10, 0.18), one(3, 0.32)], extras: ['roofgarden', 'solar', 'spire'] },
  // 19: Tri-tier stepped penthouse residence with helipad
  { wall: '#dce4ec', facade: 'grid', masses: [one(6, 0.14), one(4, 0.24), one(3, 0.36)], extras: ['terraces', 'helipad', 'planters'], trees: 3 },
);
