"use client";

/**
 * DASHBOARD PAGE — Information-Rich Overview
 *
 * Layout:
 * 1. Greeting header with date
 * 2. My Journey card (circular progress, stage, progress bar)
 * 3. Goal cards (primary + secondary)
 * 4. Careers Explored + My Library
 * 5. Small Jobs stats + Activity
 */

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Compass,
  Briefcase,
  TrendingUp,
  BookmarkCheck,
  Search,
  CheckCircle2,
  Rocket,
  FileText,
  Clock,
  Ban,
} from "lucide-react";
import type { GoalsResponse } from "@/lib/goals/types";
import type { JourneyUIState } from "@/lib/journey/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { VerificationStatus } from "@/components/verification-status";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import { getAllCareers } from "@/lib/career-pathways";
import { GuidanceStack } from "@/components/guidance/guidance-stack";
import { buildGuidanceContext } from "@/lib/guidance/rules";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

// ── Glass Card ───────────────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// ── Library Card with View Toggle ────────────────────────────────────
function LibraryCard({
  items,
  total,
}: {
  items: { title: string; type: string; url: string; thumbnail: string | null; source: string | null }[];
  total: number;
}) {
  const [view, setView] = useState<'list' | 'grid'>('list');

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold">My Library</h3>
          {total > 0 && (
            <span className="text-[10px] text-muted-foreground/40">{total}</span>
          )}
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-0.5 rounded-md bg-muted/30 p-0.5">
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-1 rounded transition-colors',
                view === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/50 hover:text-muted-foreground'
              )}
              title="List view"
            >
              <FileText className="h-3 w-3" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-1 rounded transition-colors',
                view === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/50 hover:text-muted-foreground'
              )}
              title="Grid view"
            >
              <Compass className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        view === 'list' ? (
          <div className="space-y-2">
            {items.slice(0, 5).map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span className={cn(
                  "text-[9px] font-medium uppercase px-1.5 py-0.5 rounded shrink-0",
                  item.type === 'VIDEO' ? 'bg-red-500/10 text-red-400' :
                  item.type === 'ARTICLE' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-purple-500/10 text-purple-400'
                )}>
                  {item.type === 'VIDEO' ? '▶' : item.type === 'ARTICLE' ? '📄' : '🎙'}
                </span>
                <span className="truncate group-hover:text-foreground">{item.title}</span>
              </a>
            ))}
          </div>
        ) : (
          /* Grid view — compact thumbnails */
          <div className="grid grid-cols-3 gap-1.5">
            {items.slice(0, 6).map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-md border border-border/20 overflow-hidden hover:border-border/50 transition-all"
              >
                {item.thumbnail ? (
                  <div className="aspect-video bg-muted/30 relative overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.type === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="h-4 w-4 rounded-full bg-white/80 flex items-center justify-center">
                          <span className="text-[7px] ml-px">▶</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted/20 flex items-center justify-center">
                    <span className="text-xs opacity-30">
                      {item.type === 'VIDEO' ? '▶' : item.type === 'ARTICLE' ? '📄' : '🎙'}
                    </span>
                  </div>
                )}
                <div className="px-1.5 py-1">
                  <p className="text-[9px] font-medium text-foreground/70 line-clamp-1 leading-snug">
                    {item.title}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )
      ) : (
        <p className="text-xs text-muted-foreground/40 py-4 text-center">
          Save articles & videos from Insights
        </p>
      )}
    </GlassCard>
  );
}

// ── Circular Progress Ring ───────────────────────────────────────────
function ProgressRing({
  current,
  total,
  size = 80,
  strokeWidth = 6,
}: {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? current / total : 0;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-teal-500 transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">
          {current}/{total}
        </span>
      </div>
    </div>
  );
}

// ── Lens label mapping ───────────────────────────────────────────────
const LENS_LABELS = [
  { key: "discover", label: "Discover" },
  { key: "understand", label: "Understand" },
  { key: "act", label: "Grow" },
] as const;

// ── Main Page ────────────────────────────────────────────────────────
// ── Did You Know Card ───────────────────────────────────────────────
function DidYouKnowCard() {
  const FACTS = [
    { text: '39% of teenagers cannot name a career they expect to pursue.', source: 'OECD', href: '/about/research#oecd-career-uncertainty' },
    { text: '41% of young people are unsure how to choose their career path.', source: 'Gallup', href: '/about/research#gallup-path-uncertainty' },
    { text: '43% of students don\'t feel prepared for their future.', source: 'Gallup', href: '/about/research#gallup-preparedness' },
    { text: 'Only 45% of students have any real-world career exposure before leaving school.', source: 'OECD', href: '/about/research#oecd-job-shadowing' },
    { text: 'Career exploration leads to better employment outcomes later in life.', source: 'OECD', href: '/about/research#oecd-career-outcomes' },
    { text: 'Healthcare is one of the fastest-growing sectors in Norway.', source: 'SSB', href: '/insights#dig-deeper' },
    { text: 'Over half of students plan to work in just 10 occupations.', source: 'OECD', href: '/about/research#oecd-top-ten-jobs' },
    { text: 'Only 35% of students have undertaken an internship before finishing education.', source: 'OECD', href: '/about/research#oecd-internships' },
  ];

  const [index, setIndex] = useState(() => Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % FACTS.length);
  const fact = FACTS[index];

  const refresh = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % FACTS.length);
  };

  return (
    <div className="mt-6 max-w-4xl mx-auto px-3 sm:px-6">
      <div className="rounded-xl border border-border/30 bg-card/50 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 mt-0.5 shrink-0">
            Did you know?
          </span>
          <a href={fact.href} className="flex-1 min-w-0 group">
            <p className="text-xs text-muted-foreground/70 leading-relaxed group-hover:text-muted-foreground transition-colors">
              {fact.text}
            </p>
          </a>
          <span className="text-[9px] text-muted-foreground/25 shrink-0 mt-0.5">{fact.source}</span>
          <button
            onClick={refresh}
            className="p-1 rounded-md text-muted-foreground/25 hover:text-muted-foreground/60 transition-colors shrink-0"
            title="Show another fact"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  // Onboarding: inline card on first login only
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const dismissedRef = useRef(false);

  const { data: onboardingStatus, refetch: refetchOnboarding } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const response = await fetch("/api/onboarding");
      if (!response.ok) throw new Error("Failed to fetch onboarding status");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const isFirstLogin = onboardingStatus?.needsOnboarding === true;
  const onboardingComplete = onboardingStatus?.needsOnboarding === false;

  // Auto-dismiss onboarding when user leaves the page (end of first session)
  const dismissOnboarding = useCallback(async () => {
    if (dismissedRef.current || !isFirstLogin) return;
    dismissedRef.current = true;
    try {
      await fetch("/api/onboarding", { method: "PATCH" });
    } catch { /* silent */ }
  }, [isFirstLogin]);

  useEffect(() => {
    if (!isFirstLogin) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") dismissOnboarding();
    };
    const handleBeforeUnload = () => dismissOnboarding();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFirstLogin, dismissOnboarding]);

  const { data: goalsData } = useQuery<GoalsResponse>({
    queryKey: ["my-goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) return { primaryGoal: null, secondaryGoal: null };
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 5 * 60 * 1000,
  });

  const { data: journeyData } = useQuery<{
    success: boolean;
    journey: JourneyUIState;
  }>({
    queryKey: ["journey-state"],
    queryFn: async () => {
      const response = await fetch("/api/journey");
      if (!response.ok) throw new Error("Failed to fetch journey state");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 2 * 60 * 1000,
  });

  // Unified dashboard stats — real-time from DB
  const { data: dashboardStats } = useQuery<{
    appStats: { applied: number; waiting: number; accepted: number; done: number };
    savedSummary: { total: number; byType: { articles: number; videos: number; podcasts: number; shorts: number } };
    exploredCareers: string[];
    recentActivity: { type: string; title: string; time: string }[];
  }>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 60 * 1000, // 1 minute — more real-time
  });

  const displayName =
    session?.user?.youthProfile?.displayName ||
    session?.user?.name ||
    "";
  const journey = journeyData?.journey ?? null;
  const primaryGoal = goalsData?.primaryGoal ?? null;
  const _secondaryGoal = goalsData?.secondaryGoal; // Available for future use
  const goalTitle =
    primaryGoal?.title ?? journey?.summary?.primaryGoal?.title ?? null;

  // Journey progress
  const lenses = journey?.summary?.lenses;

  // Current stage
  const currentLens = journey?.currentLens ?? "DISCOVER";
  const currentStageLabel =
    currentLens === "DISCOVER"
      ? "Discover"
      : currentLens === "UNDERSTAND"
        ? "Understand"
        : "Grow";

  // Completed lens count
  const completedLensCount = lenses
    ? [lenses.discover, lenses.understand, lenses.act].filter(
        (l) => l.isComplete
      ).length
    : 0;

  // Career detail sheet
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const goalCareer = useMemo(() => {
    if (!goalTitle) return null;
    const all = getAllCareers();
    return all.find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  // Strengths from journey
  const strengths: string[] = (journey?.summary?.strengths as string[]) ?? [];

  // Real-time stats from DB
  const exploredCareers = dashboardStats?.exploredCareers ?? [];
  const careerInterests = (dashboardStats as Record<string, unknown>)?.careerInterests as string[] ?? [];
  const savedSummary = dashboardStats?.savedSummary ?? {
    total: 0,
    byType: { articles: 0, videos: 0, podcasts: 0, shorts: 0 },
  };
  const savedItemsList = ((dashboardStats as Record<string, unknown>)?.savedItemsList as { title: string; type: string; url: string; thumbnail: string | null; source: string | null }[]) ?? [];
  const recentActivity = dashboardStats?.recentActivity ?? [];

  // Application stats
  const appStats = dashboardStats?.appStats ?? {
    applied: 0,
    waiting: 0,
    accepted: 0,
    done: 0,
  };

  // Date
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  if (status === "loading" || session?.user.role !== "YOUTH") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-background text-foreground">
      {/* Onboarding wizard — only opened from inline card */}
      <OnboardingWizard
        open={showOnboardingWizard}
        onComplete={() => {
          dismissedRef.current = true;
          setShowOnboardingWizard(false);
          refetchOnboarding();
        }}
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isFirstLogin ? `Welcome, ${displayName}` : `Hey, ${displayName}`}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
            <Clock className="h-4 w-4" />
            {dateStr}
          </div>
        </div>

        <div className="mb-5">
          <VerificationStatus compact />
        </div>

        {/* ── Contextual Guidance ────────────────────────────── */}
        {(() => {
          const guidanceCtx = buildGuidanceContext({
            journey: journey ? {
              currentLens: journey.currentLens,
              completedSteps: journey.completedSteps,
              summary: journey.summary,
            } : null,
            isFirstLogin,
            onboardingComplete: onboardingComplete ?? false,
            educationContext: null,
            learningGoalCount: 0,
            jobsApplied: appStats.applied,
          });
          return <GuidanceStack placement="dashboard" context={guidanceCtx} className="mb-5" />;
        })()}

        {/* ── Primary Action Card (first login = onboarding, returning = continue) ── */}
        {isFirstLogin ? (
          <div className="mb-6">
            <GlassCard className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-teal-500/[0.06] via-card/80 to-card/80">
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 shrink-0">
                    <Rocket className="h-5 w-5 text-teal-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-500/60 mb-1">
                      Step 1 of 3
                    </p>
                    <h2 className="text-lg font-semibold text-foreground mb-1.5">
                      Start your journey
                    </h2>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed mb-4 max-w-md">
                      Take a minute to tell us about your interests and direction.
                      We'll use it to shape your personal roadmap — no pressure, you can change it anytime.
                    </p>
                    <button
                      onClick={() => {
                        dismissedRef.current = true;
                        setShowOnboardingWizard(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
                    >
                      Get started
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Subtle decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-500/10 to-transparent pointer-events-none" />
            </GlassCard>
          </div>
        ) : goalTitle ? (
          <Link href="/my-journey" className="block mb-6 group">
            <GlassCard className="p-4 sm:p-5 hover:border-border/60 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10 shrink-0">
                  <Rocket className="h-4 w-4 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-0.5">
                    Continue your journey
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentStageLabel}: {goalTitle}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-teal-500 transition-colors shrink-0" />
              </div>
            </GlassCard>
          </Link>
        ) : null}

        {/* ── 1. My Journey Card ─────────────────────────────── */}
        <Link href="/my-journey" className="block mb-6 group">
          <GlassCard className="p-5 sm:p-6 border-teal-500/40 hover:border-teal-400/60 transition-all duration-300 ring-1 ring-teal-500/20" style={{ boxShadow: '0 0 20px rgba(20, 184, 166, 0.25), 0 0 40px rgba(20, 184, 166, 0.15), 0 0 80px rgba(20, 184, 166, 0.10)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-teal-500/10">
                <TrendingUp className="h-4 w-4 text-teal-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  My Journey
                </h2>
                <p className="text-xs text-muted-foreground/60">
                  Track your growth
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Progress ring */}
              <ProgressRing current={completedLensCount} total={3} />

              {/* Stage & progress bar */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">
                  Current stage:{" "}
                  <span className="font-semibold text-teal-500">
                    {currentStageLabel}
                  </span>
                </p>

                {/* Three-stage progress bar */}
                <div className="flex gap-1 mb-3">
                  {LENS_LABELS.map(({ key, label }) => {
                    const lens = lenses?.[key as keyof typeof lenses];
                    const isActive =
                      currentLens === key.toUpperCase();
                    return (
                      <div key={key} className="flex-1">
                        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              lens?.isComplete
                                ? "bg-teal-500"
                                : isActive
                                  ? "bg-teal-500"
                                  : "bg-transparent"
                            )}
                            style={{
                              width: `${lens?.progress ?? 0}%`,
                            }}
                          />
                        </div>
                        <p
                          className={cn(
                            "text-[10px] mt-1 text-center",
                            isActive
                              ? "text-foreground font-medium"
                              : "text-muted-foreground/40"
                          )}
                        >
                          {label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Jobs stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
                  <span>{appStats.applied} jobs</span>
                  <span>{appStats.applied} applied</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </Link>

        {/* ── 2. Goal Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Career Snapshot — day in the life + details link */}
          {goalCareer ? (
            <GlassCard className="p-4 h-full">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
                Career Snapshot
              </p>
              <div className="space-y-2.5">
                <a
                  href={`https://www.youtube.com/results?search_query=day+in+the+life+${encodeURIComponent(goalCareer.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg bg-red-500/[0.06] border border-red-500/10 px-3 py-2.5 hover:bg-red-500/10 hover:border-red-500/20 transition-all group"
                >
                  <div className="h-8 w-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                    <span className="text-red-400 text-sm">▶</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground/70 group-hover:text-foreground/90 transition-colors">Day in the Life</p>
                    <p className="text-[10px] text-muted-foreground/40">{goalCareer.title} on YouTube</p>
                  </div>
                </a>
                <button
                  onClick={() => setShowGoalDetail(true)}
                  className="flex items-center gap-3 rounded-lg bg-teal-500/[0.04] border border-teal-500/10 px-3 py-2.5 hover:bg-teal-500/8 hover:border-teal-500/20 transition-all group w-full text-left"
                >
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                    <Search className="h-3.5 w-3.5 text-teal-500/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground/70 group-hover:text-foreground/90 transition-colors">Career Details</p>
                    <p className="text-[10px] text-muted-foreground/40">Salary, education, skills</p>
                  </div>
                </button>
              </div>
            </GlassCard>
          ) : (
            <Link href="/my-journey" className="block group">
              <GlassCard className="p-4 hover:border-border/60 transition-all h-full">
                <div className="mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Career Snapshot
                  </p>
                </div>
                <p className="text-sm text-muted-foreground/40">
                  Set a goal to see career info
                </p>
              </GlassCard>
            </Link>
          )}

          {/* My Strengths */}
          <Link href="/my-journey" className="block group">
            <GlassCard className="p-4 hover:border-border/60 transition-all h-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  My Strengths
                </p>
              </div>
              {strengths.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-teal-500/10 text-teal-500"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/40">
                  Complete Discover to see your strengths
                </p>
              )}
            </GlassCard>
          </Link>
        </div>

        {/* ── 3. Careers Explored + My Library ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Careers You Explored */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="h-4 w-4 text-teal-500" />
              <h3 className="text-sm font-semibold">Career Interests</h3>
            </div>
            {careerInterests.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {careerInterests.map((interest, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium bg-teal-500/10 text-teal-400/80"
                  >
                    {interest.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>
                ))}
              </div>
            ) : exploredCareers.length > 0 ? (
              <div className="space-y-2">
                {exploredCareers.slice(0, 4).map((career, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-500/50" />
                    {career.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/40 py-4 text-center">
                Set career interests in My Journey
              </p>
            )}
          </GlassCard>

          {/* My Library */}
          <LibraryCard items={savedItemsList} total={savedSummary.total} />
        </div>

        {/* ── 4. Small Jobs + Activity ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Small Jobs */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold">Small Jobs</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Applied", value: appStats.applied },
                { label: "Waiting", value: appStats.waiting },
                { label: "Accepted", value: appStats.accepted },
                { label: "Done", value: appStats.done },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Activity */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">Activity</h3>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      item.type === 'application' ? 'bg-emerald-500/50' :
                      item.type === 'saved' ? 'bg-blue-500/50' :
                      'bg-amber-500/50'
                    )} />
                    <span className="text-muted-foreground truncate flex-1">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground/40 shrink-0">
                      {(() => {
                        const s = Math.floor((Date.now() - new Date(item.time).getTime()) / 1000);
                        if (s < 60) return 'just now';
                        if (s < 3600) return `${Math.floor(s / 60)}m`;
                        if (s < 86400) return `${Math.floor(s / 3600)}h`;
                        return `${Math.floor(s / 86400)}d`;
                      })()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <p className="text-xs text-muted-foreground/40">
                  No recent activity
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* ── 5. Industry Insights Ticker ─────────────────────── */}
      <DidYouKnowCard />

      {/* Career Detail Sheet */}
      <CareerDetailSheet
        career={showGoalDetail ? goalCareer : null}
        onClose={() => setShowGoalDetail(false)}
      />
    </div>
  );
}
