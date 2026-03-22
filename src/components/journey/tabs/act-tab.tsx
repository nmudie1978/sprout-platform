'use client';

/**
 * ACT TAB — Take Aligned Action
 *
 * Converts direction into movement. The roadmap lives here as one element,
 * alongside learning goals, real-world actions, and reflection loops.
 *
 * Sections:
 * 1. Act Steps — journey progression
 * 2. Your Next Best Step — prominent next action
 * 3. Your Roadmap — career timeline (zigzag/rail/stepping)
 * 4. Learning Goals — skill building
 * 5. Reflect & Update — reflection loop
 */

import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Route,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { JourneyUIState } from '@/lib/journey/types';

const PersonalCareerTimeline = dynamic(
  () => import('@/components/journey').then((m) => m.PersonalCareerTimeline),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const LearningGoalsTab = dynamic(
  () => import('./learning-goals-tab').then((m) => m.LearningGoalsTab),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted/50" /> }
);
const NotesTab = dynamic(
  () => import('./notes-tab').then((m) => m.NotesTab),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted/50" /> }
);

interface ActTabProps {
  journey: JourneyUIState;
  goalTitle: string | null;
  onStartStep?: (stepId: string) => void;
}

// ── Step Progress Card ──────────────────────────────────────────────

function StepProgressCard({
  stepNumber,
  title,
  description,
  status,
  onStart,
  optional,
}: {
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'next' | 'locked';
  onStart?: () => void;
  optional?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-all',
        status === 'completed' && 'border-emerald-500/30 bg-emerald-500/5',
        status === 'next' && 'border-amber-500/30 bg-amber-500/5',
        status === 'locked' && 'border-border/30 opacity-50'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
          status === 'completed' && 'bg-emerald-500/20 text-emerald-500',
          status === 'next' && 'bg-amber-500/20 text-amber-500',
          status === 'locked' && 'bg-muted text-muted-foreground'
        )}
      >
        {status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-medium', status === 'locked' && 'text-muted-foreground')}>
            {title}
          </p>
          {optional && <Badge variant="secondary" className="text-[9px]">Optional</Badge>}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
      </div>
      {status === 'next' && onStart && (
        <Button size="sm" className="text-xs h-8 shrink-0 bg-amber-600 hover:bg-amber-700" onClick={onStart}>
          Start
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      )}
      {status === 'completed' && (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function ActTab({ journey, goalTitle, onStartStep }: ActTabProps) {
  const actSteps = journey.steps.filter((s) =>
    ['COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION', 'UPDATE_PLAN', 'EXTERNAL_FEEDBACK'].includes(s.id)
  );
  const actProgress = journey.summary?.lenses?.act;
  const nextStep = journey.steps.find((s) => s.status === 'next');
  const alignedActions = journey.summary?.alignedActionsCount || 0;
  const reflections = journey.summary?.reflectionSummary;

  return (
    <div className="space-y-6">
      {/* Progress overview */}
      {actProgress && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">
              Act Progress
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-amber-500/10">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${actProgress.progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-amber-400">
                {actProgress.progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Your Next Best Step — prominent */}
      {nextStep && ['COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION', 'UPDATE_PLAN', 'EXTERNAL_FEEDBACK'].includes(nextStep.id) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">
                  Your Next Best Step
                </p>
                <h3 className="text-base font-semibold mb-1">{nextStep.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {journey.nextStepReason || nextStep.description}
                </p>
                {onStartStep && (
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => onStartStep(nextStep.id)}>
                    Take action
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Act Steps */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Your Act Steps
        </h3>
        <div className="space-y-2">
          {actSteps.map((step, i) => (
            <StepProgressCard
              key={step.id}
              stepNumber={i + 1}
              title={step.title}
              description={step.description || ''}
              status={step.status === 'completed' ? 'completed' : step.status === 'next' ? 'next' : 'locked'}
              onStart={step.status === 'next' && onStartStep ? () => onStartStep(step.id) : undefined}
              optional={step.optional}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 text-center">
          <p className="text-lg font-bold">{alignedActions}</p>
          <p className="text-[10px] text-muted-foreground">Actions Done</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 text-center">
          <p className="text-lg font-bold">{reflections?.total || 0}</p>
          <p className="text-[10px] text-muted-foreground">Reflections</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 text-center">
          <p className="text-lg font-bold">{reflections?.thisMonth || 0}</p>
          <p className="text-[10px] text-muted-foreground">This Month</p>
        </div>
      </div>

      {/* Your Roadmap */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Route className="h-4 w-4 text-amber-500" />
          Your Career Roadmap
        </h3>
        <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
      </div>

      {/* Learning Goals */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-amber-500" />
          Learning Goals
        </h3>
        <LearningGoalsTab />
      </div>

      {/* Reflect & Update */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-amber-500" />
          Reflect & Update
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Capture thoughts about what you're learning. These reflections help you refine your direction.
        </p>
        <NotesTab />
      </div>
    </div>
  );
}
