"use client";

import { useMemo } from "react";
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
        {recommendations.map(({ career, reasonKind, reasonTitle }) => (
          <motion.button
            key={career.id}
            type="button"
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
        ))}
      </AnimatePresence>
    </div>
  );
}
