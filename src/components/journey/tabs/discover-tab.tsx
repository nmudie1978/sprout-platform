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
import Link from 'next/link';
import type { JourneyUIState } from '@/lib/journey/types';

// Map career category values to human-readable labels
const CATEGORY_LABELS: Record<string, string> = {
  HEALTHCARE_LIFE_SCIENCES: 'Healthcare & Life Sciences',
  EDUCATION_TRAINING: 'Education & Training',
  TECHNOLOGY_IT: 'Technology & IT',
  BUSINESS_MANAGEMENT: 'Business & Management',
  FINANCE_BANKING: 'Finance & Banking',
  SALES_MARKETING: 'Sales & Marketing',
  MANUFACTURING_ENGINEERING: 'Engineering & Manufacturing',
  LOGISTICS_TRANSPORT: 'Logistics & Transport',
  HOSPITALITY_TOURISM: 'Hospitality & Tourism',
};

interface DiscoverTabProps {
  journey: JourneyUIState;
  goalTitle?: string | null;
  onSetGoal: () => void;
  onStartStep?: (stepId: string) => void;
  onConfirmExploration?: () => void;
  onContinueToUnderstand?: () => void;
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
          className="inline-flex items-center gap-1 text-xs font-medium transition-colors text-muted-foreground/50 hover:text-muted-foreground"
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
    colorClass: 'text-teal-500',
    bgClass: 'bg-teal-500/10',
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

export function DiscoverTab({ journey, goalTitle, onSetGoal, onStartStep, onConfirmExploration, onContinueToUnderstand }: DiscoverTabProps) {
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
        return summary?.careerInterests?.length
          ? summary.careerInterests.map((c) => CATEGORY_LABELS[c] || c)
          : null;
      case 'ROLE_DEEP_DIVE':
        return summary?.exploredRoles?.length ? summary.exploredRoles.map((r) => r.title) : null;
      default:
        return null;
    }
  };

  // Get raw career category values for building explore links
  const careerCategories = summary?.careerInterests || [];

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

        // For EXPLORE_CAREERS: check if categories are saved but step isn't completed yet
        const hasUnsavedExploration = config.id === 'EXPLORE_CAREERS' && isCurrent && careerCategories.length > 0;

        return (
          <div
            key={config.id}
            className={cn(
              'rounded-xl border p-4 transition-all',
              isCurrent && 'border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20',
              isComplete && 'border-border/60 bg-card/60',
              isLocked && 'border-border/30 opacity-40',
            )}
            style={isCurrent ? {
              boxShadow: '0 0 15px rgba(20, 184, 166, 0.15), 0 0 30px rgba(20, 184, 166, 0.05)',
            } : undefined}
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
                {(isCurrent || isLocked) && !hasUnsavedExploration && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{config.description}</p>
                )}
              </div>
              {isCurrent && !hasUnsavedExploration && onStartStep && (
                <Button
                  size="sm"
                  className="h-8 text-xs px-4 bg-teal-600 hover:bg-teal-700 shrink-0"
                  onClick={() => config.id === 'ROLE_DEEP_DIVE' ? onSetGoal() : onStartStep(config.id)}
                >
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
              {(isComplete || hasUnsavedExploration) && onStartStep && (
                <button
                  onClick={() => config.id === 'ROLE_DEEP_DIVE' ? onSetGoal() : onStartStep(config.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Update
                </button>
              )}
            </div>

            {/* Explore Careers: categories saved, pending confirmation */}
            {hasUnsavedExploration && (
              <div className="mt-3 pt-3 border-t border-border/30 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn('p-1 rounded-md', config.bgClass)}>
                    <Icon className={cn('h-3 w-3', config.colorClass)} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{config.outputTitle}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {output?.map((item) => (
                    <span
                      key={item}
                      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.bgClass, config.colorClass)}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/careers?category=${careerCategories[0]}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors"
                >
                  Explore these careers
                  <ArrowRight className="h-3 w-3" />
                </Link>
                {onConfirmExploration && (
                  <button
                    onClick={onConfirmExploration}
                    className="flex items-center gap-2 w-full rounded-lg border border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 p-2.5 transition-colors group"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-teal-500/40 group-hover:border-teal-500 transition-colors">
                      <CheckCircle2 className="h-3 w-3 text-teal-500 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </div>
                    <span className="text-xs font-medium text-teal-400">
                      I&apos;ve explored these careers
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Output — shown when completed */}
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

            {/* Set Your Direction — indented sub-section of Deep Dive step */}
            {config.id === 'ROLE_DEEP_DIVE' && !isLocked && !hasGoal && (
              <div className="mt-3 pt-3 border-t border-border/30 ml-11">
                <div className="flex items-center gap-3 rounded-lg bg-teal-500/5 border border-teal-500/15 p-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/15 text-teal-500 shrink-0">
                    <Target className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">Set Your Direction</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Choose a primary career goal to guide your Understand and Grow phases.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-[11px] h-7 shrink-0 border-teal-500/30 text-teal-500 hover:bg-teal-500/10" onClick={onSetGoal}>
                    Choose a goal
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Continue to Understand — shown when Discover is 100% complete */}
      {journey.summary?.lenses?.discover?.isComplete && onContinueToUnderstand && (
        <button
          onClick={onContinueToUnderstand}
          className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-4 transition-all hover:bg-emerald-500/15 hover:border-emerald-500/60 group"
          style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)' }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-emerald-400">Discover complete!</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              You know yourself. Now explore the world of work.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
            Continue to Understand
            <ArrowRight className="h-4 w-4" />
          </div>
        </button>
      )}
    </div>
  );
}
