"use client";

/**
 * DiscoveryNudge — A gentle, sparse suggestion based on the user's
 * Career Radar preferences.
 *
 * Design:
 *   - Appears once per session after a random 20-30 min delay
 *   - Auto-fades after 8 seconds if not interacted with
 *   - Dismissible with X — never returns that session
 *   - Links to a specific career the user hasn't explored yet
 *   - Calm, non-intrusive, youth-friendly tone
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DiscoveryPreferences } from "@/lib/career-pathways";
import { getCareersFromDiscovery } from "@/lib/career-pathways";
import { SUBJECT_LABELS, WORK_STYLE_LABELS } from "@/lib/matching/config";

// ── Timing ────────────────────────────────────────────────────────

const MIN_DELAY_MS = 20 * 60 * 1000; // 20 minutes
const MAX_DELAY_MS = 30 * 60 * 1000; // 30 minutes
const AUTO_DISMISS_MS = 8000;         // 8 seconds visible
const FADE_MS = 500;                  // fade animation duration

// ── Nudge templates ───────────────────────────────────────────────

interface NudgeContent {
  emoji: string;
  text: string;
  careerId: string;
  careerTitle: string;
}

function pickNudge(
  prefs: DiscoveryPreferences,
  seenIds: Set<string>,
): NudgeContent | null {
  // Get top-matching careers from the engine
  const careers = getCareersFromDiscovery(prefs, 30);
  if (!careers.length) return null;

  // Filter out careers the user has already been nudged about
  const unseen = careers.filter((c) => !seenIds.has(c.id));
  if (!unseen.length) return null;

  // Pick a random career from the top 10 (not always #1 — keeps it fresh)
  const pool = unseen.slice(0, Math.min(10, unseen.length));
  const career = pool[Math.floor(Math.random() * pool.length)];

  // Build the nudge text based on the user's strongest preference
  const text = buildNudgeText(prefs, career.title);

  return {
    emoji: career.emoji,
    text,
    careerId: career.id,
    careerTitle: career.title,
  };
}

function buildNudgeText(prefs: DiscoveryPreferences, careerTitle: string): string {
  const templates: string[] = [];

  // Subject-based templates
  if (prefs.subjects?.length) {
    const randomSubject = prefs.subjects[Math.floor(Math.random() * prefs.subjects.length)];
    const label = SUBJECT_LABELS[randomSubject] || randomSubject;
    templates.push(
      `You enjoy ${label} — have you looked at ${careerTitle}?`,
      `Your interest in ${label} could lead somewhere interesting. What about ${careerTitle}?`,
    );
  }

  // Work style-based templates
  if (prefs.workStyles?.length) {
    const style = prefs.workStyles[0];
    const label = WORK_STYLE_LABELS[style]?.toLowerCase() || style;
    templates.push(
      `Since you like ${label} work, ${careerTitle} might interest you`,
    );
  }

  // General templates (always available)
  templates.push(
    `Based on what you like, ${careerTitle} could be worth exploring`,
    `Here's one you might not have considered — ${careerTitle}`,
  );

  return templates[Math.floor(Math.random() * templates.length)];
}

// ── Storage ───────────────────────────────────────────────────────

const SESSION_KEY = "discovery-nudge-shown";
const SEEN_CAREERS_KEY = "discovery-nudge-seen-careers";

function hasShownThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markShownThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch { /* noop */ }
}

function getSeenCareerIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_CAREERS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function addSeenCareerId(id: string): void {
  try {
    const seen = getSeenCareerIds();
    seen.add(id);
    // Keep max 50 seen careers to avoid unbounded storage
    const arr = [...seen].slice(-50);
    localStorage.setItem(SEEN_CAREERS_KEY, JSON.stringify(arr));
  } catch { /* noop */ }
}

// ── Component ─────────────────────────────────────────────────────

interface DiscoveryNudgeProps {
  preferences: DiscoveryPreferences | null | undefined;
  primaryGoal?: string | null;
  className?: string;
}

export function DiscoveryNudge({
  preferences,
  primaryGoal,
  className,
}: DiscoveryNudgeProps) {
  const [nudge, setNudge] = useState<NudgeContent | null>(null);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const dismissedRef = useRef(false);

  const hasPrefs = useMemo(() => {
    if (!preferences) return false;
    return (
      (preferences.subjects?.length ?? 0) > 0 ||
      (preferences.workStyles?.length ?? 0) > 0
    );
  }, [preferences]);

  // Schedule the nudge on mount
  useEffect(() => {
    if (!hasPrefs || !preferences) return;
    if (hasShownThisSession()) return;

    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

    timerRef.current = setTimeout(() => {
      if (dismissedRef.current) return;

      const seenIds = getSeenCareerIds();
      const picked = pickNudge(preferences, seenIds);
      if (!picked) return;

      setNudge(picked);
      setVisible(true);
      markShownThisSession();
      addSeenCareerId(picked.careerId);

      // Auto-dismiss after 8 seconds
      fadeTimerRef.current = setTimeout(() => {
        handleFadeOut();
      }, AUTO_DISMISS_MS);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPrefs]);

  const handleFadeOut = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      setNudge(null);
    }, FADE_MS);
  }, []);

  const handleDismiss = useCallback(() => {
    dismissedRef.current = true;
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    handleFadeOut();
  }, [handleFadeOut]);

  const handleExplore = useCallback(() => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    // Don't fade out — let navigation handle it
  }, []);

  if (!visible || !nudge) return null;

  return (
    <div
      className={cn(
        "relative max-w-md mx-auto rounded-xl border border-border/30 bg-card/80 backdrop-blur-sm px-4 py-3 shadow-sm transition-opacity",
        fading ? "opacity-0" : "opacity-100",
        className,
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Career emoji */}
        <span className="text-lg shrink-0 mt-0.5" aria-hidden>
          {nudge.emoji}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {nudge.text}
          </p>
          <Link
            href={`/careers?highlight=${nudge.careerId}`}
            onClick={handleExplore}
            className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-teal-500 hover:text-teal-400 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            Explore {nudge.careerTitle}
          </Link>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-md hover:bg-muted/30 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
          aria-label="Dismiss suggestion"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
