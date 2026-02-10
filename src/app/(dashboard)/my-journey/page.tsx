'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Route,
  Lock,
  BookOpen,
  CheckCircle2,
  Circle,
  Briefcase,
  Brain,
  Lightbulb,
  ChevronRight,
  SkipForward,
  StickyNote,
  Target,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { AnimatedCard } from '@/components/ui/dynamic-border-animations-card';

// Journey Components
import { PersonalCareerTimeline } from '@/components/journey';
import { StepContent } from '@/components/journey/step-content';
import { LibraryTab, NotesTab } from '@/components/journey/tabs';
import { JourneyRoadmap } from '@/components/journey/journey-roadmap';

// Goal Components
import { CareerRoadmapSVG } from '@/components/goals/CareerRoadmapSVG';
import { SecondaryGoalReminder } from '@/components/goals/SecondaryGoalReminder';
import { GoalSelectionSheet } from '@/components/goals/GoalSelectionSheet';
import { useGoals, useToggleMilestone, usePromoteGoal, useUpdateGoal } from '@/hooks/use-goals';
import { getMilestonesForCareer } from '@/lib/goals/career-milestones';

// Types
import type {
  JourneyUIState,
  JourneyStateId,
  JourneyStepUI,
  JourneyStepStatus,
  StepCompletionData,
  JourneyLens,
  JourneyPhase,
  LensProgress,
  JourneySummary,
  StateConfig,
} from '@/lib/journey/types';

import {
  JOURNEY_STATE_CONFIG,
  JOURNEY_PHASES,
} from '@/lib/journey/types';

import {
  calculateAllLensProgress,
  type LensProgressDetails,
} from '@/lib/journey/progress-calculator';

// ============================================
// LENS CONFIGURATION
// ============================================

const LENS_CONFIG: Record<JourneyLens, {
  title: string;
  subtitle: string;
  icon: typeof Briefcase;
  color: string;
  bgColor: string;
  borderColor: string;
  progressColor: string;
}> = {
  DISCOVER: {
    title: 'Discover',
    subtitle: 'Know yourself',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    progressColor: 'bg-blue-500',
  },
  UNDERSTAND: {
    title: 'Understand',
    subtitle: 'Know the world',
    icon: Lightbulb,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    progressColor: 'bg-purple-500',
  },
  ACT: {
    title: 'Act',
    subtitle: 'Take aligned action',
    icon: Briefcase,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    progressColor: 'bg-emerald-500',
  },
};

const PHASE_TITLES: Record<JourneyPhase, string> = {
  SELF_AWARENESS: 'Self-Awareness',
  EXPLORATION: 'Exploration',
  REALITY: 'Reality',
  STRATEGY: 'Strategy',
  ALIGNED_ACTION: 'Aligned Action',
  REFLECTION: 'Reflection',
};

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
        progress: 50,
        completedMandatory: ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS'],
        completedOptional: [],
        totalMandatory: 4,
        totalOptional: 0,
        isComplete: false,
      },
      understand: {
        progress: 0,
        completedMandatory: [],
        completedOptional: [],
        totalMandatory: 3,
        totalOptional: 2,
        isComplete: false,
      },
      act: {
        progress: 0,
        completedMandatory: [],
        completedOptional: [],
        totalMandatory: 2,
        totalOptional: 3,
        isComplete: false,
      },
    },
    overallProgress: 17,
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

type JourneyTab = 'roadmap' | 'progress' | 'library' | 'notes';

interface TabConfig {
  id: JourneyTab;
  label: string;
  icon: typeof Route;
  tooltip: string;
  subtitle: string;
}

const TAB_CONFIG: TabConfig[] = [
  {
    id: 'roadmap',
    label: 'Roadmap',
    icon: Route,
    tooltip: 'Your visual path through Discover, Understand, and Act. Click milestones to complete them.',
    subtitle: 'Your visual path — click milestones to mark them complete.',
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: Sparkles,
    tooltip: 'Track your completion across each lens. You control your pace.',
    subtitle: 'See how far you\'ve come across each lens.',
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
];

// ============================================
// LENS PANEL COMPONENT
// ============================================

function LensPanel({
  lens,
  steps,
  lensProgress,
  progressDetails,
  currentState,
  onStepClick,
}: {
  lens: JourneyLens;
  steps: JourneyStepUI[];
  lensProgress: LensProgress;
  progressDetails?: LensProgressDetails;
  currentState: JourneyStateId;
  onStepClick: (stepId: JourneyStateId) => void;
}) {
  const config = LENS_CONFIG[lens];
  const Icon = config.icon;
  const phases = JOURNEY_PHASES[lens];

  // Group steps by phase
  const stepsByPhase = phases.reduce((acc, phase) => {
    acc[phase] = steps.filter(
      (step) => JOURNEY_STATE_CONFIG[step.id].phase === phase
    );
    return acc;
  }, {} as Record<JourneyPhase, JourneyStepUI[]>);

  // Use progressDetails if available, otherwise derive from lensProgress
  const milestonesCompleted = progressDetails?.mandatoryCompleted ?? lensProgress.completedMandatory.length;
  const milestonesTotal = progressDetails?.mandatoryTotal ?? lensProgress.totalMandatory;
  const nextMilestone = progressDetails?.nextMilestone;
  const isComplete = lensProgress.isComplete || (milestonesCompleted >= milestonesTotal);

  return (
    <div className="flex-1">
      <Card className={cn('h-full', config.borderColor)}>
        <CardHeader className={cn('pb-3', config.bgColor)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', config.bgColor)}>
                <Icon className={cn('h-5 w-5', config.color)} />
              </div>
              <div>
                <CardTitle className={cn('text-lg', config.color)}>
                  {config.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config.subtitle}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={cn('text-2xl font-bold', config.color)}>
                {progressDetails?.progressPercent ?? lensProgress.progress}%
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className={cn('h-full rounded-full transition-all duration-500', config.progressColor)}
              style={{ width: `${progressDetails?.progressPercent ?? lensProgress.progress}%` }}
            />
          </div>
          {/* Milestone transparency - subtle text */}
          <div className="mt-2 space-y-0.5">
            <p className="text-[11px] text-muted-foreground">
              {milestonesCompleted} of {milestonesTotal} milestones completed
            </p>
            {!isComplete && nextMilestone && (
              <p className="text-[11px] text-muted-foreground/70">
                Remaining: {nextMilestone}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {phases.map((phase) => (
            <div key={phase} className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {PHASE_TITLES[phase]}
              </h4>
              <div className="space-y-1.5">
                {stepsByPhase[phase].map((step) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    isCurrentState={step.id === currentState}
                    lens={lens}
                    onClick={() => onStepClick(step.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// STEP ROW COMPONENT
// ============================================

function StepRow({
  step,
  isCurrentState,
  lens,
  onClick,
}: {
  step: JourneyStepUI;
  isCurrentState: boolean;
  lens: JourneyLens;
  onClick: () => void;
}) {
  const config = LENS_CONFIG[lens];
  const isLocked = step.status === 'locked';
  const isCompleted = step.status === 'completed';
  const isSkipped = step.status === 'skipped';
  const isNext = step.status === 'next';

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors',
        'hover:bg-muted/30',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        isLocked && 'opacity-50 cursor-not-allowed',
        isCurrentState && !isLocked && 'bg-muted/50 ring-1 ring-primary/20',
        isCompleted && 'opacity-90',
        isSkipped && 'opacity-70'
      )}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : isSkipped ? (
          <SkipForward className="h-4 w-4 text-amber-500" />
        ) : isNext ? (
          <Circle className={cn('h-4 w-4', config.color)} />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium truncate',
            isLocked && 'text-muted-foreground',
            isCompleted && 'text-foreground',
            isSkipped && 'text-muted-foreground line-through'
          )}
        >
          {step.title}
        </p>
      </div>

      {/* Badges */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {step.optional && !isCompleted && !isSkipped && (
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            Optional
          </Badge>
        )}
        {isNext && (
          <ChevronRight className={cn('h-4 w-4', config.color)} />
        )}
      </div>
    </button>
  );
}

// ============================================
// NEXT STEP CARD
// ============================================

function NextStepCard({
  journey,
  onStepClick,
}: {
  journey: JourneyUIState;
  onStepClick: (stepId: JourneyStateId) => void;
}) {
  // Find the next step (status === 'next')
  const nextStep = journey.steps.find((s) => s.status === 'next');

  if (!nextStep) {
    // All steps completed
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Journey Complete
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                You've completed all milestones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = JOURNEY_STATE_CONFIG[nextStep.id];
  const lensConfig = LENS_CONFIG[config.lens];
  const Icon = lensConfig.icon;

  return (
    <Card className={cn('border', lensConfig.borderColor)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', lensConfig.bgColor)}>
              <Icon className={cn('h-5 w-5', lensConfig.color)} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn('text-[10px] font-medium uppercase tracking-wider', lensConfig.color)}>
                  {lensConfig.title}
                </span>
                {nextStep.stepNumber && (
                  <span className="text-[10px] text-muted-foreground">
                    Step {nextStep.stepNumber}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium truncate">{nextStep.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {nextStep.description}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onStepClick(nextStep.id)}
            className={cn('flex-shrink-0 gap-1', lensConfig.color)}
            variant="outline"
          >
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// PROGRESS SNAPSHOT
// ============================================

function ProgressSnapshot({ summary }: { summary: JourneySummary }) {
  const lenses: Array<{ key: JourneyLens; progress: LensProgress; config: typeof LENS_CONFIG['DISCOVER'] }> = [
    { key: 'DISCOVER', progress: summary.lenses.discover, config: LENS_CONFIG.DISCOVER },
    { key: 'UNDERSTAND', progress: summary.lenses.understand, config: LENS_CONFIG.UNDERSTAND },
    { key: 'ACT', progress: summary.lenses.act, config: LENS_CONFIG.ACT },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Progress</span>
        </div>
        <div className="space-y-3">
          {lenses.map(({ key, progress, config }) => {
            const remaining = progress.totalMandatory - progress.completedMandatory.length;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs font-medium', config.color)}>{config.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {progress.completedMandatory.length}/{progress.totalMandatory}
                    {remaining > 0 && (
                      <span className="ml-1 opacity-70">({remaining} left)</span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', config.progressColor)}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// PRIMARY GOAL HERO
// ============================================

function PrimaryGoalHero({
  summary,
  onSetGoal,
  milestoneProgress,
}: {
  summary: JourneySummary;
  onSetGoal: () => void;
  milestoneProgress?: { completed: number; total: number } | null;
}) {
  const hasGoal = !!summary.primaryGoal.title;

  if (!hasGoal) {
    return (
      <div className="mb-6">
        <button
          onClick={onSetGoal}
          className="w-full rounded-xl border-2 border-dashed border-muted-foreground/25 p-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Target className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-lg font-semibold text-muted-foreground">Where are you heading?</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Set your primary career goal to anchor your journey</p>
          <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary">
            Choose a goal <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Card className="bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5 border-purple-200/50 dark:border-purple-800/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Primary Goal</p>
                <p className="text-xl sm:text-2xl font-bold truncate">{summary.primaryGoal.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {summary.primaryGoal.selectedAt && (
                    <p className="text-xs text-muted-foreground">
                      Set {new Date(summary.primaryGoal.selectedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  {milestoneProgress && milestoneProgress.total > 0 && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      {milestoneProgress.completed}/{milestoneProgress.total} milestones
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{summary.overallProgress}%</p>
              <p className="text-[10px] text-muted-foreground">overall</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
  const [activeTab, setActiveTab] = useState<JourneyTab>('roadmap');
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
  const toggleMilestone = useToggleMilestone();
  const promoteGoal = usePromoteGoal();
  const updateGoal = useUpdateGoal();

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

  // Group steps by lens
  const getStepsByLens = (lens: JourneyLens): JourneyStepUI[] => {
    if (!journeyData?.journey.steps) return [];
    return journeyData.journey.steps.filter(
      (step) => JOURNEY_STATE_CONFIG[step.id].lens === lens
    );
  };

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

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Header with animated border */}
        <AnimatedCard
          className="mb-8 bg-card border border-border p-6 md:p-8"
          horizontalColor="via-purple-500/50"
          verticalColor="via-blue-500/50"
          speed={0.5}
          showGlow
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 flex items-center justify-center">
              <Route className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                My Journey
              </h1>
              {/* Stage pills */}
              <div className="flex items-center gap-1 mt-1">
                <BreathingPill
                  active={currentLens === 'DISCOVER'}
                  enabled={shouldAnimate}
                  className={cn(
                    'text-xs px-2 py-0.5',
                    currentLens === 'DISCOVER'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-muted-foreground'
                  )}
                >
                  Discover
                </BreathingPill>
                <span className="text-muted-foreground/50">·</span>
                <BreathingPill
                  active={currentLens === 'UNDERSTAND'}
                  enabled={shouldAnimate}
                  className={cn(
                    'text-xs px-2 py-0.5',
                    currentLens === 'UNDERSTAND'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'text-muted-foreground'
                  )}
                >
                  Understand
                </BreathingPill>
                <span className="text-muted-foreground/50">·</span>
                <BreathingPill
                  active={currentLens === 'ACT'}
                  enabled={shouldAnimate}
                  className={cn(
                    'text-xs px-2 py-0.5',
                    currentLens === 'ACT'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'text-muted-foreground'
                  )}
                >
                  Act
                </BreathingPill>
              </div>
            </div>
          </div>

          <p className="text-[13px] text-muted-foreground/80 leading-relaxed max-w-xl">
            <span className="text-blue-600/70">Discover</span> your strengths and direction.{' '}
            <span className="hidden sm:inline">•</span>
            <span className="sm:hidden"><br /></span>{' '}
            <span className="text-purple-600/70">Understand</span> what the real world requires.{' '}
            <span className="hidden sm:inline">•</span>
            <span className="sm:hidden"><br /></span>{' '}
            <span className="text-emerald-600/70">Act</span> through aligned steps toward your future.
          </p>
        </AnimatedCard>

        {/* Primary Goal Hero */}
        {journey && (
          <PrimaryGoalHero
            summary={journey.summary}
            onSetGoal={() => setGoalSheetOpen(true)}
            milestoneProgress={
              primaryGoal?.nextSteps?.length
                ? {
                    completed: primaryGoal.nextSteps.filter((s) => s.completed).length,
                    total: primaryGoal.nextSteps.length,
                  }
                : null
            }
          />
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
                            <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
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

            {/* My Roadmap Tab */}
            <TabsContent value="roadmap" className="mt-6">
              <TabSubtitle subtitle={TAB_CONFIG.find(t => t.id === 'roadmap')?.subtitle || ''} />

              {journey && (
                <>
                  {/* Info message */}
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-3 mb-4">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Click any unlocked milestone to complete it. You control your own pace.
                    </p>
                  </div>

                  {/* Next Step Card */}
                  <div className="mb-4">
                    <NextStepCard journey={journey} onStepClick={handleStepClick} />
                  </div>

                  {/* Career Roadmap (milestone-based) */}
                  {primaryGoal && primaryGoal.nextSteps.length > 0 && (
                    <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 mb-6">
                      <CardContent className="pt-6 pb-4">
                        <CareerRoadmapSVG
                          goalTitle={primaryGoal.title}
                          milestones={primaryGoal.nextSteps}
                          onToggleMilestone={(stepId) =>
                            toggleMilestone.toggle('primary', primaryGoal, stepId)
                          }
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Backward compat: goal exists but no milestones */}
                  {primaryGoal && primaryGoal.nextSteps.length === 0 && (
                    <Card className="border-dashed border-2 border-purple-200 dark:border-purple-800 mb-6">
                      <CardContent className="py-6 text-center">
                        <Target className="h-6 w-6 mx-auto text-purple-400 mb-2" />
                        <p className="text-sm font-medium mb-1">
                          Populate milestones for &ldquo;{primaryGoal.title}&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Get 5 career-specific milestones to track your progress.
                        </p>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            const milestones = getMilestonesForCareer(primaryGoal.title);
                            updateGoal.mutate({
                              slot: 'primary',
                              goal: {
                                ...primaryGoal,
                                nextSteps: milestones,
                                updatedAt: new Date().toISOString(),
                              },
                            });
                          }}
                          disabled={updateGoal.isPending}
                        >
                          {updateGoal.isPending ? 'Populating...' : 'Add Milestones'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Secondary Goal Reminder */}
                  {secondaryGoal && (
                    <div className="mb-6">
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
                    </div>
                  )}

                  {/* D→U→A Journey Roadmap */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      Your Guided Journey
                    </h3>
                    <Card className="border-2 border-muted">
                      <CardContent className="pt-6 pb-4">
                        <JourneyRoadmap
                          steps={journey.steps}
                          currentState={journey.currentState}
                          onStepClick={handleStepClick}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Personal Career Timeline */}
                  <PersonalCareerTimeline primaryGoalTitle={journey?.summary?.primaryGoal?.title || null} />
                </>
              )}
            </TabsContent>

            {/* My Progress Tab */}
            <TabsContent value="progress" className="mt-6">
              <TabSubtitle subtitle={TAB_CONFIG.find(t => t.id === 'progress')?.subtitle || ''} />

              {journey && (() => {
                const progressDetails = calculateAllLensProgress(journey.summary);

                return (
                  <>
                    {/* Info message */}
                    <div className="flex items-start gap-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 p-3 mb-4">
                      <Info className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Progress is based on milestones you choose to complete. Optional milestones add depth but are not required for 100%.
                      </p>
                    </div>

                    {/* Progress Snapshot */}
                    <div className="mb-6">
                      <ProgressSnapshot summary={journey.summary} />
                    </div>

                    {/* Lens Panels */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <LensPanel
                        lens="DISCOVER"
                        steps={getStepsByLens('DISCOVER')}
                        lensProgress={journey.summary.lenses.discover}
                        progressDetails={progressDetails.DISCOVER}
                        currentState={journey.currentState}
                        onStepClick={handleStepClick}
                      />
                      <LensPanel
                        lens="UNDERSTAND"
                        steps={getStepsByLens('UNDERSTAND')}
                        lensProgress={journey.summary.lenses.understand}
                        progressDetails={progressDetails.UNDERSTAND}
                        currentState={journey.currentState}
                        onStepClick={handleStepClick}
                      />
                      <LensPanel
                        lens="ACT"
                        steps={getStepsByLens('ACT')}
                        lensProgress={journey.summary.lenses.act}
                        progressDetails={progressDetails.ACT}
                        currentState={journey.currentState}
                        onStepClick={handleStepClick}
                      />
                    </div>
                  </>
                );
              })()}
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
