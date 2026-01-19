"use client";

import { useState, useEffect, useCallback } from "react";

export type ViewMode = "grid" | "list" | "compact";

interface UseViewModeOptions {
  storageKey: string;
  defaultMode?: ViewMode;
}

/**
 * Hook for managing view mode state with localStorage persistence.
 * Used for consistent view mode handling across different pages (Jobs, Careers, etc.)
 */
export function useViewMode({ storageKey, defaultMode = "grid" }: UseViewModeOptions) {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // Initialize from localStorage if available (client-side only)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored && isValidViewMode(stored)) {
        return stored as ViewMode;
      }
    }
    return defaultMode;
  });

  // Persist to localStorage when view mode changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, viewMode);
    }
  }, [viewMode, storageKey]);

  const setViewMode = useCallback((mode: ViewMode) => {
    if (isValidViewMode(mode)) {
      setViewModeState(mode);
    }
  }, []);

  return { viewMode, setViewMode };
}

function isValidViewMode(mode: string): mode is ViewMode {
  return mode === "grid" || mode === "list" || mode === "compact";
}
