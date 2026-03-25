'use client';

/**
 * ACT/GROW TAB — Take Aligned Action
 *
 * Two mandatory steps: Complete Aligned Action + Reflect on Action.
 * Roadmap and school alignment only appear after both are complete —
 * they are the reward of finishing the full journey.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Pencil,
  Route,
  GraduationCap,
  Maximize2,
  Sparkles,
  Save,
  Download,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { JourneyUIState } from '@/lib/journey/types';
import { GuidanceStack } from '@/components/guidance/guidance-stack';
import { buildGuidanceContext } from '@/lib/guidance/rules';
import { playCelebrationChime } from '@/lib/audio/celebration';
import { fireConfetti } from '@/lib/audio/confetti';

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
    title: 'Complete Real-World Actions',
    description: 'Start with something manageable — a course, a small project, or an application. The size doesn\'t matter, the step does.',
  },
  {
    id: 'SUBMIT_ACTION_REFLECTION',
    stepNumber: 2,
    title: 'Reflect on What You\'ve Learned',
    description: 'Think about what you learned. Did it confirm your direction, or open up new questions? Both are valuable.',
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
  const [stepsExpanded, setStepsExpanded] = useState(false);

  const alignedActions = journey.summary?.alignedActions || [];
  const reflections = journey.summary?.alignedActionReflections || [];

  const getStepStatus = (stepId: string): 'completed' | 'next' | 'locked' => {
    const step = journey.steps.find((s) => s.id === stepId);
    if (!step) return 'locked';
    if (step.status === 'completed') return 'completed';
    if (step.status === 'next') return 'next';
    return 'locked';
  };

  const firstNextStepId = ACT_STEPS.find((s) => getStepStatus(s.id) === 'next')?.id || null;

  const growComplete =
    getStepStatus('COMPLETE_ALIGNED_ACTION') === 'completed' &&
    getStepStatus('SUBMIT_ACTION_REFLECTION') === 'completed';

  // Play celebration chime only on the transition to grow complete (not on revisit)
  const prevGrowComplete = useRef(growComplete);
  useEffect(() => {
    // Only play when growComplete transitions from false → true in this session
    if (growComplete && !prevGrowComplete.current) {
      const seenKey = `grow-chime-${goalTitle || 'default'}`;
      if (typeof window !== 'undefined' && !localStorage.getItem(seenKey)) {
        localStorage.setItem(seenKey, 'true');
        playCelebrationChime();
        setTimeout(() => fireConfetti(), 300);
      }
    }
    prevGrowComplete.current = growComplete;
  }, [growComplete, goalTitle]);

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
          isCurrent && 'border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20',
          isComplete && 'border-border/40 bg-card/60',
          isEffectivelyLocked && 'border-border/30 opacity-40',
        )}
        style={isCurrent ? {
          boxShadow: '0 0 15px rgba(20, 184, 166, 0.12)',
        } : undefined}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0',
              isComplete && 'bg-emerald-500/20 text-emerald-500',
              isCurrent && 'bg-teal-500/20 text-teal-500',
              isEffectivelyLocked && 'bg-muted text-muted-foreground/50',
            )}
          >
            {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : config.stepNumber}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-xs font-semibold',
              isComplete && 'text-foreground',
              isEffectivelyLocked && 'text-muted-foreground/50',
            )}>
              {config.title}
            </p>
            {(isCurrent || isEffectivelyLocked) && (
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 line-clamp-1">{config.description}</p>
            )}
          </div>
          {isCurrent && onStartStep && (
            <Button size="sm" className="h-7 text-[11px] px-3 bg-teal-600 hover:bg-teal-700 shrink-0" onClick={() => onStartStep(config.id)}>
              Start <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
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
          <div className="mt-2 pt-2 border-t border-border/30 grid gap-1.5 sm:grid-cols-2">
            {reflections.map((r, i) => (
              <div key={r.id || i} className="rounded-md bg-sky-500/5 border border-sky-500/15 px-2.5 py-1.5">
                <p className="text-[9px] font-medium uppercase tracking-wider text-sky-400/60">Reflection</p>
                <p className="text-[11px] text-muted-foreground">{r.response}</p>
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
      {/* Steps & guidance — shown normally, or collapsible once grow is complete */}
      {!growComplete ? (
        <>
          <GuidanceStack placement="act" context={guidanceCtx} />
          <div className="grid gap-3 sm:grid-cols-2">
            {renderStep(ACT_STEPS[0])}
            {renderStep(ACT_STEPS[1])}
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={() => setStepsExpanded((v) => !v)}
            className="flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors py-1"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", stepsExpanded && "rotate-180")} />
            {stepsExpanded ? 'Hide completed steps' : 'Show completed steps'}
          </button>
          {stepsExpanded && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 mt-2">
              <GuidanceStack placement="act" context={guidanceCtx} />
              <div className="grid gap-3 sm:grid-cols-2 mt-3">
                {renderStep(ACT_STEPS[0])}
                {renderStep(ACT_STEPS[1])}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Journey Complete: Roadmap & School unlocked ──────────── */}
      {growComplete && (
        <>
          {/* Journey complete — celebratory note, centred */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center gap-2 rounded-xl border border-emerald-500/30 ring-1 ring-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.06] via-teal-500/[0.04] to-emerald-500/[0.06] px-5 py-4 text-center" style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.2), 0 0 40px rgba(16, 185, 129, 0.1), 0 0 80px rgba(16, 185, 129, 0.05)' }}>
            <div className="animate-in zoom-in duration-300 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs">
              <span className="font-medium text-emerald-400">You did it!</span>
              <span className="text-muted-foreground"> Your journey steps are complete.</span>
            </p>
            <p className="text-[11px] text-muted-foreground/60 max-w-md leading-relaxed">
              Use your roadmap to see the milestones ahead and track your progress. Check school alignment to make sure your subject choices support where you&apos;re heading.
            </p>
          </div>

          {/* Your Roadmap */}
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
            {!roadmapFullscreen && (
              <div className="min-h-[400px] rounded-xl border-2 border-amber-500/20 p-4 overflow-hidden">
                <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
              </div>
            )}
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

          {/* School & Education */}
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
              Add your school details, subjects, and study program below. We&apos;ll show you how your current education aligns with your career goal and what to focus on next.
            </p>
            <SchoolAlignmentTab goalTitle={goalTitle} />
          </div>

          {/* Save + Download — compact icon row */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <SaveSnapshotButton goalTitle={goalTitle} journey={journey} />
            <DownloadReportButton />
          </div>
        </>
      )}
    </div>
  );
}

// ── Save Snapshot Button ────────────────────────────────────────────

function SaveSnapshotButton({ goalTitle, journey }: { goalTitle?: string | null; journey: JourneyUIState }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    if (!goalTitle) return;
    setSaving(true);
    try {
      const goalId = goalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await fetch('/api/journey/goal-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId,
          goalTitle,
          journeyState: journey.currentState,
          journeyCompletedSteps: journey.completedSteps,
          journeySummary: journey.summary,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    finally { setSaving(false); }
  }, [goalTitle, journey]);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleSave}
            disabled={saving || !goalTitle}
            className={cn(
              'p-2 rounded-lg border transition-all',
              saved
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                : 'border-border/40 bg-card/60 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50',
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {saved ? 'Saved' : 'Save progress snapshot'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DownloadReportButton() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/reports/my-journey', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-journey-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
    finally { setDownloading(false); }
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-2 rounded-lg border border-border/40 bg-card/60 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Download PDF report
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
