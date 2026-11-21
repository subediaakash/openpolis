import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, type PointerEvent } from 'react';
import {
  minimapToViewTile,
  paintMinimap,
  viewTileToMinimap,
  type MinimapLayout,
} from '../../render/minimap';
import { gameAtom, worldVersionAtom } from '../atoms';
import { COMPACT, PHONE, useMedia } from '../mobile/useMedia';

const SHOWN_KEY = 'openpolis.minimapOnPhone';

/** The player's choice, else: shown on tablets, hidden on phones. */
function readShown(): boolean {
  const byDefault = !window.matchMedia('(max-width: 640px)').matches;
  try {
    const saved = localStorage.getItem(SHOWN_KEY);
    return saved === null ? byDefault : saved === '1';
  } catch {
    return byDefault;
  }
}

const shownBaseAtom = atom(readShown());

/**
 * Whether phones show the minimap (D-097, D-100): off at first on upright phones, since it covers
 * a lot of a small screen. Its − button folds it into a small map button (and the More sheet
 * toggles it on upright screens); the choice is remembered. Desktop layouts always show it.
 */
export const minimapShownAtom = atom(
  (get) => get(shownBaseAtom),
  (_get, set, on: boolean) => {
    set(shownBaseAtom, on);
    try {
      localStorage.setItem(SHOWN_KEY, on ? '1' : '0');
    } catch {
      // Not remembered this time.
    }
  },
);

const W = 208;
const H = 112;
/** Repaint the map at most this often (ms); the viewport quad updates every frame. */
const REPAINT_MS = 250;

/** Bottom-right overview of the whole city: click or drag to move the camera. */
export function Minimap() {
  const phone = useMedia(PHONE);
  const compact = useMedia(COMPACT);
  const [shown, setShown] = useAtom(minimapShownAtom);
  const foldable = phone || compact;
  if (foldable && !shown) {
    return (
      <button
        type="button"
        className="panel minimap-pill"
        aria-label="Show the minimap"
        onClick={() => setShown(true)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3z" />
            <path d="M9 4v13M15 7v13" />
          </g>
        </svg>
      </button>
    );
  }
  return <MinimapView onFold={foldable ? () => setShown(false) : null} />;
}

function MinimapView({ onFold }: { onFold: (() => void) | null }) {
  const game = useAtomValue(gameAtom);
  const version = useAtomValue(worldVersionAtom);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);
  const layout = useRef<MinimapLayout | null>(null);
  const lastPaint = useRef(0);
  const dragging = useRef(false);

  // Repaint the map when the world changes (throttled).
  useEffect(() => {
    const canvas = mapRef.current;
    if (!game || !canvas) return;
    const paint = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      layout.current = paintMinimap(ctx, game.world, game.view, W * dpr, H * dpr);
      lastPaint.current = performance.now();
    };
    const wait = REPAINT_MS - (performance.now() - lastPaint.current);
    if (wait <= 0) {
      paint();
      return;
    }
    const t = setTimeout(paint, wait);
    return () => clearTimeout(t);
  }, [game, version]);

  // Viewport quad, every frame.
  useEffect(() => {
    const canvas = viewRef.current;
    if (!game || !canvas) return;
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const ctx = canvas.getContext('2d');
      const l = layout.current;
      if (!ctx || !l) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== W * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = game.viewportTiles().map((p) => viewTileToMinimap(l, p));
      ctx.beginPath();
      pts.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.25 * dpr;
      ctx.stroke();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [game]);

  const jump = (e: PointerEvent<HTMLCanvasElement>) => {
    const l = layout.current;
    if (!game || !l) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dpr = e.currentTarget.width / r.width;
    const p = minimapToViewTile(l, (e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr);
    const v = game.view;
    game.lookAt({ x: Math.min(v.viewW, Math.max(0, p.x)), y: Math.min(v.viewH, Math.max(0, p.y)) });
  };

  if (!game) return null;
  return (
    <div className="panel minimap" aria-label="Minimap: click to move the camera">
      <canvas ref={mapRef} className="minimap-map" style={{ width: W, height: H }} />
      <canvas
        ref={viewRef}
        className="minimap-view"
        style={{ width: W, height: H }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          jump(e);
        }}
        onPointerMove={(e) => dragging.current && jump(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      />
      {onFold && (
        <button
          type="button"
          className="minimap-fold"
          aria-label="Minimise the minimap"
          onClick={onFold}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
