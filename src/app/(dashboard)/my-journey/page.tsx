'use client';

/**
 * MY JOURNEY PAGE
 *
 * Redesigned layout: clean header, stage-aware tab bar with progress
 * indicators and lock states, no goal swap clutter.
 *
 * Stages: Discover → Understand → Grow (sequential, gated)
 */

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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
import { HelpCircle } from 'lucide-react';

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
    subtitle: 'Know Yourself',
    items: ['Strengths', 'Interests', 'Ambitions / motivations', 'Primary direction (career goal)'],
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
    items: ['Role reality', 'Path & requirements', 'Skills that matter', 'Industry insights'],
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
    items: ['Growth path (roadmap)', 'Learning goals', 'Real-world actions', 'Next step'],
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
}: {
  activeTab: JourneyTab;
  onTabChange: (tab: JourneyTab) => void;
  lenses: { discover: LensProgress; understand: LensProgress; act: LensProgress };
}) {
  const isLocked = (tab: TabDef): boolean => {
    if (tab.id === 'discover') return false;
    if (tab.id === 'understand') return !lenses.discover.isComplete;
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
        const isComplete = progress.isComplete;

        return (
          <button
            key={tab.id}
            onClick={() => !locked && onTabChange(tab.id)}
            disabled={locked}
            className={cn(
              'relative rounded-xl border p-3 sm:p-4 text-left transition-all',
              isActive && `${tab.activeBg} border-${tab.color}-500/40 ring-1 ${tab.activeRing}`,
              !isActive && !locked && 'border-border/40 hover:border-border/80 hover:bg-muted/30',
              locked && 'border-border/20 opacity-40 cursor-not-allowed',
            )}
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
              {!locked && progress.progress > 0 && (
                <span className={cn('text-[10px] sm:text-xs font-semibold', `text-${tab.color}-500`)}>
                  {progress.progress}%
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
                    style={{ width: `${progress.progress}%` }}
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
  });

  const handleCompleteStep = useCallback(
    async (data: StepCompletionData) => {
      if (!activeStepId) return;
      await completeStepMutation.mutateAsync({ stepId: activeStepId, data });
    },
    [activeStepId, completeStepMutation]
  );

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

  const journey = journeyData?.journey ?? DEMO_JOURNEY;
  const goalTitle = primaryGoal?.title ?? journey.summary?.primaryGoal?.title ?? null;

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 max-w-5xl">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0 flex-1">
            {goalTitle ? (
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-teal-500/10 shrink-0">
                  <Target className="h-4 w-4 text-teal-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                    My Journey
                  </p>
                  <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
                    {goalTitle}
                  </h1>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                  My Journey
                </p>
                <button
                  onClick={() => setGoalSheetOpen(true)}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <Target className="h-3.5 w-3.5" />
                  Set a career goal
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <Link
            href="/my-journey/how-it-works"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">How it works</span>
          </Link>
        </div>

        {/* Stage Tab Bar */}
        <div className="mb-6 sm:mb-8">
          <StageTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            lenses={journey.summary.lenses}
          />
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'discover' && (
            <DiscoverTab
              journey={journey}
              goalTitle={goalTitle}
              onSetGoal={() => setGoalSheetOpen(true)}
              onStartStep={(stepId) => setActiveStepId(stepId as JourneyStateId)}
            />
          )}
          {activeTab === 'understand' && (
            <UnderstandTab
              journey={journey}
              onStartStep={(stepId) => setActiveStepId(stepId as JourneyStateId)}
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
          }}
        />
      )}

      {/* Goal Selection Sheet */}
      <GoalSelectionSheet
        open={goalSheetOpen}
        onClose={() => setGoalSheetOpen(false)}
        primaryGoal={primaryGoal}
        secondaryGoal={secondaryGoal}
        onSuccess={() => setGoalSheetOpen(false)}
      />
    </div>
  );
}
