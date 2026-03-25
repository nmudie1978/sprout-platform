'use client';

/**
 * UNDERSTAND TAB — Know the World
 *
 * Collapsible completed steps, summary modal, clean layout.
 */

import { useMemo, useState } from 'react';
import {
  Globe,
  ArrowRight,
  CheckCircle2,
  Pencil,
  ChevronDown,
  ChevronUp,
  BookOpen,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { JourneyUIState } from '@/lib/journey/types';
import { getAllCareers } from '@/lib/career-pathways';
import { CareerDetailSheet } from '@/components/career-detail-sheet';
import { GuidanceStack } from '@/components/guidance/guidance-stack';
import { buildGuidanceContext } from '@/lib/guidance/rules';

interface UnderstandTabProps {
  journey: JourneyUIState;
  goalTitle?: string | null;
  onStartStep?: (stepId: string) => void;
  onContinueToGrow?: () => void;
  onDeleteItem?: (stepId: string, field: string, index: number) => void;
  forceActive?: boolean;
}

// ── Step Config ─────────────────────────────────────────────────────

const UNDERSTAND_STEPS = [
  {
    id: 'REVIEW_INDUSTRY_OUTLOOK',
    stepNumber: 1,
    title: 'Role Reality & Industry Insights',
    description: 'Learn what this career actually looks like day to day. Note a few things that stand out.',
  },
  {
    id: 'CAREER_SHADOW',
    stepNumber: 2,
    title: 'Path, Skills & Requirements',
    description: 'Explore what qualifications and skills matter. See the full picture, not just the job title.',
  },
  {
    id: 'CREATE_ACTION_PLAN',
    stepNumber: 3,
    title: 'Validate Your Understanding of the Role',
    description: 'Write down a few actions you could take based on what you\'ve learned.',
  },
];

// ── Data List Component ─────────────────────────────────────────────

function DataList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 p-3">
      <p className="text-[10px] font-medium text-emerald-500/50 mb-1.5">{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground/70 flex items-start gap-2">
            <span className="h-1 w-1 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function UnderstandTab({ journey, goalTitle, onStartStep, onContinueToGrow, onDeleteItem, forceActive }: UnderstandTabProps) {
  const understandComplete = journey.summary?.lenses?.understand?.isComplete;
  const roleRealityNotes = journey.summary?.roleRealityNotes || [];
  const industryInsightNotes = journey.summary?.industryInsightNotes || [];
  const pathQualifications = journey.summary?.pathQualifications || [];
  const pathSkills = journey.summary?.pathSkills || [];
  const pathCourses = journey.summary?.pathCourses || [];
  const pathRequirements = journey.summary?.pathRequirements || [];
  const actionPlan = journey.summary?.rolePlans?.[0] || null;

  const goalCareer = useMemo(() => {
    if (!goalTitle) return null;
    const all = getAllCareers();
    return all.find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  const [showCareerDetail, setShowCareerDetail] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const hasAnyData = roleRealityNotes.length > 0 || industryInsightNotes.length > 0 ||
    pathQualifications.length > 0 || pathSkills.length > 0 || actionPlan !== null;

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Get step status from journey data
  const getStepStatus = (stepId: string): 'completed' | 'next' | 'locked' => {
    const step = journey.steps.find((s) => s.id === stepId);
    if (!step) {
      if (forceActive && stepId === 'REVIEW_INDUSTRY_OUTLOOK') return 'next';
      return 'locked';
    }
    if (step.status === 'completed') return 'completed';
    if (step.status === 'next') return 'next';
    if (forceActive && stepId === 'REVIEW_INDUSTRY_OUTLOOK') return 'next';
    return 'locked';
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

  const firstNextId = UNDERSTAND_STEPS.find((s) => getStepStatus(s.id) === 'next')?.id || null;

  return (
    <div className="space-y-3">
      {/* Contextual guidance */}
      <GuidanceStack placement="understand" context={guidanceCtx} />

      {/* Career detail sheet */}
      {goalCareer && (
        <CareerDetailSheet
          career={showCareerDetail ? goalCareer : null}
          onClose={() => setShowCareerDetail(false)}
        />
      )}

      {/* Summary button */}
      {hasAnyData && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowSummary(true)}
            className="inline-flex items-center gap-1.5 text-[11px] text-emerald-500/60 hover:text-emerald-400 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            What I&apos;ve learned
          </button>
        </div>
      )}

      {/* Steps */}
      {UNDERSTAND_STEPS.map((config) => {
        const status = getStepStatus(config.id);
        const isLocked = status === 'locked' || (status === 'next' && config.id !== firstNextId);
        const isComplete = status === 'completed';
        const isCurrent = status === 'next' && config.id === firstNextId;
        const isExpanded = expandedSteps.has(config.id);

        // Get step-specific data
        const hasData = (config.id === 'REVIEW_INDUSTRY_OUTLOOK' && (roleRealityNotes.length > 0 || industryInsightNotes.length > 0)) ||
          (config.id === 'CAREER_SHADOW' && (pathQualifications.length > 0 || pathSkills.length > 0 || pathCourses.length > 0 || pathRequirements.length > 0)) ||
          (config.id === 'CREATE_ACTION_PLAN' && actionPlan !== null);

        return (
          <div
            key={config.id}
            className={cn(
              'rounded-xl border transition-all',
              isCurrent && 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20',
              isComplete && 'border-border/40 bg-card/40',
              isLocked && 'border-border/20 opacity-35',
            )}
            style={isCurrent ? { boxShadow: '0 0 15px rgba(16, 185, 129, 0.12)' } : undefined}
          >
            {/* Header — clickable for completed steps to expand/collapse */}
            <button
              onClick={() => {
                if (isComplete && hasData) toggleStep(config.id);
              }}
              disabled={isLocked}
              className={cn(
                'w-full flex items-center gap-3 p-4 text-left',
                isComplete && hasData && 'cursor-pointer',
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                isComplete && 'bg-emerald-500/20 text-emerald-500',
                isCurrent && 'bg-emerald-500/20 text-emerald-500',
                isLocked && 'bg-muted text-muted-foreground/50',
              )}>
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : config.stepNumber}
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-semibold',
                  isLocked && 'text-muted-foreground/50',
                )}>
                  {config.title}
                </p>
                {(isCurrent || isLocked) && (
                  <p className="text-xs text-muted-foreground/50 mt-0.5">{config.description}</p>
                )}
                {isComplete && !isExpanded && hasData && (
                  <p className="text-[10px] text-emerald-500/40 mt-0.5">Click to view details</p>
                )}
              </div>

              {/* Actions */}
              {isCurrent && onStartStep && (
                <Button
                  size="sm"
                  className="h-8 text-xs px-4 bg-emerald-600 hover:bg-emerald-700 shrink-0"
                  onClick={(e) => { e.stopPropagation(); onStartStep(config.id); }}
                >
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
              {isComplete && onStartStep && (
                <button
                  onClick={(e) => { e.stopPropagation(); onStartStep(config.id); }}
                  className="inline-flex items-center gap-1 text-xs shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
              {isComplete && hasData && (
                isExpanded
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              )}
            </button>

            {/* Expanded content — collapsible */}
            {isComplete && isExpanded && (
              <div className="px-4 pb-4 pt-0">
                <div className="border-t border-border/20 pt-3 grid gap-2 sm:grid-cols-2">
                  {config.id === 'REVIEW_INDUSTRY_OUTLOOK' && (
                    <>
                      <DataList label="Role Reality" items={roleRealityNotes} />
                      <DataList label="Industry Insights" items={industryInsightNotes} />
                    </>
                  )}
                  {config.id === 'CAREER_SHADOW' && (
                    <>
                      <DataList label="Qualifications" items={pathQualifications} />
                      <DataList label="Key Skills" items={pathSkills} />
                      <DataList label="Courses" items={pathCourses} />
                      <DataList label="Requirements" items={pathRequirements} />
                    </>
                  )}
                  {config.id === 'CREATE_ACTION_PLAN' && actionPlan && (
                    <>
                      {actionPlan.roleTitle && (
                        <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 p-3">
                          <p className="text-[10px] font-medium text-emerald-500/50 mb-1">Target Role</p>
                          <p className="text-xs text-muted-foreground/70 font-medium">{actionPlan.roleTitle}</p>
                        </div>
                      )}
                      <DataList label="Short-term Actions" items={actionPlan.shortTermActions || []} />
                      {actionPlan.midTermMilestone && (
                        <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 p-3">
                          <p className="text-[10px] font-medium text-emerald-500/50 mb-1">Mid-term Milestone</p>
                          <p className="text-xs text-muted-foreground/70">{actionPlan.midTermMilestone}</p>
                        </div>
                      )}
                      {actionPlan.skillToBuild && (
                        <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 p-3">
                          <p className="text-[10px] font-medium text-emerald-500/50 mb-1">Skill to Build</p>
                          <p className="text-xs text-muted-foreground/70">{actionPlan.skillToBuild}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Continue to Grow nudge */}
      {understandComplete && onContinueToGrow && (
        <button
          onClick={onContinueToGrow}
          className="flex items-center gap-1.5 text-xs text-amber-500/60 hover:text-amber-400 transition-colors group mt-2"
        >
          Continue to Grow
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* "What I've learned" Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSummary(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-emerald-500/20 bg-card shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
            <div className="h-1 bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-emerald-500/50" />
            <div className="p-6">
              <button onClick={() => setShowSummary(false)} className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <h2 className="text-base font-semibold">What you&apos;ve learned</h2>
              </div>

              {goalTitle && (
                <p className="text-xs text-muted-foreground/50 mb-4">
                  Your research into becoming a {goalTitle}
                </p>
              )}

              <div className="space-y-3">
                <DataList label="Role Reality" items={roleRealityNotes} />
                <DataList label="Industry Insights" items={industryInsightNotes} />
                <DataList label="Qualifications Needed" items={pathQualifications} />
                <DataList label="Key Skills" items={pathSkills} />
                <DataList label="Courses to Consider" items={pathCourses} />
                <DataList label="Requirements" items={pathRequirements} />

                {actionPlan && (
                  <>
                    {actionPlan.roleTitle && (
                      <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 p-3">
                        <p className="text-[10px] font-medium text-emerald-500/50 mb-1">Your Plan</p>
                        <p className="text-xs text-foreground/70 font-medium mb-1">{actionPlan.roleTitle}</p>
                        {actionPlan.shortTermActions?.length > 0 && (
                          <ul className="space-y-1">
                            {actionPlan.shortTermActions.map((a, i) => (
                              <li key={i} className="text-xs text-muted-foreground/60 flex items-start gap-2">
                                <span className="h-1 w-1 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </>
                )}

                {!hasAnyData && (
                  <p className="text-xs text-muted-foreground/40 text-center py-4">
                    Complete the steps above to build your research summary.
                  </p>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground/30 mt-5 text-center">
                This summary is built from your research. You can update it anytime.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
