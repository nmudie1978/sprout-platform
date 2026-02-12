'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Route,
  Lock,
  BookOpen,
  StickyNote,
  Fingerprint,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import {
  prefersReducedMotion,
} from '@/lib/motion';
import {
  BreathingPill,
} from '@/components/motion';

// Journey Components
import { PersonalCareerTimeline } from '@/components/journey';
import { JourneyTitle } from '@/components/journey/journey-title';
import { StepContent } from '@/components/journey/step-content';
import { LibraryTab, NotesTab, TraitsTab } from '@/components/journey/tabs';
import { ProgressSection } from '@/components/journey/progress';
// Goal Components
import { SecondaryGoalReminder } from '@/components/goals/SecondaryGoalReminder';
import { GoalSelectionSheet } from '@/components/goals/GoalSelectionSheet';
import { useGoals, usePromoteGoal } from '@/hooks/use-goals';

// Types
import type {
  JourneyUIState,
  JourneyStateId,
  JourneyStepStatus,
  StepCompletionData,
  JourneyLens,
  StateConfig,
} from '@/lib/journey/types';

import {
  JOURNEY_STATE_CONFIG,
} from '@/lib/journey/types';

// ============================================
// DEMO JOURNEY (Test data fallback)
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
      discover: {
        progress: 67,
        completedMandatory: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'],
        completedOptional: [],
        totalMandatory: 3,
        totalOptional: 0,
        isComplete: false,
      },
      understand: {
        progress: 0,
        completedMandatory: [],
        completedOptional: [],
        totalMandatory: 3,
        totalOptional: 0,
        isComplete: false,
      },
      act: {
        progress: 0,
        completedMandatory: [],
        completedOptional: [],
        totalMandatory: 2,
        totalOptional: 2,
        isComplete: false,
      },
    },
    overallProgress: 22,
    primaryGoal: { title: null, selectedAt: null },
    strengths: ['Communication', 'Problem Solving', 'Teamwork'],
    demonstratedSkills: [],
    careerInterests: ['Software Development'],
    exploredRoles: [{
      title: 'Junior Software Developer',
      exploredAt: new Date().toISOString(),
      educationPaths: ['Computer Science degree', 'Coding bootcamp'],
      certifications: [],
      companies: [],
      humanSkills: ['Communication', 'Collaboration'],
      entryExpectations: 'Entry-level, some coding experience preferred.',
    }],
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
    shadowSummary: {
      total: 0, accepted: 0, skipped: false, skipReason: null,
      pending: 0, completed: 0, declined: 0, lastUpdatedAt: null,
    },
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

type JourneyTab = 'timeline' | 'library' | 'notes' | 'traits';

interface TabConfig {
  id: JourneyTab;
  label: string;
  icon: typeof Route;
  tooltip: string;
  subtitle: string;
}

const TAB_CONFIG: TabConfig[] = [
  {
    id: 'timeline',
    label: 'Roadmap',
    icon: Route,
    tooltip: 'Your AI-generated career timeline based on your primary goal.',
    subtitle: 'Your personalised career timeline.',
  },
  {
    id: 'library',
    label: 'Library',
    icon: BookOpen,
    tooltip: 'Insights and resources you\'ve saved along the way.',
    subtitle: 'Insights and resources you\'ve saved along the way.',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: StickyNote,
    tooltip: 'Your personal thoughts across the journey.',
    subtitle: 'Your personal thoughts across the journey.',
  },
  {
    id: 'traits',
    label: 'Traits',
    icon: Fingerprint,
    tooltip: 'Notice which ways of working feel like you.',
    subtitle: 'Traits you\'re noticing about yourself.',
  },
];

// ============================================
// PRIMARY GOAL HERO
// ============================================

function PrimaryGoalHero({
  goalTitle,
  overallProgress,
  onSetGoal,
}: {
  goalTitle: string | null;
  overallProgress: number;
  onSetGoal: () => void;
  updatedAt?: string | null;
}) {
  if (!goalTitle) {
    return (
      <button
        onClick={onSetGoal}
        className="w-full rounded-xl border-2 border-dashed border-muted-foreground/25 p-4 text-center transition-colors hover:border-primary/40 hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <Target className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1.5" />
        <p className="text-sm font-semibold text-muted-foreground">Where are you heading?</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Set a career goal to anchor your journey</p>
        <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary">
          Choose a goal <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>
    );
  }

  return (
    <Card className="border-purple-200 dark:border-purple-800/60 h-full">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Primary Goal</p>
              <p className="text-sm font-bold truncate">{goalTitle}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{overallProgress}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// TAB SUBTITLE COMPONENT
// ============================================

function TabSubtitle({ subtitle }: { subtitle: string }) {
  return (
    <p className="text-sm text-muted-foreground mb-4">
      {subtitle}
    </p>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function MyJourneyPage() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<JourneyTab>('timeline');
  const [activeStepId, setActiveStepId] = useState<JourneyStateId | null>(null);
  const [goalSheetOpen, setGoalSheetOpen] = useState(false);

  const reducedMotion = typeof window !== 'undefined' && prefersReducedMotion();
  const shouldAnimate = !reducedMotion;

  // Fetch goals
  const isYouth = session?.user?.role === 'YOUTH';
  const { data: goalsData } = useGoals(isYouth);
  const primaryGoal = goalsData?.primaryGoal ?? null;
  const secondaryGoal = goalsData?.secondaryGoal ?? null;

  // Goal mutations
  const promoteGoal = usePromoteGoal();
  // Fetch journey state from API
  const {
    data: journeyData,
    isLoading: journeyLoading,
  } = useQuery<{ success: boolean; journey: JourneyUIState }>({
    queryKey: ['journey-state'],
    queryFn: async () => {
      const response = await fetch('/api/journey');
      if (!response.ok) {
        throw new Error('Failed to fetch journey state');
      }
      return response.json();
    },
    enabled: session?.user?.role === 'YOUTH',
  });

  // Mutation for completing steps
  const completeStepMutation = useMutation({
    mutationFn: async ({
      stepId,
      data,
    }: {
      stepId: JourneyStateId;
      data: StepCompletionData;
    }) => {
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

  // Handlers
  const handleStepClick = useCallback((stepId: JourneyStateId) => {
    const step = journeyData?.journey.steps.find((s) => s.id === stepId);
    if (step && step.status !== 'locked') {
      setActiveStepId(stepId);
    }
  }, [journeyData]);

  const handleCompleteStep = useCallback(
    async (data: StepCompletionData) => {
      if (!activeStepId) return;
      await completeStepMutation.mutateAsync({ stepId: activeStepId, data });
    },
    [activeStepId, completeStepMutation]
  );

  const isLoading = sessionStatus === 'loading' || journeyLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-8 w-96" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  // Auth guard
  if (session?.user?.role !== 'YOUTH') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              This page is only available for youth members.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const journey = journeyData?.journey ?? DEMO_JOURNEY;

  // Determine current lens for breathing pill indicator
  const currentLens = journey?.currentState
    ? JOURNEY_STATE_CONFIG[journey.currentState]?.lens
    : 'DISCOVER';

  // Derive a stable goalId for the task store (use title slug or fallback)
  const goalTitle = primaryGoal?.title ?? journey.summary?.primaryGoal?.title ?? null;
  const goalId = goalTitle
    ? goalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : undefined;

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Route className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                My Journey
              </h1>
              {/* Stage pills — inline with title */}
              <div className="flex items-center gap-1">
                <BreathingPill
                  active={currentLens === 'DISCOVER'}
                  enabled={shouldAnimate}
                  className={cn(
                    'text-[11px] px-1.5 py-0.5',
                    currentLens === 'DISCOVER'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-muted-foreground'
                  )}
                >
                  Discover
                </BreathingPill>
                <span className="text-muted-foreground/50 text-[10px]">·</span>
                <BreathingPill
                  active={currentLens === 'UNDERSTAND'}
                  enabled={shouldAnimate}
                  className={cn(
                    'text-[11px] px-1.5 py-0.5',
                    currentLens === 'UNDERSTAND'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-muted-foreground'
                  )}
                >
                  Understand
                </BreathingPill>
                <span className="text-muted-foreground/50 text-[10px]">·</span>
                <BreathingPill
                  active={currentLens === 'ACT'}
                  enabled={shouldAnimate}
                  className={cn(
                    'text-[11px] px-1.5 py-0.5',
                    currentLens === 'ACT'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-muted-foreground'
                  )}
                >
                  Act
                </BreathingPill>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Cards — primary + secondary side by side */}
        {journey && (
          <div className={cn('mb-6 grid gap-3', secondaryGoal ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
            <PrimaryGoalHero
              goalTitle={goalTitle}
              overallProgress={journey.summary?.overallProgress ?? 0}
              onSetGoal={() => setGoalSheetOpen(true)}
              updatedAt={primaryGoal?.updatedAt ?? journey.summary?.primaryGoal?.selectedAt ?? null}
            />
            {secondaryGoal && (
              <SecondaryGoalReminder
                secondaryGoal={secondaryGoal}
                onPromote={() =>
                  promoteGoal.mutate({
                    currentPrimary: primaryGoal,
                    currentSecondary: secondaryGoal,
                  })
                }
                isPromoting={promoteGoal.isPending}
              />
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as JourneyTab)}>
            <TooltipProvider>
              <TabsList className="grid w-full max-w-3xl grid-cols-4 h-auto relative">
                {TAB_CONFIG.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <Tooltip key={tab.id}>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value={tab.id}
                          className="relative flex flex-col items-center gap-0.5 py-2 text-xs sm:text-sm data-[state=active]:bg-background"
                        >
                          <div className="flex items-center gap-1.5">
                            <TabIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                          </div>
                          {isActive && (
                            <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500 rounded-full" />
                          )}
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-center">
                        <p className="text-xs">{tab.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TabsList>
            </TooltipProvider>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-6">
              {journey && (
                <>
                  <JourneyTitle
                    firstName={(session?.user?.youthProfile?.displayName ?? session?.user?.name ?? '').split(' ')[0] || 'You'}
                    primaryGoalLabel={goalTitle ?? undefined}
                    primaryGoalStatus={primaryGoal?.status}
                  />
                  <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
                  <ProgressSection goalId={goalId} />
                </>
              )}
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="mt-6">
              <TabSubtitle subtitle={TAB_CONFIG.find(t => t.id === 'library')?.subtitle || ''} />
              <LibraryTab />
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-6">
              <TabSubtitle subtitle={TAB_CONFIG.find(t => t.id === 'notes')?.subtitle || ''} />
              <NotesTab />
            </TabsContent>

            {/* Traits Tab */}
            <TabsContent value="traits" className="mt-6">
              <TabSubtitle subtitle={TAB_CONFIG.find(t => t.id === 'traits')?.subtitle || ''} />
              <TraitsTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Your journey is unique. There's no rush — explore at your own pace.
          </p>
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
