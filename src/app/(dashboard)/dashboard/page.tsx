"use client";

import { toast } from "sonner";

/**
 * DASHBOARD PAGE — Information-Rich Overview
 *
 * Layout:
 * 1. Greeting header with date
 * 2. My Journey card (circular progress, stage, progress bar)
 * 3. Career Snapshot (left) + Previously Explored Journeys (right)
 * 4. My Library (left) + Saved Careers (right)
 * 5. My Small Jobs (dedicated section)
 * 6. Industry Insights Ticker
 */

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
  PlayCircle,
  Heart,
} from "lucide-react";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import type { GoalsResponse } from "@/lib/goals/types";
import { computeLensProgress, isJourneySnapshotWorthy, journeyStageLabel } from "@/lib/journey/lens-progress";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrientationWalkthrough } from "@/components/onboarding/orientation-walkthrough";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { VerificationStatus } from "@/components/verification-status";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import { getAllCareers, getSectorForCareer } from "@/lib/career-pathways";
import { useDiscoverRecommendations } from "@/hooks/use-discover-recommendations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Target } from "lucide-react";
import { syncGuidanceGoal } from "@/lib/guidance/rules";
import { PageContext } from "@/components/ui/page-context";
import { GoalSelectionSheet } from "@/components/goals/GoalSelectionSheet";
import { useSubtleHint } from "@/hooks/use-subtle-hint";
import { SpotlightHint } from "@/components/ui/spotlight-hint";

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
          "relative bg-card border border-border/30 rounded-2xl",
          "shadow-[0_0_15px_rgba(255,255,255,0.02),0_0_30px_rgba(255,255,255,0.01)]",
          "hover:shadow-[0_0_20px_rgba(255,255,255,0.04),0_0_40px_rgba(255,255,255,0.02)]",
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
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  tooltip?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2">
          {Icon && (
            <span title={tooltip}>
              <Icon className={cn("h-3.5 w-3.5", iconColor, tooltip && "cursor-help")} />
            </span>
          )}
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="rounded-2xl border border-border/30 bg-card/50 p-3 sm:p-4">
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
  iconColor = "text-teal-500",
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border/30 bg-card p-3 text-center">
      {Icon && (
        <div className="flex justify-center mb-1.5">
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      )}
      <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-bold text-foreground/85 leading-tight">{value}</p>
      {sublabel && (
        <p className="text-[9px] text-muted-foreground/40 mt-0.5">{sublabel}</p>
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

// ── Library Card with View Toggle ────────────────────────────────────
function LibraryCard({
  items,
  total,
}: {
  items: { title: string; type: string; url: string; thumbnail: string | null; source: string | null }[];
  total: number;
}) {
  const t = useTranslations();
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [libPage, setLibPage] = useState(0);
  const PAGE_SIZE = 3;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(libPage, totalPages - 1);
  const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <GlassCard className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <span title="Articles, videos, and resources you've saved from Industry Insights."><BookmarkCheck className="h-3.5 w-3.5 text-blue-500 cursor-help" /></span>
        <h3 className="text-xs font-semibold">My Library</h3>
        {total > 0 && (
          <span className="text-[10px] text-muted-foreground/40">{total}</span>
        )}
        <span className="flex-1" />
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
                  item.type === 'VIDEO' ? 'bg-muted/20 text-muted-foreground/60' :
                  item.type === 'ARTICLE' ? 'bg-muted/20 text-muted-foreground/60' :
                  'bg-muted/20 text-muted-foreground/60'
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
        <p className="text-xs text-muted-foreground/50 mt-1">{t('library.emptyState')}</p>
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
          className={active ? "text-teal-500/20" : "text-muted/40"}
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
          className={cn(
            "transition-all duration-700",
            active ? "text-teal-500" : "text-muted-foreground/60"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-lg font-bold", active ? "text-teal-500" : "text-foreground")}>
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
  { key: "act", label: "Clarity" },
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
      <div className="rounded-xl border border-amber-700/20 bg-amber-900/[0.06] px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/60 mt-0.5 shrink-0">
            Did you know?
          </span>
          <a href={fact.href} className="flex-1 min-w-0 group">
            <p className="text-xs text-foreground/70 leading-relaxed group-hover:text-foreground/90 transition-colors">
              {fact.text}
            </p>
          </a>
          <span className="text-[9px] text-muted-foreground/35 shrink-0 mt-0.5">{fact.source}</span>
          <button
            onClick={refresh}
            className="p-1 rounded-md text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0"
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
  // Onboarding walkthrough
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
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
      if (!response.ok) return { primaryGoal: null, secondaryGoal: null };
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 5 * 60 * 1000,
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
    goals: { goalId: string; goalTitle: string; isActive: boolean; updatedAt: string }[];
  }>({
    queryKey: ["explored-goals"],
    queryFn: async () => {
      const response = await fetch("/api/journey/goal-data/list");
      if (!response.ok) return { goals: [] };
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    // Always refetch when the dashboard mounts or regains focus — otherwise
    // journey progress made elsewhere (e.g. /my-journey, career details) is
    // invisible here until the cache expires.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
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
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["explored-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-data"] });
      queryClient.invalidateQueries({ queryKey: ["discover-reflections"] });
      queryClient.invalidateQueries({ queryKey: ["education-context"] });
      // Nudge the user toward My Journey so they start exploring the
      // career in depth. The toast stays for 8s and has a clickable
      // action that navigates directly.
      toast.success(`${goalTitle} set as your Primary Goal`, {
        description: t('switchGoal.toastDescription'),
        duration: 8000,
        action: {
          label: t('switchGoal.goToJourney'),
          onClick: () => window.location.assign("/my-journey#discover"),
        },
      });
    },
  });

  const primaryGoal = goalsData?.primaryGoal ?? null;
  const _secondaryGoal = goalsData?.secondaryGoal; // Available for future use
  const goalTitle = primaryGoal?.title ?? null;

  // ── Journey progress (Discover / Understand / Clarity) ─────────
  // Derived directly from goalTitle so the ring updates in the same
  // render that the title changes — no useState/useEffect timing gap.
  // See lib/journey/lens-progress.ts for the rationale.
  const lensProgress = useMemo(
    () => computeLensProgress({ hasPrimaryGoal: !!goalTitle, careerTitle: goalTitle }),
    [goalTitle],
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

  // Language prompt — show once per account, not per session
  const { currentLocale, toggleLocale, isPending: isLocalePending } = useLocaleSwitch();
  const [showLangPrompt, setShowLangPrompt] = useState(false);
  useEffect(() => {
    if (status === "loading") return;
    try {
      if (!localStorage.getItem("lang-chosen")) setShowLangPrompt(true);
    } catch { /* noop */ }
  }, [status]);
  const pickLanguage = (switchToNorsk: boolean) => {
    if (switchToNorsk && currentLocale === "en-GB") toggleLocale();
    else if (!switchToNorsk && currentLocale === "nb-NO") toggleLocale();
    try { localStorage.setItem("lang-chosen", "1"); } catch { /* noop */ }
    setShowLangPrompt(false);
  };

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
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Career detail sheet
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  const [journeyPage, setJourneyPage] = useState(0);
  const [switchConfirm, setSwitchConfirm] = useState<{ goalTitle: string; emoji: string } | null>(null);
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
  }, [goalTitle]);

  // Strengths surface elsewhere now (Career Radar / discoveryPreferences).
  // The dashboard no longer pulls them from the legacy journey summary.
  const strengths: string[] = [];

  // Real-time stats from DB
  const exploredCareers = dashboardStats?.exploredCareers ?? [];
  const careerInterests = dashboardStats?.careerInterests ?? [];
  const savedSummary = dashboardStats?.savedSummary ?? {
    total: 0,
    byType: { articles: 0, videos: 0, podcasts: 0, shorts: 0 },
  };
  const savedItemsList = dashboardStats?.savedItemsList ?? [];
  const recentActivity = dashboardStats?.recentActivity ?? [];
  const { curiosities: savedCareers } = useCuriositySaves();
  const [savedCareersPage, setSavedCareersPage] = useState(0);
  const [savedCareerDetail, setSavedCareerDetail] = useState<ReturnType<typeof getAllCareers>[number] | null>(null);
  const savedCareersPerPage = 5;
  const savedCareersPageCount = Math.max(1, Math.ceil(savedCareers.length / savedCareersPerPage));
  const savedCareersVisible = savedCareers.slice(
    savedCareersPage * savedCareersPerPage,
    savedCareersPage * savedCareersPerPage + savedCareersPerPage
  );

  // Application stats
  const appStats = dashboardStats?.appStats ?? {
    applied: 0,
    waiting: 0,
    accepted: 0,
    done: 0,
  };

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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-background text-foreground">
      {/* Guided orientation walkthrough — explains the platform, lands on Career Radar */}
      <OrientationWalkthrough
        open={showOnboardingWizard}
        onComplete={() => {
          const wasReplay = isReplayRef.current;
          isReplayRef.current = false;
          dismissedRef.current = true;
          setShowOnboardingWizard(false);
          if (!wasReplay) {
            // First-run: mark onboarding done + route to Career Radar
            fetch("/api/onboarding", { method: "PATCH" }).catch(() => {});
            refetchOnboarding();
            window.location.href = "/careers/radar";
          }
        }}
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-5">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {isFirstLogin ? (
                <>{t('greeting.welcome')}, <span className="text-foreground">{displayName}</span></>
              ) : (
                <><span className="text-muted-foreground/70 font-normal">{timeGreeting}</span>{' '}<span className="text-muted-foreground/70 font-normal">{displayName}</span></>
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
                className="h-7 w-7 rounded-full border border-border/40 bg-background/60 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/40 transition-colors"
                title="Replay app walkthrough"
              >
                <Compass className="h-3.5 w-3.5" />
              </button>
            )}
            {/* Language prompt — shown once, then saved permanently */}
            {showLangPrompt && !isLocalePending && (
              <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-card px-2 py-1">
                <button
                  onClick={() => pickLanguage(false)}
                  className={cn("px-2 py-0.5 rounded text-[10px] font-medium transition-colors", currentLocale === "en-GB" ? "bg-foreground/10 text-foreground" : "text-muted-foreground/50 hover:text-foreground")}
                >
                  EN
                </button>
                <span className="text-muted-foreground/20 text-[10px]">|</span>
                <button
                  onClick={() => pickLanguage(true)}
                  className={cn("px-2 py-0.5 rounded text-[10px] font-medium transition-colors", currentLocale === "nb-NO" ? "bg-foreground/10 text-foreground" : "text-muted-foreground/50 hover:text-foreground")}
                >
                  NO
                </button>
              </div>
            )}
            <span className="text-sm text-muted-foreground/60">
              {dateStr}
            </span>
            {/* Guardian-consent signal — static dot with tooltip */}
            {profileData && profileData.guardianEmail && !profileData.guardianConsent && (
              <span
                title="Waiting on parental confirmation. Go to Profile to resend."
                className="relative flex h-2.5 w-2.5 cursor-default"
              >
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              </span>
            )}
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
              return (
                <Link
                  href="/profile"
                  title={pct === 100 ? 'Profile complete' : `Profile ${pct}% complete`}
                  className="relative p-1.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <User className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </Link>
              );
            })()}
          </div>
        </div>

        <PageContext
          pageKey="dashboard"
          purpose="A snapshot of your journeys, activity, and saved content."
        />

        <VerificationStatus compact />

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
          if (isFirstLogin) {
            return (
              <div className="mb-6">
                <GlassCard className="relative overflow-hidden border-border/40">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-muted/30 shrink-0">
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
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/90 hover:bg-foreground text-background text-sm font-medium transition-colors"
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
          <GlassCard data-spotlight="journey-card" className={cn("p-5 sm:p-6 transition-all duration-300 border-teal-500/30 shadow-[0_0_25px_rgba(20,184,166,0.12),0_0_50px_rgba(20,184,166,0.06)] ring-1 ring-teal-500/15", goalTitle ? "hover:border-teal-500/45 hover:shadow-[0_0_35px_rgba(20,184,166,0.18),0_0_70px_rgba(20,184,166,0.08)]" : "hover:border-teal-500/35")}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-muted/30">
                <span title="Your journey tracks progress through Discover, Understand, and Clarity."><TrendingUp className="h-4 w-4 text-muted-foreground cursor-help" /></span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                  {goalTitle ? (
                    <>
                      {t('journey.cardTitle')} &mdash; {goalTitle}
                    </>
                  ) : (
                    t('journey.cardTitle')
                  )}
                </h2>
                <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
                  {goalTitle ? (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowGoalSheet(true); }}
                      className="text-[9px] text-muted-foreground/40 hover:text-muted-foreground transition-colors font-medium"
                    >
                      {t('common.change')}
                    </button>
                  ) : (
                    <Link href="/careers/radar" data-spotlight="choose-goal" className="text-teal-500/70 hover:text-teal-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                      {t('journey.chooseGoalPrompt')} &rarr;
                    </Link>
                  )}
                </p>
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
                  {LENS_LABELS.map(({ key, label }) => {
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
                        <div className={cn("h-1.5 rounded-full overflow-hidden", goalTitle ? "bg-teal-500/15" : "bg-muted/40")}>
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isLensDone
                                ? goalTitle ? "bg-teal-500" : "bg-foreground/40"
                                : "bg-transparent"
                            )}
                            style={{ width: isLensDone ? '100%' : '0%' }}
                          />
                        </div>
                        <p
                          className={cn(
                            "text-[10px] mt-1 text-center",
                            isActive
                              ? goalTitle ? "text-teal-500 font-semibold" : "text-foreground font-semibold"
                              : "text-muted-foreground/40"
                          )}
                        >
                          {label}
                        </p>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Subtle completion indicator — replaces the old congrats
                banner that used to render here. The full celebration
                stays inside the Clarity tab's ClarityCompletionCard so the
                congratulatory moment happens in context. On the
                Dashboard we only need a quiet marker that this journey
                is complete, consistent across refresh and revisit. */}
            {completedLensCount === 3 && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/70">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>{t('journey.completeIndicator')}</span>
              </div>
            )}

          </GlassCard>
          );
          return goalTitle ? (
            <Link href="/my-journey" className="block mb-6 group">{journeyCard}</Link>
          ) : (
            <div className="block mb-6">{journeyCard}</div>
          );
        })()}

        {/* ── 2. Career Snapshot — stat cards row ────────────── */}
        <DashboardSection
          title="Career Snapshot"
          icon={Search}
          iconColor="text-teal-500"
          tooltip="Key facts about your chosen career — salary, growth, sector, and pension."
        >
          {goalCareer ? (
            (() => {
              const sector = getSectorForCareer(goalCareer.id);
              const sectorLabel = sector === 'public' ? 'Public' : sector === 'private' ? 'Private' : 'Mixed';
              const pensionLabel = sector === 'public' ? 'Strong' : sector === 'private' ? 'Varies' : 'Mixed';
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatCard
                    label="Salary"
                    value={goalCareer.avgSalary.replace(/\s*kr\/year.*/i, '').replace(/(\d{3}),000/g, (_, n: string) => n + 'k').replace(/,000/g, 'k').trim()}
                    sublabel="kr / year"
                    icon={TrendingUp}
                  />
                  <StatCard
                    label="Growth"
                    value={goalCareer.growthOutlook.charAt(0).toUpperCase() + goalCareer.growthOutlook.slice(1)}
                    sublabel="Job outlook"
                    icon={Rocket}
                    iconColor="text-emerald-500"
                  />
                  <StatCard
                    label="Sector"
                    value={sectorLabel}
                    sublabel={sector === 'public' ? 'Government funded' : sector === 'private' ? 'Commercial' : 'Both sectors'}
                    icon={Briefcase}
                    iconColor="text-blue-500"
                  />
                  <StatCard
                    label="Pension"
                    value={pensionLabel}
                    sublabel={sector === 'public' ? 'Defined benefit' : 'Employer dependent'}
                    icon={CheckCircle2}
                    iconColor="text-violet-500"
                  />
                </div>
              );
            })()
          ) : (
            <p className="text-xs text-muted-foreground/40 py-2">
              Choose a Primary Goal to see career info
            </p>
          )}
        </DashboardSection>

        {/* ── 3. Who Am I ────────────────────────────────────── */}
        {discoverData?.hasProfile && discoverData.summary && (
          <DashboardSection
            title="Who Am I"
            icon={Sparkles}
            iconColor="text-muted-foreground/60"
          >
            <Link href="/my-journey" className="block group">
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                {discoverData.summary}
              </p>
              {discoverData.signals?.topTags && discoverData.signals.topTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {discoverData.signals.topTags.slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium bg-muted/20 text-muted-foreground/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </DashboardSection>
        )}

        {/* ── 4. Explored Journeys + Saved Careers ────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Previously Explored Journeys */}
          <DashboardSection
            title="Explored Journeys"
            icon={Target}
            iconColor="text-violet-500"
            tooltip="Every journey you start is saved here. Switch between them anytime."
            className="mb-0"
          >
          {(() => {
            const allExplored = exploredGoalsData?.goals ?? [];
            const exploredGoals = allExplored.filter((g) =>
              isJourneySnapshotWorthy(g.goalTitle),
            );
            const allCareers = getAllCareers();
            if (exploredGoals.length === 0) {
              return (
                <p className="text-xs text-muted-foreground/50">{t('exploredJourneys.emptyState')}</p>
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
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground/50 border-b border-border/40 bg-muted/20">
                        <th className="px-2.5 py-1.5">Career</th>
                        <th className="px-2 py-1.5 w-16 text-center">Stage</th>
                        <th className="px-2 py-1.5 w-14 text-center">Status</th>
                        <th className="px-2 py-1.5 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {pageGoals.map((goal) => {
                        const career = allCareers.find((c) => c.title === goal.goalTitle);
                        const isCurrentGoal = goal.goalTitle === goalTitle;
                        const stageInfo = journeyStageLabel(goal.goalTitle);
                        const stageLabel = stageInfo?.label ?? 'Discover';
                        const stageDotColor =
                          stageLabel === 'Complete'
                            ? 'bg-foreground/60'
                            : 'bg-muted-foreground/30';
                        return (
                          <tr
                            key={goal.goalId}
                            onClick={() => {
                              if (!isCurrentGoal) setSwitchConfirm({ goalTitle: goal.goalTitle, emoji: career?.emoji ?? "🎯" });
                            }}
                            className={cn(
                              "transition-colors",
                              isCurrentGoal ? "bg-muted/20" : "hover:bg-muted/30 cursor-pointer",
                            )}
                          >
                            <td className="px-2.5 py-1.5">
                              <span className="flex items-center gap-2 min-w-0">
                                <span className="text-sm shrink-0">{career?.emoji ?? "🎯"}</span>
                                <span className={cn("text-[11px] truncate", isCurrentGoal ? "font-medium text-foreground" : "text-foreground/75")}>
                                  {goal.goalTitle}
                                </span>
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className={cn("inline-block h-2 w-2 rounded-full", stageDotColor)} title={stageLabel} />
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {isCurrentGoal ? (
                                <span className="text-[8px] font-medium text-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded-full">Primary Goal</span>
                              ) : (
                                <span className="text-[8px] text-muted-foreground/40">Saved</span>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              {!isCurrentGoal && <ArrowRight className="h-3 w-3 text-muted-foreground/20" />}
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
                      className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <span className="text-[9px] text-muted-foreground/30 tabular-nums">{page + 1}/{totalPages}</span>
                    <button
                      onClick={() => setJourneyPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
          </DashboardSection>

          {/* Saved Careers */}
          <DashboardSection
            title={t('savedCareers.title')}
            icon={Heart}
            iconColor="text-pink-500"
            tooltip={t('savedCareers.tooltip')}
            className="mb-0"
          >
            {savedCareers.length > 0 ? (
              <>
                <div className="divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden bg-muted/10">
                  {savedCareersVisible.map((c) => (
                    <button
                      key={c.careerId}
                      type="button"
                      onClick={() => {
                        const found = getAllCareers().find((x) => x.id === c.careerId);
                        if (found) setSavedCareerDetail(found);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-[11px] hover:bg-muted/40 transition-colors text-left"
                    >
                      <span className="shrink-0 text-sm">{c.careerEmoji}</span>
                      <span className="text-muted-foreground/70 truncate flex-1">{c.careerTitle}</span>
                      <span className="text-[9px] text-muted-foreground/30 shrink-0">
                        {(() => {
                          const s = Math.floor((Date.now() - new Date(c.savedAt).getTime()) / 1000);
                          if (s < 60) return 'now';
                          if (s < 3600) return `${Math.floor(s / 60)}m`;
                          if (s < 86400) return `${Math.floor(s / 3600)}h`;
                          return `${Math.floor(s / 86400)}d`;
                        })()}
                      </span>
                    </button>
                  ))}
                </div>
                {savedCareersPageCount > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setSavedCareersPage((p) => Math.max(0, p - 1))}
                      disabled={savedCareersPage === 0}
                      className="p-0.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={t('common.previousPage')}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <span className="text-[9px] text-muted-foreground/40 tabular-nums">
                      {savedCareersPage + 1} / {savedCareersPageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSavedCareersPage((p) => Math.min(savedCareersPageCount - 1, p + 1))}
                      disabled={savedCareersPage >= savedCareersPageCount - 1}
                      className="p-0.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={t('common.nextPage')}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground/50">{t('savedCareers.emptyState')}</p>
            )}
          </DashboardSection>
        </div>

        {/* ── 5. My Library + Small Jobs ───────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <DashboardSection
            title="My Library"
            icon={BookmarkCheck}
            iconColor="text-blue-500"
            tooltip="Articles, videos, and resources you've saved from Industry Insights."
            className="mb-0"
            action={savedSummary.total > 0 ? (
              <span className="text-[10px] text-muted-foreground/40">{savedSummary.total}</span>
            ) : undefined}
          >
            <LibraryCard items={savedItemsList} total={savedSummary.total} />
          </DashboardSection>

          <DashboardSection
            title={t('smallJobs.title')}
            icon={Briefcase}
            iconColor="text-amber-500"
            tooltip={t('smallJobs.tooltip')}
            className="mb-0"
            action={(() => {
              const totalJobs = appStats.applied + appStats.waiting + appStats.accepted + appStats.done;
              return totalJobs > 0 ? (
                <Link href="/applications" className="text-[10px] text-teal-500/70 hover:text-teal-500 transition-colors">
                  View all &rarr;
                </Link>
              ) : undefined;
            })()}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: t('smallJobs.applied'), value: appStats.applied },
                { label: t('smallJobs.waiting'), value: appStats.waiting },
                { label: t('smallJobs.accepted'), value: appStats.accepted },
                { label: t('smallJobs.done'), value: appStats.done },
              ].map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={String(stat.value)} />
              ))}
            </div>
          </DashboardSection>
        </div>

      </div>

      {/* ── 6. Industry Insights Ticker ─────────────────────── */}
      <DidYouKnowCard />

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
        secondaryGoal={goalsData?.secondaryGoal ?? null}
        onSuccess={() => setShowGoalSheet(false)}
      />

      {/* Switch Journey Confirmation */}
      {switchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSwitchConfirm(null)}>
          <div className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{switchConfirm.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold">Switch Primary Goal to {switchConfirm.goalTitle}?</h3>
                <p className="text-[11px] text-muted-foreground/60">
                  This will replace your current Primary Goal. Any progress is saved and you can switch back anytime.
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/50 mb-4">
              Your journey for {goalTitle || 'your current goal'} will be saved in Previously Explored Journeys. You can switch back anytime.
            </p>
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
                className="px-3 py-1.5 text-xs rounded-lg bg-foreground/90 hover:bg-foreground text-background font-medium transition-colors"
              >
                Switch Primary Goal
              </button>
            </div>
          </div>
        </div>
      )}

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
