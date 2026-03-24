'use client';

/**
 * MY JOURNEY PAGE
 *
 * Redesigned layout: clean header, stage-aware tab bar with progress
 * indicators and lock states, no goal swap clutter.
 *
 * Stages: Discover → Understand → Grow (sequential, gated)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Lock,
  Search,
  Globe,
  Rocket,
  Target,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { useGoals } from '@/hooks/use-goals';
import { DiscoverCompleteModal } from '@/components/journey/discover-complete-modal';
import { UnderstandCompleteModal } from '@/components/journey/understand-complete-modal';
import { CareerDetailSheet } from '@/components/career-detail-sheet';
import { getAllCareers } from '@/lib/career-pathways';
import { HelpCircle, Info, X } from 'lucide-react';

const StepContent = dynamic(
  () => import('@/components/journey/step-content').then((m) => m.StepContent),
  { ssr: false }
);
const GoalSelectionSheet = dynamic(
  () => import('@/components/goals/GoalSelectionSheet').then((m) => m.GoalSelectionSheet),
  { ssr: false }
);
const DiscoverTab = dynamic(
  () => import('@/components/journey/tabs/discover-tab').then((m) => m.DiscoverTab),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const UnderstandTab = dynamic(
  () => import('@/components/journey/tabs/understand-tab').then((m) => m.UnderstandTab),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const ActTab = dynamic(
  () => import('@/components/journey/tabs/act-tab').then((m) => m.ActTab),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);

import type {
  JourneyUIState,
  JourneyStateId,
  JourneyStepStatus,
  StepCompletionData,
  StateConfig,
  LensProgress,
} from '@/lib/journey/types';
import type { CareerGoal } from '@/lib/goals/types';
import { JOURNEY_STATE_CONFIG } from '@/lib/journey/types';

// ============================================
// DEMO JOURNEY (fallback)
// ============================================

const DEMO_JOURNEY: JourneyUIState = {
  currentLens: 'DISCOVER',
  currentState: 'ROLE_DEEP_DIVE',
  completedSteps: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'],
  skippedSteps: {} as Record<JourneyStateId, never>,
  canAdvanceToNextLens: false,
  nextStepReason: 'Complete a deep dive into a role you\'re interested in.',
  steps: (Object.values(JOURNEY_STATE_CONFIG) as StateConfig[])
    .sort((a, b) => a.order - b.order)
    .map((config) => {
      const completed: JourneyStateId[] = ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'];
      const current: JourneyStateId = 'ROLE_DEEP_DIVE';
      let status: JourneyStepStatus = 'locked';
      if (completed.includes(config.id)) status = 'completed';
      else if (config.id === current) status = 'next';
      return {
        id: config.id,
        title: config.title,
        description: config.description,
        status,
        order: config.order,
        artifacts: [],
        mandatory: config.mandatory,
        optional: !config.mandatory,
        stepNumber: config.stepNumber,
      };
    }),
  summary: {
    lenses: {
      discover: { progress: 67, completedMandatory: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'], completedOptional: [], totalMandatory: 3, totalOptional: 0, isComplete: false },
      understand: { progress: 0, completedMandatory: [], completedOptional: [], totalMandatory: 3, totalOptional: 0, isComplete: false },
      act: { progress: 0, completedMandatory: [], completedOptional: [], totalMandatory: 2, totalOptional: 2, isComplete: false },
    },
    overallProgress: 22,
    primaryGoal: { title: null, selectedAt: null },
    strengths: ['Communication', 'Problem Solving', 'Teamwork'],
    demonstratedSkills: [],
    careerInterests: ['Software Development'],
    exploredRoles: [{ title: 'Junior Software Developer', exploredAt: new Date().toISOString(), educationPaths: ['Computer Science degree', 'Coding bootcamp'], certifications: [], companies: [], humanSkills: ['Communication', 'Collaboration'], entryExpectations: 'Entry-level, some coding experience preferred.' }],
    rolePlans: [],
    certificationsRequired: [],
    companiesOfInterest: [],
    futureOutlookNotes: [],
    roleRealityNotes: [],
    industryInsightNotes: [],
    pathQualifications: [],
    pathSkills: [],
    pathCourses: [],
    pathRequirements: [],
    nextActions: [],
    alignedActions: [],
    alignedActionsCount: 0,
    alignedActionReflections: [],
    savedSummary: { total: 0, byType: { articles: 0, videos: 0, podcasts: 0, shorts: 0 } },
    recentSavedItems: [],
    timelineSummary: { totalEvents: 2, thisMonth: 1 },
    lastTimelineEventAt: new Date().toISOString(),
    shadowSummary: { total: 0, accepted: 0, skipped: false, skipReason: null, pending: 0, completed: 0, declined: 0, lastUpdatedAt: null },
    reflectionSummary: { total: 0, thisMonth: 0, lastReflectionAt: null },
    industryInsightsSummary: { trendsReviewed: 0, insightsSaved: 0, lastReviewedAt: null },
    requirementsReviewed: false,
    planCreated: false,
    planUpdatedAt: null,
    planChangeReason: null,
    externalFeedback: [],
  },
};

// ============================================
// TAB CONFIGURATION
// ============================================

type JourneyTab = 'discover' | 'understand' | 'act';

interface TabDef {
  id: JourneyTab;
  label: string;
  subtitle: string;
  items: string[];
  icon: typeof Search;
  lensKey: 'discover' | 'understand' | 'act';
  color: string;
  activeRing: string;
  activeBg: string;
  progressBg: string;
  progressFill: string;
}

const TABS: TabDef[] = [
  {
    id: 'discover',
    label: 'Discover',
    subtitle: '',
    items: ['Reflect on your strengths', 'Explore career interests', 'Know yourself better'],
    icon: Search,
    lensKey: 'discover',
    color: 'teal',
    activeRing: 'ring-teal-500/60',
    activeBg: 'bg-teal-500/10',
    progressBg: 'bg-teal-500/15',
    progressFill: 'bg-teal-500',
  },
  {
    id: 'understand',
    label: 'Understand',
    subtitle: 'Know the World',
    items: ['Role reality & industry insights', 'Path, skills & requirements', 'Validate your understanding'],
    icon: Globe,
    lensKey: 'understand',
    color: 'emerald',
    activeRing: 'ring-emerald-500/60',
    activeBg: 'bg-emerald-500/10',
    progressBg: 'bg-emerald-500/15',
    progressFill: 'bg-emerald-500',
  },
  {
    id: 'act',
    label: 'Grow',
    subtitle: 'Take Action & Grow',
    items: ['Complete real-world actions', 'Reflect on what you\'ve learned', 'Career roadmap'],
    icon: Rocket,
    lensKey: 'act',
    color: 'amber',
    activeRing: 'ring-amber-500/60',
    activeBg: 'bg-amber-500/10',
    progressBg: 'bg-amber-500/15',
    progressFill: 'bg-amber-500',
  },
];

// ============================================
// STAGE TAB BAR
// ============================================

function StageTabBar({
  activeTab,
  onTabChange,
  lenses,
  discoverComplete,
}: {
  activeTab: JourneyTab;
  onTabChange: (tab: JourneyTab) => void;
  lenses: { discover: LensProgress; understand: LensProgress; act: LensProgress };
  discoverComplete: boolean;
}) {
  const isLocked = (tab: TabDef): boolean => {
    if (tab.id === 'discover') return false;
    if (tab.id === 'understand') return !discoverComplete;
    if (tab.id === 'act') return !lenses.understand.isComplete;
    return false;
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {TABS.map((tab, i) => {
        const TabIcon = tab.icon;
        const isActive = activeTab === tab.id;
        const locked = isLocked(tab);
        const progress = lenses[tab.lensKey];
        // Override Discover completion/progress with client-side check
        const isComplete = tab.id === 'discover' ? discoverComplete : progress.isComplete;
        const displayProgress = tab.id === 'discover' && discoverComplete ? 100 : progress.progress;

        return (
          <button
            key={tab.id}
            onClick={() => !locked && onTabChange(tab.id)}
            disabled={locked}
            className={cn(
              'relative rounded-xl border p-3 sm:p-4 text-left transition-all',
              isActive && `${tab.activeBg} border-${tab.color}-500/40 ring-1 ${tab.activeRing}`,
              !isActive && !locked && 'border-border/50 hover:border-border/80 hover:bg-muted/30',
              locked && 'border-border/20 opacity-40 cursor-not-allowed',
            )}
            style={isActive ? {
              boxShadow: tab.id === 'discover'
                ? '0 0 20px rgba(20, 184, 166, 0.25), 0 0 40px rgba(20, 184, 166, 0.1)'
                : tab.id === 'understand'
                  ? '0 0 15px rgba(16, 185, 129, 0.2)'
                  : '0 0 15px rgba(245, 158, 11, 0.2)',
            } : undefined}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle2 className={cn('h-4 w-4 sm:h-5 sm:w-5', `text-${tab.color}-500`)} />
                ) : locked ? (
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50" />
                ) : (
                  <TabIcon className={cn('h-4 w-4 sm:h-5 sm:w-5', isActive ? `text-${tab.color}-500` : 'text-muted-foreground')} />
                )}
                <span className={cn(
                  'text-sm sm:text-base font-semibold',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                  locked && 'text-muted-foreground/50',
                )}>
                  {tab.label}
                </span>
              </div>
              {!locked && displayProgress > 0 && (
                <span className={cn('text-[10px] sm:text-xs font-semibold', `text-${tab.color}-500`)}>
                  {displayProgress}%
                </span>
              )}
            </div>

            {/* Subtitle */}
            <p className={cn(
              'text-[10px] sm:text-xs',
              isActive ? `text-${tab.color}-500/70` : 'text-muted-foreground/60',
              locked && 'text-muted-foreground/30',
            )}>
              {tab.subtitle}
            </p>

            {/* Framework items */}
            {isActive && (
              <ul className="mt-2 space-y-1">
                {tab.items.map((item) => (
                  <li key={item} className={cn('text-[10px] sm:text-[11px] flex items-center gap-2', `text-${tab.color}-500/70`)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', `bg-${tab.color}-500`)} />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Progress bar */}
            <div className="mt-2 sm:mt-3">
              {!locked ? (
                <div className={cn('h-1 rounded-full', tab.progressBg)}>
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', tab.progressFill)}
                    style={{ width: `${displayProgress}%` }}
                  />
                </div>
              ) : (
                <div className="h-1 rounded-full bg-muted/30" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function MyJourneyPage() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<JourneyTab>('discover');
  const [activeStepId, setActiveStepId] = useState<JourneyStateId | null>(null);
  const [goalSheetOpen, setGoalSheetOpen] = useState(false);
  const [showGoalChangeWarning, setShowGoalChangeWarning] = useState(false);
  const [showDiscoverCelebration, setShowDiscoverCelebration] = useState(false);
  const [showUnderstandCelebration, setShowUnderstandCelebration] = useState(false);
  const [showCareerDetail, setShowCareerDetail] = useState(false);
  const [goalBannerDismissed, setGoalBannerDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('journey-goal-banner-dismissed') === 'true';
    }
    return false;
  });

  const isYouth = session?.user?.role === 'YOUTH';
  const { data: goalsData } = useGoals(isYouth);
  const primaryGoal = goalsData?.primaryGoal ?? null;
  const secondaryGoal = goalsData?.secondaryGoal ?? null;

  const {
    data: journeyData,
    isLoading: journeyLoading,
  } = useQuery<{ success: boolean; journey: JourneyUIState }>({
    queryKey: ['journey-state'],
    queryFn: async () => {
      const response = await fetch('/api/journey');
      if (!response.ok) throw new Error('Failed to fetch journey state');
      return response.json();
    },
    enabled: isYouth,
  });

  // Fetch reflections directly for Discover completion check
  const { data: reflectionsData } = useQuery<{ discoverReflections: { motivations?: string[]; workStyle?: string[]; growthAreas?: string[]; roleModels?: string; experiences?: string } | null }>({
    queryKey: ['discover-reflections'],
    queryFn: async () => {
      const res = await fetch('/api/discover/reflections');
      if (!res.ok) return { discoverReflections: null };
      return res.json();
    },
    enabled: isYouth,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch goal-scoped data for "last used" timestamp
  const earlyGoalTitle = primaryGoal?.title ?? null;
  const goalSlug = earlyGoalTitle?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || null;
  const { data: goalDataResponse } = useQuery<{ goalData: { updatedAt: string; createdAt: string } | null }>({
    queryKey: ['goal-data', goalSlug],
    queryFn: async () => {
      const res = await fetch(`/api/journey/goal-data?goalId=${goalSlug}`);
      if (!res.ok) return { goalData: null };
      return res.json();
    },
    enabled: isYouth && !!goalSlug,
    staleTime: 5 * 60 * 1000,
  });
  const goalLastUsed = goalDataResponse?.goalData?.updatedAt || null;

  // Auto-migrate existing data to goal-scoped model on first load
  const migrationDone = useRef(false);
  useEffect(() => {
    if (isYouth && !migrationDone.current) {
      migrationDone.current = true;
      fetch('/api/journey/goal-data/migrate', { method: 'POST' }).catch(() => {});
    }
  }, [isYouth]);

  const completeStepMutation = useMutation({
    mutationFn: async ({ stepId, data }: { stepId: JourneyStateId; data: StepCompletionData }) => {
      const response = await fetch('/api/journey/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, data }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete step');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-state'] });
      setActiveStepId(null);
    },
    onError: (error: Error) => {
      console.error('Step completion failed:', error.message);
    },
  });

  // Save career interests without completing the step
  const saveInterestsMutation = useMutation({
    mutationFn: async (careerInterests: string[]) => {
      const response = await fetch('/api/journey/save-interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerInterests }),
      });
      if (!response.ok) throw new Error('Failed to save interests');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-state'] });
      setActiveStepId(null);
    },
  });

  const handleCompleteStep = useCallback(
    async (data: StepCompletionData) => {
      if (!activeStepId) return;
      // For EXPLORE_CAREERS, just save interests — don't complete the step yet
      if (activeStepId === 'EXPLORE_CAREERS' && data.type === 'EXPLORE_CAREERS') {
        await saveInterestsMutation.mutateAsync(data.selectedCareers);
        return;
      }
      await completeStepMutation.mutateAsync({ stepId: activeStepId, data });
    },
    [activeStepId, completeStepMutation, saveInterestsMutation]
  );

  // Confirm exploration and complete the EXPLORE_CAREERS step
  const handleConfirmExploration = useCallback(async () => {
    const interests = journeyData?.journey?.summary?.careerInterests;
    if (!interests?.length) return;
    await completeStepMutation.mutateAsync({
      stepId: 'EXPLORE_CAREERS',
      data: { type: 'EXPLORE_CAREERS', selectedCareers: interests },
    });
  }, [completeStepMutation, journeyData?.journey?.summary?.careerInterests]);

  // Auto-switch to the appropriate tab based on progress + inspirational messages
  const understandComplete = journeyData?.journey?.summary?.lenses?.understand?.isComplete ?? false;
  const celebratedRef = useRef<Set<string>>(new Set());
  // Reset celebration refs when goal changes so celebrations fire for new goals
  const prevGoalRef = useRef<string | null>(null);

  useEffect(() => {
    const currentGoal = primaryGoal?.title ?? null;
    if (prevGoalRef.current !== null && prevGoalRef.current !== currentGoal) {
      celebratedRef.current = new Set();
    }
    prevGoalRef.current = currentGoal;
  }, [primaryGoal?.title]);

  // Gate goal sheet — warn if changing an existing goal
  const currentGoalTitle = primaryGoal?.title ?? journeyData?.journey?.summary?.primaryGoal?.title ?? null;
  const handleOpenGoalSheet = useCallback(() => {
    if (currentGoalTitle) {
      setShowGoalChangeWarning(true);
    } else {
      setGoalSheetOpen(true);
    }
  }, [currentGoalTitle]);

  // Compute Discover completion client-side (bypasses orchestrator chain)
  // NOTE: Must be above early returns to keep hooks in stable order.
  const journey = journeyData?.journey ?? DEMO_JOURNEY;
  const goalTitle = primaryGoal?.title ?? journey.summary?.primaryGoal?.title ?? null;

  // Look up career data for the goal title (for the detail sheet)
  const goalCareer = useMemo(() => {
    if (!goalTitle) return null;
    return getAllCareers().find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  const discoverComplete = useMemo(() => {
    const understandOrActStates = [
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION', 'UPDATE_PLAN', 'EXTERNAL_FEEDBACK',
    ];
    if (understandOrActStates.includes(journey.currentState)) return true;

    const r = reflectionsData?.discoverReflections;
    const reflectionsDone = r
      ? (r.motivations?.length ?? 0) > 0 &&
        (r.workStyle?.length ?? 0) > 0 &&
        (r.growthAreas?.length ?? 0) > 0 &&
        (r.roleModels?.trim().length ?? 0) > 0 &&
        (r.experiences?.trim().length ?? 0) > 0
      : false;

    const steps = journey.steps || [];
    const strengthsDone = steps.find((s) => s.id === 'REFLECT_ON_STRENGTHS')?.status === 'completed';
    const careersDone = steps.find((s) => s.id === 'EXPLORE_CAREERS')?.status === 'completed';
    const directionDone = goalTitle
      ? true
      : steps.find((s) => s.id === 'ROLE_DEEP_DIVE')?.status === 'completed';

    return !!(reflectionsDone && strengthsDone && careersDone && directionDone);
  }, [journey.currentState, journey.steps, reflectionsData, goalTitle]);

  // Understand celebration — fires when Understand is complete
  useEffect(() => {
    if (understandComplete && goalTitle && !celebratedRef.current.has('understand')) {
      celebratedRef.current.add('understand');
      const seenKey = `understand-celebrated-${goalTitle}`;
      if (typeof window !== 'undefined' && !localStorage.getItem(seenKey)) {
        localStorage.setItem(seenKey, 'true');
        setShowUnderstandCelebration(true);
      } else {
        setActiveTab('act');
      }
    }
  }, [understandComplete, goalTitle]);

  // When Discover is complete: show celebration (once), then advance on continue.
  const discoverAdvanceDone = useRef(false);

  // Reset discover advance ref when goal changes
  useEffect(() => {
    discoverAdvanceDone.current = false;
  }, [primaryGoal?.title]);
  useEffect(() => {
    if (discoverAdvanceDone.current || !discoverComplete) return;
    const discoverStates = ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'];
    const stateIsStuck = journey && discoverStates.includes(journey.currentState);

    const seenKey = `discover-celebrated-${goalTitle || 'default'}`;
    const alreadySeen = typeof window !== 'undefined' && localStorage.getItem(seenKey);

    if (!alreadySeen) {
      // First time completing Discover for this goal — show the celebration modal.
      // Do NOT advance the state machine yet; that happens when they click "Continue".
      discoverAdvanceDone.current = true;
      localStorage.setItem(seenKey, 'true');
      setShowDiscoverCelebration(true);
    } else if (stateIsStuck) {
      // Already celebrated — silently advance the state machine
      discoverAdvanceDone.current = true;
      fetch('/api/journey/advance-to-understand', { method: 'POST' })
        .then(() => queryClient.invalidateQueries({ queryKey: ['journey-state'] }))
        .catch(() => {});
    }
  }, [discoverComplete, journey, goalTitle, queryClient]);

  const isLoading = sessionStatus === 'loading' || journeyLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 max-w-5xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'YOUTH') {
    return (
      <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 max-w-4xl">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">This page is only available for youth members.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 max-w-5xl">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-teal-500/10 shrink-0">
                <Target className="h-4 w-4 text-teal-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                  My Journey
                </p>
                {goalTitle ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goalCareer && setShowCareerDetail(true)}
                        className={goalCareer ? 'text-left hover:text-teal-400 transition-colors' : 'text-left'}
                        title={goalCareer ? 'View career details' : undefined}
                      >
                        <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
                          {goalTitle}
                        </h1>
                      </button>
                      <button
                        onClick={handleOpenGoalSheet}
                        className="p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
                        title="Change career goal"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                    </div>
                    {goalLastUsed && (
                      <p className="text-[10px] text-muted-foreground/35 mt-0.5">
                        Last saved {new Date(goalLastUsed).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(goalLastUsed).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                ) : (
                  <h1 className="text-base sm:text-lg font-semibold tracking-tight text-muted-foreground">
                    Start exploring at your own pace
                  </h1>
                )}
              </div>
            </div>
          </div>
          <Link
            href="/my-journey/how-it-works"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">How it works</span>
          </Link>
        </div>

        {/* Goal swap reminder — dismissible */}
        {goalTitle && !goalBannerDismissed && (
          <div className="flex items-center gap-2 rounded-lg bg-teal-500/5 border border-teal-500/15 px-3 py-2 mb-4">
            <Info className="h-3.5 w-3.5 text-teal-500 shrink-0" />
            <p className="text-[11px] text-muted-foreground/70 flex-1">
              You can change your career goal anytime — your progress is always saved per goal.
            </p>
            <button
              onClick={() => {
                setGoalBannerDismissed(true);
                localStorage.setItem('journey-goal-banner-dismissed', 'true');
              }}
              className="p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Stage Tab Bar */}
        <div className="mb-6 sm:mb-8">
          <StageTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            lenses={journey.summary.lenses}
            discoverComplete={discoverComplete}
          />
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'discover' && (
            <DiscoverTab
              journey={journey}
              goalTitle={goalTitle}
              onSetGoal={handleOpenGoalSheet}
              onStartStep={(stepId) => setActiveStepId(stepId as JourneyStateId)}
              onConfirmExploration={handleConfirmExploration}
              onContinueToUnderstand={() => setActiveTab('understand')}
            />
          )}
          {activeTab === 'understand' && (
            <UnderstandTab
              journey={journey}
              goalTitle={goalTitle}
              onStartStep={(stepId) => setActiveStepId(stepId as JourneyStateId)}
              onContinueToGrow={() => setActiveTab('act')}
              forceActive={discoverComplete}
            />
          )}
          {activeTab === 'act' && (
            <ActTab
              journey={journey}
              goalTitle={goalTitle}
              onStartStep={(stepId) => setActiveStepId(stepId as JourneyStateId)}
            />
          )}
        </div>
      </div>

      {/* Step Content Modal */}
      {activeStepId && journey && (
        <StepContent
          stepId={activeStepId}
          isOpen={!!activeStepId}
          onClose={() => setActiveStepId(null)}
          onComplete={handleCompleteStep}
          context={{
            completedJobs: journey.summary.alignedActionsCount,
            savedCareers: journey.summary.careerInterests,
            profile: undefined,
            summary: journey.summary as unknown as Record<string, unknown>,
          }}
        />
      )}

      {/* Goal Change Warning */}
      {showGoalChangeWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowGoalChangeWarning(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Change your career goal?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your progress for <strong>{goalTitle}</strong> will be saved. You can switch back anytime and pick up where you left off.
            </p>
            <div className="rounded-lg bg-muted/50 border border-border/50 p-3 mb-4 space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground/80">What happens when you switch:</p>
              <ul className="text-[11px] text-muted-foreground/60 space-y-1 ml-3">
                <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">&#10003;</span> Strengths and interests carry over to any goal</li>
                <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">&#10003;</span> Research, actions, and roadmap saved per goal</li>
                <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">&#10003;</span> Switch back to restore all previous progress</li>
              </ul>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowGoalChangeWarning(false)}>
                Keep current goal
              </Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => {
                setShowGoalChangeWarning(false);
                setGoalSheetOpen(true);
              }}>
                Change goal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Career Detail Sheet — opened by clicking goal title */}
      <CareerDetailSheet
        career={showCareerDetail ? goalCareer : null}
        onClose={() => setShowCareerDetail(false)}
      />

      {/* Discover Completion Celebration */}
      <DiscoverCompleteModal
        open={showDiscoverCelebration}
        onContinue={async () => {
          setShowDiscoverCelebration(false);
          // Ensure state machine is advanced before switching tab
          try {
            await fetch('/api/journey/advance-to-understand', { method: 'POST' });
            await queryClient.invalidateQueries({ queryKey: ['journey-state'] });
          } catch {}
          setActiveTab('understand');
        }}
        strengths={journey.summary?.strengths ?? []}
        motivations={reflectionsData?.discoverReflections?.motivations ?? []}
        workStyle={reflectionsData?.discoverReflections?.workStyle ?? []}
        growthAreas={reflectionsData?.discoverReflections?.growthAreas ?? []}
        goalTitle={goalTitle}
        careerInterests={journey.summary?.careerInterests ?? []}
      />

      {/* Understand Completion Celebration */}
      <UnderstandCompleteModal
        open={showUnderstandCelebration}
        onContinue={() => {
          setShowUnderstandCelebration(false);
          setActiveTab('act');
        }}
        goalTitle={goalTitle}
        roleRealityNotes={journey.summary?.roleRealityNotes ?? []}
        industryInsightNotes={journey.summary?.industryInsightNotes ?? []}
        pathSkills={journey.summary?.pathSkills ?? []}
        actionPlan={journey.summary?.rolePlans?.[0] ?? null}
      />

      {/* Goal Selection Sheet */}
      <GoalSelectionSheet
        open={goalSheetOpen}
        onClose={() => setGoalSheetOpen(false)}
        primaryGoal={primaryGoal}
        secondaryGoal={secondaryGoal}
        onSuccess={() => {
          // Goals API already handles: save old goal → reset → restore new goal
          // Just close sheet, reset tab, and refresh data
          setGoalSheetOpen(false);
          setActiveTab('discover');
          queryClient.invalidateQueries({ queryKey: ['journey-state'] });
          queryClient.invalidateQueries({ queryKey: ['my-goals'] });
        }}
      />
    </div>
  );
}
