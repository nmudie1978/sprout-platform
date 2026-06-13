"use client";

import { useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  getExploredRecommendations,
  type RecommendationSignal,
} from "@/lib/discover/explored-recommendations";
import { useCareerCatalog } from "@/hooks/use-career-catalog";
import type { Career } from "@/lib/career-pathways";

/**
 * Dashboard "Recommended for you" panel. Derives picks from the careers the
 * user has explored / saved / rated (passed in as `signals`) and opens the
 * shared career-detail sheet on click. Shows a calm cold-start prompt when
 * there's nothing to recommend from yet.
 */
export function RecommendedForYou({
  signals,
  onSelect,
}: {
  signals: RecommendationSignal[];
  onSelect: (career: Career) => void;
}) {
  const t = useTranslations();
  const reduce = useReducedMotion();
  const { careers, getCategoryForCareer } = useCareerCatalog();
  const recommendations = useMemo(
    () =>
      getExploredRecommendations(
        signals,
        { all: careers, categoryForCareer: getCategoryForCareer },
        3,
      ),
    [signals, careers, getCategoryForCareer],
  );

  // Track which recommendation IDs we've already shown so that an item which
  // is *newly* surfaced (after the user saves / explores a career) gets a
  // brief one-shot highlight pulse — it lights up, then settles. Items that
  // were already on screen don't re-pulse on reorder. Skip the very first
  // render (no pulse on initial mount), and skip entirely under reduced motion.
  const seenIds = useRef<Set<string>>(new Set());
  const hasMounted = useRef(false);
  // Decide newness against the *previous* seen set, then immediately fold the
  // current ids in so the next render won't re-pulse them. Captured during
  // render (refs, not state) so there's no extra commit/flicker.
  const newIds = useMemo(() => {
    const fresh = new Set<string>();
    if (!reduce && hasMounted.current) {
      for (const r of recommendations) {
        if (!seenIds.current.has(r.career.id)) fresh.add(r.career.id);
      }
    }
    seenIds.current = new Set(recommendations.map((r) => r.career.id));
    hasMounted.current = true;
    return fresh;
    // Recompute only when the rendered set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendations, reduce]);

  if (recommendations.length === 0) {
    return (
      <div className="flex h-full flex-col items-start justify-center gap-2 text-xs">
        <p className="leading-relaxed text-muted-foreground/60">
          {t('recommendations.coldStart')}
        </p>
      </div>
    );
  }

  // The list re-derives whenever the user explores / saves / rates a career,
  // so animating entries in (and reordering with `layout`) makes the dashboard
  // visibly REACT to what the user just did — the "it's alive" moment — rather
  // than the list silently swapping. Motion is disabled under prefers-reduced.
  return (
    <div className="divide-y divide-border/60 overflow-hidden rounded-control border border-border/60 bg-muted/10">
      <AnimatePresence initial={false}>
        {recommendations.map(({ career, reasonKind, reasonTitle }) => {
          const pulse = newIds.has(career.id);
          return (
          <motion.button
            key={career.id}
            type="button"
            layout={!reduce}
            initial={
              reduce
                ? false
                : {
                    opacity: 0,
                    y: -6,
                    // One-shot highlight: a soft accent wash + ring that the
                    // item fades out of (below) the first time it's surfaced.
                    // Brand gold accent (#D4A84F) as concrete rgba so motion
                    // can tween it (CSS vars aren't parseable by the animator).
                    backgroundColor: pulse
                      ? "rgba(212, 168, 79, 0.16)"
                      : "rgba(212, 168, 79, 0)",
                    boxShadow: pulse
                      ? "inset 0 0 0 1px rgba(212, 168, 79, 0.38)"
                      : "inset 0 0 0 0 rgba(212, 168, 79, 0)",
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              backgroundColor: "rgba(212, 168, 79, 0)",
              boxShadow: "inset 0 0 0 0 rgba(212, 168, 79, 0)",
            }}
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            transition={
              reduce
                ? { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                : {
                    duration: 0.28,
                    ease: [0.22, 1, 0.36, 1],
                    // Let the accent wash/ring linger, then ease out over ~1s.
                    backgroundColor: { duration: 1, ease: "easeOut", delay: 0.15 },
                    boxShadow: { duration: 1, ease: "easeOut", delay: 0.15 },
                  }
            }
            whileHover={reduce ? undefined : { x: 2 }}
            onClick={() => onSelect(career)}
            className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted/40"
          >
            <span className="shrink-0 text-sm">{career.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-muted-foreground/80">
                {career.title}
              </span>
              <span className="block truncate text-[10px] text-muted-foreground/65">
                {reasonKind === "saved"
                  ? t('recommendations.becauseSaved', { title: reasonTitle })
                  : t('recommendations.becauseExplored', { title: reasonTitle })}
              </span>
            </span>
          </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
