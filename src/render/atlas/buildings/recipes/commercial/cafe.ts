import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world café, bistro, bakery, coffeehouse and eatery designs. */
export const cafe: readonly BuildingArt[] = variants(
  {
    floorH: 12,
    masses: [one(1, 0.22)],
    wall: '#f2e6d0',
    roof: 'flat',
    roofColor: '#7a5a43',
    facade: 'shopfront',
    ground: 'paved',
    extras: ['awning', 'tables'],
    sign: 'CAFE',
    signColor: '#7a4a2b',
    awning: '#d94a3d',
  },
  // 0: Classic Parisian corner café
  { extras: ['awning', 'tables', 'bladesign'] },
  // 1: Retro American diner
  { wall: '#e4efe9', sign: 'DINER', signColor: '#c23b3b', awning: '#2f8fbf', extras: ['awning', 'tables', 'bladesign'] },
  // 2: Neapolitan wood-fired pizzeria
  { wall: '#f3dfe0', sign: 'PIZZA', signColor: '#2f7d3a', awning: '#2e8a5a', extras: ['awning', 'tables', 'planters', 'chimney'] },
  // 3: Tokyo lantern noodle & ramen house
  { wall: '#efe2c4', sign: 'NOODLES', signColor: '#b8352f', awning: '#c23b3b', roof: 'gable', roofH: 7, roofColor: '#3a3a40', extras: ['awning', 'bladesign'] },
  // 4: Urban craft cocktail lounge
  { wall: '#4a505a', sign: 'BAR', signColor: '#6a4fa0', awning: '#6a4fa0', masses: [one(1, 0.18)], extras: ['awning', 'bladesign', 'planters'] },
  // 5: Italian courtyard gelateria
  { wall: '#fdf3e7', sign: 'GELATO', signColor: '#d9578a', awning: '#f2a3c0', extras: ['awning', 'tables', 'planters'] },
  // 6: Glass conservatory greenhouse bistro
  { wall: '#e4efe8', sign: 'BISTRO', signColor: '#2d6e58', awning: '#388e6e', roof: 'barrel', roofH: 8, roofColor: '#567a8a', extras: ['awning', 'tables', 'planters'] },
  // 7: Minimalist Nordic espresso bar (shed roof + cedar louvers)
  { wall: '#e8e2d8', sign: 'BREW', signColor: '#4c382a', awning: '#3a4a58', roof: 'shed', roofH: 7, roofColor: '#3a4652', extras: ['awning', 'tables'] },
  // 8: French mansard patisserie with 2nd-floor salon
  { wall: '#f4e6d2', masses: [one(1, 0.16, 'shopfront'), one(1, 0.18, 'arch')], sign: 'PASTRY', signColor: '#a63e52', awning: '#c85068', roof: 'mansard', roofH: 7, roofColor: '#4c5868', extras: ['awning', 'planters', 'bladesign'] },
  // 9: Rooftop-patio specialty coffee roastery
  { wall: '#d6c2a8', masses: [one(1, 0.16, 'shopfront'), one(1, 0.22, 'louvers')], sign: 'ROAST', signColor: '#8c4422', awning: '#c2602f', extras: ['awning', 'tables', 'pergola'] },
  // 10: Viennese grand arched coffeehouse
  { wall: '#ede3ce', trim: '#ffffff', facade: 'arch', masses: [one(2, 0.14)], sign: 'KAFFEE', signColor: '#5c4030', roof: 'mansard', roofH: 8, roofColor: '#455360', extras: ['tables', 'planters', 'bladesign'] },
  // 11: Brooklyn brick bagel & coffee loft
  { wall: '#a8523e', masses: [one(1, 0.15, 'shopfront'), one(1, 0.15, 'brick')], sign: 'BAGELS', signColor: '#2b4f78', awning: '#2b4f78', extras: ['awning', 'bladesign', 'watertank'] },
  // 12: Kyoto timber-frame matcha teahouse
  { wall: '#efe6d4', trim: '#4b3424', facade: 'timber', roof: 'hip', roofH: 8, roofColor: '#3d444c', masses: [one(2, 0.18)], sign: 'MATCHA', signColor: '#3b7a48', ground: 'garden', extras: ['planters', 'bladesign'], trees: 2 },
  // 13: Industrial sawtooth micro-roastery
  { wall: '#b8b2a6', roof: 'sawtooth', roofH: 7, roofColor: '#5c646c', masses: [one(1, 0.14)], sign: 'BEANS', signColor: '#3a3f46', awning: '#d46a32', extras: ['awning', 'tables', 'chimney'] },
  // 14: Art Deco downtown brasserie
  { wall: '#e4d8c2', trim: '#f8f2e4', masses: [one(1, 0.14, 'shopfront'), one(1, 0.14, 'artdeco')], sign: 'BRASS', signColor: '#1f4e5c', awning: '#1f4e5c', extras: ['awning', 'bladesign', 'planters'] },
  // 15: Bookshop & espresso corner
  { wall: '#c87d56', masses: [one(1, 0.16, 'shopfront'), one(1, 0.2, 'punched')], roof: 'gable', roofH: 8, roofColor: '#4a5562', sign: 'READS', signColor: '#3c5a78', awning: '#3c5a78', extras: ['awning', 'tables', 'bladesign'] },
  // 16: Botanical courtyard tea pavilion
  { wall: '#dce8dc', roof: 'flat', roofColor: '#5f8a58', masses: [{ floors: 1, box: { u0: 0.14, u1: 0.86, v0: 0.12, v1: 0.68 } }], ground: 'garden', sign: 'TEA', signColor: '#2f7a54', awning: '#4da372', extras: ['awning', 'tables', 'pergola', 'planters'], trees: 2 },
  // 17: Cantilevered modern glass coffee pavilion
  { wall: '#d8e4ec', masses: [one(1, 0.2, 'shopfront'), { floors: 1, box: { u0: 0.12, u1: 0.88, v0: 0.16, v1: 0.86 }, facade: 'curtain' }], sign: 'SOLAR', signColor: '#1f6fb2', extras: ['tables', 'skylight', 'bladesign'] },
  // 18: Mediterranean terracotta tapas & wine bar
  { wall: '#f2cfa8', roof: 'hip', roofH: 7, roofColor: '#b84f32', masses: [one(1, 0.16, 'arch'), one(1, 0.24, 'punched')], sign: 'TAPAS', signColor: '#a63428', ground: 'plaza', extras: ['tables', 'planters'], trees: 1 },
  // 19: Timber-louvered bakery & brunch house
  { wall: '#efe6d8', trim: '#a67244', masses: [one(1, 0.14, 'shopfront'), one(1, 0.16, 'louvers')], sign: 'BRUNCH', signColor: '#c45b2d', awning: '#d97236', extras: ['awning', 'tables', 'roofgarden', 'bladesign'] },
);
