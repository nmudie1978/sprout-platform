"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import type { Career } from "@/lib/career-pathways";
import { CareerScoreCard } from "@/components/careers/career-score-card";
import { localizeCareer } from "@/lib/career-localization";

interface TopMatchesSectionProps {
  careers: Career[];
  recommendationMap: Map<string, number>;
  userCountry: string | null;
  notTailoredLabel?: string;
  onOpen: (career: Career) => void;
}

const TOP_MATCHES = 4;
const MIN_MATCHES_TO_SURFACE = 3;

/**
 * "Your top matches" — the personalised match cards, shown at the BOTTOM of
 * the Explore Careers page (below the table). Renders nothing until the user
 * has enough Career Radar / discovery signal to produce real matches.
 */
export function TopMatchesSection({
  careers,
  recommendationMap,
  userCountry,
  notTailoredLabel,
  onOpen,
}: TopMatchesSectionProps) {
  const byId = useMemo(() => new Map(careers.map((c) => [c.id, c])), [careers]);

  const topMatches = useMemo(() => {
    if (recommendationMap.size < MIN_MATCHES_TO_SURFACE) return [];
    return Array.from(recommendationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ career: byId.get(id), score }))
      .filter((m): m is { career: Career; score: number } => Boolean(m.career))
      .slice(0, TOP_MATCHES);
  }, [recommendationMap, byId]);

  if (topMatches.length === 0) return null;

  return (
    <section className="mt-8 pt-6 border-t border-border space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Your top matches</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {topMatches.map(({ career, score }) => (
          <CareerScoreCard
            key={career.id}
            career={localizeCareer(career, userCountry)}
            matchScore={Math.min(Math.round(score), 100)}
            onLearnMore={() => onOpen(career)}
            notTailoredLabel={notTailoredLabel}
          />
        ))}
      </div>
    </section>
  );
}
