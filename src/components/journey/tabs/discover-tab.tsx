'use client';

/**
 * DISCOVER TAB — Know Yourself
 *
 * Clean two-column layout with steps on the left and reflections on the right.
 * Steps are compact inline items. Reflection cards use the full width smartly.
 */

import {
  Sparkles,
  Heart,
  Compass,
  Target,
  CheckCircle2,
  ArrowRight,
  Pencil,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { JourneyUIState } from '@/lib/journey/types';

interface DiscoverTabProps {
  journey: JourneyUIState;
  goalTitle?: string | null;
  onSetGoal: () => void;
  onStartStep?: (stepId: string) => void;
}

// ── Compact Step ────────────────────────────────────────────────────

function StepRow({
  stepNumber,
  title,
  status,
  onStart,
}: {
  stepNumber: number;
  title: string;
  status: 'completed' | 'next' | 'locked';
  onStart?: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
        status === 'completed' && 'bg-emerald-500/5',
        status === 'next' && 'bg-teal-500/8 ring-1 ring-teal-500/20',
        status === 'locked' && 'opacity-40',
      )}
    >
      <div
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0',
          status === 'completed' && 'bg-emerald-500/20 text-emerald-500',
          status === 'next' && 'bg-teal-500/20 text-teal-500',
          status === 'locked' && 'bg-muted text-muted-foreground/50',
        )}
      >
        {status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : stepNumber}
      </div>
      <span className={cn(
        'flex-1 text-sm font-medium',
        status === 'completed' && 'text-muted-foreground line-through decoration-muted-foreground/30',
        status === 'locked' && 'text-muted-foreground/50',
      )}>
        {title}
      </span>
      {status === 'next' && onStart && (
        <Button size="sm" className="h-7 text-xs px-3 bg-teal-600 hover:bg-teal-700" onClick={onStart}>
          Start <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}

// ── Reflection Card ─────────────────────────────────────────────────

function ReflectionCard({
  icon: Icon,
  title,
  items,
  emptyMessage,
  colorClass,
  bgClass,
  actionLabel,
  onAction,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  items?: string[];
  emptyMessage: string;
  colorClass: string;
  bgClass: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}) {
  const hasItems = items && items.length > 0;

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('p-1.5 rounded-md', bgClass)}>
          <Icon className={cn('h-3.5 w-3.5', colorClass)} />
        </div>
        <h4 className="text-sm font-semibold flex-1">{title}</h4>
        {hasItems && (
          <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {children ? (
        children
      ) : hasItems ? (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {items.map((item) => (
            <span
              key={item}
              className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', bgClass, colorClass)}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 mb-3">{emptyMessage}</p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={cn('inline-flex items-center gap-1 text-xs font-medium transition-colors', colorClass, 'hover:opacity-80')}
        >
          {hasItems ? <Pencil className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ── Sequential Step with Output ─────────────────────────────────────

interface StepConfig {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: typeof Sparkles;
  colorClass: string;
  bgClass: string;
  outputTitle: string;
  emptyOutput: string;
}

const DISCOVER_STEPS: StepConfig[] = [
  {
    id: 'REFLECT_ON_STRENGTHS',
    stepNumber: 1,
    title: 'Reflect on Strengths',
    description: 'Identify what you\'re naturally good at. These shape the roles that\'ll suit you.',
    icon: Sparkles,
    colorClass: 'text-teal-500',
    bgClass: 'bg-teal-500/10',
    outputTitle: 'Your Strengths',
    emptyOutput: 'Complete this step to see your strengths here.',
  },
  {
    id: 'EXPLORE_CAREERS',
    stepNumber: 2,
    title: 'Explore Careers',
    description: 'Browse career paths that interest you. Save the ones that catch your attention.',
    icon: Heart,
    colorClass: 'text-pink-500',
    bgClass: 'bg-pink-500/10',
    outputTitle: 'Your Interests',
    emptyOutput: 'Complete this step to discover your interests.',
  },
  {
    id: 'ROLE_DEEP_DIVE',
    stepNumber: 3,
    title: 'Deep Dive into a Role',
    description: 'Pick a career and research what the job actually involves day to day.',
    icon: Compass,
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
    outputTitle: 'Roles Explored',
    emptyOutput: 'Complete this step to see your explored roles.',
  },
];

// ── Main Component ──────────────────────────────────────────────────

export function DiscoverTab({ journey, goalTitle, onSetGoal, onStartStep }: DiscoverTabProps) {
  const summary = journey.summary;
  const hasGoal = !!(goalTitle || summary?.primaryGoal?.title);

  // Get step status from journey data
  const getStepStatus = (stepId: string): 'completed' | 'next' | 'locked' => {
    const step = journey.steps.find((s) => s.id === stepId);
    if (!step) return 'locked';
    if (step.status === 'completed') return 'completed';
    if (step.status === 'next') return 'next';
    return 'locked';
  };

  // Get output data for each step
  const getStepOutput = (stepId: string): string[] | null => {
    switch (stepId) {
      case 'REFLECT_ON_STRENGTHS':
        return summary?.strengths?.length ? summary.strengths : null;
      case 'EXPLORE_CAREERS':
        return summary?.careerInterests?.length ? summary.careerInterests : null;
      case 'ROLE_DEEP_DIVE':
        return summary?.exploredRoles?.length ? summary.exploredRoles.map((r) => r.title) : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Sequential steps — each one unlocks the next */}
      {DISCOVER_STEPS.map((config) => {
        const status = getStepStatus(config.id);
        const output = getStepOutput(config.id);
        const isLocked = status === 'locked';
        const isComplete = status === 'completed';
        const isCurrent = status === 'next';
        const Icon = config.icon;

        return (
          <div
            key={config.id}
            className={cn(
              'rounded-xl border p-4 transition-all',
              isCurrent && 'border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20',
              isComplete && 'border-border/40 bg-card/60',
              isLocked && 'border-border/20 opacity-40',
            )}
          >
            {/* Step header */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                  isComplete && 'bg-emerald-500/20 text-emerald-500',
                  isCurrent && 'bg-teal-500/20 text-teal-500',
                  isLocked && 'bg-muted text-muted-foreground/50',
                )}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : config.stepNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-semibold',
                  isComplete && 'text-foreground',
                  isLocked && 'text-muted-foreground/50',
                )}>
                  {config.title}
                </p>
                {(isCurrent || isLocked) && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{config.description}</p>
                )}
              </div>
              {isCurrent && onStartStep && (
                <Button size="sm" className="h-8 text-xs px-4 bg-teal-600 hover:bg-teal-700 shrink-0" onClick={() => onStartStep(config.id)}>
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
              {isComplete && onStartStep && (
                <button
                  onClick={() => onStartStep(config.id)}
                  className={cn('inline-flex items-center gap-1 text-xs font-medium shrink-0', config.colorClass, 'hover:opacity-80')}
                >
                  <Pencil className="h-3 w-3" />
                  Update
                </button>
              )}
            </div>

            {/* Output — shown when completed or has data */}
            {isComplete && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('p-1 rounded-md', config.bgClass)}>
                    <Icon className={cn('h-3 w-3', config.colorClass)} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{config.outputTitle}</span>
                </div>
                {output ? (
                  <div className="flex flex-wrap gap-1.5">
                    {output.map((item) => (
                      <span
                        key={item}
                        className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.bgClass, config.colorClass)}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/50">{config.emptyOutput}</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Career Direction — only shown when no goal is set */}
      {!hasGoal && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Set Your Direction</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Choose a primary career goal to guide your Understand and Grow phases.
              </p>
            </div>
            <Button size="sm" className="text-xs h-8 shrink-0" onClick={onSetGoal}>
              <Target className="h-3 w-3 mr-1.5" />
              Choose a goal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
