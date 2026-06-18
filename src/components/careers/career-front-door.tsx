"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import type { Career, CareerCategory } from "@/lib/career-pathways";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CareerShelf } from "@/components/careers/career-shelf";
import { SHELVES, buildShelf, SHELF_MIN } from "@/lib/careers/shelves";

interface CareerFrontDoorProps {
  careers: Career[];
  recommendationMap: Map<string, number>;
  getCategoryForCareer: (id: string) => CareerCategory | undefined;
  userCountry: string | null;
  onOpen: (career: Career) => void;
}

const MIN_MATCHES_TO_SURFACE = 3;

/**
 * The "front door" above the Explore Careers table: any themed shelves and —
 * only for users without personalised matches yet — a calm Career Radar
 * invite. (Real matches render at the BOTTOM of the page via
 * <TopMatchesSection>; "Surprise me" lives on the filter bar.) Shown only on
 * the unfiltered page-1 view.
 */
export function CareerFrontDoor({
  careers,
  recommendationMap,
  getCategoryForCareer,
  userCountry,
  onOpen,
}: CareerFrontDoorProps) {
  const hasMatches = recommendationMap.size >= MIN_MATCHES_TO_SURFACE;

  const shelves = useMemo(
    () =>
      SHELVES.map((def) => ({
        def,
        items: buildShelf(def, careers, { categoryOf: getCategoryForCareer }),
      })).filter((s) => s.items.length >= SHELF_MIN),
    [careers, getCategoryForCareer],
  );

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

      {/* ② Career Radar invite — only when there are no matches to show yet */}
      {!hasMatches && (
        <Card className="border-primary/20 bg-primary/[0.04]">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
            <Compass className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Get these ranked for you</p>
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
