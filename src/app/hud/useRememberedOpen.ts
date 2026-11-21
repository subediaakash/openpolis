import { useCallback, useState } from 'react';
import { SMALL_UI } from '../mobile/useMedia';

/** Open or closed as last left on this device; with nothing saved, folded on small screens. */
function initialOpen(key: string): boolean {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) return saved === '1';
  } catch {
    // Storage blocked (private mode): fall back to the screen-size default.
  }
  return !window.matchMedia(SMALL_UI).matches;
}

/**
 * A side panel's open state, remembered per device under `key` (Citizens say, Goals). Returns
 * the state and a toggle that saves it.
 */
export function useRememberedOpen(key: string): readonly [open: boolean, toggle: () => void] {
  const [open, setOpen] = useState(() => initialOpen(key));
  const toggle = useCallback(
    () =>
      setOpen((was) => {
        try {
          localStorage.setItem(key, was ? '0' : '1');
        } catch {
          // Not remembered this time; the panel still toggles.
        }
        return !was;
      }),
    [key],
  );
  return [open, toggle] as const;
}
