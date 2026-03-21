'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 639;

/**
 * Responsive hook for timeline layout direction.
 * Returns { isVertical: true } below 640px.
 */
export function useTimelineLayout() {
  const [isVertical, setIsVertical] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsVertical(e.matches);
    };

    // Set initial value
    handleChange(mql);

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return { isVertical };
}
