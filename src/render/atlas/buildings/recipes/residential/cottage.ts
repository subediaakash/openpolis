import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world cottages, bungalows, cabins and small detached homes. */
export const cottage: readonly BuildingArt[] = variants(
  {
    floorH: 11,
    masses: [one(1, 0.2)],
    wall: '#f3e7cf',
    roof: 'gable',
    roofColor: '#b8513d',
    roofH: 9,
    facade: 'punched',
    ground: 'garden',
    extras: ['chimney', 'fence'],
    trees: 1,
  },
  // 0: Classic stucco & terracotta gable cottage
  {},
  // 1: Cape Cod blue-grey clapboard siding cottage
  { wall: '#dfe9f0', roofColor: '#5e6f86', ridge: 'v', facade: 'siding', extras: ['chimney'], trees: 2 },
  // 2: Warm cream hip-roof bungalow
  { wall: '#f5efe4', roofColor: '#8a5a3b', roof: 'hip', roofH: 8, extras: ['fence'] },
  // 3: Peach clapboard garden cottage
  { wall: '#f2d7c9', roofColor: '#4f6b4a', facade: 'siding', trees: 2 },
  // 4: Suburban cottage with side garage annex
  { wall: '#e9e4d8', roofColor: '#a2493a', masses: [{ floors: 1, box: { u0: 0.12, u1: 0.66, v0: 0.2, v1: 0.8 } }], extras: ['garage', 'chimney'] },
  // 5: Butter-yellow porch cottage
  { wall: '#fbe6b8', roofColor: '#3e5874', ridge: 'v', roofH: 11, extras: ['porch'], trees: 2 },
  // 6: Modern minimalist shed-roof tiny home
  { wall: '#eceae2', roof: 'shed', roofColor: '#3e4a56', roofH: 8, facade: 'bands', extras: ['planters'], trees: 2 },
  // 7: French mansard stone-and-brick cottage
  { wall: '#d5cbb8', roof: 'mansard', roofColor: '#48525e', roofH: 8, facade: 'brick', trim: '#f2ece0', extras: ['chimney', 'fence'], trees: 1 },
  // 8: Steep Alpine cedar A-frame cabin
  { wall: '#c7a47e', roof: 'gable', roofColor: '#354b3e', roofH: 13, facade: 'siding', extras: ['porch', 'chimney'], trees: 3 },
  // 9: Mediterranean terracotta stucco bungalow
  { wall: '#f6d9b8', roof: 'hip', roofColor: '#c45b38', roofH: 7, facade: 'punched', extras: ['porch', 'planters'], trees: 2 },
  // 10: English half-timbered Tudor cottage
  { wall: '#f2ead8', trim: '#4b3424', facade: 'timber', roof: 'gable', roofH: 11, roofColor: '#5c4b42', extras: ['chimney', 'fence'], trees: 2 },
  // 11: Japanese cedar & plaster courtyard home
  { wall: '#e8e2d4', trim: '#3e2d22', facade: 'timber', roof: 'hip', roofH: 7, roofColor: '#3a4048', extras: ['planters', 'fence'], trees: 3 },
  // 12: Scandinavian dark-wood & white-trim cabin
  { wall: '#4a5562', trim: '#f4f4f0', facade: 'siding', roof: 'gable', roofH: 10, roofColor: '#2d333b', extras: ['porch', 'chimney'], trees: 2 },
  // 13: Solar-roofed eco flat-roof micro-home
  { wall: '#e4ece4', facade: 'louvers', trim: '#a67546', roof: 'flat', roofColor: '#66706a', extras: ['solar', 'planters'], trees: 2 },
  // 14: English red-brick railway cottage
  { wall: '#b05642', trim: '#f0e4d0', facade: 'brick', roof: 'gable', ridge: 'v', roofH: 9, roofColor: '#484e56', extras: ['chimney', 'fence'], trees: 1 },
  // 15: Coastal sage-green beach bungalow
  { wall: '#cde0d4', facade: 'siding', roof: 'hip', roofH: 8, roofColor: '#566d7c', extras: ['porch', 'planters'], trees: 2 },
  // 16: Southwestern adobe flat-roof casita with pergola
  { wall: '#e6bfa0', facade: 'punched', roof: 'flat', roofColor: '#b88f6d', extras: ['pergola', 'planters'], trees: 1 },
  // 17: Arched Mediterranean stone cottage
  { wall: '#ece0cc', trim: '#ffffff', facade: 'arch', roof: 'hip', roofH: 8, roofColor: '#b85438', extras: ['planters', 'fence'], trees: 2 },
  // 18: Modern glass-and-timber barrel-roof studio home
  { wall: '#dfe6ea', facade: 'ribbon', roof: 'barrel', roofH: 8, roofColor: '#506472', extras: ['planters'], trees: 2 },
  // 19: Victorian lavender painted cottage with porch
  { wall: '#dfd4e8', trim: '#ffffff', facade: 'siding', roof: 'mansard', roofH: 9, roofColor: '#465062', extras: ['porch', 'fence'], trees: 2 },
);
