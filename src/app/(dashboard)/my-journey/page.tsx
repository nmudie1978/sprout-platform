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

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Globe, Rocket, Play, TrendingUp,
  ArrowRight, BookOpen, Briefcase, GraduationCap, Pencil,
  Eye, ExternalLink, ChevronDown,
  Target, Sparkles, Save, Maximize2, X,
  Heart, Wrench, CheckCircle2, Clock, MapPin, Award, Users,
  DollarSign, BarChart3, Layers, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoals } from '@/hooks/use-goals';
import { getAllCareers, type Career } from '@/lib/career-pathways';
import type { CareerDetails } from '@/lib/career-typical-days';
import type { CareerProgression } from '@/lib/career-progressions';
import type { JourneyUIState } from '@/lib/journey/types';

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
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(careerTitle)}`);
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
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/30 transition-colors">
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

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border/40 bg-card/50 overflow-hidden', className)}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, badge }: { icon: typeof Eye; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground/60" />
        <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
      </div>
      {badge}
    </div>
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

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: typeof TrendingUp; accent?: string }) {
  return (
    <div className="rounded-lg border border-border/30 bg-background/50 p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={cn('h-3.5 w-3.5', accent || 'text-muted-foreground/50')} />
        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground/90">{value}</p>
    </div>
  );
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
  const videoId = ytData?.videoId ?? null;

  if (!career || !goalTitle) {
    return <EmptyState icon={Target} message="Set a career goal to start exploring" />;
  }

  return (
    <div className="space-y-5">
      {/* Hero: Video + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Video — 3 cols */}
        <SectionCard className="lg:col-span-3">
          <SectionHeader icon={Play} title="A Day in the Life" />
          <div className="p-4">
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
                href={`https://www.youtube.com/results?search_query=day+in+the+life+${encodeURIComponent(career.title)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 px-4 py-6 hover:bg-muted/20 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <Play className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/70">Watch on YouTube</p>
                  <p className="text-xs text-muted-foreground/50">See what a day as a {career.title} looks like</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground/30 ml-auto" />
              </a>
            )}
          </div>
        </SectionCard>

        {/* Overview stats — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard>
            <SectionHeader icon={BarChart3} title="Career Overview" />
            <div className="p-4 grid grid-cols-2 gap-3">
              <StatCard label="Avg. Salary" value={career.avgSalary} icon={DollarSign} accent="text-emerald-400" />
              <StatCard
                label="Growth"
                value={career.growthOutlook === 'high' ? 'High Demand' : career.growthOutlook === 'medium' ? 'Growing' : 'Stable'}
                icon={TrendingUp}
                accent={career.growthOutlook === 'high' ? 'text-emerald-400' : career.growthOutlook === 'medium' ? 'text-amber-400' : 'text-muted-foreground/50'}
              />
              <div className="col-span-2 rounded-lg border border-border/30 bg-background/50 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Education Path</span>
                </div>
                <p className="text-sm text-foreground/80">{career.educationPath}</p>
              </div>
              {career.entryLevel && (
                <div className="col-span-2 rounded-lg border border-teal-500/20 bg-teal-500/5 px-3.5 py-2.5">
                  <p className="text-xs text-teal-400 font-medium">Entry-level accessible — no degree required</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Roadmap preview */}
      <SectionCard>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <Rocket className="h-4 w-4 text-muted-foreground/60" />
            <h3 className="text-sm font-semibold text-foreground/90">Career Roadmap</h3>
          </div>
          <button onClick={() => setRoadmapFullscreen(true)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors">
            <Maximize2 className="h-3 w-3" /> Full screen
          </button>
        </div>
        <div className="p-4">
          <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
        </div>
      </SectionCard>

      <AnimatePresence>
        {roadmapFullscreen && <FullscreenRoadmap goalTitle={goalTitle} onClose={() => setRoadmapFullscreen(false)} />}
      </AnimatePresence>

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
  title, icon: Icon, defaultOpen = false, count, accent, children,
}: {
  title: string; icon: typeof Eye; defaultOpen?: boolean; count?: number; accent?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <SectionCard>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-5 py-3.5 text-left hover:bg-muted/5 transition-colors">
        <Icon className={cn('h-4 w-4', accent || 'text-muted-foreground/60')} />
        <h3 className="text-sm font-semibold text-foreground/90 flex-1">{title}</h3>
        {count !== undefined && <span className="text-[10px] text-muted-foreground/40">{count}</span>}
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground/30 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
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
  notes,
  onNotesChange,
  notesSaved,
  onSaveNotes,
  onContinue,
}: {
  career: Career | null;
  goalTitle: string | null;
  notes: string;
  onNotesChange: (v: string) => void;
  notesSaved: boolean;
  onSaveNotes: () => void;
  onContinue: () => void;
}) {
  const { data: detailsData, isLoading: detailsLoading } = useCareerDetails(career?.id ?? null);
  const { data: learningData, isLoading: learningLoading } = useLearningRecommendations(goalTitle);

  if (!career || !goalTitle) {
    return <EmptyState icon={Globe} message="Set a career goal in Discover first" />;
  }

  const details = detailsData?.details ?? null;
  const progression = detailsData?.progression ?? null;

  const allCourses = [
    ...(learningData?.localRegional ?? []),
    ...(learningData?.international ?? []),
  ];

  return (
    <div className="space-y-4">
      {/* What You'll Actually Do — short, punchy list from API (distinct from Discover's overview) */}
      {details && details.whatYouActuallyDo.length > 0 && (
        <SectionCard>
          <SectionHeader icon={Briefcase} title="What You'll Actually Do" />
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {details.whatYouActuallyDo.map((task, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/15 bg-background/20 px-3.5 py-2.5">
                  <div className="h-5 w-5 rounded-md bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-teal-400">{i + 1}</span>
                  </div>
                  <span className="text-[13px] text-foreground/70 leading-relaxed">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Typical Day */}
      <CollapsibleSection title="A Typical Day" icon={Clock} accent="text-amber-400" count={details ? (details.typicalDay.morning.length + details.typicalDay.midday.length + details.typicalDay.afternoon.length) : undefined}>
        {detailsLoading ? <LoadingSkeleton /> : details ? (
          <div className="space-y-4">
            {/* Timeline-style day breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-0">
              {([
                { label: 'Morning', time: '08:00 – 12:00', items: details.typicalDay.morning, icon: '🌅' },
                { label: 'Midday', time: '12:00 – 14:00', items: details.typicalDay.midday, icon: '☀️' },
                { label: 'Afternoon', time: '14:00 – 17:00', items: details.typicalDay.afternoon, icon: '🌆' },
              ] as const).map(({ label, time, items, icon }, idx) => (
                <div key={label} className={cn(
                  'relative p-4',
                  idx < 2 && 'sm:border-r border-border/20',
                  idx > 0 && 'border-t sm:border-t-0 border-border/20',
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">{icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground/80">{label}</p>
                      <p className="text-[10px] text-muted-foreground/40">{time}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="h-5 w-5 rounded-md bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground/40">{i + 1}</span>
                        </div>
                        <span className="text-[13px] text-foreground/65 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {details.typicalDay.environment && (
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/10 px-4 py-2.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/60">{details.typicalDay.environment}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/40">Detailed day info not yet available for this career.</p>
        )}
      </CollapsibleSection>

      {/* Is This Right for Me? */}
      <CollapsibleSection title="Is This Right for Me?" icon={Heart} accent="text-rose-400">
        {detailsLoading ? <LoadingSkeleton /> : details ? (
          <div className="space-y-5">
            {/* Who it's for — card grid */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-3">This role suits people who</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {details.whoThisIsGoodFor.map((trait, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border/20 bg-background/30 p-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    </div>
                    <p className="text-[13px] text-foreground/70 leading-relaxed">{trait}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top skills from API */}
            {details.topSkills.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-3">Key strengths needed</p>
                <div className="flex flex-wrap gap-2">
                  {details.topSkills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-border/25 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/65">
                      <Sparkles className="h-3 w-3 text-muted-foreground/30" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reality check */}
            {details.realityCheck && (
              <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-400 mb-1">Reality Check</p>
                    <p className="text-[13px] text-foreground/60 leading-relaxed">{details.realityCheck}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/40">Personality fit data not yet available for this career.</p>
        )}
      </CollapsibleSection>

      {/* Entry Requirements */}
      <CollapsibleSection title="Entry Requirements" icon={GraduationCap} accent="text-blue-400">
        {detailsLoading ? <LoadingSkeleton /> : details ? (
          <div className="space-y-4">
            <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">How to get started</p>
            {/* Stepped pathway */}
            <div className="relative">
              {/* Vertical connector line */}
              {details.entryPaths.length > 1 && (
                <div className="absolute left-[15px] top-6 bottom-6 w-px bg-gradient-to-b from-border/40 via-border/20 to-transparent" />
              )}
              <div className="space-y-3">
                {details.entryPaths.map((path, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="relative z-10 h-8 w-8 rounded-lg bg-foreground/5 border border-border/30 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-foreground/50">{i + 1}</span>
                    </div>
                    <div className="flex-1 rounded-lg border border-border/20 bg-background/30 p-3.5 mt-0.5">
                      <p className="text-[13px] text-foreground/75 leading-relaxed">{path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-foreground/70">{career.educationPath}</p>
            <p className="text-xs text-muted-foreground/40">Detailed entry requirement data is being verified for this career.</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Career Progression */}
      {progression && progression.levels.length > 0 && (
        <CollapsibleSection title="Career Progression" icon={Layers} accent="text-emerald-400" count={progression.levels.length}>
          {/* Horizontal progression bar */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {progression.levels.map((level, i) => {
                const colors = [
                  { bg: 'bg-blue-500/8', border: 'border-blue-500/20', dot: 'bg-blue-400', text: 'text-blue-400' },
                  { bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', dot: 'bg-emerald-400', text: 'text-emerald-400' },
                  { bg: 'bg-amber-500/8', border: 'border-amber-500/20', dot: 'bg-amber-400', text: 'text-amber-400' },
                  { bg: 'bg-violet-500/8', border: 'border-violet-500/20', dot: 'bg-violet-400', text: 'text-violet-400' },
                ];
                const c = colors[i] || colors[0];
                return (
                  <div key={level.level} className={cn('rounded-lg border p-3.5', c.border, c.bg)}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn('h-2 w-2 rounded-full', c.dot)} />
                      <span className={cn('text-[10px] font-semibold uppercase tracking-wider', c.text)}>
                        {level.level}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground/85 mb-0.5">{level.title}</p>
                    <p className="text-[11px] text-muted-foreground/45 mb-2">{level.yearsExperience}</p>
                    <p className="text-sm font-bold text-foreground/70">{level.salaryRange}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Verified Courses & Certifications */}
      <CollapsibleSection
        title="Courses & Certifications"
        icon={Award}
        accent="text-violet-400"
        count={allCourses.length || undefined}
      >
        {learningLoading ? <LoadingSkeleton /> : allCourses.length > 0 ? (
          <div className="space-y-4">
            {learningData?.meta?.verificationNote && (
              <div className="flex items-start gap-2 rounded-lg border border-blue-500/15 bg-blue-500/5 p-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-400/80">{learningData.meta.verificationNote}</p>
              </div>
            )}

            {/* Local/Regional courses */}
            {(learningData?.localRegional?.length ?? 0) > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Local & Regional</p>
                </div>
                <div className="space-y-2">
                  {learningData!.localRegional.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )}

            {/* International courses */}
            {(learningData?.international?.length ?? 0) > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Globe className="h-3 w-3 text-blue-400" />
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">International</p>
                </div>
                <div className="space-y-2">
                  {learningData!.international.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-border/20 bg-background/30 p-4 text-center">
            <p className="text-xs text-muted-foreground/50">
              {learningData?.message || 'No verified courses available for this career yet.'}
            </p>
            <p className="text-[10px] text-muted-foreground/30 mt-1">We only show courses we have manually verified — no guesswork.</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Tools of the Trade */}
      {details?.typicalDay.tools && details.typicalDay.tools.length > 0 && (
        <CollapsibleSection title="Tools of the Trade" icon={Wrench} accent="text-slate-400" count={details.typicalDay.tools.length}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {details.typicalDay.tools.map((tool, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border/20 bg-background/30 px-3.5 py-2.5">
                <Wrench className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                <span className="text-[13px] text-foreground/65">{tool}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Your Notes */}
      <SectionCard>
        <SectionHeader
          icon={Pencil}
          title="Your Notes"
          badge={notesSaved ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Saved
            </span>
          ) : undefined}
        />
        <div className="p-4">
          {notesSaved && notes ? (
            <div className="rounded-lg border border-border/20 bg-background/30 p-3.5">
              <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">{notes}</p>
              <button
                onClick={() => { onNotesChange(notes); /* keep content, allow re-edit via unsaved state */ }}
                className="text-[10px] text-muted-foreground/40 hover:text-foreground mt-2 transition-colors"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add anything you've found — reflections, links, research notes, things that surprised you..."
                className="flex-1 rounded-lg border border-border/30 bg-background/50 px-3.5 py-2.5 text-sm text-foreground/80 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
                rows={3}
                maxLength={2000}
              />
              <button
                onClick={onSaveNotes}
                disabled={!notes.trim()}
                className="self-end px-3 py-2 rounded-lg text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-20 shrink-0"
              >
                <Save className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Next */}
      <div className="flex justify-end pt-2">
        <button onClick={onContinue} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors">
          Grow <ArrowRight className="h-4 w-4" />
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

// ─── GROW TAB ────────────────────────────────────────────────────────────────

function GrowTab({ goalTitle, career }: { goalTitle: string | null; career: Career | null }) {
  const { data: detailsData } = useCareerDetails(career?.id ?? null);
  const details = detailsData?.details ?? null;

  if (!goalTitle || !career) {
    return <EmptyState icon={Rocket} message="Complete Discover and Understand first" />;
  }

  // Build contextual actions from real career data
  const topSkills = details?.topSkills ?? career.keySkills;

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
  }, [career.keySkills]);

  return (
    <div className="space-y-5">
      {/* School & Education pathway */}
      <SectionCard>
        <SectionHeader icon={GraduationCap} title="Your Education Path" />
        <div className="p-4 space-y-4">
          {/* Degree */}
          <div className="rounded-lg border border-border/30 bg-background/30 p-4">
            <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1.5">Recommended Degree</p>
            <p className="text-sm font-semibold text-foreground/85">{career.educationPath}</p>
          </div>

          {/* School subjects */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-3">Relevant School Subjects</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {schoolSubjects.map((s) => (
                <div key={s.subject} className="rounded-lg border border-border/25 bg-background/20 p-3">
                  <p className="text-xs font-semibold text-foreground/80 mb-0.5">{s.subject}</p>
                  <p className="text-[11px] text-muted-foreground/40 leading-relaxed">{s.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Entry paths from API */}
          {details && details.entryPaths.length > 0 && (
            <div className="border-t border-border/20 pt-3">
              <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-2">Steps to get there</p>
              <div className="flex flex-wrap gap-2">
                {details.entryPaths.map((path, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-border/20 bg-background/30 px-3 py-1.5 text-xs text-foreground/60">
                    <span className="text-[10px] font-bold text-muted-foreground/30">{i + 1}.</span>
                    {path}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Right Now actions */}
      <SectionCard>
        <SectionHeader icon={Sparkles} title="What You Can Do Right Now" />
        <div className="p-4 space-y-2">
          <ActionRow
            icon={Play}
            title={`Watch: A Day in the Life of a ${career.title}`}
            subtitle="5 minutes — see the role first-hand"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`"a day in the life" ${career.title}`)}`}
          />
          <ActionRow
            icon={GraduationCap}
            title={`Research ${career.educationPath.split('(')[0].trim()} routes`}
            subtitle="Compare programmes, entry requirements, and locations"
            href={`https://www.google.com/search?q=${encodeURIComponent(`${career.title} education pathway ${career.educationPath.split('(')[0].trim()}`)}`}
          />
          <ActionRow
            icon={BookOpen}
            title={`Build your ${topSkills[0] || 'core'} skills`}
            subtitle={`Start with what you're learning now — ${topSkills.slice(0, 2).join(' and ')} directly support this path`}
          />
        </div>
      </SectionCard>

      {/* Make It Real */}
      <SectionCard>
        <SectionHeader icon={Users} title="Make It Real" badge={<span className="text-[10px] text-muted-foreground/30">Meaningful next steps</span>} />
        <div className="p-4 space-y-2">
          <ActionRow
            icon={Users}
            title={`Have a conversation with a ${career.title}`}
            subtitle="Ask what they wish they knew at your age. One conversation can change everything."
            variant="highlight"
          />
          <ActionRow
            icon={Briefcase}
            title="Start a small project"
            subtitle={details?.whatYouActuallyDo?.[0]
              ? `Try something related to "${details.whatYouActuallyDo[0].toLowerCase()}" — build experience before you need it.`
              : 'Build something hands-on to test the waters — experience before commitment.'
            }
            variant="highlight"
          />
        </div>
      </SectionCard>

      {/* What This Means */}
      <SectionCard>
        <SectionHeader icon={Target} title="Where You Stand" />
        <div className="p-5">
          <p className="text-sm text-foreground/60 leading-[1.8]">
            {career.growthOutlook === 'high'
              ? `${career.title} is a high-demand field with strong long-term prospects. Exploring this now — before committing to ${career.educationPath.split('(')[0].trim()} — gives you a real advantage. Focus on ${topSkills.slice(0, 2).join(' and ')} through your schoolwork and small real-world experiences.`
              : career.growthOutlook === 'medium'
              ? `This is a growing field with solid career paths. The skills you build — ${topSkills.slice(0, 2).join(' and ')} — are transferable even if you change direction later. You're exploring at exactly the right time.`
              : `${career.title} is a stable career with clear pathways. Building strength in ${topSkills.slice(0, 2).join(' and ')} now gives you a foundation whether you stay on this path or pivot later.`
            }
          </p>
        </div>
      </SectionCard>

      <div className="text-center py-2">
        <p className="text-[10px] text-muted-foreground/25">These suggestions adapt as you explore. Move at your own pace.</p>
      </div>
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
  const { data: goalsData } = useGoals(isYouth);
  const goalTitle = goalsData?.primaryGoal?.title ?? null;

  const { data: journeyData } = useQuery<{ success: boolean; journey: JourneyUIState }>({
    queryKey: ['journey-state'],
    queryFn: async () => {
      const res = await fetch('/api/journey');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: isYouth,
    staleTime: 30_000,
  });

  const career = useMemo(() => {
    if (!goalTitle) return null;
    return getAllCareers().find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  const [activeTab, setActiveTab] = useState<V2Tab>('discover');
  const [goalSheetOpen, setGoalSheetOpen] = useState(false);
  const [understandNotes, setUnderstandNotes] = useState('');
  const [understandNotesSaved, setUnderstandNotesSaved] = useState(false);

  const tabs: { id: V2Tab; label: string; subtitle: string; icon: typeof Search; color: string; glow: string }[] = [
    { id: 'discover', label: 'Discover', subtitle: 'Explore the career', icon: Search, color: 'text-teal-400', glow: 'rgba(20,184,166,0.25)' },
    { id: 'understand', label: 'Understand', subtitle: 'Know the role', icon: Globe, color: 'text-blue-400', glow: 'rgba(59,130,246,0.25)' },
    { id: 'grow', label: 'Grow', subtitle: 'Take action', icon: Rocket, color: 'text-amber-400', glow: 'rgba(245,158,11,0.25)' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          {goalTitle ? (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                <span className="text-muted-foreground/50">My Journey to </span>
                {goalTitle}
              </h1>
              <button onClick={() => setGoalSheetOpen(true)} className="p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors" title="Change goal">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setGoalSheetOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
              <Target className="h-4 w-4" /> Set a career goal
            </button>
          )}
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
                notes={understandNotes}
                onNotesChange={(v) => { setUnderstandNotes(v); setUnderstandNotesSaved(false); }}
                notesSaved={understandNotesSaved}
                onSaveNotes={() => setUnderstandNotesSaved(true)}
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
