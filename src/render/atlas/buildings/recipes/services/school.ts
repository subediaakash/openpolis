import { variants, type BuildingArt } from '../types';

export const school: readonly BuildingArt[] = variants(
  {
    floorH: 10,
    masses: [{ floors: 2, box: { u0: 0.16, u1: 1.84, v0: 0.16, v1: 1.2 } }],
    wall: '#c8794f',
    trim: '#f0e4cf',
    roof: 'hip',
    roofColor: '#6d4a3b',
    roofH: 9,
    facade: 'brick',
    ground: 'field',
    extras: ['fence'],
    sign: 'SCHOOL',
    signColor: '#2f6d4a',
  },
  {},
  { wall: '#ead9b8', facade: 'punched', roof: 'gable', roofH: 10, roofColor: '#7a4a3a', signColor: '#2d5f8a' },
  { wall: '#e6ebef', facade: 'ribbon', roof: 'flat', roofColor: '#6a7076', extras: ['fence', 'solar'], signColor: '#c8602d' },
  { wall: '#dfe8e0', facade: 'bands', roof: 'barrel', roofH: 9, roofColor: '#4f6d60', extras: ['fence', 'planters'], signColor: '#256b48' },
  { wall: '#e8dfd0', facade: 'punched', roof: 'mansard', roofH: 9, roofColor: '#465466', extras: ['fence'], signColor: '#2d5a8a' },
  { wall: '#e6e2d4', facade: 'louvers', trim: '#b88352', roof: 'shed', roofH: 8, roofColor: '#3f5448', extras: ['fence', 'planters'], signColor: '#2d8a52' },
  { wall: '#f0e6d2', facade: 'arch', trim: '#ffffff', roof: 'hip', roofH: 9, roofColor: '#a84e34', extras: ['fence'], signColor: '#8c3a2b' },
  { wall: '#d6e4ec', facade: 'diagrid', trim: '#eef6fc', roof: 'flat', roofColor: '#4d6474', extras: ['fence', 'skylight', 'solar'], signColor: '#1f6fb2' },
  { wall: '#f2ead8', facade: 'timber', trim: '#4f3726', roof: 'gable', roofH: 10, roofColor: '#6d3e30', extras: ['fence'], signColor: '#5c4030' },
  { wall: '#e4dac8', facade: 'artdeco', trim: '#faf4e6', roof: 'flat', roofColor: '#5c646e', extras: ['fence', 'roofgarden'], signColor: '#4b558a' },
);
