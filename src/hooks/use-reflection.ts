"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type SaveStatus = "idle" | "saving" | "saved";

/**
 * Manages a single reflection note per career + phase.
 *
 * Persistence: localStorage keyed by `reflection-{careerSlug}-{phase}`.
 * Auto-saves on a 600ms debounce after typing stops, on blur, and on unmount.
 */
export function useReflection(careerSlug: string | null, phase: string) {
  const storageKey =
    careerSlug && phase ? `reflection-${careerSlug}-${phase}` : null;

  const [content, setContent] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const latestRef = useRef(content);
  const savedRef = useRef(content);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage when key changes
  useEffect(() => {
    if (!storageKey) {
      setContent("");
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      const initial = stored ?? "";
      setContent(initial);
      latestRef.current = initial;
      savedRef.current = initial;
      setStatus("idle");
    } catch {
      setContent("");
    }
  }, [storageKey]);

  const persist = useCallback(() => {
    if (!storageKey) return;
    const value = latestRef.current;
    if (value === savedRef.current) return;
    try {
      if (value.trim()) {
        localStorage.setItem(storageKey, value);
      } else {
        localStorage.removeItem(storageKey);
      }
      savedRef.current = value;
      setStatus("saved");
    } catch {
      /* quota exceeded — silent */
    }
  }, [storageKey]);

  const update = useCallback(
    (value: string) => {
      setContent(value);
      latestRef.current = value;
      setStatus("saving");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        persist();
      }, 600);
    },
    [persist]
  );

  // Save on blur
  const onBlur = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    persist();
  }, [persist]);

  // Save on unmount / key change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // Persist whatever is latest at teardown
      if (storageKey && latestRef.current !== savedRef.current) {
        try {
          const v = latestRef.current;
          if (v.trim()) localStorage.setItem(storageKey, v);
          else localStorage.removeItem(storageKey);
        } catch {
          /* silent */
        }
      }
    };
  }, [storageKey]);

  return { content, update, onBlur, status };
}
