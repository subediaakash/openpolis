import { useAtomValue } from 'jotai';
import type { Game } from '../../game/Game';
import type { ComplaintKind, NeedsReport } from '../../sim/systems/needs';
import { cityAtom, gameAtom, happinessViewAtom } from '../atoms';
import { NEED_HINT, NEED_LABEL } from './needWords';
import { useRememberedOpen } from './useRememberedOpen';

/** A colour per complaint, matching the speech-bubble icons. */
const TONE: Readonly<Record<ComplaintKind, string>> = {
  jobs: '#c08a4f',
  shopping: '#e2574c',
  safety: '#3b6fd8',
  health: '#e23b3b',
  education: '#2f8f5b',
  hospital: '#d23b5a',
  university: '#5b4fc4',
  garbage: '#7d8a3a',
  transit: '#2f7fd6',
  research: '#22b8cf',
  commute: '#f08a24',
  traffic: '#ef6c43',
  air: '#8b9097',
  parks: '#3fa34d',
  workers: '#3b6fd8',
  customers: '#e0a514',
  abandoned: '#6f665c',
};

const OPEN_KEY = 'openpolis.citizensOpen';

/** Percentage points, never shown as 0 for a need that made the list (it costs at least half a point). */
const points = (loss: number) => Math.max(1, Math.round(loss * 100));

/**
 * "Citizens say…": the city's top complaints and requests, each with a button that shows where.
 * Always on screen as a sticky toggle (user request: it used to vanish whenever the list was
 * momentarily empty), with the complaint count and city happiness in its header.
 */
export function CitizensPanel() {
  const city = useAtomValue(cityAtom);
  const game = useAtomValue(gameAtom);
  const [open, toggle] = useRememberedOpen(OPEN_KEY);
  const mapOn = useAtomValue(happinessViewAtom);
  if (!city) return null;
  const complaints = city.needs.complaints;
  const total = complaints.reduce((n, c) => n + c.count, 0);
  return (
    <aside className={`panel citizens ${open ? 'is-open' : ''}`} aria-label="Citizens say">
      <button type="button" className="citizens-header" aria-expanded={open} onClick={toggle}>
        <span className="citizens-title">Citizens say</span>
        {total > 0 && (
          <span className="citizens-badge" aria-label={`${total} buildings complaining`}>
            {total > 999 ? '999+' : total}
          </span>
        )}
        <span className="citizens-mood">{Math.round(city.needs.happiness * 100)}% happy</span>
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" style={{ transform: open ? 'none' : 'rotate(-90deg)' }}>
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
      {open &&
        (complaints.length === 0 ? (
          <p className="citizens-empty">{city.needs.happiness < 0.995 ? 'No home is unhappy enough to complain.' : 'Nobody is complaining right now.'}</p>
        ) : (
          <ul className="citizens-list">
            {complaints.map((c) => (
              <li key={c.kind} className="citizens-item">
                <i style={{ background: TONE[c.kind] }} />
                <span className="citizens-text">
                  “{c.text}”<span className="citizens-count">{c.count}</span>
                  <span className="citizens-stats">
                    {c.stats.map((stat) => (
                      <span key={stat.label}>
                        {stat.label}: {stat.value}
                      </span>
                    ))}
                  </span>
                </span>
                <button type="button" className="citizens-show" onClick={() => game?.focusBuilding(c.building)}>
                  Show me
                </button>
              </li>
            ))}
          </ul>
        ))}
      {open && <HappinessDrags needs={city.needs} game={game} mapOn={mapOn} />}
    </aside>
  );
}

interface DragsProps {
  needs: NeedsReport;
  game: Game | null;
  mapOn: boolean;
}

/**
 * "What's holding happiness back" (D-105): the missing percentage split by need, so "86% happy"
 * always has an answer even when nobody is unhappy enough to complain. Each row opens the home
 * losing the most to that need; the map button colours every home by happiness.
 */
function HappinessDrags({ needs, game, mapOn }: DragsProps) {
  const missing = 1 - needs.happiness;
  if (missing < 0.005 || needs.drags.length === 0) return null;
  const largest = needs.drags[0].loss;
  // Needs too small to list still count, so the rows add up to the missing percentage.
  const rest = missing - needs.drags.reduce((n, d) => n + d.loss, 0);
  return (
    <section className="drags" aria-label="What's holding happiness back">
      <h3 className="drags-title">
        Holding happiness back <span className="drags-missing">−{100 - Math.round(needs.happiness * 100)}%</span>
      </h3>
      <ul className="drags-list">
        {needs.drags.map((d) => (
          <li key={d.kind} className="drag" title={NEED_HINT[d.kind]}>
            <i style={{ background: TONE[d.kind] }} />
            <span className="drag-body">
              <span className="drag-head">
                <span className="drag-name">{NEED_LABEL[d.kind]}</span>
                <span className="drag-loss">−{points(d.loss)}%</span>
              </span>
              <span className="meter drag-meter" aria-hidden="true">
                <span className="meter-fill" style={{ width: `${Math.round((d.loss / largest) * 100)}%` }} />
              </span>
              <span className="drag-homes">
                short in {d.homes.toLocaleString()} {d.homes === 1 ? 'home' : 'homes'}
              </span>
            </span>
            <button type="button" className="citizens-show" aria-label={`Show the home losing most to ${NEED_LABEL[d.kind].toLowerCase()}`} onClick={() => game?.focusBuilding(d.building)}>
              Show me
            </button>
          </li>
        ))}
        {rest >= 0.005 && (
          <li className="drag is-rest">
            <i />
            <span className="drag-body">
              <span className="drag-head">
                <span className="drag-name">Small things</span>
                <span className="drag-loss">−{points(rest)}%</span>
              </span>
            </span>
          </li>
        )}
      </ul>
      <button type="button" className="drags-map" aria-pressed={mapOn} onClick={() => game?.setHappinessView(!mapOn)}>
        {mapOn ? 'Hide happiness map' : 'Happiness map'}
      </button>
    </section>
  );
}
