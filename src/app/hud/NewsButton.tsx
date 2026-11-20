import { useAtomValue } from 'jotai';
import { useRef } from 'react';
import type { Story, StorySection } from '../../game/news/newsroom';
import { gameAtom, newsAtom } from '../atoms';
import { useDismiss, useOverlay } from '../overlay/overlay';

const SECTION: Readonly<Record<StorySection, string>> = {
  milestone: 'Milestone',
  trouble: 'Trouble',
  life: 'City life',
  review: 'Week in review',
};

const PAPER = (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
    <path d="M5 5h11v14H6a1 1 0 0 1-1-1V5zM16 9h3v9a1 1 0 0 1-2 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M8 9h5M8 12h5M8 15h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * The city newspaper (docs/specs/news.md): a button by the alerts bell with a dot for unread
 * stories, opening The {City} Courier, the lead story first. Opening it marks everything read.
 */
export function NewsButton() {
  const news = useAtomValue(newsAtom);
  const game = useAtomValue(gameAtom);
  const { open, toggle: toggleMenu, close } = useOverlay('news');
  const wrap = useRef<HTMLSpanElement>(null);
  useDismiss(wrap, open, close);
  if (!news) return null;
  const toggle = () => {
    if (!open) game?.markNewsRead();
    toggleMenu();
  };
  const show = (s: Story) => {
    if (s.focus === null) return;
    game?.focusBuilding(s.focus);
    close();
  };
  const [lead, ...rest] = news.stories;
  return (
    <span className="news-wrap" ref={wrap}>
      <button
        type="button"
        className={`icon-button news-button ${open ? 'is-open' : ''}`}
        title={news.unread > 0 ? `${news.paper}: ${news.unread} new` : news.paper}
        aria-label={news.unread > 0 ? `${news.paper}, ${news.unread} new stories` : news.paper}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        {PAPER}
        {news.unread > 0 && <span className="news-dot" aria-hidden="true" />}
      </button>
      {open && (
        <span className="news-menu" role="dialog" aria-label={news.paper}>
          <span className="news-masthead">
            <span className="news-title">{news.paper}</span>
            <span className="news-dateline">{lead ? lead.date : ''}</span>
          </span>
          {lead ? (
            <span className="news-body">
              <StoryView story={lead} lead onShow={show} />
              {rest.map((s) => (
                <StoryView key={s.id} story={s} onShow={show} />
              ))}
            </span>
          ) : (
            <span className="news-empty">No news yet. Build something worth writing about.</span>
          )}
        </span>
      )}
    </span>
  );
}

function StoryView({ story: s, lead, onShow }: { story: Story; lead?: boolean; onShow: (s: Story) => void }) {
  return (
    <article className={`news-story section-${s.section} ${lead ? 'is-lead' : ''}`}>
      <span className="news-kicker">
        {SECTION[s.section]}
        {!lead && <span className="news-story-date"> · {s.date}</span>}
      </span>
      <h3 className="news-headline">{s.headline}</h3>
      <p className="news-text">{s.body}</p>
      {s.quote && (
        <blockquote className="news-quote">
          “{s.quote.text}”<cite>{s.quote.by}</cite>
        </blockquote>
      )}
      {s.focus !== null && (
        <button type="button" className="news-show" onClick={() => onShow(s)}>
          Show on the map ›
        </button>
      )}
    </article>
  );
}
