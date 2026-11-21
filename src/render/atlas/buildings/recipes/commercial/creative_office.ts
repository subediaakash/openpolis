import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world creative offices, design studios, architecture firms and media hubs. */
export const creativeOffice: readonly BuildingArt[] = variants(
  {
    floorH: 9,
    masses: [one(6, 0.12)],
    wall: '#d5dce2',
    roof: 'flat',
    roofColor: '#4b5964',
    facade: 'ribbon',
    ground: 'plaza',
    extras: ['roofgarden', 'acunits'],
    sign: 'STUDIO',
    signColor: '#b45b34',
  },
  // 0: Ribbon-window design studio
  {},
  // 1: Warm sandstone design house
  { wall: '#e6d9c7', facade: 'punched', sign: 'DESIGN', signColor: '#7b4d91', extras: ['roofgarden', 'planters'] },
  // 2: Finned glass innovation lab
  { wall: '#b8d2cf', facade: 'curtain', fins: true, sign: 'LAB', signColor: '#1e7180', extras: ['solar'] },
  // 3: Concrete grid media house
  { wall: '#c9b9d1', facade: 'grid', sign: 'MEDIA', signColor: '#a33b62', extras: ['antenna'] },
  // 4: Banded architectural works
  { wall: '#e9e4d7', facade: 'bands', sign: 'WORKS', signColor: '#2f6d4a', extras: ['roofgarden', 'acunits'] },
  // 5: Solar co-working collective
  { wall: '#aab8c5', facade: 'ribbon', sign: 'CO-LAB', signColor: '#d17b2f', extras: ['solar', 'planters'] },
  // 6: Barrel-vaulted glass gallery studio
  { wall: '#e4e8ec', facade: 'curtain', roof: 'barrel', roofH: 10, roofColor: '#4d6578', sign: 'ATELIER', signColor: '#2c6e99', extras: ['planters'] },
  // 7: Stepped rooftop-pergola craft agency
  { wall: '#dfd4c4', facade: 'bands', masses: [one(4, 0.12), one(2, 0.24)], sign: 'CRAFT', signColor: '#b05632', extras: ['pergola', 'roofgarden'] },
  // 8: Converted sawtooth brick foundry studio
  { wall: '#c26c52', facade: 'brick', roof: 'sawtooth', roofH: 8, roofColor: '#4f5a64', masses: [one(5, 0.12)], sign: 'FOUNDRY', signColor: '#385c78', extras: ['planters'] },
  // 9: Skylight & billboard digital agency
  { wall: '#c8dce0', facade: 'grid', masses: [one(6, 0.14)], sign: 'PIXEL', signColor: '#6d44a8', extras: ['skylight', 'billboard'] },
  // 10: Diagrid glass & steel innovation tower
  { wall: '#6e9eb8', facade: 'diagrid', trim: '#edf4f8', masses: [one(1, 0.12, 'lobby', '#384c5c'), one(6, 0.14)], sign: 'KINETIC', signColor: '#1f6fb2', extras: ['skylight'] },
  // 11: Biophilic timber-louvered architecture studio
  { wall: '#e8e2d6', facade: 'louvers', trim: '#b88352', masses: [one(5, 0.12), one(1, 0.24)], sign: 'FORM', signColor: '#3c6e4e', extras: ['roofgarden', 'pergola'] },
  // 12: Art Deco editorial & publishing house
  { wall: '#e4d8c4', facade: 'artdeco', trim: '#f8f2e4', masses: [one(5, 0.12), one(2, 0.22)], sign: 'PRESS', signColor: '#8c3442', extras: ['crown'] },
  // 13: European arched gallery & creative chambers
  { wall: '#ebe0cc', facade: 'arch', trim: '#ffffff', roof: 'mansard', roofH: 9, roofColor: '#445262', masses: [one(5, 0.12)], sign: 'GALERIE', signColor: '#5c3f8a', extras: ['planters'] },
  // 14: Cantilevered film & sound production house
  { wall: '#5e7386', masses: [one(2, 0.2, 'lobby', '#38424d'), one(4, 0.12, 'curtain')], sign: 'SOUND', signColor: '#d45a28', extras: ['billboard', 'antenna'] },
  // 15: Shed-roof solar design workshop
  { wall: '#d6e2dc', facade: 'louvers', trim: '#7a5436', roof: 'shed', roofH: 9, roofColor: '#3a4a44', masses: [one(5, 0.12)], sign: 'MAKERS', signColor: '#2d7a54', extras: ['planters'] },
  // 16: Mixed-use cafe-base creative loft
  { wall: '#b8624a', masses: [one(1, 0.12, 'shopfront', '#4c545e'), one(5, 0.14, 'brick')], sign: 'LOFT', signColor: '#c44b38', extras: ['awning', 'roofgarden', 'watertank'] },
  // 17: Stepped white Bauhaus design pavilion
  { wall: '#f2f0ea', facade: 'ribbon', masses: [one(3, 0.12), one(3, 0.22)], sign: 'MODULO', signColor: '#2264a8', extras: ['skylight', 'solar', 'planters'] },
  // 18: Timber-and-glass Nordic branding house
  { wall: '#e6dfd2', facade: 'timber', trim: '#523b2a', roof: 'gable', roofH: 9, roofColor: '#48525c', masses: [one(4, 0.14)], sign: 'NORD', signColor: '#2f6d78', extras: ['planters'] },
  // 19: Terracotta louver & diagrid hybrid studio
  { wall: '#d48c6a', masses: [one(3, 0.12, 'louvers'), one(4, 0.18, 'diagrid', '#78a2bc')], sign: 'SPARK', signColor: '#d96b27', extras: ['pergola', 'antenna'] },
);
