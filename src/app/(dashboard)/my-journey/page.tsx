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
  Building2, Shield, Loader2, Download, FileText, ListChecks, CheckCircle,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, slugify } from '@/lib/utils';
import { useGoals } from '@/hooks/use-goals';
import { getAllCareers, getSectorForCareer, getPensionNote, type Career } from '@/lib/career-pathways';
import type { CareerDetails } from '@/lib/career-typical-days';
import type { CareerProgression } from '@/lib/career-progressions';
import type { RealityCheckResult } from '@/lib/career-reality-types';
import type { NextStep } from '@/lib/reports/journey';
import { pickCelebrationMessage } from '@/lib/journey/celebration-messages';
import { getCertificationPath, getCareerRequirements, getNorwayProgrammes, getProgrammesForCareer } from '@/lib/education';
import {
  parseGradeRequirement,
  formatGradeLabel,
  formatGradeTooltip,
} from '@/lib/education/parse-grade-requirement';
import { getToolInfo } from '@/lib/education/tool-links';
import { getAcademicProfile, getDemandLabel, getDemandColors, getPathwayLabel, getCompetitivenessLabel } from '@/lib/education/academic-readiness';
import { EducationBrowser } from '@/components/education-browser';
import { FundingSection } from '@/components/education-browser/funding-section';
import { CareerMythBuster } from '@/components/journey/career-myth-buster';
import { TopEmployers } from '@/components/journey/top-employers';
import { SalaryProgressionChart } from '@/components/journey/salary-progression';
import { DeadlineAwareness } from '@/components/journey/deadline-awareness';
import { PivotPreview } from '@/components/journey/pivot-preview';
import { ShareJourney } from '@/components/journey/share-journey';
import { OpportunityMatches } from '@/components/journey/opportunity-matches';
// Day simulation removed per user request
// AI Impact section removed per user request
import type { Journey } from '@/lib/journey/career-journey-types';
import { setUnderstandConfirmed, isUnderstandConfirmed, setDiscoverConfirmed, isDiscoverConfirmed, markClarityActive } from '@/lib/journey/lens-progress';

const PersonalCareerTimeline = dynamic(
  () => import('@/components/journey').then((m) => m.PersonalCareerTimeline),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const GoalSelectionSheet = dynamic(
  () => import('@/components/goals/GoalSelectionSheet').then((m) => m.GoalSelectionSheet),
  { ssr: false }
);
const JourneyReflectionsTray = dynamic(
  () => import('@/components/journey/journey-reflections-tray').then((m) => m.JourneyReflectionsTray),
  { ssr: false }
);

// ─── Types ───────────────────────────────────────────────────────────────────

type V2Tab = 'discover' | 'understand' | 'clarity';

interface CareerDetailsResponse {
  career: Career;
  category: string;
  details: CareerDetails | null;
  progression: CareerProgression | null;
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
  return useQuery<YouTubeSearchResponse>({
    queryKey: ['youtube-video', careerTitle],
    queryFn: async () => {
      if (!careerTitle) return { videos: [], videoId: null, title: null };
      const query = `day in the life ${careerTitle}`;
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return { videos: [], videoId: null, title: null };
      return res.json();
    },
    enabled: !!careerTitle,
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
    staleTime: 5 * 60 * 1000,
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
    staleTime: 10 * 60 * 1000,
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
    staleTime: 30 * 60 * 1000,
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
    // If videos are missing (quota was exhausted), refetch sooner
    staleTime: 5 * 60 * 1000,
  });
}

interface CareerStoryData {
  id: string;
  videoId: string;
  name: string;
  jobTitle: string;
  company: string | null;
  location: string | null;
  yearsInRole: number | null;
  headline: string;
  takeaways: string[];
  duration: string | null;
}

function useCareerStories(careerId: string | null) {
  return useQuery<{ stories: CareerStoryData[]; count: number }>({
    queryKey: ['career-stories', careerId],
    queryFn: async () => {
      const res = await fetch(`/api/career-stories?career=${encodeURIComponent(careerId!)}`);
      if (!res.ok) return { stories: [], count: 0 };
      return res.json();
    },
    enabled: !!careerId,
    staleTime: 5 * 60 * 1000,
  });
}

interface ContributedPath {
  id: string;
  displayName: string;
  currentTitle: string;
  country: string;
  city: string | null;
  steps: { age: number; label: string }[];
  didAttendUniversity: boolean;
  yearsOfExperience: number | null;
  headline: string | null;
  advice: string | null;
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
          <Rocket className="h-5 w-5 text-amber-400" />
          <div>
            <h2 className="text-base font-semibold">Career Roadmap</h2>
            <p className="text-xs text-muted-foreground/50">Your path to {goalTitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/30 transition-colors">
          <X className="h-3.5 w-3.5" /> Close
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
      </div>
    </motion.div>
  );
}

// ─── Shared UI components ────────────────────────────────────────────────────

function SectionCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
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
    <div className={cn('rounded-xl border-[1.2px] border-border/60 bg-card/50 overflow-hidden', className)} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2), 0 0 20px rgba(139,92,246,0.096), 0 0 40px rgba(139,92,246,0.048)', ...style }}>
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
              <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-snug">
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
    <div className="rounded-xl border border-dashed border-border/30 p-12 text-center">
      <Icon className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
      <p className="text-sm text-muted-foreground/50">{message}</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, tooltip }: { label: string; value: string; icon: typeof TrendingUp; accent?: string; tooltip?: string }) {
  const card = (
    <div className={cn('rounded-lg border border-border/30 bg-background/50 p-3.5 flex flex-col items-center text-center', tooltip && 'cursor-help')}>
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <Icon className={cn('h-3.5 w-3.5', accent || 'text-muted-foreground/50')} />
        <span className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-semibold text-foreground/90">{value}</p>
    </div>
  );
  if (!tooltip) return card;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-snug">{tooltip}</TooltipContent>
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
        <div key={i} className="h-16 rounded-lg bg-muted/20 animate-pulse" />
      ))}
    </div>
  );
}

// ─── Section collapse helper ─────────────────────────────────────────────────

/** Manages collapse state for multiple sections, persisted in localStorage. */
function useSectionCollapse(keys: string[]) {
  const [state, setState] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const loaded: Record<string, boolean> = {};
      for (const k of keys) {
        loaded[k] = window.localStorage.getItem(`section-${k}`) === '1';
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
  onConfirmChange,
  onGoToUnderstand,
}: {
  career: Career | null;
  goalTitle: string | null;
  onContinue: () => void;
  /** Notifies the page so the Understand tab unlocks immediately. */
  onConfirmChange?: (confirmed: boolean) => void;
  /** Navigate to Understand tab (for "See full progression" link). */
  onGoToUnderstand?: () => void;
}) {
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
    staleTime: 30 * 1000,
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

  if (!career || !goalTitle) {
    return <EmptyState icon={Target} message="Choose a Primary Goal to start exploring" />;
  }

  const dDetails = discoverDetails?.details ?? null;

  return (
    <div className="space-y-5">
      {/* Role overview */}
      <div
        className="rounded-xl border-2 p-5"
        style={{
          borderColor: 'rgba(20,184,166,0.3)',
          boxShadow: '0 0 20px rgba(20,184,166,0.06)',
          background: 'linear-gradient(135deg, rgba(20,184,166,0.04) 0%, transparent 50%)',
        }}
      >
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

      {/* Hero: Video + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Video — 2 cols */}
        <SectionCard className="lg:col-span-2">
          <SectionHeader icon={Play} title="A Day in the Life" centered collapsed={dCollapsed('d-video')} onToggle={() => dToggle('d-video')} />
          {!dCollapsed('d-video') && <div className="p-4">
            {videoId ? (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden">
                  <iframe
                    key={videoId}
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`Day in the life — ${career.title}`}
                  />
                </div>
                {/* "More videos" control — only shown when the search
                    returned multiple clips. Cycles through the list and
                    wraps so the user can keep tapping for variety. */}
                {hasMoreVideos && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] text-muted-foreground/50 truncate flex-1">
                      {currentVideo?.title ?? ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVideoIndex((i) => (i + 1) % videos.length)}
                      title="Show another Day in the Life video"
                      aria-label="Show another Day in the Life video"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/40 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-border/70 hover:bg-muted/30 transition-colors shrink-0"
                    >
                      <Video className="h-3 w-3" />
                      More ({videoIndex + 1}/{videos.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/30 bg-muted/10 aspect-video px-4 text-center">
                <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
                  <Video className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/70">
                    No videos found for this career
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 leading-relaxed">
                    We couldn&apos;t find a relevant &quot;Day in the Life&quot; clip for {career.title}.
                  </p>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`day in the life ${career.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-teal-400 hover:text-teal-300 hover:underline"
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
                const sectorAccent = sector === 'public' ? 'text-blue-400' : sector === 'private' ? 'text-violet-400' : 'text-muted-foreground/50';
                return (
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    <div>
                      <button type="button" onClick={() => setShowSalaryPopup(true)} className="w-full text-left">
                        <StatCard label="Annual Salary" value={formatSalaryShort(career.avgSalary)} icon={DollarSign} accent="text-emerald-400" tooltip={`Typical annual gross salary in Norway: ${career.avgSalary.replace('/year', '')}. Tap to see full progression.`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSalaryPopup(true)}
                        className="text-[9px] text-amber-400/70 hover:text-amber-300 font-medium mt-1.5 flex items-center gap-0.5 transition-colors w-full justify-center"
                      >
                        See full progression →
                      </button>
                    </div>
                    <StatCard
                      label="Growth"
                      value={career.growthOutlook === 'high' ? 'High Demand' : career.growthOutlook === 'medium' ? 'Growing' : 'Stable'}
                      icon={TrendingUp}
                      accent={career.growthOutlook === 'high' ? 'text-emerald-400' : career.growthOutlook === 'medium' ? 'text-amber-400' : 'text-muted-foreground/50'}
                    />
                    <StatCard label="Sector" value={sectorLabel} icon={Building2} accent={sectorAccent} tooltip={`Most ${career.title} roles in Norway are in the ${sector} sector.`} />
                    <StatCard label="Pension" value={sector === 'public' ? 'Strong' : sector === 'private' ? 'Varies' : 'Mixed'} icon={Shield} accent={sector === 'public' ? 'text-emerald-400' : 'text-muted-foreground/60'} tooltip={pensionNote} />
                  </div>
                );
              })()}
              {/* What You Need — compact horizontal chain for Discover.
                  Each step is one small pill with full detail in its
                  native tooltip. Keeps the card tight and scannable. */}
              {(() => {
                const reqs = getCareerRequirements(career.id) || getCareerRequirements(career.title);
                if (!reqs) {
                  return (
                    <div className="w-full max-w-md rounded-lg border border-border/20 bg-muted/5 p-3">
                      <div className="flex items-center justify-center gap-2 mb-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-400/60" />
                        <span className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider">Education Path</span>
                      </div>
                      <p className="text-xs text-foreground/80">{career.educationPath}</p>
                    </div>
                  );
                }
                // Merge specialisation note into the last pill's tooltip
                const specNote = reqs.specialisationNote ? `\n\n${reqs.specialisationNote}` : '';

                // Parse the free-text `minimumGrade` field into a structured
                // shape. A grade pill is only inserted into the path chain
                // when the career has a real cutoff — vocational / entry-
                // accessible careers have no numeric cutoff in the source
                // data and the pill stays hidden rather than faking one.
                const grade = parseGradeRequirement(reqs.schoolSubjects.minimumGrade);
                const gradeLabel = formatGradeLabel(grade);
                const gradeTip = formatGradeTooltip(grade);

                // Abbreviate the school-subjects label as "First +N" when
                // there's more than one required subject, so the pill
                // chain fits on a single row at typical desktop widths.
                // The full list stays in the tooltip below, so no info
                // is lost — just compressed.
                const reqSubjects = reqs.schoolSubjects.required;
                const schoolSubjectsLabel =
                  reqSubjects.length > 0
                    ? `Key subject: ${reqSubjects[0]}${reqSubjects.length > 1 ? ` +${reqSubjects.length - 1}` : ''}`
                    : 'No specific subjects';

                // Some careers (e.g. chef) now store a full arrow-chain
                // in `programme` / `immediate` — that belongs in the
                // tooltip, not the pill. Strip to the final outcome so
                // each pill shows one concept, matching the compact
                // overview we had before the dataset got richer.
                const finalSegment = (s: string) =>
                  s.includes('→') ? (s.split('→').pop() || s).trim() : s;
                // Duration "4 years total (2 school + 2 apprenticeship)"
                // → "4 years" for the pill; full form stays in tooltip.
                const shortDuration = reqs.universityPath.duration
                  .replace(/\s*\(.*\)\s*$/, '')
                  .replace(/\s+total\s*$/i, '')
                  .trim();
                const programmeLabel = `${finalSegment(reqs.universityPath.programme)} · ${shortDuration}`;
                const programmeTip = `${reqs.universityPath.programme} (${reqs.universityPath.duration}). e.g. ${reqs.universityPath.examples.join(', ')}. Apply via ${reqs.universityPath.applicationRoute}`;

                type PathStep = { label: string; tip: string };
                const steps: PathStep[] = [
                  { label: schoolSubjectsLabel, tip: `Key subjects: ${reqSubjects.join(', ')}${reqs.schoolSubjects.recommended.length ? `. Also useful: ${reqs.schoolSubjects.recommended.join(', ')}` : ''}` },
                  ...(grade.hasCutoff && grade.gradeMin !== null && grade.gradeMax !== null
                    ? [{ label: `Typical grades: ${grade.gradeMin}–${grade.gradeMax}`, tip: gradeTip || 'Typical grade requirement for this path' }]
                    : []),
                  { label: programmeLabel, tip: programmeTip },
                  { label: finalSegment(reqs.entryLevelRequirements.title), tip: reqs.entryLevelRequirements.description },
                  { label: finalSegment(reqs.qualifiesFor.immediate), tip: `First role: ${reqs.qualifiesFor.immediate}. With experience: ${reqs.qualifiesFor.withExperience}` },
                ];
                return (
                  <div className="w-full rounded-lg border border-border/20 bg-muted/5 px-3 py-2.5">
                    <div className="flex flex-col items-center gap-0.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider text-center">
                          How you qualify (Norway)
                          {career.entryLevel && <span className="ml-1.5 normal-case tracking-normal text-muted-foreground/40">· No degree required</span>}
                        </p>
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground/35 hover:text-muted-foreground/60 transition-colors cursor-help shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[280px] text-[11px] leading-snug">
                              In Norway, admission is based on grades and subjects through a centralised system (Samordna opptak). This shows the typical path from school to your first role.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-[9px] text-muted-foreground/35">Aligned with centralised admissions (Samordna opptak)</p>
                    </div>
                    {/* Tight horizontal chain. gap-1 + px-1.5 save
                        ~30px over the previous gap-1.5 + px-2 values,
                        which combined with the abbreviated school-
                        subjects label lets typical Discover careers
                        (4-5 pills + arrows) fit on a single row at
                        normal desktop widths. justify-center pairs
                        with the centred title above. flex-wrap remains
                        as a graceful fallback on narrow viewports. */}
                    <div
                      className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {steps.map((s, i) => (
                        <div key={i} className="contents">
                          {i > 0 && <span className="text-[10px] text-muted-foreground/30 shrink-0">→</span>}
                          <span
                            title={s.tip}
                            className="inline-flex items-center gap-1 shrink-0 rounded-md border border-border/15 bg-muted/10 px-1.5 py-0.5 text-[10px] text-foreground/70 hover:bg-muted/20 transition-colors whitespace-nowrap"
                          >
                            <span>{s.label}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>}
          </SectionCard>
        </div>
      </div>

      {/* Quick insights row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* How long */}
        {(() => {
          const yearMatch = career.educationPath.match(/(\d+)\s*[–\-+]\s*(\d+)?\s*years?/i) || career.educationPath.match(/(\d+)\s*years?/i);
          const years = yearMatch ? parseInt(yearMatch[2] || yearMatch[1]) : null;
          // Rule: study paths (uni / college / vocational) can't start
          // before upper secondary ends — i.e. age 18. So the earliest
          // the user can begin the study years is max(userAge, 18). If
          // the user is already older than 18 they start now; if
          // they're 17 or younger they start at 18. When we don't know
          // the user's age, fall back to 18 as the canonical start.
          const startAge = Math.max(userAge ?? 18, 18);
          const qualifiedAge = years ? startAge + years : null;
          // "Years from now" is relative to the user's current age.
          const yearsFromNow =
            qualifiedAge != null && userAge != null ? qualifiedAge - userAge : years;
          return (
            <div className="rounded-xl border border-border/30 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Timeline</span>
              </div>
              {qualifiedAge ? (
                <p className="text-xs text-foreground/70 leading-relaxed">
                  You could be qualified by <span className="font-semibold text-foreground/90">age {qualifiedAge}</span>
                  <span className="text-muted-foreground/40"> — that&apos;s ~{yearsFromNow} years from now</span>
                </p>
              ) : (
                <p className="text-xs text-foreground/70 leading-relaxed">{career.educationPath}</p>
              )}
            </div>
          );
        })()}

        {/* Work environment — always visible */}
        <div className="rounded-xl border border-border/30 bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Where you&apos;ll work</span>
          </div>
          {dDetails?.typicalDay.environment ? (
            <p className="text-xs text-foreground/70 leading-relaxed">{dDetails.typicalDay.environment}</p>
          ) : (
            <p className="text-xs text-muted-foreground/40">Details not available for this career yet.</p>
          )}
        </div>

        {/* Reality teaser — always visible */}
        <div className="rounded-xl border border-border/30 bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Good to know</span>
          </div>
          {dDetails?.realityCheck ? (
            <p className="text-xs text-foreground/70 leading-relaxed">{dDetails.realityCheck}</p>
          ) : (
            <p className="text-xs text-muted-foreground/40">No specific notes for this career yet.</p>
          )}
        </div>

        {/* Academic expectations — early signal about school readiness */}
        {(() => {
          const ap = getAcademicProfile(career);
          const dc = getDemandColors(ap.demand);
          return (
            <div className="rounded-xl border border-border/30 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className={`h-3.5 w-3.5 ${dc.text}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${dc.text}`}>School readiness</span>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed">{ap.discoverHint}</p>
              {ap.grade.hasCutoff && ap.grade.gradeMin !== null && (
                <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                  Typical grades: {ap.grade.gradeMin}–{ap.grade.gradeMax} on the Norwegian 1–6 scale
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Self-confirmation — drives the dashboard's Discover progress
          AND the tab lock. Picking a goal alone no longer counts; the
          user has to actively say they've explored the role before the
          Understand tab unlocks. A brand-new career starts at 0/3 on
          the dashboard ring and Understand / Clarity are locked. */}
      <DiscoverConfirmCard careerTitle={goalTitle} onChange={onConfirmChange} />

      {/* Next — the Continue button is the happy-path route into
          Understand, but it only fires when the user has confirmed.
          The confirmation is the ONLY way to unlock the next tab, so
          clicking the button before answering is a no-op (with a
          gentle inline hint below the confirmation card). */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onContinue}
          disabled={!isDiscoverConfirmed(goalTitle)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isDiscoverConfirmed(goalTitle)
              ? 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/30'
              : 'text-muted-foreground/25 cursor-not-allowed',
          )}
          title={isDiscoverConfirmed(goalTitle) ? undefined : 'Answer the question above first'}
        >
          Understand <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Salary Progression popup */}
      {showSalaryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowSalaryPopup(false)}>
          <div
            className="bg-card border border-border/40 rounded-xl max-w-2xl w-full p-5 shadow-xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground/90">Salary Progression</h3>
              <button type="button" onClick={() => setShowSalaryPopup(false)} className="p-1 hover:bg-muted/40 rounded transition-colors">
                <X className="h-4 w-4 text-muted-foreground/60" />
              </button>
            </div>
            <SalaryProgressionChart careerId={career?.id ?? null} />
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
        {count !== undefined && <span className="text-[10px] text-muted-foreground/40">{count}</span>}
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground/30 transition-transform', isOpen && 'rotate-180')} />
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
  onConfirmChange,
}: {
  career: Career | null;
  goalTitle: string | null;
  onContinue: () => void;
  /** Notifies the page so the Clarity tab unlocks immediately. */
  onConfirmChange?: (confirmed: boolean) => void;
}) {
  const { data: detailsData, isLoading: detailsLoading } = useCareerDetails(career?.id ?? null);
  const { data: learningData, isLoading: learningLoading } = useLearningRecommendations(goalTitle);
  const { data: courseSearchData } = useCourseSearch(goalTitle);
  const { data: realityData, isLoading: realityLoading } = useCareerReality(goalTitle);

  // All hooks must be called before any early return
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const { isCollapsed: uCollapsed, toggle: uToggle } = useSectionCollapse(['u-tasks', 'u-reality', 'u-day', 'u-myths', 'u-salary', 'u-education-pathway', 'u-notes']);

  if (!career || !goalTitle) {
    return <EmptyState icon={Globe} message="Set a career goal in Discover first" />;
  }

  const details = detailsData?.details ?? null;
  const progression = detailsData?.progression ?? null;
  const toggle = (id: string) => setOpenSection(prev => prev === id ? null : id);

  const allCourses = [
    ...(learningData?.localRegional ?? []),
    ...(learningData?.international ?? []),
  ];

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div
        className="rounded-xl border-2 p-5"
        style={{
          borderColor: 'rgba(59,130,246,0.3)',
          boxShadow: '0 0 20px rgba(59,130,246,0.06)',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 50%)',
        }}
      >
        <p className="text-sm text-foreground/70 leading-[1.8]">
          Here&apos;s what being a <span className="font-semibold text-foreground/90">{goalTitle}</span>{' '}actually involves — the real responsibilities, a typical working day, and the education and training you&apos;ll need to get there.
        </p>
      </div>

      {/* ── TOP: What You'll Do + Reality Videos — side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: What You'll Actually Do + Tools of the Trade as two
            tabs inside one card. The user reads these back-to-back
            ("what I'd do" → "what I'd use to do it"), so keeping them
            in a single surface reduces section count on the Understand
            tab. Tabs follow the same styling as Education Pathway
            (full-width, teal underline) for visual consistency. */}
        <SectionCard>
          <SectionHeader
            icon={Briefcase}
            title="What You'll Do"
            tooltip="The core responsibilities and daily tasks that define this role."
            collapsed={uCollapsed('u-tasks')}
            onToggle={() => uToggle('u-tasks')}
          />
          {!uCollapsed('u-tasks') && (
            <div className="p-4 space-y-4">
              {/* Tasks */}
              {details && details.whatYouActuallyDo.length > 0 ? (
                <div className="space-y-1.5">
                  {details.whatYouActuallyDo.map((task, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/15 bg-background/20 px-3 py-2">
                      <div className="h-5 w-5 rounded-md bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-teal-400">{i + 1}</span>
                      </div>
                      <span className="text-xs text-foreground/70 leading-relaxed">{task}</span>
                    </div>
                  ))}
                </div>
              ) : detailsLoading ? (
                <LoadingSkeleton />
              ) : (
                <p className="text-xs text-muted-foreground/40">Details not available for this career yet.</p>
              )}

              {/* Tools — compact sub-section */}
              {details?.typicalDay.tools?.length ? (
                <div className="pt-2 border-t border-border/20">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mb-2 flex items-center gap-1.5">
                    <Wrench className="h-3 w-3" />
                    Tools used
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {details.typicalDay.tools.map((tool, i) => {
                      const info = getToolInfo(tool);
                      return (
                        <a
                          key={i}
                          href={info?.url || `https://www.google.com/search?q=${encodeURIComponent(tool)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={info?.description || tool}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-background/40 px-2.5 py-1 text-[11px] text-foreground/75 hover:text-foreground hover:border-border/50 transition-colors"
                        >
                          <span>{tool}</span>
                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/40" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </SectionCard>

        {/* Right: The Reality — dynamic reality check */}
        <SectionCard>
          <SectionHeader icon={Eye} title="The Reality" tooltip="An honest look at what this career is really like — the challenges, trade-offs, and what makes someone a good fit." collapsed={uCollapsed('u-reality')} onToggle={() => uToggle('u-reality')} />
          {!uCollapsed('u-reality') && <div className="p-4 space-y-3">
            {realityLoading ? (
              <div className="space-y-2.5">
                <div className="h-3 w-full rounded bg-muted-foreground/5 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-muted-foreground/5 animate-pulse" />
                <div className="h-3 w-3/5 rounded bg-muted-foreground/5 animate-pulse" />
              </div>
            ) : realityData ? (
              <>
                {/* Summary */}
                <p className="text-[11px] text-foreground/60 leading-relaxed">{realityData.realitySummary}</p>

                {/* Reality points — only hardships/challenges, no education references */}
                {(() => {
                  const hardships = realityData.realityPoints.filter(
                    (p) => !/\b(degree|training|qualification|certif|educat|university|college|school|study|course|licence|license)\b/i.test(p)
                  );
                  if (hardships.length === 0) return null;
                  return (
                    <div className="space-y-1">
                      {hardships.map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertCircle className="h-3 w-3 text-amber-400/70 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-foreground/50 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Video links — compact list, no thumbnails */}
                {realityData.videos.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/40 mb-1.5">Real voices</p>
                    <div className="rounded-lg border border-border/20 divide-y divide-border/15 overflow-hidden">
                      {realityData.videos.map((video) => (
                        <a
                          key={video.videoId}
                          href={`https://www.youtube.com/watch?v=${video.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-2.5 py-1.5 hover:bg-muted/10 transition-colors"
                        >
                          <Play className="h-3 w-3 text-muted-foreground/40 group-hover:text-rose-400 shrink-0" />
                          <span className="text-[10px] text-foreground/70 group-hover:text-foreground truncate flex-1">{video.title.replace(/&amp;/g, '&')}</span>
                          <span className="text-[9px] text-muted-foreground/40 shrink-0 hidden sm:inline">{video.channel}</span>
                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/25 group-hover:text-muted-foreground/50 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : details?.realityCheck ? (
              /* Fallback to static realityCheck if API fails */
              <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-foreground/50 italic leading-relaxed">{details.realityCheck}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/40">Reality insights not available for this career yet.</p>
            )}
          </div>}
        </SectionCard>
      </div>

      {/* Career Presence was previously a standalone card here — it's
          now embedded inside the "Real Career Paths & Tools" section
          below as a persistent header band above the tab bar. Moved so
          the Understand tab has fewer top-level sections and so the
          geography signal lives next to the Real Career Paths content
          it contextualises. */}

      {/* ── MIDDLE: A Typical Day — horizontal timeline ── */}
      <SectionCard>
        <SectionHeader icon={Clock} title="A Typical Day" tooltip="What a real working day looks like in this role — morning, midday, and afternoon — so you can picture yourself in it." collapsed={uCollapsed('u-day')} onToggle={() => uToggle('u-day')} />
        {uCollapsed('u-day') ? null : detailsLoading ? <div className="p-4"><LoadingSkeleton /></div> : details && details.typicalDay.morning.length > 0 ? (
          <div className="p-4 sm:p-5">
            <div className="relative">
              {/* Horizontal connector line */}
              <div className="absolute top-[14px] left-0 right-0 h-px bg-gradient-to-r from-amber-400/40 via-sky-400/40 to-indigo-400/40 hidden sm:block" />

              {/* Three columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3">
                {([
                  { label: 'Morning', time: '08:00 – 12:00', items: details.typicalDay.morning, icon: '🌅', dotClass: 'bg-amber-400', bgClass: 'bg-amber-500/[0.06]', borderClass: 'border-amber-500/15' },
                  { label: 'Midday', time: '12:00 – 14:00', items: details.typicalDay.midday, icon: '☀️', dotClass: 'bg-sky-400', bgClass: 'bg-sky-500/[0.06]', borderClass: 'border-sky-500/15' },
                  { label: 'Afternoon', time: '14:00 – 17:00', items: details.typicalDay.afternoon, icon: '🌆', dotClass: 'bg-indigo-400', bgClass: 'bg-indigo-500/[0.06]', borderClass: 'border-indigo-500/15' },
                ] as const).map(({ label, time, items, icon, dotClass, bgClass, borderClass }) => (
                  <div key={label} className="flex flex-col items-center">
                    {/* Timeline node */}
                    <div className="hidden sm:flex items-center justify-center mb-3 z-10">
                      <div className={cn('h-[10px] w-[10px] rounded-full ring-2 ring-background', dotClass)} />
                    </div>

                    {/* Card */}
                    <div className={cn('w-full rounded-xl border p-3.5', bgClass, borderClass)}>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">{icon}</span>
                          <span className="text-xs font-semibold text-foreground/85">{label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/45 tabular-nums font-medium">{time}</span>
                      </div>
                      <div className="space-y-1.5">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className={cn('h-1.5 w-1.5 rounded-full mt-[5px] shrink-0 opacity-60', dotClass)} />
                            <span className="text-[11px] text-foreground/65 leading-relaxed">{item}</span>
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
              <div className="flex items-center gap-2.5 mt-3 px-3 py-2 rounded-lg bg-muted/[0.06] border border-border/15">
                <MapPin className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                <span className="text-[10px] text-muted-foreground/55 leading-relaxed">{details.typicalDay.environment}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4"><p className="text-xs text-muted-foreground/40">Daily schedule details not available for this career yet.</p></div>
        )}

      </SectionCard>

      {/* ── Common Misconceptions (standalone) ── */}
      <SectionCard>
        <SectionHeader icon={Shield} title="Common Misconceptions" tooltip="What most people get wrong about this career — and the evidence-based reality." collapsed={uCollapsed('u-myths')} onToggle={() => uToggle('u-myths')} />
        {!uCollapsed('u-myths') && (
          <div className="p-4 sm:p-5">
            <CareerMythBuster careerId={career?.id ?? null} />
          </div>
        )}
      </SectionCard>

      {/* ── Where People Work ── */}
      <SectionCard>
        <SectionHeader icon={Building2} title="Where People Work" tooltip="Norwegian companies where this role is most common — with links to their careers pages." collapsed={uCollapsed('u-salary')} onToggle={() => uToggle('u-salary')} />
        {!uCollapsed('u-salary') && (
          <div className="p-4 sm:p-5">
            <TopEmployers careerId={career?.id ?? null} />
          </div>
        )}
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

        // Same three-source Study Path detection as before. See the old
        // inline comment (git history) for the reasoning — short
        // version: hardcoded NORWAY_PROGRAMMES map, 3-layer programmes
        // via getProgrammesForCareer, or a universityPath.programme in
        // career-requirements. Any of the three = hasStudyPath.
        const hardcoded = career ? getNorwayProgrammes(career.id, goalTitle || career.title) : null;
        const nordicProgs = career ? getProgrammesForCareer(career.id, { country: 'NO' }) : [];
        const reqs = career ? getCareerRequirements(career.id) : null;
        const hasStudyPath =
          !!(hardcoded && hardcoded.programmes && hardcoded.programmes.length > 0) ||
          nordicProgs.length > 0 ||
          !!reqs?.universityPath?.programme;

        const certPath = career ? getCertificationPath(career.id, goalTitle || career.title) : null;

        return (
          <SectionCard>
            <SectionHeader
              icon={GraduationCap}
              title="Education Pathway"
              tooltip="School readiness and the real universities, colleges and vocational schools that lead to this career — filtered by your location and subjects."
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
                        after:bg-teal-400 after:scale-x-0 after:transition-transform after:duration-200
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
                        after:bg-teal-400 after:scale-x-0 after:transition-transform after:duration-200
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
                          after:bg-teal-400 after:scale-x-0 after:transition-transform after:duration-200
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
                        'vocational':          { bg: 'bg-amber-500/10',   text: 'text-amber-400' },
                        'bachelor':            { bg: 'bg-sky-500/10',     text: 'text-sky-400' },
                        'master':              { bg: 'bg-blue-500/10',    text: 'text-blue-400' },
                        'doctorate':           { bg: 'bg-violet-500/10',  text: 'text-violet-400' },
                        'professional-degree': { bg: 'bg-violet-500/10',  text: 'text-violet-400' },
                        'mixed':               { bg: 'bg-slate-500/10',   text: 'text-slate-400' },
                        'entry-level':         { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
                        'licence-based':       { bg: 'bg-teal-500/10',    text: 'text-teal-400' },
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
                        'low':       { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
                        'moderate':  { bg: 'bg-sky-500/10',     text: 'text-sky-400' },
                        'high':      { bg: 'bg-amber-500/10',   text: 'text-amber-400' },
                        'very-high': { bg: 'bg-rose-500/10',    text: 'text-rose-400' },
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
                            <div className="rounded-xl border border-border/40 bg-card/40 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="h-3.5 w-3.5 text-teal-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Subjects you&rsquo;ll need</span>
                                <span className="ml-auto text-[10px] text-muted-foreground/50 tabular-nums">
                                  {essentialSubjects.length} essential
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {essentialSubjects.map((s) => (
                                  <span
                                    key={s.name}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/25 bg-teal-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-teal-100/90"
                                  >
                                    <Check className="h-3 w-3 text-teal-400" />
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ── Grade-range meter (1–6) ────────────── */}
                          {ap.grade.hasCutoff && ap.grade.gradeMin !== null && (
                            <div className="rounded-xl border border-border/40 bg-card/40 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-3.5 w-3.5 text-teal-400" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Typical grade range</span>
                                </div>
                                <span className="text-[11px] font-semibold text-foreground/85 tabular-nums">
                                  {ap.grade.gradeMin}&ndash;{ap.grade.gradeMax}
                                  <span className="text-muted-foreground/45 font-normal"> / 6</span>
                                </span>
                              </div>
                              {/* Scale bars — all teal, with opacity
                                  ramping up across the scale. Positions
                                  inside the required range get full
                                  brightness (bg-teal-400); positions
                                  below use progressive teal tints so
                                  the whole bar reads as one palette
                                  rather than a green-vs-grey split. */}
                              <div className="flex gap-1.5">
                                {[
                                  'bg-teal-500/15',
                                  'bg-teal-500/20',
                                  'bg-teal-500/30',
                                  'bg-teal-500/45',
                                  'bg-teal-500/65',
                                  'bg-teal-500/80',
                                ].map((dimClass, i) => {
                                  const n = i + 1;
                                  const inRange = n >= (ap.grade.gradeMin ?? 0) && n <= (ap.grade.gradeMax ?? 0);
                                  return (
                                    <div
                                      key={n}
                                      className={cn(
                                        'h-2 flex-1 rounded-full transition-colors',
                                        inRange ? 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.35)]' : dimClass,
                                      )}
                                    />
                                  );
                                })}
                              </div>
                              <div className="flex justify-between mt-1.5 px-[2px]">
                                {[
                                  'text-teal-500/35',
                                  'text-teal-500/45',
                                  'text-teal-400/55',
                                  'text-teal-400/65',
                                  'text-teal-300/80',
                                  'text-teal-300/90',
                                ].map((dimClass, i) => {
                                  const n = i + 1;
                                  const inRange = n >= (ap.grade.gradeMin ?? 0) && n <= (ap.grade.gradeMax ?? 0);
                                  return (
                                    <span
                                      key={n}
                                      className={cn(
                                        'text-[9px] tabular-nums',
                                        inRange ? 'text-teal-300 font-semibold' : dimClass,
                                      )}
                                    >
                                      {n}
                                    </span>
                                  );
                                })}
                              </div>
                              <p className="text-[10px] text-muted-foreground/50 mt-3 leading-snug">
                                Indicative only &mdash; actual cut-offs vary by institution and year.
                              </p>
                            </div>
                          )}

                          {/* ── Three small side-by-side boxes
                              (Demand / Pathway / Competition). Neutral
                              styling per "not too much colour" — muted
                              icons, plain foreground values. All
                              colour-coding lives upstream in the grade
                              meter and subject chips so this recap
                              reads as a plain spec strip, not a
                              traffic-light dashboard. */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {[
                              { label: 'Demand',      icon: TrendingUp, value: getDemandLabel(ap.demand),                    hint: demandHint[ap.demand] },
                              { label: 'Pathway',     icon: Award,      value: getPathwayLabel(ap.pathwayType),              hint: pathwayHint[ap.pathwayType] },
                              { label: 'Competition', icon: Target,     value: getCompetitivenessLabel(ap.competitiveness),  hint: compHint[ap.competitiveness] },
                            ].map((tile) => {
                              const Icon = tile.icon;
                              return (
                                <div key={tile.label} className="rounded-lg border border-border/40 bg-card/30 px-3 py-2.5">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <Icon className="h-3 w-3 text-muted-foreground/55 shrink-0" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
                                      {tile.label}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-foreground/90">
                                    {tile.value}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground/50 mt-0.5 leading-snug">
                                    {tile.hint}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </TabsContent>

                  <TabsContent value="study-path" className="mt-5 space-y-6">
                    {hasStudyPath ? (
                      <EducationBrowser careerTitle={goalTitle} careerId={career?.id ?? null} />
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/40 bg-muted/10 p-4 text-center">
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
                      <p className="text-[11px] text-muted-foreground/75 leading-relaxed">
                        {certPath.summary}
                      </p>

                      {certPath.recommendedDegrees && certPath.recommendedDegrees.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                            Recommended degree background
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {certPath.recommendedDegrees.map((d: string) => (
                              <span key={d} className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-2.5 py-1 text-[10px] text-foreground/70">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="rounded-lg border border-border/30 bg-card/40 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-border/20 bg-muted/[0.04]">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                            Industry certifications
                          </p>
                        </div>
                        {certPath.certifications.map((cert: { name: string; provider: string; duration: string; cost: string; url: string; recognised: string }, idx: number) => (
                          <a
                            key={cert.name}
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'block px-4 py-3 hover:bg-muted/20 transition-colors',
                              idx > 0 && 'border-t border-border/15',
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[12px] font-medium text-foreground/90 leading-snug">{cert.name}</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{cert.provider} · {cert.duration}</p>
                              </div>
                              <span className="text-[10px] text-emerald-400/80 font-medium shrink-0">{cert.cost}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/55 mt-1">{cert.recognised}</p>
                          </a>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}
          </SectionCard>
        );
      })()}

      {/* "Tools of the Trade" was merged into the Day-to-Day Work card
          at the top of the tab as a second tab — the two lists (daily
          tasks + tools used) are read together and having them on one
          surface cuts the section count on Understand. */}

      {/* Self-confirmation — drives the dashboard's Understand progress
          AND the tab lock. The Understand tab is read-only deep-dive
          content, so a deliberate YES is the cleanest completion signal
          we can capture, and it's also the only thing that unlocks Clarity. */}
      <UnderstandConfirmCard careerTitle={goalTitle} onChange={onConfirmChange} />

      {/* Next — gated on the confirmation above. Clicking without
          confirming is a no-op (disabled). */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onContinue}
          disabled={!isUnderstandConfirmed(goalTitle)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isUnderstandConfirmed(goalTitle)
              ? 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/30'
              : 'text-muted-foreground/25 cursor-not-allowed',
          )}
          title={isUnderstandConfirmed(goalTitle) ? undefined : 'Answer the question above first'}
        >
          Clarity <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DiscoverConfirmCard({
  careerTitle,
  onChange,
}: {
  careerTitle: string | null;
  /** Notifies the parent page so the tab bar can re-lock/unlock the
   *  next tab immediately when the user toggles their answer. */
  onChange?: (confirmed: boolean) => void;
}) {
  const t = useTranslations();
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    setConfirmed(isDiscoverConfirmed(careerTitle));
  }, [careerTitle]);
  if (!careerTitle) return null;

  const choose = (value: boolean) => {
    setDiscoverConfirmed(careerTitle, value);
    setConfirmed(value);
    onChange?.(value);
  };

  return (
    <div className="rounded-lg border border-teal-500/15 bg-teal-500/[0.03] px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground/70 min-w-0">
          {t('journey.discover.confirmQuestion')}
        </p>
        <button
          onClick={() => choose(!confirmed)}
          className={cn(
            'px-3 py-1 rounded-md text-[11px] font-medium transition-colors border shrink-0',
            confirmed
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-background/40 border-border/40 text-foreground/60 hover:border-emerald-500/40 hover:text-emerald-300',
          )}
          aria-pressed={confirmed}
        >
          {confirmed ? t('journey.discover.confirmYes') : t('journey.discover.confirmNotYet')}
        </button>
      </div>
    </div>
  );
}

function UnderstandConfirmCard({
  careerTitle,
  onChange,
}: {
  careerTitle: string | null;
  /** Notifies the parent page so the tab bar can re-lock/unlock Clarity
   *  immediately when the user toggles their answer. */
  onChange?: (confirmed: boolean) => void;
}) {
  const t = useTranslations();
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    setConfirmed(isUnderstandConfirmed(careerTitle));
  }, [careerTitle]);
  if (!careerTitle) return null;

  const choose = (value: boolean) => {
    setUnderstandConfirmed(careerTitle, value);
    setConfirmed(value);
    onChange?.(value);
  };

  return (
    <div className="rounded-lg border border-blue-500/15 bg-blue-500/[0.03] px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground/70 min-w-0">
          {t('journey.understand.confirmQuestion')}
        </p>
        <button
          onClick={() => choose(!confirmed)}
          className={cn(
            'px-3 py-1 rounded-md text-[11px] font-medium transition-colors border shrink-0',
            confirmed
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-background/40 border-border/40 text-foreground/60 hover:border-emerald-500/40 hover:text-emerald-300',
          )}
          aria-pressed={confirmed}
        >
          {confirmed ? t('journey.understand.confirmYes') : t('journey.understand.confirmNotYet')}
        </button>
      </div>
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
            <p className="text-xs text-muted-foreground/50 mt-1">{course.provider}</p>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors shrink-0 mt-0.5" />
        </div>

        {course.description && (
          <p className="text-xs text-muted-foreground/40 mt-2 leading-relaxed line-clamp-2">{course.description}</p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground/50">
            <Clock className="h-2.5 w-2.5" /> {course.duration}
          </span>
          <span className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium',
            course.cost === 'Free' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted/20 text-muted-foreground/50',
          )}>
            {course.cost}
          </span>
          {course.regionDetails && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground/40">
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
              <span key={i} className="inline-flex rounded-full border border-border/15 px-2 py-0.5 text-[10px] text-muted-foreground/40">{h}</span>
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
      <SectionHeader icon={Pencil} title="Your Notes" badge={notes.length > 0 ? <span className="text-[10px] text-muted-foreground/40">{notes.length}</span> : undefined} collapsed={collapsed} onToggle={onToggle} />
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
                      <button onClick={() => setEditingId(null)} className="px-2 py-1 rounded text-[10px] text-muted-foreground/40">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium', cat.color)}>{cat.label}</span>
                      <p className="text-xs text-foreground/65 flex-1 truncate">{note.text}</p>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => startEdit(note)} className="p-1 rounded text-muted-foreground/30 hover:text-foreground/60"><Pencil className="h-2.5 w-2.5" /></button>
                        <button onClick={() => deleteNote(note.id)} className="p-1 rounded text-muted-foreground/30 hover:text-red-400"><Trash2 className="h-2.5 w-2.5" /></button>
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
            className="rounded-md border border-border/20 bg-background/30 px-1.5 py-1.5 text-[10px] text-muted-foreground/50 focus:outline-none shrink-0"
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
  const { data: storiesData } = useCareerStories(career?.id ?? null);
  const { data: contributedData } = useContributedPaths(career?.id ?? null);
  const details = detailsData?.details ?? null;
  const careerStories = storiesData?.stories ?? [];
  const contributedPaths = contributedData?.paths ?? [];

  // Education context — drives the foundation gate for Play and Clarity completion.
  const { data: eduCtxData } = useQuery<{ educationContext: { stage?: string } | null }>({
    queryKey: ['education-context'],
    queryFn: async () => {
      const res = await fetch('/api/journey/education-context');
      if (!res.ok) return { educationContext: null };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const hasFoundation = !!eduCtxData?.educationContext?.stage;

  // Roadmap and Momentum headers are intentionally name-neutral —
  // always "Your Roadmap" / "Your Momentum" regardless of whether the
  // user has set a display name. Earlier versions interpolated the
  // user's first name as a possessive ("Henry's Roadmap") but this
  // reads as a label rather than a heading and loses meaning when the
  // display name is missing or awkward.
  const possessiveName = 'Your';

  // Collapse state for Roadmap + Momentum + From the Field, persisted
  // per-user via localStorage so the user's choice survives reloads.
  const [roadmapCollapsed, setRoadmapCollapsed] = useState(false);
  const [momentumCollapsed, setMomentumCollapsed] = useState(false);
  const [claritySubTab, setClaritySubTab] = useState<'momentum' | 'real-paths'>('momentum');
  const { isCollapsed: gCollapsed, toggle: gToggle } = useSectionCollapse(['g-field']);
  useEffect(() => {
    try {
      setRoadmapCollapsed(window.localStorage.getItem('grow-roadmap-collapsed') === '1');
      setMomentumCollapsed(window.localStorage.getItem('grow-momentum-collapsed') === '1');
    } catch { /* ignore */ }
  }, []);
  const toggleRoadmap = () => {
    setRoadmapCollapsed((prev) => {
      const next = !prev;
      try { window.localStorage.setItem('grow-roadmap-collapsed', next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };
  const toggleMomentum = () => {
    setMomentumCollapsed((prev) => {
      const next = !prev;
      try { window.localStorage.setItem('grow-momentum-collapsed', next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

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
        body: JSON.stringify({ goalId: serverGoalId, momentumActions: updated }),
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
          borderColor: 'rgba(245,158,11,0.3)',
          boxShadow: '0 0 20px rgba(245,158,11,0.06)',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.04) 0%, transparent 50%)',
        }}
      >
        <p className="text-sm text-foreground/70 leading-[1.8]">
          This is your personal journey to become a <span className="font-semibold text-foreground/90">{goalTitle}</span>. Explore your roadmap, play the voice-guided narration, or browse each section at your own pace.
        </p>
      </div>

      {/* 1. Roadmap — collapsible. The timeline component owns its
          own header ("Henry's Roadmap to Surgeon · …") so the
          collapse toggle is a small chevron above it. */}
      <SectionCard className="border-amber-500/20" style={{ boxShadow: '0 0 20px rgba(245,158,11,0.06)' }}>
        {/* Header row — collapse toggle owns the row, a separate
            full-screen button sits on the right so it's always
            reachable without triggering collapse. */}
        <div className="flex items-center border-b border-border/20">
          <button
            type="button"
            onClick={toggleRoadmap}
            aria-expanded={!roadmapCollapsed}
            className="flex-1 flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-amber-500/[0.04] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Rocket className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground/90">{possessiveName} Roadmap</h3>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground/55 transition-transform duration-200',
                roadmapCollapsed && '-rotate-90'
              )}
            />
          </button>
          {!roadmapCollapsed && goalTitle && (
            <button
              type="button"
              onClick={() => setRoadmapFullscreen(true)}
              title="Expand to full screen"
              aria-label="Expand roadmap to full screen"
              className="inline-flex items-center gap-1.5 mr-3 px-2.5 py-1.5 rounded-md border border-border/30 bg-background/40 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-amber-500/40 hover:bg-amber-500/[0.06] transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Full screen
            </button>
          )}
        </div>
        {!roadmapCollapsed && (
          <div className="p-4">
            <PersonalCareerTimeline
              primaryGoalTitle={goalTitle}
              onSimulationReady={({ play }) => setSimulationPlay(() => play)}
            />
          </div>
        )}
      </SectionCard>
      <AnimatePresence>
        {roadmapFullscreen && goalTitle && (
          <FullscreenRoadmap goalTitle={goalTitle} onClose={() => setRoadmapFullscreen(false)} />
        )}
      </AnimatePresence>

      {/* 2. Momentum + Real Career Paths — tabbed container */}
      <SectionCard className="border-amber-500/20" style={{ boxShadow: '0 0 20px rgba(245,158,11,0.06)' }}>
        {/* Tab bar */}
        <div className="flex border-b border-border/20">
          <button
            type="button"
            onClick={() => setClaritySubTab('momentum')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",
              claritySubTab === 'momentum'
                ? "text-amber-400 border-b-2 border-amber-400 -mb-px"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            Momentum
          </button>
          <button
            type="button"
            onClick={() => setClaritySubTab('real-paths')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",
              claritySubTab === 'real-paths'
                ? "text-violet-400 border-b-2 border-violet-400 -mb-px"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Real Career Paths
          </button>
        </div>

        {/* Tab content: Momentum */}
        {claritySubTab === 'momentum' && (
        <div>
        <div className="p-4 space-y-5">
          <p className="text-xs text-muted-foreground/50 leading-relaxed -mt-1">
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
              const allSuggestions = [
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
                  icon: Users, color: 'text-blue-400',
                  title: `People in ${career.title} roles`,
                  descriptor: 'Find professionals on LinkedIn and read their journeys',
                  url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(career.title)}`,
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
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-2">
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
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-0.5 rounded-md border border-border/30 bg-background/40 px-1.5 py-0.5 text-[9px] font-medium text-foreground/70 hover:border-border/60 hover:text-foreground transition-colors"
                      >
                        Open <ExternalLink className="h-2 w-2" />
                      </a>
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
                        className="inline-flex items-center justify-center gap-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
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
                            ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                            : 'border-border/30 bg-background/30 hover:border-amber-500/30',
                        )}
                      >
                        {/* Delete — top-right, appears on hover */}
                        <button
                          onClick={() => deleteAction(a.id)}
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-rose-400 transition-all"
                          aria-label="Delete step"
                        >
                          <X className="h-2.5 w-2.5" />
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
                  <div className="shrink-0 w-[180px] rounded-lg border border-dashed border-border/30 bg-background/20 p-2.5 flex flex-col justify-center">
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
                      className="w-full rounded-md border border-border/25 bg-background/40 px-2 py-1 text-[10px] text-foreground/80 placeholder:text-muted-foreground/40 focus:outline-none focus:border-amber-500/40 mb-1.5"
                    />
                    <button
                      onClick={addAction}
                      disabled={!newAction.trim()}
                      className="w-full inline-flex items-center justify-center gap-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                  className="flex-1 rounded-lg border border-border/30 bg-background/40 px-3 py-1.5 text-xs text-foreground/85 placeholder:text-muted-foreground/40 focus:outline-none focus:border-amber-500/40"
                />
                <button
                  onClick={addAction}
                  disabled={!newAction.trim()}
                  className="inline-flex items-center gap-0.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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

        {/* Tab content: Real Career Paths */}
        {claritySubTab === 'real-paths' && (
        <div className="p-4 space-y-4">
          {/* From the Field — real professional stories */}
          {careerStories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-3.5 w-3.5 text-rose-400" />
                <h4 className="text-xs font-semibold text-foreground/80">From the Field</h4>
                <span className="text-[10px] text-muted-foreground/30">{careerStories.length} stories</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {careerStories.slice(0, 4).map((story) => (
                  <div key={story.id} className="rounded-lg border border-border/20 bg-background/20 overflow-hidden">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${story.videoId}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={story.headline}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] font-semibold text-foreground/80 mb-0.5 line-clamp-2 leading-tight">{story.headline}</p>
                      <p className="text-[9px] text-muted-foreground/55 truncate">
                        {story.name} — {story.jobTitle}
                        {story.company ? ` at ${story.company}` : ''}
                        {story.yearsInRole ? ` · ${story.yearsInRole} years` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contributed paths */}
          {contributedPaths.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-3.5 w-3.5 text-violet-400" />
                <h4 className="text-xs font-semibold text-foreground/80">Real Paths from Real People</h4>
                <span className="text-[10px] text-muted-foreground/30">{contributedPaths.length} path{contributedPaths.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {contributedPaths.map((path) => (
                  <div key={path.id} className="rounded-lg border border-border/20 bg-background/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {path.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground/90 truncate">{path.displayName}</p>
                        <p className="text-[10px] text-muted-foreground/60 truncate">
                          {path.currentTitle} · {path.country}
                          {!path.didAttendUniversity && ' · No university'}
                          {path.yearsOfExperience ? ` · ${path.yearsOfExperience} yrs` : ''}
                        </p>
                      </div>
                    </div>
                    {path.headline && (
                      <p className="text-[10px] text-foreground/60 italic mb-2">&ldquo;{path.headline}&rdquo;</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {(path.steps as { age: number; label: string }[]).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-muted-foreground/50 tabular-nums w-5 text-right">{s.age}</span>
                          <div className="h-1 w-1 rounded-full bg-primary/30" />
                          <span className="text-foreground/70">{s.label}</span>
                        </div>
                      ))}
                    </div>
                    {path.advice && (
                      <p className="text-[10px] text-primary/60 mt-2 pt-2 border-t border-border/10">
                        &ldquo;{path.advice}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground/30 text-center pt-1">
                  Know someone whose path could inspire? <a href="/contribute" className="text-primary/60 hover:text-primary transition-colors">Share a career path</a>
                </p>
              </div>
            </div>
          )}

          {/* Invite a contribution — prominent when empty for this career,
              softer when we already have content. Contributions go through
              /contribute which is already wired to an admin review queue. */}
          <ContributeRealPathCard
            careerId={career?.id ?? null}
            careerTitle={goalTitle}
            hasExistingContent={careerStories.length > 0 || contributedPaths.length > 0}
          />
        </div>
        )}
      </SectionCard>

      {/* ── Opportunities ── */}
      <SectionCard>
        <div className="p-4 sm:p-5">
          <OpportunityMatches careerId={career?.id ?? null} />
        </div>
      </SectionCard>

      {/* ── Key Dates ── */}
      <SectionCard>
        <div className="p-4 sm:p-5">
          <DeadlineAwareness careerId={career?.id ?? null} />
        </div>
      </SectionCard>

      {/* ── Pivot Preview ── */}
      {career && goalTitle && (
        <SectionCard>
          <div className="p-4 sm:p-5">
            <PivotPreview careerId={career.id} careerTitle={goalTitle} />
          </div>
        </SectionCard>
      )}

      {/* ── Share Journey ── */}
      {goalTitle && (
        <div className="flex justify-center py-2">
          <ShareJourney
            career={career}
            goalTitle={goalTitle}
            momentumActions={actions.map((a) => ({ title: a.text, status: a.status ?? (a.done ? 'done' : 'not_started') }))}
            foundation={eduCtxData?.educationContext as { educationStage?: string; studyTrack?: string; expectedCompletion?: string } | null}
          />
        </div>
      )}

      {/* ── Clarity completion — auto-derived from foundation + momentum ── */}
      <ClarityCompletionCard
        careerTitle={goalTitle}
        hasFoundation={hasFoundation}
        hasMomentum={actions.length > 0}
      />

    </div>
  );
}

/**
 * Invite a real-world path contribution for the active career.
 *
 * Two modes:
 *  - Empty (no stories, no contributed paths for this career): prominent,
 *    explains what a path is, points at /contribute.
 *  - Has content (stories or paths exist): softer, a quiet "know someone
 *    else whose path could help?" footer.
 *
 * Replaces the older "Coming Soon" teaser — contributions are already
 * live via /contribute and the admin review queue at /admin/career-stories.
 */
function ContributeRealPathCard({
  careerId,
  careerTitle,
  hasExistingContent,
}: {
  careerId: string | null;
  careerTitle: string | null;
  hasExistingContent: boolean;
}) {
  const contributeHref = careerId
    ? `/contribute?career=${encodeURIComponent(careerId)}`
    : "/contribute";

  if (hasExistingContent) {
    return (
      <p className="pt-2 text-[11px] text-muted-foreground/55 text-center border-t border-border/20">
        Know someone whose path to{" "}
        <span className="text-foreground/70">{careerTitle || "this career"}</span>{" "}
        could help? <a href={contributeHref} className="text-primary/80 hover:text-primary transition-colors underline-offset-2 hover:underline">Share a career path</a>
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border/40 bg-card/40 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Users className="h-4 w-4 text-primary/70" />
        <h3 className="text-sm font-semibold text-foreground/85">
          No real paths for {careerTitle || "this career"} yet
        </h3>
      </div>
      <p className="text-xs text-muted-foreground/75 leading-relaxed max-w-md">
        Endeavrly is built on real stories from people who&rsquo;ve walked a path &mdash;
        not AI-generated examples. If you know a{" "}
        <span className="text-foreground/80">{careerTitle || "professional"}</span>{" "}
        whose route could help a young person, they can share their timeline in a
        few minutes. All contributions are reviewed by a human before appearing here.
      </p>
      <a
        href={contributeHref}
        className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        Share a career path
        <span aria-hidden>→</span>
      </a>
    </div>
  );
}

function ClarityCompletionCard({
  careerTitle,
  hasFoundation,
  hasMomentum,
}: {
  careerTitle: string | null;
  hasFoundation: boolean;
  hasMomentum: boolean;
}) {
  const clarityComplete = hasFoundation && hasMomentum;
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Pick a random warm note once per mount so the same user sees a
  // stable message within a session but gets a fresh one on next visit.
  const congratsMessage = useMemo(() => pickCelebrationMessage(), []);

  const { data: recommendationsData } = useQuery<{ nextSteps: NextStep[] }>({
    queryKey: ['my-journey-recommendations', careerTitle],
    queryFn: async () => {
      const res = await fetch('/api/reports/my-journey');
      if (!res.ok) throw new Error('Failed to load recommendations');
      return res.json();
    },
    enabled: clarityComplete,
    staleTime: 5 * 60 * 1000,
  });
  const recommendations = recommendationsData?.nextSteps ?? [];

  // Auto-mark Clarity as active on the dashboard when both conditions are met.
  useEffect(() => {
    if (clarityComplete && careerTitle) {
      markClarityActive(careerTitle);
    }
  }, [clarityComplete, careerTitle]);

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

  // When Clarity is complete, drop the heading + checklist — the
  // celebration box below is the full story at that point and the
  // "✓ Fill in your starting point / ✓ Add your first action" list
  // becomes redundant noise. The outer wrapper's padding + muted
  // card background also go away so the celebration stands alone.
  return (
    <div
      className={cn(
        clarityComplete
          ? ''
          : 'rounded-xl border border-border/30 bg-card/30 px-5 py-4',
      )}
    >
      {!clarityComplete && (
        <>
      <p className="text-sm font-semibold mb-3 text-foreground/85">
        Complete Clarity
      </p>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <span className={cn(
            'inline-flex items-center justify-center h-5 w-5 rounded-full border text-[10px] shrink-0',
            hasFoundation
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-border/50 text-muted-foreground/40',
          )}>
            {hasFoundation ? '✓' : '1'}
          </span>
          <div>
            <p className={cn(
              'text-xs font-medium',
              hasFoundation ? 'text-foreground/70 line-through decoration-emerald-500/40' : 'text-foreground/85',
            )}>
              Fill in your starting point
            </p>
            <p className="text-[10px] text-muted-foreground/50">
              {hasFoundation
                ? 'Your foundation is set — the roadmap and narration are personalised to you.'
                : 'Tap "Your Foundation" on the roadmap to add your school, subjects, and finish year.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={cn(
            'inline-flex items-center justify-center h-5 w-5 rounded-full border text-[10px] shrink-0',
            hasMomentum
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-border/50 text-muted-foreground/40',
          )}>
            {hasMomentum ? '✓' : '2'}
          </span>
          <div>
            <p className={cn(
              'text-xs font-medium',
              hasMomentum ? 'text-foreground/70 line-through decoration-emerald-500/40' : 'text-foreground/85',
            )}>
              Add your first action in Momentum
            </p>
            <p className="text-[10px] text-muted-foreground/50">
              {hasMomentum
                ? 'You\'ve started building momentum — keep going.'
                : 'Pick a suggestion or write your own next move in the Momentum section above.'}
            </p>
          </div>
        </div>
      </div>
        </>
      )}
      {clarityComplete && (
        /* Centred slim success row + a short human note underneath.
           Only as wide as its content: status label + two icon
           actions (recommendations + PDF). */
        <div className="flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-3 rounded-lg border border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.03] to-transparent px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" strokeWidth={2.25} />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold text-emerald-300 tracking-tight">Journey complete</span>
              {careerTitle && (
                <>
                  <span className="text-[10px] text-muted-foreground/40" aria-hidden>·</span>
                  <span className="text-xs font-medium text-foreground/80">{careerTitle}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Recommendations popover — icon only, opens a small card with the nextSteps list. */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Recommended next moves"
                  title="Recommended next moves"
                  disabled={recommendations.length === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background/40 text-foreground/70 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ListChecks className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-80 p-0 border-border/60 bg-card/95 backdrop-blur"
              >
                <div className="px-4 py-3 border-b border-border/30">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400/80">Next moves</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">Ranked from your Journey. Full detail lives in the PDF report.</p>
                </div>
                <ul className="max-h-72 overflow-y-auto divide-y divide-border/20">
                  {recommendations.slice(0, 6).map((step, i) => (
                    <li key={i} className="px-4 py-2.5 flex items-start gap-2.5">
                      <span
                        className={cn(
                          'mt-[6px] inline-block h-1.5 w-1.5 rounded-full shrink-0',
                          step.priority === 'foundational'
                            ? 'bg-amber-400'
                            : step.priority === 'next'
                              ? 'bg-emerald-400'
                              : 'bg-sky-400',
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground/90 leading-snug">{step.headline}</p>
                        <p className="text-[11px] text-muted-foreground/70 leading-snug mt-0.5">{step.body}</p>
                      </div>
                    </li>
                  ))}
                  {recommendations.length === 0 && (
                    <li className="px-4 py-6 text-center text-xs text-muted-foreground/60">Loading recommendations…</li>
                  )}
                </ul>
              </PopoverContent>
            </Popover>

            {/* PDF export — icon only, loading spinner + error state. */}
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={isGeneratingReport}
              aria-label={`Export my career journey PDF${careerTitle ? ` for ${careerTitle}` : ''}`}
              title={isGeneratingReport ? 'Preparing your report…' : 'Export PDF'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-emerald-950 transition-colors"
            >
              {isGeneratingReport ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" strokeWidth={2.25} />
              )}
            </button>
          </div>

          {reportError && (
            <p className="text-[10px] text-rose-400 ml-2 shrink-0" role="alert">{reportError}</p>
          )}
        </div>
        <p className="max-w-xl text-center text-xs leading-relaxed text-muted-foreground/80">
          {congratsMessage}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/60 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to dashboard
        </Link>
        </div>
      )}
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
        <Icon className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground/60 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground/80 leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground/45 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      {href && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 shrink-0" />}
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
  const isYouth = session?.user?.role === 'YOUTH';
  const { data: goalsData, isLoading: goalsLoading } = useGoals(isYouth);
  const goalTitle = goalsData?.primaryGoal?.title ?? null;

  const career = useMemo(() => {
    if (!goalTitle) return null;
    return getAllCareers().find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  const [activeTab, setActiveTab] = useState<V2Tab>('discover');

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


  const tabs: { id: V2Tab; label: string; subtitle: string; icon: typeof Search; color: string; glow: string; tooltip: string; lockedTooltip: string }[] = [
    { id: 'discover', label: t('journey.discover.label'), subtitle: t('journey.discover.subtitle'), icon: Search, color: 'text-teal-400', glow: 'rgba(20,184,166,0.25)', tooltip: t('journey.discover.tooltip'), lockedTooltip: '' },
    { id: 'understand', label: t('journey.understand.label'), subtitle: t('journey.understand.subtitle'), icon: Globe, color: 'text-blue-400', glow: 'rgba(59,130,246,0.25)', tooltip: t('journey.understand.tooltip'), lockedTooltip: t('journey.understand.lockedTooltip') },
    { id: 'clarity', label: t('journey.clarity.label'), subtitle: t('journey.clarity.subtitle'), icon: Rocket, color: 'text-amber-400', glow: 'rgba(245,158,11,0.25)', tooltip: t('journey.clarity.tooltip'), lockedTooltip: t('journey.clarity.lockedTooltip') },
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
          secondaryGoal={goalsData?.secondaryGoal || null}
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
              <span className="text-muted-foreground/50">My Journey to </span>
              {goalTitle}
            </h1>
            <button onClick={() => setGoalSheetOpen(true)} className="p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors" title="Change Primary Goal">
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
                      : 'border-border/40 hover:border-border/60 hover:bg-muted/20',
                )}
                style={isActive && !locked ? {
                  boxShadow: `0 0 20px ${tab.glow}, 0 0 40px ${tab.glow.replace('0.25', '0.1')}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  border: `1px solid ${tab.glow.replace('0.25', '0.4')}`,
                  background: `linear-gradient(180deg, ${tab.glow.replace('0.25', '0.08')} 0%, transparent 100%)`,
                } : undefined}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  {locked ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
                  ) : (
                    <TabIcon className={cn('h-3.5 w-3.5', isActive ? tab.color : 'text-muted-foreground/50')} />
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
                        ? 'text-foreground/50'
                        : 'text-muted-foreground/30',
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


        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'discover' && (
              <DiscoverTab
                career={career}
                goalTitle={goalTitle}
                onContinue={() => goToTab('understand')}
                onConfirmChange={setDiscoverConfirmedState}
                onGoToUnderstand={() => goToTab('understand')}
              />
            )}
            {activeTab === 'understand' && (
              <UnderstandTab
                career={career}
                goalTitle={goalTitle}
                onContinue={() => goToTab('clarity')}
                onConfirmChange={setUnderstandConfirmedState}
              />
            )}
            {activeTab === 'clarity' && (
              <ClarityTab goalTitle={goalTitle} career={career} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <JourneyReflectionsTray
        careerSlug={career?.id ?? null}
        activeLens={activeTab}
      />

      <GoalSelectionSheet
        open={goalSheetOpen}
        onClose={() => setGoalSheetOpen(false)}
        primaryGoal={goalsData?.primaryGoal || null}
        secondaryGoal={goalsData?.secondaryGoal || null}
        onSuccess={() => {
          setGoalSheetOpen(false);
          setActiveTab('discover');
        }}
      />
    </div>
  );
}
