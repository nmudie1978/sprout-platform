'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Roadmap layout styles.
 *
 *  • 'winding'         — Winding Road (DEFAULT): a road that snakes
 *                        left→right with a milestone card on each bend.
 *  • 'stepping-stones' — Stepping Stones: a calm row of connected stones.
 *
 * Legacy values migrate silently so existing users keep a sensible choice:
 *   'rail'    → 'winding'          (both were the horizontal default)
 *   'stepping'→ 'stepping-stones'  (both were the alternative)
 *   'zigzag'  → 'winding'          (dropped long ago)
 */
export type TimelineStyle = 'winding' | 'stepping-stones';

const STORAGE_KEY = 'endeavrly-timeline-style';
// Hard rule: the roadmap always DEFAULTS to the Winding Road view. (A user can
// still switch to Stepping Stones via the toggle; that explicit choice is
// remembered. With no stored choice — new users, cleared storage, legacy
// values — the roadmap opens on Winding Road.)
const DEFAULT: TimelineStyle = 'winding';
const VALID: TimelineStyle[] = ['winding', 'stepping-stones'];

const LEGACY_MAP: Record<string, TimelineStyle> = {
  rail: 'winding',
  zigzag: 'winding',
  stepping: 'stepping-stones',
};

function resolveStored(stored: string | null): TimelineStyle {
  if (!stored) return DEFAULT;
  if (VALID.includes(stored as TimelineStyle)) return stored as TimelineStyle;
  return LEGACY_MAP[stored] ?? DEFAULT;
}

export function useTimelineStyle() {
  const [style, setStyleState] = useState<TimelineStyle>(() => {
    if (typeof window === 'undefined') return DEFAULT;
    return resolveStored(localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, style);
    }
  }, [style]);

  const setStyle = useCallback((s: TimelineStyle) => {
    if (VALID.includes(s)) setStyleState(s);
  }, []);

  return { style, setStyle };
}
