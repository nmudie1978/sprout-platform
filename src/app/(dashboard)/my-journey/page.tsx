'use client';

/**
 * MY JOURNEY PAGE
 *
 * Three-stage career exploration:
 *   Discover = Overview (video, salary, growth, skills, roadmap)
 *   Understand = Deep dive (typical day, entry requirements, verified courses, tools, notes)
 *   Grow = Action plan (school connection, next steps, portfolio ideas)
 *
 * Data sources:
 *   - Career basics: getAllCareers() from career-pathways
 *   - Career details: /api/career-details/[id] (typical day, entry paths, tools, reality check)
 *   - Verified courses: /api/learning/recommendations (real, geo-filtered courses)
 *   - YouTube: /api/youtube-search
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Globe, Rocket, Play, TrendingUp,
  ArrowRight, BookOpen, Briefcase, GraduationCap, Pencil,
  Eye, ExternalLink, ChevronDown,
  Target, Sparkles, Save, Maximize2, X,
  Heart, Wrench, Check, CheckCircle2, Clock, MapPin, Award, Users,
  DollarSign, BarChart3, Layers, AlertCircle, Plus, Trash2, Tag, Video, Zap, Info,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, slugify } from '@/lib/utils';
import { useGoals } from '@/hooks/use-goals';
import { getAllCareers, type Career } from '@/lib/career-pathways';
import type { CareerDetails } from '@/lib/career-typical-days';
import type { CareerProgression } from '@/lib/career-progressions';
import type { RealityCheckResult } from '@/lib/career-reality-types';
import { getNorwayProgrammes, getCertificationPath, getCareerRequirements } from '@/lib/education';
import { getToolInfo } from '@/lib/education/tool-links';
import { CareerPathExamplesPanel } from '@/components/journey/career-path-examples-panel';
import { EducationBrowser } from '@/components/education-browser';
import type { Journey } from '@/lib/journey/career-journey-types';
import { setUnderstandConfirmed, isUnderstandConfirmed, setDiscoverConfirmed, isDiscoverConfirmed, markGrowActive } from '@/lib/journey/lens-progress';

const PersonalCareerTimeline = dynamic(
  () => import('@/components/journey').then((m) => m.PersonalCareerTimeline),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const GoalSelectionSheet = dynamic(
  () => import('@/components/goals/GoalSelectionSheet').then((m) => m.GoalSelectionSheet),
  { ssr: false }
);

// ─── Types ───────────────────────────────────────────────────────────────────

type V2Tab = 'discover' | 'understand' | 'grow';

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

function useYouTubeVideo(careerTitle: string | null) {
  return useQuery<{ videoId: string | null }>({
    queryKey: ['youtube-video', careerTitle],
    queryFn: async () => {
      if (!careerTitle) return { videoId: null };
      const query = `day in the life ${careerTitle}`;
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return { videoId: null };
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
  return (
    <div className={cn('rounded-xl border border-border/40 bg-card/50 overflow-hidden', className)} style={{ boxShadow: '0 0 20px rgba(139,92,246,0.06), 0 0 40px rgba(139,92,246,0.03)', ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, badge, tooltip, collapsed, onToggle }: {
  icon: typeof Eye;
  title: string;
  badge?: React.ReactNode;
  tooltip?: string;
  /** When provided, the header becomes a clickable collapse toggle. */
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const Wrapper = onToggle ? 'button' : 'div';
  return (
    <Wrapper
      {...(onToggle ? { type: 'button' as const, onClick: onToggle, 'aria-expanded': !collapsed } : {})}
      className={cn(
        'flex items-center justify-between px-5 py-3.5 border-b border-border/30 w-full text-left',
        onToggle && 'hover:bg-muted/20 transition-colors cursor-pointer',
      )}
    >
      <div className="flex items-center gap-2.5">
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
      <div className="flex items-center gap-2">
        {badge}
        {onToggle && (
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground/55 transition-transform duration-200',
            collapsed && '-rotate-90',
          )} />
        )}
      </div>
    </Wrapper>
  );
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
    <div className={cn('rounded-lg border border-border/30 bg-background/50 p-3.5', tooltip && 'cursor-help')}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={cn('h-3.5 w-3.5', accent || 'text-muted-foreground/50')} />
        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{label}</span>
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
}: {
  career: Career | null;
  goalTitle: string | null;
  onContinue: () => void;
}) {
  const [roadmapFullscreen, setRoadmapFullscreen] = useState(false);
  const { data: ytData } = useYouTubeVideo(goalTitle);
  const { data: discoverDetails } = useCareerDetails(career?.id ?? null);
  const videoId = ytData?.videoId ?? null;
  const { isCollapsed: dCollapsed, toggle: dToggle } = useSectionCollapse(['d-video', 'd-overview', 'd-insights']);

  if (!career || !goalTitle) {
    return <EmptyState icon={Target} message="Set a career goal to start exploring" />;
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
          <SectionHeader icon={Play} title="A Day in the Life" collapsed={dCollapsed('d-video')} onToggle={() => dToggle('d-video')} />
          {!dCollapsed('d-video') && <div className="p-4">
            {videoId ? (
              <div className="rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Day in the life — ${career.title}`}
                />
              </div>
            ) : (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`day in the life ${career.title}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border/30 bg-muted/10 aspect-video hover:bg-muted/20 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Play className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-xs text-muted-foreground/50">Watch on YouTube</p>
              </a>
            )}
          </div>}
        </SectionCard>

        {/* Overview stats — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <SectionCard>
            <SectionHeader icon={BarChart3} title="Career Overview" collapsed={dCollapsed('d-overview')} onToggle={() => dToggle('d-overview')} />
            {!dCollapsed('d-overview') && <div className="p-4 grid grid-cols-2 gap-3">
              <StatCard label="Annual Salary" value={formatSalaryShort(career.avgSalary)} icon={DollarSign} accent="text-emerald-400" tooltip={`Typical annual gross salary in Norway: ${career.avgSalary.replace('/year', '')}. Varies by experience, location, and employer.`} />
              <StatCard
                label="Growth"
                value={career.growthOutlook === 'high' ? 'High Demand' : career.growthOutlook === 'medium' ? 'Growing' : 'Stable'}
                icon={TrendingUp}
                accent={career.growthOutlook === 'high' ? 'text-emerald-400' : career.growthOutlook === 'medium' ? 'text-amber-400' : 'text-muted-foreground/50'}
              />
              {/* What You Need — compact horizontal chain for Discover.
                  Each step is one small pill with full detail in its
                  native tooltip. Keeps the card tight and scannable. */}
              {(() => {
                const reqs = getCareerRequirements(career.id) || getCareerRequirements(career.title);
                if (!reqs) {
                  return (
                    <div className="col-span-2 rounded-lg border border-border/30 bg-background/50 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Education Path</span>
                      </div>
                      <p className="text-xs text-foreground/80">{career.educationPath}</p>
                    </div>
                  );
                }
                // Merge specialisation note into the last pill's tooltip
                const specNote = reqs.specialisationNote ? `\n\n${reqs.specialisationNote}` : '';
                const steps = [
                  { emoji: '🏫', label: reqs.schoolSubjects.required.slice(0, 3).join(', '), tip: `Required: ${reqs.schoolSubjects.required.join(', ')}${reqs.schoolSubjects.recommended.length ? `\nRecommended: ${reqs.schoolSubjects.recommended.join(', ')}` : ''}\n${reqs.schoolSubjects.minimumGrade}` },
                  { emoji: '🎓', label: `${reqs.universityPath.programme} · ${reqs.universityPath.duration}`, tip: `e.g. ${reqs.universityPath.examples.join(', ')}\nApply via ${reqs.universityPath.applicationRoute}\n${reqs.universityPath.competitiveness}` },
                  { emoji: '📋', label: reqs.entryLevelRequirements.title, tip: `${reqs.entryLevelRequirements.description}\nYou need: ${reqs.entryLevelRequirements.whatYouNeed}${specNote}` },
                  { emoji: '💼', label: reqs.qualifiesFor.immediate, tip: `→ ${reqs.qualifiesFor.withExperience}\n→ ${reqs.qualifiesFor.seniorPath}${specNote}` },
                ];
                return (
                  <div className="col-span-2 rounded-lg border border-border/30 bg-background/50 p-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-wider">Path to becoming a {career.title.toLowerCase()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/55 mb-2 ml-5">From school subjects to your first role — and what comes next.</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {steps.map((s, i) => (
                        <div key={i} className="contents">
                          {i > 0 && <span className="text-[10px] text-muted-foreground/40 px-0.5">→</span>}
                          <span
                            title={s.tip}
                            className="inline-flex items-center gap-1 shrink-0 rounded-md border border-border/25 bg-muted/10 px-2 py-1 text-[10px] text-foreground/80 cursor-help hover:border-blue-500/30 hover:bg-blue-500/[0.05] transition-colors"
                          >
                            <span>{s.emoji}</span>
                            <span className="max-w-[150px] truncate">{s.label}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {career.entryLevel && (
                <div className="col-span-2 rounded-lg border border-teal-500/20 bg-teal-500/5 px-3.5 py-2.5">
                  <p className="text-xs text-teal-400 font-medium">Entry-level accessible — no degree required</p>
                </div>
              )}
              <div className="col-span-2 rounded-lg border border-border/30 bg-background/50 p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Day-to-Day</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {career.dailyTasks.map((task) => (
                    <span key={task} className="inline-flex rounded-full border border-border/20 bg-background/30 px-2.5 py-0.5 text-[11px] text-foreground/60">{task}</span>
                  ))}
                </div>
              </div>
            </div>}
          </SectionCard>
        </div>
      </div>

      {/* Quick insights row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* How long */}
        {(() => {
          const yearMatch = career.educationPath.match(/(\d+)\s*[–\-+]\s*(\d+)?\s*years?/i) || career.educationPath.match(/(\d+)\s*years?/i);
          const years = yearMatch ? parseInt(yearMatch[2] || yearMatch[1]) : null;
          const qualifiedAge = years ? 16 + years : null;
          return (
            <div className="rounded-xl border border-border/30 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Timeline</span>
              </div>
              {qualifiedAge ? (
                <p className="text-xs text-foreground/70 leading-relaxed">
                  You could be qualified by <span className="font-semibold text-foreground/90">age {qualifiedAge}</span>
                  <span className="text-muted-foreground/40"> — that&apos;s ~{years} years from now</span>
                </p>
              ) : (
                <p className="text-xs text-foreground/70 leading-relaxed">{career.educationPath}</p>
              )}
            </div>
          );
        })()}

        {/* Work environment */}
        {dDetails?.typicalDay.environment && (
          <div className="rounded-xl border border-border/30 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Where you&apos;ll work</span>
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">{dDetails.typicalDay.environment}</p>
          </div>
        )}

        {/* Reality teaser */}
        {dDetails?.realityCheck && (
          <div className="rounded-xl border border-border/30 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Good to know</span>
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">{dDetails.realityCheck}</p>
          </div>
        )}
      </div>

      {/* Self-confirmation — drives the dashboard's Discover progress.
          Picking a goal alone no longer counts; the user has to actively
          say they've explored the role, so a brand-new career starts at
          0/3 on the dashboard ring. */}
      <DiscoverConfirmCard careerTitle={goalTitle} />

      {/* Next */}
      <div className="flex justify-end pt-2">
        <button onClick={onContinue} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors">
          Understand <ArrowRight className="h-4 w-4" />
        </button>
      </div>
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
}: {
  career: Career | null;
  goalTitle: string | null;
  onContinue: () => void;
}) {
  const { data: detailsData, isLoading: detailsLoading } = useCareerDetails(career?.id ?? null);
  const { data: learningData, isLoading: learningLoading } = useLearningRecommendations(goalTitle);
  const { data: courseSearchData } = useCourseSearch(goalTitle);
  const { data: realityData, isLoading: realityLoading } = useCareerReality(goalTitle);

  // All hooks must be called before any early return
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [carouselTab, setCarouselTab] = useState<'paths' | 'tools'>('paths');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const { isCollapsed: uCollapsed, toggle: uToggle } = useSectionCollapse(['u-tasks', 'u-reality', 'u-day', 'u-notes', 'u-career-paths']);

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
          Here&apos;s what being a <span className="font-semibold text-foreground/90">{goalTitle}</span> actually involves — the real responsibilities, a typical working day, and the education and training you&apos;ll need to get there.
        </p>
      </div>

      {/* ── TOP: What You'll Do + Reality Videos — side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: What You'll Actually Do */}
        {details && details.whatYouActuallyDo.length > 0 && (
          <SectionCard>
            <SectionHeader icon={Briefcase} title="What You'll Actually Do" tooltip="The core responsibilities and daily tasks that define this role — what you'd actually spend your time doing." collapsed={uCollapsed('u-tasks')} onToggle={() => uToggle('u-tasks')} />
            {!uCollapsed('u-tasks') && (
              <div className="p-4">
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
              </div>
            )}
          </SectionCard>
        )}

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

                {/* Reality points */}
                {realityData.realityPoints.length > 0 && (
                  <div className="space-y-1">
                    {realityData.realityPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 text-amber-400/70 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-foreground/50 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fit signal */}
                {realityData.fitSignal && (
                  <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2">
                    <p className="text-[10px] text-emerald-300/70 leading-relaxed">
                      <span className="font-medium text-emerald-300/90">Good fit: </span>
                      {realityData.fitSignal}
                    </p>
                  </div>
                )}

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
            ) : null}
          </div>}
        </SectionCard>
      </div>

      {/* ── MIDDLE: A Typical Day — horizontal timeline ── */}
      <SectionCard>
        <SectionHeader icon={Clock} title="A Typical Day" tooltip="What a real working day looks like in this role — morning, midday, and afternoon — so you can picture yourself in it." collapsed={uCollapsed('u-day')} onToggle={() => uToggle('u-day')} />
        {uCollapsed('u-day') ? null : detailsLoading ? <div className="p-4"><LoadingSkeleton /></div> : details ? (
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
          <div className="p-4"><p className="text-xs text-muted-foreground/40">Loading...</p></div>
        )}
      </SectionCard>

      {/* ── Study Paths — embedded browser with full institution/programme data ── */}
      <EducationBrowser careerTitle={goalTitle} />

      {/* ── BOTTOM: Tabbed carousel — Career Paths, Tools ── */}
      <SectionCard>
        <SectionHeader icon={Users} title="Real Career Paths & Tools" tooltip="How real people got into this career, and the tools professionals use every day." collapsed={uCollapsed('u-career-paths')} onToggle={() => uToggle('u-career-paths')} />
        {!uCollapsed('u-career-paths') && (
          <>
            {/* Tab bar — coloured pills */}
            <div className="flex gap-2 p-3 bg-muted/5 border-b border-border/20">
              {([
                { id: 'paths' as const, label: 'Real Career Paths', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', activeBorder: 'border-emerald-500/30', activeBg: 'bg-emerald-500/15', tooltip: 'How real people got into this career — different starting points, different routes, same destination.' },
                { id: 'tools' as const, label: 'Tools of the Trade', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10', activeBorder: 'border-amber-500/30', activeBg: 'bg-amber-500/15', tooltip: 'The software, equipment, and tools professionals in this role use every day.' },
              ]).map((tab) => {
                const TabIcon = tab.icon;
                const active = carouselTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setCarouselTab(tab.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border',
                      active
                        ? `${tab.activeBg} ${tab.activeBorder} ${tab.color}`
                        : 'border-transparent text-muted-foreground/40 hover:text-muted-foreground/60 hover:bg-muted/10'
                    )}
                  >
                    <TabIcon className={cn('h-3.5 w-3.5', active ? tab.color : '')} />
                    {tab.label}
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
                          {tab.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="p-4">
              {carouselTab === 'paths' && (
                <CareerPathExamplesPanel careerId={career.id} careerTitle={career.title} />
              )}

              {carouselTab === 'tools' && (() => {
                if (!details?.typicalDay.tools?.length) return <p className="text-xs text-foreground/70">Tool information coming soon for this role.</p>;
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {details.typicalDay.tools.map((tool, i) => {
                      const info = getToolInfo(tool);
                      return (
                        <a key={i} href={info?.url || `https://www.google.com/search?q=${encodeURIComponent(tool)}`} target="_blank" rel="noopener noreferrer"
                          className="group flex items-center gap-3 rounded-lg border border-border/30 bg-background/40 px-3.5 py-2.5 hover:border-amber-500/40 hover:bg-amber-500/[0.04] transition-colors">
                          <Wrench className="h-4 w-4 text-amber-400/70 group-hover:text-amber-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-foreground">{tool}</p>
                            {info && <p className="text-[11px] text-foreground/65 mt-0.5">{info.description}</p>}
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-amber-400 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </SectionCard>

      {/* Self-confirmation — drives the dashboard's Understand progress.
          The Understand tab is read-only deep-dive content, so a deliberate
          YES is the cleanest completion signal we can capture. */}
      <UnderstandConfirmCard careerTitle={goalTitle} />

      {/* Next */}
      <div className="flex justify-end pt-2">
        <button onClick={onContinue} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors">
          Grow <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DiscoverConfirmCard({ careerTitle }: { careerTitle: string | null }) {
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    setConfirmed(isDiscoverConfirmed(careerTitle));
  }, [careerTitle]);
  if (!careerTitle) return null;

  const choose = (value: boolean) => {
    setDiscoverConfirmed(careerTitle, value);
    setConfirmed(value);
  };

  return (
    <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.04] px-5 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground/85">
            Have you explored what this role is about?
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            Your answer marks Discover as complete on your dashboard.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => choose(true)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
              confirmed
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-background/40 border-border/40 text-foreground/70 hover:border-emerald-500/40 hover:text-emerald-300',
            )}
            aria-pressed={confirmed}
          >
            Yes
          </button>
          <button
            onClick={() => choose(false)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
              !confirmed
                ? 'bg-muted/30 border-border/40 text-foreground/60'
                : 'bg-background/40 border-border/40 text-foreground/70 hover:border-border/60',
            )}
            aria-pressed={!confirmed}
          >
            Not yet
          </button>
        </div>
      </div>
    </div>
  );
}

function UnderstandConfirmCard({ careerTitle }: { careerTitle: string | null }) {
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    setConfirmed(isUnderstandConfirmed(careerTitle));
  }, [careerTitle]);
  if (!careerTitle) return null;

  const choose = (value: boolean) => {
    setUnderstandConfirmed(careerTitle, value);
    setConfirmed(value);
  };

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] px-5 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground/85">
            Did you understand the role in more detail?
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            Your answer marks Understand as complete on your dashboard.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => choose(true)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
              confirmed
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-background/40 border-border/40 text-foreground/70 hover:border-emerald-500/40 hover:text-emerald-300',
            )}
            aria-pressed={confirmed}
          >
            Yes
          </button>
          <button
            onClick={() => choose(false)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
              !confirmed
                ? 'bg-muted/30 border-border/40 text-foreground/60'
                : 'bg-background/40 border-border/40 text-foreground/70 hover:border-border/60',
            )}
            aria-pressed={!confirmed}
          >
            Not yet
          </button>
        </div>
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

// ─── GROW TAB ────────────────────────────────────────────────────────────────


function GrowTab({ goalTitle, career }: { goalTitle: string | null; career: Career | null }) {
  const { data: detailsData } = useCareerDetails(career?.id ?? null);
  const { data: storiesData } = useCareerStories(career?.id ?? null);
  const details = detailsData?.details ?? null;
  const careerStories = storiesData?.stories ?? [];

  // Education context — drives the foundation gate for Play and Grow completion.
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

  // Display name — used to personalise the Momentum header.
  // Shares the `profile-dob` query key with personal-career-timeline
  // so both components hit the same cached payload.
  const { data: profileData } = useQuery<{ displayName?: string | null }>({
    queryKey: ['profile-dob'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 30 * 1000,
  });
  const rawName = profileData?.displayName ?? '';
  const possessiveName = rawName
    ? `${rawName.charAt(0).toUpperCase()}${rawName.slice(1)}'s`
    : 'Your';

  // Collapse state for Roadmap + Momentum + From the Field, persisted
  // per-user via localStorage so the user's choice survives reloads.
  const [roadmapCollapsed, setRoadmapCollapsed] = useState(false);
  const [momentumCollapsed, setMomentumCollapsed] = useState(false);
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

  // Grow accordion — only one section open at a time
  const [growSection, setGrowSection] = useState<string | null>('actions');

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

  const toggleGrow = (id: string) => setGrowSection(prev => prev === id ? null : id);

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
      <SectionCard className="border-teal-500/25" style={{ boxShadow: '0 0 25px rgba(20,184,166,0.12), 0 0 50px rgba(20,184,166,0.06)' }}>
        <button
          type="button"
          onClick={toggleRoadmap}
          aria-expanded={!roadmapCollapsed}
          className="w-full flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border/20 hover:bg-teal-500/[0.04] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Rocket className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-foreground/90">{possessiveName} Roadmap</h3>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground/55 transition-transform duration-200',
              roadmapCollapsed && '-rotate-90'
            )}
          />
        </button>
        {!roadmapCollapsed && (
          <div className="p-4">
            <PersonalCareerTimeline
              primaryGoalTitle={goalTitle}
              onSimulationReady={({ play }) => setSimulationPlay(() => play)}
            />
          </div>
        )}
      </SectionCard>

      {/* 2. Momentum — suggested + your own progressive steps.
          The state machinery (load/save/sync to /api/journey/goal-data,
          status cycling, reflections) is declared above; this block is
          the rendered surface. Adding a personal step also marks Grow
          complete on the dashboard's progress card. */}
      <SectionCard className="border-amber-500/20" style={{ boxShadow: '0 0 20px rgba(245,158,11,0.06)' }}>
        <button
          type="button"
          onClick={toggleMomentum}
          aria-expanded={!momentumCollapsed}
          className="w-full flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border/20 hover:bg-amber-500/[0.04] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-foreground/90">{possessiveName} Momentum</h3>
            {actions.length > 0 && (
              <span className="text-[10px] text-muted-foreground/55 ml-1">
                {actions.filter((a) => statusOf(a) === 'done').length}/{actions.length} done
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground/55 transition-transform duration-200',
              momentumCollapsed && '-rotate-90'
            )}
          />
        </button>
        {!momentumCollapsed && (
        <div className="p-4 space-y-5">
          <p className="text-xs text-muted-foreground/50 leading-relaxed -mt-1">
            Small, concrete steps you can take right now. Pick a suggestion or add your own — even one action builds real momentum toward your goal.
          </p>
          {/* Suggested momentum — 3 concrete starting points pulled
              from public search URLs so they always work without an API. */}
          {(() => {
              // utdanning.no is Norwegian-language, so an English career
              // title ("Healthcare Worker") returns next to nothing.
              // Pull the Norwegian programme name from our curated map
              // and strip suffixes like "(bachelor)" or "→ Vg2" so the
              // search term is the bare noun ("Helse- og oppvekstfag",
              // "Sykepleie", "Medisin"). Falls back to the English
              // title when we don't have a Norwegian mapping.
              const norwayData = getNorwayProgrammes(career.id, career.title);
              const norwegianTerm = norwayData?.programmes?.[0]?.programme
                ?.replace(/\s*\([^)]*\)/g, '')
                .split('→')[0]
                .trim();
              const courseSearchTerm = norwegianTerm || career.title;
              const courseDescriptor = norwegianTerm
                ? `Aligned programmes on utdanning.no — searching “${norwegianTerm}”`
                : 'Aligned programmes on utdanning.no';

              const allSuggestions = [
                {
                  icon: Users,
                  color: 'text-blue-400',
                  title: `People in ${career.title} roles`,
                  descriptor: 'Find professionals on LinkedIn and read their journeys',
                  url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(career.title)}`,
                },
                {
                  icon: GraduationCap,
                  color: 'text-violet-400',
                  title: `University courses for ${career.title}`,
                  descriptor: courseDescriptor,
                  url: `https://utdanning.no/sok?q=${encodeURIComponent(courseSearchTerm)}`,
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
        )}
      </SectionCard>

      {/* 3. From the Field — real professional stories */}
      {careerStories.length > 0 && (
        <SectionCard>
          <SectionHeader icon={Video} title="From the Field" badge={<span className="text-[10px] text-muted-foreground/30">{careerStories.length} stories</span>} collapsed={gCollapsed('g-field')} onToggle={() => gToggle('g-field')} />
          {!gCollapsed('g-field') && <div className="p-4">
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
                    {/* Takeaways hidden at compact size — visible on hover via title */}
                  </div>
                </div>
              ))}
            </div>
          </div>}
        </SectionCard>
      )}

      {/* ── Grow completion — auto-derived from foundation + momentum ── */}
      <GrowCompletionCard
        careerTitle={goalTitle}
        hasFoundation={hasFoundation}
        hasMomentum={actions.length > 0}
      />

    </div>
  );
}

function GrowCompletionCard({
  careerTitle,
  hasFoundation,
  hasMomentum,
}: {
  careerTitle: string | null;
  hasFoundation: boolean;
  hasMomentum: boolean;
}) {
  const growComplete = hasFoundation && hasMomentum;

  // Auto-mark Grow as active on the dashboard when both conditions are met.
  useEffect(() => {
    if (growComplete && careerTitle) {
      markGrowActive(careerTitle);
    }
  }, [growComplete, careerTitle]);

  return (
    <div className={cn(
      'rounded-xl border px-5 py-4',
      growComplete
        ? 'border-emerald-500/25 bg-emerald-500/[0.04]'
        : 'border-border/30 bg-card/30',
    )}>
      <p className={cn(
        'text-sm font-semibold mb-3',
        growComplete ? 'text-emerald-400' : 'text-foreground/85',
      )}>
        {growComplete ? 'Grow complete' : 'Complete Grow'}
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
      {growComplete && (
        <p className="text-[10px] text-emerald-500/60 mt-3">
          Your dashboard now shows Grow as complete for this career.
        </p>
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
  const isYouth = session?.user?.role === 'YOUTH';
  const { data: goalsData, isLoading: goalsLoading } = useGoals(isYouth);
  const goalTitle = goalsData?.primaryGoal?.title ?? null;

  const career = useMemo(() => {
    if (!goalTitle) return null;
    return getAllCareers().find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  const [activeTab, setActiveTab] = useState<V2Tab>('discover');

  // Read hash on mount (client only) and sync tab changes to hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as V2Tab;
    if (['discover', 'understand', 'grow'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);
  const [goalSheetOpen, setGoalSheetOpen] = useState(false);


  const tabs: { id: V2Tab; label: string; subtitle: string; icon: typeof Search; color: string; glow: string; tooltip: string }[] = [
    { id: 'discover', label: 'Discover', subtitle: 'Explore the career', icon: Search, color: 'text-teal-400', glow: 'rgba(20,184,166,0.25)', tooltip: 'Get a feel for the career — what a typical day looks like, salary, growth outlook, and the key skills involved.' },
    { id: 'understand', label: 'Understand', subtitle: 'The reality, education & skills', icon: Globe, color: 'text-blue-400', glow: 'rgba(59,130,246,0.25)', tooltip: 'Go deeper into what the role actually involves — real education paths, entry requirements, courses, and honest reality checks.' },
    { id: 'grow', label: 'Grow', subtitle: 'Take action', icon: Rocket, color: 'text-amber-400', glow: 'rgba(245,158,11,0.25)', tooltip: 'Play through your personal roadmap step by step, explore live opportunities, and build momentum toward your career goal.' },
  ];

  // While goals are loading, show a skeleton to avoid flashing the onboarding
  // screen for users who already have a career goal set.
  if (goalsLoading) {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 mb-4">
              <Sparkles className="h-6 w-6 text-teal-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              My Journey
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Pick a career to explore in depth, and we&rsquo;ll walk you from curiosity to a real plan &mdash; one step at a time.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              {
                n: 1,
                title: "Discover",
                subtitle: "Explore the career",
                body: "Get a high-level view: what it is, who does it, salary range, and whether it's worth a closer look.",
              },
              {
                n: 2,
                title: "Understand",
                subtitle: "Know the reality",
                body: "Go deeper into day-to-day work, qualifications, and the hard parts.",
              },
              {
                n: 3,
                title: "Grow",
                subtitle: "Build your roadmap",
                body: "Map your path, set concrete next steps, and track your progress.",
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
              Pick a career to explore
            </button>
            <a
              href="/careers/radar"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border bg-background hover:bg-muted/50 text-sm font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4 text-teal-500" />
              Or browse your matches first
            </a>
          </div>
        </div>

        <GoalSelectionSheet
          open={goalSheetOpen}
          onClose={() => setGoalSheetOpen(false)}
          primaryGoal={goalsData?.primaryGoal || null}
          secondaryGoal={goalsData?.secondaryGoal || null}
          onSuccess={() => setGoalSheetOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">
              <span className="text-muted-foreground/50">My Journey to </span>
              {goalTitle}
            </h1>
            <button onClick={() => setGoalSheetOpen(true)} className="p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors" title="Change goal">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.tooltip}
                className={cn(
                  'relative rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                  isActive ? 'border-transparent' : 'border-border/40 hover:border-border/60 hover:bg-muted/20',
                )}
                style={isActive ? {
                  boxShadow: `0 0 20px ${tab.glow}, 0 0 40px ${tab.glow.replace('0.25', '0.1')}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  border: `1px solid ${tab.glow.replace('0.25', '0.4')}`,
                  background: `linear-gradient(180deg, ${tab.glow.replace('0.25', '0.08')} 0%, transparent 100%)`,
                } : undefined}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <TabIcon className={cn('h-3.5 w-3.5', isActive ? tab.color : 'text-muted-foreground/50')} />
                  <span className={cn('text-sm font-semibold', isActive ? 'text-foreground' : 'text-muted-foreground/60')}>{tab.label}</span>
                </div>
                <p className={cn('text-[11px]', isActive ? 'text-foreground/50' : 'text-muted-foreground/30')}>{tab.subtitle}</p>
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
              <DiscoverTab career={career} goalTitle={goalTitle} onContinue={() => setActiveTab('understand')} />
            )}
            {activeTab === 'understand' && (
              <UnderstandTab
                career={career}
                goalTitle={goalTitle}
                onContinue={() => setActiveTab('grow')}
              />
            )}
            {activeTab === 'grow' && (
              <GrowTab goalTitle={goalTitle} career={career} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <GoalSelectionSheet
        open={goalSheetOpen}
        onClose={() => setGoalSheetOpen(false)}
        primaryGoal={goalsData?.primaryGoal || null}
        secondaryGoal={goalsData?.secondaryGoal || null}
        onSuccess={() => setGoalSheetOpen(false)}
      />
    </div>
  );
}
