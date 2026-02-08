'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route,
  Lock,
  Calendar,
  BookOpen,
  CheckCircle2,
  Circle,
  Briefcase,
  Brain,
  Lightbulb,
  ChevronRight,
  SkipForward,
  StickyNote,
  LayoutGrid,
  Map,
  Target,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import {
  prefersReducedMotion,
  PREMIUM_EASE,
  DURATION,
} from '@/lib/motion';
import {
  BreathingPill,
} from '@/components/motion';
import { AnimatedCard } from '@/components/ui/dynamic-border-animations-card';

// Journey Components
import { JourneySummaryPanel, PersonalCareerTimeline } from '@/components/journey';
import { StepContent } from '@/components/journey/step-content';
import { TimelineTab, LibraryTab, NotesTab } from '@/components/journey/tabs';
import { JourneyRoadmap } from '@/components/journey/journey-roadmap';

// Types
import type {
  JourneyUIState,
  JourneyStateId,
  JourneyStepUI,
  StepCompletionData,
  JourneyLens,
  JourneyPhase,
  LensProgress,
  JourneySummary,
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
// TAB CONFIGURATION WITH LENS TAGS
// ============================================

type JourneyTab = 'overview' | 'timeline' | 'library' | 'notes';

interface TabConfig {
  id: JourneyTab;
  label: string;
  icon: typeof Route;
  lensTag: string | null;
  lensColor: string;
  subtitle: string;
}

const TAB_CONFIG: TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Route,
    lensTag: null,
    lensColor: '',
    subtitle: 'A snapshot of where you are — and what comes next.',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: Calendar,
    lensTag: 'Act',
    lensColor: 'text-emerald-500/70',
    subtitle: 'Your actions and milestones, captured over time.',
  },
  {
    id: 'library',
    label: 'Library',
    icon: BookOpen,
    lensTag: 'Understand',
    lensColor: 'text-purple-500/70',
    subtitle: "Insights and resources you've saved along the way.",
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: StickyNote,
    lensTag: 'All',
    lensColor: 'text-muted-foreground/60',
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
// OVERVIEW CONTROL TOWER COMPONENTS
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

function PrimaryGoalCard({ summary }: { summary: JourneySummary }) {
  const hasGoal = !!summary.primaryGoal.title;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Primary Goal</span>
        </div>
        {hasGoal ? (
          <div>
            <p className="text-sm font-medium">{summary.primaryGoal.title}</p>
            {summary.primaryGoal.selectedAt && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Set {new Date(summary.primaryGoal.selectedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground italic">Not yet selected</p>
            <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
              Select Goal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityMini({ events }: { events?: Array<{ id: string; title: string; createdAt: string }> }) {
  const isEmpty = !events || events.length === 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Recent Activity</span>
        </div>
        {isEmpty ? (
          <p className="text-xs text-muted-foreground italic">No activity yet</p>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-1.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs truncate">{event.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(event.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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

type OverviewViewMode = 'cards' | 'roadmap';

const OVERVIEW_VIEW_STORAGE_KEY = 'my-journey-overview-view';

export default function MyJourneyPage() {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<JourneyTab>('overview');
  const [activeStepId, setActiveStepId] = useState<JourneyStateId | null>(null);
  const [overviewView, setOverviewView] = useState<OverviewViewMode>('cards');

  const reducedMotion = typeof window !== 'undefined' && prefersReducedMotion();
  const shouldAnimate = !reducedMotion;

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem(OVERVIEW_VIEW_STORAGE_KEY);
    if (savedView === 'cards' || savedView === 'roadmap') {
      setOverviewView(savedView);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewChange = useCallback((view: OverviewViewMode) => {
    setOverviewView(view);
    localStorage.setItem(OVERVIEW_VIEW_STORAGE_KEY, view);
  }, []);

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
              This page is only available for youth workers.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const journey = journeyData?.journey;

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

        {/* Tab Navigation */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as JourneyTab)}>
            <TabsList className="grid w-full max-w-3xl grid-cols-4 h-auto relative">
              {TAB_CONFIG.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative flex flex-col items-center gap-0.5 py-2 text-xs sm:text-sm data-[state=active]:bg-background"
                  >
                    <div className="flex items-center gap-1.5">
                      <TabIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </div>
                    {tab.lensTag && (
                      <span className={cn('text-[9px] hidden sm:inline', tab.lensColor)}>
                        {tab.lensTag}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Overview Tab - Control Tower Layout */}
            <TabsContent value="overview" className="mt-6">
              {/* Overview Subtitle */}
              <TabSubtitle subtitle={TAB_CONFIG.find(t => t.id === 'overview')?.subtitle || ''} />

              {journey && (() => {
                // Calculate milestone-based progress for all lenses
                const progressDetails = calculateAllLensProgress(journey.summary);

                return (
                  <>
                    {/* Control Tower Grid - Next Step + Quick Stats */}
                    <div className="grid gap-4 lg:grid-cols-3 mb-6">
                      {/* Next Step - Spans 2 columns on desktop */}
                      <div className="lg:col-span-2">
                        <NextStepCard journey={journey} onStepClick={handleStepClick} />
                      </div>

                      {/* Primary Goal */}
                      <div>
                        <PrimaryGoalCard summary={journey.summary} />
                      </div>
                    </div>

                    {/* Second Row: Progress + Recent Activity */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                      <ProgressSnapshot summary={journey.summary} />
                      <RecentActivityMini />
                      {/* Third slot - compact stats */}
                      <Card className="hidden lg:block">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Actions</p>
                              <p className="text-lg font-semibold">{journey.summary.alignedActionsCount}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Saved</p>
                              <p className="text-lg font-semibold">{journey.summary.savedSummary.total}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* View Toggle for Detailed View */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Detailed Progress</h3>
                      <div className="inline-flex items-center rounded-lg border bg-muted p-0.5">
                        <button
                          onClick={() => handleViewChange('cards')}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                            overviewView === 'cards'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <LayoutGrid className="h-4 w-4" />
                          <span className="hidden sm:inline">Cards</span>
                        </button>
                        <button
                          onClick={() => handleViewChange('roadmap')}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                            overviewView === 'roadmap'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Map className="h-4 w-4" />
                          <span className="hidden sm:inline">Roadmap</span>
                        </button>
                      </div>
                    </div>

                    {/* View Content with Motion Trial animations */}
                    <AnimatePresence mode="wait">
                      {overviewView === 'cards' ? (
                        <motion.div
                          key="cards"
                          initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                          animate={{ opacity: 1, y: 0 }}
                          exit={shouldAnimate ? { opacity: 0, y: -10 } : undefined}
                          transition={{
                            duration: DURATION.standard,
                            ease: PREMIUM_EASE as unknown as string,
                          }}
                        >
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
                        </motion.div>
                      ) : (
                        <motion.div
                          key="roadmap"
                          initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                          animate={{ opacity: 1, y: 0 }}
                          exit={shouldAnimate ? { opacity: 0, y: -10 } : undefined}
                          transition={{
                            duration: DURATION.standard,
                            ease: PREMIUM_EASE as unknown as string,
                          }}
                        >
                          {/* Roadmap View */}
                          <Card className="border-2 border-muted">
                            <CardContent className="pt-6 pb-4">
                              <JourneyRoadmap
                                steps={journey.steps}
                                currentState={journey.currentState}
                                onStepClick={handleStepClick}
                              />
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                );
              })()}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-6">
              <TabSubtitle subtitle={TAB_CONFIG.find(t => t.id === 'timeline')?.subtitle || ''} />
              <TimelineTab />
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

        {/* Personal Career Timeline */}
        <PersonalCareerTimeline primaryGoalTitle={journey?.summary?.primaryGoal?.title || null} />

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
    </div>
  );
}
