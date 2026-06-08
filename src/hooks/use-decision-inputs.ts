"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useAllInterestLevels } from "@/hooks/use-interest-level";
import { clampInterestLevel } from "@/lib/interest-level/types";
import { getCareerById } from "@/lib/career-pathways";
import {
  isClarityActive,
  isUnderstandConfirmed,
  isDiscoverConfirmed,
} from "@/lib/journey/lens-progress";
import { readLocalJourneyReflections } from "@/lib/library/tabs";
import type { DecisionInput } from "@/lib/decision-board/types";

interface ExploredGoal {
  goalId: string;
  goalTitle: string;
  journeyCompletedSteps: string[];
  isActive: boolean;
  updatedAt: string;
}

/**
 * Source the careers a user has explored as Decision Board inputs.
 *
 * Mirrors the Exploring tab's sourcing exactly (goal-data list + server/local
 * interest) so the board and the dashboard "Where you're leaning" teaser stay
 * in lockstep. Also returns the user's My Journey reflections grouped by
 * career, for the 📝 indicator and the expandable row.
 */
export function useDecisionInputs() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const localInterest = useAllInterestLevels();

  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["exploring-goals", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch("/api/journey/goal-data/list");
      if (!res.ok) throw new Error("Failed to load journeys");
      return (await res.json()) as { goals: ExploredGoal[] };
    },
  });

  const { data: interestData } = useQuery({
    queryKey: ["career-interest", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch("/api/career-interest");
      if (!res.ok) throw new Error("Failed to load interest");
      return (await res.json()) as { interests: Record<string, number> };
    },
  });

  const goals = goalsData?.goals ?? [];
  const serverInterest = interestData?.interests ?? {};

  // Local My Journey reflections, grouped by careerSlug → labelled lines.
  // Best-effort: keyed the same way the Reflections tab reads them; a career
  // with no matching reflections simply gets an empty list.
  const [reflections, setReflections] = useState<Record<string, string[]>>({});
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    const entries = readLocalJourneyReflections(userId, window.localStorage);
    const map: Record<string, string[]> = {};
    for (const e of entries) {
      (map[e.careerSlug] ??= []).push(`${e.lensLabel}: ${e.text}`);
    }
    setReflections(map);
  }, [userId, goals.length]);

  const inputs: DecisionInput[] = goals.map((g) => {
    const career = getCareerById(g.goalId);
    const steps = new Set(g.journeyCompletedSteps ?? []);
    const clarity = steps.has("clarity") || isClarityActive(g.goalTitle);
    const understand =
      clarity || steps.has("understand") || isUnderstandConfirmed(g.goalTitle);
    const discover =
      understand || steps.has("discover") || isDiscoverConfirmed(g.goalTitle);
    const progress = clarity ? 3 : understand ? 2 : discover ? 1 : 0;
    return {
      careerId: g.goalId,
      title: career?.title ?? g.goalTitle,
      emoji: career?.emoji ?? "🧭",
      interest: clampInterestLevel(localInterest[g.goalId] ?? serverInterest[g.goalId]),
      progress,
      updatedAt: Date.parse(g.updatedAt) || 0,
    };
  });

  return {
    inputs,
    reflections,
    isLoading: !!userId && goalsLoading,
    userId,
  };
}
