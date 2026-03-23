'use client';

/**
 * ACT/GROW TAB — Take Aligned Action
 *
 * Matches the Discover/Understand tab's compact card-based layout.
 * Steps first, then roadmap, then supporting sections.
 */

import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Pencil,
  Route,
  GraduationCap,
  MessageSquare,
  Maximize2,
  X,
} from 'lucide-react';
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

// ── Step Config ─────────────────────────────────────────────────────

const ACT_STEPS = [
  {
    id: 'COMPLETE_ALIGNED_ACTION',
    stepNumber: 1,
    title: 'Complete Aligned Action',
    description: 'Pick a small action to get started. Apply for an internship, start a course, or build a portfolio.',
    optional: false,
  },
  {
    id: 'SUBMIT_ACTION_REFLECTION',
    stepNumber: 2,
    title: 'Reflect on Action',
    description: 'Reflect on what you\'ve learned. How did the task help you progress toward your career goal?',
    optional: false,
  },
  {
    id: 'UPDATE_PLAN',
    stepNumber: 3,
    title: 'Update Plan',
    description: 'Update your plan with new insights. What can you improve for the next step?',
    optional: true,
  },
  {
    id: 'EXTERNAL_FEEDBACK',
    stepNumber: 4,
    title: 'External Feedback',
    description: 'Ask for feedback from someone you trust about your progress.',
    optional: true,
  },
];

// ── Main Component ──────────────────────────────────────────────────

const ACTION_TYPE_LABELS: Record<string, string> = {
  SMALL_JOB: 'Small Job',
  PERSONAL_PROJECT: 'Personal Project',
  COURSE_OR_CERTIFICATION: 'Course / Certification',
  VOLUNTEER_WORK: 'Volunteer Work',
  INDUSTRY_EVENT: 'Industry Event',
  MENTORSHIP_SESSION: 'Mentorship',
};

export function ActTab({ journey, goalTitle, onStartStep }: ActTabProps) {
  const [roadmapFullscreen, setRoadmapFullscreen] = useState(false);

  const alignedActions = journey.summary?.alignedActions || [];
  const reflections = journey.summary?.alignedActionReflections || [];

  const getStepStatus = (stepId: string): 'completed' | 'next' | 'locked' => {
    const step = journey.steps.find((s) => s.id === stepId);
    if (!step) return 'locked';
    if (step.status === 'completed') return 'completed';
    if (step.status === 'next') return 'next';
    return 'locked';
  };

  // Find the first "next" step — only this one should show Start
  const firstNextStepId = ACT_STEPS.find((s) => getStepStatus(s.id) === 'next')?.id || null;

  return (
    <div className="space-y-3">
      {/* Step cards — matching Discover/Understand style */}
      {ACT_STEPS.map((config) => {
        const status = getStepStatus(config.id);
        const isLocked = status === 'locked';
        const isComplete = status === 'completed';
        // Only the first next step is truly current
        const isCurrent = status === 'next' && config.id === firstNextStepId;
        // If it's "next" but not the first, treat as locked
        const isEffectivelyLocked = isLocked || (status === 'next' && config.id !== firstNextStepId);

        return (
          <div
            key={config.id}
            className={cn(
              'rounded-xl border p-4 transition-all',
              isCurrent && 'border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20',
              isComplete && 'border-border/60 bg-card/60',
              isEffectivelyLocked && 'border-border/30 opacity-40',
            )}
            style={isCurrent ? {
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.15), 0 0 30px rgba(245, 158, 11, 0.05)',
            } : undefined}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                  isComplete && 'bg-emerald-500/20 text-emerald-500',
                  isCurrent && 'bg-amber-500/20 text-amber-500',
                  isEffectivelyLocked && 'bg-muted text-muted-foreground/50',
                )}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : config.stepNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'text-sm font-semibold',
                    isComplete && 'text-foreground',
                    isEffectivelyLocked && 'text-muted-foreground/50',
                  )}>
                    {config.title}
                  </p>
                  {config.optional && <Badge variant="secondary" className="text-[9px] h-4">Optional</Badge>}
                </div>
                {(isCurrent || isEffectivelyLocked) && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{config.description}</p>
                )}
              </div>
              {isCurrent && onStartStep && (
                <Button size="sm" className="h-8 text-xs px-4 bg-amber-600 hover:bg-amber-700 shrink-0" onClick={() => onStartStep(config.id)}>
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
              {isComplete && onStartStep && (
                <button
                  onClick={() => onStartStep(config.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium shrink-0 text-amber-500 hover:opacity-80"
                >
                  <Pencil className="h-3 w-3" />
                  Update
                </button>
              )}
            </div>

            {/* Output — saved actions for COMPLETE_ALIGNED_ACTION */}
            {isComplete && config.id === 'COMPLETE_ALIGNED_ACTION' && alignedActions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30 grid gap-2 sm:grid-cols-2">
                {alignedActions.map((action, i) => (
                  <div key={action.id || i} className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-1">
                      {ACTION_TYPE_LABELS[action.type] || action.type}
                    </p>
                    <p className="text-xs text-muted-foreground">{action.title}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Output — saved reflections for SUBMIT_ACTION_REFLECTION */}
            {isComplete && config.id === 'SUBMIT_ACTION_REFLECTION' && reflections.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                    Your Reflections
                  </p>
                  <ul className="space-y-1.5">
                    {reflections.map((r, i) => (
                      <li key={r.id || i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="h-1 w-1 rounded-full bg-sky-400/50 mt-1.5 shrink-0" />
                        {r.response}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="my-2 border-t border-amber-500/20" />

      {/* Your Roadmap — with extra bottom padding to prevent clipping */}
      <div className="pt-2 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Route className="h-4 w-4 text-amber-500" />
            Your Career Roadmap
          </h3>
          <button
            onClick={() => setRoadmapFullscreen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Fullscreen
          </button>
        </div>
        <div className="min-h-[400px] rounded-xl border border-border/30 p-4 overflow-hidden">
          <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
        </div>
      </div>

      {/* Fullscreen roadmap modal */}
      {roadmapFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Route className="h-5 w-5 text-amber-500" />
              Your Career Roadmap
            </h2>
            <button
              onClick={() => setRoadmapFullscreen(false)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
          </div>
        </div>
      )}

      {/* Supporting sections — side by side */}
      <div className="mt-8">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40 mb-3">
          Supporting Tools
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/30 bg-card/40 p-4">
            <h4 className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5 mb-3">
              <GraduationCap className="h-3.5 w-3.5" />
              Learning Goals
            </h4>
            <LearningGoalsTab />
          </div>
          <div className="rounded-xl border border-border/30 bg-card/40 p-4">
            <h4 className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5 mb-3">
              <MessageSquare className="h-3.5 w-3.5" />
              Reflect & Update
            </h4>
            <NotesTab />
          </div>
        </div>
      </div>
    </div>
  );
}
