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

export function ActTab({ journey, goalTitle, onStartStep }: ActTabProps) {
  const [roadmapFullscreen, setRoadmapFullscreen] = useState(false);

  const getStepStatus = (stepId: string): 'completed' | 'next' | 'locked' => {
    const step = journey.steps.find((s) => s.id === stepId);
    if (!step) return 'locked';
    if (step.status === 'completed') return 'completed';
    if (step.status === 'next') return 'next';
    return 'locked';
  };

  return (
    <div className="space-y-3">
      {/* Step cards — matching Discover/Understand style */}
      {ACT_STEPS.map((config) => {
        const status = getStepStatus(config.id);
        const isLocked = status === 'locked';
        const isComplete = status === 'completed';
        const isCurrent = status === 'next';

        return (
          <div
            key={config.id}
            className={cn(
              'rounded-xl border p-4 transition-all',
              isCurrent && 'border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20',
              isComplete && 'border-border/60 bg-card/60',
              isLocked && 'border-border/30 opacity-40',
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
                  isLocked && 'bg-muted text-muted-foreground/50',
                )}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : config.stepNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'text-sm font-semibold',
                    isComplete && 'text-foreground',
                    isLocked && 'text-muted-foreground/50',
                  )}>
                    {config.title}
                  </p>
                  {config.optional && <Badge variant="secondary" className="text-[9px] h-4">Optional</Badge>}
                </div>
                {(isCurrent || isLocked) && (
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
