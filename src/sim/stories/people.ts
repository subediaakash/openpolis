import { BUILDINGS, Lifestyle, type BuildingDef, type BuildingInstance } from '../buildings/catalog';
import type { World } from '../World';

/**
 * The people of the city (docs/specs/stories.md, D-111). Nobody is tracked one by one: each home
 * shows up to three residents made from a hash of the city seed, the home and a slot, so the same
 * home always has the same people, nothing is saved, and it costs nothing until asked for.
 */

export interface Resident {
  readonly name: string;
  readonly first: string;
  readonly age: number;
  /** What they do, with where: "Nurse at the Hospital", "Student", "Retired". */
  readonly job: string;
}

const FIRST: readonly string[] = [
  'Maya', 'Arjun', 'Lena', 'Tomas', 'Aiko', 'Kwame', 'Sofia', 'Ravi', 'Ines', 'Jonah', 'Amara', 'Mateo',
  'Yuki', 'Farah', 'Elias', 'Priya', 'Noah', 'Zara', 'Diego', 'Hana', 'Omar', 'Clara', 'Kenji', 'Leila',
  'Samir', 'Freya', 'Tariq', 'Nadia', 'Felix', 'Asha', 'Lucas', 'Mei', 'Kofi', 'Elena', 'Rahul', 'Aylin',
  'Hugo', 'Sana', 'Marco', 'Ingrid', 'Bilal', 'Rosa', 'Daniel', 'Anika', 'Theo', 'Laila', 'Ivan', 'Nora',
  'Emeka', 'Chloe', 'Hiro', 'Selin', 'Pablo', 'Aisha', 'Oskar', 'Mira', 'Andre', 'Kavya', 'Luis', 'Esme',
];
const FAMILY: readonly string[] = [
  'Okafor', 'Sharma', 'Lindqvist', 'Moreau', 'Tanaka', 'Mensah', 'Rossi', 'Patel', 'Alvarez', 'Novak',
  'Haddad', 'Kowalski', 'Nakamura', 'Osei', 'Fischer', 'Silva', 'Chen', 'Dubois', 'Kaya', 'Reyes',
  'Iyer', 'Andersen', 'Bello', 'Costa', 'Petrov', 'Mbeki', 'Larsen', 'Yilmaz', 'Santos', 'Kim',
  'Bauer', 'Adeyemi', 'Varga', 'Ortiz', 'Sato', 'Murphy', 'Rahman', 'Lopez', 'Weber', 'Nyambura',
  'Ferreira', 'Holm', 'Gupta', 'Bianchi', 'Okoro', 'Jansen', 'Mori', 'Castro', 'Ali', 'Sorensen',
];

/** Roles by kind of workplace, from entry-level to senior (a richer home gets the more senior ones). */
type RoleKind = 'shop' | 'office' | 'hotel' | 'industry' | 'police' | 'fire' | 'health' | 'school' | 'academia' | 'transit' | 'parks' | 'utility' | 'civic';
const ROLES: Readonly<Record<RoleKind, readonly (readonly string[])[]>> = {
  shop: [['Shop assistant', 'Barista', 'Cashier'], ['Store manager', 'Head chef', 'Buyer'], ['Owner', 'Area manager', 'Restaurateur']],
  office: [['Receptionist', 'Office assistant', 'Junior analyst'], ['Accountant', 'Designer', 'Project manager'], ['Software engineer', 'Lawyer', 'Director']],
  hotel: [['Housekeeper', 'Porter', 'Waiter'], ['Receptionist', 'Chef', 'Events planner'], ['Hotel manager', 'Executive chef', 'Concierge']],
  industry: [['Machine operator', 'Forklift driver', 'Packer'], ['Electrician', 'Foreman', 'Mechanic'], ['Plant engineer', 'Operations manager', 'Chemist']],
  police: [['Police officer', 'Dispatcher'], ['Detective', 'Sergeant'], ['Inspector', 'Chief inspector']],
  fire: [['Firefighter', 'Dispatcher'], ['Crew manager', 'Paramedic'], ['Station officer', 'Fire chief']],
  health: [['Care assistant', 'Porter', 'Receptionist'], ['Nurse', 'Paramedic', 'Pharmacist'], ['Doctor', 'Surgeon', 'Consultant']],
  school: [['Teaching assistant', 'Caretaker'], ['Teacher', 'Librarian'], ['Head teacher', 'Deputy head']],
  academia: [['Lab technician', 'Library assistant'], ['Lecturer', 'Researcher'], ['Professor', 'Dean']],
  transit: [['Ticket clerk', 'Cleaner'], ['Bus driver', 'Train driver'], ['Network controller', 'Station manager']],
  parks: [['Gardener', 'Groundskeeper'], ['Park ranger', 'Ride operator'], ['Park manager', 'Head gardener']],
  utility: [['Technician', 'Plant operator'], ['Engineer', 'Line worker'], ['Chief engineer', 'Plant manager']],
  civic: [['Clerk', 'Cleaner'], ['Planner', 'Officer'], ['Councillor', 'Manager']],
};

/** What kind of roles a workplace has. */
function roleKind(d: BuildingDef, id: string): RoleKind {
  switch (id) {
    case 'police_station':
      return 'police';
    case 'fire_station':
      return 'fire';
    case 'clinic':
    case 'hospital':
    case 'trauma_centre':
      return 'health';
    case 'school':
      return 'school';
    case 'university':
    case 'research_centre':
      return 'academia';
    case 'hotel':
    case 'sail_hotel':
      return 'hotel';
    case 'bus_station':
    case 'train_station':
      return 'transit';
  }
  if (d.category === 'commercial') return d.density === 'high' || id === 'tech_campus' ? 'office' : 'shop';
  if (d.category === 'industrial') return 'industry';
  if (d.group === 'parks') return 'parks';
  if (d.group === 'utilities') return 'utility';
  return 'civic';
}

/** A stable 32-bit hash of a few numbers. */
export function hash(...parts: readonly number[]): number {
  let h = 2166136261;
  for (const p of parts) {
    h = Math.imul(h ^ (p | 0), 16777619);
    h = Math.imul(h ^ (h >>> 15), 2246822507);
  }
  return h >>> 0;
}

const pickBy = <T>(list: readonly T[], h: number): T => list[h % list.length];

/** Buildings within `reach` tiles that employ people, with a running total of their jobs (to weight the pick). */
function workplacesNear(world: World, home: BuildingInstance, reach = 18): { places: BuildingInstance[]; jobs: number[] } {
  const places: BuildingInstance[] = [];
  const jobs: number[] = [];
  let total = 0;
  for (const b of world.buildings.values()) {
    const d: BuildingDef = BUILDINGS[b.def];
    if (d.category === 'residential' || d.capacity <= 0 || b.construction > 0) continue;
    if (Math.max(Math.abs(b.x - home.x), Math.abs(b.y - home.y)) > reach) continue;
    total += d.capacity;
    places.push(b);
    jobs.push(total);
  }
  return { places, jobs };
}

/**
 * Up to three residents of a home (fewer when fewer live there; none when it's empty). The same
 * home always gives the same people; a job names a real workplace near the home.
 */
export function residentsOf(world: World, home: BuildingInstance): Resident[] {
  const d: BuildingDef = BUILDINGS[home.def];
  if (d.category !== 'residential' || home.occupants <= 0) return [];
  const count = Math.min(3, home.occupants);
  const family = pickBy(FAMILY, hash(world.seed, home.id, 7));
  const work = workplacesNear(world, home);
  const tier = home.lifestyle === Lifestyle.Prosperous ? 2 : home.lifestyle === Lifestyle.Comfortable ? 1 : 0;
  const out: Resident[] = [];
  for (let k = 0; k < count; k++) {
    const h = hash(world.seed, home.id, k);
    const first = pickBy(FIRST, h);
    // Big blocks hold many households: each resident there gets their own family name.
    const surname = d.capacity > 12 ? pickBy(FAMILY, hash(world.seed, home.id, k, 3)) : family;
    // The first resident is a working adult; others may be students or retired.
    const roll = (h >>> 8) % 100;
    const age = k === 0 ? 24 + (roll % 36) : roll < 18 ? 17 + (roll % 5) : roll < 30 ? 68 + (roll % 18) : 22 + (roll % 44);
    out.push({ name: `${first} ${surname}`, first, age, job: jobFor(age, tier, work, h) });
  }
  return out;
}

function jobFor(age: number, tier: number, work: ReturnType<typeof workplacesNear>, h: number): string {
  if (age < 22) return 'Student';
  if (age >= 67) return 'Retired';
  const total = work.jobs[work.jobs.length - 1] ?? 0;
  if (total === 0) return 'Looking for work';
  // Big employers employ more of the neighbourhood: pick a job, not a building.
  const slot = (h >>> 4) % total;
  const place = work.places[work.jobs.findIndex((j) => slot < j)];
  const d: BuildingDef = BUILDINGS[place.def];
  const roles = ROLES[roleKind(d, place.def)][tier];
  return `${pickBy(roles, h >>> 12)} at the ${d.name}`;
}
