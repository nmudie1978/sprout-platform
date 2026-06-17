'use client';

/**
 * MY JOURNEY PAGE
 *
 * Three-stage career exploration:
 *   Discover = Overview (video, salary, growth, skills, roadmap)
 *   Understand = Deep dive (typical day, entry requirements, verified courses, tools, notes)
 *   Clarity = See your full journey (roadmap, timeline, progression)
 *
 * Data sources:
 *   - Career basics: getAllCareers() from career-pathways
 *   - Career details: /api/career-details/[id] (typical day, entry paths, tools, reality check)
 *   - Verified courses: /api/learning/recommendations (real, geo-filtered courses)
 *   - YouTube: /api/youtube-search
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Globe, Rocket, Play, TrendingUp,
  ArrowLeft, ArrowRight, BookOpen, Briefcase, GraduationCap, Pencil,
  Eye, ExternalLink, ChevronDown, Lock,
  Target, Sparkles, Save, Maximize2, X,
  Heart, Wrench, Check, CheckCircle2, Clock, MapPin, Award, Users,
  DollarSign, BarChart3, Layers, AlertCircle, Plus, Trash2, Tag, Video, Zap, Info,
  Building2, Shield, Loader2, Download, FileText, CheckCircle, Phone,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, slugify } from '@/lib/utils';
import { useGoals } from '@/hooks/use-goals';
import type { Career } from '@/lib/career-pathways';
import { useCareerCatalog } from '@/hooks/use-career-catalog';
import { localizeCareer } from '@/lib/career-localization';
import { displaySalary, displayEducation, showsSalaryProgression } from '@/lib/career-localization/display';
import type { CareerDetails } from '@/lib/career-typical-days';
import type { CareerProgression } from '@/lib/career-progressions';
import { CareerProgressionFlow, type CareerProgressionData } from '@/components/careers/CareerProgressionFlow';
import type { RealityCheckResult } from '@/lib/career-reality-types';
import { getCertificationPath, getCareerRequirements, getNorwayProgrammes, getProgrammesForCareer, hasEducationData, getSpanishReadiness, type NordicCountry } from '@/lib/education';
import { countryToCode, DEFAULT_COUNTRY } from '@/lib/countries';
import {
  parseGradeRequirement,
  formatGradeLabel,
  formatGradeTooltip,
} from '@/lib/education/parse-grade-requirement';
import { getToolInfo } from '@/lib/education/tool-links';
import { getAcademicProfile, getDemandLabel, getDemandColors, getPathwayLabel, getCompetitivenessLabel } from '@/lib/education/academic-readiness';
import { EducationBrowser } from '@/components/education-browser';
import { FundingSection } from '@/components/education-browser/funding-section';
import { FreshnessPillAggregate } from '@/components/education-browser/freshness-pill';
import { getRoutesForCareer } from '@/lib/education/routes';
import { CareerMythBuster } from '@/components/journey/career-myth-buster';
import { CareerSpecialisms } from '@/components/journey/career-specialisms';
import { RealityVideos } from '@/components/journey/reality-videos';
import { SaveVideoButton } from '@/components/save-video-button';
import { useVideoSaves } from '@/hooks/use-video-saves';
import { hasSpecialisms } from '@/lib/career-specialisms';
import { TopEmployers } from '@/components/journey/top-employers';
import { CareerDNASection } from '@/components/career-dna/career-dna-section';
import { hasCareerEmployers, getRepresentativeEmployers } from '@/lib/career-employers';
import { hasMyths } from '@/lib/career-myths';
import { ConfidenceTracker } from '@/components/journey/confidence-tracker';
// Day simulation removed per user request
// AI Impact section removed per user request
import type { Journey } from '@/lib/journey/career-journey-types';
import { setUnderstandConfirmed, isUnderstandConfirmed, setDiscoverConfirmed, isDiscoverConfirmed, markClarityActive } from '@/lib/journey/lens-progress';
import { nextCelebrationState, type CelebrationBaseline } from '@/lib/journey/celebration';
import { JourneyCompleteCelebration } from '@/components/journey/journey-complete-celebration';
import { useInterestLevel } from '@/hooks/use-interest-level';

const PersonalCareerTimeline = dynamic(
  () => import('@/components/journey').then((m) => m.PersonalCareerTimeline),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-card bg-muted/50" /> }
);
const GoalSelectionSheet = dynamic(
  () => import('@/components/goals/GoalSelectionSheet').then((m) => m.GoalSelectionSheet),
  { ssr: false }
);
const JourneyReflectionsTray = dynamic(
  () => import('@/components/journey/journey-reflections-tray').then((m) => m.JourneyReflectionsTray),
  { ssr: false }
);
const JourneyCompaniesTray = dynamic(
  () => import('@/components/journey/journey-companies-tray').then((m) => m.JourneyCompaniesTray),
  { ssr: false }
);
// Salary chart pulls in recharts (~250KB). Only loaded when the salary popup
// renders, so it stays out of the My Journey initial bundle.
const SalaryProgressionLine = dynamic(
  () => import('@/components/journey/salary-progression-line').then((m) => m.SalaryProgressionLine),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-card bg-muted/50" /> }
);
// Career Twin — the first Clarity sub-tab. Opens inline within the tab so the
// user never leaves their journey. Heavy, so it's only loaded when rendered.
const CareerTwinView = dynamic(
  () => import('@/components/career-twin/career-twin-view').then((m) => m.CareerTwinView),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </div>
    ),
  }
);

// ─── Types ───────────────────────────────────────────────────────────────────

type V2Tab = 'discover' | 'understand' | 'clarity';

interface CareerDetailsResponse {
  career: Career;
  category: string;
  details: CareerDetails | null;
  progression: CareerProgression | null;
  pathProgression: CareerProgressionData | null;
  hasDetails: boolean;
}

interface LearningResource {
  id: string;
  title: string;
  provider: string;
  providerType: string;
  deliveryMode: string;
  regionScope: string;
  regionDetails: string | null;
  duration: string;
  cost: string;
  costCurrency: string | null;
  financialAidAvailable: boolean;
  certificationType: string;
  ageSuitability: string;
  prerequisiteLevel: string;
  prerequisiteDetails: string | null;
  officialUrl: string;
  description: string | null;
  highlights: string[];
}

interface LearningResponse {
  success: boolean;
  message: string;
  localRegional: LearningResource[];
  international: LearningResource[];
  totalCount: number;
  meta: { userAge: number; careerGoals: string[]; verificationNote: string };
}

// ─── Data hooks ──────────────────────────────────────────────────────────────

interface YouTubeSearchResponse {
  videos: { videoId: string; title: string | null }[];
  videoId: string | null;
  title: string | null;
}

function useYouTubeVideo(careerTitle: string | null) {
  // The Discover video is localized by the user's country (Spain → Spanish,
  // Norway → Norwegian, else English). We read country from the shared
  // ['profile-country'] query (React Query dedupes — no extra request) and let
  // the API do the language work. Wait for the country query to settle before
  // searching so we don't fire a wasted English search then re-fetch.
  const countryQuery = useQuery<{ country?: string | null }>({
    queryKey: ['profile-country'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) return {};
      return res.json();
    },
    // Country rarely changes; a long staleTime keeps it a cache hit on re-open
    // so the YouTube fetch (gated on this) never waits on a fresh request.
    staleTime: 30 * 60 * 1000,
  });
  const country = countryQuery.data?.country ?? null;

  return useQuery<YouTubeSearchResponse>({
    queryKey: ['youtube-video', careerTitle, country],
    queryFn: async () => {
      if (!careerTitle) return { videos: [], videoId: null, title: null };
      const params = new URLSearchParams({ career: careerTitle });
      if (country) params.set('country', country);
      const res = await fetch(`/api/youtube-search?${params.toString()}`);
      if (!res.ok) return { videos: [], videoId: null, title: null };
      return res.json();
    },
    enabled: !!careerTitle && !countryQuery.isLoading,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

function useCareerDetails(careerId: string | null) {
  return useQuery<CareerDetailsResponse>({
    queryKey: ['career-details', careerId],
    queryFn: async () => {
      const res = await fetch(`/api/career-details/${careerId}`);
      if (!res.ok) throw new Error('Failed to fetch career details');
      return res.json();
    },
    enabled: !!careerId,
    // Career details are a deterministic in-memory lookup keyed by careerId —
    // they never change within a session, so a re-opened career is instant.
    staleTime: Infinity,
  });
}

function useLearningRecommendations(careerTitle: string | null) {
  return useQuery<LearningResponse>({
    queryKey: ['learning-recommendations', careerTitle],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (careerTitle) params.set('careers', careerTitle);
      params.set('maxResults', '10');
      const res = await fetch(`/api/learning/recommendations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
    enabled: !!careerTitle,
    // Course/learning lists are curated static content — no need to refetch on
    // every re-open within the session.
    staleTime: 60 * 60 * 1000,
  });
}

interface CourseSearchResult {
  category: 'norway' | 'international' | 'certification';
  platform: string;
  label: string;
  description: string;
  url: string;
  free: boolean;
  tags: string[];
}

interface CourseSearchResponse {
  success: boolean;
  career: string;
  results: CourseSearchResult[];
  totalCount: number;
}

function useCourseSearch(careerTitle: string | null) {
  return useQuery<CourseSearchResponse>({
    queryKey: ['course-search', careerTitle],
    queryFn: async () => {
      const res = await fetch(`/api/courses/search?career=${encodeURIComponent(careerTitle!)}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!careerTitle,
    staleTime: 60 * 60 * 1000,
  });
}

function useCareerReality(careerTitle: string | null) {
  return useQuery<RealityCheckResult>({
    queryKey: ['career-reality', careerTitle],
    queryFn: async () => {
      const res = await fetch(`/api/career-reality?career=${encodeURIComponent(careerTitle!)}`);
      if (!res.ok) throw new Error('Failed to fetch reality check');
      return res.json();
    },
    enabled: !!careerTitle,
    // Server-side this is DB-cached for 7 days, so a 30-min client staleTime
    // avoids needless refetches when re-opening a career without going stale.
    staleTime: 30 * 60 * 1000,
    // On a cold cache the server returns a `pending` placeholder immediately and
    // generates the real summary + videos in the background — poll until it's
    // ready, then stop.
    refetchInterval: (query) => (query.state.data?.pending ? 2500 : false),
  });
}

interface ContributedPath {
  id: string;
  displayName: string;
  currentTitle: string;
  country: string;
  city: string | null;
  howIGotHere: string;
  whatIStudied: string;
  firstSalary: string;
  hardestPart: string;
  adviceToSeventeen: string;
  realityOfJob: string;
  videoUrl: string | null;
}

function useContributedPaths(careerId: string | null) {
  return useQuery<{ paths: ContributedPath[]; count: number }>({
    queryKey: ['contributed-paths', careerId],
    queryFn: async () => {
      const res = await fetch(`/api/career-paths?career=${encodeURIComponent(careerId!)}`);
      if (!res.ok) return { paths: [], count: 0 };
      return res.json();
    },
    enabled: !!careerId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Fullscreen roadmap overlay ──────────────────────────────────────────────

function FullscreenRoadmap({ goalTitle, onClose }: { goalTitle: string; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Rocket className="h-5 w-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Career Roadmap</h2>
            <p className="text-xs text-muted-foreground/70">Your path to {goalTitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-control text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/30 transition-colors">
          <X className="h-3.5 w-3.5" /> Close
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <PersonalCareerTimeline primaryGoalTitle={goalTitle} fitToWidth />
      </div>
    </motion.div>
  );
}

// ─── Shared UI components ────────────────────────────────────────────────────

function SectionCard({ children, className, style, accent }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; accent?: 'teal' | 'amber' | 'blue' }) {
  const accentBorder = accent === 'teal' ? 'border-l-[3px] border-l-primary/60' : accent === 'amber' ? 'border-l-[3px] border-l-warning/60' : accent === 'blue' ? 'border-l-[3px] border-l-info/60' : '';
  // Border thickness: 1px → 1.2px (+20%). The default Tailwind `border`
  // class is 1px; `border-[1.2px]` bumps it to the exact 20% increase
  // requested — renders cleanly on hidpi displays as a touch bolder.
  //
  // Border glow: boxShadow opacities bumped 0.08 → 0.096 and 0.04 →
  // 0.048 (both +20%), keeping the same violet hue and blur radii so
  // the glow is perceptibly stronger without changing its character.
  // The drop-shadow layer (rgba(0,0,0,0.2)) is unchanged — that's a
  // structural shadow, not part of the glow.
  return (
    <div className={cn('rounded-card border-[1.2px] border-border bg-card/50 overflow-hidden shadow-sm', accentBorder, className)} style={style}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, badge, tooltip, collapsed, onToggle, centered }: {
  icon: typeof Eye;
  title: string;
  badge?: React.ReactNode;
  tooltip?: string;
  /** When provided, the header becomes a clickable collapse toggle. */
  collapsed?: boolean;
  onToggle?: () => void;
  /**
   * When true, the icon+title pair is horizontally centered inside the
   * header instead of being pinned to the left. The chevron stays on
   * the right via a symmetric flex-1 spacer on the left so the center
   * content sits at the real middle of the header, not offset by the
   * chevron's width. Opt-in per-section so existing left-aligned
   * headers are unaffected.
   */
  centered?: boolean;
}) {
  // Inner content is shared by both the button and div branches so the
  // centered spacer layout stays identical regardless of interactivity.
  const inner = (
    <>
      {/* Left spacer — present only in centered mode to balance the
          chevron on the right so the icon+title sits at the true
          middle of the header. */}
      {centered && <div className="flex-1" />}
      <div className={cn('flex items-center gap-2.5', centered && 'justify-center')}>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
        <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
        {tooltip && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground/35 hover:text-muted-foreground/60 transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px] text-xs leading-snug">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={cn('flex items-center gap-2', centered && 'flex-1 justify-end')}>
        {badge}
        {onToggle && (
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground/55 transition-transform duration-200',
            collapsed && '-rotate-90',
          )} />
        )}
      </div>
    </>
  );

  const className = cn(
    'flex items-center justify-between px-5 py-3.5 border-b border-border/30 w-full text-left',
    onToggle && 'hover:bg-muted/20 transition-colors cursor-pointer',
  );

  // Render an explicit <button> when interactive, plain <div> otherwise —
  // avoiding a dynamic-tag pattern that previously hid subtle hydration
  // quirks on the centered collapsible cards (Day in the Life, Career
  // Overview) where the click sometimes failed to register.
  if (onToggle) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className={className}
      >
        {inner}
      </button>
    );
  }
  return <div className={className}>{inner}</div>;
}

function EmptyState({ icon: Icon, message }: { icon: typeof Target; message: string }) {
  return (
    <div className="rounded-card border border-dashed border-border/30 p-12 text-center">
      <Icon className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
      <p className="text-sm text-muted-foreground/70">{message}</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, tooltip }: { label: string; value: string; icon: typeof TrendingUp; accent?: string; tooltip?: string }) {
  const card = (
    <div className={cn('rounded-control border border-border bg-background/50 p-3.5 flex flex-col items-center text-center', tooltip && 'cursor-help')}>
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <Icon className={cn('h-3.5 w-3.5', accent || 'text-muted-foreground/70')} />
        <span className="text-xs font-medium text-success/60 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-semibold text-foreground/90">{value}</p>
    </div>
  );
  if (!tooltip) return card;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-xs leading-snug">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Formats "700,000 - 1,400,000 kr/year" → "700k – 1.4M NOK" */
function formatSalaryShort(raw: string): string {
  const nums = raw.match(/[\d,]+/g);
  if (!nums || nums.length === 0) return raw;
  const fmt = (s: string) => {
    const n = parseInt(s.replace(/,/g, ''), 10);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
    return String(n);
  };
  if (nums.length >= 2) return `${fmt(nums[0])} – ${fmt(nums[1])} NOK`;
  return `${fmt(nums[0])} NOK`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-control bg-muted/20 animate-pulse" />
      ))}
    </div>
  );
}

// ─── Section collapse helper ─────────────────────────────────────────────────

/** Manages collapse state for multiple sections, persisted in localStorage.
 *  `defaultCollapsed` lists keys that start collapsed unless the user has
 *  explicitly opened them (localStorage stores '0' for open). */
function useSectionCollapse(
  keys: string[],
  defaultCollapsed: string[] = [],
  // Keys here ALWAYS start collapsed on load, ignoring any stored preference.
  // The user can still expand them in-session, but every fresh load minimises
  // them again. Use for sections that should open minimised every time.
  forceCollapsedOnLoad: string[] = [],
) {
  const [state, setState] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const defaults = new Set(defaultCollapsed);
      const forced = new Set(forceCollapsedOnLoad);
      const loaded: Record<string, boolean> = {};
      for (const k of keys) {
        if (forced.has(k)) {
          // Always minimised on first load, regardless of stored choice.
          loaded[k] = true;
          continue;
        }
        const stored = window.localStorage.getItem(`section-${k}`);
        if (stored !== null) {
          loaded[k] = stored === '1';
        } else {
          // No user preference yet — use default
          loaded[k] = defaults.has(k);
        }
      }
      setState(loaded);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggle = useCallback((key: string) => {
    setState((prev) => {
      const next = !prev[key];
      try { window.localStorage.setItem(`section-${key}`, next ? '1' : '0'); } catch { /* ignore */ }
      return { ...prev, [key]: next };
    });
  }, []);
  const isCollapsed = useCallback((key: string) => !!state[key], [state]);
  return { isCollapsed, toggle };
}

// ─── DISCOVER TAB ────────────────────────────────────────────────────────────

function DiscoverTab({
  career,
  goalTitle,
  onContinue,
  onGoToUnderstand,
}: {
  career: Career | null;
  goalTitle: string | null;
  /** Advance to Understand — confirms the Discover step and navigates. */
  onContinue: () => void;
  /** Navigate to Understand tab (for "See full progression" link). */
  onGoToUnderstand?: () => void;
}) {
  const { getSectorForCareer, getPensionNote } = useCareerCatalog();
  const [roadmapFullscreen, setRoadmapFullscreen] = useState(false);
  const [showSalaryPopup, setShowSalaryPopup] = useState(false);
  const { data: ytData } = useYouTubeVideo(goalTitle);
  const { data: discoverDetails } = useCareerDetails(career?.id ?? null);
  // Video carousel state. The YouTube search returns up to 5 Day-in-the-
  // Life clips so the user can cycle through alternatives via the "more"
  // icon when the first pick doesn't land.
  const videos = ytData?.videos ?? [];
  const [videoIndex, setVideoIndex] = useState(0);
  // Reset the index whenever the career (and therefore the video list)
  // changes so we don't stay pointed at index 4 of the previous career.
  useEffect(() => {
    setVideoIndex(0);
  }, [goalTitle]);
  const currentVideo = videos[videoIndex] ?? null;
  const videoId = currentVideo?.videoId ?? ytData?.videoId ?? null;
  const hasMoreVideos = videos.length > 1;
  // Bookmark the "A Day in the Life" clip into My Library → My Content.
  const { save, isSaved: isDayVideoSaved } = useVideoSaves();
  const { isCollapsed: dCollapsed, toggle: dToggle } = useSectionCollapse(['d-video', 'd-overview', 'd-insights']);

  // Pull the user's age from /api/profile so the Timeline card can
  // compute "qualified by age X" against the user's actual age rather
  // than a hardcoded 16. We share the same queryKey as
  // personal-career-timeline so this rides on the existing cache and
  // adds no extra network round-trip in practice.
  const { data: profileData } = useQuery<{
    user?: { dateOfBirth?: string | null } | null;
  }>({
    queryKey: ['profile-dob'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });
  const userAge: number | undefined = useMemo(() => {
    const dob = profileData?.user?.dateOfBirth;
    if (!dob) return undefined;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }, [profileData]);

  // The user's country drives salary/education localization for the
  // active career. Rides the shared ['profile-country'] React Query
  // cache used elsewhere on the page, so no extra network round-trip.
  const { data: countryData } = useQuery<{ country?: string | null }>({
    queryKey: ['profile-country'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) return {};
      return res.json();
    },
    // Country rarely changes; a long staleTime keeps it a cache hit on re-open
    // so the YouTube fetch (gated on this) never waits on a fresh request.
    staleTime: 30 * 60 * 1000,
  });
  const country = countryData?.country ?? null;

  if (!career || !goalTitle) {
    return <EmptyState icon={Target} message="Choose a career goal to start exploring" />;
  }

  const dDetails = discoverDetails?.details ?? null;

  const lcCareer = career ? localizeCareer(career, country) : null;
  const lcSalary = lcCareer ? displaySalary(lcCareer) : null;
  const lcEducation = lcCareer ? displayEducation(lcCareer) : null;
  const notTailored = "Not tailored for your country yet";

  return (
    <div className="space-y-5">
      {/* Role overview */}
      <div className="rounded-card border-2 border-primary/30 bg-primary/[0.04] shadow-sm p-5">
        <p className="text-sm text-foreground/70 leading-[1.8]">
          {dDetails?.whoThisIsGoodFor?.length
            ? (() => {
                // Clean each trait: strip trailing punctuation, trim,
                // lowercase, and remove leading "people who are" etc.
                // so the sentence reads naturally when assembled.
                const clean = (s: string) =>
                  s.replace(/[.,;:!]+$/g, '').trim().toLowerCase()
                   .replace(/^people who (are |)/i, '')
                   .replace(/^those who (are |)/i, '');
                const traits = dDetails.whoThisIsGoodFor.slice(0, 3).map(clean).filter(Boolean);
                if (traits.length === 0) return career.description;
                if (traits.length === 1) return `This role suits people who are ${traits[0]}.`;
                if (traits.length === 2) return `This role suits people who are ${traits[0]} and ${traits[1]}.`;
                return `This role suits people who are ${traits[0]}, ${traits[1]}, and ${traits[2]}.`;
              })()
            : career.description
          }
          {career.growthOutlook === 'high' ? ' Demand is high and growing.' : career.growthOutlook === 'medium' ? ' The field is growing steadily.' : ' This is a stable career.'}
        </p>
      </div>

      {/* At-a-glance: Demand / Pathway / Competition */}
      {(() => {
        const ap = getAcademicProfile(career);
        const demandHint: Record<typeof ap.demand, string> = {
          'low': 'Steady but quiet demand.',
          'moderate': 'Balanced demand — opportunities exist.',
          'strong': 'Growing demand — good prospects.',
          'very-strong': 'High demand — opportunities are abundant.',
        };
        const pathwayHint: Record<string, string> = {
          'vocational': 'Vocational training (fagbrev / apprenticeship).',
          'bachelor': 'Bachelor\'s degree (3 years).',
          'master': 'Master\'s degree (5 years).',
          'doctorate': 'Doctorate or professional degree.',
          'professional-degree': 'Integrated 5–6 year degree (e.g. medicine, law, psychology).',
          'mixed': 'Several viable routes.',
          'entry-level': 'Entry-level — often no specific degree required.',
          'licence-based': 'Licence or certification-based route.',
        };
        const compHint: Record<typeof ap.competitiveness, string> = {
          'low': 'Low barrier — most applicants are accepted.',
          'moderate': 'Moderate — solid grades improve your chances.',
          'high': 'Competitive — strong grades and preparation needed.',
          'very-high': 'Highly selective — top grades and preparation required.',
        };
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { label: 'Demand',      icon: TrendingUp, value: getDemandLabel(ap.demand),                    hint: demandHint[ap.demand] },
              { label: 'Pathway',     icon: Award,      value: getPathwayLabel(ap.pathwayType),              hint: pathwayHint[ap.pathwayType] },
              { label: 'Competition', icon: Target,     value: getCompetitivenessLabel(ap.competitiveness),  hint: compHint[ap.competitiveness] },
            ].map((tile) => {
              const Icon = tile.icon;
              return (
                <div key={tile.label} className="rounded-control border border-border bg-card/30 px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="h-3 w-3 text-muted-foreground/55 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                      {tile.label}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground/90">
                    {tile.value}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug">
                    {tile.hint}
                  </p>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Hero: Video + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Video — 2 cols */}
        <SectionCard className="lg:col-span-2">
          <SectionHeader icon={Play} title="A Day in the Life" centered collapsed={dCollapsed('d-video')} onToggle={() => dToggle('d-video')} />
          {!dCollapsed('d-video') && <div className="p-4">
            {videoId ? (
              <div className="space-y-2">
                <div className="relative rounded-control overflow-hidden">
                  <iframe
                    key={videoId}
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`Day in the life — ${career.title}`}
                  />
                  <SaveVideoButton
                    saved={isDayVideoSaved(videoId)}
                    onSave={() =>
                      save({
                        videoId,
                        title: currentVideo?.title ?? `A Day in the Life — ${career.title}`,
                        careerPathId: career?.id,
                      })
                    }
                    title={currentVideo?.title ?? `A Day in the Life — ${career.title}`}
                    className="right-2 top-2"
                  />
                </div>
                {/* "More videos" control — only shown when the search
                    returned multiple clips. Cycles through the list and
                    wraps so the user can keep tapping for variety. */}
                {hasMoreVideos && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-muted-foreground/70 truncate flex-1">
                      {currentVideo?.title ?? ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVideoIndex((i) => (i + 1) % videos.length)}
                      title="Show another Day in the Life video"
                      aria-label="Show another Day in the Life video"
                      className="inline-flex items-center gap-1.5 rounded-control border border-border/40 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/70 hover:bg-muted/30 transition-colors shrink-0"
                    >
                      <Video className="h-3 w-3" />
                      More ({videoIndex + 1}/{videos.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-control border border-dashed border-border/30 bg-muted/10 aspect-video px-4 text-center">
                <div className="h-10 w-10 rounded-pill bg-muted/40 flex items-center justify-center">
                  <Video className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/70">
                    No videos found for this career
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed">
                    We couldn&apos;t find a relevant &quot;Day in the Life&quot; clip for {career.title}.
                  </p>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`day in the life ${career.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary/80 hover:underline"
                >
                  Search YouTube yourself →
                </a>
              </div>
            )}
          </div>}
        </SectionCard>

        {/* Day Simulation moved to Understand tab → "A Typical Day" section */}

        {/* Overview stats — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <SectionCard>
            <SectionHeader icon={BarChart3} title="Career Overview" centered collapsed={dCollapsed('d-overview')} onToggle={() => dToggle('d-overview')} />
            {!dCollapsed('d-overview') && <div className="p-4 flex flex-col items-center gap-3">
              {(() => {
                const sector = getSectorForCareer(career.id);
                const pensionNote = getPensionNote(sector);
                const sectorLabel = sector === 'public' ? 'Public' : sector === 'private' ? 'Private' : 'Public & Private';
                const sectorAccent = sector === 'public' ? 'text-info' : sector === 'private' ? 'text-accent' : 'text-muted-foreground/70';
                return (
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    <div>
                      {lcSalary ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowSalaryPopup(true)}
                            aria-label={showsSalaryProgression(country) ? 'See full salary progression' : undefined}
                            className="relative w-full text-left"
                          >
                            <StatCard label="Annual Salary" value={showsSalaryProgression(country) ? formatSalaryShort(lcSalary) : lcSalary} icon={DollarSign} accent="text-success" tooltip={showsSalaryProgression(country) ? `Typical annual gross salary in Norway: ${lcSalary.replace('/year', '')}. Tap to see how pay grows.` : `Typical annual gross salary: ${lcSalary.replace('/year', '')}.`} />
                            {/* Glowing affordance — tapping the box opens the
                                salary-progression popup (replaces the old
                                "See full progression →" link). */}
                            {showsSalaryProgression(country) && (
                              <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/15 ring-1 ring-amber-400/40 shadow-[0_0_10px_2px_rgba(251,191,36,0.45)] animate-pulse">
                                <TrendingUp className="h-3 w-3 text-amber-300" />
                              </span>
                            )}
                          </button>
                        </>
                      ) : (
                        <StatCard label="Annual Salary" value={notTailored} icon={DollarSign} accent="text-muted-foreground/60" />
                      )}
                    </div>
                    <StatCard
                      label="Growth"
                      value={career.growthOutlook === 'high' ? 'High Demand' : career.growthOutlook === 'medium' ? 'Growing' : 'Stable'}
                      icon={TrendingUp}
                      accent={career.growthOutlook === 'high' ? 'text-success' : career.growthOutlook === 'medium' ? 'text-warning' : 'text-muted-foreground/70'}
                    />
                    <StatCard label="Sector" value={sectorLabel} icon={Building2} accent={sectorAccent} tooltip={showsSalaryProgression(country) ? `Most ${career.title} roles in Norway are in the ${sector} sector.` : `Most ${career.title} roles are in the ${sector} sector.`} />
                    <StatCard label="Pension" value={sector === 'public' ? 'Strong' : sector === 'private' ? 'Varies' : 'Mixed'} icon={Shield} accent={sector === 'public' ? 'text-success' : 'text-muted-foreground/60'} tooltip={pensionNote} />
                  </div>
                );
              })()}
              {/* How You Qualify removed — lives in Understand's Education
                  Pathway → School Readiness tab. The old ~110-line
                  per-career requirements chain is preserved in git
                  history (pre-2026-04-22) if it needs to be resurrected
                  for a different surface. */}
            </div>}
          </SectionCard>
        </div>
      </div>

      {/* Quick insights row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Career DNA — replaces the old "Timeline" card. A compact, clickable
            quick-insight that opens the DNA modal (what the career is made of).
            The full study-timeline lives in Clarity → roadmap. */}
        <CareerDNASection career={career} variant="card" />

        {/* Work environment — always visible */}
        <div className="rounded-card border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-3.5 w-3.5 text-foreground" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Where you&apos;ll work</span>
          </div>
          {dDetails?.typicalDay.environment ? (
            <p className="text-xs text-foreground/70 leading-relaxed">{dDetails.typicalDay.environment}</p>
          ) : (
            <p className="text-xs text-muted-foreground/65">Details not available for this career yet.</p>
          )}
        </div>

        {/* "Good to Know" and "School Readiness" removed from Discover —
            these live in Understand's "The Reality" and "Education Pathway
            → School Readiness" sections respectively. The pre-2026-04-22
            dead IIFE was removed; pull from git history if needed. */}
      </div>


      {/* Advance to Understand. A single, plain-language cue replaces the
          old "Have you explored…? Yes" confirmation + separate arrow button
          (two controls for one decision, which read as confusing). Clicking
          Next IS the confirmation: the parent records the Discover step as
          done — driving the dashboard's progress ring and unlocking the
          Understand tab — and moves the user straight on. */}
      <TabAdvancePrompt question="Ready to move to Understand?" onNext={onContinue} />

      {/* Salary Progression popup */}
      {showSalaryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowSalaryPopup(false)}>
          <div
            className="bg-card border border-border/40 rounded-card max-w-2xl w-full p-5 shadow-sm max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground/90">Salary Progression</h3>
              <button type="button" onClick={() => setShowSalaryPopup(false)} className="p-1 hover:bg-muted/40 rounded transition-colors">
                <X className="h-4 w-4 text-muted-foreground/60" />
              </button>
            </div>
            {showsSalaryProgression(country) && <SalaryProgressionLine career={career} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── UNDERSTAND TAB ──────────────────────────────────────────────────────────

function CollapsibleSection({
  title, icon: Icon, count, accent, children, isOpen, onToggle,
}: {
  title: string; icon: typeof Eye; count?: number; accent?: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <SectionCard>
      <button onClick={onToggle} className="w-full flex items-center gap-2.5 px-5 py-3.5 text-left hover:bg-muted/5 transition-colors">
        <Icon className={cn('h-4 w-4', accent || 'text-muted-foreground/60')} />
        <h3 className="text-sm font-semibold text-foreground/90 flex-1">{title}</h3>
        {count !== undefined && <span className="text-xs text-muted-foreground/65">{count}</span>}
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground/60 transition-transform', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-border/30 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

function UnderstandTab({
  career,
  goalTitle,
  onContinue,
}: {
  career: Career | null;
  goalTitle: string | null;
  /** Advance to Clarity — confirms the Understand step and navigates. */
  onContinue: () => void;
}) {
  const t = useTranslations("careerTwin");
  const { data: detailsData, isLoading: detailsLoading } = useCareerDetails(career?.id ?? null);
  const { data: learningData, isLoading: learningLoading } = useLearningRecommendations(goalTitle);
  const { data: courseSearchData } = useCourseSearch(goalTitle);
  const { data: realityData, isLoading: realityLoading } = useCareerReality(goalTitle);

  // Study Path is country-scoped: a viewer only sees programmes for their own
  // country (defaults to Norway when unknown), so e.g. Spain users never see
  // Norwegian listings.
  const { data: countryData } = useQuery<{ country?: string | null }>({
    queryKey: ['profile-country'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) return {};
      return res.json();
    },
    // Country rarely changes; a long staleTime keeps it a cache hit on re-open
    // so the YouTube fetch (gated on this) never waits on a fresh request.
    staleTime: 30 * 60 * 1000,
  });
  const educationCountry = useMemo<NordicCountry | undefined>(() => {
    const code = countryToCode(countryData?.country ?? DEFAULT_COUNTRY);
    return (code ?? undefined) as NordicCountry | undefined;
  }, [countryData?.country]);

  // All hooks must be called before any early return
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  // EVERY Understand section opens minimised on load, at all times. The user
  // can expand sections in-session, but every fresh load resets them all to
  // minimised (ignores any stored open/closed choice) — the tab always opens
  // calm and scannable. Reuse one list for both args so they can't drift.
  const U_SECTION_KEYS = ['u-role', 'u-growth', 'u-day', 'u-education-pathway', 'u-specialisms', 'u-notes'];
  const { isCollapsed: uCollapsed, toggle: uToggle } = useSectionCollapse(
    U_SECTION_KEYS,
    [],
    U_SECTION_KEYS,
  );

  if (!career || !goalTitle) {
    return <EmptyState icon={Globe} message="Set a career goal in Discover first" />;
  }

  const details = detailsData?.details ?? null;
  const progression = detailsData?.progression ?? null;
  const pathProgression = (detailsData?.pathProgression ?? null) as CareerProgressionData | null;
  // One or two realistic example employers for the Typical Day card, so
  // the day feels grounded in a real place (e.g. a telecoms engineer at
  // Telenor). Prefers curated employers, falls back to category-level.
  // Norwegian employer data only — suppressed for non-Norway users (e.g.
  // a Spain user shouldn't be told they'd work at Telenor).
  const exampleEmployers = career?.id ? getRepresentativeEmployers(career.id, detailsData?.category, educationCountry) : [];
  const toggle = (id: string) => setOpenSection(prev => prev === id ? null : id);

  const allCourses = [
    ...(learningData?.localRegional ?? []),
    ...(learningData?.international ?? []),
  ];

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="rounded-card border-2 border-info/30 bg-info/[0.04] shadow-sm p-5">
        <p className="text-sm text-foreground/70 leading-[1.8]">
          Here&apos;s what being a <span className="font-semibold text-foreground/90">{goalTitle}</span>{' '}actually involves — the real responsibilities, a typical working day, and the education and training you&apos;ll need to get there.
        </p>
      </div>

      {/* ── Inside the Role — What You'll Do · The Reality · Tools as one
          tabbed card (was two side-by-side cards). Tabs use the same
          teal-underline styling as Education Pathway for consistency. */}
      <SectionCard accent="blue">
        <SectionHeader
          icon={Briefcase}
          title="Inside the Role"
          tooltip="What you'll actually do day to day, an honest look at the reality, and the tools of the trade."
          collapsed={uCollapsed('u-role')}
          onToggle={() => uToggle('u-role')}
          badge={
            uCollapsed('u-role') ? (
              <span className="journey-start-here inline-flex items-center gap-1 rounded-full border bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                Start here
                <ArrowRight className="start-here-arrow h-3 w-3" />
              </span>
            ) : undefined
          }
        />
        {!uCollapsed('u-role') && (
          <div className="p-4 sm:p-5">
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className={cn('grid w-full h-auto p-0 bg-transparent gap-0 border-b border-border/40 rounded-none', career?.id && hasMyths(career.id) ? 'grid-cols-4' : 'grid-cols-3')}>
                <TabsTrigger value="tasks" className="relative rounded-none border-0 bg-transparent px-4 py-3.5 text-sm font-semibold text-muted-foreground/65 hover:text-foreground/85 transition-colors data-[state=active]:bg-muted/20 data-[state=active]:text-foreground data-[state=active]:shadow-none after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-primary after:scale-x-0 after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100">
                  <span className="inline-flex items-center gap-2"><Briefcase className="h-4 w-4" />What You&apos;ll Do</span>
                </TabsTrigger>
                <TabsTrigger value="reality" className="relative rounded-none border-0 bg-transparent px-4 py-3.5 text-sm font-semibold text-muted-foreground/65 hover:text-foreground/85 transition-colors data-[state=active]:bg-muted/20 data-[state=active]:text-foreground data-[state=active]:shadow-none after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-primary after:scale-x-0 after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100">
                  <span className="inline-flex items-center gap-2"><Eye className="h-4 w-4" />The Reality</span>
                </TabsTrigger>
                <TabsTrigger value="tools" className="relative rounded-none border-0 bg-transparent px-4 py-3.5 text-sm font-semibold text-muted-foreground/65 hover:text-foreground/85 transition-colors data-[state=active]:bg-muted/20 data-[state=active]:text-foreground data-[state=active]:shadow-none after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-primary after:scale-x-0 after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100">
                  <span className="inline-flex items-center gap-2"><Wrench className="h-4 w-4" />Tools</span>
                </TabsTrigger>
                {career?.id && hasMyths(career.id) && (
                  <TabsTrigger value="myths" className="relative rounded-none border-0 bg-transparent px-4 py-3.5 text-sm font-semibold text-muted-foreground/65 hover:text-foreground/85 transition-colors data-[state=active]:bg-muted/20 data-[state=active]:text-foreground data-[state=active]:shadow-none after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-primary after:scale-x-0 after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100">
                    <span className="inline-flex items-center gap-2"><Shield className="h-4 w-4" />Misconceptions</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="tasks" className="mt-6">
                {details && details.whatYouActuallyDo.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {details.whatYouActuallyDo.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <span className="text-xs font-bold text-primary/70 mt-[3px] shrink-0">{i + 1}.</span>
                        <span className="text-xs text-foreground/70 leading-snug">{task}</span>
                      </li>
                    ))}
                  </ul>
                ) : detailsLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <p className="text-xs text-muted-foreground/65">Details not available for this career yet.</p>
                )}
              </TabsContent>

              <TabsContent value="reality" className="mt-6">
                <div className="space-y-3">
                  {(realityLoading || realityData?.pending) && !details?.realityCheck ? (
                    <div className="space-y-2.5">
                      <div className="h-3 w-full rounded bg-muted-foreground/5 animate-pulse" />
                      <div className="h-3 w-4/5 rounded bg-muted-foreground/5 animate-pulse" />
                      <div className="h-3 w-3/5 rounded bg-muted-foreground/5 animate-pulse" />
                      <p className="text-[11px] text-muted-foreground/55 pt-0.5">Gathering honest insights about this career…</p>
                    </div>
                  ) : realityData && !realityData.pending ? (
                    <>
                      <p className="text-xs text-foreground/60 leading-relaxed">{realityData.realitySummary}</p>
                      {/* AI-generated content can be inaccurate — same disclaimer the
                          Career Twin shows, reused so the labelling stays consistent. */}
                      <div className="flex items-start gap-1.5">
                        <Info className="h-3 w-3 text-muted-foreground/60 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground/70 leading-snug">{t("disclaimer")}</p>
                      </div>
                      {(() => {
                        const hardships = realityData.realityPoints.filter(
                          (p) => !/\b(degree|training|qualification|certif|educat|university|college|school|study|course|licence|license)\b/i.test(p)
                        );
                        if (hardships.length === 0) return null;
                        return (
                          <div className="space-y-1">
                            {hardships.map((point, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <AlertCircle className="h-3 w-3 text-warning/70 shrink-0 mt-0.5" />
                                <p className="text-xs text-foreground/70 leading-relaxed">{point}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      <RealityVideos videos={realityData.videos} careerPathId={career?.id} />
                    </>
                  ) : details?.realityCheck ? (
                    <div className="rounded-control border border-warning/15 bg-warning/5 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground/70 italic leading-relaxed">{details.realityCheck}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/65">Reality insights not available for this career yet.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tools" className="mt-6">
                {details?.typicalDay.tools?.length ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {details.typicalDay.tools.map((tool, i) => {
                      const info = getToolInfo(tool);
                      return (
                        <a
                          key={i}
                          href={info?.url || `https://www.google.com/search?q=${encodeURIComponent(tool)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={info?.description || tool}
                          className="inline-flex items-center gap-1 rounded-pill border border-border/25 bg-background/30 px-2 py-0.5 text-xs text-foreground/65 hover:text-foreground hover:border-border/50 transition-colors"
                        >
                          {tool}
                          <ExternalLink className="h-2 w-2 text-muted-foreground/60" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/65">No specific tools listed for this career yet.</p>
                )}
              </TabsContent>

              {career?.id && hasMyths(career.id) && (
                <TabsContent value="myths" className="mt-6">
                  <CareerMythBuster careerId={career.id} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </SectionCard>

      {/* How this role grows — entry → core → (expert / lead) ladder. */}
      {pathProgression && (
        <SectionCard accent="blue">
          <SectionHeader
            icon={TrendingUp}
            title="How this role grows"
            tooltip="Where this role can lead as you gain experience — and, where it applies, the two different directions careers can take."
            collapsed={uCollapsed('u-growth')}
            onToggle={() => uToggle('u-growth')}
          />
          {!uCollapsed('u-growth') && (
            <div className="px-4 pb-4">
              <CareerProgressionFlow progression={pathProgression} />
            </div>
          )}
        </SectionCard>
      )}

      {/* Career Presence was previously a standalone card here — it's
          now embedded inside the "Real Career Paths & Tools" section
          below as a persistent header band above the tab bar. Moved so
          the Understand tab has fewer top-level sections and so the
          geography signal lives next to the Real Career Paths content
          it contextualises. */}

      {/* ── A Typical Day + Where People Work as one tabbed card. The day
          timeline and the real places people work read back-to-back ("what's
          the day like?" → "where would I do it?"), so they share a card. The
          "Where People Work" tab only appears when we have employer data;
          otherwise the card is just the day timeline (no tabs). ── */}
      <SectionCard accent="blue">
        <SectionHeader icon={Clock} title="Day & Workplace" tooltip="What a real working day looks like in this role — and the kinds of places people do this job." collapsed={uCollapsed('u-day')} onToggle={() => uToggle('u-day')} />
        {!uCollapsed('u-day') && (() => {
          const showEmployers = !!career?.id && hasCareerEmployers(career.id, detailsData?.category, educationCountry);

          const dayContent = detailsLoading ? (
            <LoadingSkeleton />
          ) : details && details.typicalDay.morning.length > 0 ? (
            <>
              <div className="relative">
                {/* Horizontal connector line */}
                <div className="absolute top-[14px] left-0 right-0 h-px bg-accent/40 hidden sm:block" />

                {/* Three columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3">
                  {([
                    { label: 'Morning', time: '08:00 – 12:00', items: details.typicalDay.morning, icon: '🌅', dotClass: 'bg-warning', bgClass: 'bg-warning/[0.06]', borderClass: 'border-warning/15' },
                    { label: 'Midday', time: '12:00 – 14:00', items: details.typicalDay.midday, icon: '☀️', dotClass: 'bg-info', bgClass: 'bg-info/[0.06]', borderClass: 'border-info/15' },
                    { label: 'Afternoon', time: '14:00 – 17:00', items: details.typicalDay.afternoon, icon: '🌆', dotClass: 'bg-accent', bgClass: 'bg-accent/[0.06]', borderClass: 'border-accent/15' },
                  ] as const).map(({ label, time, items, icon, dotClass, bgClass, borderClass }) => (
                    <div key={label} className="flex flex-col items-center">
                      {/* Timeline node */}
                      <div className="hidden sm:flex items-center justify-center mb-3 z-10">
                        <div className={cn('h-[10px] w-[10px] rounded-full ring-2 ring-background', dotClass)} />
                      </div>

                      {/* Card */}
                      <div className={cn('w-full rounded-card border p-3.5', bgClass, borderClass)}>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none">{icon}</span>
                            <span className="text-xs font-semibold text-foreground/85">{label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground/45 tabular-nums font-medium">{time}</span>
                        </div>
                        <div className="space-y-1.5">
                          {items.map((item, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <div className={cn('h-1.5 w-1.5 rounded-pill mt-[5px] shrink-0 opacity-60', dotClass)} />
                              <span className="text-xs text-foreground/65 leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment footer */}
              {details.typicalDay.environment && (
                <div className="flex items-center gap-2.5 mt-3 px-3 py-2 rounded-control bg-muted/[0.06] border border-border/15">
                  <MapPin className="h-3 w-3 text-muted-foreground/65 shrink-0" />
                  <span className="text-xs text-muted-foreground/55 leading-relaxed">{details.typicalDay.environment}</span>
                </div>
              )}

              {/* Example employer — grounds the day in a real place to work. */}
              {exampleEmployers.length > 0 && (
                <div className="flex items-center gap-2.5 mt-2 px-3 py-2 rounded-control bg-muted/[0.06] border border-border/15">
                  <Building2 className="h-3 w-3 text-muted-foreground/65 shrink-0" />
                  <span className="text-xs text-muted-foreground/55 leading-relaxed">
                    Typically somewhere like{' '}
                    <span className="text-foreground/70 font-medium">{exampleEmployers.join(' or ')}</span>
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground/65">Daily schedule details not available for this career yet.</p>
          );

          // No employer data → just the day timeline, no tabs.
          if (!showEmployers) {
            return <div className="p-4 sm:p-5">{dayContent}</div>;
          }

          return (
            <div className="p-4 sm:p-5">
              <Tabs defaultValue="day" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-auto p-0 bg-transparent gap-0 border-b border-border/40 rounded-none">
                  <TabsTrigger value="day" className="relative rounded-none border-0 bg-transparent px-4 py-3.5 text-sm font-semibold text-muted-foreground/65 hover:text-foreground/85 transition-colors data-[state=active]:bg-muted/20 data-[state=active]:text-foreground data-[state=active]:shadow-none after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-primary after:scale-x-0 after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100">
                    <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />A Typical Day</span>
                  </TabsTrigger>
                  <TabsTrigger value="employers" className="relative rounded-none border-0 bg-transparent px-4 py-3.5 text-sm font-semibold text-muted-foreground/65 hover:text-foreground/85 transition-colors data-[state=active]:bg-muted/20 data-[state=active]:text-foreground data-[state=active]:shadow-none after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-primary after:scale-x-0 after:transition-transform after:duration-200 data-[state=active]:after:scale-x-100">
                    <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" />Where People Work</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="day" className="mt-6">{dayContent}</TabsContent>

                <TabsContent value="employers" className="mt-6">
                  <TopEmployers careerId={career!.id} category={detailsData?.category} country={educationCountry} />
                </TabsContent>
              </Tabs>
            </div>
          );
        })()}
      </SectionCard>

      {/* ── Education Pathway — School Readiness + Study Path as tabs
          inside a single card. The two sections used to live as two
          adjacent SectionCards; they're unified here because the
          student reads them as "am I ready?" → "where can I study?"
          back-to-back and the separate cards added noise. Defaults to
          the Readiness tab because that's the decision-support answer
          ("can I even pursue this?") before the student browses
          programmes. */}
      {(() => {
        const ap = getAcademicProfile(career);
        const essentialSubjects = ap.subjects.filter(s => s.importance === 'essential');

        // Honest country gate: School Readiness (subjects/grades) and the
        // Study Path programmes are Norway/Nordic-specific. For a country
        // we have no education data for (e.g. Spain), applying Norwegian
        // school subjects, grade thresholds and the Norwegian
        // career-requirements fallback would be misinformation — different
        // school system, different universities, different admission. So
        // show an explicit "not tailored yet" state instead of the tabs.
        if (!hasEducationData(educationCountry)) {
          const countryName = countryData?.country ?? 'your country';
          const countryProgs = career ? getProgrammesForCareer(career.id, educationCountry ? { country: educationCountry } : undefined) : [];

          // We DO have real universities for this career in the user's
          // country → show the Study Path (programme cards only, via
          // programmesOnly so no Norway-specific routes/notes leak).
          // School Readiness stays gated until we have that country's
          // school-system data.
          if (countryProgs.length > 0) {
            const esReadiness = career ? getSpanishReadiness(career.id) : null;
            const SELECTIVITY_LABEL = { low: 'Open access', moderate: 'Moderately selective', high: 'Selective', 'very-high': 'Highly selective' } as const;
            return (
              <SectionCard accent="blue">
                <SectionHeader
                  icon={GraduationCap}
                  title="Education Pathway"
                  tooltip="School readiness and the real universities in your country that lead to this career."
                  collapsed={uCollapsed('u-education-pathway')}
                  onToggle={() => uToggle('u-education-pathway')}
                />
                {!uCollapsed('u-education-pathway') && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {esReadiness ? (
                      <div className="rounded-card border border-border/20 bg-muted/[0.03] p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary/70" />
                          <span className="text-xs font-semibold text-foreground/85">School readiness — {countryName}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/55 mb-1">Recommended Bachillerato</p>
                            <p className="text-xs text-foreground/80 leading-snug">{esReadiness.modality}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/55 mb-1">Entry selectivity</p>
                            <p className="text-xs text-foreground/80 leading-snug">{SELECTIVITY_LABEL[esReadiness.selectivity]}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/55 mb-1.5">Key subjects (EvAU)</p>
                          <div className="flex flex-wrap gap-1.5">
                            {esReadiness.subjects.map((s) => (
                              <span key={s} className="rounded-pill border border-border/25 bg-background/30 px-2 py-0.5 text-[11px] text-foreground/70">{s}</span>
                            ))}
                          </div>
                        </div>
                        {esReadiness.note && <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{esReadiness.note}</p>}
                        <p className="text-[10px] text-muted-foreground/45 leading-relaxed">Entry is via the EvAU (Selectividad). The exact nota de corte varies by university and year — check each programme.</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">
                        School-readiness detail for {countryName} is coming for this career. Below are real {countryName} universities that lead to it.
                      </p>
                    )}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">Real {countryName} universities for this career:</p>
                      <EducationBrowser careerTitle={goalTitle} careerId={career?.id ?? null} country={educationCountry} programmesOnly />
                    </div>
                  </div>
                )}
              </SectionCard>
            );
          }

          // No data for this specific career in this country → honest gate.
          return (
            <SectionCard accent="blue">
              <SectionHeader
                icon={GraduationCap}
                title="Education Pathway"
                tooltip="School readiness and study options for this career, tailored to your country. We only show a country's real school system and universities — never another country's."
                collapsed={uCollapsed('u-education-pathway')}
                onToggle={() => uToggle('u-education-pathway')}
              />
              {!uCollapsed('u-education-pathway') && (
                <div className="p-4 sm:p-5">
                  <div className="rounded-card border border-border/20 bg-muted/[0.04] p-5 sm:p-6 text-center space-y-3">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted/20">
                      <GraduationCap className="h-5 w-5 text-muted-foreground/70" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/85">Not tailored for {countryName} yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1.5 leading-relaxed max-w-md mx-auto">
                        We&apos;re building {countryName} universities and entry requirements. We don&apos;t show another country&apos;s school system here, because subjects, grades and admission work differently.
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground/70 leading-relaxed max-w-md mx-auto pt-1">
                      <span className="text-foreground/60 font-medium">General route:</span>{' '}
                      upper-secondary school{' '}
                      <span className="text-muted-foreground/65">→</span>{' '}
                      {ap.requiresDegree ? 'a university degree' : 'vocational training or a degree'}{' '}
                      <span className="text-muted-foreground/65">→</span>{' '}
                      entry-level role.
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          );
        }

        // Same three-source Study Path detection as before. See the old
        // inline comment (git history) for the reasoning — short
        // version: hardcoded NORWAY_PROGRAMMES map, 3-layer programmes
        // via getProgrammesForCareer, or a universityPath.programme in
        // career-requirements. Any of the three = hasStudyPath.
        const hardcoded = (career && educationCountry === 'NO') ? getNorwayProgrammes(career.id, goalTitle || career.title) : null;
        const nordicProgs = career ? getProgrammesForCareer(career.id, educationCountry ? { country: educationCountry } : undefined) : [];
        const reqs = career ? getCareerRequirements(career.id) : null;
        const hasStudyPath =
          !!(hardcoded && hardcoded.programmes && hardcoded.programmes.length > 0) ||
          nordicProgs.length > 0 ||
          !!reqs?.universityPath?.programme;

        const certPath = career ? getCertificationPath(career.id, goalTitle || career.title) : null;

        // Aggregate freshness across every record visible in this card
        // — programmes (Nordic + hardcoded), and the routes/stages for
        // this career. The pill renders the WORST state across all of
        // them so the indicator never overpromises. Most records are
        // currently hand-curated (no lastVerifiedAt yet) so this will
        // typically render "Curated content" until the Norway sync
        // importer runs and stamps verification dates.
        const freshnessRecords = career
          ? [
              ...nordicProgs.map((p) => ({
                lastVerifiedAt: p.lastVerifiedAt,
                verificationSource: p.verificationSource,
              })),
              ...getRoutesForCareer(career.id).map((r) => ({
                lastVerifiedAt: r.lastVerifiedAt,
                verificationSource: r.verificationSource,
              })),
            ]
          : [];

        return (
          <SectionCard accent="blue">
            <SectionHeader
              icon={GraduationCap}
              title="Education Pathway"
              tooltip="School readiness and the real universities, colleges and vocational schools that lead to this career — filtered by your location and subjects."
              badge={
                freshnessRecords.length > 0 ? (
                  <FreshnessPillAggregate records={freshnessRecords} />
                ) : undefined
              }
              collapsed={uCollapsed('u-education-pathway')}
              onToggle={() => uToggle('u-education-pathway')}
            />
            {!uCollapsed('u-education-pathway') && (
              <div className="p-4 sm:p-5">
                <Tabs defaultValue="readiness" className="w-full">
                  {/* Prominent full-width tab strip — 2 equal-width
                      buttons with larger text, generous padding, and a
                      clear active state (teal underline + solid
                      background) so they read as a primary navigation
                      control rather than a small pill filter. */}
                  <TabsList className={cn("grid w-full h-auto p-0 bg-transparent gap-0 border-b border-border/40 rounded-none", certPath ? "grid-cols-3" : "grid-cols-2")}>
                    <TabsTrigger
                      value="readiness"
                      className="
                        relative rounded-none border-0 bg-transparent
                        px-4 py-3.5 text-sm font-semibold
                        text-muted-foreground/65 hover:text-foreground/85 transition-colors
                        data-[state=active]:bg-muted/20 data-[state=active]:text-foreground
                        data-[state=active]:shadow-none
                        after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5
                        after:bg-primary after:scale-x-0 after:transition-transform after:duration-200
                        data-[state=active]:after:scale-x-100
                      "
                    >
                      <span className="inline-flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        School Readiness
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="study-path"
                      className="
                        relative rounded-none border-0 bg-transparent
                        px-4 py-3.5 text-sm font-semibold
                        text-muted-foreground/65 hover:text-foreground/85 transition-colors
                        data-[state=active]:bg-muted/20 data-[state=active]:text-foreground
                        data-[state=active]:shadow-none
                        after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5
                        after:bg-primary after:scale-x-0 after:transition-transform after:duration-200
                        data-[state=active]:after:scale-x-100
                      "
                    >
                      <span className="inline-flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Study Path
                      </span>
                    </TabsTrigger>
                    {certPath && (
                      <TabsTrigger
                        value="certifications"
                        className="
                          relative rounded-none border-0 bg-transparent
                          px-4 py-3.5 text-sm font-semibold
                          text-muted-foreground/65 hover:text-foreground/85 transition-colors
                          data-[state=active]:bg-muted/20 data-[state=active]:text-foreground
                          data-[state=active]:shadow-none
                          after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5
                          after:bg-primary after:scale-x-0 after:transition-transform after:duration-200
                          data-[state=active]:after:scale-x-100
                        "
                      >
                        <span className="inline-flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Certifications
                        </span>
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="readiness" className="mt-6">
                    {/* Redesigned readiness view — three signal tiles
                        (Demand / Pathway / Competition), subject chips,
                        and a 1–6 grade meter. The old flat key/value
                        list was dismissed as "dull"; this surface keeps
                        the same signals but with colour-coded icons and
                        a clear scale so the user can read "is this for
                        me?" at a glance instead of parsing a grid. */}
                    {(() => {
                      const demandColors = getDemandColors(ap.demand);
                      const demandHint: Record<typeof ap.demand, string> = {
                        'low': 'Steady but quiet demand.',
                        'moderate': 'Balanced demand — opportunities exist.',
                        'strong': 'Growing demand — good prospects.',
                        'very-strong': 'High demand — opportunities are abundant.',
                      };
                      const pathwayTone: Record<typeof ap.pathwayType, { bg: string; text: string }> = {
                        'vocational':          { bg: 'bg-warning/10',   text: 'text-warning' },
                        'bachelor':            { bg: 'bg-info/10',     text: 'text-info' },
                        'master':              { bg: 'bg-info/10',    text: 'text-info' },
                        'doctorate':           { bg: 'bg-accent/10',  text: 'text-accent' },
                        'professional-degree': { bg: 'bg-accent/10',  text: 'text-accent' },
                        'mixed':               { bg: 'bg-muted',   text: 'text-muted-foreground' },
                        'entry-level':         { bg: 'bg-success/10', text: 'text-success' },
                        'licence-based':       { bg: 'bg-primary/10',    text: 'text-primary' },
                      };
                      const pathwayHint: Record<typeof ap.pathwayType, string> = {
                        'vocational':          'Apprenticeship or trade school route.',
                        'bachelor':            'Three-year university bachelor\u2019s.',
                        'master':              'Master\u2019s degree (typically 5 years).',
                        'doctorate':           'Doctoral study required.',
                        'professional-degree': 'Integrated 5\u20136 year degree.',
                        'mixed':               'Several valid routes into this role.',
                        'entry-level':         'No specific degree required to start.',
                        'licence-based':       'Licensing or certification needed.',
                      };
                      const compTone: Record<typeof ap.competitiveness, { bg: string; text: string }> = {
                        'low':       { bg: 'bg-success/10', text: 'text-success' },
                        'moderate':  { bg: 'bg-info/10',     text: 'text-info' },
                        'high':      { bg: 'bg-warning/10',   text: 'text-warning' },
                        'very-high': { bg: 'bg-accent/10',    text: 'text-accent' },
                      };
                      const compHint: Record<typeof ap.competitiveness, string> = {
                        'low':       'Broad admission — most qualified applicants get in.',
                        'moderate':  'Some selection — solid grades help.',
                        'high':      'Competitive — strong grades and preparation matter.',
                        'very-high': 'Highly selective — top grades and preparation required.',
                      };
                      const pt = pathwayTone[ap.pathwayType];
                      const ct = compTone[ap.competitiveness];

                      return (
                        <div className="space-y-4">
                          {/* ── Key subjects as chips ──────────────── */}
                          {essentialSubjects.length > 0 && (
                            <div className="rounded-card border border-border/40 bg-card/40 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="h-3.5 w-3.5 text-muted-foreground/70" />
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">Subjects you&rsquo;ll need</span>
                                <span className="ml-auto text-xs text-muted-foreground/70 tabular-nums">
                                  {essentialSubjects.length} essential
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {essentialSubjects.map((s) => (
                                  <span
                                    key={s.name}
                                    className="inline-flex items-center gap-1.5 rounded-pill border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground/80"
                                  >
                                    <Check className="h-3 w-3 text-muted-foreground/70" />
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ── Grade-range meter (1–6) ────────────── */}
                          {ap.grade.hasCutoff && ap.grade.gradeMin !== null && (
                            <div className="rounded-card border border-border/40 bg-card/40 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/70" />
                                  <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">Typical grade range</span>
                                </div>
                                <span className="text-xs font-semibold text-foreground/85 tabular-nums">
                                  {ap.grade.gradeMin}&ndash;{ap.grade.gradeMax}
                                  <span className="text-muted-foreground/45 font-normal"> / 6</span>
                                </span>
                              </div>
                              {/* Scale bars — out-of-range positions are
                                  neutral grey (ramping up slightly across
                                  the scale); only positions inside the
                                  required range light up teal, so the
                                  colour is reserved for the meaningful part
                                  of the scale. */}
                              <div className="flex gap-1.5">
                                {[
                                  'bg-muted-foreground/10',
                                  'bg-muted-foreground/15',
                                  'bg-muted-foreground/20',
                                  'bg-muted-foreground/25',
                                  'bg-muted-foreground/30',
                                  'bg-muted-foreground/35',
                                ].map((dimClass, i) => {
                                  const n = i + 1;
                                  const inRange = n >= (ap.grade.gradeMin ?? 0) && n <= (ap.grade.gradeMax ?? 0);
                                  return (
                                    <div
                                      key={n}
                                      className={cn(
                                        'h-2 flex-1 rounded-pill transition-colors',
                                        inRange ? 'bg-primary shadow-sm' : dimClass,
                                      )}
                                    />
                                  );
                                })}
                              </div>
                              <div className="flex justify-between mt-1.5 px-[2px]">
                                {[
                                  'text-muted-foreground/65',
                                  'text-muted-foreground/45',
                                  'text-muted-foreground/70',
                                  'text-muted-foreground/55',
                                  'text-muted-foreground/60',
                                  'text-muted-foreground/65',
                                ].map((dimClass, i) => {
                                  const n = i + 1;
                                  const inRange = n >= (ap.grade.gradeMin ?? 0) && n <= (ap.grade.gradeMax ?? 0);
                                  return (
                                    <span
                                      key={n}
                                      className={cn(
                                        'text-xs tabular-nums',
                                        inRange ? 'text-primary font-semibold' : dimClass,
                                      )}
                                    >
                                      {n}
                                    </span>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-muted-foreground/70 mt-3 leading-snug">
                                Indicative only &mdash; actual cut-offs vary by institution and year.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </TabsContent>

                  <TabsContent value="study-path" className="mt-5 space-y-6">
                    {hasStudyPath ? (
                      <EducationBrowser careerTitle={goalTitle} careerId={career?.id ?? null} country={educationCountry} />
                    ) : (
                      <div className="rounded-control border border-dashed border-border/40 bg-muted/10 p-4 text-center">
                        <p className="text-sm font-medium text-foreground/80">No formal study path required</p>
                        <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                          This career is typically entered through practice, portfolio, or on-the-job progression rather than a specific Norwegian university programme.
                        </p>
                      </div>
                    )}
                    {/* Funding & Scholarships — always shown (Lånekassen
                        is universal), with career-specific scholarships
                        highlighted when available. */}
                    <FundingSection careerId={career?.id ?? null} />
                  </TabsContent>

                  {/* ── Certifications tab ─────────────────────────── */}
                  {certPath && (
                    <TabsContent value="certifications" className="mt-5 space-y-4">
                      <p className="text-xs text-muted-foreground/75 leading-relaxed">
                        {certPath.summary}
                      </p>

                      {certPath.recommendedDegrees && certPath.recommendedDegrees.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                            Recommended degree background
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {certPath.recommendedDegrees.map((d: string) => (
                              <span key={d} className="inline-flex items-center rounded-pill border border-border/30 bg-muted/30 px-2.5 py-1 text-xs text-foreground/70">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="rounded-control border border-border/30 overflow-hidden">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-border/20 bg-muted/10">
                              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Certification</th>
                              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider hidden sm:table-cell">Provider</th>
                              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider hidden sm:table-cell">Duration</th>
                              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Cost</th>
                              <th className="px-3 py-2 w-8"><span className="sr-only">Link</span></th>
                            </tr>
                          </thead>
                          <tbody>
                            {certPath.certifications.map((cert: { name: string; provider: string; duration: string; cost: string; url: string; recognised: string }) => (
                              <tr
                                key={cert.name}
                                className="border-b border-border/10 last:border-b-0 hover:bg-muted/15 transition-colors cursor-pointer group"
                                onClick={() => cert.url && window.open(cert.url, '_blank', 'noopener,noreferrer')}
                                role="link"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if ((e.key === 'Enter' || e.key === ' ') && cert.url) {
                                    e.preventDefault();
                                    window.open(cert.url, '_blank', 'noopener,noreferrer');
                                  }
                                }}
                              >
                                <td className="px-3 py-2.5">
                                  <p className="text-xs font-medium text-foreground/90 leading-snug">{cert.name}</p>
                                  <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1 sm:hidden">{cert.provider} · {cert.duration}</p>
                                  <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{cert.recognised}</p>
                                </td>
                                <td className="px-3 py-2.5 hidden sm:table-cell">
                                  <span className="text-xs text-muted-foreground/60 whitespace-nowrap">{cert.provider}</span>
                                </td>
                                <td className="px-3 py-2.5 hidden sm:table-cell">
                                  <span className="text-xs text-muted-foreground/60 whitespace-nowrap">{cert.duration}</span>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="text-xs text-success/80 font-medium whitespace-nowrap">{cert.cost}</span>
                                </td>
                                <td className="px-3 py-2.5">
                                  {cert.url && (
                                    <ExternalLink className="h-3 w-3 text-muted-foreground/25 group-hover:text-primary/60 transition-colors" />
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}
          </SectionCard>
        );
      })()}

      {/* Common Misconceptions now lives as the "Misconceptions" tab inside
          the "Inside the Role" card above (alongside "What You'll Do"). */}

      {/* ── Where This Can Lead — specialism branches the career splits into
          after the core training (e.g. psychologist → clinical / child /
          forensic). Only rendered when curated branches exist, so most
          careers show nothing here. ── */}
      {career?.id && hasSpecialisms(career.id) && (
        <SectionCard accent="teal">
          <SectionHeader icon={Layers} title="Where This Can Lead" tooltip="The specialisms this career branches into after the core training — same foundation, different day-to-day and setting." collapsed={uCollapsed('u-specialisms')} onToggle={() => uToggle('u-specialisms')} />
          {!uCollapsed('u-specialisms') && (
            <div className="p-4 sm:p-5">
              <CareerSpecialisms careerId={career.id} />
            </div>
          )}
        </SectionCard>
      )}

      {/* Advance to Clarity — same single-cue pattern as Discover→Understand
          for consistency. Clicking Next records the Understand step as done
          and moves on. */}
      <TabAdvancePrompt question="Ready to move to Clarity?" onNext={onContinue} accent="info" />
    </div>
  );
}

/**
 * The single, plain-language cue for moving from one journey tab to the
 * next. Replaces the old two-control pattern (a "Have you explored…? Yes"
 * confirmation card sitting above a separate, initially-disabled arrow
 * button) which made one decision look like two steps. Here, Next is the
 * whole interaction: `onNext` both records the current step as complete
 * (unlocking the next tab + advancing the dashboard ring) and navigates.
 */
function TabAdvancePrompt({
  question,
  onNext,
  accent = 'primary',
}: {
  question: string;
  onNext: () => void;
  accent?: 'primary' | 'info';
}) {
  return (
    <div
      className={cn(
        'rounded-control border px-4 py-3 flex items-center justify-between gap-4',
        accent === 'info'
          ? 'border-info/20 bg-info/[0.04]'
          : 'border-primary/20 bg-primary/[0.04]',
      )}
    >
      <p className="text-sm text-foreground/75 min-w-0">{question}</p>
      <button
        onClick={onNext}
        className="journey-next-pulse group inline-flex items-center gap-1.5 px-4 py-2 rounded-control text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
      >
        Next
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function CourseCard({ course }: { course: LearningResource }) {
  return (
    <a
      href={course.officialUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-border/25 bg-background/30 hover:border-border/50 hover:bg-background/50 transition-all overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground/85 group-hover:text-foreground transition-colors leading-snug">{course.title}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{course.provider}</p>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/70 transition-colors shrink-0 mt-0.5" />
        </div>

        {course.description && (
          <p className="text-xs text-muted-foreground/65 mt-2 leading-relaxed line-clamp-2">{course.description}</p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground/70">
            <Clock className="h-2.5 w-2.5" /> {course.duration}
          </span>
          <span className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium',
            course.cost === 'Free' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted/20 text-muted-foreground/70',
          )}>
            {course.cost}
          </span>
          {course.regionDetails && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground/65">
              <MapPin className="h-2.5 w-2.5" /> {course.regionDetails}
            </span>
          )}
          {course.financialAidAvailable && (
            <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
              Aid available
            </span>
          )}
        </div>

        {course.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {course.highlights.slice(0, 3).map((h, i) => (
              <span key={i} className="inline-flex rounded-full border border-border/15 px-2 py-0.5 text-[10px] text-muted-foreground/65">{h}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

// ─── Career Notes ────────────────────────────────────────────────────────────

const NOTE_CATEGORIES = [
  { id: 'general', label: 'General', color: 'bg-foreground/10 text-foreground/60' },
  { id: 'research', label: 'Research', color: 'bg-blue-500/10 text-blue-400' },
  { id: 'reflection', label: 'Reflection', color: 'bg-violet-500/10 text-violet-400' },
  { id: 'question', label: 'Question', color: 'bg-amber-500/10 text-amber-400' },
  { id: 'link', label: 'Link / Resource', color: 'bg-emerald-500/10 text-emerald-400' },
] as const;

type NoteCategory = typeof NOTE_CATEGORIES[number]['id'];

interface CareerNote {
  id: string;
  text: string;
  category: NoteCategory;
  createdAt: string;
}

function loadNotes(careerTitle: string): CareerNote[] {
  try {
    const key = `journey-notes-v2-${careerTitle}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
}

function saveNotes(careerTitle: string, notes: CareerNote[]) {
  try {
    localStorage.setItem(`journey-notes-v2-${careerTitle}`, JSON.stringify(notes));
  } catch { /* ignore */ }
}

function CareerNotes({ careerTitle, collapsed, onToggle }: { careerTitle: string; collapsed?: boolean; onToggle?: () => void }) {
  const [notes, setNotes] = useState<CareerNote[]>([]);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<NoteCategory>('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setNotes(loadNotes(careerTitle));
    setEditingId(null);
    setNewText('');
  }, [careerTitle]);

  const addNote = () => {
    if (!newText.trim()) return;
    const updated = [...notes, { id: Date.now().toString(), text: newText.trim(), category: newCategory, createdAt: new Date().toISOString() }];
    setNotes(updated);
    saveNotes(careerTitle, updated);
    setNewText('');
    setNewCategory('general');
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotes(careerTitle, updated);
  };

  const startEdit = (note: CareerNote) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    const updated = notes.map(n => n.id === id ? { ...n, text: editText.trim() } : n);
    setNotes(updated);
    saveNotes(careerTitle, updated);
    setEditingId(null);
  };

  const catConfig = (id: NoteCategory) => NOTE_CATEGORIES.find(c => c.id === id) || NOTE_CATEGORIES[0];

  return (
    <SectionCard>
      <SectionHeader icon={Pencil} title="Your Notes" badge={notes.length > 0 ? <span className="text-[10px] text-muted-foreground/65">{notes.length}</span> : undefined} collapsed={collapsed} onToggle={onToggle} />
      {!collapsed && <div className="px-4 pb-3">
        {/* Notes list — compact rows */}
        {notes.length > 0 && (
          <div className="divide-y divide-border/15">
            {notes.map((note) => {
              const cat = catConfig(note.category);
              return (
                <div key={note.id} className="py-2 group">
                  {editingId === note.id ? (
                    <div className="flex gap-2">
                      <input value={editText} onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 rounded-md border border-border/30 bg-background/50 px-2.5 py-1.5 text-xs text-foreground/80 focus:outline-none focus:ring-1 focus:ring-foreground/20"
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(note.id); if (e.key === 'Escape') setEditingId(null); }}
                        autoFocus
                      />
                      <button onClick={() => saveEdit(note.id)} className="px-2 py-1 rounded text-[10px] font-medium bg-foreground text-background">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1 rounded text-[10px] text-muted-foreground/65">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium', cat.color)}>{cat.label}</span>
                      <p className="text-xs text-foreground/65 flex-1 truncate">{note.text}</p>
                      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => startEdit(note)} aria-label="Edit note" className="p-2 rounded text-muted-foreground/60 hover:text-foreground/60"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteNote(note.id)} aria-label="Delete note" className="p-2 rounded text-muted-foreground/60 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add — inline input */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/10 mt-1">
          <div className="relative flex-1">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add a note..."
              className="w-full rounded-md border border-border/20 bg-background/30 pl-2.5 pr-2.5 py-1.5 text-xs text-foreground/80 placeholder:text-muted-foreground/25 focus:outline-none focus:ring-1 focus:ring-foreground/15"
              maxLength={500}
              onKeyDown={(e) => { if (e.key === 'Enter' && newText.trim()) addNote(); }}
            />
          </div>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as NoteCategory)}
            className="rounded-md border border-border/20 bg-background/30 px-1.5 py-1.5 text-[10px] text-muted-foreground/70 focus:outline-none shrink-0"
          >
            {NOTE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <button
            onClick={addNote}
            disabled={!newText.trim()}
            className="shrink-0 p-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-20"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>}
    </SectionCard>
  );
}

// ─── CLARITY TAB ──────────────────────────────────────────────────────────────


function ClarityTab({ goalTitle, career }: { goalTitle: string | null; career: Career | null }) {
  const { data: detailsData } = useCareerDetails(career?.id ?? null);
  const details = detailsData?.details ?? null;

  // Education context — drives the foundation gate for Play and Clarity completion.
  const { data: eduCtxData } = useQuery<{ educationContext: { stage?: string } | null }>({
    queryKey: ['education-context'],
    queryFn: async () => {
      const res = await fetch('/api/journey/education-context');
      if (!res.ok) return { educationContext: null };
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });
  const hasFoundation = !!eduCtxData?.educationContext?.stage;
  // The education-context query is undefined until it resolves; the
  // celebration must not treat that async settle as a completion event.
  const foundationReady = eduCtxData !== undefined;

  // Roadmap and Momentum headers are intentionally name-neutral —
  // always "Your Roadmap" / "Your Momentum" regardless of whether the
  // user has set a display name. Earlier versions interpolated the
  // user's first name as a possessive ("Henry's Roadmap") but this
  // reads as a label rather than a heading and loses meaning when the
  // display name is missing or awkward.
  const possessiveName = 'Your';

  // The consolidated Clarity card has three tabs: Your Roadmap (primary,
  // default), Ask Future Me (Career Twin), and Momentum.
  const [claritySubTab, setClaritySubTab] = useState<'roadmap' | 'ask-future-me' | 'momentum'>('roadmap');
  // g-future is the consolidated Roadmap/Ask Future Me/Momentum card. It
  // starts EXPANDED (not in the default-collapsed list) because the roadmap
  // is the primary Clarity surface; the user's collapse choice is remembered
  // per-user via localStorage (handled inside useSectionCollapse).
  const { isCollapsed: gCollapsed, toggle: gToggle } = useSectionCollapse(['g-field', 'g-future'], []);

  // Simulation — "Play Journey" button in the intro triggers the
  // voice-guided roadmap experience inside PersonalCareerTimeline.
  const [simulationPlay, setSimulationPlay] = useState<(() => void) | null>(null);

  // Full-screen roadmap overlay toggle — lets the user expand the
  // Clarity roadmap to fill the viewport so a long career ladder can be
  // scanned without fighting the page chrome. The overlay component
  // (FullscreenRoadmap) already handles its own Escape handler, scroll
  // lock, and close button.
  const [roadmapFullscreen, setRoadmapFullscreen] = useState(false);

  // Clarity accordion — only one section open at a time
  const [claritySection, setClaritySection] = useState<string | null>('actions');

  // Build contextual actions from real career data
  const topSkills = details?.topSkills ?? career?.keySkills ?? [];

  // Map career skills to school subjects
  const skillToSubject: Record<string, { subject: string; why: string }> = {
    'medical knowledge': { subject: 'Biology', why: 'Foundation of medical science' },
    'biology': { subject: 'Biology', why: 'Understanding living systems' },
    'chemistry': { subject: 'Chemistry', why: 'Chemical processes and reactions' },
    'communication': { subject: 'English', why: 'Clear writing and speaking' },
    'empathy': { subject: 'Psychology', why: 'Understanding human behaviour' },
    'analytical': { subject: 'Maths', why: 'Logical reasoning and analysis' },
    'mathematics': { subject: 'Maths', why: 'Calculations and problem-solving' },
    'numeracy': { subject: 'Maths', why: 'Core numeracy and calculations' },
    'accounting': { subject: 'Business Studies', why: 'Understanding commercial context' },
    'financial': { subject: 'Economics', why: 'Market and financial systems' },
    'programming': { subject: 'Computer Science', why: 'Coding and computational thinking' },
    'software': { subject: 'Computer Science', why: 'Programming and systems design' },
    'coding': { subject: 'Computer Science', why: 'Building with code' },
    'data': { subject: 'Maths / Statistics', why: 'Working with numbers and patterns' },
    'design': { subject: 'Art & Design', why: 'Visual thinking and creativity' },
    'creative': { subject: 'Art & Design', why: 'Creative expression and innovation' },
    'physics': { subject: 'Physics', why: 'Understanding physical systems' },
    'engineering': { subject: 'Physics', why: 'Core engineering principles' },
    'writing': { subject: 'English', why: 'Written communication skills' },
    'research': { subject: 'Science', why: 'Scientific method and inquiry' },
    'legal': { subject: 'History / Politics', why: 'Understanding law and governance' },
    'teaching': { subject: 'Your chosen specialist subject', why: 'Deep knowledge in what you teach' },
    'patient care': { subject: 'Biology', why: 'Understanding the human body' },
    'decision-making': { subject: 'Maths', why: 'Logic and structured reasoning' },
    'problem-solving': { subject: 'Maths', why: 'Analytical thinking' },
    'teamwork': { subject: 'PE / Drama', why: 'Collaboration and group dynamics' },
    'organisation': { subject: 'Business Studies', why: 'Planning and management' },
    'stress management': { subject: 'PE', why: 'Physical and mental resilience' },
  };

  const schoolSubjects = useMemo(() => {
    if (!career) return [];
    const seen = new Set<string>();
    const subjects: { subject: string; why: string }[] = [];
    for (const skill of career.keySkills) {
      const key = skill.toLowerCase();
      for (const [match, val] of Object.entries(skillToSubject)) {
        if (key.includes(match) && !seen.has(val.subject)) {
          seen.add(val.subject);
          subjects.push(val);
          if (subjects.length >= 4) break;
        }
      }
      if (subjects.length >= 4) break;
    }
    // Fallback if no matches
    if (subjects.length === 0) {
      subjects.push(
        { subject: 'English', why: 'Communication in any career' },
        { subject: 'Maths', why: 'Problem-solving and logic' },
      );
    }
    return subjects;
  }, [career?.keySkills]);

  const toggleClarity = (id: string) => setClaritySection(prev => prev === id ? null : id);

  // Build a contextual career consideration summary
  const careerConsideration = useMemo(() => {
    if (!career) return '';
    const edu = career.educationPath;
    const realityText = details?.realityCheck;
    const entryPaths = details?.entryPaths ?? [];
    const isEntry = career.entryLevel;

    // Extract duration hints from education path
    const yearMatch = edu.match(/(\d+)\s*[-–]\s*(\d+)\s*years?/i) || edu.match(/(\d+)\s*years?/i);
    const totalYears = yearMatch
      ? yearMatch[2] ? parseInt(yearMatch[2]) : parseInt(yearMatch[1])
      : null;

    // Count steps
    const stepCount = entryPaths.length;

    let summary = '';

    if (isEntry) {
      summary = `${career.title} is accessible without a university degree — you can get started through vocational training or on-the-job experience. This makes it one of the more direct career paths available to you right now.`;
    } else if (totalYears && totalYears >= 8) {
      summary = `Becoming a ${career.title} is a long-term commitment. The typical pathway involves ${edu.toLowerCase()}, which means ${totalYears}+ years of education and training before you're fully qualified. This is a career you grow into over time — start building relevant experience and knowledge now.`;
    } else if (totalYears && totalYears >= 4) {
      summary = `${career.title} requires a solid educational foundation — typically ${edu.toLowerCase()}. That's around ${totalYears} years of study, so it's worth making sure this direction feels right before committing.`;
    } else if (stepCount >= 3) {
      summary = `The path to ${career.title} has several stages: ${entryPaths.slice(0, 3).join(', then ')}. Each step builds on the last, so start by understanding what the first step requires.`;
    } else {
      summary = `To pursue a career as a ${career.title}, you'll need ${edu.toLowerCase()}. Understanding the requirements early gives you time to prepare and make informed decisions.`;
    }

    // Append growth context
    if (career.growthOutlook === 'high') {
      summary += ` The good news: demand for this role is high and growing.`;
    } else if (career.growthOutlook === 'stable') {
      summary += ` This is a stable career with consistent demand.`;
    }

    return summary;
  }, [career, details]);

  // ── Momentum (formerly "My Actions") ──────────────────────────────
  // The emotional anchor of the journey. Each action is typed (research /
  // reach out / do / learn / reflect) and on completion the user can leave
  // a quick reaction + one-line note. Over weeks this becomes a personal
  // journey log they can scroll back through.
  type ActionType = 'research' | 'reach' | 'do' | 'learn' | 'reflect';
  type ActionReaction = 'confirmed' | 'unsure' | 'mixed';
  // Three-state status replaces the original boolean `done`. We keep
  // `done` for backwards-compat with existing localStorage entries
  // (older items have only `done` and no `status` — derived below).
  type ActionStatus = 'not_started' | 'in_progress' | 'done';
  type Action = {
    id: string;
    text: string;
    done: boolean;
    status?: ActionStatus;
    type?: ActionType;
    completedAt?: number;
    reaction?: ActionReaction;
    note?: string;
  };
  // Derive a status from an action — old localStorage entries
  // pre-date the `status` field so we infer from `done`.
  const statusOf = (a: Action): ActionStatus =>
    a.status ?? (a.done ? 'done' : 'not_started');

  const actionsKey = `journey-actions-${career?.id ?? 'none'}`;
  // Server goalId — must match the slug used everywhere else in the
  // journey (PersonalCareerTimeline, /api/journey/goal-data) so the
  // momentum actions land on the SAME row as the rest of the user's
  // journey data instead of a separate orphan record.
  const serverGoalId = goalTitle ? slugify(goalTitle) : null;
  const [actions, setActions] = useState<Action[]>([]);
  // Sync state — we only show "saved to your journey" reassurance once
  // we've successfully persisted to the server at least once.
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [newAction, setNewAction] = useState('');
  const [newActionType, setNewActionType] = useState<ActionType>('research');
  // Action id awaiting a reflection (just ticked off, prompt is open)
  const [reflectingId, setReflectingId] = useState<string | null>(null);
  const [reflectionNote, setReflectionNote] = useState('');
  // Debounced server sync — collapses bursts of edits into a single
  // PATCH so we don't hammer the API on every checkbox tick.
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load actions: server is the source of truth (so the user's data
  // follows them across devices), but we keep localStorage as a fast
  // cache so the list paints immediately on mount before the server
  // round-trip completes. If the user has older localStorage data and
  // no server data yet, we migrate it on first save.
  useEffect(() => {
    let cancelled = false;
    // Paint from localStorage immediately so the UI isn't blank.
    try {
      const cached = JSON.parse(localStorage.getItem(actionsKey) || '[]');
      if (Array.isArray(cached)) setActions(cached);
    } catch { setActions([]); }

    if (!serverGoalId) return;
    // Then fetch from server and reconcile.
    fetch(`/api/journey/goal-data?goalId=${encodeURIComponent(serverGoalId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return;
        const summary = data?.goalData?.journeySummary as Record<string, unknown> | null;
        const serverActions = summary?.momentumActions as Action[] | undefined;
        if (Array.isArray(serverActions)) {
          // Server has data → use it. Update local cache too so the
          // next mount paints the up-to-date version.
          setActions(serverActions);
          try { localStorage.setItem(actionsKey, JSON.stringify(serverActions)); } catch { /* ignore */ }
          setSyncStatus('saved');
        }
        // If server is empty but localStorage has entries, the next
        // saveActions call will migrate them via the debounced sync.
      })
      .catch(() => { /* silent — localStorage cache is fine */ });
    return () => { cancelled = true; };
  }, [actionsKey, serverGoalId]);

  // Sync to server — debounced so a flurry of state changes only
  // results in one PATCH. Falls back gracefully if the user has no
  // active goal yet (in which case we still keep the localStorage
  // copy so nothing is lost).
  const syncActionsToServer = (updated: Action[]) => {
    if (!serverGoalId) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    setSyncStatus('syncing');
    syncTimerRef.current = setTimeout(() => {
      fetch('/api/journey/goal-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: serverGoalId, goalTitle, momentumActions: updated }),
      })
        .then(r => {
          if (r.ok) setSyncStatus('saved');
          else setSyncStatus('error');
        })
        .catch(() => setSyncStatus('error'));
    }, 800);
  };

  const saveActions = (updated: Action[]) => {
    setActions(updated);
    try { localStorage.setItem(actionsKey, JSON.stringify(updated)); } catch { /* ignore */ }
    syncActionsToServer(updated);
  };

  const addAction = () => {
    if (!newAction.trim()) return;
    saveActions([...actions, {
      id: Date.now().toString(),
      text: newAction.trim(),
      done: false,
      status: 'not_started',
      type: newActionType,
    }]);
    setNewAction('');
  };

  // Set an action's status directly. The Momentum row exposes three
  // explicit buttons (Todo / Doing / Done) so users don't have to
  // guess that tapping an indicator cycles through hidden states.
  const setActionStatus = (id: string, next: ActionStatus) => {
    const target = actions.find(a => a.id === id);
    if (!target) return;
    const current = statusOf(target);
    if (current === next) return;
    const becomingDone = next === 'done';
    const leavingDone = current === 'done';
    saveActions(actions.map(a => a.id === id
      ? {
          ...a,
          status: next,
          done: becomingDone,
          completedAt: becomingDone ? Date.now() : a.completedAt,
          // Clear reflection if leaving the done state
          reaction: leavingDone ? undefined : a.reaction,
          note: leavingDone ? undefined : a.note,
        }
      : a
    ));
    if (becomingDone) {
      setReflectingId(id);
      setReflectionNote('');
    } else if (reflectingId === id) {
      setReflectingId(null);
    }
  };
  // Backwards-compat alias — the completed-list checkbox still uses a
  // single toggle that sends "done" items back to "not_started".
  const toggleAction = (id: string) => {
    const target = actions.find(a => a.id === id);
    if (!target) return;
    setActionStatus(id, statusOf(target) === 'done' ? 'not_started' : 'done');
  };

  const saveReflection = (id: string, reaction: ActionReaction) => {
    saveActions(actions.map(a => a.id === id
      ? { ...a, reaction, note: reflectionNote.trim() || undefined }
      : a
    ));
    setReflectingId(null);
    setReflectionNote('');
  };

  const skipReflection = () => {
    setReflectingId(null);
    setReflectionNote('');
  };

  const deleteAction = (id: string) => saveActions(actions.filter(a => a.id !== id));

  // ── Momentum stats — calm facts, no gamification ──────────────────
  const momentumStats = useMemo(() => {
    const completed = actions.filter(a => a.done && a.completedAt);
    const totalDone = completed.length;

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const dayMs = 24 * 60 * 60 * 1000;

    const thisWeek = completed.filter(a => (a.completedAt ?? 0) > now - weekMs).length;

    let firstStepDays = 0;
    if (completed.length > 0) {
      const firstTs = Math.min(...completed.map(a => a.completedAt ?? now));
      firstStepDays = Math.floor((now - firstTs) / dayMs);
    }

    // 12-week dot strip — one bucket per week, oldest first (left), newest right
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const weekIdx = 11 - i; // 0 = oldest, 11 = current
      const weekStart = now - (weekIdx + 1) * weekMs;
      const weekEnd = now - weekIdx * weekMs;
      const count = completed.filter(a => {
        const ts = a.completedAt ?? 0;
        return ts >= weekStart && ts < weekEnd;
      }).length;
      return { count, isCurrent: weekIdx === 0 };
    });

    return { totalDone, thisWeek, firstStepDays, weeks };
  }, [actions]);

  // Action type metadata — keep small + consistent
  const ACTION_TYPES: { id: ActionType; label: string; emoji: string; tone: string }[] = [
    { id: 'research', label: 'Research', emoji: '🔍', tone: 'text-blue-400' },
    { id: 'reach',    label: 'Reach out', emoji: '💬', tone: 'text-emerald-400' },
    { id: 'do',       label: 'Do',       emoji: '✋', tone: 'text-amber-400' },
    { id: 'learn',    label: 'Learn',    emoji: '📚', tone: 'text-violet-400' },
    { id: 'reflect',  label: 'Reflect',  emoji: '🤔', tone: 'text-rose-400' },
  ];
  const typeMeta = (t?: ActionType) => ACTION_TYPES.find(x => x.id === t) ?? ACTION_TYPES[0];

  // Cycle through action types when the picker is clicked
  const cycleNewActionType = () => {
    const idx = ACTION_TYPES.findIndex(t => t.id === newActionType);
    setNewActionType(ACTION_TYPES[(idx + 1) % ACTION_TYPES.length].id);
  };

  // Reaction display metadata
  const REACTIONS: { id: ActionReaction; emoji: string; label: string; tone: string }[] = [
    { id: 'confirmed', emoji: '🔥', label: 'Confirmed it', tone: 'text-orange-400' },
    { id: 'unsure',    emoji: '🤔', label: 'Less sure now', tone: 'text-amber-400' },
    { id: 'mixed',     emoji: '⚖️', label: 'Mixed',         tone: 'text-slate-400' },
  ];
  const reactionMeta = (r?: ActionReaction) => REACTIONS.find(x => x.id === r);

  // Early return AFTER all hooks to satisfy React rules of hooks.
  if (!goalTitle || !career) {
    return <EmptyState icon={Rocket} message="Complete Discover and Understand first" />;
  }

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div
        className="rounded-xl border-2 p-5"
        style={{
          borderColor: 'rgba(234,88,12,0.4)',
          boxShadow: '0 0 20px rgba(234,88,12,0.08)',
          background: 'linear-gradient(135deg, rgba(234,88,12,0.05) 0%, transparent 50%)',
        }}
      >
        <p className="text-sm text-foreground/70 leading-[1.8]">
          This is your personal journey to become a <span className="font-semibold text-foreground/90">{goalTitle}</span>. Explore your roadmap, play the voice-guided narration, or browse each section at your own pace.
        </p>
      </div>

      {/* Consolidated Clarity card — one SectionCard, three tabs:
          [Your Roadmap | Ask Future Me | Momentum]. Your Roadmap is the
          primary surface so it's the default tab and the card opens expanded.
          Amber edge border + faint amber glow so it reads as part of the
          orange Clarity section. */}
      <SectionCard
        className="border-orange-500/40"
        style={{ boxShadow: '0 0 20px rgba(234,88,12,0.08)' }}
      >
        {/* Tab bar */}
        <div className="flex border-b border-border/20">
          <button
            type="button"
            onClick={() => setClaritySubTab('roadmap')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",
              claritySubTab === 'roadmap'
                ? "text-orange-500 border-b-2 border-orange-500 -mb-px"
                : "text-muted-foreground/70 hover:text-muted-foreground"
            )}
          >
            <Rocket className="h-3.5 w-3.5" />
            {possessiveName} Roadmap
          </button>
          <button
            type="button"
            onClick={() => setClaritySubTab('ask-future-me')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",
              claritySubTab === 'ask-future-me'
                ? "text-orange-500 border-b-2 border-orange-500 -mb-px"
                : "text-muted-foreground/70 hover:text-muted-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask Future Me
          </button>
          <button
            type="button"
            onClick={() => setClaritySubTab('momentum')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",
              claritySubTab === 'momentum'
                ? "text-orange-500 border-b-2 border-orange-500 -mb-px"
                : "text-muted-foreground/70 hover:text-muted-foreground"
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            Momentum
          </button>
          {/* Minimise the whole consolidated card. Choice persists via
              localStorage so it survives reloads. */}
          <button
            type="button"
            onClick={() => gToggle('g-future')}
            aria-label={gCollapsed('g-future') ? 'Expand this section' : 'Minimise this section'}
            aria-expanded={!gCollapsed('g-future')}
            className="flex items-center justify-center px-3 text-muted-foreground/55 hover:text-foreground transition-colors"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', gCollapsed('g-future') && '-rotate-90')} />
          </button>
        </div>

        {/* Tab content: Your Roadmap — the personal career timeline. The
            timeline component owns its own header ("…'s Roadmap to …"). A
            full-screen button sits at the top-right so a long ladder can be
            scanned without the page chrome. */}
        {!gCollapsed('g-future') && claritySubTab === 'roadmap' && (
          <div className="p-4">
            {goalTitle && (
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={() => setRoadmapFullscreen(true)}
                  title="Expand to full screen"
                  aria-label="Expand roadmap to full screen"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/30 bg-background/40 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-amber-500/40 hover:bg-amber-500/[0.06] transition-colors"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Full screen
                </button>
              </div>
            )}
            <PersonalCareerTimeline
              primaryGoalTitle={goalTitle}
              onSimulationReady={({ play }) => setSimulationPlay(() => play)}
            />
          </div>
        )}

        {/* Tab content: Ask Future Me — the Career Twin, inline. Opening it
            here never navigates away, so the user keeps their place in Clarity. */}
        {!gCollapsed('g-future') && claritySubTab === 'ask-future-me' && (
          <div className="p-4">
            <CareerTwinView initialCareerId={career?.id ?? null} embedded />
          </div>
        )}

        {/* Tab content: Momentum */}
        {!gCollapsed('g-future') && claritySubTab === 'momentum' && (
        <div>
        <div className="p-4 space-y-5">
          <p className="text-xs text-muted-foreground/70 leading-relaxed -mt-1">
            Small, concrete steps you can take right now. Pick a suggestion or add your own — even one action builds real momentum toward your goal.
          </p>
          {/* Suggested momentum — concrete starting points pulled
              from public search URLs so they always work without an API.
              Study-path suggestions (utdanning.no) are NOT included here:
              the Understand tab already has a dedicated "Study Path"
              section which is the canonical surface for that data. Don't
              re-add a "University courses for X" card — it duplicates
              Understand and muddies the job of Momentum, which is about
              non-study actions the user can take today (networking,
              conversations, hands-on exposure). */}
          {(() => {
              type MomentumSuggestion = {
                icon: typeof Users;
                color: string;
                title: string;
                descriptor: string;
                /** Optional external link — action-only suggestions omit it. */
                url?: string;
              };
              // Three complementary first moves: (1) where the openings are,
              // (2) who's already doing it (real people on LinkedIn), and
              // (3) a direct conversation with a course/college. The first
              // adapts to special pathways (Forsvaret, ESA, …); generic
              // careers get an open-jobs search instead.
              const careerOpening: MomentumSuggestion =
                career.pathType === 'military' ? {
                  icon: Users, color: 'text-green-400',
                  title: 'Explore careers at Forsvaret',
                  descriptor: 'Norwegian Armed Forces — career paths, requirements, and application',
                  url: 'https://www.forsvaret.no/karriere',
                } : career.pathType === 'police' ? {
                  icon: Users, color: 'text-blue-400',
                  title: 'Politihøgskolen — Start your application',
                  descriptor: 'Requirements, deadlines, and how to apply',
                  url: 'https://www.politihogskolen.no/opptak/',
                } : career.pathType === 'firefighter' ? {
                  icon: Users, color: 'text-red-400',
                  title: 'Norges brannskole — Training programme',
                  descriptor: 'How to qualify and apply for firefighter training',
                  url: 'https://www.nbsk.no/',
                } : career.pathType === 'space' ? {
                  icon: Users, color: 'text-indigo-400',
                  title: 'ESA Careers — Space agency opportunities',
                  descriptor: 'European Space Agency vacancies, internships, and Young Graduate Trainee programme',
                  url: 'https://jobs.esa.int/',
                } : career.pathType === 'elite-sport' ? {
                  icon: Users, color: 'text-amber-400',
                  title: 'Olympiatoppen — Elite sport programmes',
                  descriptor: 'Norwegian Olympic training system and talent pathways',
                  url: 'https://www.olympiatoppen.no/',
                } : {
                  icon: Briefcase, color: 'text-blue-400',
                  title: `Open ${career.title} jobs`,
                  descriptor: 'Browse current openings and entry-level roles',
                  url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(career.title)}`,
                };

              const allSuggestions: MomentumSuggestion[] = [
                careerOpening,
                {
                  icon: Users, color: 'text-sky-400',
                  title: `See people in ${career.title} roles`,
                  descriptor: 'Find professionals on LinkedIn and read their journeys',
                  url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(career.title)}`,
                },
                {
                  icon: Phone, color: 'text-teal-400',
                  title: 'Ask a course about openings',
                  descriptor: `Call or email a college or training provider to discuss entry options and places for ${career.title}`,
                  // No link — this one is a real-world conversation to do.
                },
              ];
              // Hide a suggestion once it's already been added to the
              // user's momentum list. Deleting it from "Your momentum"
              // brings the card back automatically.
              const visibleSuggestions = allSuggestions.filter(
                (s) => !actions.some((a) => a.text === s.title)
              );
              if (visibleSuggestions.length === 0) return null;
              return (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/65 mb-2">
                Suggested next moves
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visibleSuggestions.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className="rounded-lg border border-border/25 bg-background/30 p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', s.color)} />
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-foreground/85 leading-tight">
                          {s.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground/55 leading-snug mt-0.5">
                          {s.descriptor}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-auto pt-1">
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-0.5 rounded-md border border-border/30 bg-background/40 px-1.5 py-0.5 text-[9px] font-medium text-foreground/70 hover:border-border/60 hover:text-foreground transition-colors"
                        >
                          Open <ExternalLink className="h-2 w-2" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          saveActions([
                            ...actions,
                            {
                              id: Date.now().toString(),
                              text: s.title,
                              done: false,
                              status: 'not_started',
                              type: 'do',
                            },
                          ]);
                        }}
                        className="inline-flex items-center justify-center gap-0.5 rounded-md border border-amber-500/50 bg-amber-500/15 dark:border-amber-500/30 dark:bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 hover:bg-amber-500/25 dark:text-amber-300 dark:hover:bg-amber-500/20 transition-colors"
                        title="Add this as one of your momentum steps"
                      >
                        <Plus className="h-2 w-2" /> Add
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
              );
            })()}

          {/* Your momentum — horizontal carousel of compact cards */}
          <div>
            {actions.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/55 italic mb-2">
                No steps yet. Add one below or pick a suggested move above.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 pb-2">
                <div className="flex gap-2" style={{ minWidth: 'min-content' }}>
                  {actions.map((a) => {
                    const status = statusOf(a);
                    const isDone = status === 'done';
                    return (
                      <div
                        key={a.id}
                        className={cn(
                          'group relative shrink-0 w-[180px] rounded-lg border p-2.5 transition-colors',
                          isDone
                            ? 'border-emerald-500/40 bg-emerald-500/[0.04]'
                            : 'border-border/70 bg-background/30 hover:border-amber-500/50',
                        )}
                      >
                        {/* Delete — top-right, appears on hover */}
                        <button
                          onClick={() => deleteAction(a.id)}
                          className="absolute top-1 right-1 p-1.5 opacity-60 group-hover:opacity-100 text-muted-foreground/65 hover:text-rose-400 transition-all"
                          aria-label="Delete step"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        {/* Status toggle */}
                        <button
                          onClick={() =>
                            setActionStatus(a.id, isDone ? 'not_started' : 'done')
                          }
                          className={cn(
                            'h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors mb-1.5',
                            isDone
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-border/50 hover:border-foreground/50',
                          )}
                          aria-label={isDone ? 'Mark not done' : 'Mark done'}
                        >
                          {isDone && (
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                          )}
                        </button>

                        {/* Text */}
                        <p
                          className={cn(
                            'text-[11px] leading-snug line-clamp-2',
                            isDone
                              ? 'text-muted-foreground/55 line-through'
                              : 'text-foreground/85',
                          )}
                        >
                          {a.text}
                        </p>
                      </div>
                    );
                  })}

                  {/* Inline add — last card in the carousel */}
                  <div className="shrink-0 w-[180px] rounded-lg border border-dashed border-border/70 bg-background/20 p-2.5 flex flex-col justify-center">
                    <input
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAction();
                        }
                      }}
                      placeholder="Add a step…"
                      className="w-full rounded-md border border-border/60 bg-background/40 px-2 py-1 text-[10px] text-foreground/80 placeholder:text-muted-foreground/65 focus:outline-none focus:border-amber-500/40 mb-1.5"
                    />
                    <button
                      onClick={addAction}
                      disabled={!newAction.trim()}
                      className="w-full inline-flex items-center justify-center gap-0.5 rounded-md border border-amber-500/50 bg-amber-500/15 dark:border-amber-500/30 dark:bg-amber-500/10 px-2 py-1 text-[9px] font-semibold text-amber-700 hover:bg-amber-500/25 dark:text-amber-300 dark:hover:bg-amber-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-2.5 w-2.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {actions.length === 0 && (
              <div className="flex gap-2">
                <input
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAction();
                    }
                  }}
                  placeholder="Add your first step…"
                  className="flex-1 rounded-lg border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-foreground/85 placeholder:text-muted-foreground/65 focus:outline-none focus:border-amber-500/40"
                />
                <button
                  onClick={addAction}
                  disabled={!newAction.trim()}
                  className="inline-flex items-center gap-0.5 rounded-lg border border-amber-500/50 bg-amber-500/15 dark:border-amber-500/30 dark:bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-500/25 dark:text-amber-300 dark:hover:bg-amber-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="h-2.5 w-2.5" /> Add
                </button>
              </div>
            )}
            {syncStatus === 'saved' && (
              <p className="text-[9px] text-emerald-400/50 mt-1.5">Saved to your journey</p>
            )}
          </div>
        </div>
        </div>
        )}

      </SectionCard>
      {/* Full-screen roadmap overlay — triggered from the Your Roadmap tab. */}
      <AnimatePresence>
        {roadmapFullscreen && goalTitle && (
          <FullscreenRoadmap goalTitle={goalTitle} onClose={() => setRoadmapFullscreen(false)} />
        )}
      </AnimatePresence>

      {/* ── Confidence Tracker (after dates — user absorbs roadmap + deadlines, then reflects) ── */}
      {career && goalTitle && (
        <SectionCard>
          <div className="p-4 sm:p-5">
            <ConfidenceTracker careerId={career.id} careerTitle={goalTitle} />
          </div>
        </SectionCard>
      )}

      {/* ── Clarity completion — foundation + one Future Me question
            (momentum is optional and not required here) ── */}
      <ClarityCompletionCard
        careerTitle={goalTitle}
        careerId={career?.id ?? null}
        hasFoundation={hasFoundation}
        foundationReady={foundationReady}
      />

    </div>
  );
}


function ClarityCompletionCard({
  careerTitle,
  careerId,
  hasFoundation,
  foundationReady,
}: {
  careerTitle: string | null;
  careerId: string | null;
  hasFoundation: boolean;
  foundationReady: boolean;
}) {
  // Setting an interest level is the deliberate "verdict" that completes
  // Clarity and fires the celebration. Filling in the foundation alone does
  // NOT complete Clarity — otherwise the modal would pop just for opening the
  // roadmap. The celebration only triggers once the interest level is chosen.
  const { level: interestLevel, hydrated: interestHydrated } = useInterestLevel(careerId);
  const hasSetInterest = interestLevel != null;

  const clarityComplete = hasFoundation && hasSetInterest;
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Auto-mark Clarity as active on the dashboard when both conditions are met.
  useEffect(() => {
    if (clarityComplete && careerTitle) {
      markClarityActive(careerTitle);
    }
  }, [clarityComplete, careerTitle]);

  // One-time "moment of arrival": fire the celebration each time THIS career
  // actually crosses incomplete → complete during the session. We keep a
  // per-career completeness baseline (seeded on first observation) and only
  // pop on a genuine transition — see nextCelebrationState. This means:
  //   • re-opening an already-complete journey never re-pops ("not randomly"),
  //   • completing a career — via interest OR the Foundation — always pops,
  //   • completing a different career later pops for that one too.
  // We gate on `interestHydrated` so the initial async null → loaded-level
  // flip (which happens on every visit to a completed journey) does NOT look
  // like a completion: the baseline is only seeded once the persisted level
  // has settled. Triggering reactively on the transition — rather than a
  // single input's onChange — makes it robust to whichever half of Clarity
  // finishes last (the user rates interest in the ConfidenceTracker, not the
  // in-card picker, which is exactly why the onChange approach never fired).
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationBaseline = useRef<CelebrationBaseline | null>(null);
  useEffect(() => {
    // Both halves of completion load async (interest from storage, foundation
    // from a query). Only arm the detector once BOTH have settled, so neither
    // settle is mistaken for a completion on an already-complete journey.
    if (!interestHydrated || !foundationReady) return;
    const { baseline, celebrate } = nextCelebrationState(
      celebrationBaseline.current,
      careerId,
      clarityComplete,
    );
    celebrationBaseline.current = baseline;
    if (celebrate) setShowCelebration(true);
  }, [interestHydrated, foundationReady, careerId, clarityComplete]);

  const handleDownloadReport = useCallback(async () => {
    setReportError(null);
    setIsGeneratingReport(true);
    try {
      const response = await fetch('/api/reports/my-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const careerSlug = (careerTitle || 'career').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      a.href = url;
      a.download = `endeavrly-${careerSlug}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Report download failed:', error);
      setReportError('Could not generate your report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  }, [careerTitle]);

  // Interest is rated in the ConfidenceTracker ("How interested are you?"),
  // which is the single canonical control in Clarity and writes the same
  // useInterestLevel(careerId) store this card reads. The redundant in-card
  // rating prompt ("How do you feel about this path now?") has been removed —
  // completion is still driven by interestLevel + hasFoundation below, so the
  // celebration/active-state logic is unchanged. Before completion this card
  // renders nothing visible (the celebration is a modal); once complete it
  // shows the slim success row.
  return (
    <div>
      {clarityComplete && (
        /* Centred slim success row + a short human note underneath.
           Only as wide as its content: status label + PDF export. */
        <div className="flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-3 rounded-lg border border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.03] to-transparent px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" strokeWidth={2.25} />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold text-emerald-300 tracking-tight">Journey complete</span>
              {careerTitle && (
                <>
                  <span className="text-[10px] text-muted-foreground/65" aria-hidden>·</span>
                  <span className="text-xs font-medium text-foreground/80">{careerTitle}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* PDF export — labelled so it stays an obvious, always-available
                download at the bottom of Clarity, even after the one-time
                celebration modal has been dismissed. */}
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={isGeneratingReport}
              aria-label={`Download my career journey PDF${careerTitle ? ` for ${careerTitle}` : ''}`}
              title={isGeneratingReport ? 'Preparing your report…' : 'Download PDF'}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-emerald-950 px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Download PDF
                </>
              )}
            </button>
          </div>

          {reportError && (
            <p className="text-[10px] text-rose-400 ml-2 shrink-0" role="alert">{reportError}</p>
          )}
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/60 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to dashboard
        </Link>
        </div>
      )}

      <JourneyCompleteCelebration
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
        careerTitle={careerTitle}
        onDownload={handleDownloadReport}
        isDownloading={isGeneratingReport}
      />
    </div>
  );
}

function ActionRow({
  icon: Icon,
  title,
  subtitle,
  href,
  variant = 'default',
}: {
  icon: typeof Play;
  title: string;
  subtitle: string;
  href?: string;
  variant?: 'default' | 'highlight';
}) {
  const content = (
    <div className={cn(
      'group flex items-center gap-3.5 rounded-lg border p-3.5 transition-all',
      variant === 'highlight'
        ? 'border-border/20 bg-muted/5 hover:border-border/40 hover:bg-muted/10'
        : 'border-border/20 bg-background/30 hover:border-border/40 hover:bg-background/50',
    )}>
      <div className="h-9 w-9 rounded-lg bg-muted/20 flex items-center justify-center shrink-0 group-hover:bg-muted/30 transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground/60 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground/80 leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground/45 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      {href && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/70 shrink-0" />}
    </div>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
  }
  return content;
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function MyJourneyPage() {
  const { data: session } = useSession();
  const t = useTranslations();
  const { getAllCareers } = useCareerCatalog();
  const isYouth = session?.user?.role === 'YOUTH';
  const { data: goalsData, isLoading: goalsLoading } = useGoals(isYouth);
  const goalTitle = goalsData?.primaryGoal?.title ?? null;

  const career = useMemo(() => {
    if (!goalTitle) return null;
    return getAllCareers().find((c) => c.title === goalTitle) || null;
  }, [goalTitle, getAllCareers]);


  const [activeTab, setActiveTab] = useState<V2Tab>('discover');
  // Phase tabs are mounted lazily on first visit, then KEPT mounted (just
  // hidden when inactive) so switching Discover/Understand/Clarity is instant
  // and preserves each tab's sub-state (active sub-tab, scroll, video index)
  // instead of unmounting + remounting (which re-ran the tab's data hooks).
  const visitedTabsRef = useRef<Set<V2Tab>>(new Set());
  visitedTabsRef.current.add(activeTab);

  // ── Tab gating ─────────────────────────────────────────────────────
  // The three tabs are Discover → Understand → Clarity, and the user MUST
  // answer the YES/NOT-YET confirmation at the bottom of each content
  // tab before the next one unlocks. This is enforced at three places:
  //
  //   1. The tab bar disables locked tabs and shows a lock icon.
  //   2. `goToTab` is a guarded setter that silently refuses jumps to
  //      locked tabs (so a stale hash or a programmatic onContinue call
  //      can't bypass the gate).
  //   3. If the currently active tab becomes locked (the user toggled
  //      the previous tab's answer back to "Not yet"), we auto-rewind
  //      them to the earliest unlocked tab.
  //
  // Confirmation state lives in localStorage via lens-progress helpers;
  // we mirror it into React state so the tab bar re-renders the moment
  // the user clicks Yes / Not yet. The mirror is refreshed whenever
  // the career goal changes (localStorage keys are per-career).
  const [discoverConfirmedState, setDiscoverConfirmedState] = useState(false);
  const [understandConfirmedState, setUnderstandConfirmedState] = useState(false);
  useEffect(() => {
    setDiscoverConfirmedState(isDiscoverConfirmed(goalTitle));
    setUnderstandConfirmedState(isUnderstandConfirmed(goalTitle));
  }, [goalTitle]);

  const isTabLocked = useCallback(
    (id: V2Tab) => {
      if (id === 'discover') return false;
      if (id === 'understand') return !discoverConfirmedState;
      if (id === 'clarity') return !understandConfirmedState;
      return false;
    },
    [discoverConfirmedState, understandConfirmedState],
  );

  const goToTab = useCallback(
    (id: V2Tab) => {
      if (isTabLocked(id)) return;
      setActiveTab(id);
    },
    [isTabLocked],
  );

  // Read hash on mount (client only) and sync tab changes to hash.
  // If the hash points at a locked tab (e.g. stale bookmark, career
  // switch that reset the flags), fall back to the earliest unlocked
  // tab instead of honouring the hash.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as V2Tab;
    if (!['discover', 'understand', 'clarity'].includes(hash)) return;
    if (isTabLocked(hash)) {
      // Don't honour a hash that points at a locked tab.
      setActiveTab('discover');
      return;
    }
    setActiveTab(hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.location.hash = activeTab;
    // A freshly-switched lens always opens at the TOP of the section, never
    // mid-section or below. Setting the hash (or switching while scrolled
    // down in the previous lens) could otherwise leave the new lens scrolled
    // partway through, so reset scroll on every Discover/Understand/Clarity
    // transition.
    window.scrollTo({ top: 0 });
  }, [activeTab]);

  // If the user un-confirms the previous tab while sitting on a now-
  // locked tab (e.g. they're on Understand and click "Not yet" on
  // Discover via the dashboard), bounce them back to the earliest
  // unlocked tab so they can never sit on content they haven't earned.
  useEffect(() => {
    if (activeTab === 'clarity' && isTabLocked('clarity')) {
      setActiveTab(isTabLocked('understand') ? 'discover' : 'understand');
    } else if (activeTab === 'understand' && isTabLocked('understand')) {
      setActiveTab('discover');
    }
  }, [discoverConfirmedState, understandConfirmedState, activeTab, isTabLocked]);

  const [goalSheetOpen, setGoalSheetOpen] = useState(false);


  const tabs: { id: V2Tab; label: string; subtitle: string; icon: typeof Search; color: string; rgb: string; tooltip: string; lockedTooltip: string }[] = [
    { id: 'discover', label: t('journey.discover.label'), subtitle: t('journey.discover.subtitle'), icon: Search, color: 'text-teal-400', rgb: '13,148,136', tooltip: t('journey.discover.tooltip'), lockedTooltip: '' },
    { id: 'understand', label: t('journey.understand.label'), subtitle: t('journey.understand.subtitle'), icon: Globe, color: 'text-blue-400', rgb: '37,99,235', tooltip: t('journey.understand.tooltip'), lockedTooltip: t('journey.understand.lockedTooltip') },
    { id: 'clarity', label: t('journey.clarity.label'), subtitle: t('journey.clarity.subtitle'), icon: Rocket, color: 'text-orange-500', rgb: '234,88,12', tooltip: t('journey.clarity.tooltip'), lockedTooltip: t('journey.clarity.lockedTooltip') },
  ];

  // While goals are loading, show a skeleton to avoid flashing the onboarding
  // screen for users who already have a career goal set.
  if (goalsLoading) {
    return (
      <div className="min-h-screen dark:bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-8 w-48 rounded bg-muted/50 animate-pulse mb-4" />
          <div className="h-4 w-72 rounded bg-muted/30 animate-pulse mb-8" />
          <div className="h-64 rounded-xl bg-muted/20 animate-pulse" />
        </div>
      </div>
    );
  }

  // First-time empty state — when there's no career goal yet, show a single
  // welcoming screen explaining the framework instead of three confused tabs.
  if (!goalTitle) {
    return (
      <div className="min-h-screen dark:bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 mb-4">
              <Sparkles className="h-6 w-6 text-teal-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {t('journey.title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              {t('journey.empty.description')}
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              {
                n: 1,
                title: t('journey.discover.label'),
                subtitle: t('journey.discover.subtitle'),
                body: t('journey.discover.description'),
              },
              {
                n: 2,
                title: t('journey.understand.label'),
                subtitle: t('journey.understand.description'),
                body: t('journey.understand.description'),
              },
              {
                n: 3,
                title: t('journey.clarity.label'),
                subtitle: t('journey.clarity.subtitle'),
                body: t('journey.clarity.description'),
              },
            ].map((stage) => (
              <div
                key={stage.n}
                className="flex items-start gap-3 rounded-xl border bg-card p-4"
              >
                <div className="h-7 w-7 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-teal-500">{stage.n}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <p className="text-sm font-semibold">{stage.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      &middot; {stage.subtitle}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stage.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center">
            <button
              onClick={() => setGoalSheetOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
            >
              <Target className="h-4 w-4" />
              {t('journey.empty.choosePrimary')}
            </button>
            <a
              href="/careers/radar"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border bg-background hover:bg-muted/50 text-sm font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4 text-teal-500" />
              {t('journey.empty.exploreRadar')}
            </a>
          </div>
        </div>

        <GoalSelectionSheet
          open={goalSheetOpen}
          onClose={() => setGoalSheetOpen(false)}
          primaryGoal={goalsData?.primaryGoal || null}
          onSuccess={() => {
            setGoalSheetOpen(false);
            setActiveTab('discover');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">
              <span className="text-muted-foreground/70">My Journey to </span>
              {goalTitle}
            </h1>
            <button onClick={() => setGoalSheetOpen(true)} className="p-1 rounded-md text-muted-foreground/65 hover:text-muted-foreground hover:bg-muted/50 transition-colors" title="Change career goal">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tab bar — locked tabs are visually dimmed, get a lock icon
            in place of the category icon, and are click-disabled. The
            native title attribute surfaces why the tab is locked so the
            user never has to guess. */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            const locked = isTabLocked(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => goToTab(tab.id)}
                disabled={locked}
                aria-disabled={locked}
                title={locked ? tab.lockedTooltip : tab.tooltip}
                className={cn(
                  'relative rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                  locked
                    ? 'border-border/20 bg-muted/10 cursor-not-allowed opacity-55'
                    : isActive
                      ? 'border-transparent'
                      // Inactive tabs are now clearly-bordered cards (not faint
                      // ghosts): a visible border + a subtle fill, with a teal
                      // hint on hover so they read as tappable.
                      : 'border-border bg-card/60 hover:border-primary/60 hover:bg-card/80',
                )}
                style={isActive && !locked ? {
                  // Bold, unmistakable active state: a 2px coloured ring + a
                  // strong outer glow + a tinted fill, all from the tab's own
                  // colour. Composed from an rgb base so every tab pops equally.
                  boxShadow: `0 0 0 2px rgba(${tab.rgb},0.85), 0 0 18px rgba(${tab.rgb},0.5), 0 8px 22px rgba(${tab.rgb},0.22)`,
                  border: `2px solid rgba(${tab.rgb},0.9)`,
                  background: `linear-gradient(180deg, rgba(${tab.rgb},0.18) 0%, rgba(${tab.rgb},0.06) 100%)`,
                } : undefined}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  {locked ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/65" />
                  ) : (
                    <TabIcon className={cn('h-3.5 w-3.5', isActive ? tab.color : 'text-muted-foreground/70')} />
                  )}
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      locked
                        ? 'text-muted-foreground/45'
                        : isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground/60',
                    )}
                  >
                    {tab.label}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-[11px]',
                    locked
                      ? 'text-muted-foreground/25'
                      : isActive
                        ? 'text-foreground/70'
                        : 'text-muted-foreground/60',
                  )}
                >
                  {locked
                    ? tab.id === 'understand'
                      ? 'Locked — finish Discover first'
                      : 'Locked — finish Understand first'
                    : tab.subtitle}
                </p>
              </button>
            );
          })}
        </div>


        {/* Tab content. Each phase is rendered once visited and then kept
            mounted (hidden when inactive) — switching is instant and each tab
            keeps its own sub-state. A light fade-in plays when a tab becomes
            active. */}
        {visitedTabsRef.current.has('discover') && (
          <div
            key="discover"
            hidden={activeTab !== 'discover'}
            className={activeTab === 'discover' ? 'animate-in fade-in duration-150' : undefined}
          >
            <DiscoverTab
              career={career}
              goalTitle={goalTitle}
              // Next on Discover IS the confirmation: record the step as done,
              // mirror it into state so the tab bar unlocks, and navigate
              // directly. We can't route through goToTab here — its lock guard
              // closes over the pre-click discoverConfirmedState (still false in
              // this tick), so it would refuse the very jump we just earned.
              onContinue={() => {
                setDiscoverConfirmed(goalTitle, true);
                setDiscoverConfirmedState(true);
                setActiveTab('understand');
              }}
              onGoToUnderstand={() => goToTab('understand')}
            />
          </div>
        )}
        {visitedTabsRef.current.has('understand') && (
          <div
            key="understand"
            hidden={activeTab !== 'understand'}
            className={activeTab === 'understand' ? 'animate-in fade-in duration-150' : undefined}
          >
            <UnderstandTab
              career={career}
              goalTitle={goalTitle}
              // Same as Discover→Understand: Next confirms + unlocks + jumps
              // in one go, bypassing goToTab's stale lock guard.
              onContinue={() => {
                setUnderstandConfirmed(goalTitle, true);
                setUnderstandConfirmedState(true);
                setActiveTab('clarity');
              }}
            />
          </div>
        )}
        {visitedTabsRef.current.has('clarity') && (
          <div
            key="clarity"
            hidden={activeTab !== 'clarity'}
            className={activeTab === 'clarity' ? 'animate-in fade-in duration-150' : undefined}
          >
            <ClarityTab goalTitle={goalTitle} career={career} />
          </div>
        )}
      </div>

      <JourneyReflectionsTray
        careerSlug={career?.id ?? null}
        activeLens={activeTab}
      />

      {/* Companies tab — stacked above Reflections (which stays centred)
          so the two right-edge trays don't overlap, mirroring the
          SavedCareers/SavedComparisons tray pair on the Radar. Offset is
          half the Companies tab height (~116px) + half Reflections
          (~99px) + a small gap, measured; -88 left the longer labels
          overlapping by ~20px. */}
      <JourneyCompaniesTray
        careerId={career?.id ?? null}
        careerTitle={goalTitle ?? career?.title ?? null}
        topOffsetPx={-120}
      />

      <GoalSelectionSheet
        open={goalSheetOpen}
        onClose={() => setGoalSheetOpen(false)}
        primaryGoal={goalsData?.primaryGoal || null}
        onSuccess={() => {
          setGoalSheetOpen(false);
          setActiveTab('discover');
        }}
      />
    </div>
  );
}
