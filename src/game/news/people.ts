import { mulberry32, subSeed } from '../../shared/rng';

/**
 * Named residents (docs/specs/news.md, "Named residents"): derived from a seeded hash of the
 * city seed, building id and resident slot, so the same home always has the same people.
 * Nothing here is stored or simulated; it gives the sim's numbers a face.
 */

/** Original syllables: names that sound like people without copying any real name list. */
const GIVEN_START = ['Ma', 'Ri', 'Lo', 'Te', 'Ka', 'Si', 'No', 'Ve', 'Da', 'Il', 'Or', 'Ju', 'Fe', 'An', 'Bo', 'Ce', 'Ar', 'El', 'Mi', 'Ta', 'Yu', 'Sa', 'Ni', 'Ro'] as const;
const GIVEN_END = ['ra', 'n', 'lo', 'ia', 's', 'to', 'ne', 'ri', 'la', 'mi', 'o', 'el', 'ya', 'ku', 'sa', 'en'] as const;
const FAMILY_START = ['Var', 'Holm', 'Brin', 'Cass', 'Dor', 'Fenn', 'Gal', 'Kest', 'Lund', 'Mar', 'Orr', 'Pell', 'Quin', 'Ros', 'Strand', 'Tal', 'Vey', 'Wick', 'Ash', 'Bel', 'Cor', 'Esk', 'Har', 'Nor'] as const;
const FAMILY_END = ['en', 'ley', 'ton', 'ard', 'ow', 'ick', 'ers', 'ane', 'ford', 'by', 'well', 'mere', 'ish', 'ri'] as const;

const SALT = { name: 0x4e41, age: 0xa6e, role: 0x201e, line: 0x11e5 } as const;

export type ResidentRole = 'shop' | 'office' | 'industry' | 'student' | 'retired' | 'jobless';

export interface Resident {
  readonly name: string;
  readonly age: number;
  readonly role: ResidentRole;
  /** "Works in a shop", "Retired". */
  readonly roleText: string;
  /** In their own words. */
  readonly says: string;
}

/** What residents' lives follow: the city's jobs and the home's mood. */
export interface HomeContext {
  readonly seed: number;
  readonly buildingId: number;
  readonly occupants: number;
  /** The home's happiness, 0..1. */
  readonly happiness: number;
  /** The home's complaint, if it has one ("We need a clinic nearby"). */
  readonly complaint: string | null;
  /** Share of the workforce without a job, 0..1. */
  readonly jobless: number;
  /** Jobs in the city by kind (shops, offices, industry), to share residents out. */
  readonly jobs: { readonly shop: number; readonly office: number; readonly industry: number };
}

const ROLE_TEXT: Readonly<Record<ResidentRole, string>> = {
  shop: 'Works in a shop',
  office: 'Works in an office',
  industry: 'Works in industry',
  student: 'Student',
  retired: 'Retired',
  jobless: 'Looking for work',
};

/** What a happy resident says. */
const PLEASED = [
  'I love this neighbourhood.',
  'Everything we need is close by.',
  'Best move we ever made.',
  'Quiet streets, friendly neighbours.',
  'The city is really looking after us.',
  'Can’t complain, honestly.',
] as const;

/** What a resident says when the home is fine but not glowing. */
const MIXED = ['It’s alright here. Could be better.', 'Some days are good, some aren’t.', 'We get by.', 'I keep hoping things improve.'] as const;

/** A stable random stream for one resident and one purpose. */
function rng(seed: number, buildingId: number, slot: number, salt: number): () => number {
  return mulberry32(subSeed(subSeed(seed, buildingId * 4 + slot), salt));
}

function pick<T>(list: readonly T[], roll: number): T {
  return list[Math.min(list.length - 1, Math.floor(roll * list.length))];
}

/** A resident's name: given name and family name from original syllables. */
export function residentName(seed: number, buildingId: number, slot: number): string {
  const r = rng(seed, buildingId, slot, SALT.name);
  const given = pick(GIVEN_START, r()) + pick(GIVEN_END, r());
  // Neighbours in one home often share a family name.
  const family = pick(FAMILY_START, rng(seed, buildingId, slot > 0 && r() < 0.6 ? 0 : slot, SALT.name + 1)()) + pick(FAMILY_END, r());
  return `${given} ${family}`;
}

function roleFor(age: number, roll: number, ctx: HomeContext): ResidentRole {
  if (age >= 67) return 'retired';
  if (age <= 22) return 'student';
  if (roll < ctx.jobless) return 'jobless';
  // Share the employed out by the city's jobs.
  const { shop, office, industry } = ctx.jobs;
  const total = shop + office + industry;
  if (total <= 0) return 'jobless';
  const r = (roll - ctx.jobless) / Math.max(1e-6, 1 - ctx.jobless);
  if (r < shop / total) return 'shop';
  return r < (shop + office) / total ? 'office' : 'industry';
}

/** What a resident says, from the home's mood (a complaint wins over small talk). */
function lineFor(ctx: HomeContext, role: ResidentRole, roll: number): string {
  if (role === 'jobless' && ctx.jobless > 0.1) return 'There just aren’t enough jobs around here.';
  if (ctx.complaint && ctx.happiness < 0.7) return ctx.complaint.endsWith('.') || ctx.complaint.endsWith('!') ? ctx.complaint : `${ctx.complaint}.`;
  return ctx.happiness >= 0.75 ? pick(PLEASED, roll) : pick(MIXED, roll);
}

/** Up to three named residents of a home (none when it's empty). */
export function residentsOf(ctx: HomeContext): Resident[] {
  const count = Math.min(3, Math.max(0, Math.floor(ctx.occupants)));
  const out: Resident[] = [];
  for (let slot = 0; slot < count; slot++) {
    const age = 19 + Math.floor(rng(ctx.seed, ctx.buildingId, slot, SALT.age)() * 66);
    const role = roleFor(age, rng(ctx.seed, ctx.buildingId, slot, SALT.role)(), ctx);
    out.push({
      name: residentName(ctx.seed, ctx.buildingId, slot),
      age,
      role,
      roleText: ROLE_TEXT[role],
      says: lineFor(ctx, role, rng(ctx.seed, ctx.buildingId, slot, SALT.line)()),
    });
  }
  return out;
}
