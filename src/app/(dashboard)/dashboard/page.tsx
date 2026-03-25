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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import type { GoalsResponse } from "@/lib/goals/types";
import type { JourneyUIState } from "@/lib/journey/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { VerificationStatus } from "@/components/verification-status";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import { getAllCareers } from "@/lib/career-pathways";
import { useDiscoverRecommendations } from "@/hooks/use-discover-recommendations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Target } from "lucide-react";
import { syncGuidanceGoal } from "@/lib/guidance/rules";

/** Sanitise user-provided URLs — only allow http/https to prevent javascript: XSS */
function safeHref(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
  } catch { /* invalid URL */ }
  return '#';
}

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
  const [libPage, setLibPage] = useState(0);
  const PAGE_SIZE = view === 'list' ? 5 : 6;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(libPage, totalPages - 1);
  const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <GlassCard className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <BookmarkCheck className="h-3.5 w-3.5 text-blue-500" />
        <h3 className="text-xs font-semibold">My Library</h3>
        {total > 0 && (
          <span className="text-[10px] text-muted-foreground/40">{total}</span>
        )}
        <span className="flex-1" />
        {items.length > 0 && (
          <div className="flex items-center gap-0.5 rounded-md bg-muted/30 p-0.5">
            <button
              onClick={() => { setView('list'); setLibPage(0); }}
              className={cn(
                'p-1 rounded transition-colors',
                view === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/50 hover:text-muted-foreground'
              )}
              title="List view"
            >
              <FileText className="h-3 w-3" />
            </button>
            <button
              onClick={() => { setView('grid'); setLibPage(0); }}
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
        {totalPages > 1 && (
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => setLibPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span className="text-[9px] text-muted-foreground/30 tabular-nums">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setLibPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        view === 'list' ? (
          <div className="space-y-1.5">
            {pageItems.map((item, i) => (
              <a
                key={i}
                href={safeHref(item.url)}
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
            {pageItems.map((item, i) => (
              <a
                key={i}
                href={safeHref(item.url)}
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
    savedItemsList: { title: string; type: string; url: string; thumbnail: string | null; source: string | null }[];
    exploredCareers: string[];
    careerInterests: string[];
    recentActivity: { type: string; title: string; time: string }[];
  }>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 10 * 1000, // 10 seconds — near real-time for saved content
    refetchOnWindowFocus: true,
  });

  // Explored journeys — all goals the user has saved progress for
  const { data: exploredGoalsData } = useQuery<{
    goals: { goalId: string; goalTitle: string; isActive: boolean; journeyCompletedSteps: string[]; updatedAt: string }[];
  }>({
    queryKey: ["explored-goals"],
    queryFn: async () => {
      const response = await fetch("/api/journey/goal-data/list");
      if (!response.ok) return { goals: [] };
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 5 * 60 * 1000,
  });

  const queryClient = useQueryClient();

  const switchGoalMutation = useMutation({
    mutationFn: async (goalTitle: string) => {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: "primary",
          goal: { title: goalTitle, status: "exploring", confidence: "medium", timeframe: "1-2-years", why: "", nextSteps: [], skills: [] },
        }),
      });
      if (!response.ok) throw new Error("Failed to switch goal");
      return response.json();
    },
    onSuccess: (_data, goalTitle) => {
      syncGuidanceGoal(goalTitle);
      queryClient.removeQueries({ queryKey: ["personal-career-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["my-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["journey-state"] });
      queryClient.invalidateQueries({ queryKey: ["explored-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-data"] });
      queryClient.invalidateQueries({ queryKey: ["discover-reflections"] });
      queryClient.invalidateQueries({ queryKey: ["education-context"] });
    },
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

  // Discover profile — "Who Am I" summary (generic across all goals)
  const { data: discoverData } = useDiscoverRecommendations(session?.user.role === "YOUTH");

  // Profile completion — lightweight check
  const { data: profileData } = useQuery<{
    displayName: string | null; bio: string | null; phoneNumber: string | null;
    city: string | null; availability: string | null; interests: string[];
    user: { dateOfBirth: string | null } | null;
  }>({
    queryKey: ["profile-completion"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return null;
      const d = await res.json();
      return d || null;
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 5 * 60 * 1000,
  });

  // Career detail sheet
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [journeyPage, setJourneyPage] = useState(0);
  const [switchConfirm, setSwitchConfirm] = useState<{ goalTitle: string; emoji: string } | null>(null);
  const goalCareer = useMemo(() => {
    if (!goalTitle) return null;
    const all = getAllCareers();
    return all.find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  // Strengths from journey
  const strengths: string[] = (journey?.summary?.strengths as string[]) ?? [];

  // Real-time stats from DB
  const exploredCareers = dashboardStats?.exploredCareers ?? [];
  const careerInterests = dashboardStats?.careerInterests ?? [];
  const savedSummary = dashboardStats?.savedSummary ?? {
    total: 0,
    byType: { articles: 0, videos: 0, podcasts: 0, shorts: 0 },
  };
  const savedItemsList = dashboardStats?.savedItemsList ?? [];
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
                  {goalTitle ? goalTitle : 'Track your growth'}
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

        {/* ── 2. Who Am I ────────────────────────────────────── */}
        {discoverData?.hasProfile && discoverData.summary && (
          <Link href="/my-journey" className="block mb-6 group">
            <GlassCard className="p-4 hover:border-border/60 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-violet-500/10 shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                    Who Am I
                  </p>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    {discoverData.summary}
                  </p>
                  {discoverData.signals?.topTags && discoverData.signals.topTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {discoverData.signals.topTags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium bg-violet-500/8 text-violet-400/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </Link>
        )}

        {/* ── 3. Career Snapshot + Explored Journeys ──────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Career Snapshot */}
          {goalCareer ? (
            <GlassCard className="p-4 h-full">
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-3.5 w-3.5 text-teal-500" />
                <h3 className="text-xs font-semibold">Career Snapshot</h3>
              </div>
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
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-3.5 w-3.5 text-teal-500" />
                  <h3 className="text-xs font-semibold">Career Snapshot</h3>
                </div>
                <p className="text-sm text-muted-foreground/40">
                  Set a goal to see career info
                </p>
              </GlassCard>
            </Link>
          )}

          {/* My Explored Journeys */}
          {(() => {
            const exploredGoals = exploredGoalsData?.goals ?? [];
            const allCareers = getAllCareers();
            if (exploredGoals.length < 2) {
              return (
                <LibraryCard items={savedItemsList} total={savedSummary.total} />
              );
            }
            const PAGE_SIZE = 5;
            const totalPages = Math.ceil(exploredGoals.length / PAGE_SIZE);
            const page = Math.min(journeyPage, totalPages - 1);
            const pageGoals = exploredGoals.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

            return (
              <GlassCard className="p-3 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-1.5">
                  <Target className="h-3.5 w-3.5 text-violet-500" />
                  <h3 className="text-xs font-semibold">My Explored Journeys</h3>
                  <span className="text-[10px] text-muted-foreground/40">{exploredGoals.length}</span>
                  <span className="flex-1" />
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setJourneyPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <span className="text-[9px] text-muted-foreground/30 tabular-nums">
                        {page + 1}/{totalPages}
                      </span>
                      <button
                        onClick={() => setJourneyPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="divide-y divide-border/20 flex-1">
                  {pageGoals.map((goal) => {
                    const career = allCareers.find((c) => c.title === goal.goalTitle);
                    const stepsCompleted = (goal.journeyCompletedSteps || []).length;
                    const totalSteps = 8;
                    const isCurrentGoal = goal.goalTitle === goalTitle;
                    return (
                      <button
                        key={goal.goalId}
                        onClick={() => {
                          if (!isCurrentGoal) setSwitchConfirm({ goalTitle: goal.goalTitle, emoji: career?.emoji ?? "🎯" });
                        }}
                        disabled={isCurrentGoal || switchGoalMutation.isPending}
                        className={cn(
                          "w-full flex items-center gap-2 py-1.5 text-left transition-colors",
                          !isCurrentGoal && "hover:bg-muted/40",
                        )}
                      >
                        <span className="text-sm shrink-0">{career?.emoji ?? "🎯"}</span>
                        <span className={cn("text-[11px] truncate flex-1 min-w-0", isCurrentGoal ? "font-medium text-teal-400" : "text-foreground/70")}>
                          {goal.goalTitle}
                        </span>
                        {isCurrentGoal && (
                          <span className="text-[8px] font-medium text-teal-500/70 bg-teal-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                            Active
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/25 shrink-0 tabular-nums">
                          {stepsCompleted}/{totalSteps}
                        </span>
                        {!isCurrentGoal && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground/20 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })()}
        </div>

        {/* ── 3. Library + Jobs ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* My Library — only show here if explored journeys took its spot above */}
          {(exploredGoalsData?.goals ?? []).length >= 2 && (
            <LibraryCard items={savedItemsList} total={savedSummary.total} />
          )}

          {/* My Jobs */}
          <Link href="/applications" className="block group">
            <GlassCard className="p-4 hover:border-border/60 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold">My Jobs</h3>
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
          </Link>
        </div>

        {/* ── 4. Activity ────────────────────────────────────── */}
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <FileText className="h-3.5 w-3.5 text-amber-500" />
            <h3 className="text-xs font-semibold">Activity</h3>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-1">
              {recentActivity.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <div className={cn(
                    "h-1 w-1 rounded-full shrink-0",
                    item.type === 'application' ? 'bg-emerald-500/50' :
                    item.type === 'saved' ? 'bg-blue-500/50' :
                    'bg-amber-500/50'
                  )} />
                  <span className="text-muted-foreground/60 truncate flex-1">{item.title}</span>
                  <span className="text-[9px] text-muted-foreground/30 shrink-0">
                    {(() => {
                      const s = Math.floor((Date.now() - new Date(item.time).getTime()) / 1000);
                      if (s < 60) return 'now';
                      if (s < 3600) return `${Math.floor(s / 60)}m`;
                      if (s < 86400) return `${Math.floor(s / 3600)}h`;
                      return `${Math.floor(s / 86400)}d`;
                    })()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground/30 py-2 text-center">
              No recent activity
            </p>
          )}
        </GlassCard>
      </div>

      {/* ── 5. Profile Completion ───────────────────────────── */}
      {profileData && (() => {
        const total = 8;
        let done = 0;
        if (profileData.displayName) done++;
        if (profileData.user?.dateOfBirth) done++;
        if (profileData.phoneNumber) done++;
        if (profileData.city) done++;
        if (profileData.bio) done++;
        if (profileData.availability) done++;
        if (profileData.interests?.length > 0) done++;
        if (goalTitle) done++;
        const pct = Math.round((done / total) * 100);
        if (pct === 100) return null;
        return (
          <Link href="/profile" className="block group">
            <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/50 hover:bg-card/70 px-3 py-2 transition-all mb-4">
              <User className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
              <span className="text-[11px] text-muted-foreground/50 flex-1">Profile</span>
              <span className="text-[10px] text-muted-foreground/40 tabular-nums">{pct}%</span>
              <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden shrink-0">
                <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </Link>
        );
      })()}

      {/* ── 6. Industry Insights Ticker ─────────────────────── */}
      <DidYouKnowCard />

      {/* Career Detail Sheet */}
      <CareerDetailSheet
        career={showGoalDetail ? goalCareer : null}
        onClose={() => setShowGoalDetail(false)}
      />

      {/* Switch Journey Confirmation */}
      {switchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSwitchConfirm(null)}>
          <div className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{switchConfirm.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold">Switch to {switchConfirm.goalTitle}?</h3>
                <p className="text-[11px] text-muted-foreground/60">
                  Your current progress will be saved.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-muted/40 border border-border/40 p-3 mb-4 space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground/70">What happens:</p>
              <ul className="text-[10px] text-muted-foreground/50 space-y-0.5 ml-3">
                <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-px">&#10003;</span> Progress for {goalTitle || 'your current goal'} is saved</li>
                <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-px">&#10003;</span> You can switch back anytime</li>
                <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-px">&#10003;</span> Strengths and interests carry over</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSwitchConfirm(null)}
                className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  switchGoalMutation.mutate(switchConfirm.goalTitle);
                  setSwitchConfirm(null);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
              >
                Switch journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
