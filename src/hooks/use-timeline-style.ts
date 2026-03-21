'use client';

import { useState, useEffect, useCallback } from 'react';

export type TimelineStyle = 'zigzag' | 'rail' | 'stepping';

const STORAGE_KEY = 'endeavrly-timeline-style';
const VALID: TimelineStyle[] = ['zigzag', 'rail', 'stepping'];

export function useTimelineStyle() {
  const [style, setStyleState] = useState<TimelineStyle>(() => {
    if (typeof window === 'undefined') return 'zigzag';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID.includes(stored as TimelineStyle)) {
      return stored as TimelineStyle;
    }
    return 'zigzag';
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
