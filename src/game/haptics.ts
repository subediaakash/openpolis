/**
 * A short buzz on touch actions (D-100), so a finger feels a build land or get refused. Uses the
 * Vibration API where it exists (Android browsers); elsewhere (iOS Safari, desktops) it does
 * nothing. Only touch actions call it, so mouse play never buzzes.
 */
export type HapticKind = 'tap' | 'heavy' | 'error';

const PATTERNS: Readonly<Record<HapticKind, number | readonly number[]>> = {
  tap: 8,
  heavy: 18,
  error: [14, 40, 14],
};

export function haptic(kind: HapticKind): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    const pattern = PATTERNS[kind];
    navigator.vibrate(typeof pattern === 'number' ? pattern : [...pattern]);
  } catch {
    // Some browsers throw when vibration is blocked (no user gesture yet): a buzz is optional.
  }
}
