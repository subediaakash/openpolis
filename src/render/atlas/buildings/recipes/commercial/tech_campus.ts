import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world tech campuses, R&D headquarters and corporate innovation parks. */
export const techCampus: readonly BuildingArt[] = variants(
  {
    floorH: 11,
    masses: [one(4, 0.12), { floors: 8, box: { u0: 0.52, u1: 1.65, v0: 0.38, v1: 1.65 } }],
    wall: '#b7d3dd',
    trim: '#f4fbff',
    roof: 'flat',
    roofColor: '#3d5969',
    facade: 'curtain',
    ground: 'plaza',
    extras: ['solar', 'roofgarden', 'antenna', 'planters'],
    sign: 'NEXUS',
    signColor: '#2b8aa0',
  },
  {},
  { wall: '#d6c7df', facade: 'grid', sign: 'ORBIT', signColor: '#8150a0', extras: ['solar', 'antenna'] },
  { wall: '#c6dfd1', facade: 'ribbon', sign: 'LUMEN', signColor: '#2c7d57', extras: ['roofgarden', 'planters'] },
  { wall: '#e5d9c2', facade: 'punched', sign: 'FORGE', signColor: '#b65b2d', extras: ['solar', 'roofgarden'] },
  { wall: '#a8bfd0', facade: 'curtain', fins: true, sign: 'VECTOR', signColor: '#286a99', extras: ['antenna'] },
  { wall: '#e8e9ec', facade: 'bands', sign: 'PULSE', signColor: '#b33e62', extras: ['solar', 'planters'] },
  // 6: Barrel-vaulted aerospace R&D hangar
  { wall: '#d6e2ea', facade: 'curtain', roof: 'barrel', roofH: 11, roofColor: '#446278', masses: [one(5, 0.14)], sign: 'AERO', signColor: '#1f6fb2', extras: ['planters'] },
  // 7: Biophilic stepped green-terrace campus
  { wall: '#d8e4da', facade: 'ribbon', masses: [one(3, 0.12), one(5, 0.24), one(3, 0.36)], sign: 'VERDANT', signColor: '#2a8552', extras: ['pergola', 'roofgarden', 'solar'] },
  // 8: Glass atrium HQ with skylight & helipad
  { wall: '#c0d2e2', facade: 'curtain', fins: true, masses: [one(4, 0.12, 'lobby'), one(7, 0.24)], sign: 'STRATOS', signColor: '#3b4e8a', extras: ['skylight', 'helipad'] },
  // 9: Shed-roof architectural innovation center
  { wall: '#e4ddd2', facade: 'grid', roof: 'shed', roofH: 9, roofColor: '#3b4856', masses: [one(6, 0.14)], sign: 'SYNTH', signColor: '#c2542b', extras: ['planters'] },
  // 10: Steel-and-glass diagrid flagship HQ
  { wall: '#78acc8', facade: 'diagrid', trim: '#edf6fc', masses: [one(3, 0.12, 'lobby', '#394f60'), one(9, 0.2)], sign: 'PRISM', signColor: '#1c78b8', extras: ['helipad', 'spire'] },
  // 11: Timber-louvered sustainable tech campus
  { wall: '#e8e2d4', facade: 'louvers', trim: '#b88352', masses: [one(4, 0.12), one(6, 0.24)], sign: 'CANOPY', signColor: '#2f7a4e', extras: ['roofgarden', 'pergola', 'solar'], trees: 3 },
  // 12: Art Deco heritage communications HQ
  { wall: '#e4d8c4', facade: 'artdeco', trim: '#faf4e6', masses: [one(5, 0.12), one(5, 0.24), one(2, 0.38)], sign: 'APEX', signColor: '#2d526e', extras: ['crown', 'spire'] },
  // 13: Sawtooth robotics & hardware lab
  { wall: '#cfd6dc', facade: 'grid', roof: 'sawtooth', roofH: 9, roofColor: '#4c5966', masses: [one(5, 0.12)], sign: 'MECHA', signColor: '#d45a28', extras: ['planters'] },
  // 14: Cantilevered twin-wing software campus
  { wall: '#9ebcd0', facade: 'curtain', masses: [one(3, 0.22, 'lobby', '#465664'), one(7, 0.12)], sign: 'CLOUD', signColor: '#2678c4', extras: ['skylight', 'solar', 'planters'] },
  // 15: Brick-and-glass converted mill tech hub
  { wall: '#b05a42', masses: [one(4, 0.12, 'brick'), one(5, 0.24, 'diagrid', '#78a2be')], sign: 'FOUNDRY', signColor: '#c44a32', extras: ['roofgarden', 'antenna'] },
  // 16: Classical arched science institute
  { wall: '#ebe2d0', facade: 'arch', trim: '#ffffff', roof: 'mansard', roofH: 10, roofColor: '#455464', masses: [one(6, 0.14)], sign: 'GENOME', signColor: '#2a7878', extras: ['planters'], trees: 2 },
  // 17: Terracotta louver & glass media campus
  { wall: '#d6906c', facade: 'louvers', trim: '#f2e6d6', masses: [one(4, 0.12), one(6, 0.22)], sign: 'SOLARIS', signColor: '#d46a28', extras: ['solar', 'billboard', 'pergola'] },
  // 18: Dark-glass monolith with rooftop helipad & crown
  { wall: '#466278', facade: 'curtain', fins: true, masses: [one(2, 0.12, 'lobby', '#2e3c48'), one(10, 0.18)], sign: 'QUANTUM', signColor: '#38bdf8', extras: ['crown', 'helipad'] },
  // 19: Biophilic garden-courtyard R&D park
  { wall: '#d2e2d8', facade: 'bands', masses: [one(3, 0.12), { floors: 6, box: { u0: 0.25, u1: 1.35, v0: 0.25, v1: 1.45 }, facade: 'diagrid', wall: '#6fa4b8' }], ground: 'garden', sign: 'BIOME', signColor: '#2e8a58', extras: ['roofgarden', 'skylight', 'solar'], trees: 4 },
);
