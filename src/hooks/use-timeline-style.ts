'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Roadmap layout styles. Zigzag was dropped in Apr 2026 — the rail
 * and stepping renderers now cover every use case. Anything stored
 * under the legacy 'zigzag' value silently migrates to 'rail' on the
 * next load so existing users don't lose their choice, they just
 * land on the new default.
 */
export type TimelineStyle = 'rail' | 'stepping';

const STORAGE_KEY = 'endeavrly-timeline-style';
const DEFAULT: TimelineStyle = 'rail';
const VALID: TimelineStyle[] = ['rail', 'stepping'];

export function useTimelineStyle() {
  const [style, setStyleState] = useState<TimelineStyle>(() => {
    if (typeof window === 'undefined') return DEFAULT;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID.includes(stored as TimelineStyle)) {
      return stored as TimelineStyle;
    }
    return DEFAULT;
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
