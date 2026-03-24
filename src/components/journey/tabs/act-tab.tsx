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
  Maximize2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { JourneyUIState } from '@/lib/journey/types';
import { GuidanceStack } from '@/components/guidance/guidance-stack';
import { buildGuidanceContext } from '@/lib/guidance/rules';

const PersonalCareerTimeline = dynamic(
  () => import('@/components/journey').then((m) => m.PersonalCareerTimeline),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const SchoolAlignmentTab = dynamic(
  () => import('./school-alignment-tab').then((m) => m.SchoolAlignmentTab),
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
    description: 'Start with something manageable — a course, a small project, or an application. The size doesn\'t matter, the step does.',
    optional: false,
  },
  {
    id: 'SUBMIT_ACTION_REFLECTION',
    stepNumber: 2,
    title: 'Reflect on Action',
    description: 'Think about what you learned. Did it confirm your direction, or open up new questions? Both are valuable.',
    optional: false,
  },
  {
    id: 'UPDATE_PLAN',
    stepNumber: 3,
    title: 'Update Plan',
    description: 'Adjust your plan based on what you\'ve learned. Your path can evolve as you do.',
    optional: true,
  },
  {
    id: 'EXTERNAL_FEEDBACK',
    stepNumber: 4,
    title: 'External Feedback',
    description: 'Ask someone you trust for their perspective. A fresh viewpoint can help you see things differently.',
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
  const planChangeReason = journey.summary?.planChangeReason || null;
  const externalFeedback = (journey.summary as unknown as Record<string, unknown>)?.externalFeedback as Array<{ source: string; summary: string }> || [];

  const getStepStatus = (stepId: string): 'completed' | 'next' | 'locked' => {
    const step = journey.steps.find((s) => s.id === stepId);
    if (!step) return 'locked';
    if (step.status === 'completed') return 'completed';
    if (step.status === 'next') return 'next';
    return 'locked';
  };

  // Find the first "next" step — only this one should show Start
  const firstNextStepId = ACT_STEPS.find((s) => getStepStatus(s.id) === 'next')?.id || null;

  // Helper to render a step card
  const renderStep = (config: typeof ACT_STEPS[number]) => {
    const status = getStepStatus(config.id);
    const isComplete = status === 'completed';
    const isCurrent = status === 'next' && config.id === firstNextStepId;
    const isEffectivelyLocked = status === 'locked' || (status === 'next' && config.id !== firstNextStepId);

    return (
      <div
        key={config.id}
        className={cn(
          'rounded-xl border p-3 transition-all',
          isCurrent && !config.optional && 'border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20',
          isCurrent && config.optional && 'border-border/50 bg-card/60',
          isComplete && 'border-sky-500/20 bg-card/60',
          isEffectivelyLocked && 'border-border/30 opacity-40',
        )}
        style={isCurrent && !config.optional ? {
          boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)',
        } : undefined}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0',
              isComplete && 'bg-emerald-500/20 text-emerald-500',
              isCurrent && 'bg-amber-500/20 text-amber-500',
              isEffectivelyLocked && 'bg-muted text-muted-foreground/50',
            )}
          >
            {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : config.stepNumber}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className={cn(
                'text-xs font-semibold',
                isComplete && 'text-foreground',
                isEffectivelyLocked && 'text-muted-foreground/50',
              )}>
                {config.title}
              </p>
              {config.optional && <Badge variant="secondary" className="text-[8px] h-3.5 px-1">Optional</Badge>}
            </div>
            {(isCurrent || isEffectivelyLocked) && (
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 line-clamp-1">{config.description}</p>
            )}
          </div>
          {isCurrent && onStartStep && (
            config.optional ? (
              <button
                onClick={() => onStartStep(config.id)}
                className="inline-flex items-center gap-1 text-[11px] font-medium shrink-0 text-muted-foreground/60 hover:text-amber-500 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Add
              </button>
            ) : (
              <Button size="sm" className="h-7 text-[11px] px-3 bg-amber-600 hover:bg-amber-700 shrink-0" onClick={() => onStartStep(config.id)}>
                Start <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )
          )}
          {isComplete && onStartStep && (
            <button
              onClick={() => onStartStep(config.id)}
              className="inline-flex items-center gap-1 text-[11px] font-medium shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Update
            </button>
          )}
        </div>

        {/* Output — saved data per step */}
        {isComplete && config.id === 'COMPLETE_ALIGNED_ACTION' && alignedActions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30 grid gap-1.5 sm:grid-cols-2">
            {alignedActions.map((action, i) => (
              <div key={action.id || i} className="rounded-md bg-sky-500/5 border border-sky-500/15 px-2.5 py-1.5">
                <p className="text-[9px] font-medium uppercase tracking-wider text-sky-400/60">{ACTION_TYPE_LABELS[action.type] || action.type}</p>
                <p className="text-[11px] text-muted-foreground">{action.title}</p>
              </div>
            ))}
          </div>
        )}

        {isComplete && config.id === 'SUBMIT_ACTION_REFLECTION' && reflections.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <ul className="space-y-1">
              {reflections.map((r, i) => (
                <li key={r.id || i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-sky-400/50 mt-1.5 shrink-0" />
                  {r.response}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isComplete && config.id === 'UPDATE_PLAN' && planChangeReason && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <div className="rounded-md bg-sky-500/5 border border-sky-500/15 px-2.5 py-1.5">
              <p className="text-[9px] font-medium uppercase tracking-wider text-sky-400/60 mb-0.5">What Changed</p>
              <p className="text-[11px] text-muted-foreground">{planChangeReason}</p>
            </div>
          </div>
        )}

        {isComplete && config.id === 'EXTERNAL_FEEDBACK' && externalFeedback.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30 grid gap-1.5 sm:grid-cols-2">
            {externalFeedback.map((fb, i) => (
              <div key={i} className="rounded-md bg-sky-500/5 border border-sky-500/15 px-2.5 py-1.5">
                <p className="text-[9px] font-medium uppercase tracking-wider text-sky-400/60">{fb.source}</p>
                <p className="text-[11px] text-muted-foreground">{fb.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
    <div className="space-y-3">
      {/* Contextual guidance */}
      <GuidanceStack placement="act" context={guidanceCtx} />

      {/* All steps — side by side in pairs */}
      <div className="grid gap-3 sm:grid-cols-2">
        {renderStep(ACT_STEPS[0])}
        {renderStep(ACT_STEPS[1])}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {renderStep(ACT_STEPS[2])}
        {renderStep(ACT_STEPS[3])}
      </div>

      <div className="my-2 border-t border-amber-500/20" />

      {/* Journey Complete — subtle inline note */}
      {getStepStatus('COMPLETE_ALIGNED_ACTION') === 'completed' &&
       getStepStatus('SUBMIT_ACTION_REFLECTION') === 'completed' && (
        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-xs text-muted-foreground/60">
            Journey complete — use your roadmap below to keep building momentum.
          </p>
        </div>
      )}

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
        <div className="min-h-[400px] rounded-xl border-2 border-amber-500/20 p-4 overflow-hidden">
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

      {/* School & Education — goal-contextual guidance */}
      <div className="shine-border mt-8 rounded-xl border border-teal-500/15 bg-gradient-to-b from-teal-500/[0.04] to-card/30 p-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="p-1.5 rounded-lg bg-teal-500/10">
            <GraduationCap className="h-4.5 w-4.5 text-teal-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              School & Learning Alignment
            </h3>
            {goalTitle && (
              <p className="text-[11px] text-muted-foreground/50">
                How your education connects to becoming a {goalTitle}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground/40 leading-relaxed mb-4">
          Add your school details, subjects, and study program below. We'll show you how your current education aligns with your career goal and what to focus on next.
        </p>
        <SchoolAlignmentTab goalTitle={goalTitle} />
      </div>
    </div>
  );
}
