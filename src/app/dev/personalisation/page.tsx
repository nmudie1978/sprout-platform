"use client";

/**
 * DEV PAGE: Personalisation Demo (Netflix-style)
 *
 * Shows inline "because you..." labels on events, dashboard cards,
 * and journey steps — using real user profile data.
 *
 * Visit /dev/personalisation to see it.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Calendar,
  MapPin,
  Target,
  Zap,
  Heart,
  Route,
  User,
  AlertCircle,
  Loader2,
  ExternalLink,
  LayoutDashboard,
  Briefcase,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getEventLabels,
  getDashboardLabels,
  getJourneyLabels,
  pickLabel,
  pickLabels,
  type PersonalisationContext,
  type SignalLabel,
} from "@/lib/personalisation/hints";

// ── Sample events ───────────────────────────────────────────

const SAMPLE_EVENTS = [
  { title: "KarriereDagene NTNU 2026", city: "Trondheim", category: "Job Fair", format: "In-person", description: "Meet employers from tech, engineering, and business." },
  { title: "Oslo Tech Show 2026", city: "Lillestrøm", category: "Conference", format: "In-person", description: "Norway's largest tech conference. AI, cloud, and software engineering." },
  { title: "High North Young Entrepreneur 2026", city: "Bodø", category: "Meetup", format: "In-person", description: "Young entrepreneurs share ideas and network." },
  { title: "ITxBergen Career Day 2026", city: "Bergen", category: "Job Fair", format: "In-person", description: "IT and technology career fair for students." },
  { title: "European Online Job Day", city: null, category: "Webinar/Seminar", format: "Online", description: "Seasonal employment across Europe." },
  { title: "London Tech Job Fair 2026", city: "London", category: "Job Fair", format: "In-person", description: "Meet hiring tech companies. Software, data, product roles." },
  { title: "Arendalsuka 2026", city: "Arendal", category: "Conference", format: "In-person", description: "Political and social conference. Sustainability and education." },
];

// ── Sample dashboard cards ──────────────────────────────────

const DASHBOARD_CARDS = [
  { icon: Target, title: "Career Goal", description: "Your current direction" },
  { icon: Briefcase, title: "Small Jobs", description: "Opportunities near you" },
  { icon: BookOpen, title: "Industry Insights", description: "Research your field" },
  { icon: TrendingUp, title: "Your Progress", description: "Journey milestones" },
];

// ── Inline label component (the Netflix-style "because you..." tag) ──

function InlineLabel({ label }: { label: SignalLabel }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-teal-400/80">
      <Sparkles className="h-3 w-3 shrink-0" />
      {label.text}
    </span>
  );
}

function LabelDebug({ label }: { label: SignalLabel }) {
  return (
    <span className="text-[9px] text-muted-foreground/30 ml-2">
      [{label.reason} · {label.score}]
    </span>
  );
}

// ── Signal pill ─────────────────────────────────────────────

function SignalPill({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | string[] | number | null }) {
  const display = Array.isArray(value) ? (value.length > 0 ? value.join(", ") : "—") : String(value ?? "—");
  const isEmpty = display === "—" || display === "0" || display === "null";
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2", isEmpty ? "border-border/20 opacity-40" : "border-teal-500/20 bg-teal-500/[0.03]")}>
      <Icon className="h-3.5 w-3.5 text-teal-500/50 shrink-0" />
      <span className="text-[10px] text-muted-foreground/50 shrink-0">{label}</span>
      <span className="text-xs text-foreground/70 truncate">{display}</span>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────

export default function PersonalisationDemoPage() {
  const { data: session } = useSession();

  const { data: journeyData, isLoading: jLoading } = useQuery<{ journey: { currentLens: string; summary: Record<string, unknown> } }>({
    queryKey: ["journey-state"],
    queryFn: async () => { const r = await fetch("/api/journey"); return r.ok ? r.json() : null; },
    enabled: !!session, staleTime: 60_000,
  });

  const { data: goalsData, isLoading: gLoading } = useQuery<{ primaryGoal: { title: string } | null }>({
    queryKey: ["my-goals"],
    queryFn: async () => { const r = await fetch("/api/goals"); return r.ok ? r.json() : { primaryGoal: null }; },
    enabled: !!session, staleTime: 60_000,
  });

  const { data: profileData, isLoading: pLoading } = useQuery<Record<string, unknown>>({
    queryKey: ["my-profile-personalisation"],
    queryFn: async () => { const r = await fetch("/api/profile"); return r.ok ? r.json() : null; },
    enabled: !!session, staleTime: 60_000,
  });

  const { data: reflectionsData } = useQuery<{ discoverReflections: Record<string, unknown> | null }>({
    queryKey: ["discover-reflections"],
    queryFn: async () => { const r = await fetch("/api/discover/reflections"); return r.ok ? r.json() : { discoverReflections: null }; },
    enabled: !!session, staleTime: 60_000,
  });

  const isLoading = jLoading || gLoading || pLoading;

  const ctx: PersonalisationContext = useMemo(() => {
    const summary = journeyData?.journey?.summary as Record<string, unknown> | undefined;
    const profile = profileData as Record<string, unknown> | undefined;
    const reflections = reflectionsData?.discoverReflections as Record<string, unknown> | undefined;
    const lens = journeyData?.journey?.currentLens?.toLowerCase() as 'discover' | 'understand' | 'act' | undefined;
    const user = profile?.user as Record<string, unknown> | undefined;
    const dob = user?.dateOfBirth as string | undefined;
    let age: number | null = null;
    if (dob) {
      const b = new Date(dob);
      const n = new Date();
      age = n.getFullYear() - b.getFullYear();
      if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--;
    }

    return {
      city: (profile?.city as string) ?? null,
      age,
      goalTitle: goalsData?.primaryGoal?.title ?? null,
      strengths: (summary?.strengths as string[]) ?? [],
      interests: (profile?.interests as string[]) ?? [],
      motivations: (reflections?.motivations as string[]) ?? [],
      workStyle: (reflections?.workStyle as string[]) ?? [],
      exploredRoles: ((summary?.exploredRoles as { title: string }[]) ?? []).map((r) => r.title),
      journeyStage: lens ?? null,
      completedJobsCount: (profile?.completedJobsCount as number) ?? 0,
    };
  }, [journeyData, goalsData, profileData, reflectionsData]);

  if (!session) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Sign in to see personalised labels using your real data.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  const dashboardLabels = getDashboardLabels(ctx);
  const journeyLabels = getJourneyLabels(ctx);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Personalisation Demo
        </h1>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Netflix-style &ldquo;because you...&rdquo; labels powered by your real profile data.
        </p>
      </div>

      {/* Your Signals */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/40 mb-3">Your Signals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <SignalPill icon={MapPin} label="City" value={ctx.city} />
          <SignalPill icon={Target} label="Goal" value={ctx.goalTitle} />
          <SignalPill icon={Zap} label="Strengths" value={ctx.strengths} />
          <SignalPill icon={Heart} label="Interests" value={ctx.interests} />
          <SignalPill icon={Sparkles} label="Motivations" value={ctx.motivations} />
          <SignalPill icon={Route} label="Stage" value={ctx.journeyStage} />
          <SignalPill icon={User} label="Age" value={ctx.age} />
          <SignalPill icon={Briefcase} label="Jobs Done" value={ctx.completedJobsCount} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* CAREER EVENTS — Netflix rows */}
      {/* ═══════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Career Events</h2>
        <p className="text-xs text-muted-foreground/40 mb-4">Each event gets an inline label explaining why it&apos;s relevant to you.</p>

        <div className="space-y-2">
          {SAMPLE_EVENTS.map((event) => {
            const labels = getEventLabels(ctx, event);
            const top = pickLabel(labels);

            return (
              <div
                key={event.title}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-3 transition-all",
                  top ? "border-teal-500/20 bg-teal-500/[0.02]" : "border-border/30"
                )}
              >
                {/* Date placeholder */}
                <div className="text-center shrink-0 w-12">
                  <div className="text-lg font-bold text-foreground/70">—</div>
                  <div className="text-[9px] text-muted-foreground/40 uppercase">2026</div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{event.title}</span>
                    <span className="text-[10px] text-muted-foreground/30 shrink-0">{event.category}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {event.city && (
                      <span className="text-[10px] text-muted-foreground/40 flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {event.city}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/30">{event.format}</span>
                  </div>

                  {/* Netflix-style label */}
                  {top && (
                    <div className="mt-1.5">
                      <InlineLabel label={top} />
                      <LabelDebug label={top} />
                    </div>
                  )}
                </div>

                {/* Register */}
                <button className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0 flex items-center gap-1">
                  Register <ExternalLink className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* DASHBOARD CARDS — with labels */}
      {/* ═══════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Dashboard Cards</h2>
        <p className="text-xs text-muted-foreground/40 mb-4">Each card gets a contextual label from your signals.</p>

        <div className="grid grid-cols-2 gap-3">
          {DASHBOARD_CARDS.map((card, i) => {
            const label = dashboardLabels[i] ?? null;
            const Icon = card.icon;

            return (
              <div key={card.title} className="rounded-xl border border-border/30 bg-card/80 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-teal-500/60" />
                  <span className="text-sm font-medium">{card.title}</span>
                </div>
                <p className="text-xs text-muted-foreground/40 mb-2">{card.description}</p>
                {label && (
                  <div>
                    <InlineLabel label={label} />
                    <LabelDebug label={label} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* JOURNEY — stage-aware labels */}
      {/* ═══════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg font-semibold mb-1">My Journey</h2>
        <p className="text-xs text-muted-foreground/40 mb-4">Labels adapt based on your current stage and progress.</p>

        <div className="space-y-2">
          {pickLabels(journeyLabels, 3).map((label) => (
            <div key={label.reason} className="rounded-xl border border-teal-500/15 bg-teal-500/[0.02] p-4">
              <InlineLabel label={label} />
              <LabelDebug label={label} />
            </div>
          ))}
          {journeyLabels.length === 0 && (
            <p className="text-xs text-muted-foreground/30">No journey labels — start your journey to see personalised guidance.</p>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border/20 bg-muted/10 p-4 text-xs text-muted-foreground/40">
        <p className="font-medium text-muted-foreground/50 mb-2">How it works</p>
        <p>User signals (city, goal, strengths, interests, stage) are matched against content using pattern rules. The highest-scoring label is shown inline — like Netflix&apos;s &ldquo;Because you watched...&rdquo; rows. No AI, zero latency. Debug scores shown in brackets.</p>
      </div>
    </div>
  );
}
