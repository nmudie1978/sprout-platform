'use client';

/**
 * DISCOVER TAB — Know Yourself
 *
 * Clean two-column layout with steps on the left and reflections on the right.
 * Steps are compact inline items. Reflection cards use the full width smartly.
 */

import { useState } from 'react';
import {
  Sparkles,
  Heart,
  Compass,
  Target,
  CheckCircle2,
  ArrowRight,
  Pencil,
  Plus,
  User,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { JourneyUIState } from '@/lib/journey/types';
import { useDiscoverRecommendations } from '@/hooks/use-discover-recommendations';
import { GuidanceStack } from '@/components/guidance/guidance-stack';
import { buildGuidanceContext } from '@/lib/guidance/rules';
import { DiscoverReflectionsSection } from '@/components/journey/discover-reflections';

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
    title: 'Explore Career Categories',
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
          <p className="text-xs font-semibold text-teal-400 group-hover:text-teal-300 transition-colors">Personalise Your Experience</p>
          <p className="text-[11px] text-muted-foreground/60">Quick self-discovery to shape your journey</p>
        </div>
        <ArrowRight className="h-4 w-4 text-teal-500/40 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0" />
      </Link>
    );
  }

  // Completed — show summary + top recommendations
  return (
    <div className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground/60" />
          <h3 className="text-xs font-semibold text-foreground/70">About You</h3>
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
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2">Careers worth exploring</p>
          <div className="flex flex-wrap gap-1.5">
            {data.recommendations.slice(0, 5).map((rec) => (
              <span
                key={rec.careerId}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-sky-500/8 text-sky-400/70 border border-sky-500/15"
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
  const [showWhoAmI, setShowWhoAmI] = useState(false);

  // Load reflections for the "Who Am I" summary
  const { data: reflectionsData } = useQuery<{ discoverReflections: { motivations?: string[]; workStyle?: string[]; growthAreas?: string[]; roleModels?: string; experiences?: string } | null }>({
    queryKey: ['discover-reflections'],
    queryFn: async () => {
      const res = await fetch('/api/discover/reflections');
      if (!res.ok) return { discoverReflections: null };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const reflections = reflectionsData?.discoverReflections;
  const hasAnyData = (summary?.strengths?.length ?? 0) > 0 || (reflections?.motivations?.length ?? 0) > 0;

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

  // Filter out ROLE_DEEP_DIVE when goal is already set
  const visibleSteps = hasGoal
    ? DISCOVER_STEPS.filter((s) => s.id !== 'ROLE_DEEP_DIVE')
    : DISCOVER_STEPS;

  // Separate completed, current, and locked steps
  const completedSteps = visibleSteps.filter((s) => getStepStatus(s.id) === 'completed');
  const currentStep = visibleSteps.find((s) => getStepStatus(s.id) === 'next');
  const lockedSteps = visibleSteps.filter((s) => getStepStatus(s.id) === 'locked');
  const allComplete = completedSteps.length === visibleSteps.length;

  const guidanceCtx = buildGuidanceContext({
    journey: {
      currentLens: journey.currentLens,
      completedSteps: journey.completedSteps,
      summary: journey.summary,
    },
    isFirstLogin: false,
    onboardingComplete: true,
    educationContext: null,
    learningGoalCount: 0,
    jobsApplied: 0,
  });

  return (
    <div className="space-y-4">
      {/* Contextual guidance */}
      <GuidanceStack placement="discover" context={guidanceCtx} />

      {/* Who Am I button */}
      {hasAnyData && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowWhoAmI(true)}
            className="inline-flex items-center gap-1.5 text-[11px] text-teal-500/60 hover:text-teal-400 transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            Who am I?
          </button>
        </div>
      )}

      {/* Who Am I modal */}
      {showWhoAmI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWhoAmI(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-teal-500/20 bg-card shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-500/50 via-emerald-500/50 to-teal-500/50" />
            <div className="p-6">
              <button onClick={() => setShowWhoAmI(false)} className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-teal-500" />
                <h2 className="text-base font-semibold">This is you</h2>
              </div>

              <div className="space-y-3">
                {(summary?.strengths?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">Your strengths</p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary!.strengths.map((s) => (
                        <span key={s} className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-teal-500/10 text-teal-400">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {(reflections?.motivations?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">What drives you</p>
                    <div className="flex flex-wrap gap-1.5">
                      {reflections!.motivations!.map((m) => (
                        <span key={m} className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">{m}</span>
                      ))}
                    </div>
                  </div>
                )}

                {(reflections?.workStyle?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">How you work best</p>
                    <div className="flex flex-wrap gap-1.5">
                      {reflections!.workStyle!.map((w) => (
                        <span key={w} className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400">{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {(reflections?.growthAreas?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">Where you want to grow</p>
                    <div className="flex flex-wrap gap-1.5">
                      {reflections!.growthAreas!.map((g) => (
                        <span key={g} className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400">{g}</span>
                      ))}
                    </div>
                  </div>
                )}

                {goalTitle && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">Your direction</p>
                    <p className="text-sm font-medium text-foreground/80">{goalTitle}</p>
                  </div>
                )}

                {reflections?.roleModels && reflections.roleModels.trim() && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">Who inspires you</p>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{reflections.roleModels}</p>
                  </div>
                )}

                {reflections?.experiences && reflections.experiences.trim() && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">What you&apos;ve tried</p>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{reflections.experiences}</p>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground/30 mt-5 text-center">
                This is based on what you shared. You can update it anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completed steps — compact grid */}
      {completedSteps.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
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
                      <span key={item} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-sky-500/8 text-sky-400/70">
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
          {/* Reflect on Weaknesses — derived from Growth Areas reflection */}
          {(reflections?.growthAreas?.length ?? 0) > 0 && (
            <div className="rounded-lg border border-border/40 bg-card/40 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[11px] font-semibold truncate">Reflect on Weaknesses</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {reflections!.growthAreas!.slice(0, 3).map((item) => (
                  <span key={item} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-500/8 text-amber-400/70">
                    {item}
                  </span>
                ))}
                {reflections!.growthAreas!.length > 3 && (
                  <span className="text-[10px] text-muted-foreground/40">+{reflections!.growthAreas!.length - 3}</span>
                )}
              </div>
            </div>
          )}
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
              <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                <Link
                  href="/careers"
                  className="flex items-center gap-2 w-full rounded-lg bg-violet-500/[0.04] border border-violet-500/10 hover:bg-violet-500/8 p-2.5 transition-colors text-left group"
                >
                  <Compass className="h-3.5 w-3.5 text-violet-400/60 shrink-0" />
                  <span className="text-[11px] text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors">
                    Not sure yet? Browse careers first to see what&apos;s out there
                  </span>
                  <ArrowRight className="h-3 w-3 text-violet-400/30 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
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

      {/* Self-discovery reflections — 5 cards */}
      <DiscoverReflectionsSection />

      {/* Subtle next-stage nudge */}
      {journey.summary?.lenses?.discover?.isComplete && onContinueToUnderstand && (
        <button
          onClick={onContinueToUnderstand}
          className="flex items-center gap-1.5 text-xs text-teal-500/60 hover:text-teal-400 transition-colors group mt-2"
        >
          Continue to Understand
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
