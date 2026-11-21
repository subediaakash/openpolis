import { useAtomValue } from 'jotai';
import type { ToolPreviewInfo } from '../../game/events';
import { isRoadTool, isZoneTool, ROAD_TOOLS } from '../../game/tools';
import { toolPreviewAtom } from '../atoms';
import { TOUCH, useMedia } from '../mobile/useMedia';
import { ROAD_SPECS } from '../../sim/roadTypes';

const CURSOR_GAP = 18;
/** Space the label needs before it flips to the other side of the cursor. */
const LABEL_ROOM_X = 220;
const LABEL_ROOM_Y = 60;
/** On touch, the label rides this far above the finger, which would hide it (D-101). */
const FINGER_CLEARANCE = 64;

function verbFor(p: ToolPreviewInfo): string {
  return (
    p.label ??
    (p.tool === 'clear'
      ? 'Clear'
      : isRoadTool(p.tool)
        ? ROAD_SPECS[ROAD_TOOLS[p.tool]].name
        : 'Build')
  );
}

/** Follows the cursor during a drag: what the action costs and how many tiles it touches. */
export function CostLabel() {
  const p = useAtomValue(toolPreviewAtom);
  const touch = useMedia(TOUCH);
  if (!p) return null;

  const verb = verbFor(p);
  const empty = p.count === 0;
  // Flip to the other side of the cursor near the right/bottom edges so the label never clips.
  const flipX = p.screen.x > window.innerWidth - LABEL_ROOM_X;
  const flipY = p.screen.y > window.innerHeight - LABEL_ROOM_Y;
  let dx = flipX ? `calc(${p.screen.x - CURSOR_GAP}px - 100%)` : `${p.screen.x + CURSOR_GAP}px`;
  let dy = flipY ? `calc(${p.screen.y - CURSOR_GAP}px - 100%)` : `${p.screen.y + CURSOR_GAP}px`;
  if (touch) {
    // Centred above the fingertip, kept on screen; below it only when there's no room above.
    const half = Math.min(LABEL_ROOM_X / 2, window.innerWidth / 2 - 8);
    const x = Math.max(8 + half, Math.min(window.innerWidth - 8 - half, p.screen.x));
    dx = `calc(${x}px - 50%)`;
    dy =
      p.screen.y > FINGER_CLEARANCE + LABEL_ROOM_Y
        ? `calc(${p.screen.y - FINGER_CLEARANCE}px - 100%)`
        : `${p.screen.y + FINGER_CLEARANCE}px`;
  }
  return (
    <div
      className={`cost-label ${p.affordable && !p.blocked ? '' : 'is-unaffordable'}`}
      style={{ transform: `translate(${dx}, ${dy})` }}
    >
      <span className="cost-verb">{verb}</span>
      {p.note && <span className="cost-note">{p.note}</span>}
      {p.blocked ? (
        <span className="cost-dim">can't build here</span>
      ) : empty ? (
        <span className="cost-dim">
          nothing to {p.tool === 'clear' ? 'clear' : isZoneTool(p.tool) ? 'zone' : 'build'}
        </span>
      ) : p.tool === 'build' ? (
        <span className="cost-value">${p.cost.toLocaleString()}</span>
      ) : (
        <>
          <span className="cost-value">
            {p.cost === 0 ? 'Free' : `$${p.cost.toLocaleString()}`}
          </span>
          <span className="cost-dim">
            {p.count} tile{p.count === 1 ? '' : 's'}
          </span>
        </>
      )}
    </div>
  );
}
