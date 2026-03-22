'use client';

/**
 * DISCOVER TAB — Know Yourself
 *
 * Structured self-reflection and career direction formation.
 * Not a notes dump — each section has a purpose in the journey framework.
 *
 * Sections:
 * 1. Your Strengths — what you're good at
 * 2. Growth Areas — where you want to improve
 * 3. What Interests You — passions and curiosities
 * 4. What Matters to You — values and motivations
 * 5. Career Directions — paths you're exploring
 * 6. Your Goals — primary and secondary direction
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  TrendingUp,
  Heart,
  Compass,
  Target,
  ChevronRight,
  Plus,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { JourneyUIState } from '@/lib/journey/types';

interface DiscoverTabProps {
  journey: JourneyUIState;
  onSetGoal: () => void;
  onStartStep?: (stepId: string) => void;
}

// ── Reflection Card ─────────────────────────────────────────────────

function ReflectionSection({
  icon: Icon,
  title,
  description,
  items,
  emptyMessage,
  accentColor,
  actionLabel,
  onAction,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  items?: string[];
  emptyMessage: string;
  accentColor: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}) {
  const hasItems = items && items.length > 0;

  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg shrink-0', `bg-${accentColor}-500/10`)}>
            <Icon className={cn('h-4 w-4', `text-${accentColor}-500`)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold">{title}</h3>
              {hasItems && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {items.length} saved
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">{description}</p>

            {children ? (
              children
            ) : hasItems ? (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {items.map((item) => (
                  <span
                    key={item}
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                      `bg-${accentColor}-500/10 text-${accentColor}-700 dark:text-${accentColor}-400`
                    )}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/50 p-3 mb-3">
                <p className="text-xs text-muted-foreground/70 text-center">{emptyMessage}</p>
              </div>
            )}

            {actionLabel && onAction && (
              <Button
                size="sm"
                variant={hasItems ? 'outline' : 'default'}
                className="text-xs h-8"
                onClick={onAction}
              >
                {hasItems ? <Pencil className="h-3 w-3 mr-1.5" /> : <Plus className="h-3 w-3 mr-1.5" />}
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
        status === 'next' && 'border-violet-500/30 bg-violet-500/5',
        status === 'locked' && 'border-border/30 opacity-50'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
          status === 'completed' && 'bg-emerald-500/20 text-emerald-500',
          status === 'next' && 'bg-violet-500/20 text-violet-500',
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
        <Button size="sm" className="text-xs h-8 shrink-0" onClick={onStart}>
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

export function DiscoverTab({ journey, onSetGoal, onStartStep }: DiscoverTabProps) {
  const summary = journey.summary;
  const discoverSteps = journey.steps.filter((s) =>
    ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'].includes(s.id)
  );
  const discoverProgress = journey.summary?.lenses?.discover;

  return (
    <div className="space-y-6">
      {/* Progress overview */}
      {discoverProgress && (
        <div className="flex items-center gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-violet-400 uppercase tracking-wider mb-1">
              Discover Progress
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-violet-500/10">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${discoverProgress.progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-violet-400">
                {discoverProgress.progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Journey Steps for Discover */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-violet-500" />
          Your Discover Steps
        </h3>
        <div className="space-y-2">
          {discoverSteps.map((step, i) => (
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

      {/* Reflection Sections */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ReflectionSection
          icon={Sparkles}
          title="Your Strengths"
          description="What you're naturally good at. These shape the roles that'll suit you."
          items={summary?.strengths || []}
          emptyMessage="Complete 'Reflect on Strengths' to identify your top strengths."
          accentColor="violet"
          actionLabel={summary?.strengths?.length ? 'Update strengths' : 'Reflect on strengths'}
          onAction={onStartStep ? () => onStartStep('REFLECT_ON_STRENGTHS') : undefined}
        />

        <ReflectionSection
          icon={TrendingUp}
          title="Skills You're Building"
          description="Skills you've demonstrated through jobs, projects, and experiences."
          items={summary?.demonstratedSkills || []}
          emptyMessage="Skills appear here as you complete actions and receive feedback."
          accentColor="blue"
        />

        <ReflectionSection
          icon={Heart}
          title="What Interests You"
          description="Career areas that caught your attention during exploration."
          items={summary?.careerInterests || []}
          emptyMessage="Explore careers to discover what interests you."
          accentColor="pink"
          actionLabel="Explore careers"
          onAction={onStartStep ? () => onStartStep('EXPLORE_CAREERS') : undefined}
        />

        <ReflectionSection
          icon={Compass}
          title="Roles You've Explored"
          description="Careers you've researched in depth — what they involve day to day."
          emptyMessage="Deep dive into a role to see it appear here."
          accentColor="emerald"
          actionLabel="Explore a role"
          onAction={onStartStep ? () => onStartStep('ROLE_DEEP_DIVE') : undefined}
        >
          {summary?.exploredRoles && summary.exploredRoles.length > 0 ? (
            <div className="space-y-2 mb-3">
              {summary.exploredRoles.map((role) => (
                <div key={role.title} className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2.5">
                  <p className="text-xs font-medium">{role.title}</p>
                  {role.educationPaths && role.educationPaths.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Paths: {role.educationPaths.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </ReflectionSection>
      </div>

      {/* Career Direction */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">Your Career Direction</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Where Discover leads — the goal that shapes your Understand and Act phases.
              </p>
              {summary?.primaryGoal?.title ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 p-2.5">
                    <Target className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-primary/60 font-medium">Primary</p>
                      <p className="text-sm font-semibold">{summary.primaryGoal.title}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-8" onClick={onSetGoal}>
                    <Pencil className="h-3 w-3 mr-1.5" />
                    Change goals
                  </Button>
                </div>
              ) : (
                <Button size="sm" className="text-xs h-8" onClick={onSetGoal}>
                  <Target className="h-3 w-3 mr-1.5" />
                  Set your career direction
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
