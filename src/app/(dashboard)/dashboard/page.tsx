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
import { useState, useEffect } from "react";

// ── Glass Card ───────────────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl ${className}`}
    >
      {children}
    </div>
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
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null
  );

  const { data: onboardingStatus } = useQuery({
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

  useEffect(() => {
    if (onboardingStatus) {
      if (onboardingStatus.needsOnboarding) {
        setShowOnboarding(true);
        setOnboardingComplete(false);
      } else {
        setOnboardingComplete(true);
      }
    }
  }, [onboardingStatus]);

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

  const { data: applicationsData } = useQuery<{
    applied: number;
    waiting: number;
    accepted: number;
    done: number;
  }>({
    queryKey: ["application-stats"],
    queryFn: async () => {
      const response = await fetch("/api/applications");
      if (!response.ok)
        return { applied: 0, waiting: 0, accepted: 0, done: 0 };
      const apps = await response.json();
      if (!Array.isArray(apps))
        return { applied: 0, waiting: 0, accepted: 0, done: 0 };
      return {
        applied: apps.length,
        waiting: apps.filter(
          (a: { status: string }) => a.status === "PENDING"
        ).length,
        accepted: apps.filter(
          (a: { status: string }) => a.status === "ACCEPTED"
        ).length,
        done: apps.filter(
          (a: { status: string }) =>
            a.status === "COMPLETED" || a.status === "WITHDRAWN"
        ).length,
      };
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 5 * 60 * 1000,
  });

  const displayName =
    session?.user?.youthProfile?.displayName ||
    session?.user?.name ||
    "";
  const journey = journeyData?.journey ?? null;
  const primaryGoal = goalsData?.primaryGoal ?? null;
  const secondaryGoal = goalsData?.secondaryGoal ?? null;
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

  // Explored careers & saved content from journey summary
  const exploredRoles = journey?.summary?.exploredRoles ?? [];
  const savedSummary = journey?.summary?.savedSummary ?? {
    total: 0,
    byType: { articles: 0, videos: 0, podcasts: 0, shorts: 0 },
  };

  // Application stats
  const appStats = applicationsData ?? {
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
      <OnboardingWizard
        open={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          setOnboardingComplete(true);
        }}
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Hey, {displayName}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
            <Clock className="h-4 w-4" />
            {dateStr}
          </div>
        </div>

        <div className="mb-5">
          <VerificationStatus compact />
        </div>

        {/* ── 1. My Journey Card ─────────────────────────────── */}
        <Link href="/my-journey" className="block mb-6 group">
          <GlassCard className="p-5 sm:p-6 hover:border-border/60 transition-all">
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
          {/* Primary Goal */}
          <Link href="/my-journey" className="block group">
            <GlassCard className="p-4 hover:border-border/60 transition-all h-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Primary Goal
                </p>
                {primaryGoal && (
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      primaryGoal.status === "committed"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-blue-500/15 text-blue-500"
                    )}
                  >
                    {primaryGoal.status === "committed"
                      ? "Committed"
                      : "Exploring"}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-foreground truncate">
                {primaryGoal?.title ?? (
                  <span className="text-muted-foreground/40">
                    Not set yet
                  </span>
                )}
              </p>
            </GlassCard>
          </Link>

          {/* Secondary Goal — disabled / coming soon */}
          <div className="opacity-40 pointer-events-none select-none">
            <GlassCard className="p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Secondary Goal
                </p>
                {secondaryGoal && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground/50">
                    {secondaryGoal.status === "committed"
                      ? "Committed"
                      : "Exploring"}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-muted-foreground/50 truncate">
                {secondaryGoal?.title ?? "Not set yet"}
              </p>
              <p className="text-[10px] text-muted-foreground/40 mt-1">
                Coming soon
              </p>
            </GlassCard>
          </div>
        </div>

        {/* ── 3. Careers Explored + My Library ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Careers You Explored */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-teal-500" />
                <h3 className="text-sm font-semibold">
                  Careers You Explored
                </h3>
              </div>
              <Link
                href="/careers"
                className="text-[11px] text-teal-500 hover:text-teal-400 flex items-center gap-1"
              >
                Explore <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {exploredRoles.length > 0 ? (
              <div className="space-y-2">
                {exploredRoles.slice(0, 3).map((role, i) => (
                  <div
                    key={i}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-500/50" />
                    {role.title}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                  <Ban className="h-5 w-5 text-muted-foreground/30" />
                </div>
                <p className="text-xs text-muted-foreground/50 mb-1">
                  No careers explored yet
                </p>
                <Link
                  href="/careers"
                  className="text-xs text-teal-500 hover:text-teal-400"
                >
                  Start exploring
                </Link>
              </div>
            )}
          </GlassCard>

          {/* My Library */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold">My Library</h3>
              </div>
              <Link
                href="/insights"
                className="text-[11px] text-blue-500 hover:text-blue-400 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {savedSummary.total > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {savedSummary.byType.articles > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {savedSummary.byType.articles} articles
                  </div>
                )}
                {savedSummary.byType.videos > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {savedSummary.byType.videos} videos
                  </div>
                )}
                {savedSummary.byType.podcasts > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {savedSummary.byType.podcasts} podcasts
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                  <BookmarkCheck className="h-5 w-5 text-muted-foreground/30" />
                </div>
                <p className="text-xs text-muted-foreground/50 mb-1">
                  No saved content yet
                </p>
                <Link
                  href="/insights"
                  className="text-xs text-blue-500 hover:text-blue-400"
                >
                  Save articles & videos as you explore
                </Link>
              </div>
            )}
          </GlassCard>
        </div>

        {/* ── 4. Small Jobs + Activity ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Small Jobs */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold">Small Jobs</h3>
              </div>
              <Link
                href="/jobs"
                className="text-[11px] text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
              >
                Browse <ArrowRight className="h-3 w-3" />
              </Link>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold">Activity</h3>
              </div>
              <Link
                href="/my-journey"
                className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex items-center justify-center py-4">
              <p className="text-xs text-muted-foreground/40">
                No recent activity
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
