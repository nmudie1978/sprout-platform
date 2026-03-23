"use client";

/**
 * DASHBOARD PAGE — Action-First Layout
 *
 * Hierarchy:
 * 1. Primary Action Card (dominant CTA based on user state)
 * 2. Journey Snapshot (compact progress)
 * 3. Quick Actions (Explore Careers, Small Jobs, AI Advisor)
 */

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Compass,
  Briefcase,
  Sparkles,
  Target,
  Search,
  CheckCircle2,
  Rocket,
  Map,
} from "lucide-react";
import type { GoalsResponse } from "@/lib/goals/types";
import type { JourneyUIState } from "@/lib/journey/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { VerificationStatus } from "@/components/verification-status";
import { RecommendedCareers } from "@/components/discover/recommended-careers";
import { WelcomeHero } from "@/components/welcome-hero";
import { useState, useEffect } from "react";

// ── Glass Card ───────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: {
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

// ── Determine primary CTA based on user state ────────────────────────
type UserState =
  | "no_journey"         // Never started
  | "discover_active"    // In Discover
  | "discover_done"      // Discover complete, no goal set
  | "understand_active"  // In Understand
  | "act_active"         // In Act
  | "journey_complete";  // All mandatory done

interface PrimaryCTA {
  headline: string;
  description: string;
  buttonText: string;
  href: string;
  icon: React.ReactNode;
  accentClass: string;
  glowClass: string;
}

function getUserState(
  journey: JourneyUIState | null,
  hasGoal: boolean,
): UserState {
  if (!journey || journey.completedSteps.length === 0) return "no_journey";

  const { lenses } = journey.summary;

  if (lenses.act.isComplete) return "journey_complete";
  if (lenses.understand.isComplete) return "act_active";
  if (lenses.discover.isComplete) {
    return hasGoal ? "understand_active" : "discover_done";
  }
  return "discover_active";
}

function getPrimaryCTA(state: UserState, goalTitle: string | null, nextStepTitle: string | null): PrimaryCTA {
  switch (state) {
    case "no_journey":
      return {
        headline: "Start with what you know about yourself",
        description: "You don't need a plan yet. Begin by exploring your strengths and what interests you — everything else builds from there.",
        buttonText: "Begin Exploring",
        href: "/my-journey",
        icon: <Sparkles className="h-6 w-6" />,
        accentClass: "text-teal-500",
        glowClass: "shadow-[0_0_40px_rgba(20,184,166,0.12)]",
      };
    case "discover_active":
      return {
        headline: "You're building a clearer picture",
        description: nextStepTitle
          ? `Next up: ${nextStepTitle}. Every small reflection helps shape your direction.`
          : "Keep going at your own pace — the next step is ready when you are.",
        buttonText: "Continue Discover",
        href: "/my-journey",
        icon: <Search className="h-6 w-6" />,
        accentClass: "text-teal-500",
        glowClass: "shadow-[0_0_40px_rgba(20,184,166,0.12)]",
      };
    case "discover_done":
      return {
        headline: "You know yourself better now",
        description: "When you're ready, set a direction. It doesn't have to be permanent — you can always change course later.",
        buttonText: "Choose a Direction",
        href: "/my-journey",
        icon: <Target className="h-6 w-6" />,
        accentClass: "text-amber-500",
        glowClass: "shadow-[0_0_40px_rgba(245,158,11,0.12)]",
      };
    case "understand_active":
      return {
        headline: goalTitle ? `Learning about ${goalTitle}` : "Exploring your path",
        description: nextStepTitle
          ? `Next up: ${nextStepTitle}. Understanding the reality of a career helps you make decisions you'll feel good about.`
          : "Take your time learning about this path. The more you know, the more confident you'll feel.",
        buttonText: "Continue Understand",
        href: "/my-journey",
        icon: <Map className="h-6 w-6" />,
        accentClass: "text-blue-500",
        glowClass: "shadow-[0_0_40px_rgba(59,130,246,0.12)]",
      };
    case "act_active":
      return {
        headline: "Ready to take a real step",
        description: nextStepTitle
          ? `Next up: ${nextStepTitle}. Even a small action can create real momentum.`
          : "You've done the thinking. Now try something in the real world — start small, learn as you go.",
        buttonText: "Continue Journey",
        href: "/my-journey",
        icon: <Rocket className="h-6 w-6" />,
        accentClass: "text-amber-500",
        glowClass: "shadow-[0_0_40px_rgba(245,158,11,0.12)]",
      };
    case "journey_complete":
      return {
        headline: "You've come a long way",
        description: goalTitle
          ? `You've done real work toward ${goalTitle}. Use your roadmap to keep tracking progress, or explore a new direction whenever you're ready.`
          : "You've built real clarity. Keep growing — your roadmap and new directions are always here.",
        buttonText: "View My Journey",
        href: "/my-journey",
        icon: <CheckCircle2 className="h-6 w-6" />,
        accentClass: "text-emerald-500",
        glowClass: "shadow-[0_0_40px_rgba(16,185,129,0.12)]",
      };
  }
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
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

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

  const { data: journeyData } = useQuery<{ success: boolean; journey: JourneyUIState }>({
    queryKey: ["journey-state"],
    queryFn: async () => {
      const response = await fetch("/api/journey");
      if (!response.ok) throw new Error("Failed to fetch journey state");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 2 * 60 * 1000,
  });

  const displayName = session?.user?.youthProfile?.displayName || "";
  const journey = journeyData?.journey ?? null;
  const primaryGoal = goalsData?.primaryGoal ?? null;
  const goalTitle = primaryGoal?.title ?? journey?.summary?.primaryGoal?.title ?? null;
  const hasGoal = !!goalTitle;

  // Determine user state and CTA
  const userState = getUserState(journey, hasGoal);

  // Find next step title
  const nextStep = journey?.steps.find(s => s.status === "next");
  const nextStepTitle = nextStep?.title ?? null;

  const cta = getPrimaryCTA(userState, goalTitle, nextStepTitle);

  // Journey progress
  const lenses = journey?.summary?.lenses;
  const overallProgress = journey?.summary?.overallProgress ?? 0;

  if (status === "loading" || session?.user.role !== "YOUTH") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-background text-foreground">
      <OnboardingWizard open={showOnboarding} onComplete={() => { setShowOnboarding(false); setOnboardingComplete(true); }} />

      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-6 sm:mb-8">
          <p className="text-sm text-muted-foreground/70 mb-1">
            {userState === "no_journey" ? "Welcome" : "Welcome back"}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1">
            {displayName}
          </h1>
          <p className="text-sm text-muted-foreground/60">
            {userState === "no_journey" && "Start by exploring what feels interesting to you."}
            {userState === "discover_active" && "You're starting to build a clearer picture."}
            {userState === "discover_done" && "You've done great reflection work so far."}
            {userState === "understand_active" && "You're learning what this path really looks like."}
            {userState === "act_active" && "You've already made progress — keep building from here."}
            {userState === "journey_complete" && "Your journey is always here when you need it."}
          </p>
        </div>

        {/* ── First-time Welcome ──────────────────────────────── */}
        {onboardingComplete && <WelcomeHero />}

        <div className="mb-5">
          <VerificationStatus compact />
        </div>

        {/* ── 1. Primary Action Card ─────────────────────────── */}
        <Link href={cta.href} className="block mb-6 group">
          <div className={cn(
            "relative overflow-hidden rounded-2xl border-2 p-6 sm:p-8 transition-all",
            "border-border/50 hover:border-border/80",
            cta.glowClass,
          )}>
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-card/90 to-muted/30 pointer-events-none" />

            <div className="relative">
              <div className={cn("inline-flex items-center justify-center p-2.5 rounded-xl mb-4", "bg-muted/60")}>
                <div className={cta.accentClass}>{cta.icon}</div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                {cta.headline}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-lg">
                {cta.description}
              </p>

              <div className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                "bg-foreground text-background",
                "group-hover:gap-3",
              )}>
                {cta.buttonText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </Link>

        {/* ── 2. Journey Snapshot ─────────────────────────────── */}
        {journey && lenses && (
          <GlassCard className="p-4 sm:p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Your Progress</h3>
                {goalTitle && (
                  <span className="text-[11px] text-muted-foreground/60 truncate max-w-[180px]">
                    — {goalTitle}
                  </span>
                )}
              </div>
              <Link href="/my-journey" className="text-[11px] text-teal-500 hover:text-teal-400 flex items-center gap-1">
                Full journey <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Stage progress bars */}
            <div className="grid grid-cols-3 gap-3">
              {LENS_LABELS.map(({ key, label }) => {
                const lens = lenses[key as keyof typeof lenses];
                const isActive = journey.currentLens === key.toUpperCase();
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn(
                        "text-[11px] font-medium",
                        lens.isComplete ? "text-emerald-500" :
                        isActive ? "text-foreground" : "text-muted-foreground/50"
                      )}>
                        {label}
                      </span>
                      {lens.isComplete && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                    </div>
                    <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          lens.isComplete ? "bg-emerald-500" :
                          isActive ? "bg-teal-400" : "bg-muted-foreground/20"
                        )}
                        style={{ width: `${lens.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {lens.completedMandatory.length}/{lens.totalMandatory} steps
                    </p>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {/* ── 3. Quick Actions ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              href: "/careers",
              icon: Compass,
              label: "Explore Careers",
              color: "text-teal-500",
              bg: "bg-teal-500/10",
            },
            {
              href: "/jobs",
              icon: Briefcase,
              label: "Small Jobs",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              href: "/advisor",
              icon: Sparkles,
              label: "AI Advisor",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="block group">
              <GlassCard className="p-4 text-center hover:border-border/60 transition-all h-full flex flex-col items-center justify-center gap-2.5">
                <div className={cn("p-2.5 rounded-xl", action.bg)}>
                  <action.icon className={cn("h-5 w-5", action.color)} />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {action.label}
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* ── 4. Goal (if set) — compact ──────────────────────── */}
        {primaryGoal && (
          <Link href="/my-journey" className="block group">
            <GlassCard className="p-4 hover:border-border/60 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10 shrink-0">
                  <Target className="h-4 w-4 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                    Primary Goal
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {primaryGoal.title}
                  </p>
                </div>
                <span className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
                  primaryGoal.status === "committed"
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-blue-500/15 text-blue-500"
                )}>
                  {primaryGoal.status === "committed" ? "Committed" : "Exploring"}
                </span>
              </div>
            </GlassCard>
          </Link>
        )}
        {/* ── 5. Personalised Recommendations ──────────────── */}
        <RecommendedCareers className="mt-2" limit={4} />
      </div>
    </div>
  );
}
