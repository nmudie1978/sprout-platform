'use client';

/**
 * UNDERSTAND TAB — Know the World
 *
 * Matches the Discover tab's card-based step layout.
 * Steps are full bordered cards with headers, descriptions, output areas, and glows.
 */

import {
  Globe,
  TrendingUp,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Briefcase,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { JourneyUIState } from '@/lib/journey/types';
import dynamic from 'next/dynamic';

const LibraryTab = dynamic(
  () => import('./library-tab').then((m) => m.LibraryTab),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted/50" /> }
);

interface UnderstandTabProps {
  journey: JourneyUIState;
  onStartStep?: (stepId: string) => void;
  onContinueToGrow?: () => void;
}

// ── Step Config ─────────────────────────────────────────────────────

interface StepConfig {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
}

const UNDERSTAND_STEPS: StepConfig[] = [
  {
    id: 'REVIEW_INDUSTRY_OUTLOOK',
    stepNumber: 1,
    title: 'Role Reality & Industry Insights',
    description: 'Research your chosen career — what does the job involve day to day? What are the trends and job market like? Note 3 key insights.',
  },
  {
    id: 'CAREER_SHADOW',
    stepNumber: 2,
    title: 'Path, Skills & Requirements',
    description: 'Find out what qualifications, skills, and experience are needed. Watch a video or talk to someone in the field.',
  },
  {
    id: 'CREATE_ACTION_PLAN',
    stepNumber: 3,
    title: 'Validate Your Understanding',
    description: 'Confirm what you\'ve learned by writing down 3 actions you can take to move forward based on your research.',
  },
];

// ── Quick Link Card ─────────────────────────────────────────────────

function QuickLink({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof Globe;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <div className="rounded-lg border border-border/30 bg-card/30 hover:border-border/50 hover:bg-card/50 p-2.5 flex items-center gap-2.5 transition-all">
        <div className="p-1.5 rounded-md bg-muted/50 shrink-0">
          <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">{title}</p>
          <p className="text-[10px] text-muted-foreground/50">{description}</p>
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function UnderstandTab({ journey, onStartStep, onContinueToGrow }: UnderstandTabProps) {
  const shadowSummary = journey.summary?.shadowSummary;
  const savedSummary = journey.summary?.savedSummary;
  const understandComplete = journey.summary?.lenses?.understand?.isComplete;

  // Get step status from journey data
  const getStepStatus = (stepId: string): 'completed' | 'next' | 'locked' => {
    const step = journey.steps.find((s) => s.id === stepId);
    if (!step) return 'locked';
    if (step.status === 'completed') return 'completed';
    if (step.status === 'next') return 'next';
    return 'locked';
  };

  return (
    <div className="space-y-3">
      {/* Sequential steps — matching Discover tab style */}
      {UNDERSTAND_STEPS.map((config) => {
        const status = getStepStatus(config.id);
        const isLocked = status === 'locked';
        const isComplete = status === 'completed';
        const isCurrent = status === 'next';

        return (
          <div
            key={config.id}
            className={cn(
              'rounded-xl border p-4 transition-all',
              isCurrent && 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20',
              isComplete && 'border-border/60 bg-card/60',
              isLocked && 'border-border/30 opacity-40',
            )}
            style={isCurrent ? {
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.15), 0 0 30px rgba(16, 185, 129, 0.05)',
            } : undefined}
          >
            {/* Step header */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                  isComplete && 'bg-emerald-500/20 text-emerald-500',
                  isCurrent && 'bg-emerald-500/20 text-emerald-500',
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
                <Button size="sm" className="h-8 text-xs px-4 bg-emerald-600 hover:bg-emerald-700 shrink-0" onClick={() => onStartStep(config.id)}>
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
              {isComplete && onStartStep && (
                <button
                  onClick={() => onStartStep(config.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium shrink-0 text-emerald-500 hover:opacity-80"
                >
                  <Pencil className="h-3 w-3" />
                  Update
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Supporting Content — secondary resources */}
      <div className="mt-4 rounded-xl border border-border/30 bg-muted/10 p-4 space-y-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">
          Supporting Content
        </h3>

        <div className="grid gap-2 sm:grid-cols-2">
          <QuickLink
            icon={BarChart3}
            title="Industry Insights"
            description="Global trends and what they mean for your age group"
            href="/insights"
          />
          <QuickLink
            icon={TrendingUp}
            title="Jobs & Roles on the Rise"
            description="Which careers are growing and in demand"
            href="/insights#dig-deeper"
          />
          <QuickLink
            icon={Briefcase}
            title="Explore Careers"
            description="Browse career paths, salaries, and requirements"
            href="/careers"
          />
          <QuickLink
            icon={Users}
            title="Career Shadows"
            description={shadowSummary?.completed ? `${shadowSummary.completed} completed` : 'See what a role is really like'}
            href="/shadows"
          />
        </div>

        {/* Saved Content */}
        <div className="pt-2 border-t border-border/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground/50 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Saved Content
              {savedSummary && savedSummary.total > 0 && (
                <Badge variant="secondary" className="text-[9px] h-4">{savedSummary.total}</Badge>
              )}
            </p>
          </div>
          {savedSummary && savedSummary.total > 0 ? (
            <LibraryTab />
          ) : (
            <p className="text-xs text-muted-foreground/40">
              Save articles, videos, and podcasts from{' '}
              <Link href="/insights" className="text-emerald-500/70 hover:text-emerald-400 underline underline-offset-2">
                Industry Insights
              </Link>
              {' '}and they&apos;ll appear here.
            </p>
          )}
        </div>
      </div>

      {/* Continue to Grow — shown when Understand is 100% complete */}
      {understandComplete && onContinueToGrow && (
        <button
          onClick={onContinueToGrow}
          className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center gap-4 transition-all hover:bg-amber-500/15 hover:border-amber-500/60 group"
          style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)' }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-amber-400">Understand complete!</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              You understand the world. Now take action and grow.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
            Continue to Grow
            <ArrowRight className="h-4 w-4" />
          </div>
        </button>
      )}
    </div>
  );
}
