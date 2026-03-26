'use client';

/**
 * JOURNEY V2 PROTOTYPE — Built on Real Implementation
 *
 * Uses real career data, real journey state, real components.
 * Tests the redesigned flow:
 *   Discover = Explore the career (browse, watch, see data, entry criteria)
 *   Understand = Full career summary report (pre-populated, one notes area)
 *   Grow = Roadmap with recommended actions pinned on it
 *
 * Navigate to /test/journey-v2 to preview.
 */

import { useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Globe, Rocket, CheckCircle2, Play, Users, TrendingUp,
  ArrowRight, BookOpen, Briefcase, GraduationCap, Pencil,
  Clock, Zap, Eye, ExternalLink, ChevronDown, ChevronUp,
  Target, Lock, FileText, Sparkles, Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoals } from '@/hooks/use-goals';
import { getAllCareers, type Career } from '@/lib/career-pathways';
import { STAGE_CONFIG } from '@/lib/journey/career-journey-types';
import type { JourneyUIState } from '@/lib/journey/types';

const PersonalCareerTimeline = dynamic(
  () => import('@/components/journey').then((m) => m.PersonalCareerTimeline),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const GoalSelectionSheet = dynamic(
  () => import('@/components/goals/GoalSelectionSheet').then((m) => m.GoalSelectionSheet),
  { ssr: false }
);

// ============================================
// YOUTUBE VIDEO HOOK — searches via API
// ============================================

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
    staleTime: 24 * 60 * 60 * 1000, // 24h cache
  });
}

// ============================================
// TYPES
// ============================================

type V2Tab = 'discover' | 'understand' | 'grow';

// ============================================
// DISCOVER TAB — Explore the Career
// ============================================

function V2DiscoverTab({
  career,
  goalTitle,
  onContinue,
}: {
  career: Career | null;
  goalTitle: string | null;
  onContinue: () => void;
}) {
  const [viewedSections, setViewedSections] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { data: ytData } = useYouTubeVideo(goalTitle);
  const videoId = ytData?.videoId ?? null;

  const markViewed = (id: string) => {
    setViewedSections((prev) => new Set(prev).add(id));
  };

  if (!career || !goalTitle) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 p-10 text-center">
        <Target className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground/60">Set a career goal to start exploring</p>
        <p className="text-xs text-muted-foreground/40 mt-1">Head to the real My Journey page to set your primary goal</p>
      </div>
    );
  }

  const sections = [
    {
      id: 'day-in-life',
      icon: Play,
      title: 'A Day in the Life',
      subtitle: `See what ${career.title}s actually do`,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      content: (
        <div>
          {videoId ? (
            <div className="rounded-lg overflow-hidden border border-border/30">
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
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/15 px-2.5 py-3 hover:bg-red-500/10 transition-all"
            >
              <div className="h-7 w-7 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                <Play className="h-3 w-3 text-red-400" />
              </div>
              <p className="text-[10px] font-medium text-foreground/70 flex-1">Loading video...</p>
            </a>
          )}
        </div>
      ),
    },
    {
      id: 'salary-growth',
      icon: TrendingUp,
      title: 'Salary & Growth',
      subtitle: 'What you\'d earn and where the field is heading',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      content: (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-2">
              <p className="text-[9px] font-medium text-emerald-500/60">Salary</p>
              <p className="text-sm font-bold text-emerald-400">{career.avgSalary}</p>
            </div>
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-2">
              <p className="text-[9px] font-medium text-emerald-500/60">Growth</p>
              <p className="text-sm font-bold text-emerald-400 capitalize">{career.growthOutlook}</p>
            </div>
          </div>
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 p-2">
            <p className="text-[9px] font-medium text-blue-400/60">Education Path</p>
            <p className="text-[11px] font-medium text-foreground/80">{career.educationPath}</p>
          </div>
          {career.entryLevel ? (
            <p className="text-[10px] text-teal-400 font-medium">No certifications required — entry-level accessible</p>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-muted-foreground/40">Certifications:</span>
              {[
                { label: 'Coursera', url: `https://www.coursera.org/search?query=${encodeURIComponent(career.title)}` },
                { label: 'Vilbli.no', url: `https://www.vilbli.no/?Ession=SO&Sok=${encodeURIComponent(career.title)}` },
                { label: 'edX', url: `https://www.edx.org/search?q=${encodeURIComponent(career.title)}` },
              ].map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed line-clamp-2">{career.description}</p>
        </div>
      ),
    },
    {
      id: 'skills-entry',
      icon: Zap,
      title: 'Key Skills & Entry Criteria',
      subtitle: 'What you need to get started',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      content: (
        <div className="flex flex-wrap gap-1">
          {career.keySkills.map((skill) => (
            <span key={skill} className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400">
              {skill}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500/60">Discover</p>
          <p className="text-xs text-muted-foreground/50 mt-0.5">Explore what {goalTitle} involves</p>
        </div>
        <span className="text-[10px] text-muted-foreground/30">{viewedSections.size}/{sections.length} explored</span>
      </div>

      {/* Bento grid — video left, info right */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {/* Left: Day in the Life — spans 2 cols */}
        <div className="sm:col-span-2 rounded-2xl border border-red-500/20 bg-gradient-to-b from-card/80 to-card/60 overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10">
              <Play className="h-3.5 w-3.5 text-red-400" />
            </div>
            <p className="text-xs font-semibold">A Day in the Life</p>
          </div>
          <div className="px-3 pb-3">
            {sections[0].content}
          </div>
        </div>

        {/* Right column — spans 3 cols, stacks salary + skills */}
        <div className="sm:col-span-3 flex flex-col gap-3">
          {/* Salary, Growth & Path */}
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-card/80 to-card/60 overflow-hidden flex-1">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <p className="text-xs font-semibold">Salary, Growth & Path</p>
            </div>
            <div className="px-3 pb-3 border-t border-border/15 pt-2.5 text-[11px]">
              {sections[1].content}
            </div>
          </div>

          {/* Key Skills */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-card/80 to-card/60 overflow-hidden">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <p className="text-xs font-semibold">Key Skills</p>
            </div>
            <div className="px-3 pb-3 border-t border-border/15 pt-2.5 text-[11px]">
              {sections[2].content}
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Preview — the payoff */}
      <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.03] p-3 overflow-hidden">
        <p className="text-[10px] font-medium text-teal-500/60 mb-2">Your roadmap preview</p>
        <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
      </div>

      {/* Continue */}
      {viewedSections.size >= 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-2">
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
          >
            I&apos;ve explored this career <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// UNDERSTAND TAB — Career Summary Report
// ============================================

function V2UnderstandTab({
  career,
  goalTitle,
  journey,
  onContinue,
}: {
  career: Career | null;
  goalTitle: string | null;
  journey: JourneyUIState | null;
  onContinue: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  if (!career || !goalTitle) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 p-10 text-center">
        <Globe className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground/60">Complete Discover first</p>
      </div>
    );
  }

  const summary = journey?.summary;
  const roleNotes = (summary?.roleRealityNotes as string[]) || [];
  const industryNotes = (summary?.industryInsightNotes as string[]) || [];
  const qualifications = (summary?.pathQualifications as string[]) || [];
  const skills = (summary?.pathSkills as string[]) || [];
  const courses = (summary?.pathCourses as string[]) || [];
  const requirements = (summary?.pathRequirements as string[]) || [];

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/60">Understand</p>
        <p className="text-xs text-muted-foreground/50 mt-0.5">Your career brief for {goalTitle}</p>
      </div>

      {/* Career Report */}
      <div className="rounded-2xl border border-emerald-500/20 bg-card/70 overflow-hidden">
        {/* Report header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 px-6 py-4 border-b border-emerald-500/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{career.emoji}</span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{career.title}</h3>
              <p className="text-xs text-muted-foreground/60">{career.description}</p>
            </div>
          </div>
        </div>

        {/* Report body */}
        <div className="p-6 space-y-6">
          {/* Role Reality */}
          <ReportSection
            title="Role Reality"
            icon={Eye}
            items={roleNotes.length > 0 ? roleNotes : career.dailyTasks}
            emptyText="What the job involves day to day"
          />

          {/* Education & Qualifications */}
          <ReportSection
            title="Education & Qualifications"
            icon={GraduationCap}
            items={qualifications.length > 0 ? qualifications : [career.educationPath]}
            emptyText="Required education path"
          />

          {/* Key Skills */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <p className="text-xs font-semibold text-foreground/80">Key Skills</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(skills.length > 0 ? skills : career.keySkills).map((skill) => (
                <span key={skill} className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium bg-amber-500/10 text-amber-400">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Courses & Certifications */}
          {(courses.length > 0 || career.educationPath) && (
            <ReportSection
              title="Courses & Certifications"
              icon={BookOpen}
              items={courses.length > 0 ? courses : [career.educationPath]}
              emptyText="Relevant courses and programmes"
            />
          )}

          {/* Entry Requirements */}
          {(requirements.length > 0 || career.entryLevel) && (
            <ReportSection
              title="Entry Requirements"
              icon={Target}
              items={requirements.length > 0 ? requirements : (career.entryLevel ? ['Entry-level accessible — no higher education required'] : [])}
              emptyText="What you need to get started"
            />
          )}

          {/* Industry Outlook */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-xs font-semibold text-foreground/80">Industry Outlook</p>
            </div>
            {industryNotes.length > 0 ? (
              <ul className="space-y-1">
                {industryNotes.map((note, i) => (
                  <li key={i} className="text-xs text-muted-foreground/70 flex items-start gap-2">
                    <span className="h-1 w-1 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                <span className={cn(
                  'inline-flex rounded-full px-2.5 py-1 font-medium',
                  career.growthOutlook === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
                  career.growthOutlook === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-muted/30 text-muted-foreground/60'
                )}>
                  {career.growthOutlook === 'high' ? 'High demand' : career.growthOutlook === 'medium' ? 'Growing' : 'Stable'} outlook
                </span>
                <span>Average salary: {career.avgSalary}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/30" />

          {/* Your Notes — single input area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Pencil className="h-3.5 w-3.5 text-muted-foreground/50" />
                <p className="text-xs font-semibold text-foreground/80">Your Notes</p>
              </div>
              {notesSaved && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Saved
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add anything you've found — reflections, links, research notes, things that surprised you..."
              className="w-full rounded-lg border border-border/30 bg-background/50 px-3 py-2.5 text-xs text-foreground/80 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none"
              rows={4}
              maxLength={2000}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <Save className="h-3 w-3" /> Save notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Continue */}
      <div className="flex justify-center">
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
        >
          I understand this career <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ReportSection({
  title,
  icon: Icon,
  items,
  emptyText,
}: {
  title: string;
  icon: typeof Eye;
  items: string[];
  emptyText: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5 text-emerald-400" />
        <p className="text-xs font-semibold text-foreground/80">{title}</p>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-muted-foreground/70 flex items-start gap-2">
              <span className="h-1 w-1 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground/30 italic">{emptyText}</p>
      )}
    </div>
  );
}

// ============================================
// GROW TAB — Roadmap with Recommended Actions
// ============================================

function V2GrowTab({
  goalTitle,
  career,
}: {
  goalTitle: string | null;
  career: Career | null;
}) {
  if (!goalTitle || !career) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 p-10 text-center">
        <Rocket className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground/60">Complete Discover and Understand first</p>
      </div>
    );
  }

  // Generate recommended actions based on career
  const recommendedActions = useMemo(() => [
    {
      title: `Research ${career.educationPath.split('(')[0].trim()} programmes`,
      type: 'Research',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: `Watch 3 more Day in the Life videos for ${career.title}`,
      type: 'Explore',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      title: `Talk to someone who works as a ${career.title}`,
      type: 'Connect',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ], [career]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60">Grow</p>
        <p className="text-xs text-muted-foreground/50 mt-0.5">Your path forward as a {goalTitle}</p>
      </div>

      {/* Recommended next actions */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
        <p className="text-xs font-semibold text-amber-400 mb-3">Recommended next steps</p>
        <div className="space-y-2">
          {recommendedActions.map((action, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/40 p-3">
              <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold', action.bg, action.color)}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/70">{action.title}</p>
              </div>
              <span className={cn('text-[9px] font-medium rounded-full px-2 py-0.5', action.bg, action.color)}>
                {action.type}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-3 text-center">
          These are suggestions, not homework. Do them when you&apos;re ready — or not at all.
        </p>
      </div>

      {/* Career Roadmap */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Rocket className="h-4 w-4 text-amber-400" />
            Your Career Roadmap
          </h3>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-1 overflow-hidden">
          <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function JourneyV2Prototype() {
  const { data: session } = useSession();
  const isYouth = session?.user?.role === 'YOUTH';
  const { data: goalsData } = useGoals(isYouth);
  const goalTitle = goalsData?.primaryGoal?.title ?? null;

  // Fetch real journey state
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

  const journey = journeyData?.journey ?? null;

  // Look up real career data
  const career = useMemo(() => {
    if (!goalTitle) return null;
    return getAllCareers().find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  const [activeTab, setActiveTab] = useState<V2Tab>('discover');
  const [goalSheetOpen, setGoalSheetOpen] = useState(false);

  const tabs: { id: V2Tab; label: string; subtitle: string; icon: typeof Search; color: string; colorHex: string }[] = [
    { id: 'discover', label: 'Discover', subtitle: 'Explore the Career', icon: Search, color: 'teal', colorHex: '#14b8a6' },
    { id: 'understand', label: 'Understand', subtitle: 'Know the Role', icon: Globe, color: 'emerald', colorHex: '#10b981' },
    { id: 'grow', label: 'Grow', subtitle: 'Your Roadmap', icon: Rocket, color: 'amber', colorHex: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 bg-amber-500/10 px-2 py-0.5 rounded-full">V2 Prototype</span>
              <Link href="/my-journey" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                Back to current journey
              </Link>
            </div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {goalTitle ? (
                <>
                  <span className="text-muted-foreground/50">My Journey to </span>
                  <span className="text-foreground">{goalTitle}</span>
                  <button
                    onClick={() => setGoalSheetOpen(true)}
                    className="p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
                    title="Change goal"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setGoalSheetOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
                >
                  <Target className="h-4 w-4" /> Set a career goal
                </button>
              )}
            </h1>
          </div>
        </div>

        {/* Tab bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative rounded-xl border p-3 sm:p-4 text-left transition-all',
                  isActive && 'ring-1',
                  !isActive && 'border-border/50 hover:border-border/80 hover:bg-muted/30',
                )}
                style={isActive ? {
                  borderColor: `${tab.colorHex}60`,
                  backgroundColor: `${tab.colorHex}08`,
                  boxShadow: `0 0 15px ${tab.colorHex}20`,
                  // ring color
                } : undefined}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TabIcon className="h-4 w-4" style={isActive ? { color: tab.colorHex } : { color: 'var(--muted-foreground)' }} />
                  <span className={cn('text-sm font-semibold', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                    {tab.label}
                  </span>
                </div>
                <p className={cn('text-[11px]', isActive ? 'text-foreground/60' : 'text-muted-foreground/40')}>
                  {tab.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'discover' && (
              <V2DiscoverTab
                career={career}
                goalTitle={goalTitle}
                onContinue={() => setActiveTab('understand')}
              />
            )}
            {activeTab === 'understand' && (
              <V2UnderstandTab
                career={career}
                goalTitle={goalTitle}
                journey={journey}
                onContinue={() => setActiveTab('grow')}
              />
            )}
            {activeTab === 'grow' && (
              <V2GrowTab
                goalTitle={goalTitle}
                career={career}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="border-t border-border/20 mt-12 pt-4 text-center">
          <p className="text-[10px] text-muted-foreground/30">
            V2 Prototype — uses your real career goal and journey data. Notes are not saved to the database.
          </p>
        </div>
      </div>

      {/* Goal Selection Sheet — real component */}
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
