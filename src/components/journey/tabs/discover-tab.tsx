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

// ── Main Component ──────────────────────────────────────────────────

export function DiscoverTab({ journey, onSetGoal, onStartStep }: DiscoverTabProps) {
  const summary = journey.summary;
  const discoverSteps = journey.steps.filter((s) =>
    ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'].includes(s.id)
  );

  return (
    <div className="space-y-6">
      {/* Two-column: Steps + Career Direction */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Steps */}
        <div className="rounded-xl border border-border/40 bg-card/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-500 mb-3">
            Steps to Complete
          </h3>
          <div className="space-y-1">
            {discoverSteps.map((step, i) => (
              <StepRow
                key={step.id}
                stepNumber={i + 1}
                title={step.title}
                status={step.status === 'completed' ? 'completed' : step.status === 'next' ? 'next' : 'locked'}
                onStart={step.status === 'next' && onStartStep ? () => onStartStep(step.id) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Career Direction */}
        <div className="rounded-xl border border-border/40 bg-card/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-500 mb-3">
            Career Direction
          </h3>
          {summary?.primaryGoal?.title ? (
            <div>
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3 mb-3">
                <Target className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm font-semibold">{summary.primaryGoal.title}</p>
              </div>
              <button
                onClick={onSetGoal}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Change goal
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Target className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground/60 mb-3">
                Set a goal to anchor your journey
              </p>
              <Button size="sm" className="text-xs h-8" onClick={onSetGoal}>
                <Target className="h-3 w-3 mr-1.5" />
                Choose a goal
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reflection cards — 3 columns on desktop */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ReflectionCard
          icon={Sparkles}
          title="Strengths"
          items={summary?.strengths || []}
          emptyMessage="Reflect on strengths to see them here."
          colorClass="text-teal-500"
          bgClass="bg-teal-500/10"
          actionLabel={summary?.strengths?.length ? 'Update' : 'Reflect'}
          onAction={onStartStep ? () => onStartStep('REFLECT_ON_STRENGTHS') : undefined}
        />

        <ReflectionCard
          icon={Heart}
          title="Interests"
          items={summary?.careerInterests || []}
          emptyMessage="Explore careers to discover interests."
          colorClass="text-pink-500"
          bgClass="bg-pink-500/10"
          actionLabel="Explore"
          onAction={onStartStep ? () => onStartStep('EXPLORE_CAREERS') : undefined}
        />

        <ReflectionCard
          icon={Compass}
          title="Roles Explored"
          emptyMessage="Deep dive into a role to see it here."
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
          actionLabel="Explore a role"
          onAction={onStartStep ? () => onStartStep('ROLE_DEEP_DIVE') : undefined}
        >
          {summary?.exploredRoles && summary.exploredRoles.length > 0 ? (
            <div className="space-y-1.5 mb-3">
              {summary.exploredRoles.map((role) => (
                <div key={role.title} className="rounded-md bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-2">
                  <p className="text-xs font-medium">{role.title}</p>
                  {role.educationPaths && role.educationPaths.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {role.educationPaths.join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </ReflectionCard>
      </div>
    </div>
  );
}
