import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world luxury villas, modernist estates and courtyard manors. */
export const villa: readonly BuildingArt[] = variants(
  {
    floorH: 10,
    masses: [one(2, 0.12)],
    wall: '#efe3cf',
    trim: '#ffffff',
    roof: 'hip',
    roofColor: '#566b58',
    roofH: 10,
    facade: 'punched',
    ground: 'garden',
    extras: ['garage', 'porch', 'pool', 'planters'],
    trees: 3,
  },
  {},
  { wall: '#e5d0ba', roofColor: '#40566d', extras: ['garage', 'porch', 'pool', 'solar'], trees: 2 },
  { wall: '#f2eee4', roof: 'flat', roofColor: '#66777c', facade: 'ribbon', extras: ['garage', 'pool', 'planters'], trees: 3 },
  { wall: '#d9e8dc', roofColor: '#80614d', extras: ['garage', 'porch', 'fence', 'planters'], trees: 4 },
  { wall: '#e7d9c6', roofColor: '#4c4a55', extras: ['garage', 'pool', 'solar'], trees: 2 },
  { wall: '#f4d8c8', roofColor: '#536b87', extras: ['garage', 'porch', 'pool', 'planters'], trees: 3 },
  // 6: Cantilevered modernist glass & pergola villa
  { wall: '#f4f2ec', roof: 'flat', roofColor: '#767a80', facade: 'curtain', masses: [one(1, 0.12), { floors: 1, box: { u0: 0.18, u1: 0.88, v0: 0.14, v1: 0.72 } }], extras: ['pergola', 'pool', 'planters'], trees: 3 },
  // 7: Shed-roof minimalist concrete villa
  { wall: '#dfd5c6', roof: 'shed', roofColor: '#3f4b56', roofH: 9, facade: 'bands', extras: ['garage', 'pool', 'planters'], trees: 3 },
  // 8: French chateau mansard manor
  { wall: '#ebe2d2', roof: 'mansard', roofColor: '#455160', roofH: 10, facade: 'arch', trim: '#ffffff', extras: ['porch', 'fence', 'planters'], trees: 4 },
  // 9: Stepped Tuscan terracotta estate
  { wall: '#f5d2b2', roof: 'hip', roofColor: '#b85032', roofH: 9, facade: 'arch', masses: [one(2, 0.14), one(1, 0.34)], extras: ['porch', 'pool', 'planters'], trees: 3 },
  // 10: English half-timbered country estate
  { wall: '#f2ead8', trim: '#4b3424', facade: 'timber', roof: 'gable', roofH: 11, roofColor: '#5c4b42', extras: ['chimney', 'porch', 'fence'], trees: 4 },
  // 11: Biophilic timber-louvered tropical villa
  { wall: '#e8e2d4', trim: '#b88352', facade: 'louvers', roof: 'flat', roofColor: '#5e6668', extras: ['pergola', 'pool', 'roofgarden'], trees: 4 },
  // 12: Georgian red-brick symmetrical manor
  { wall: '#b05642', trim: '#f5ecdc', facade: 'brick', roof: 'hip', roofH: 9, roofColor: '#454b54', extras: ['chimney', 'porch', 'fence'], trees: 3 },
  // 13: Art Deco Beverly Hills streamline villa
  { wall: '#f6f2e8', trim: '#d9c8a9', facade: 'artdeco', roof: 'flat', roofColor: '#7a8086', extras: ['pool', 'pergola', 'planters'], trees: 3 },
  // 14: Japanese zen cedar pavilion estate
  { wall: '#e4ddd0', trim: '#3c2c20', facade: 'timber', roof: 'hip', roofH: 8, roofColor: '#353c44', extras: ['planters', 'fence'], trees: 4 },
  // 15: Glass-atrium skylight contemporary estate
  { wall: '#dce6ee', facade: 'curtain', roof: 'flat', roofColor: '#5c6b78', extras: ['skylight', 'pool', 'solar'], trees: 3 },
  // 16: Barrel-vaulted coastal designer villa
  { wall: '#f0ece4', facade: 'ribbon', roof: 'barrel', roofH: 9, roofColor: '#526a7c', extras: ['pool', 'planters'], trees: 3 },
  // 17: Mediterranean whitewashed Santorini-style terraced villa
  { wall: '#f7f7f4', facade: 'arch', roof: 'flat', roofColor: '#3c7ab8', masses: [one(1, 0.12), one(1, 0.24)], extras: ['pool', 'pergola', 'planters'], trees: 2 },
  // 18: Scandinavian dark-slate & glass forest villa
  { wall: '#4e5864', trim: '#e6dfd2', facade: 'louvers', roof: 'shed', roofH: 9, roofColor: '#2e353e', extras: ['garage', 'planters'], trees: 4 },
  // 19: Classical Palladian stone villa with double porch
  { wall: '#ece3d2', trim: '#ffffff', facade: 'arch', roof: 'hip', roofH: 10, roofColor: '#5c6670', extras: ['porch', 'pool', 'fence'], trees: 4 },
);
