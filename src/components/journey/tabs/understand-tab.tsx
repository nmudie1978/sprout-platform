'use client';

/**
 * UNDERSTAND TAB — Know the World
 *
 * Matches the Discover tab's card-based step layout.
 * Steps are full bordered cards with headers, descriptions, output areas, and glows.
 */

import { useMemo, useState } from 'react';
import {
  Globe,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Briefcase,
  Pencil,
  Info,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';
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
    description: 'Learn what this career actually looks like day to day. Note a few things that stand out — there\'s no perfect answer.',
  },
  {
    id: 'CAREER_SHADOW',
    stepNumber: 2,
    title: 'Path, Skills & Requirements',
    description: 'Explore what qualifications and skills matter. This helps you see the full picture, not just the job title.',
  },
  {
    id: 'CREATE_ACTION_PLAN',
    stepNumber: 3,
    title: 'Validate Your Understanding',
    description: 'Write down a few actions you could take based on what you\'ve learned. Keep it realistic — small steps count.',
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
    <Link href={href} target="_blank" className="block group">
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

export function UnderstandTab({ journey, goalTitle, onStartStep, onContinueToGrow, onDeleteItem }: UnderstandTabProps) {
  const understandComplete = journey.summary?.lenses?.understand?.isComplete;
  const roleRealityNotes = journey.summary?.roleRealityNotes || [];
  const industryInsightNotes = journey.summary?.industryInsightNotes || [];
  const pathQualifications = journey.summary?.pathQualifications || [];
  const pathSkills = journey.summary?.pathSkills || [];
  const pathCourses = journey.summary?.pathCourses || [];
  const pathRequirements = journey.summary?.pathRequirements || [];
  const hasPathData = pathQualifications.length > 0 || pathSkills.length > 0 || pathCourses.length > 0 || pathRequirements.length > 0;
  const actionPlan = journey.summary?.rolePlans?.[0] || null;

  // Look up career data from the primary goal title
  const goalCareer = useMemo(() => {
    if (!goalTitle) return null;
    const all = getAllCareers();
    return all.find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  const [showCareerDetail, setShowCareerDetail] = useState(false);

  // Get step status from journey data
  const getStepStatus = (stepId: string): 'completed' | 'next' | 'locked' => {
    const step = journey.steps.find((s) => s.id === stepId);
    if (!step) return 'locked';
    if (step.status === 'completed') return 'completed';
    if (step.status === 'next') return 'next';
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

  return (
    <div className="space-y-3">
      {/* Contextual guidance */}
      <GuidanceStack placement="understand" context={guidanceCtx} />

      {/* Career detail sheet — available but no pill shown */}
      {goalCareer && (
        <CareerDetailSheet
          career={showCareerDetail ? goalCareer : null}
          onClose={() => setShowCareerDetail(false)}
        />
      )}

      {/* Sequential steps — matching Discover tab style */}
      {(() => {
        const firstNextId = UNDERSTAND_STEPS.find((s) => getStepStatus(s.id) === 'next')?.id || null;
        return UNDERSTAND_STEPS.map((config) => {
        const status = getStepStatus(config.id);
        const isLocked = status === 'locked' || (status === 'next' && config.id !== firstNextId);
        const isComplete = status === 'completed';
        const isCurrent = status === 'next' && config.id === firstNextId;

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
                  className="inline-flex items-center gap-1 text-xs font-medium shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Update
                </button>
              )}
            </div>

            {/* Output — saved data for completed REVIEW_INDUSTRY_OUTLOOK */}
            {isComplete && config.id === 'REVIEW_INDUSTRY_OUTLOOK' && (roleRealityNotes.length > 0 || industryInsightNotes.length > 0) && (
              <div className="mt-3 pt-3 border-t border-border/30 grid gap-3 sm:grid-cols-2">
                {roleRealityNotes.length > 0 && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                      Role Reality
                    </p>
                    <ul className="space-y-1.5">
                      {roleRealityNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-sky-400/50 mt-1.5 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {industryInsightNotes.length > 0 && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                      Industry Insights
                    </p>
                    <ul className="space-y-1.5">
                      {industryInsightNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-sky-400/50 mt-1.5 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Output — saved data for completed CAREER_SHADOW (Path, Skills & Requirements) */}
            {isComplete && config.id === 'CAREER_SHADOW' && hasPathData && (
              <div className="mt-3 pt-3 border-t border-border/30 grid gap-3 sm:grid-cols-2">
                {pathQualifications.length > 0 && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                      Qualifications
                    </p>
                    <ul className="space-y-1.5">
                      {pathQualifications.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-sky-400/50 mt-1.5 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pathSkills.length > 0 && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                      Key Skills
                    </p>
                    <ul className="space-y-1.5">
                      {pathSkills.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-sky-400/50 mt-1.5 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pathCourses.length > 0 && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                      Courses
                    </p>
                    <ul className="space-y-1.5">
                      {pathCourses.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-sky-400/50 mt-1.5 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pathRequirements.length > 0 && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                      Requirements
                    </p>
                    <ul className="space-y-1.5">
                      {pathRequirements.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-sky-400/50 mt-1.5 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Output — saved data for completed CREATE_ACTION_PLAN */}
            {isComplete && config.id === 'CREATE_ACTION_PLAN' && actionPlan && (
              <div className="mt-3 pt-3 border-t border-border/30 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                    Target Role
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">{actionPlan.roleTitle}</p>
                </div>
                {actionPlan.shortTermActions.length > 0 && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                      Short-term Actions
                    </p>
                    <ul className="space-y-1.5">
                      {actionPlan.shortTermActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-sky-400/50 mt-1.5 shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {actionPlan.midTermMilestone && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                      Mid-term Milestone
                    </p>
                    <p className="text-xs text-muted-foreground">{actionPlan.midTermMilestone}</p>
                  </div>
                )}
                {actionPlan.skillToBuild && (
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/15 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60 mb-2">
                      Skill to Build
                    </p>
                    <p className="text-xs text-muted-foreground">{actionPlan.skillToBuild}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      });
      })()}

      {/* Subtle next-stage nudge */}
      {understandComplete && onContinueToGrow && (
        <button
          onClick={onContinueToGrow}
          className="flex items-center gap-1.5 text-xs text-amber-500/60 hover:text-amber-400 transition-colors group mt-2"
        >
          Continue to Grow
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
