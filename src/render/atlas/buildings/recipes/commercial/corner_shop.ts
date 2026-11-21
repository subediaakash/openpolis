import { one, variants, type BuildingArt } from '../types';

/** 20 distinct real-world corner shops, boutiques, markets and mixed-use retail buildings. */
export const cornerShop: readonly BuildingArt[] = variants(
  {
    floorH: 9,
    masses: [one(2, 0.12)],
    wall: '#e7d9bd',
    roof: 'flat',
    roofColor: '#6b6e74',
    facade: 'shopfront',
    ground: 'paved',
    extras: ['awning'],
    sign: 'SHOP',
    signColor: '#2f7d4a',
    awning: '#d94a3d',
  },
  // 0: Classic neighborhood corner store
  { extras: ['awning', 'bladesign'] },
  // 1: Artisan bakery with sidewalk seating
  { wall: '#f3e3cf', sign: 'BAKERY', signColor: '#8a4b2b', awning: '#f0a830', extras: ['awning', 'tables', 'bladesign'] },
  // 2: Brick independent bookshop
  { wall: '#b35a45', masses: [one(1, 0.12, 'shopfront'), one(2, 0.12, 'brick')], sign: 'BOOKS', signColor: '#2f5d9a', awning: '#2d6fc4', extras: ['awning', 'bladesign'] },
  // 3: Neighborhood gourmet delicatessen
  { wall: '#efe7d8', masses: [one(1, 0.14)], sign: 'DELI', signColor: '#2e6b3e', awning: '#2e8a5a', extras: ['awning', 'planters'] },
  // 4: Corner florist with glasshouse feel
  { wall: '#f4eef6', roof: 'barrel', roofH: 7, roofColor: '#5c7c88', sign: 'FLORIST', signColor: '#9b2f5f', awning: '#d9578a', extras: ['awning', 'planters', 'bladesign'] },
  // 5: Corner pharmacy & apothecary
  { wall: '#e9edf0', masses: [one(1, 0.12, 'shopfront'), one(2, 0.12, 'punched')], sign: 'PHARMACY', signColor: '#1f8a5a', awning: '#3aa66a', extras: ['awning', 'acunits', 'bladesign'] },
  // 6: Parisian mansard fashion atelier
  { wall: '#efe2ce', masses: [one(1, 0.12, 'shopfront'), one(2, 0.12, 'arch')], roof: 'mansard', roofH: 8, roofColor: '#465466', sign: 'ATELIER', signColor: '#5c3f8a', awning: '#7a58b0', extras: ['awning', 'planters', 'bladesign'] },
  // 7: Modern shed-roof cycle & gear shop
  { wall: '#dce4ea', roof: 'shed', roofH: 7, roofColor: '#364452', sign: 'CYCLES', signColor: '#d45a28', awning: '#e06d38', extras: ['awning', 'planters'] },
  // 8: Urban brick electronics & tech shop with billboard
  { wall: '#9f4e3c', masses: [one(1, 0.12, 'shopfront'), one(1, 0.12, 'brick')], sign: 'TECH', signColor: '#1f6fb2', awning: '#2a85cf', extras: ['awning', 'billboard', 'bladesign'] },
  // 9: Organic greengrocer with barrel roof
  { wall: '#e6eee4', roof: 'barrel', roofH: 8, roofColor: '#54736a', sign: 'ORGANIC', signColor: '#2f7a42', awning: '#3c9854', extras: ['awning', 'tables', 'planters'] },
  // 10: Art Deco jeweler & watchmaker
  { wall: '#e8dec8', trim: '#f8f2e4', masses: [one(1, 0.12, 'shopfront'), one(2, 0.12, 'artdeco')], sign: 'JEWELS', signColor: '#254a68', awning: '#254a68', extras: ['awning', 'bladesign'] },
  // 11: Half-timbered heritage tailor & haberdashery
  { wall: '#f0e6d2', trim: '#4f3726', masses: [one(1, 0.14, 'shopfront'), one(1, 0.14, 'timber')], roof: 'gable', roofH: 8, roofColor: '#6d3e30', sign: 'TAILOR', signColor: '#4f3726', awning: '#8c4430', extras: ['awning', 'bladesign'] },
  // 12: Vinyl record store & audio loft
  { wall: '#4d5460', masses: [one(1, 0.12, 'shopfront'), one(1, 0.16, 'ribbon')], sign: 'VINYL', signColor: '#d43f58', awning: '#d43f58', extras: ['awning', 'billboard', 'bladesign'] },
  // 13: Scandinavian timber-louvered homeware store
  { wall: '#eceae2', trim: '#b88352', masses: [one(1, 0.12, 'shopfront'), one(2, 0.12, 'louvers')], sign: 'NORDIC', signColor: '#3a4a58', awning: '#526474', extras: ['awning', 'roofgarden', 'planters'] },
  // 14: European arched cheese & wine merchant
  { wall: '#ebd8bc', trim: '#f7efe0', masses: [one(2, 0.12, 'arch')], roof: 'hip', roofH: 7, roofColor: '#a64d36', sign: 'FROMAGE', signColor: '#8c2f39', extras: ['tables', 'planters', 'bladesign'] },
  // 15: Hardware & craft supply store
  { wall: '#c9b498', roof: 'sawtooth', roofH: 6, roofColor: '#636b74', masses: [one(1, 0.12)], sign: 'TOOLS', signColor: '#c85a24', awning: '#c85a24', extras: ['awning', 'crates'] },
  // 16: Chocolatier & patisserie with mansard
  { wall: '#f5e0d4', masses: [one(1, 0.12, 'shopfront'), one(1, 0.12, 'punched')], roof: 'mansard', roofH: 7, roofColor: '#523c42', sign: 'CACAO', signColor: '#6e342b', awning: '#964438', extras: ['awning', 'tables', 'bladesign'] },
  // 17: Print, stationery & art supply studio
  { wall: '#d8e4ea', masses: [one(1, 0.12, 'shopfront'), one(2, 0.14, 'grid')], sign: 'PAPER', signColor: '#2d7599', awning: '#2d7599', extras: ['awning', 'skylight', 'bladesign'] },
  // 18: Modern glass flagship showroom (diagrid upper)
  { wall: '#c8dce8', masses: [one(1, 0.12, 'shopfront'), one(2, 0.12, 'diagrid')], sign: 'MODA', signColor: '#222832', extras: ['bladesign', 'skylight', 'planters'] },
  // 19: Rooftop-pergola organic wine & bistro market
  { wall: '#e6d8c4', masses: [one(1, 0.12, 'shopfront'), one(1, 0.18, 'punched')], sign: 'VINO', signColor: '#7a2e40', awning: '#7a2e40', extras: ['awning', 'pergola', 'planters', 'bladesign'] },
);
