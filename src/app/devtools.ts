import type { Game } from '../game/Game';
import type { IncidentKind } from '../sim/systems/incidents';

/**
 * Console helpers for development builds only (`bun run dev`): trigger what is otherwise rare,
 * so it can be seen and tested. Production builds never install them (`import.meta.env.DEV`).
 *
 *   openpolis.fire()        a fire at the inspected building, or near the middle of the screen
 *   openpolis.theft(id?)    a theft; `id` picks the building
 *   openpolis.illness(id?)  a sick resident
 */
export interface DevTools {
  readonly game: Game;
  fire(buildingId?: number): number | null;
  theft(buildingId?: number): number | null;
  illness(buildingId?: number): number | null;
}

declare global {
  interface Window {
    openpolis?: DevTools;
  }
}

/** Install the helpers for this game; returns a function that removes them. */
export function installDevTools(game: Game): () => void {
  if (!import.meta.env.DEV) return () => undefined;
  const start = (kind: IncidentKind) => (buildingId?: number) => game.startIncident(kind, buildingId);
  window.openpolis = { game, fire: start('fire'), theft: start('theft'), illness: start('illness') };
  return () => {
    if (window.openpolis?.game === game) delete window.openpolis;
  };
}
