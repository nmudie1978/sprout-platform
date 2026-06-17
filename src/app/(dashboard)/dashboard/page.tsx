"use client";

import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/**
 * DASHBOARD PAGE — Information-Rich Overview
 *
 * Layout:
 * 1. Greeting header with date
 * 2. My Journey card (circular progress, stage, progress bar)
 * 3. Career Snapshot
 * 4. My Explored Journeys (left) + Saved Careers (right)
 * 5. Saved Resources (left) + Reflections (right)
 * 6. Industry Insights Ticker
 */

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Compass,
  TrendingUp,
  Lightbulb,
  Pencil,
  CheckCircle2,
  FileText,
  Clock,
  Ban,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  PlayCircle,
  Heart,
  X,
} from "lucide-react";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import { useAllInterestLevels } from "@/hooks/use-interest-level";
import { InterestLevelStars } from "@/components/interest-level/interest-level-rating";
import { WorthALook } from "@/components/dashboard/worth-a-look";
import type { GoalsResponse } from "@/lib/goals/types";
import { computeLensProgress, isJourneySnapshotWorthy, journeyStageLabel } from "@/lib/journey/lens-progress";
import { useLensProgressSync } from "@/hooks/use-lens-progress-sync";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrientationWalkthrough } from "@/components/onboarding/orientation-walkthrough";
import { RadarOnboardingWizard } from "@/components/onboarding/radar-onboarding-wizard";
import { LanguageDropdown } from "@/components/language-dropdown";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import type { Career } from "@/lib/career-pathways";
import { useCareerCatalog } from "@/hooks/use-career-catalog";
import { useDiscoverRecommendations } from "@/hooks/use-discover-recommendations";
import { WhatILikeTray } from "@/components/dashboard/what-i-like-tray";
import { RecommendedForYou } from "@/components/dashboard/recommended-for-you";
import type { RecommendationSignal } from "@/lib/discover/explored-recommendations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Target } from "lucide-react";
import { syncGuidanceGoal } from "@/lib/guidance/rules";
import { PageContext } from "@/components/ui/page-context";
import { GoalSelectionSheet } from "@/components/goals/GoalSelectionSheet";
import { useSubtleHint } from "@/hooks/use-subtle-hint";
import { SpotlightHint } from "@/components/ui/spotlight-hint";
import { DiscoveryNudge } from "@/components/discovery/discovery-nudge";
import { CareerTwinCta } from "@/components/career-twin/career-twin-cta";

// ── Glass Card ───────────────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
  style,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="relative">
      <div
        className={cn(
          "relative bg-card border border-border rounded-card",
          "shadow-sm hover:shadow-md",
          "transition-shadow duration-300",
          className,
        )}
        style={style}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}

// ── Dashboard Section ────────────────────────────────────────────────
// A bordered container with a section header — provides clear visual
// separation between dashboard areas (like the reference dashboard).
function DashboardSection({
  title,
  icon: Icon,
  iconColor = "text-muted-foreground/60",
  tooltip,
  action,
  children,
  className = "",
  fixedHeight,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  tooltip?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fixedHeight?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-col", className)}>
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2">
          {Icon && (
            <span title={tooltip}>
              <Icon className={cn("h-3.5 w-3.5", iconColor, tooltip && "cursor-help")} />
            </span>
          )}
          <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className={cn(
        "rounded-card border border-border bg-card p-3 sm:p-4 flex-1",
        "shadow-sm",
        fixedHeight,
      )}>
        {children}
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────
// Individual metric card for the top row (salary, growth, sector, etc.)
function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconColor = "text-primary",
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}) {
  return (
    <div className="rounded-control border border-border bg-card p-3 text-center shadow-sm">
      {Icon && (
        <div className="flex justify-center mb-1.5">
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      )}
      <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground leading-tight">{value}</p>
      {sublabel && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}

// ── Country flag helper ──────────────────────────────────────────────
// Maps a free-text country string (as stored on YouthProfile.country)
// to a Unicode flag emoji. We accept the country names actually used
// in the codebase plus a few obvious aliases. Returns null when we
// don't recognise the country, in which case the dashboard renders no
// flag at all rather than guessing wrong. New countries: just add the
// (name → ISO 3166-1 alpha-2) entry.
const COUNTRY_TO_ISO: Record<string, string> = {
  norway: 'NO', norge: 'NO',
  sweden: 'SE', sverige: 'SE',
  denmark: 'DK', danmark: 'DK',
  finland: 'FI', suomi: 'FI',
  iceland: 'IS', island: 'IS',
  germany: 'DE', deutschland: 'DE',
  france: 'FR',
  spain: 'ES',
  italy: 'IT',
  netherlands: 'NL', nederland: 'NL',
  belgium: 'BE',
  poland: 'PL',
  portugal: 'PT',
  ireland: 'IE',
  'united kingdom': 'GB', uk: 'GB', britain: 'GB',
  'united states': 'US', usa: 'US', us: 'US',
  canada: 'CA',
  australia: 'AU',
};
function countryFlagEmoji(countryName?: string | null): string | null {
  if (!countryName) return null;
  const iso = COUNTRY_TO_ISO[countryName.trim().toLowerCase()];
  if (!iso || iso.length !== 2) return null;
  // Regional indicator base offset — A = 0x1F1E6, so 'NO' becomes 🇳🇴.
  return String.fromCodePoint(
    iso.charCodeAt(0) - 65 + 0x1F1E6,
    iso.charCodeAt(1) - 65 + 0x1F1E6,
  );
}

// ── Circular Progress Ring ───────────────────────────────────────────
function ProgressRing({
  current,
  total,
  size = 80,
  strokeWidth = 6,
  active = false,
}: {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  /** When true (goal set), use teal/green instead of grey */
  active?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? current / total : 0;
  const offset = circumference - progress * circumference;

  // Animate the ring filling from empty → its real value once on mount.
  // We start the dashoffset fully "empty" (= circumference) and, after the
  // first paint, set it to the real offset so the existing
  // `transition-all duration-700` sweeps it into place. Users who prefer
  // reduced motion (or any SSR/no-JS render) see the final state instantly.
  const [animatedOffset, setAnimatedOffset] = useState(circumference);
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setAnimatedOffset(offset);
      return;
    }
    // rAF ensures the empty state paints before we transition to `offset`.
    const raf = requestAnimationFrame(() => setAnimatedOffset(offset));
    return () => cancelAnimationFrame(raf);
  }, [offset]);

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
          className={active ? "text-primary/20" : "text-muted/40"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-out",
            active ? "text-primary" : "text-muted-foreground/60"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-lg font-bold", active ? "text-primary" : "text-foreground")}>
          {current}/{total}
        </span>
      </div>
    </div>
  );
}

// ── Lens label mapping ───────────────────────────────────────────────
// `labelKey` points at the existing journey.* lens labels so the stage
// names stay consistent with the rest of the My Journey UI (and stay
// translated). `act` is the legacy step key for Clarity.
const LENS_LABELS = [
  { key: "discover", labelKey: "journey.discover.label" },
  { key: "understand", labelKey: "journey.understand.label" },
  { key: "act", labelKey: "journey.clarity.label" },
] as const;

// ── Main Page ────────────────────────────────────────────────────────
// ── Did You Know Card ───────────────────────────────────────────────
const DID_YOU_KNOW_FACTS = [
  { text: '39% of teenagers cannot name a career they expect to pursue.', source: 'OECD', href: '/about/research#oecd-career-uncertainty' },
  { text: '41% of young people are unsure how to choose their career path.', source: 'Gallup', href: '/about/research#gallup-path-uncertainty' },
  { text: '43% of students don\'t feel prepared for their future.', source: 'Gallup', href: '/about/research#gallup-preparedness' },
  { text: 'Only 45% of students have any real-world career exposure before leaving school.', source: 'OECD', href: '/about/research#oecd-job-shadowing' },
  { text: 'Career exploration leads to better employment outcomes later in life.', source: 'OECD', href: '/about/research#oecd-career-outcomes' },
  { text: 'Healthcare is one of the fastest-growing sectors in Norway.', source: 'SSB', href: '/insights' },
  { text: 'Over half of students plan to work in just 10 occupations.', source: 'OECD', href: '/about/research#oecd-top-ten-jobs' },
  { text: 'Only 35% of students have undertaken an internship before finishing education.', source: 'OECD', href: '/about/research#oecd-internships' },
];
const DID_YOU_KNOW_INTERVAL = 10000; // 10s, matching the insights Did-You-Know banner

function DidYouKnowCard() {
  const FACTS = DID_YOU_KNOW_FACTS;

  const [index, setIndex] = useState(() => Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % FACTS.length);
  const fact = FACTS[index];

  const refresh = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % FACTS.length);
  };

  // Auto-rotate to the next fact on a calm interval. Respect reduced-motion:
  // users who opt out of motion keep the daily fact and the manual refresh.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % DID_YOU_KNOW_FACTS.length);
    }, DID_YOU_KNOW_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-6 max-w-4xl mx-auto px-3 sm:px-6">
      <div className="rounded-card border border-accent/40 bg-accent/10 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-foreground mt-0.5 shrink-0">
            Did you know?
          </span>
          <a href={fact.href} className="flex-1 min-w-0 group">
            <p className="text-xs text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">
              {fact.text}
            </p>
          </a>
          <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{fact.source}</span>
          <button
            onClick={refresh}
            className="p-1 rounded-control text-muted-foreground/70 hover:text-foreground transition-colors shrink-0 hit-44"
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
  const t = useTranslations();
  const { getAllCareers } = useCareerCatalog();
  // Onboarding walkthrough
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  // Radar discovery wizard — the data-collecting step that runs straight
  // after the orientation tour on a genuine first-run. It persists
  // discoveryPreferences (warming up Career Radar + Recommendations) and
  // is fully skippable. Replays of the tour do NOT reopen it.
  const [showRadarWizard, setShowRadarWizard] = useState(false);
  const isReplayRef = useRef(false);
  const dismissedRef = useRef(false);
  const [careerMatchesCardDismissed, setCareerMatchesCardDismissed] = useState(true);
  useEffect(() => {
    setCareerMatchesCardDismissed(
      typeof window !== "undefined" &&
        window.localStorage.getItem("careerMatchesCardDismissed") === "1"
    );
  }, []);
  const dismissCareerMatchesCard = useCallback(() => {
    try { window.localStorage.setItem("careerMatchesCardDismissed", "1"); } catch {}
    setCareerMatchesCardDismissed(true);
  }, []);

  // "New here? Take a quick look around" first-run card — dismissible.
  const [firstRunCardDismissed, setFirstRunCardDismissed] = useState(true);
  useEffect(() => {
    setFirstRunCardDismissed(
      typeof window !== "undefined" &&
        window.localStorage.getItem("firstRunCardDismissed") === "1"
    );
  }, []);
  const dismissFirstRunCard = useCallback(() => {
    try { window.localStorage.setItem("firstRunCardDismissed", "1"); } catch {}
    setFirstRunCardDismissed(true);
  }, []);

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

  // Auto-open the radar onboarding wizard the FIRST time a brand-new user
  // lands on the dashboard. They came straight from signup with no
  // discovery preferences yet, and the wizard is the bridge that gets
  // them into the radar without making them hunt for it.
  useEffect(() => {
    if (isFirstLogin && !dismissedRef.current) {
      setShowOnboardingWizard(true);
    }
  }, [isFirstLogin]);

  const { data: goalsData } = useQuery<GoalsResponse>({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) return { primaryGoal: null };
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 5 * 60 * 1000,
  });

  // Unified dashboard stats — real-time from DB
  const { data: dashboardStats } = useQuery<{
    appStats: { applied: number; waiting: number; accepted: number; done: number };
    savedSummary: { total: number; byType: { articles: number; videos: number; podcasts: number; shorts: number } };
    savedItemsList: { id: string; title: string; type: string; url: string; thumbnail: string | null; source: string | null }[];
    exploredCareers: string[];
    careerInterests: string[];
    lastCompletedJob: { title: string; completedAt: string; location: string } | null;
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
    goals: { goalId: string; goalTitle: string; isActive: boolean; updatedAt: string }[];
  }>({
    queryKey: ["explored-goals"],
    queryFn: async () => {
      const response = await fetch("/api/journey/goal-data/list");
      if (!response.ok) return { goals: [] };
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    // Near-real-time, matching the saved-content query above. Exploring a NEW
    // journey in My Journey doesn't invalidate this key (it's a different
    // route), so the old 2-minute stale window meant returning to the
    // dashboard showed stale data until a full page reload. A 10s stale window
    // + refetch-on-focus means returning to the dashboard or refocusing the
    // tab refetches immediately, while still ignoring rapid (<10s) tab flips.
    staleTime: 10 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const queryClient = useQueryClient();

  // ── Delete handlers ──────────────────────────────────────────────
  const removeExploredJourney = useCallback(async (goalId: string) => {
    const res = await fetch(`/api/journey/goal-data?goalId=${goalId}`, { method: 'DELETE' });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["explored-goals"] });
    } else {
      // Intentional silent fallback: some responses are empty 204s;
       // returning null lets downstream code treat "no data" uniformly.
      const data = await res.json().catch(() => null);
      toast({ title: data?.error || 'Could not remove journey', variant: "destructive" });
    }
  }, [queryClient]);

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
      // Invalidate only the keys that actually depend on which goal
      // is primary. education-context is per-user, profile is derived
      // from goals already, and dashboard-stats aggregates job/journey
      // counts that don't change when a goal slot is reassigned.
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["explored-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-data"] });
      queryClient.invalidateQueries({ queryKey: ["discover-reflections"] });
      queryClient.invalidateQueries({ queryKey: ["career-insights"] });
      // No success toast here: the confirm dialog already gated intent and
      // the caller hard-navigates straight to My Journey, so a toast would
      // only flash for a frame before the page tears down. Landing on the
      // career's journey is the confirmation.
    },
    onError: () => {
      toast({ title: 'Failed to switch goal. Please try again.', variant: "destructive" });
    },
  });

  const interestLevels = useAllInterestLevels();
  const primaryGoal = goalsData?.primaryGoal ?? null;
  const goalTitle = primaryGoal?.title ?? null;

  // ── Journey progress (Discover / Understand / Clarity) ─────────
  // Derived directly from goalTitle so the ring updates in the same
  // render that the title changes — no useState/useEffect timing gap.
  // See lib/journey/lens-progress.ts for the rationale.
  // `lensTick` bumps once the server has hydrated the localStorage cache
  // (journeyCompletedSteps), so progress made on another device shows here.
  const lensTick = useLensProgressSync();
  const lensProgress = useMemo(
    () => computeLensProgress({ hasPrimaryGoal: !!goalTitle, careerTitle: goalTitle }),
    [goalTitle, lensTick],
  );

  const { discoverDone, understandDone, clarityDone, currentLens, completedCount: completedLensCount } =
    lensProgress;

  // Subtle hint — shows once when user has no goal, after 3s idle
  const dashboardHint = useSubtleHint({
    hintKey: "dashboard-goal-v3",
    enabled: !goalTitle && status !== "loading",
    delayMs: 3000,
    durationMs: 4000,
  });


  // Language toggle — always visible

  // Discover profile — "Who Am I" summary (generic across all goals)
  const { data: discoverData } = useDiscoverRecommendations(session?.user.role === "YOUTH");

  // Profile completion — lightweight check.
  // While guardian consent is still pending we poll every 15s and
  // refetch on window focus, so the dashboard updates as soon as the
  // parent confirms (instead of waiting up to 5 minutes for stale cache).
  // Once consent is granted the polling stops automatically.
  const { data: profileData } = useQuery<{
    displayName: string | null; bio: string | null; phoneNumber: string | null;
    city: string | null; country: string | null; availability: string | null; interests: string[];
    guardianEmail: string | null; guardianConsent: boolean;
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
    refetchOnWindowFocus: (query) => {
      const d = query.state.data;
      return !!(d && d.guardianEmail && !d.guardianConsent);
    },
    refetchInterval: (query) => {
      const d = query.state.data;
      return d && d.guardianEmail && !d.guardianConsent ? 15_000 : false;
    },
  });

  // Display name — prefer the live profile query so renaming in
  // /profile reflects here instantly (the NextAuth session is only
  // refreshed on sign-in, so the session value alone goes stale).
  const rawName =
    profileData?.displayName ||
    session?.user?.youthProfile?.displayName ||
    session?.user?.name ||
    "";
  const firstName = rawName.split(/\s+/)[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // Discovery preferences — extracted at component level for nudge
  const discoveryPrefs = useMemo(() => {
    const dp = (profileData as { discoveryPreferences?: { subjects?: string[]; starredSubjects?: string[]; workStyles?: string[]; peoplePref?: string; interests?: string[] } } | null)?.discoveryPreferences;
    if (!dp) return null;
    const hasData = (dp.subjects?.length ?? 0) > 0 || (dp.workStyles?.length ?? 0) > 0;
    return hasData ? dp : null;
  }, [profileData]);

  // Career detail sheet
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  const [journeyPage, setJourneyPage] = useState(0);
  // Journey the user has tapped in "My Explored Journeys" and is being
  // asked to confirm reloading. null = no confirmation pending.
  const [pendingReloadGoal, setPendingReloadGoal] = useState<string | null>(null);
  const goalCareer = useMemo(() => {
    if (!goalTitle) return null;
    const all = getAllCareers();
    // Normalise both sides before comparing so a stored goal title like
    // "Doctor / Physician" or "Nurse (Sykepleier)" still resolves to the
    // canonical catalogue entry ("Doctor", "Nurse"). Without this the
    // Career Snapshot card silently fails to render for any user whose
    // saved goal pre-dates the slash cleanup.
    const normalise = (s: string) => s.replace(/\s*\([^)]*\)\s*/g, ' ').trim().toLowerCase();
    const alternates = (s: string) =>
      normalise(s)
        .split(/\s*\/\s*|\s+or\s+/i)
        .map(p => p.trim())
        .filter(Boolean);

    // 1. Strict normalised match.
    const target = normalise(goalTitle);
    const direct = all.find((c) => normalise(c.title) === target);
    if (direct) return direct;

    // 2. Try each slash-separated alternate from the goal title.
    for (const alt of alternates(goalTitle)) {
      const hit = all.find((c) => normalise(c.title) === alt);
      if (hit) return hit;
    }

    // 3. Try the reverse — match a catalogue title that has any
    // alternate equal to the (cleaned) goal title.
    return all.find((c) => alternates(c.title).includes(target)) || null;
  }, [goalTitle, getAllCareers]);

  // Strengths surface elsewhere now (Career Radar / discoveryPreferences).
  // The dashboard no longer pulls them from the legacy journey summary.
  const strengths: string[] = [];

  // Real-time stats from DB
  const exploredCareers = dashboardStats?.exploredCareers ?? [];
  const careerInterests = dashboardStats?.careerInterests ?? [];
  const recentActivity = dashboardStats?.recentActivity ?? [];
  const { curiosities: savedCareers, removeCuriosity } = useCuriositySaves();


  // Durable "interest cluster" powering the Worth-a-look card: the careers the
  // user is circling (saved + interest-rated), NOT the volatile primary goal —
  // so it survives goal switches and works with no goal set.
  const worthALookCareerIds = useMemo(
    () => Array.from(new Set([
      ...savedCareers.map((c) => c.careerId),
      ...Object.keys(interestLevels),
    ])),
    [savedCareers, interestLevels],
  );

  // Seeds for the "Recommended for you" panel: every career the user has
  // engaged with, weighted so a highly-rated career pulls harder than a
  // paused/unrated one. Resolved to career ids (explored journeys come back
  // as titles, so we look them up).
  const recommendationSignals = useMemo<RecommendationSignal[]>(() => {
    const all = getAllCareers();
    const idByTitle = new Map(all.map((c) => [c.title.toLowerCase(), c.id]));
    const titleById = new Map(all.map((c) => [c.id, c.title]));
    const seeds = new Map<string, RecommendationSignal>();
    const bump = (s: RecommendationSignal) => {
      const prev = seeds.get(s.careerId);
      // Keep the strongest weight; prefer a 'rated' kind for its attribution.
      if (!prev || s.weight > prev.weight) seeds.set(s.careerId, s);
    };
    for (const g of exploredGoalsData?.goals ?? []) {
      const id = idByTitle.get(g.goalTitle.toLowerCase());
      if (id) bump({ careerId: id, weight: 2, kind: "explored", title: g.goalTitle });
    }
    for (const c of savedCareers) {
      bump({ careerId: c.careerId, weight: 2, kind: "saved", title: c.careerTitle });
    }
    for (const [careerId, rating] of Object.entries(interestLevels)) {
      if (!rating) continue;
      bump({
        careerId,
        weight: 2 + rating,
        kind: "rated",
        title: titleById.get(careerId) ?? seeds.get(careerId)?.title ?? careerId,
      });
    }
    return [...seeds.values()];
  }, [exploredGoalsData, savedCareers, interestLevels, getAllCareers]);

  const [savedCareersPage, setSavedCareersPage] = useState(0);
  const [savedCareerDetail, setSavedCareerDetail] = useState<Career | null>(null);
  const savedCareersPerPage = 4;
  const savedCareersPageCount = Math.max(1, Math.ceil(savedCareers.length / savedCareersPerPage));
  const savedCareersVisible = savedCareers.slice(
    savedCareersPage * savedCareersPerPage,
    savedCareersPage * savedCareersPerPage + savedCareersPerPage
  );

  // Date & greeting
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const hour = today.getHours();
  const timeGreeting = hour < 12 ? t('greeting.morning') : hour < 17 ? t('greeting.afternoon') : t('greeting.evening');

  if (status === "loading" || session?.user.role !== "YOUTH") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-pill border-2 border-muted-foreground/30 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] text-foreground dark:bg-background">
      {/* Guided orientation walkthrough — explains the platform. The user
          stays on the dashboard after finishing or cancelling it. */}
      <OrientationWalkthrough
        open={showOnboardingWizard}
        onComplete={() => {
          const wasReplay = isReplayRef.current;
          isReplayRef.current = false;
          dismissedRef.current = true;
          setShowOnboardingWizard(false);
          if (!wasReplay) {
            // Mark onboarding as seen the instant the tour is finished or
            // skipped, so "Let me show you around" never auto-opens again on a
            // later login — it stays reachable from the menu's replay button.
            // (Previously we left it unmarked and only the Radar wizard marked
            // completion, so a user who finished the tour but didn't finish the
            // wizard got the whole tour replayed next login.) We still hand off
            // to the Radar discovery wizard for THIS session to collect
            // discoveryPreferences; the user stays on the dashboard.
            void fetch("/api/onboarding", { method: "PATCH" }).catch(() => {});
            setShowRadarWizard(true);
          }
        }}
      />

      {/* First-run discovery wizard — runs immediately after the tour. Three
          short questions persist discoveryPreferences and prime the radar.
          Skippable + non-blocking; the component marks onboarding complete on
          finish or skip, then we refresh status so the dashboard reflects it. */}
      <RadarOnboardingWizard
        open={showRadarWizard}
        onComplete={() => {
          setShowRadarWizard(false);
          dismissedRef.current = true;
          refetchOnboarding();
        }}
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-5">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              {isFirstLogin ? (
                <>{t('greeting.welcome')}, <span className="text-foreground">{displayName}</span></>
              ) : (
                <><span className="text-foreground/90 font-normal">{timeGreeting}</span>{' '}<span className="text-foreground font-medium">{displayName}</span></>
              )}
            </h1>
            {/* Country flag — small, subtle. Only renders if we know
                the user's country. Localises the experience without
                being loud. Uses Unicode regional-indicator emojis so
                no asset files are needed. */}
            {(() => {
              const flag = countryFlagEmoji(profileData?.country);
              if (!flag) return null;
              return (
                <span
                  title={profileData?.country ?? undefined}
                  aria-label={`Country: ${profileData?.country ?? 'unknown'}`}
                  className="text-base opacity-70 hover:opacity-100 transition-opacity leading-none select-none"
                >
                  {flag}
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-3">
            {/* Replay walkthrough */}
            {!isFirstLogin && session?.user.role === "YOUTH" && (
              <button
                type="button"
                onClick={() => { isReplayRef.current = true; setShowOnboardingWizard(true); }}
                className="h-7 w-7 rounded-pill border border-border/40 bg-background/60 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/40 transition-colors hit-44"
                title="Replay app walkthrough"
              >
                <Compass className="h-3.5 w-3.5" />
              </button>
            )}
            {/* Language switcher — compact icon sitting beside the walkthrough
                control. This is the app's language entry point (the persistent
                top bar was removed to save space). */}
            <LanguageDropdown iconOnly />
            <span className="text-sm text-foreground/85">
              {dateStr}
            </span>
            {/* Guardian-consent signal — static dot with tooltip */}
            {profileData && profileData.guardianEmail && !profileData.guardianConsent && (
              <span
                title="Waiting on parental confirmation. Go to Profile to resend."
                className="relative flex h-2.5 w-2.5 cursor-default"
              >
                <span className="inline-flex h-2.5 w-2.5 rounded-pill bg-accent" />
              </span>
            )}
            {profileData && (() => {
              // Availability removed from the profile-complete checklist:
              // users were seeing "set your availability" even when it was
              // already set (edge cases between AvailabilityStatus enum and
              // the free-text availability string). It's a nice-to-have
              // not a gate — drop it and keep the 7 high-signal fields.
              const total = 7;
              let done = 0;
              if (profileData.displayName) done++;
              if (profileData.user?.dateOfBirth) done++;
              if (profileData.phoneNumber) done++;
              if (profileData.city) done++;
              if (profileData.bio) done++;
              if (profileData.interests?.length > 0) done++;
              if (goalTitle) done++;
              const pct = Math.round((done / total) * 100);
              return (
                <Link
                  href="/profile"
                  title={pct === 100 ? 'Profile complete' : `Profile ${pct}% complete`}
                  className="relative p-1.5 rounded-control hover:bg-muted/50 transition-colors group hit-44"
                >
                  <User className="h-4 w-4 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors" />
                </Link>
              );
            })()}
          </div>
        </div>

        <PageContext
          pageKey="dashboard"
          purpose={t('dashboard.pageContext')}
        />

        {/* ── First-action card ───────────────────────────────────
            Three states, in order of priority:
            1. First login + wizard not yet completed → open the wizard
            2. Wizard completed but radar empty → take them to the radar
            3. Radar populated but no goal yet → nudge them toward Career Radar
            Card disappears once they have a primary goal set.
        */}
        {(() => {
          // discoveryPreferences is a Json field on YouthProfile not declared
          // in the local profileData type — read it dynamically.
          const dp = (profileData as { discoveryPreferences?: { subjects?: string[]; workStyles?: string[] } } | null)?.discoveryPreferences;
          const hasDiscoveryPrefs = !!dp && (
            (dp.subjects?.length ?? 0) > 0 ||
            (dp.workStyles?.length ?? 0) > 0
          );
          const hasGoal = !!goalTitle;

          // State 1: brand-new user — the walkthrough auto-opens; this is a
          // fallback card in case they closed it without completing.
          if (isFirstLogin && !firstRunCardDismissed) {
            return (
              <div className="mb-6">
                <GlassCard className="relative overflow-hidden border-border/40">
                  <button
                    onClick={dismissFirstRunCard}
                    aria-label="Dismiss"
                    title="Dismiss"
                    className="absolute top-3 right-3 p-1.5 rounded-control text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-control bg-muted/30 shrink-0">
                        <Sparkles className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-foreground mb-1.5">
                          {t('firstLogin.cardTitle')}
                        </h2>
                        <p className="text-sm text-muted-foreground/70 leading-relaxed mb-4 max-w-md">
                          {t('firstLogin.cardDescription')}
                        </p>
                        <button
                          onClick={() => {
                            dismissedRef.current = true;
                            setShowOnboardingWizard(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-control bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
                        >
                          {t('firstLogin.startWalkthrough')}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          }

          // No separate guidance card — the My Journey card below handles
          // the "Choose a Primary Goal" nudge directly.
          return null;
        })()}

        {/* ── 1. My Journey Card ─────────────────────────────── */}
        {(() => {
          const journeyCard = (
          <GlassCard data-spotlight="journey-card" className={cn("p-5 sm:p-6 transition-all duration-300 border-primary/30 shadow-sm", goalTitle ? "hover:border-primary/50 hover:shadow-md" : "hover:border-primary/40")}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-control bg-muted/30">
                <span title={t('journey.progressTooltip')}><TrendingUp className="h-4 w-4 text-muted-foreground cursor-help" /></span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                  {goalTitle ? (
                    <>
                      {t('journey.cardTitle')} &mdash; {goalTitle}
                      {/* Subtle, calm "complete" cue once all three lenses are
                          done (3/3). A small check — never a star. */}
                      {completedLensCount === 3 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400/80">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          {t('dashboard.journeyComplete')}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {t('journey.cardTitle')}
                      <span className="text-muted-foreground/65 font-normal">&mdash;</span>
                      <Link
                        href="/careers/radar"
                        data-spotlight="choose-goal"
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:text-primary/80 transition-colors animate-pulse motion-reduce:animate-none"
                      >
                        {t('journey.chooseGoalPrompt')}
                      </Link>
                    </>
                  )}
                </h2>
                {goalTitle && (
                  <button
                    data-spotlight="change-button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowGoalSheet(true); }}
                    className="mt-0.5 -ml-1 inline-flex items-center gap-1 rounded-control px-1.5 py-0.5 text-xs font-medium capitalize text-sky-400/90 hover:text-sky-300 hover:bg-sky-400/10 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    {t('common.change')}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Progress ring */}
              <ProgressRing current={completedLensCount} total={3} active={!!goalTitle} />

              {/* Stage & progress bar */}
              <div className="flex-1 min-w-0">
                {/* Three-stage progress bar — the active stage label below
                    shows which stage you're on, so no separate "Current
                    stage: X" line needed (it duplicated the label). */}
                <div className="flex gap-1 mb-3">
                  {LENS_LABELS.map(({ key, labelKey }) => {
                    // `act` is the legacy key — the new lens-progress
                    // helper exposes Clarity as `clarity`.
                    const lensKey = key === 'act' ? 'clarity' : key;
                    const isActive = goalTitle && currentLens === lensKey;
                    const isLensDone =
                      lensKey === 'discover'
                        ? discoverDone
                        : lensKey === 'understand'
                          ? understandDone
                          : clarityDone;
                    return (
                      <div key={key} className="flex-1">
                        <div className={cn("h-1.5 rounded-pill overflow-hidden", goalTitle ? "bg-primary/15" : "bg-muted/40")}>
                          <div
                            className={cn(
                              "h-full rounded-pill transition-all duration-500",
                              isLensDone
                                ? goalTitle ? "bg-primary" : "bg-foreground/40"
                                : isActive
                                  // In-progress stage = the same green at half the
                                  // intensity of a completed (full bg-primary) stage,
                                  // giving the bar a flowing full→half→empty progression.
                                  ? "bg-primary/50"
                                  : "bg-transparent"
                            )}
                            style={{ width: isLensDone || isActive ? '100%' : '0%' }}
                          />
                        </div>
                        <p
                          className={cn(
                            "text-xs mt-1 text-center",
                            isActive
                              ? cn(
                                  goalTitle ? "text-primary font-semibold" : "text-foreground font-semibold",
                                  // Gently pulse the stage the user is currently on —
                                  // but once every stage is complete (3/3) there's
                                  // nothing left to nudge toward, so Clarity rests.
                                  completedLensCount < 3 && "animate-stage-pulse",
                                )
                              : "text-muted-foreground/65"
                          )}
                        >
                          {t(labelKey)}
                        </p>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Calm "resume" affordance — the whole card already links to
                /my-journey, but an explicit, named cue makes returning users
                feel invited back in (the cheap retention win). Shown only
                while a journey is in progress (not yet 3/3) so a finished
                journey rests. This is a styled <span> inside the parent
                <Link>, NOT a nested anchor. No streaks, no gamification. */}
            {goalTitle && completedLensCount < 3 && (
              <div className="mt-4 pt-3 border-t border-border/20">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                  <PlayCircle className="h-4 w-4 shrink-0" />
                  {t('journey.continueJourney')}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            )}

            </GlassCard>
          );
          return goalTitle ? (
            <Link href="/my-journey" className="block mb-6 group reveal-up">{journeyCard}</Link>
          ) : (
            <div className="block mb-6 reveal-up">{journeyCard}</div>
          );
        })()}

        {/* Who Am I lives at the bottom of the dashboard — see below
            DidYouKnowCard. Kept there so the top of the page stays
            focused on the active journey and today's actions. */}

        {/* Career Twin lives inside the journey card as a 3/3 completion
            reward (see journeyComplete variant above). In addition, a gentle
            21-day CHECK-IN surfaces here when (and only when) the user has
            been away long enough that the Twin would greet them as
            "returning" — the dashboard retention re-entry point. The card
            self-resolves the user's career and is dismissible; onlyWhenDue
            keeps it silent the rest of the time (no standing banner). */}
        <CareerTwinCta variant="dashboard" onlyWhenDue className="mb-6" />

        {/* ── Discovery Nudge — sparse, preference-based suggestion ── */}
        {discoveryPrefs && (
          <DiscoveryNudge
            preferences={discoveryPrefs}
            primaryGoal={goalTitle}
            className="mb-4"
          />
        )}

        {/* ── 4. My Explored Journeys + Saved Careers ─────────────── */}
        {/* mb-8 (not mb-4): give a clear gap before the Saved Resources /
            Worth-a-look row below so the two halves don't read as one block. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 reveal-up" style={{ animationDelay: "140ms" }}>
          <DashboardSection
            title={t('dashboard.exploredTitle')}
            icon={Target}
            iconColor="text-muted-foreground"
            tooltip={t('exploredJourneys.tooltip')}
            className="mb-0"
            fixedHeight="h-[180px] overflow-y-auto"
          >
          {(() => {
            const allExplored = exploredGoalsData?.goals ?? [];
            const exploredGoals = allExplored.filter((g) =>
              isJourneySnapshotWorthy(g.goalTitle),
            );
            const allCareers = getAllCareers();
            if (exploredGoals.length === 0) {
              return (
                <p className="text-xs text-muted-foreground/70">{t('exploredJourneys.emptyState')}</p>
              );
            }
            const sorted = [...exploredGoals].sort((a, b) => {
              const aActive = a.goalTitle === goalTitle;
              const bActive = b.goalTitle === goalTitle;
              if (aActive && !bActive) return -1;
              if (!aActive && bActive) return 1;
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
            const PAGE_SIZE = 3;
            const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
            const page = Math.min(Math.max(0, journeyPage), totalPages - 1);
            const pageGoals = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

            return (
              <>
                <div className="rounded-control border border-border/60 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 border-b border-border/40 bg-muted/20">
                        <th className="px-2.5 py-1.5">{t('exploredJourneys.career')}</th>
                        <th className="px-2 py-1.5 w-16 text-center">{t('exploredJourneys.stage')}</th>
                        <th className="px-2 py-1.5 w-24 text-center">{t('exploredJourneys.interest')}</th>
                        <th className="px-2 py-1.5 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {pageGoals.map((goal) => {
                        const career = allCareers.find((c) => c.title === goal.goalTitle);
                        const isCurrentGoal = goal.goalTitle === goalTitle;
                        const stageInfo = journeyStageLabel(goal.goalTitle);
                        const stageLabel = stageInfo?.label ?? 'Discover';
                        const stageLetter = stageLabel === 'Clarity' || stageLabel === 'Complete' ? 'C' : stageLabel === 'Understand' ? 'U' : 'D';
                        const stageTooltip = stageLabel === 'Clarity' || stageLabel === 'Complete' ? t('dashboard.stageCompleteTooltip') : stageLabel === 'Understand' ? t('dashboard.stageUnderstandTooltip') : t('dashboard.stageDiscoverTooltip');
                        const stageColor = stageLetter === 'C' ? 'text-primary bg-primary/15' : stageLetter === 'U' ? 'text-primary/80 bg-primary/10' : 'text-muted-foreground bg-muted';
                        return (
                          <tr
                            key={goal.goalId}
                            onClick={() => {
                              // Reloading an already-explored journey makes it
                              // the active goal again and jumps into My Journey.
                              // Ask the user to confirm first so an accidental
                              // tap doesn't switch their active journey out from
                              // under them. The previous goal stays saved here
                              // (reversible), so this is a resume, not a new
                              // commitment — but it's still a context switch.
                              if (isCurrentGoal || switchGoalMutation.isPending) return;
                              setPendingReloadGoal(goal.goalTitle);
                            }}
                            title={isCurrentGoal ? undefined : switchGoalMutation.isPending ? 'Reloading…' : `Reload your ${goal.goalTitle} journey`}
                            className={cn(
                              "transition-colors",
                              isCurrentGoal ? "bg-muted/20" : "hover:bg-muted/30 cursor-pointer",
                              switchGoalMutation.isPending && "opacity-60 pointer-events-none",
                            )}
                          >
                            <td className="px-2.5 py-1.5">
                              <span className="flex items-center gap-2 min-w-0">
                                <span className="text-sm shrink-0">{career?.emoji ?? "🎯"}</span>
                                <span className={cn("text-xs truncate", isCurrentGoal ? "font-medium text-foreground" : "text-foreground/75")}>
                                  {goal.goalTitle}
                                </span>
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className={cn("inline-flex items-center justify-center h-5 w-5 rounded-control text-xs font-bold cursor-help", stageColor)} title={stageTooltip}>{stageLetter}</span>
                            </td>
                            <td className="px-2 py-1.5">
                              <span className="flex items-center justify-center">
                                {career && interestLevels[career.id] ? (
                                  <InterestLevelStars value={interestLevels[career.id]} />
                                ) : (
                                  <span className="text-xs text-muted-foreground/60">—</span>
                                )}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              {!isCurrentGoal && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeExploredJourney(goal.goalId);
                                  }}
                                  className="p-0.5 rounded-control hit-44 text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Remove journey"
                                  aria-label={`Remove ${goal.goalTitle}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      onClick={() => setJourneyPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-0.5 rounded-control hit-44 text-muted-foreground/60 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <span className="text-xs text-muted-foreground/60 tabular-nums">{page + 1}/{totalPages}</span>
                    <button
                      onClick={() => setJourneyPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-0.5 rounded-control hit-44 text-muted-foreground/60 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
          </DashboardSection>

          <AlertDialog
            open={pendingReloadGoal !== null}
            onOpenChange={(open) => {
              if (!open) setPendingReloadGoal(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('dashboard.reloadTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('dashboard.reloadBodyPrefix')}{" "}
                  <span className="font-medium text-foreground">{pendingReloadGoal}</span>{" "}
                  {t('dashboard.reloadBodySuffix')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  disabled={switchGoalMutation.isPending}
                  onClick={() => {
                    const goalToLoad = pendingReloadGoal;
                    if (!goalToLoad) return;
                    setPendingReloadGoal(null);
                    switchGoalMutation.mutate(goalToLoad, {
                      onSuccess: () => window.location.assign("/my-journey"),
                    });
                  }}
                >
                  {t('dashboard.reloadConfirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* ── Saved Careers (Row A right column) ── */}
          <DashboardSection
            title={t('savedCareers.title')}
            icon={Heart}
            iconColor="text-muted-foreground"
            tooltip={t('savedCareers.tooltip')}
            className="mb-0"
            fixedHeight="h-[180px] overflow-y-auto"
            action={
              <Link href="/library?tab=saved" className="text-xs text-primary/70 hover:text-primary transition-colors">
                {t('dashboard.seeAll')} →
              </Link>
            }
          >
            {savedCareers.length > 0 ? (
              <>
                <div className="divide-y divide-border/60 rounded-control border border-border/60 overflow-hidden bg-muted/10">
                  {savedCareersVisible.map((c) => (
                    <div
                      key={c.careerId}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs hover:bg-muted/40 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const found = getAllCareers().find((x) => x.id === c.careerId);
                          if (found) setSavedCareerDetail(found);
                        }}
                        className="press flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <span className="shrink-0 text-sm">{c.careerEmoji}</span>
                        <span className="text-muted-foreground/70 truncate flex-1">{c.careerTitle}</span>
                      </button>
                      {interestLevels[c.careerId] && (
                        <InterestLevelStars value={interestLevels[c.careerId]} className="shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground/60 shrink-0">
                        {(() => {
                          const s = Math.floor((Date.now() - new Date(c.savedAt).getTime()) / 1000);
                          if (s < 60) return 'now';
                          if (s < 3600) return `${Math.floor(s / 60)}m`;
                          if (s < 86400) return `${Math.floor(s / 3600)}h`;
                          return `${Math.floor(s / 86400)}d`;
                        })()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCuriosity(c.careerId);
                        }}
                        className="p-0.5 rounded-control hit-44 text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        title="Remove"
                        aria-label={`Remove ${c.careerTitle}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {savedCareersPageCount > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setSavedCareersPage((p) => Math.max(0, p - 1))}
                      disabled={savedCareersPage === 0}
                      className="p-0.5 hit-44 text-muted-foreground/70 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={t('common.previousPage')}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <span className="text-xs text-muted-foreground/65 tabular-nums">
                      {savedCareersPage + 1} / {savedCareersPageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSavedCareersPage((p) => Math.min(savedCareersPageCount - 1, p + 1))}
                      disabled={savedCareersPage >= savedCareersPageCount - 1}
                      className="p-0.5 hit-44 text-muted-foreground/70 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={t('common.nextPage')}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground/70">{t('savedCareers.emptyState')}</p>
            )}
          </DashboardSection>
        </div>

        {/* ── 5. Saved Resources + Reflections (Row B — 2-col grid) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 items-stretch reveal-up" style={{ animationDelay: "210ms" }}>
          {/* Recommended for you — careers adjacent to what the user has
              explored/saved/rated. Replaces the old "Saved Resources" panel,
              which sat empty for almost everyone (saved resources still live
              in My Library). Always personalised once a journey is started. */}
          <DashboardSection
            title={t('dashboard.recommendedTitle')}
            icon={Lightbulb}
            iconColor="text-amber-400"
            tooltip={t('dashboard.recommendedTooltip')}
            className="mb-0"
            fixedHeight="h-[180px] overflow-y-auto"
            action={
              <Link href="/careers" className="text-xs text-primary/70 hover:text-primary transition-colors">
                {t('dashboard.seeAll')} →
              </Link>
            }
          >
            <RecommendedForYou signals={recommendationSignals} onSelect={setSavedCareerDetail} />
          </DashboardSection>

          {/* ── Worth a look — fresh, verified world-of-work reads, gently
              leaned toward the sectors the user keeps exploring. Replaces the
              old Reflections preview; the full reflections history lives in
              My Library. ── */}
          <DashboardSection
            title={t('dashboard.worthALookTitle')}
            icon={Sparkles}
            iconColor="text-violet-400"
            tooltip={t('dashboard.worthALookTooltip')}
            className="mb-0"
            fixedHeight="h-[180px] overflow-y-auto"
            action={
              <Link href="/insights" className="text-xs text-primary/70 hover:text-primary transition-colors">
                {t('dashboard.more')} →
              </Link>
            }
          >
            <WorthALook careerIds={worthALookCareerIds} />
          </DashboardSection>
        </div>

        {/* The Small Jobs marketplace tile was removed — the jobs marketplace
            is permanently discontinued (see CLAUDE.md <removed_features_strict>),
            so it must not be re-enableable via an env flag. */}

      </div>

      {/* ── 6. Industry Insights Ticker ─────────────────────── */}
      <DidYouKnowCard />

      {/* Right-edge slide-out: the user's Career Radar profile summary.
          Named "What I Like" to stay consistent with the Radar's own
          label. Mounts only when discoveryPreferences is populated —
          the tray component itself guards on that. */}
      <WhatILikeTray />

      {/* Career Detail Sheet */}
      <CareerDetailSheet
        career={showGoalDetail ? goalCareer : null}
        onClose={() => setShowGoalDetail(false)}
      />

      <CareerDetailSheet
        career={savedCareerDetail}
        onClose={() => setSavedCareerDetail(null)}
      />

      {/* Goal Selection Sheet */}
      <GoalSelectionSheet
        open={showGoalSheet}
        onClose={() => setShowGoalSheet(false)}
        targetSlot="primary"
        primaryGoal={primaryGoal}
        onSuccess={() => setShowGoalSheet(false)}
      />


      {/* Spotlight — guides new users to choose a Primary Goal */}
      <SpotlightHint
        visible={dashboardHint.visible}
        onDismiss={dashboardHint.dismiss}
        text="Choose a career goal to start your journey"
        targetSelector='[data-spotlight="journey-card"]'
      />

    </div>
  );
}
