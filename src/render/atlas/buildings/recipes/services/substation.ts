import { one, variants, type BuildingArt } from '../types';

export const substation: readonly BuildingArt[] = variants(
  {
    floorH: 5,
    masses: [one(1, 0.08)],
    wall: '#5d7180',
    trim: '#c8d7df',
    roof: 'flat',
    roofColor: '#39464f',
    facade: 'bands',
    ground: 'paved',
    extras: ['acunits'],
  },
  {},
  { wall: '#71818a', roofColor: '#344a58' },
  { wall: '#9e5c48', facade: 'brick', roof: 'gable', roofH: 5, roofColor: '#4a5058', extras: [] },
  { wall: '#b8c4cc', facade: 'industrial', roof: 'shed', roofH: 5, roofColor: '#3d4c58', extras: ['tanks'] },
);
