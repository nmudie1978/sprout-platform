"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Shuffle, ArrowRight, Compass } from "lucide-react";
import type { Career, CareerCategory } from "@/lib/career-pathways";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CareerScoreCard } from "@/components/careers/career-score-card";
import { CareerShelf } from "@/components/careers/career-shelf";
import { localizeCareer } from "@/lib/career-localization";
import { SHELVES, buildShelf, SHELF_MIN } from "@/lib/careers/shelves";
import { pickSurprise } from "@/lib/careers/surprise";

interface CareerFrontDoorProps {
  careers: Career[];
  recommendationMap: Map<string, number>;
  getCategoryForCareer: (id: string) => CareerCategory | undefined;
  userCountry: string | null;
  notTailoredLabel?: string;
  onOpen: (career: Career) => void;
}

const TOP_MATCHES = 4;
const MIN_MATCHES_TO_SURFACE = 3;
const RECENT_SURPRISE_CAP = 10;

/**
 * The "front door" above the Explore Careers table: a personalisation strip
 * (real matches when we have them, a calm invite otherwise), a finite set of
 * themed shelves, and a "Surprise me" action. Shown only on the unfiltered
 * page-1 view so it never competes with an active query.
 */
export function CareerFrontDoor({
  careers,
  recommendationMap,
  getCategoryForCareer,
  userCountry,
  notTailoredLabel,
  onOpen,
}: CareerFrontDoorProps) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const byId = useMemo(() => new Map(careers.map((c) => [c.id, c])), [careers]);

  const topMatches = useMemo(() => {
    if (recommendationMap.size < MIN_MATCHES_TO_SURFACE) return [];
    return Array.from(recommendationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ career: byId.get(id), score }))
      .filter((m): m is { career: Career; score: number } => Boolean(m.career))
      .slice(0, TOP_MATCHES);
  }, [recommendationMap, byId]);

  const shelves = useMemo(
    () =>
      SHELVES.map((def) => ({
        def,
        items: buildShelf(def, careers, { categoryOf: getCategoryForCareer }),
      })).filter((s) => s.items.length >= SHELF_MIN),
    [careers, getCategoryForCareer],
  );

  const handleSurprise = useCallback(() => {
    const pick = pickSurprise(careers, recentIds);
    if (!pick) return;
    setRecentIds((prev) => [pick.id, ...prev].slice(0, RECENT_SURPRISE_CAP));
    onOpen(pick);
  }, [careers, recentIds, onOpen]);

  if (careers.length === 0) return null;

  return (
    <div className="space-y-6 mb-8">
      {/* ① Themed shelves */}
      {shelves.map(({ def, items }) => (
        <CareerShelf
          key={def.id}
          emoji={def.emoji}
          title={def.title}
          blurb={def.blurb}
          careers={items}
          userCountry={userCountry}
          onOpen={onOpen}
        />
      ))}

      {/* ② Surprise me — right-aligned */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleSurprise} className="gap-2">
          <Shuffle className="h-3.5 w-3.5" />
          Surprise me
        </Button>
      </div>

      {/* ③ Personalisation strip — moved to the bottom of the front door */}
      {topMatches.length > 0 ? (
        <section className="space-y-3">
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
      ) : (
        <Card className="border-primary/20 bg-primary/[0.04]">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
            <Compass className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Get these ranked for you
              </p>
              <p className="text-xs text-muted-foreground">
                Answer a few quick questions and we&apos;ll sort careers by what fits you.
              </p>
            </div>
            <Button asChild size="sm" variant="secondary" className="shrink-0">
              <Link href="/careers/radar">
                Open Career Radar
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
