"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  getExploredRecommendations,
  type RecommendationSignal,
} from "@/lib/discover/explored-recommendations";
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
  const recommendations = useMemo(
    () => getExploredRecommendations(signals, 3),
    [signals],
  );

  if (recommendations.length === 0) {
    return (
      <div className="flex h-full flex-col items-start justify-center gap-2 text-xs">
        <p className="leading-relaxed text-muted-foreground/60">
          Explore a career and we&apos;ll suggest others that fit what you&apos;re
          drawn to.
        </p>
        <Link
          href="/careers"
          className="font-medium text-primary/80 transition-colors hover:text-primary"
        >
          Explore careers →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60 overflow-hidden rounded-control border border-border/60 bg-muted/10">
      {recommendations.map(({ career, reason }) => (
        <button
          key={career.id}
          type="button"
          onClick={() => onSelect(career)}
          className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted/40"
        >
          <span className="shrink-0 text-sm">{career.emoji}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-muted-foreground/80">
              {career.title}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground/40">
              {reason}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
