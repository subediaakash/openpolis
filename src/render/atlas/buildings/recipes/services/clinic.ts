import { one, variants, type BuildingArt } from '../types';

export const clinic: readonly BuildingArt[] = variants(
  {
    floorH: 10,
    masses: [one(2, 0.14)],
    wall: '#f2f4f5',
    roof: 'flat',
    roofColor: '#8b9196',
    facade: 'bands',
    ground: 'garden',
    extras: ['canopy', 'redcross'],
    sign: 'CLINIC',
    signColor: '#d4343a',
    trees: 1,
  },
  {},
  { wall: '#e3efe6', facade: 'ribbon', extras: ['canopy', 'redcross', 'solar'], trees: 2 },
  { wall: '#eef0f4', masses: [one(1, 0.1, 'lobby'), one(2, 0.16)], extras: ['redcross', 'helipad'], ground: 'plaza' },
  { wall: '#e8f0ec', facade: 'curtain', roof: 'barrel', roofH: 8, roofColor: '#5c7c8c', extras: ['canopy', 'redcross'], trees: 2 },
  { wall: '#f4efe6', facade: 'punched', roof: 'hip', roofH: 8, roofColor: '#7a5c4c', extras: ['canopy', 'redcross', 'planters'], trees: 2 },
  { wall: '#e8e2d6', facade: 'louvers', trim: '#b88352', extras: ['canopy', 'redcross', 'roofgarden'], trees: 2 },
  { wall: '#ebe2d0', facade: 'arch', roof: 'mansard', roofH: 8, roofColor: '#465464', extras: ['canopy', 'redcross'], trees: 2 },
  { wall: '#c4dce8', facade: 'diagrid', trim: '#eef6fc', extras: ['canopy', 'redcross', 'skylight'], ground: 'plaza' },
  { wall: '#f2ece2', facade: 'artdeco', trim: '#ffffff', extras: ['canopy', 'redcross', 'planters'], trees: 2 },
  { wall: '#e4ece6', facade: 'bands', roof: 'shed', roofH: 7, roofColor: '#3f5650', extras: ['canopy', 'redcross'], trees: 2 },
);
