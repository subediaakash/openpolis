import type { NeedKind } from '../../sim/systems/needs';

/** Need names and fixes as the HUD words them (info panel, Citizens say). */

/** A need's short name. */
export const NEED_LABEL: Readonly<Record<NeedKind, string>> = {
  jobs: 'Jobs',
  shopping: 'Shopping',
  safety: 'Safety',
  health: 'Health',
  education: 'Education',
  hospital: 'Hospital',
  university: 'University',
  garbage: 'Garbage',
  transit: 'Transit',
  research: 'Research',
  commute: 'Commute',
  traffic: 'Traffic',
  air: 'Clean air',
  parks: 'Parks',
  workers: 'Workers',
  customers: 'Customers',
};

/** What fixes a weak need, in a few words. */
export const NEED_HINT: Readonly<Record<NeedKind, string>> = {
  jobs: 'Zone shops, offices or industry the residents can reach',
  shopping: 'Zone shops within 12 tiles',
  safety: 'Build a police station and a fire station nearby',
  health: 'Build a clinic or hospital nearby',
  education: 'Build a school nearby',
  hospital: 'Build a hospital in reach',
  university: 'Build a university in reach',
  garbage: 'Build a landfill, recycling centre or incinerator in reach',
  transit: 'Build a bus station within 10 tiles or a train station within 8',
  research: 'Build a research centre (Civic → Services)',
  commute: 'Wider roads, or jobs closer to home',
  traffic: 'Wider roads around here',
  air: 'Keep factories, power plants and landfills further away',
  parks: 'Build parks within 6 tiles',
  workers: 'Zone more homes nearby',
  customers: 'More residents nearby',
};
