"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if a media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}

/**
 * Convenience hook for mobile detection (max-width: 640px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 640px)");
}

/**
 * Convenience hook for tablet detection (max-width: 768px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery("(max-width: 768px)");
}
