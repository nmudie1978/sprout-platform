'use client';

import { useState, useCallback } from 'react';

/**
 * Roadmap layout styles. Zigzag was dropped in Apr 2026 — the rail
 * and stepping renderers now cover every use case.
 *
 * Default is 'rail'. IMPORTANT: the previous version auto-persisted the
 * default to localStorage on every render, so every existing user had
 * 'stepping' written even though they never chose it — which made changing
 * the default a no-op. We fix that two ways: (1) bump the storage key to v2 so
 * those auto-written values are ignored, and (2) persist ONLY when the user
 * explicitly toggles. So the default now genuinely behaves like a default for
 * everyone, and a real preference still sticks once set.
 */
export type TimelineStyle = 'rail' | 'stepping';

const STORAGE_KEY = 'endeavrly-timeline-style-v2';
const DEFAULT: TimelineStyle = 'rail';
const VALID: TimelineStyle[] = ['rail', 'stepping'];

export function useTimelineStyle() {
  const [style, setStyleState] = useState<TimelineStyle>(() => {
    if (typeof window === 'undefined') return DEFAULT;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && VALID.includes(stored as TimelineStyle)
      ? (stored as TimelineStyle)
      : DEFAULT;
  });

  // Persist only on an explicit user choice — never auto-write the default.
  const setStyle = useCallback((s: TimelineStyle) => {
    if (!VALID.includes(s)) return;
    setStyleState(s);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, s);
  }, []);

  return { style, setStyle };
}
