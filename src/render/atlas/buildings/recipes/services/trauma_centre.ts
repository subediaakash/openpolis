import { variants, type BuildingArt } from '../types';

// 3×3: the hospital's bigger sibling: a deep emergency podium, a taller ward block,
// an ambulance canopy and a helipad on the roof.
export const traumaCentre: readonly BuildingArt[] = variants(
  {
    floorH: 10,
    masses: [
      { floors: 2, box: { u0: 0.12, u1: 2.88, v0: 0.12, v1: 2.5 }, facade: 'lobby' },
      { floors: 5, box: { u0: 0.5, u1: 2.4, v0: 0.3, v1: 1.9 } },
    ],
    wall: '#eef2f5',
    roof: 'flat',
    roofColor: '#939ca5',
    facade: 'bands',
    glass: '#7fb6d8',
    ground: 'plaza',
    extras: ['canopy', 'redcross', 'helipad', 'acunits'],
    sign: 'TRAUMA',
    signColor: '#d23b3b',
    trees: 2,
  },
  {},
  {
    wall: '#e9ecef',
    facade: 'ribbon',
    masses: [
      { floors: 1, box: { u0: 0.12, u1: 2.88, v0: 0.12, v1: 2.6 }, facade: 'lobby' },
      { floors: 6, box: { u0: 0.7, u1: 2.3, v0: 0.35, v1: 1.8 } },
    ],
    ground: 'parking',
    extras: ['redcross', 'helipad', 'solar'],
  },
  {
    wall: '#dce8f0',
    facade: 'curtain',
    fins: true,
    masses: [
      { floors: 2, box: { u0: 0.14, u1: 2.86, v0: 0.14, v1: 2.45 }, facade: 'lobby' },
      { floors: 5, box: { u0: 0.45, u1: 2.55, v0: 0.3, v1: 1.85 } },
    ],
    extras: ['canopy', 'redcross', 'helipad', 'skylight'],
    trees: 3,
  },
  {
    wall: '#f2ebe2',
    facade: 'grid',
    masses: [
      { floors: 2, box: { u0: 0.12, u1: 2.88, v0: 0.12, v1: 2.5 }, facade: 'lobby' },
      { floors: 4, box: { u0: 0.55, u1: 2.45, v0: 0.28, v1: 1.8 } },
    ],
    extras: ['canopy', 'redcross', 'helipad', 'roofgarden'],
    trees: 3,
  },
);
