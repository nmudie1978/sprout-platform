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
  DollarSign, BarChart3, Layers, AlertCircle, Plus, Trash2, Tag, Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoals } from '@/hooks/use-goals';
import { getAllCareers, type Career } from '@/lib/career-pathways';
import type { CareerDetails } from '@/lib/career-typical-days';
import type { CareerProgression } from '@/lib/career-progressions';
import type { JourneyUIState } from '@/lib/journey/types';
import { getNorwayProgrammes, getCertificationPath } from '@/lib/education/norway-programmes';
import { getCareerPathExamples } from '@/lib/education/career-path-examples';

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

interface CareerVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  query: string;
}

function useCareerVideos(careerTitle: string | null) {
  return useQuery<{ videos: CareerVideo[]; count: number }>({
    queryKey: ['career-videos', careerTitle],
    queryFn: async () => {
      const res = await fetch(`/api/youtube-search/career-videos?career=${encodeURIComponent(careerTitle!)}`);
      if (!res.ok) return { videos: [], count: 0 };
      return res.json();
    },
    enabled: !!careerTitle,
    staleTime: 24 * 60 * 60 * 1000,
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
      {/* Brief description */}
      <p className="text-sm text-foreground/60 leading-relaxed">{career.description}</p>

      {/* Hero: Video + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Video — 2 cols */}
        <SectionCard className="lg:col-span-2">
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
          </div>
        </SectionCard>

        {/* Overview stats — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
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
  const { data: careerVideosData } = useCareerVideos(goalTitle);

  if (!career || !goalTitle) {
    return <EmptyState icon={Globe} message="Set a career goal in Discover first" />;
  }

  const details = detailsData?.details ?? null;
  const progression = detailsData?.progression ?? null;
  const careerVideos = careerVideosData?.videos ?? [];

  // Accordion — only one section open at a time (null = all collapsed)
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (id: string) => setOpenSection(prev => prev === id ? null : id);

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

      {/* The Reality — best 2 videos picked from multiple search queries */}
      {careerVideos.length > 0 && (
        <SectionCard>
          <SectionHeader icon={Play} title="The Reality" badge={<span className="text-[10px] text-muted-foreground/30">See for yourself</span>} />
          <div className="px-4 py-5">
            <div className={cn(
              'flex justify-center gap-8 flex-wrap',
            )}>
              {careerVideos.map((video) => (
                <div key={video.videoId} className="w-full max-w-[280px]">
                  <p className="text-[10px] font-medium text-muted-foreground/40 mb-2 line-clamp-1 text-center">{video.title}</p>
                  <div className="rounded-lg overflow-hidden border border-border/15">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={video.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Typical Day */}
      <CollapsibleSection title="A Typical Day" icon={Clock} accent="text-amber-400" isOpen={openSection === 'typical-day'} onToggle={() => toggle('typical-day')} count={details ? (details.typicalDay.morning.length + details.typicalDay.midday.length + details.typicalDay.afternoon.length) : undefined}>
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
      <CollapsibleSection title="Is This Right for Me?" icon={Heart} accent="text-rose-400" isOpen={openSection === 'fit'} onToggle={() => toggle('fit')}>
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

            {/* Reality check text */}
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
      <CollapsibleSection title="Entry Requirements" icon={GraduationCap} accent="text-blue-400" isOpen={openSection === 'entry'} onToggle={() => toggle('entry')}>
        {detailsLoading ? <LoadingSkeleton /> : details ? (
          <div className="space-y-3">
            {/* Horizontal rail timeline */}
            <div className="relative">
              {/* Rail line */}
              {details.entryPaths.length > 1 && (
                <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-blue-500/30 via-blue-500/20 to-blue-500/5" />
              )}
              <div className="relative flex gap-0 overflow-x-auto pb-2">
                {details.entryPaths.map((path, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 min-w-[120px] px-2">
                    {/* Node */}
                    <div className={cn(
                      'relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
                      i === 0 ? 'bg-blue-500 border-blue-400 text-white' : 'bg-background border-border/40 text-muted-foreground/50',
                    )}>
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    </div>
                    {/* Label */}
                    <p className="text-[11px] text-foreground/65 text-center mt-2 leading-snug">{path}</p>
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
        <CollapsibleSection title="Career Progression" icon={Layers} accent="text-emerald-400" isOpen={openSection === 'progression'} onToggle={() => toggle('progression')} count={progression.levels.length}>
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

      {/* Education & Certifications — uses Norway programmes + professional certs */}
      <CollapsibleSection
        title="Education & Certifications"
        icon={GraduationCap}
        accent="text-violet-400"
        isOpen={openSection === 'courses'}
        onToggle={() => toggle('courses')}
      >
        {(() => {
          const eduData = getNorwayProgrammes(career.id, career.title);
          if (eduData) {
            return (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground/40 leading-relaxed">{eduData.summary}</p>
                <div className="rounded-lg border border-border/20 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/20 bg-muted/10">
                        <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Programme</th>
                        <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Institution</th>
                        <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">City</th>
                        <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Duration</th>
                        <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Apply via</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {eduData.programmes.map((prog, i) => (
                        <tr key={i} className="group hover:bg-muted/5 transition-colors">
                          <td className="px-3 py-2"><a href={prog.url} target="_blank" rel="noopener noreferrer" className="text-foreground/75 hover:text-foreground font-medium">{prog.programme}</a></td>
                          <td className="px-3 py-2 text-muted-foreground/50">{prog.institution}</td>
                          <td className="px-3 py-2 text-muted-foreground/50">{prog.city}</td>
                          <td className="px-3 py-2 text-muted-foreground/50">{prog.duration}</td>
                          <td className="px-3 py-2 text-muted-foreground/40">{prog.applicationVia}</td>
                          <td className="px-2 py-2"><a href={prog.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 text-muted-foreground/15 group-hover:text-violet-400/50" /></a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {eduData.alternativePaths && eduData.alternativePaths.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[10px] text-muted-foreground/35 mb-1">Other routes in:</p>
                    {eduData.alternativePaths.map((alt, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground/45 leading-relaxed">· {alt}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          // Professional certifications fallback
          const certPath = getCertificationPath(career.id, career.title);
          if (certPath) {
            return (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground/40 leading-relaxed">{certPath.summary}</p>
                <div className="rounded-lg border border-border/20 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/20 bg-muted/10">
                        <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Certification</th>
                        <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Provider</th>
                        <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Duration</th>
                        <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Cost</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {certPath.certifications.map((cert, i) => (
                        <tr key={i} className="group hover:bg-muted/5 transition-colors">
                          <td className="px-3 py-2">
                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-foreground/75 hover:text-foreground font-medium">{cert.name}</a>
                            <p className="text-[9px] text-muted-foreground/30 mt-0.5">{cert.recognised}</p>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground/50">{cert.provider}</td>
                          <td className="px-3 py-2 text-muted-foreground/50">{cert.duration}</td>
                          <td className="px-3 py-2 text-muted-foreground/50">{cert.cost}</td>
                          <td className="px-2 py-2"><a href={cert.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 text-muted-foreground/15 group-hover:text-violet-400/50" /></a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {certPath.recommendedDegrees && certPath.recommendedDegrees.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[10px] text-muted-foreground/35 mb-1">Recommended degree backgrounds:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {certPath.recommendedDegrees.map((deg, i) => (
                        <span key={i} className="inline-flex rounded-md border border-border/15 bg-background/20 px-2 py-0.5 text-[10px] text-muted-foreground/45">{deg}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }
          // Generic fallback
          return (
            <div className="space-y-2">
              <p className="text-sm text-foreground/70">{career.educationPath}</p>
              {details?.entryPaths && details.entryPaths.length > 0 && (
                <div className="space-y-1">
                  {details.entryPaths.map((path, i) => (
                    <p key={i} className="text-xs text-muted-foreground/50">· {path}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </CollapsibleSection>

      {/* Tools of the Trade */}
      {details?.typicalDay.tools && details.typicalDay.tools.length > 0 && (
        <CollapsibleSection title="Tools of the Trade" icon={Wrench} accent="text-slate-400" isOpen={openSection === 'tools'} onToggle={() => toggle('tools')} count={details.typicalDay.tools.length}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {details.typicalDay.tools.map((tool, i) => (
              <a
                key={i}
                href={`https://www.google.com/search?q=${encodeURIComponent(tool)}&udm=2`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 rounded-lg border border-border/20 bg-background/30 px-3.5 py-2.5 hover:border-border/40 hover:bg-background/50 transition-colors"
              >
                <Wrench className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/50 shrink-0" />
                <span className="text-[13px] text-foreground/65 group-hover:text-foreground/80 flex-1">{tool}</span>
                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/15 group-hover:text-muted-foreground/40 shrink-0" />
              </a>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Your Notes */}
      <CareerNotes careerTitle={goalTitle} />

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

function CareerNotes({ careerTitle }: { careerTitle: string }) {
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
      <SectionHeader icon={Pencil} title="Your Notes" badge={notes.length > 0 ? <span className="text-[10px] text-muted-foreground/40">{notes.length}</span> : undefined} />
      <div className="px-4 pb-3">
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
      </div>
    </SectionCard>
  );
}

// ─── GROW TAB ────────────────────────────────────────────────────────────────

function GrowTab({ goalTitle, career }: { goalTitle: string | null; career: Career | null }) {
  const { data: detailsData } = useCareerDetails(career?.id ?? null);
  const { data: storiesData } = useCareerStories(career?.id ?? null);
  const details = detailsData?.details ?? null;
  const careerStories = storiesData?.stories ?? [];

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

  // Grow accordion — only one section open at a time
  const [growSection, setGrowSection] = useState<string | null>('actions');
  const toggleGrow = (id: string) => setGrowSection(prev => prev === id ? null : id);

  // Build a contextual career consideration summary
  const careerConsideration = useMemo(() => {
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

  return (
    <div className="space-y-5">
      {/* Career overview — side by side cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Before you start */}
        <div
          className="rounded-xl border overflow-hidden p-5"
          style={{
            borderColor: 'rgba(245,158,11,0.2)',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-foreground/85">Before you start</p>
          </div>
          <p className="text-[13px] text-foreground/55 leading-relaxed">{careerConsideration}</p>
          {details?.realityCheck && (
            <p className="text-[11px] text-muted-foreground/35 mt-3 italic leading-relaxed border-t border-amber-500/10 pt-3">{details.realityCheck}</p>
          )}
        </div>

        {/* Where you stand */}
        <div
          className="rounded-xl border overflow-hidden p-5"
          style={{
            borderColor: 'rgba(20,184,166,0.2)',
            background: 'linear-gradient(135deg, rgba(20,184,166,0.06) 0%, transparent 60%)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
              <Target className="h-4 w-4 text-teal-400" />
            </div>
            <p className="text-sm font-semibold text-foreground/85">Where you stand</p>
          </div>
          <p className="text-[13px] text-foreground/55 leading-relaxed">
            {career.growthOutlook === 'high'
              ? `${career.title} is a high-demand field with strong long-term prospects. Exploring this now — before committing to ${career.educationPath.split('(')[0].trim()} — gives you a real advantage.`
              : career.growthOutlook === 'medium'
              ? `This is a growing field with solid career paths. The skills you build — ${topSkills.slice(0, 2).join(' and ')} — are transferable even if you change direction later.`
              : `${career.title} is a stable career with clear pathways. Building strength in ${topSkills.slice(0, 2).join(' and ')} now gives you a strong foundation.`
            }
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-teal-500/10">
            <span className={cn(
              'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
              career.growthOutlook === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
              career.growthOutlook === 'medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-muted/30 text-muted-foreground/50',
            )}>
              {career.growthOutlook === 'high' ? 'High demand' : career.growthOutlook === 'medium' ? 'Growing' : 'Stable'}
            </span>
            <span className="text-[10px] text-muted-foreground/30">{career.avgSalary}</span>
          </div>
        </div>
      </div>

      {/* 1. Real career path examples */}
      {(() => {
        const paths = getCareerPathExamples(career.id, career.title);
        if (paths.length === 0) {
          // Fallback — show a generic progression from the career data
          if (!details?.entryPaths?.length) return null;
          return (
            <CollapsibleSection title="Typical Career Path" icon={Users} accent="text-emerald-400" isOpen={growSection === 'paths'} onToggle={() => toggleGrow('paths')}>
              <p className="text-[11px] text-muted-foreground/40 mb-3">A typical progression for {career.title} in Norway</p>
              <div className="rounded-lg border border-border/20 bg-background/20 p-3.5">
                <div className="relative">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/30 via-emerald-500/15 to-transparent" />
                  <div className="space-y-2">
                    {details.entryPaths.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 relative">
                        <div className="relative z-10 h-[11px] w-[11px] rounded-full border-2 border-emerald-500/30 bg-background shrink-0 mt-1" />
                        <span className="text-[11px] text-foreground/60">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          );
        }
        return (
          <CollapsibleSection title="Real Career Paths" icon={Users} accent="text-emerald-400" isOpen={growSection === 'paths'} onToggle={() => toggleGrow('paths')}>
            <p className="text-[11px] text-muted-foreground/40 mb-3">Based on typical career journeys in Norway</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paths.slice(0, 2).map((path, pi) => (
                <div key={pi} className="rounded-lg border border-border/20 bg-background/20 p-3.5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground/75">{path.name}</p>
                      <p className="text-[10px] text-muted-foreground/40">{path.title} · Age {path.currentAge}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/30 via-emerald-500/15 to-transparent" />
                    <div className="space-y-1.5">
                      {path.steps.map((step, si) => (
                        <div key={si} className="flex items-start gap-3 relative">
                          <div className="relative z-10 h-[11px] w-[11px] rounded-full border-2 border-emerald-500/30 bg-background shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-emerald-400/60 mr-1.5">{step.age}</span>
                            <span className="text-[11px] text-foreground/60">{step.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* 3. From the Field — real professional stories */}
      {careerStories.length > 0 && (
        <CollapsibleSection title="From the Field" icon={Video} accent="text-rose-400" isOpen={growSection === 'stories'} onToggle={() => toggleGrow('stories')} count={careerStories.length}>
          <p className="text-[11px] text-muted-foreground/40 mb-3">Real professionals share their journey, challenges, and advice</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {careerStories.slice(0, 2).map((story) => (
              <div key={story.id} className="rounded-lg border border-border/20 bg-background/20 overflow-hidden">
                {/* Video embed */}
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${story.videoId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={story.headline}
                  />
                </div>
                {/* Info */}
                <div className="p-3.5">
                  <p className="text-xs font-semibold text-foreground/80 mb-1">{story.headline}</p>
                  <p className="text-[11px] text-muted-foreground/45">
                    {story.name} — {story.jobTitle}
                    {story.company ? ` at ${story.company}` : ''}
                    {story.yearsInRole ? ` · ${story.yearsInRole} years` : ''}
                  </p>
                  {story.takeaways.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {story.takeaways.map((t, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-rose-400/40 mt-1.5 shrink-0" />
                          <p className="text-[10px] text-muted-foreground/40 leading-relaxed">{t}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

          {/* 4. Career events — link to in-app page */}
          <a href="/career-events"
            className="group block rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-4 hover:bg-amber-500/[0.06] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground/85">Browse career events & open days</p>
                <p className="text-[11px] text-muted-foreground/40">Find upcoming events, webinars, and open days relevant to your career goals</p>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-400/30 group-hover:text-amber-400/60 shrink-0" />
            </div>
          </a>

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
