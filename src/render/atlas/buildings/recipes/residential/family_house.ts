import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world two-storey family houses, suburban homes and modernist residences. */
export const familyHouse: readonly BuildingArt[] = variants(
  {
    floorH: 9,
    masses: [one(2, 0.16)],
    wall: '#dfe7ee',
    roof: 'hip',
    roofColor: '#4f5d70',
    roofH: 8,
    facade: 'punched',
    ground: 'garden',
    extras: ['porch', 'chimney'],
    trees: 1,
  },
  // 0: Classic colonial hip-roof house
  {},
  // 1: Warm clapboard gable farmhouse
  { wall: '#f0dcc4', roofColor: '#a2493a', roof: 'gable', roofH: 10, facade: 'siding', extras: ['chimney'], trees: 2 },
  // 2: Suburban garage-wing family home
  { wall: '#d8e4cf', roofColor: '#6a4b3a', masses: [{ floors: 2, box: { u0: 0.1, u1: 0.64, v0: 0.16, v1: 0.82 } }], extras: ['garage', 'porch'] },
  // 3: Georgian red-brick family home
  { wall: '#c96f5a', facade: 'brick', roof: 'gable', ridge: 'v', roofColor: '#4a4f57', extras: ['chimney'], trees: 2 },
  // 4: Mid-century modern flat-roof split-level with solar
  { wall: '#f4f1ea', roof: 'flat', roofColor: '#8a8d92', facade: 'bands', masses: [one(1, 0.14), { floors: 1, box: { u0: 0.14, u1: 0.62, v0: 0.14, v1: 0.86 } }], extras: ['solar'], trees: 2 },
  // 5: Craftsman porch siding house
  { wall: '#e7d3a8', roofColor: '#5c6b4a', facade: 'siding', extras: ['porch', 'fence'] },
  // 6: Nordic shed-roof modernist home
  { wall: '#eceef0', roof: 'shed', roofColor: '#3b4a58', roofH: 9, facade: 'ribbon', masses: [one(2, 0.14)], extras: ['planters', 'fence'], trees: 2 },
  // 7: French mansard townhouse-house
  { wall: '#e6dcc8', roof: 'mansard', roofColor: '#4a5564', roofH: 8, facade: 'punched', trim: '#ffffff', extras: ['porch', 'chimney'], trees: 2 },
  // 8: Modernist cedar-pergola rooftop terrace home
  { wall: '#d6bfa2', roof: 'flat', roofColor: '#6f7378', facade: 'bands', masses: [one(2, 0.15)], extras: ['pergola', 'planters'], trees: 2 },
  // 9: Stepped Mediterranean terracotta home
  { wall: '#f3d6be', roof: 'hip', roofColor: '#be5536', roofH: 9, facade: 'punched', masses: [one(1, 0.12), one(1, 0.24)], extras: ['porch', 'planters'], trees: 2 },
  // 10: Half-timbered English Tudor family manor
  { wall: '#f0e7d4', trim: '#4b3424', facade: 'timber', roof: 'gable', roofH: 11, roofColor: '#52443c', extras: ['chimney', 'porch'], trees: 2 },
  // 11: Contemporary timber-louvered eco residence
  { wall: '#e8e4da', trim: '#b88352', facade: 'louvers', roof: 'flat', roofColor: '#5e6668', masses: [one(2, 0.14)], extras: ['roofgarden', 'solar'], trees: 2 },
  // 12: Cantilevered glass-and-concrete modern home
  { wall: '#dce4ea', masses: [one(1, 0.22, 'lobby', '#646e78'), one(1, 0.12, 'curtain')], roof: 'flat', roofColor: '#5c6670', extras: ['skylight', 'planters'], trees: 2 },
  // 13: Classical arched Italianate stone house
  { wall: '#ebe0cc', trim: '#ffffff', facade: 'arch', roof: 'hip', roofH: 8, roofColor: '#a84e34', extras: ['planters', 'fence'], trees: 2 },
  // 14: Coastal white-and-navy New England colonial
  { wall: '#f4f6f8', trim: '#324a68', facade: 'siding', roof: 'gable', roofH: 10, roofColor: '#3a4654', extras: ['porch', 'chimney', 'fence'], trees: 2 },
  // 15: L-wing brick & garage suburban home
  { wall: '#a85440', facade: 'brick', trim: '#efe4d0', roof: 'hip', roofH: 8, roofColor: '#484e56', masses: [{ floors: 2, box: { u0: 0.1, u1: 0.64, v0: 0.14, v1: 0.84 } }], extras: ['garage', 'chimney'], trees: 1 },
  // 16: Japanese modern dark-timber & garden house
  { wall: '#e6dfd2', trim: '#3b2d22', facade: 'timber', roof: 'shed', roofH: 7, roofColor: '#343b42', extras: ['fence', 'planters'], trees: 3 },
  // 17: Barrel-vaulted architect's studio house
  { wall: '#e2e8ec', facade: 'ribbon', roof: 'barrel', roofH: 8, roofColor: '#526878', extras: ['planters'], trees: 2 },
  // 18: Art Deco white stucco streamline-moderne house
  { wall: '#f2eee4', trim: '#d4c4a8', facade: 'artdeco', roof: 'flat', roofColor: '#7a7e84', masses: [one(2, 0.15)], extras: ['pergola', 'planters'], trees: 2 },
  // 19: Painted Victorian blue-and-cream gable house
  { wall: '#c2d4e4', trim: '#ffffff', facade: 'siding', roof: 'mansard', roofH: 9, roofColor: '#465264', extras: ['porch', 'balconies'], trees: 2 },
);
