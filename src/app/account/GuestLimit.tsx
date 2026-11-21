import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { api } from '../../save/api';
import { authAtom, authDialogAtom, gameAtom, guestSavingPausedAtom } from '../atoms';
import { GUEST_TRIAL_ON, HEARTBEAT_MS, OFFLINE_GRACE_MS, readGuestId, readNudged, writeGuestId, writeNudged } from './guestPlay';

/** "Later" on the saving-paused reminder hides it this long; then it comes back. */
const REMIND_AGAIN_MS = 10 * 60_000;

/** What the server last said about this guest's trial. */
interface TrialStatus {
  readonly state: 'ok' | 'nudge' | 'gate';
  readonly playSeconds: number;
}

/**
 * Guest trial (D-083, D-102). The server measures play from heartbeats sent while the tab is
 * visible and answers ok, nudge (a reminder they can close) or gate. At the gate play goes on, but
 * **saving stops** until the guest signs up or logs in (then the city, everything since included,
 * moves into the account), and a reminder says so, coming back every few minutes after "Later".
 * If the server can't be reached for a few minutes of play, saving stops the same way, so
 * blocking the API doesn't buy unlimited saving.
 */
export function GuestLimit({ cityName }: { cityName: string }) {
  const auth = useAtomValue(authAtom);
  const game = useAtomValue(gameAtom);
  const openDialog = useSetAtom(authDialogAtom);
  const setSavingPaused = useSetAtom(guestSavingPausedAtom);
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [offline, setOffline] = useState(false);
  const [nudged, setNudged] = useState(readNudged);
  /** The saving-paused reminder was put off until this time (ms), or 0. */
  const [remindAt, setRemindAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  // Bumped by "Try again": restarts the heartbeat loop at once.
  const [attempt, setAttempt] = useState(0);
  const counting = GUEST_TRIAL_ON && auth.status === 'guest' && !!game;

  useEffect(() => {
    if (!counting) return;
    let stopped = false;
    let unverifiedMs = 0;
    const beat = (playing: boolean) => {
      api.guestHeartbeat(readGuestId()).then(
        (r) => {
          if (stopped || r.kind !== 'guest') return;
          writeGuestId(r.guestId);
          unverifiedMs = 0;
          setOffline(false);
          setTrial({ state: r.state, playSeconds: r.playSeconds });
        },
        () => {
          if (stopped) return;
          if (playing) unverifiedMs += HEARTBEAT_MS;
          if (unverifiedMs >= OFFLINE_GRACE_MS) setOffline(true);
        },
      );
    };
    beat(false);
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') beat(true);
    }, HEARTBEAT_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') beat(false);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [counting, attempt]);

  // Past the trial (or offline too long): saving stops; signing in (counting ends) resumes it.
  const paused = counting && (offline || trial?.state === 'gate');
  useEffect(() => {
    setSavingPaused(paused);
  }, [paused, setSavingPaused]);
  useEffect(() => () => setSavingPaused(false), [setSavingPaused]);

  // Wake up when a put-off reminder is due again.
  useEffect(() => {
    if (!paused || remindAt <= Date.now()) return;
    const t = setTimeout(() => setNow(Date.now()), remindAt - Date.now());
    return () => clearTimeout(t);
  }, [paused, remindAt]);

  if (!counting) return null;

  if (paused) {
    if (remindAt > now) return null;
    const later = () => {
      const at = Date.now() + REMIND_AGAIN_MS;
      setNow(Date.now());
      setRemindAt(at);
    };
    return (
      <div className="guest-nudge is-paused" role="status">
        <span className="gate-kicker">{offline ? 'Reconnecting' : 'Saving is paused'}</span>
        {offline ? (
          <p>
            Guest play saves only while Openpolis can be reached. Keep building: <strong>{cityName}</strong> saves again the
            moment we're back.
          </p>
        ) : (
          <p>
            Guest time is up. Keep building, but changes to <strong>{cityName}</strong> from now on aren't saved. A free account
            saves it, everything since included.
          </p>
        )}
        <div className="guest-nudge-actions">
          <button type="button" className="gate-text" onClick={later}>
            Later
          </button>
          {offline ? (
            <button type="button" className="gate-small" onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </button>
          ) : (
            <button type="button" className="gate-small" onClick={() => openDialog('signup')}>
              Save my city
            </button>
          )}
        </div>
      </div>
    );
  }

  if (trial?.state !== 'nudge' || nudged) return null;
  const later = () => {
    writeNudged();
    setNudged(true);
  };
  return (
    <div className="guest-nudge" role="status">
      <span className="gate-kicker">Only in this browser</span>
      <p>
        <strong>{cityName}</strong> isn't backed up yet. A free account keeps it safe and on all your devices.
      </p>
      <div className="guest-nudge-actions">
        <button type="button" className="gate-text" onClick={later}>
          Later
        </button>
        <button type="button" className="gate-small" onClick={() => openDialog('signup')}>
          Save my city
        </button>
      </div>
    </div>
  );
}
