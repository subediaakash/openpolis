import { variants, type BuildingArt } from '../types';

export const policeStation: readonly BuildingArt[] = variants(
  {
    floorH: 10,
    // Pulled back from the street so the patrol cars have a forecourt.
    masses: [{ floors: 2, box: { u0: 0.12, u1: 0.88, v0: 0.12, v1: 0.6 } }],
    wall: '#dfe6ef',
    roof: 'flat',
    roofColor: '#3c5a8c',
    facade: 'bands',
    ground: 'paved',
    extras: ['canopy', 'acunits', 'patrolcars'],
    sign: 'POLICE',
    signColor: '#1f4fa8',
  },
  {},
  { wall: '#c4ccd6', facade: 'grid', masses: [{ floors: 3, box: { u0: 0.14, u1: 0.86, v0: 0.12, v1: 0.6 } }], extras: ['antenna', 'patrolcars'] },
  { wall: '#b8664d', facade: 'brick', trim: '#e8dcc8', extras: ['canopy', 'patrolcars'] },
  { wall: '#e4e8ee', facade: 'ribbon', roof: 'shed', roofH: 7, roofColor: '#364d75', extras: ['canopy', 'patrolcars'] },
  { wall: '#d2dae4', facade: 'punched', roof: 'mansard', roofH: 8, roofColor: '#2f4569', extras: ['canopy', 'patrolcars'] },
  { wall: '#e6dcc8', facade: 'artdeco', trim: '#faf4e6', extras: ['canopy', 'patrolcars'] },
  { wall: '#c0d2e2', facade: 'diagrid', trim: '#eef6fc', masses: [{ floors: 3, box: { u0: 0.14, u1: 0.86, v0: 0.12, v1: 0.6 } }], extras: ['canopy', 'antenna', 'patrolcars'] },
  { wall: '#ebe2d0', facade: 'arch', trim: '#ffffff', extras: ['canopy', 'patrolcars'] },
  { wall: '#d8e0e4', facade: 'louvers', trim: '#4b5d70', extras: ['canopy', 'solar', 'patrolcars'] },
  { wall: '#cfd6de', facade: 'bands', roof: 'barrel', roofH: 8, roofColor: '#2f4c78', extras: ['canopy', 'patrolcars'] },
);
