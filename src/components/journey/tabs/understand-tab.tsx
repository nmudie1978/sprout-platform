'use client';

/**
 * UNDERSTAND TAB — Know the World
 *
 * External exploration, industry understanding, saved content, and career insight.
 * This is where users connect their self-knowledge to the reality of the working world.
 *
 * Sections:
 * 1. Understand Steps — journey progression
 * 2. Industry Insights — link to insights page
 * 3. Saved Content — articles, videos, podcasts they've collected
 * 4. Career Shadows — real-world exposure
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
  Lightbulb,
  ExternalLink,
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
}

// ── Step Progress Card ──────────────────────────────────────────────

function StepProgressCard({
  stepNumber,
  title,
  description,
  status,
  onStart,
}: {
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'next' | 'locked';
  onStart?: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-all',
        status === 'completed' && 'border-emerald-500/30 bg-emerald-500/5',
        status === 'next' && 'border-emerald-500/30 bg-emerald-500/5',
        status === 'locked' && 'border-border/30 opacity-50'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
          status === 'completed' && 'bg-emerald-500/20 text-emerald-500',
          status === 'next' && 'bg-emerald-500/20 text-emerald-500',
          status === 'locked' && 'bg-muted text-muted-foreground'
        )}
      >
        {status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', status === 'locked' && 'text-muted-foreground')}>
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
      </div>
      {status === 'next' && onStart && (
        <Button size="sm" className="text-xs h-8 shrink-0 bg-emerald-600 hover:bg-emerald-700" onClick={onStart}>
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

// ── Quick Link Card ─────────────────────────────────────────────────

function QuickLink({
  icon: Icon,
  title,
  description,
  href,
  accentColor,
}: {
  icon: typeof Globe;
  title: string;
  description: string;
  href: string;
  accentColor: string;
}) {
  return (
    <Link href={href} className="block group">
      <Card className="border-border/50 bg-card/50 hover:border-border transition-colors">
        <CardContent className="p-3 flex items-center gap-3">
          <div className={cn('p-2 rounded-lg shrink-0', `bg-${accentColor}-500/10`)}>
            <Icon className={cn('h-4 w-4', `text-${accentColor}-500`)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium group-hover:text-primary transition-colors">{title}</p>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function UnderstandTab({ journey, onStartStep }: UnderstandTabProps) {
  const understandSteps = journey.steps.filter((s) =>
    ['REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN'].includes(s.id)
  );
  const understandProgress = journey.summary?.lenses?.understand;
  const shadowSummary = journey.summary?.shadowSummary;
  const savedSummary = journey.summary?.savedSummary;

  return (
    <div className="space-y-6">
      {/* Progress overview */}
      {understandProgress && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">
              Understand Progress
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-emerald-500/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${understandProgress.progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-emerald-400">
                {understandProgress.progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Journey Steps for Understand */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-emerald-500" />
          Your Understand Steps
        </h3>
        <div className="space-y-2">
          {understandSteps.map((step, i) => (
            <StepProgressCard
              key={step.id}
              stepNumber={i + 1}
              title={step.title}
              description={step.description || ''}
              status={step.status === 'completed' ? 'completed' : step.status === 'next' ? 'next' : 'locked'}
              onStart={step.status === 'next' && onStartStep ? () => onStartStep(step.id) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Quick Links to Explore */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-500" />
          Explore the World of Work
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <QuickLink
            icon={BarChart3}
            title="Industry Insights"
            description="Global trends and what they mean for your age group"
            href="/insights"
            accentColor="blue"
          />
          <QuickLink
            icon={TrendingUp}
            title="Jobs & Roles on the Rise"
            description="Which careers are growing and in demand"
            href="/insights#dig-deeper"
            accentColor="teal"
          />
          <QuickLink
            icon={Briefcase}
            title="Explore Careers"
            description="Browse career paths, salaries, and requirements"
            href="/careers"
            accentColor="amber"
          />
          <QuickLink
            icon={Users}
            title="Career Shadows"
            description={shadowSummary?.completed ? `${shadowSummary.completed} completed` : 'See what a role is really like'}
            href="/shadows"
            accentColor="pink"
          />
        </div>
      </div>

      {/* Saved Content */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            Saved Content
            {savedSummary && savedSummary.total > 0 && (
              <Badge variant="secondary" className="text-[10px]">{savedSummary.total}</Badge>
            )}
          </h3>
        </div>
        {savedSummary && savedSummary.total > 0 ? (
          <LibraryTab />
        ) : (
          <Card className="border-dashed border-border/50">
            <CardContent className="py-8 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nothing saved yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Save articles, videos, and podcasts from Industry Insights and they'll appear here.
              </p>
              <Button size="sm" variant="outline" className="mt-3 text-xs" asChild>
                <Link href="/insights">
                  Browse Insights
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
