import { useAtom, useAtomValue } from 'jotai';
import { useRef } from 'react';
import { gameAtom, newspaperAtom } from '../atoms';
import { useDismiss, useOverlay } from '../overlay/overlay';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * The city newspaper (D-111): a top-bar button that lights up when a new edition is out (once a
 * month), opening it as a front page: masthead, headline, the month in numbers, the month's
 * citizen stories and a resident's opinion. "Show me" jumps to the home a story is about.
 */
export function NewspaperButton() {
  const [state, setState] = useAtom(newspaperAtom);
  const game = useAtomValue(gameAtom);
  const { open, toggle: toggleOpen, close } = useOverlay('newspaper');
  const wrap = useRef<HTMLSpanElement>(null);
  useDismiss(wrap, open, close);
  if (!state) return null;
  const { paper, read } = state;

  const toggle = () => {
    toggleOpen();
    if (!read) setState({ paper, read: true });
  };
  const show = (id: number) => {
    close();
    game?.focusBuilding(id);
  };

  return (
    <span className="paper-wrap" ref={wrap}>
      <button
        type="button"
        className={`icon-button paper-button ${open ? 'is-open' : ''}`}
        title={read ? paper.paper : `${paper.paper}: new edition`}
        aria-label={read ? paper.paper : `${paper.paper}, new edition`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
          <path d="M5 5h11v14H6a2 2 0 0 1-2-2V6M16 9h3v8a2 2 0 0 1-2 2M8 9h5M8 12h5M8 15h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {!read && <span className="paper-dot" aria-hidden="true" />}
      </button>
      {open && (
        <article className="panel paper" role="dialog" aria-label={paper.paper}>
          <header className="paper-head">
            <span className="paper-name">{paper.paper}</span>
            <span className="paper-date">
              {MONTHS[paper.month]}, year {paper.year}
            </span>
          </header>
          <h2 className="paper-headline">{paper.headline}</h2>
          <p className="paper-lead">{paper.lead}</p>
          {paper.stories.length > 0 && (
            <section className="paper-section">
              <h3 className="paper-section-title">This month</h3>
              <ul className="paper-stories">
                {paper.stories.map((s) => (
                  <li key={s.id}>
                    <span>{s.text}</span>
                    <button type="button" className="citizens-show" onClick={() => show(s.building)}>
                      Show me
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {paper.opinion && (
            <section className="paper-section paper-opinion">
              <h3 className="paper-section-title">Letters</h3>
              <blockquote>
                {paper.opinion.text}
                <cite>{paper.opinion.who}</cite>
              </blockquote>
              <button type="button" className="citizens-show" onClick={() => paper.opinion && show(paper.opinion.building)}>
                Show me
              </button>
            </section>
          )}
        </article>
      )}
    </span>
  );
}
