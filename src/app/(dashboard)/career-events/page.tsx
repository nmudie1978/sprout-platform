"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Calendar, Sparkles } from "lucide-react";
import { YouthEventsTable } from "@/components/insights/youth-events-table";
import { PageContext } from "@/components/ui/page-context";
import {
  getEventLabels,
  pickLabel,
  type PersonalisationContext,
} from "@/lib/personalisation/hints";
import type { YouthEventsResponse } from "@/lib/events/types";

/**
 * Build a lightweight personalisation context from available data.
 * Returns null if not enough signals to personalise.
 */
function usePersonalisationContext(): PersonalisationContext | null {
  const { data: session } = useSession();

  const { data: goalsData } = useQuery<{ primaryGoal: { title: string } | null }>({
    queryKey: ["goals"],
    queryFn: async () => { const r = await fetch("/api/goals"); return r.ok ? r.json() : { primaryGoal: null }; },
    enabled: !!session,
    staleTime: 60_000,
  });

  const { data: profileData } = useQuery<Record<string, unknown>>({
    queryKey: ["my-profile-personalisation"],
    queryFn: async () => { const r = await fetch("/api/profile"); return r.ok ? r.json() : null; },
    enabled: !!session,
    staleTime: 5 * 60_000,
  });

  return useMemo(() => {
    const profile = profileData as Record<string, unknown> | undefined;
    const city = (profile?.city as string) ?? null;
    const goalTitle = goalsData?.primaryGoal?.title ?? null;
    const interests = (profile?.interests as string[]) ?? [];

    // Only personalise if we have at least one meaningful signal
    if (!city && !goalTitle && interests.length === 0) return null;

    return {
      city,
      age: null,
      goalTitle,
      strengths: [],
      interests,
      motivations: [],
      workStyle: [],
      exploredRoles: [],
      journeyStage: null,
      completedJobsCount: (profile?.completedJobsCount as number) ?? 0,
    };
  }, [goalsData, profileData]);
}

export default function CareerEventsPage() {
  const ctx = usePersonalisationContext();

  // Fetch events to match against (reuse the same query the table uses)
  const { data: eventsData } = useQuery<YouthEventsResponse>({
    queryKey: ["youth-events", "page=1&pageSize=5&months=12"],
    queryFn: async () => {
      const r = await fetch("/api/events/youth?page=1&pageSize=5&months=12");
      return r.ok ? r.json() : null;
    },
    staleTime: 5 * 60_000,
  });

  // Find the single best personalised recommendation (score ≥ 75, max 1)
  const recommendation = useMemo(() => {
    if (!ctx || !eventsData?.items) return null;

    let best: { eventTitle: string; label: string } | null = null;
    let bestScore = 0;

    for (const event of eventsData.items) {
      const labels = getEventLabels(ctx, {
        title: event.title,
        city: event.city ?? null,
        category: event.category,
        format: event.format,
        description: event.description,
      });
      const top = pickLabel(labels);
      if (top && top.score > bestScore && top.score >= 75) {
        bestScore = top.score;
        best = { eventTitle: event.title, label: top.text };
      }
    }

    return best;
  }, [ctx, eventsData]);

  return (
    <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 max-w-5xl">
      <PageContext
        pageKey="career-events"
        purpose="Find upcoming career events, open days, and workshops near you."
        action="Browse events, filter by type or location, and click through to register."
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-teal-500/10">
          <Calendar className="h-5 w-5 text-teal-500" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Career Events</h1>
          <p className="text-xs text-muted-foreground/60">
            Upcoming events, open days, and workshops to explore careers
          </p>
        </div>
      </div>

      {/* Single personalised recommendation — only when there's a strong match */}
      {recommendation && (
        <div className="flex items-center gap-2 mb-4 px-1">
          <Sparkles className="h-3 w-3 text-teal-500/50 shrink-0" />
          <p className="text-[11px] text-teal-500/60">
            <span className="font-medium">{recommendation.eventTitle}</span>
            <span className="text-teal-500/40"> — {recommendation.label.charAt(0).toLowerCase() + recommendation.label.slice(1)}</span>
          </p>
        </div>
      )}

      <YouthEventsTable />

      {/* MVP reminder — remove once Eventbrite API is integrated */}
      <p className="text-[9px] text-muted-foreground/20 text-center mt-10">
        MVP — static seed data. Requires Eventbrite API integration for live events, auto-refresh, and proactive personalised notifications.
      </p>
    </div>
  );
}
