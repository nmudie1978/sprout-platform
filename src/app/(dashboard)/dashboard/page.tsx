"use client";

import { toast } from "@/hooks/use-toast";

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
import { SMALL_JOBS_ENABLED } from "@/lib/feature-flags";
import {
  ArrowRight,
  Compass,
  Briefcase,
  TrendingUp,
  BookmarkCheck,
  Pencil,
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
  X,
  AlertTriangle,
  NotebookPen,
} from "lucide-react";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import { useAllInterestLevels } from "@/hooks/use-interest-level";
import { InterestLevelStars } from "@/components/interest-level/interest-level-rating";
import { readLocalJourneyReflections, type LocalReflectionEntry } from "@/lib/library/tabs";
import {
  ensureJourneyNotebooksHydrated,
  JOURNEY_NOTEBOOKS_HYDRATED_EVENT,
} from "@/lib/journey/notebook-sync";
import { captureClientMutationError } from "@/lib/observability";
import type { GoalsResponse } from "@/lib/goals/types";
import { computeLensProgress, isJourneySnapshotWorthy, journeyStageLabel } from "@/lib/journey/lens-progress";
import { useLensProgressSync } from "@/hooks/use-lens-progress-sync";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrientationWalkthrough } from "@/components/onboarding/orientation-walkthrough";
import { LanguageDropdown } from "@/components/language-dropdown";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import { getAllCareers, getSectorForCareer } from "@/lib/career-pathways";
import {
  isCareerExplicitlyVerified,
  isCareerSalaryStale,
} from "@/lib/career-data-recency";
import { useDiscoverRecommendations } from "@/hooks/use-discover-recommendations";
import { WhatILikeTray } from "@/components/dashboard/what-i-like-tray";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Target } from "lucide-react";
import { syncGuidanceGoal } from "@/lib/guidance/rules";
import { PageContext } from "@/components/ui/page-context";
import { GoalSelectionSheet } from "@/components/goals/GoalSelectionSheet";
import { useSubtleHint } from "@/hooks/use-subtle-hint";
import { SpotlightHint } from "@/components/ui/spotlight-hint";
import { DiscoveryNudge } from "@/components/discovery/discovery-nudge";

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
        <p className="text-xs text-muted-foreground/50 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}

/**
 * Compact horizontal stat — used inside the My Journey card so the
 * Career Snapshot shares a container with the journey progress.
 * Roughly half the height of the standalone StatCard above.
 */
function CompactStat({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  /** Retained for callsite compat — no longer rendered. Layout mirrors the theme preview: plain stacked label/value, left-aligned, no icon. */
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  tooltip?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-control border border-border/40 bg-card px-2 py-1.5",
        tooltip && "cursor-help",
      )}
      title={tooltip}
    >
      <p className="text-xs uppercase tracking-wider text-muted-foreground/60 leading-none font-semibold">
        {label}
      </p>
      <p className="text-xs font-semibold text-foreground/85 leading-tight mt-0.5 truncate">
        {value}
      </p>
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
  onRemove,
}: {
  items: { id: string; title: string; type: string; url: string; thumbnail: string | null; source: string | null }[];
  total: number;
  onRemove?: (id: string) => void;
}) {
  const t = useTranslations();
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [libPage, setLibPage] = useState(0);
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(libPage, totalPages - 1);
  const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      {items.length > 0 ? (
        view === 'list' ? (
          <div className="space-y-1.5">
            {pageItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground group/row">
                <a
                  href={safeHref(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 flex-1 min-w-0 hover:text-foreground transition-colors"
                >
                  <span className="text-xs font-medium uppercase px-1.5 py-0.5 rounded-control shrink-0 bg-muted/20 text-muted-foreground/60">
                    {item.type === 'VIDEO' ? '▶' : item.type === 'ARTICLE' ? '📄' : '🎙'}
                  </span>
                  <span className="truncate">{item.title}</span>
                </a>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="p-0.5 rounded-control hit-44 text-muted-foreground/0 group-hover/row:text-muted-foreground/30 hover:!text-destructive hover:!bg-destructive/10 transition-colors shrink-0"
                    title="Remove"
                    aria-label={`Remove ${item.title}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
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
                className="group rounded-control border border-border/20 overflow-hidden hover:border-border/50 transition-all"
              >
                {item.thumbnail ? (
                  <div className="aspect-video bg-muted/30 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element --
                        Saved library items come from arbitrary external
                        hosts (article/podcast CDNs, etc.) that aren't in
                        next.config.js images.remotePatterns. A raw <img>
                        is the safest option until the allowlist is
                        widened or items are pre-proxied through our own
                        CDN. */}
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.type === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="h-4 w-4 rounded-pill bg-white/80 flex items-center justify-center">
                          <span className="text-xs ml-px">▶</span>
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
                  <p className="text-xs font-medium text-foreground/70 line-clamp-1 leading-snug">
                    {item.title}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )
      ) : (
        <p className="text-xs text-muted-foreground/50">{t('library.emptyState')}</p>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <button onClick={() => setLibPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-0.5 rounded-control hit-44 text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"><ChevronLeft className="h-3 w-3" /></button>
          <span className="text-xs text-muted-foreground/30 tabular-nums">{page + 1}/{totalPages}</span>
          <button onClick={() => setLibPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-0.5 rounded-control hit-44 text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"><ChevronRight className="h-3 w-3" /></button>
        </div>
      )}
    </div>
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
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-700",
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

  // Reflections preview — read straight from device storage (where the
  // JourneyReflectionsTray writes them); "See all →" opens
  // /library?tab=reflections. Populated after mount to avoid a hydration
  // mismatch on the localStorage read.
  const reflectionsUserId = session?.user?.id;
  const [recentReflections, setRecentReflections] = useState<LocalReflectionEntry[]>([]);
  useEffect(() => {
    if (!reflectionsUserId || typeof window === "undefined") {
      setRecentReflections([]);
      return;
    }
    const read = () =>
      setRecentReflections(readLocalJourneyReflections(reflectionsUserId, window.localStorage));
    read();
    // Reconcile with the server once, then re-read when the cache refreshes
    // (server hydration, a tray edit, or another tab).
    void ensureJourneyNotebooksHydrated(reflectionsUserId);
    window.addEventListener(JOURNEY_NOTEBOOKS_HYDRATED_EVENT, read);
    window.addEventListener("endeavrly:journey-reflections-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(JOURNEY_NOTEBOOKS_HYDRATED_EVENT, read);
      window.removeEventListener("endeavrly:journey-reflections-changed", read);
      window.removeEventListener("storage", read);
    };
  }, [reflectionsUserId]);

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
    // Fresh-enough for the dashboard view. Previously this had
    // staleTime: 0 + refetchOnMount: "always" + refetchOnWindowFocus:
    // true — that combination hammered the API every tab switch.
    // Cross-page mutations that actually change the explored-goals
    // set (remove journey, switch goal) already invalidate this key
    // explicitly via queryClient.invalidateQueries, so a 2-minute
    // stale window doesn't hide real updates — it only suppresses
    // the spurious refetches on passive tab switches. Default
    // refetchOnMount (true) means mount triggers a refetch only
    // when data is stale, which is what we want.
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const queryClient = useQueryClient();

  // ── Delete handlers ──────────────────────────────────────────────
  const removeLibraryItem = useCallback(async (itemId: string) => {
    await fetch(`/api/journey/saved-items?id=${itemId}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  }, [queryClient]);

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
      // No success toast here: the caller hard-navigates straight to My
      // Journey, so a toast would only flash for a frame before the page
      // tears down (it was unreadable). Landing on the career's journey is
      // the confirmation.
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

  // Post-completion nudge — once the active career reaches Clarity (3/3),
  // spotlight the "Change" control so the user discovers they can explore
  // an alternative career. Keyed per career so it shows once per completion
  // and never again for that career.
  const completionSlug = (goalTitle ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const completionNudge = useSubtleHint({
    hintKey: `journey-complete-nudge-${completionSlug}`,
    enabled: clarityDone && !!goalTitle && status !== "loading",
    delayMs: 1500,
    durationMs: 6000,
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
  const { curiosities: savedCareers, removeCuriosity } = useCuriositySaves();
  const [savedCareersPage, setSavedCareersPage] = useState(0);
  const [savedCareerDetail, setSavedCareerDetail] = useState<ReturnType<typeof getAllCareers>[number] | null>(null);
  const savedCareersPerPage = 4;
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
            // First-run: mark onboarding done so it doesn't replay. The user
            // stays on the dashboard whether they finish or cancel the
            // walkthrough — we deliberately do NOT redirect anywhere (no jump
            // to Career Radar). If the PATCH fails, Sentry sees it and the
            // walkthrough will replay next login (safe).
            fetch("/api/onboarding", { method: "PATCH" }).catch(captureClientMutationError("dashboard:onboardingDone"));
            refetchOnboarding();
          }
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
                className="h-7 w-7 rounded-pill border border-border/40 bg-background/60 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/40 transition-colors hit-44"
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
                <span title="Your journey tracks progress through Discover, Understand, and Clarity."><TrendingUp className="h-4 w-4 text-muted-foreground cursor-help" /></span>
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
                          Complete
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {t('journey.cardTitle')}
                      <span className="text-muted-foreground/40 font-normal">&mdash;</span>
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

            {/* Career Snapshot — compact strip inside the same Journey
                container so the user reads "this journey, this career,
                these facts" as one block. Roughly half the height of
                the previous standalone Career Snapshot card. */}
            {goalCareer && (() => {
              const sector = getSectorForCareer(goalCareer.id);
              const sectorLabel = sector === 'public' ? 'Public' : sector === 'private' ? 'Private' : 'Mixed';
              const pensionLabel = sector === 'public' ? 'Strong' : sector === 'private' ? 'Varies' : 'Mixed';
              const salary = goalCareer.avgSalary.replace(/\s*kr\/year.*/i, '').trim().replace(/[\d,]+/g, (m) => {
                const n = parseInt(m.replace(/,/g, ''), 10);
                if (isNaN(n)) return m;
                if (n >= 1_000_000) { const v = n / 1_000_000; return v % 1 === 0 ? `${v}M` : `${v.toFixed(1).replace(/\.0$/, '')}M`; }
                if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
                return String(n);
              });
              const salaryStale = isCareerSalaryStale(goalCareer);
              const explicitlyVerified = isCareerExplicitlyVerified(goalCareer);
              return (
                <div className="mt-5 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Search className="h-3 w-3 text-primary/70" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Career snapshot
                    </p>
                    {salaryStale && (
                      <span
                        className="inline-flex items-center text-accent cursor-help"
                        title="Salary & outlook figures may be out of date — check current SSB / NAV stats before deciding. Catalogue salaries are re-verified annually against SSB labour stats; this figure has not been refreshed in the last year, so treat as indicative."
                        aria-label="Salary figures may be out of date"
                      >
                        <AlertTriangle className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <CompactStat
                      icon={TrendingUp}
                      iconColor="text-primary/80"
                      label="Salary"
                      value={`${salary} kr`}
                      tooltip={
                        explicitlyVerified
                          ? `Verified against SSB labour stats — last checked ${goalCareer.lastVerifiedAt}.`
                          : salaryStale
                            ? "Indicative range. Not re-verified against SSB labour stats in the last year — check current SSB / NAV data before deciding."
                            : undefined
                      }
                    />
                    <CompactStat icon={Rocket} iconColor="text-muted-foreground/80" label="Growth" value={goalCareer.growthOutlook.charAt(0).toUpperCase() + goalCareer.growthOutlook.slice(1)} />
                    <CompactStat icon={Briefcase} iconColor="text-muted-foreground/80" label="Sector" value={sectorLabel} />
                    <CompactStat icon={CheckCircle2} iconColor="text-muted-foreground/80" label="Pension" value={pensionLabel} />
                  </div>
                </div>
              );
            })()}

          </GlassCard>
          );
          return goalTitle ? (
            <Link href="/my-journey" className="block mb-6 group">{journeyCard}</Link>
          ) : (
            <div className="block mb-6">{journeyCard}</div>
          );
        })()}

        {/* Who Am I lives at the bottom of the dashboard — see below
            DidYouKnowCard. Kept there so the top of the page stays
            focused on the active journey and today's actions. */}

        {/* Career Twin now lives inside the journey card as a 3/3 completion
            reward (see journeyComplete variant above) — no standalone banner. */}

        {/* ── Discovery Nudge — sparse, preference-based suggestion ── */}
        {discoveryPrefs && (
          <DiscoveryNudge
            preferences={discoveryPrefs}
            primaryGoal={goalTitle}
            className="mb-4"
          />
        )}

        {/* ── 4. My Explored Journeys + Saved Careers ─────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <DashboardSection
            title="My Explored Journeys"
            icon={Target}
            iconColor="text-muted-foreground"
            tooltip="Every journey you start is saved here. Switch between them anytime."
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
                <div className="rounded-control border border-border/60 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 border-b border-border/40 bg-muted/20">
                        <th className="px-2.5 py-1.5">Career</th>
                        <th className="px-2 py-1.5 w-16 text-center">Stage</th>
                        <th className="px-2 py-1.5 w-24 text-center">Interest</th>
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
                        const stageTooltip = stageLabel === 'Clarity' || stageLabel === 'Complete' ? 'Journey Complete' : stageLabel === 'Understand' ? 'Understand — exploring the role in depth' : 'Discover — exploring what this career is about';
                        const stageColor = stageLetter === 'C' ? 'text-primary bg-primary/15' : stageLetter === 'U' ? 'text-primary/80 bg-primary/10' : 'text-muted-foreground bg-muted';
                        return (
                          <tr
                            key={goal.goalId}
                            onClick={() => {
                              // Reload an already-explored journey: make it the
                              // active goal again and jump straight into My
                              // Journey. No "set primary goal" confirmation —
                              // the user has already explored this path, so it's
                              // a resume, not a new commitment. The previous goal
                              // is saved to Explored Journeys (reversible).
                              if (isCurrentGoal || switchGoalMutation.isPending) return;
                              switchGoalMutation.mutate(goal.goalTitle, {
                                onSuccess: () => window.location.assign("/my-journey"),
                              });
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
                                  <span className="text-xs text-muted-foreground/30">—</span>
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
                      className="p-0.5 rounded-control hit-44 text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <span className="text-xs text-muted-foreground/30 tabular-nums">{page + 1}/{totalPages}</span>
                    <button
                      onClick={() => setJourneyPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-0.5 rounded-control hit-44 text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
          </DashboardSection>

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
                See all →
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
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <span className="shrink-0 text-sm">{c.careerEmoji}</span>
                        <span className="text-muted-foreground/70 truncate flex-1">{c.careerTitle}</span>
                      </button>
                      {interestLevels[c.careerId] && (
                        <InterestLevelStars value={interestLevels[c.careerId]} className="shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground/30 shrink-0">
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
                      className="p-0.5 hit-44 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={t('common.previousPage')}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <span className="text-xs text-muted-foreground/40 tabular-nums">
                      {savedCareersPage + 1} / {savedCareersPageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSavedCareersPage((p) => Math.min(savedCareersPageCount - 1, p + 1))}
                      disabled={savedCareersPage >= savedCareersPageCount - 1}
                      className="p-0.5 hit-44 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
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

        {/* ── 5. Saved Resources + Reflections (Row B — 2-col grid) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 items-stretch">
          {/* Saved Resources (renamed from "My Library" — the new
              /library page now owns that name; this is saved articles/videos). */}
          <DashboardSection
            title="Saved Resources"
            icon={BookmarkCheck}
            iconColor="text-muted-foreground"
            tooltip="Articles, videos, and resources you've saved from Industry Insights."
            className="mb-0"
            fixedHeight="h-[180px] overflow-y-auto"
            action={savedSummary.total > 0 ? (
              <span className="text-xs text-muted-foreground/40">{savedSummary.total}</span>
            ) : undefined}
          >
            <LibraryCard items={savedItemsList} total={savedSummary.total} onRemove={removeLibraryItem} />
          </DashboardSection>

          {/* ── Reflections preview ── */}
          <DashboardSection
            title="Reflections"
            icon={NotebookPen}
            iconColor="text-muted-foreground"
            tooltip="Short notes you've written as you move through My Journey."
            className="mb-0"
            fixedHeight="h-[180px] overflow-y-auto"
            action={
              <Link href="/library?tab=reflections" className="text-xs text-primary/70 hover:text-primary transition-colors">
                See all →
              </Link>
            }
          >
            {recentReflections.length > 0 ? (
              <ul className="space-y-2">
                {recentReflections.slice(0, 2).map((r) => {
                  const career = getAllCareers().find((c) => c.id === r.careerSlug);
                  return (
                    <li key={r.id} className="rounded-control border border-border/60 bg-muted/10 px-2.5 py-2">
                      <p className="text-xs text-muted-foreground/60 mb-0.5 line-clamp-1">
                        {career ? `${career.emoji} ${career.title}` : r.careerSlug} · {r.lensLabel}
                      </p>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2">{r.text}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground/50">Your reflections will appear here as you move through My Journey.</p>
            )}
          </DashboardSection>
        </div>

        {/* Small Jobs — compact. Hidden until the marketplace
            re-opens; gated by NEXT_PUBLIC_SMALL_JOBS_ENABLED. */}
        {SMALL_JOBS_ENABLED && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <DashboardSection
            title={t('smallJobs.title')}
            icon={Briefcase}
            iconColor="text-muted-foreground"
            tooltip={t('smallJobs.tooltip')}
            className="mb-0"
          >
            <div className="flex gap-2">
              {[
                { label: t('smallJobs.applied'), value: appStats.applied },
                { label: t('smallJobs.waiting'), value: appStats.waiting },
                { label: t('smallJobs.accepted'), value: appStats.accepted },
                { label: t('smallJobs.done'), value: appStats.done },
              ].map((stat) => (
                <div key={stat.label} className="flex-1 text-center py-1.5">
                  <p className="text-xs font-bold text-foreground/75 tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground/40 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Last completed job — row with date + location */}
            <div className="mt-1.5 pt-1.5 border-t border-border/15">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground/40 mb-1">
                <CheckCircle2 className="h-2.5 w-2.5 text-muted-foreground/50 shrink-0" />
                <span>Last completed</span>
              </div>
              {dashboardStats?.lastCompletedJob ? (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-foreground/70 font-medium truncate flex-1">{dashboardStats.lastCompletedJob.title}</span>
                  <span className="text-muted-foreground/40 shrink-0">{new Date(dashboardStats.lastCompletedJob.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-muted-foreground/40 shrink-0 truncate max-w-[100px]">{dashboardStats.lastCompletedJob.location}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/30">None yet</span>
              )}
            </div>
          </DashboardSection>
        </div>
        )}

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

      {/* Spotlight — after completing a journey, point to "Change" so the
          user discovers they can explore an alternative career */}
      <SpotlightHint
        visible={completionNudge.visible}
        onDismiss={completionNudge.dismiss}
        text={t('journey.completeNudge')}
        targetSelector='[data-spotlight="change-button"]'
      />
    </div>
  );
}
