import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GoalInfo } from '../../game/events';
import type { GoalId } from '../../sim/goals/catalog';
import { cityAtom, gameAtom, goalsOpenAtom } from '../atoms';
import { StageRing } from './StageChip';
import { useRememberedOpen } from './useRememberedOpen';

const OPEN_KEY = 'openpolis.goalsOpen';
/** How long a claimed row takes to fold away (matches `goal-leave` in app.css). */
const LEAVE_MS = 420;

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

const FLAG = (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M5 21V4m0 0h11l-2 4 2 4H5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CHECK = (
  <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true">
    <circle cx="9" cy="9" r="8" fill="currentColor" />
    <path d="M5.2 9.3l2.4 2.4 5-5" fill="none" stroke="var(--bg-app)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LANDMARK = (
  <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
    <path d="M12 2l2.6 6.3 6.8.5-5.2 4.4 1.6 6.6L12 16.3 6.2 19.8l1.6-6.6L2.6 8.8l6.8-.5z" fill="currentColor" />
  </svg>
);

/**
 * Rows the player just claimed stay a moment to fold away, so the list doesn't jump. Returns
 * the claimed snapshots still leaving, and a claim that records one.
 */
function useLeavingRows(onClaim: (id: GoalId) => void) {
  const [leaving, setLeaving] = useState<readonly GoalInfo[]>([]);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const claim = useCallback(
    (goal: GoalInfo) => {
      setLeaving((rows) => [...rows, goal]);
      onClaim(goal.id);
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        setLeaving((rows) => rows.filter((r) => r.id !== goal.id));
      }, LEAVE_MS);
      timers.current.add(timer);
    },
    [onClaim],
  );
  return { leaving, claim };
}

/**
 * City goals (docs/specs/goals.md): what to aim for at this stage, with progress and rewards.
 * Sits under "Citizens say" in the left rail and folds the same way. Ready goals rise to the top
 * with a Claim button; the header counts them so a folded panel still says when to look.
 */
export function GoalsPanel() {
  const city = useAtomValue(cityAtom);
  const game = useAtomValue(gameAtom);
  const [open, toggle] = useRememberedOpen(OPEN_KEY);
  const onClaim = useCallback((id: GoalId) => game?.claimGoal(id), [game]);
  const { leaving, claim } = useLeavingRows(onClaim);
  const goals = city?.goals;
  // Tell the toasts when the panel is open on screen, so goal toasts don't repeat it (D-105).
  const setOpenOnScreen = useSetAtom(goalsOpenAtom);
  const shown = open && !!goals;
  useEffect(() => {
    setOpenOnScreen(shown);
    return () => setOpenOnScreen(false);
  }, [shown, setOpenOnScreen]);
  if (!city || !goals) return null;

  const activeIds = new Set(goals.active.map((g) => g.id));
  // The hint shows on the next goal to work on; the others keep it as a tooltip, so the panel stays short.
  const focus = goals.active.find((g) => g.status === 'open')?.id ?? null;
  const rows = [...leaving.filter((g) => !activeIds.has(g.id)), ...goals.active];
  const label = goals.ready > 0 ? `Goals, ${goals.ready} ready to claim` : `Goals, ${goals.claimed} of ${goals.total} done`;

  return (
    <aside className={`panel goals ${open ? 'is-open' : ''} ${goals.ready > 0 ? 'has-ready' : ''}`} aria-label="Goals">
      <button type="button" className="goals-header" aria-expanded={open} aria-label={label} onClick={toggle}>
        <span className="goals-flag">{FLAG}</span>
        <span className="goals-title">Goals</span>
        {goals.ready > 0 ? (
          <span className="goals-badge">{goals.ready} to claim</span>
        ) : (
          <span className="goals-count">
            {goals.claimed} / {goals.total}
          </span>
        )}
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" style={{ transform: open ? 'none' : 'rotate(-90deg)' }}>
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
      {open &&
        (rows.length === 0 ? (
          <p className="goals-empty">{city.progress.next ? `Every goal so far is done. New ones arrive at ${city.progress.next.name}.` : 'Every goal is done. Congratulations, mayor!'}</p>
        ) : (
          <ul className="goals-list">
            {rows.map((g) => (
              <GoalRow key={g.id} goal={g} leaving={!activeIds.has(g.id)} focused={g.id === focus} onClaim={claim} />
            ))}
          </ul>
        ))}
    </aside>
  );
}

interface GoalRowProps {
  goal: GoalInfo;
  /** Claimed a moment ago: folding away. */
  leaving: boolean;
  /** The next goal to work on: shows its hint. */
  focused: boolean;
  onClaim: (g: GoalInfo) => void;
}

function GoalRow({ goal: g, leaving, focused, onClaim }: GoalRowProps) {
  const ready = g.status === 'ready' || leaving;
  const unlock = g.reward.unlock && (
    <span className="goal-unlock">
      {LANDMARK} Unlocks {g.reward.unlock} early
    </span>
  );
  return (
    <li className={`goal ${ready ? 'is-ready' : ''} ${leaving ? 'is-leaving' : ''}`} title={ready || focused ? undefined : g.hint}>
      <span className="goal-mark">{ready ? CHECK : <StageRing progress={g.have} />}</span>
      <span className="goal-body">
        <span className="goal-title">{g.title}</span>
        {ready ? (
          <span className="goal-detail">Complete! Your reward is waiting.</span>
        ) : (
          <>
            <span className="goal-detail">{g.detail}</span>
            <span className="meter goal-meter" aria-hidden="true">
              <span className="meter-fill" style={{ width: `${Math.round(g.have * 100)}%` }} />
            </span>
            {focused && <span className="goal-hint">{g.hint}</span>}
          </>
        )}
        {unlock}
      </span>
      {ready ? (
        <button type="button" className="goal-claim" disabled={leaving} aria-label={`Claim ${g.title}: ${money(g.reward.funds)}`} onClick={() => onClaim(g)}>
          <span>{leaving ? 'Claimed' : 'Claim'}</span>
          <span className="goal-claim-amount">+{money(g.reward.funds)}</span>
        </button>
      ) : (
        <span className="goal-money">+{money(g.reward.funds)}</span>
      )}
    </li>
  );
}
