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
import { useDiscoverRecommendations } from '@/hooks/use-discover-recommendations';

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
    description: 'Think about what you\'re naturally good at — there are no wrong answers. You can always update this later.',
    icon: Sparkles,
    colorClass: 'text-teal-500',
    bgClass: 'bg-teal-500/10',
    outputTitle: 'Your Strengths',
    emptyOutput: 'When you\'re ready, reflect on what comes naturally to you.',
  },
  {
    id: 'EXPLORE_CAREERS',
    stepNumber: 2,
    title: 'Explore Careers',
    description: 'Browse different paths and save anything that catches your interest. You don\'t need to commit to anything yet.',
    icon: Heart,
    colorClass: 'text-teal-500',
    bgClass: 'bg-teal-500/10',
    outputTitle: 'Your Interests',
    emptyOutput: 'Explore broadly — save anything that feels interesting.',
  },
  {
    id: 'ROLE_DEEP_DIVE',
    stepNumber: 3,
    title: 'Set Your Career Direction',
    description: 'Choose a direction to explore further. This isn\'t a final decision — you can change it whenever you want.',
    icon: Compass,
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
    outputTitle: 'Roles Explored',
    emptyOutput: 'Pick a direction when you feel ready — there\'s no rush.',
  },
];

// ── Discover Profile Section ─────────────────────────────────────────

function DiscoverProfileSection() {
  const { data } = useDiscoverRecommendations();

  // Not loaded yet
  if (!data) return null;

  // Not completed — show prompt
  if (!data.hasProfile) {
    return (
      <Link
        href="/my-journey/discover"
        className="flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 p-3 transition-all group"
      >
        <div className="p-2 rounded-lg bg-teal-500/10 shrink-0">
          <Sparkles className="h-4 w-4 text-teal-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-teal-400 group-hover:text-teal-300 transition-colors">Know Yourself</p>
          <p className="text-[11px] text-muted-foreground/60">Quick self-discovery to personalise your experience</p>
        </div>
        <ArrowRight className="h-4 w-4 text-teal-500/40 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0" />
      </Link>
    );
  }

  // Completed — show summary + top recommendations
  return (
    <div className="rounded-xl border border-teal-500/15 bg-teal-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-500" />
          <h3 className="text-xs font-semibold text-teal-400">About You</h3>
        </div>
        <Link
          href="/my-journey/discover"
          className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
        >
          Update
        </Link>
      </div>

      {/* Summary text */}
      <p className="text-xs text-muted-foreground/80 leading-relaxed">{data.summary}</p>

      {/* Top recommended careers */}
      {data.recommendations.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-teal-500/50 mb-2">Careers worth exploring</p>
          <div className="flex flex-wrap gap-1.5">
            {data.recommendations.slice(0, 5).map((rec) => (
              <span
                key={rec.careerId}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20"
              >
                {rec.emoji} {rec.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

  // Separate completed, current, and locked steps
  const completedSteps = DISCOVER_STEPS.filter((s) => getStepStatus(s.id) === 'completed');
  const currentStep = DISCOVER_STEPS.find((s) => getStepStatus(s.id) === 'next');
  const lockedSteps = DISCOVER_STEPS.filter((s) => getStepStatus(s.id) === 'locked');
  const allComplete = completedSteps.length === DISCOVER_STEPS.length;

  return (
    <div className="space-y-4">
      {/* Know Yourself — shows summary when complete, prompt when not */}
      <DiscoverProfileSection />

      {/* Completed steps — compact grid */}
      {completedSteps.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {completedSteps.map((config) => {
            const output = getStepOutput(config.id);
            return (
              <div key={config.id} className="rounded-lg border border-border/40 bg-card/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[11px] font-semibold truncate">{config.title}</span>
                  </div>
                  {onStartStep && (
                    <button
                      onClick={() => config.id === 'ROLE_DEEP_DIVE' ? onSetGoal() : onStartStep(config.id)}
                      className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {output && (
                  <div className="flex flex-wrap gap-1">
                    {output.slice(0, 3).map((item) => (
                      <span key={item} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-teal-500/10 text-teal-500">
                        {item}
                      </span>
                    ))}
                    {output.length > 3 && (
                      <span className="text-[10px] text-muted-foreground/40">+{output.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Current active step — full width with glow */}
      {currentStep && (() => {
        const config = currentStep;
        const output = getStepOutput(config.id);
        const hasUnsavedExploration = config.id === 'EXPLORE_CAREERS' && careerCategories.length > 0;
        const Icon = config.icon;

        return (
          <div
            className="rounded-xl border border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20 p-4"
            style={{ boxShadow: '0 0 15px rgba(20, 184, 166, 0.15)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/20 text-teal-500 text-xs font-bold shrink-0">
                {config.stepNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{config.title}</p>
                {!hasUnsavedExploration && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{config.description}</p>
                )}
              </div>
              {!hasUnsavedExploration && onStartStep && (
                <Button
                  size="sm"
                  className="h-7 text-xs px-3 bg-teal-600 hover:bg-teal-700 shrink-0"
                  onClick={() => config.id === 'ROLE_DEEP_DIVE' ? onSetGoal() : onStartStep(config.id)}
                >
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>

            {/* Explore Careers: categories saved, pending confirmation */}
            {hasUnsavedExploration && (
              <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {output?.map((item) => (
                    <span key={item} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-teal-500/10 text-teal-500">{item}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/careers?category=${careerCategories[0]}`} target="_blank" className="text-[11px] text-teal-500/70 hover:text-teal-400">
                    Explore →
                  </Link>
                  {onConfirmExploration && (
                    <button onClick={onConfirmExploration} className="text-[11px] font-medium text-teal-400 hover:text-teal-300 underline underline-offset-2">
                      Done exploring — continue
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Set Your Direction */}
            {config.id === 'ROLE_DEEP_DIVE' && !hasGoal && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <button onClick={onSetGoal} className="flex items-center gap-2 w-full rounded-lg bg-teal-500/5 border border-teal-500/15 hover:bg-teal-500/10 p-2.5 transition-colors text-left">
                  <Target className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                  <span className="text-xs font-medium text-teal-400">Choose a career goal to continue</span>
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Locked steps — dimmed */}
      {lockedSteps.length > 0 && (
        <div className="space-y-2">
          {lockedSteps.map((config) => (
            <div key={config.id} className="rounded-lg border border-border/20 bg-card/20 p-3 opacity-40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground/50 text-[10px] font-bold shrink-0">
                  {config.stepNumber}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground/50">{config.title}</p>
                  <p className="text-[10px] text-muted-foreground/30 mt-0.5">{config.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
            <p className="text-sm font-semibold text-emerald-400">You know yourself</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              You've built a strong foundation. When you're ready, explore what your path actually looks like.
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
