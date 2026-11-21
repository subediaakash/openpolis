import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world townhouses, brownstones, canal houses and urban terraced rows. */
export const townhouses: readonly BuildingArt[] = variants(
  {
    floorH: 8,
    masses: [one(3, 0.1)],
    wall: '#c96f5a',
    units: ['#c96f5a', '#d8b48a', '#8fa9b8'],
    roof: 'flat',
    roofColor: '#6b6e74',
    facade: 'townhouse',
    ground: 'paved',
    extras: ['acunits'],
  },
  // 0: Classic warm urban rowhouses
  {},
  // 1: Pastel Mediterranean terraced row
  { wall: '#e2c6a0', units: ['#e2c6a0', '#9fb7a3', '#d99a7a'] },
  // 2: Amsterdam narrow canal-house gables
  { wall: '#7c8fa8', units: ['#7c8fa8', '#e8e1d0', '#b5554a'], roof: 'gable', roofH: 7, roofColor: '#4f5560', extras: [] },
  // 3: Two-storey London mews cottages
  { wall: '#f1e4c8', units: ['#f1e4c8', '#c9d6df', '#e8c4c4'], masses: [one(2, 0.1)], extras: ['planters'] },
  // 4: NYC Brooklyn brownstones
  { wall: '#a4553f', units: ['#a4553f', '#8b4a3a', '#b8664d'], extras: ['acunits', 'solar'] },
  // 5: San Francisco Painted Ladies gable row
  { wall: '#d2e0d6', units: ['#d2e0d6', '#f3d9a8', '#c7c1e0'], roof: 'gable', roofH: 8, roofColor: '#6a3e30', extras: ['chimney'] },
  // 6: Parisian Haussmann mansard terrace
  { wall: '#e8dfd0', units: ['#e8dfd0', '#dfd4c0', '#ece5d8'], roof: 'mansard', roofH: 8, roofColor: '#48525e', extras: ['planters'] },
  // 7: Scandinavian shed-roof modern row
  { wall: '#dce4ea', units: ['#dce4ea', '#c4d2dc', '#e8ecee'], roof: 'shed', roofH: 7, roofColor: '#3e4a56', extras: ['planters'] },
  // 8: Bright coastal pastel row with roof garden
  { wall: '#f2b8a2', units: ['#f2b8a2', '#a8d5cf', '#f7df99'], roof: 'flat', roofColor: '#6d7076', extras: ['balconies', 'roofgarden'] },
  // 9: Brick-and-pergola urban mews
  { wall: '#9f523e', units: ['#9f523e', '#c67d53', '#6e4c41'], roof: 'flat', roofColor: '#565960', masses: [one(3, 0.1)], extras: ['pergola', 'planters'] },
  // 10: London Georgian cream-stucco arched terrace
  { wall: '#f0e9da', trim: '#ffffff', facade: 'arch', roof: 'mansard', roofH: 7, roofColor: '#464f5a', masses: [one(3, 0.1)], extras: ['planters'] },
  // 11: Contemporary timber-louvered townhouses
  { wall: '#e6e2d8', trim: '#b88352', facade: 'louvers', masses: [one(3, 0.1)], extras: ['roofgarden', 'solar'] },
  // 12: Boston Back Bay red-brick bowfront row
  { wall: '#9e4838', trim: '#f2e8d4', facade: 'brick', roof: 'mansard', roofH: 8, roofColor: '#424952', masses: [one(3, 0.1)], extras: ['chimney'] },
  // 13: Nordic colorful timber row (Copenhagen Nyhavn style)
  { wall: '#e6a844', units: ['#e6a844', '#c95344', '#4b7ea6'], roof: 'gable', roofH: 8, roofColor: '#5c3c32', extras: ['chimney'] },
  // 14: Half-timbered historic European row
  { wall: '#f2ead8', trim: '#4f3726', facade: 'timber', roof: 'gable', roofH: 9, roofColor: '#6d4032', masses: [one(3, 0.1)], extras: ['planters'] },
  // 15: Modernist white-and-glass Bauhaus row
  { wall: '#f2f3f5', facade: 'ribbon', masses: [one(3, 0.1)], extras: ['skylight', 'pergola'] },
  // 16: Art Deco stepped urban rowhouses
  { wall: '#e4dac6', trim: '#faf4e6', facade: 'artdeco', masses: [one(3, 0.1)], extras: ['planters'] },
  // 17: Mixed-use shopfront ground + rowhouse uppers
  { wall: '#d8c4a8', masses: [one(1, 0.1, 'shopfront', '#4e5864'), one(2, 0.1, 'townhouse')], units: ['#d8c4a8', '#c4d2dc', '#e2b8a2'], extras: ['awning', 'planters'] },
  // 18: Slate-blue & cedar contemporary row
  { wall: '#5e7386', units: ['#5e7386', '#72889c', '#c8a882'], roof: 'shed', roofH: 7, roofColor: '#36404a', extras: ['balconies'] },
  // 19: Terracotta courtyard townhouses with hip roof
  { wall: '#edc9a8', units: ['#edc9a8', '#e6b892', '#f2dcc4'], roof: 'hip', roofH: 7, roofColor: '#b55032', extras: ['planters'] },
);
