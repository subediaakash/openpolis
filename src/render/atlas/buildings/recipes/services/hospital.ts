import { variants, type BuildingArt } from '../types';

/** 20 distinct real-world hospital complexes, medical centers and historic infirmaries. */
export const hospital: readonly BuildingArt[] = variants(
  {
    floorH: 10,
    masses: [
      { floors: 2, box: { u0: 0.12, u1: 2.88, v0: 0.12, v1: 1.55 }, facade: 'lobby' },
      { floors: 4, box: { u0: 0.55, u1: 2.3, v0: 0.22, v1: 1.3 } },
    ],
    wall: '#f3f5f7',
    roof: 'flat',
    roofColor: '#9aa3ab',
    facade: 'ribbon',
    ground: 'plaza',
    extras: ['canopy', 'redcross', 'helipad', 'acunits'],
    sign: 'HOSPITAL',
    signColor: '#d23b3b',
    trees: 2,
  },
  // 0: Classic clinical ribbon podium + ward tower
  {},
  // 1: Solar-powered banded regional medical center
  { wall: '#e6eef2', facade: 'bands', glass: '#7fb6d8', extras: ['canopy', 'redcross', 'helipad', 'solar'] },
  // 2: Concrete grid tower with surface parking
  {
    wall: '#efe9e0',
    facade: 'grid',
    masses: [
      { floors: 1, box: { u0: 0.12, u1: 2.88, v0: 0.12, v1: 1.6 }, facade: 'lobby' },
      { floors: 5, box: { u0: 0.8, u1: 2.2, v0: 0.25, v1: 1.25 } },
    ],
    ground: 'parking',
    extras: ['redcross', 'helipad'],
  },
  // 3: Finned curtain-glass skylight surgical center
  {
    wall: '#dce9ed',
    facade: 'curtain',
    fins: true,
    masses: [
      { floors: 2, box: { u0: 0.14, u1: 2.86, v0: 0.14, v1: 1.5 }, facade: 'lobby' },
      { floors: 5, box: { u0: 0.45, u1: 2.45, v0: 0.25, v1: 1.25 } },
    ],
    extras: ['canopy', 'redcross', 'helipad', 'skylight'],
    trees: 3,
  },
  // 4: Parisian heritage mansard infirmary
  {
    wall: '#e6dfd5',
    facade: 'arch',
    roof: 'mansard',
    roofH: 9,
    roofColor: '#4c5b69',
    masses: [{ floors: 4, box: { u0: 0.18, u1: 2.82, v0: 0.16, v1: 1.45 } }],
    extras: ['canopy', 'redcross'],
    ground: 'garden',
    trees: 3,
  },
  // 5: Contemporary diagrid glass medical institute
  {
    wall: '#b8d6e6',
    facade: 'diagrid',
    trim: '#f0f7fc',
    masses: [
      { floors: 2, box: { u0: 0.14, u1: 2.86, v0: 0.14, v1: 1.5 }, facade: 'lobby' },
      { floors: 5, box: { u0: 0.5, u1: 2.5, v0: 0.22, v1: 1.28 } },
    ],
    extras: ['canopy', 'redcross', 'helipad', 'skylight'],
  },
  // 6: Biophilic timber-louvered healing-garden hospital
  {
    wall: '#e6ece4',
    facade: 'louvers',
    trim: '#b88352',
    masses: [
      { floors: 2, box: { u0: 0.14, u1: 2.86, v0: 0.14, v1: 1.5 }, facade: 'lobby' },
      { floors: 4, box: { u0: 0.45, u1: 2.55, v0: 0.22, v1: 1.28 } },
    ],
    ground: 'garden',
    extras: ['canopy', 'redcross', 'roofgarden', 'pergola'],
    trees: 4,
  },
  // 7: Heritage Victorian red-brick royal infirmary
  {
    wall: '#b45a44',
    trim: '#f2e8d4',
    facade: 'brick',
    roof: 'hip',
    roofH: 10,
    roofColor: '#4c545e',
    masses: [{ floors: 4, box: { u0: 0.16, u1: 2.84, v0: 0.16, v1: 1.45 } }],
    extras: ['canopy', 'redcross', 'planters'],
    ground: 'garden',
    trees: 3,
  },
  // 8: Art Deco limestone civic medical center
  {
    wall: '#e8dec8',
    trim: '#faf4e6',
    facade: 'artdeco',
    masses: [
      { floors: 3, box: { u0: 0.16, u1: 2.84, v0: 0.14, v1: 1.5 } },
      { floors: 3, box: { u0: 0.7, u1: 2.3, v0: 0.25, v1: 1.25 } },
    ],
    extras: ['canopy', 'redcross', 'helipad'],
  },
  // 9: Barrel-vaulted modern rehabilitation hospital
  {
    wall: '#e4ecf0',
    facade: 'bands',
    roof: 'barrel',
    roofH: 10,
    roofColor: '#4c6d82',
    masses: [{ floors: 3, box: { u0: 0.14, u1: 2.86, v0: 0.14, v1: 1.45 } }],
    extras: ['canopy', 'redcross', 'planters'],
    trees: 3,
  },
  // 10: Shed-roof Nordic community hospital
  {
    wall: '#eef2f0',
    facade: 'louvers',
    trim: '#8c603c',
    roof: 'shed',
    roofH: 9,
    roofColor: '#3f525c',
    masses: [{ floors: 3, box: { u0: 0.14, u1: 2.86, v0: 0.14, v1: 1.48 } }],
    extras: ['canopy', 'redcross', 'planters'],
    ground: 'garden',
    trees: 3,
  },
  // 11: Stepped tri-tier research & teaching hospital
  {
    wall: '#e6edf2',
    facade: 'ribbon',
    masses: [
      { floors: 2, box: { u0: 0.12, u1: 2.88, v0: 0.12, v1: 1.55 }, facade: 'lobby' },
      { floors: 3, box: { u0: 0.4, u1: 2.6, v0: 0.2, v1: 1.35 } },
      { floors: 2, box: { u0: 0.9, u1: 2.1, v0: 0.3, v1: 1.15 } },
    ],
    extras: ['canopy', 'redcross', 'helipad', 'solar'],
  },
  // 12: Classical arched Mediterranean general hospital
  {
    wall: '#f2e4cc',
    trim: '#ffffff',
    facade: 'arch',
    roof: 'hip',
    roofH: 9,
    roofColor: '#b85032',
    masses: [{ floors: 3, box: { u0: 0.16, u1: 2.84, v0: 0.14, v1: 1.48 } }],
    extras: ['canopy', 'redcross', 'planters'],
    ground: 'garden',
    trees: 3,
  },
  // 13: White modernist cantilevered emergency wing
  {
    wall: '#f6f7f8',
    facade: 'curtain',
    masses: [
      { floors: 1, box: { u0: 0.3, u1: 2.7, v0: 0.22, v1: 1.45 }, facade: 'lobby' },
      { floors: 4, box: { u0: 0.12, u1: 2.88, v0: 0.14, v1: 1.5 } },
    ],
    extras: ['redcross', 'helipad', 'skylight'],
  },
  // 14: Asymmetric west-wing diagnostic & ward tower
  {
    wall: '#dce6ec',
    facade: 'grid',
    masses: [
      { floors: 2, box: { u0: 0.12, u1: 2.88, v0: 0.12, v1: 1.55 }, facade: 'lobby' },
      { floors: 5, box: { u0: 0.2, u1: 1.45, v0: 0.2, v1: 1.3 } },
    ],
    extras: ['canopy', 'redcross', 'helipad', 'roofgarden'],
  },
  // 15: Asymmetric east-wing cardiac center
  {
    wall: '#e8eff2',
    facade: 'bands',
    masses: [
      { floors: 2, box: { u0: 0.12, u1: 2.88, v0: 0.12, v1: 1.55 }, facade: 'lobby' },
      { floors: 5, box: { u0: 1.55, u1: 2.8, v0: 0.2, v1: 1.3 } },
    ],
    extras: ['canopy', 'redcross', 'helipad', 'solar'],
  },
  // 16: Brick podium + modern glass ward addition
  {
    wall: '#b8d2e2',
    masses: [
      { floors: 2, box: { u0: 0.14, u1: 2.86, v0: 0.14, v1: 1.52 }, facade: 'brick', wall: '#b05d46' },
      { floors: 4, box: { u0: 0.5, u1: 2.5, v0: 0.22, v1: 1.28 }, facade: 'curtain' },
    ],
    extras: ['canopy', 'redcross', 'helipad'],
  },
  // 17: Eco solar-canopy children's hospital
  {
    wall: '#e6f0e8',
    facade: 'ribbon',
    masses: [
      { floors: 2, box: { u0: 0.14, u1: 2.86, v0: 0.14, v1: 1.52 }, facade: 'lobby' },
      { floors: 3, box: { u0: 0.4, u1: 2.6, v0: 0.22, v1: 1.3 } },
    ],
    signColor: '#2a8a68',
    ground: 'garden',
    extras: ['canopy', 'redcross', 'roofgarden', 'solar'],
    trees: 4,
  },
  // 18: Brutalist concrete medical monolith with antenna
  {
    wall: '#cfd4da',
    facade: 'grid',
    masses: [{ floors: 5, box: { u0: 0.18, u1: 2.82, v0: 0.16, v1: 1.48 } }],
    extras: ['canopy', 'redcross', 'helipad', 'antenna'],
  },
  // 19: Terracotta louver & diagrid flagship hospital
  {
    wall: '#dce6ee',
    masses: [
      { floors: 2, box: { u0: 0.12, u1: 2.88, v0: 0.12, v1: 1.55 }, facade: 'louvers', wall: '#e4ddd0' },
      { floors: 5, box: { u0: 0.55, u1: 2.45, v0: 0.22, v1: 1.3 }, facade: 'diagrid' },
    ],
    extras: ['canopy', 'redcross', 'helipad', 'planters'],
    trees: 3,
  },
);
