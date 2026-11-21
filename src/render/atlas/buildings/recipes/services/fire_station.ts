import { one, variants, type BuildingArt } from '../types';

export const fireStation: readonly BuildingArt[] = variants(
  {
    floorH: 11,
    masses: [one(2, 0.12)],
    wall: '#b9483a',
    trim: '#efe3cf',
    roof: 'flat',
    roofColor: '#5d5f63',
    facade: 'brick',
    ground: 'paved',
    extras: ['firedoors', 'hosetower'],
    sign: 'FIRE',
    signColor: '#d23b2b',
  },
  {},
  { wall: '#ece4d6', facade: 'punched', extras: ['firedoors', 'hosetower', 'acunits'] },
  { wall: '#8f3a30', roof: 'gable', roofH: 8, roofColor: '#4a4d52', extras: ['firedoors'] },
  { wall: '#d8dee4', facade: 'ribbon', roof: 'barrel', roofH: 8, roofColor: '#b93b2e', extras: ['firedoors'] },
  { wall: '#e6d8c8', facade: 'grid', roof: 'shed', roofH: 7, roofColor: '#9e3226', extras: ['firedoors', 'solar'] },
  { wall: '#e8dec8', facade: 'arch', trim: '#ffffff', roof: 'mansard', roofH: 8, roofColor: '#4c545e', extras: ['firedoors'] },
  { wall: '#a84436', facade: 'artdeco', trim: '#f2e6d4', extras: ['firedoors', 'hosetower'] },
  { wall: '#cfd8de', facade: 'diagrid', trim: '#eef4f8', extras: ['firedoors', 'hosetower', 'solar'] },
  { wall: '#e6e2d6', facade: 'louvers', trim: '#a6503a', extras: ['firedoors', 'hosetower', 'roofgarden'] },
  { wall: '#f0e6d4', facade: 'timber', trim: '#5c3a28', roof: 'hip', roofH: 8, roofColor: '#8c3228', extras: ['firedoors'] },
);
