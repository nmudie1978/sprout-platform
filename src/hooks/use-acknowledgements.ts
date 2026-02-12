'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ACKNOWLEDGEMENT_MESSAGES,
  type AcknowledgementMessage,
} from '@/lib/acknowledgements/messages';

const STORAGE_KEY = 'sprout-acknowledgements';

/** Rolling window: max 3 acknowledgements in 7 days */
const WINDOW_DAYS = 7;
const MAX_IN_WINDOW = 3;

/** Same message cannot repeat within 30 days */
const REPEAT_COOLDOWN_DAYS = 30;

/** Auto-dismiss after 4 seconds */
const DISMISS_MS = 4_000;

interface StoredData {
  /** ISO timestamps of every acknowledgement shown */
  shownTimestamps: string[];
  /** Map of messageId → last-shown ISO timestamp */
  messageHistory: Record<string, string>;
}

function load(): StoredData {
  if (typeof window === 'undefined') return { shownTimestamps: [], messageHistory: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { shownTimestamps: [], messageHistory: {} };
    const parsed = JSON.parse(raw);
    return {
      shownTimestamps: Array.isArray(parsed.shownTimestamps) ? parsed.shownTimestamps : [],
      messageHistory: parsed.messageHistory && typeof parsed.messageHistory === 'object'
        ? parsed.messageHistory
        : {},
    };
  } catch {
    return { shownTimestamps: [], messageHistory: {} };
  }
}

function save(data: StoredData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAcknowledgements() {
  const [currentMessage, setCurrentMessage] = useState<AcknowledgementMessage | null>(null);
  const sessionCountRef = useRef(0);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const dismissAcknowledgement = useCallback(() => {
    setCurrentMessage(null);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const maybeShowAcknowledgement = useCallback(() => {
    const data = load();
    const now = new Date();

    // Gate 1: First visit — never show if no prior acknowledgements
    if (data.shownTimestamps.length === 0) return;

    // Gate 2: Max 1 per session (page reload resets)
    if (sessionCountRef.current >= 1) return;

    // Gate 3: Max 3 in rolling 7-day window
    const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const recentCount = data.shownTimestamps.filter(
      (ts) => new Date(ts) >= windowStart
    ).length;
    if (recentCount >= MAX_IN_WINDOW) return;

    // Gate 4: Filter out messages shown within 30 days
    const repeatCutoff = new Date(now.getTime() - REPEAT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    const eligible = ACKNOWLEDGEMENT_MESSAGES.filter((msg) => {
      const lastShown = data.messageHistory[msg.id];
      if (!lastShown) return true;
      return new Date(lastShown) < repeatCutoff;
    });

    if (eligible.length === 0) return;

    // Pick a random eligible message
    const picked = eligible[Math.floor(Math.random() * eligible.length)];

    // Update stored data
    const isoNow = now.toISOString();
    data.shownTimestamps.push(isoNow);
    data.messageHistory[picked.id] = isoNow;
    save(data);

    // Increment session counter
    sessionCountRef.current += 1;

    // Show it
    setCurrentMessage(picked);

    // Auto-dismiss after 4 seconds
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setCurrentMessage(null);
      dismissTimerRef.current = null;
    }, DISMISS_MS);
  }, []);

  return { currentMessage, maybeShowAcknowledgement, dismissAcknowledgement };
}
