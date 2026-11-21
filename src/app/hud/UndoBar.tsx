import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { gameAtom, undoAtom } from '../atoms';

/** How long the bar offers the undo before the action simply stays. */
const UNDO_MS = 6000;

/**
 * After a touch action (D-100): what was done and what it cost, with Undo. Replaces D-080's
 * Build / Cancel bar, so a finger builds on release and only a mistake costs a second tap.
 * It goes by itself after a few seconds; a new action replaces it.
 */
export function UndoBar() {
  const game = useAtomValue(gameAtom);
  const offer = useAtomValue(undoAtom);

  useEffect(() => {
    if (!offer || !game) return;
    const timer = setTimeout(() => game.dismissUndo(), UNDO_MS);
    return () => clearTimeout(timer);
  }, [offer, game]);

  if (!offer || !game) return null;
  return (
    <div key={offer.id} className="panel undo-bar" role="status" aria-live="polite">
      <span className="undo-what">
        <span className="undo-label">{offer.label}</span>
        {offer.cost > 0 && <span className="cost-dim">${offer.cost.toLocaleString()}</span>}
      </span>
      <button type="button" className="undo-button" onClick={() => game.undo()}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path
            d="M7.5 5 3.5 9l4 4M4 9h7.5a4.5 4.5 0 0 1 0 9H9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Undo
      </button>
      <span
        className="undo-timer"
        style={{ animationDuration: `${UNDO_MS}ms` }}
        aria-hidden="true"
      />
    </div>
  );
}
