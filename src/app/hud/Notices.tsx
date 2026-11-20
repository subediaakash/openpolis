import { useAtom, useAtomValue } from 'jotai';
import type { Notice } from '../../game/events';
import { gameAtom, noticesAtom } from '../atoms';

/**
 * Short-lived toasts. Errors never block the world (docs/04-ui-ux.md): they fade by themselves,
 * a tap dismisses one early, and the ones worth keeping wait in the alerts inbox (the bell).
 * A toast about a place (a fire) takes the camera there when tapped.
 */
export function Notices() {
  const [notices, setNotices] = useAtom(noticesAtom);
  const game = useAtomValue(gameAtom);
  const open = (n: Notice) => {
    if (n.focus !== undefined) game?.focusBuilding(n.focus);
    setNotices((list) => list.filter((x) => x.id !== n.id));
  };
  return (
    <div className="notices" aria-live="polite">
      {notices.map((n) => (
        <button
          key={n.id}
          type="button"
          className={`panel notice notice-${n.kind} ${n.focus !== undefined ? 'has-focus' : ''}`}
          title={n.focus !== undefined ? 'Show me' : 'Dismiss'}
          onClick={() => open(n)}
        >
          {n.message}
          {n.focus !== undefined && <span className="notice-show">Show ›</span>}
        </button>
      ))}
    </div>
  );
}
