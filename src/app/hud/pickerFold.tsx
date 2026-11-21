import { useState, type ReactNode } from 'react';
import { SMALL_UI, useMedia } from '../mobile/useMedia';

export interface PickerFold {
  /** A phone layout, where the picker folds away once something is chosen. */
  readonly small: boolean;
  /** Folded to a chip showing the choice. */
  readonly folded: boolean;
  /** Something was chosen: on phones, fold so the map is free to place it. */
  chosen: () => void;
  unfold: () => void;
}

/**
 * Phones (D-097): a picker is for choosing, the map is for placing. Once the player picks a
 * building or road type the picker folds into a chip ("Park $100 · Change · ✕"); ✕ puts the
 * tool away and closes it (D-100). Mount the hook inside a component that mounts when its tool
 * is picked, so every visit starts unfolded.
 */
export function usePickerFold(): PickerFold {
  const small = useMedia(SMALL_UI);
  const [folded, setFolded] = useState(false);
  return {
    small,
    folded: small && folded,
    chosen: () => setFolded(true),
    unfold: () => setFolded(false),
  };
}

interface PickerChipProps {
  /** `building-picker` or `road-picker`: the chip sits where the picker was. */
  kind: 'building-picker' | 'road-picker';
  picture: ReactNode;
  name: string;
  cost: string;
  onChange: () => void;
  /** Stop placing: back to Select, picker closed. */
  onClose: () => void;
}

/** The folded picker: what's chosen, its price, and a button to choose again. */
export function PickerChip({ kind, picture, name, cost, onChange, onClose }: PickerChipProps) {
  return (
    <div className={`panel ${kind} is-chip`} role="status" aria-label={`Placing ${name}`}>
      <span className="chip-picture" aria-hidden="true">
        {picture}
      </span>
      <span className="chip-what">
        <strong>{name}</strong>
        <span className="card-cost">{cost}</span>
      </span>
      <button type="button" className="chip-change" onClick={onChange}>
        Change
      </button>
      <button
        type="button"
        className="chip-close"
        aria-label={`Stop placing ${name}`}
        onClick={onClose}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
