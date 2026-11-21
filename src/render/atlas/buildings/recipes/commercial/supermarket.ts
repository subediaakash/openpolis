import { variants, type BuildingArt } from '../types';

/** 20 distinct real-world supermarkets, market halls, organic grocers and retail flagships. */
export const supermarket: readonly BuildingArt[] = variants(
  {
    floorH: 16,
    masses: [{ floors: 1, box: { u0: 0.12, u1: 1.88, v0: 0.12, v1: 1.15 } }],
    wall: '#e8e3d8',
    roof: 'flat',
    roofColor: '#8a8d92',
    facade: 'shopfront',
    ground: 'parking',
    extras: ['parking', 'acunits'],
    sign: 'MARKET',
    signColor: '#d2462f',
  },
  {},
  { wall: '#dfe6ea', sign: 'GROCER', signColor: '#2b7a3d', extras: ['parking', 'solar'] },
  { wall: '#ece2d3', sign: 'FRESH', signColor: '#2c62b0', extras: ['parking', 'awning'] },
  { wall: '#f0ebe0', sign: 'FOODS', signColor: '#e08a1e', extras: ['parking', 'acunits', 'planters'] },
  { wall: '#c9d4dc', sign: 'MEGA', signColor: '#7a3fb0', extras: ['parking', 'solar', 'billboard'] },
  { wall: '#f2e6d6', sign: 'SAVE+', signColor: '#c2272d', extras: ['parking', 'awning'] },
  // 6: Barrel-vaulted market hall
  { wall: '#e9e4d8', roof: 'barrel', roofH: 10, roofColor: '#5c6f7e', sign: 'HALL', signColor: '#1f7a52', extras: ['parking', 'planters'] },
  // 7: Shed-roof eco grocer
  { wall: '#dce6de', roof: 'shed', roofH: 8, roofColor: '#3e5446', sign: 'ECO MART', signColor: '#2d8a4e', extras: ['parking', 'planters'] },
  // 8: Skylight atrium plaza market
  { wall: '#e4eaf0', facade: 'ribbon', sign: 'PLAZA', signColor: '#2665ad', extras: ['parking', 'skylight', 'billboard'] },
  // 9: Pergola food hall bazaar
  { wall: '#f0dec8', facade: 'shopfront', sign: 'BAZAAR', signColor: '#c95c24', extras: ['parking', 'pergola', 'planters'] },
  // 10: Victorian brick arched market hall
  { wall: '#b55b42', facade: 'arch', trim: '#f2e6d4', roof: 'gable', roofH: 10, roofColor: '#4c5460', sign: 'ARCADE', signColor: '#8c2f2f', extras: ['parking', 'planters'] },
  // 11: Sawtooth industrial wholesale depot
  { wall: '#c6ccd2', roof: 'sawtooth', roofH: 8, roofColor: '#5c6670', sign: 'DEPOT', signColor: '#2d5c8a', extras: ['parking', 'loadingdock'] },
  // 12: Timber-louvered organic farm market
  { wall: '#e8e2d4', facade: 'louvers', trim: '#a87544', roof: 'shed', roofH: 8, roofColor: '#4c644e', sign: 'HARVEST', signColor: '#357a3e', extras: ['parking', 'planters'] },
  // 13: Contemporary glass diagrid flagship store
  { wall: '#bcd4e4', facade: 'diagrid', trim: '#eef4f8', sign: 'GALLERIA', signColor: '#1f5a8c', extras: ['parking', 'skylight', 'planters'] },
  // 14: Art Deco grand department market
  { wall: '#e6dcc8', facade: 'artdeco', trim: '#faf4e6', sign: 'EMPORIUM', signColor: '#264a5e', extras: ['parking', 'canopy', 'billboard'] },
  // 15: Two-storey urban food hall with roof garden
  { wall: '#e4ddd0', floorH: 10, masses: [{ floors: 2, box: { u0: 0.14, u1: 1.86, v0: 0.12, v1: 1.15 } }], sign: 'PANTRY', signColor: '#b84c2e', extras: ['parking', 'roofgarden', 'awning'] },
  // 16: Half-timbered country farmstand market
  { wall: '#f2e8d4', facade: 'timber', trim: '#543a28', roof: 'hip', roofH: 9, roofColor: '#7a4434', sign: 'FARM', signColor: '#3a7a42', extras: ['parking', 'planters'], trees: 2 },
  // 17: Parisian mansard gourmet hall
  { wall: '#ebe2d0', facade: 'arch', roof: 'mansard', roofH: 9, roofColor: '#465464', sign: 'MARCHE', signColor: '#7a3448', extras: ['parking', 'tables', 'planters'] },
  // 18: Clean white modernist hypermart with solar array
  { wall: '#f0f2f4', facade: 'curtain', sign: 'HYPER', signColor: '#1f78c8', extras: ['parking', 'solar', 'canopy'] },
  // 19: Terracotta courtyard Mediterranean market
  { wall: '#edc9a6', facade: 'arch', roof: 'barrel', roofH: 9, roofColor: '#b85032', sign: 'MERCADO', signColor: '#b53c28', extras: ['parking', 'tables', 'planters'] },
);
