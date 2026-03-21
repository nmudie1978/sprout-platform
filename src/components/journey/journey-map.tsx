'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
  Sparkles,
  Briefcase,
  Brain,
  Compass,
  Search,
  Target,
  BarChart3,
  Rocket,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { JourneyStepUI, JourneyStateId, JourneyStepStatus } from '@/lib/journey/types';

// ============================================
// TYPES
// ============================================

interface JourneyMapProps {
  steps: JourneyStepUI[];
  currentState: JourneyStateId;
  completedSteps: JourneyStateId[];
  onStepClick: (stepId: JourneyStateId) => void;
  onContinue: (stepId: JourneyStateId) => void;
  canAdvance: boolean;
  nextStepReason: string | null;
}

// ============================================
// STEP ICONS MAP
// ============================================

const STEP_ICONS: Record<JourneyStateId, typeof Circle> = {
  // DISCOVER lens
  REFLECT_ON_STRENGTHS: Brain,
  EXPLORE_CAREERS: Compass,
  ROLE_DEEP_DIVE: Search,
  // UNDERSTAND lens
  REVIEW_INDUSTRY_OUTLOOK: BarChart3,
  CAREER_SHADOW: Eye,
  CREATE_ACTION_PLAN: Target,
  // ACT lens
  COMPLETE_ALIGNED_ACTION: Briefcase,
  SUBMIT_ACTION_REFLECTION: Brain,
  UPDATE_PLAN: Target,
  EXTERNAL_FEEDBACK: Rocket,
};

// ============================================
// STEP CARD COMPONENT
// ============================================

function StepCard({
  step,
  isActive,
  onClick,
  onContinue,
  canAdvance,
  nextStepReason,
}: {
  step: JourneyStepUI;
  isActive: boolean;
  onClick: () => void;
  onContinue: () => void;
  canAdvance: boolean;
  nextStepReason: string | null;
}) {
  const Icon = STEP_ICONS[step.id];
  const isLocked = step.status === 'locked';
  const isCompleted = step.status === 'completed';
  const isNext = step.status === 'next';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: step.order * 0.05 }}
      className="relative"
    >
      {/* Connection line to next step */}
      {step.order < 8 && (
        <div
          className={cn(
            'absolute left-6 top-[72px] h-8 w-0.5',
            isCompleted ? 'bg-emerald-200' : 'bg-neutral-200'
          )}
        />
      )}

      <button
        onClick={onClick}
        disabled={isLocked}
        className={cn(
          'group relative w-full rounded-2xl border p-5 text-left transition-all duration-200',
          isLocked && 'cursor-not-allowed opacity-60',
          isCompleted && 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50',
          isNext && 'border-blue-200 bg-blue-50/50 shadow-sm hover:shadow-md',
          !isLocked && !isCompleted && !isNext && 'border-neutral-200 bg-white hover:bg-neutral-50'
        )}
      >
        <div className="flex items-start gap-4">
          {/* Step indicator */}
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-colors',
              isCompleted && 'bg-emerald-100 text-emerald-600',
              isNext && 'bg-blue-100 text-blue-600',
              isLocked && 'bg-neutral-100 text-neutral-400',
              !isLocked && !isCompleted && !isNext && 'bg-neutral-100 text-neutral-500'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : isLocked ? (
              <Lock className="h-5 w-5" />
            ) : (
              <Icon className="h-6 w-6" />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  'text-base font-medium',
                  isLocked && 'text-neutral-400',
                  isCompleted && 'text-neutral-700',
                  isNext && 'text-neutral-900'
                )}
              >
                {step.title}
              </h3>

              {/* Status badge */}
              {isCompleted && (
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs"
                >
                  Completed
                </Badge>
              )}
              {isNext && (
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-700 text-xs"
                >
                  Next
                </Badge>
              )}
              {isLocked && (
                <Badge
                  variant="outline"
                  className="border-neutral-200 bg-neutral-50 text-neutral-500 text-xs"
                >
                  Locked
                </Badge>
              )}
            </div>

            <p
              className={cn(
                'mt-1 text-sm',
                isLocked ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              {step.description}
            </p>

            {/* Continue button for next step */}
            {isNext && (
              <div className="mt-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinue();
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                {!canAdvance && nextStepReason && (
                  <p className="mt-2 text-xs text-amber-600">{nextStepReason}</p>
                )}
              </div>
            )}

            {/* Edit button for completed steps */}
            {isCompleted && (
              <div className="mt-3 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs text-emerald-600 font-medium">Click to review</span>
              </div>
            )}
          </div>

          {/* Step number */}
          <div
            className={cn(
              'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium',
              isCompleted && 'bg-emerald-100 text-emerald-600',
              isNext && 'bg-blue-100 text-blue-600',
              isLocked && 'bg-neutral-100 text-neutral-400',
              !isLocked && !isCompleted && !isNext && 'bg-neutral-100 text-neutral-500'
            )}
          >
            {step.order + 1}
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// ============================================
// JOURNEY MAP COMPONENT
// ============================================

export function JourneyMap({
  steps,
  currentState,
  completedSteps,
  onStepClick,
  onContinue,
  canAdvance,
  nextStepReason,
}: JourneyMapProps) {
  const [expandedStep, setExpandedStep] = useState<JourneyStateId | null>(null);

  // Calculate progress
  const totalSteps = steps.length;
  const completedCount = completedSteps.length;
  const progressPercentage = Math.round((completedCount / (totalSteps - 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Your Journey Progress</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {completedCount} of {totalSteps - 1} steps completed
            </p>
          </div>
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90 transform">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-neutral-100"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${progressPercentage * 1.76} 176`}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-neutral-900">
              {progressPercentage}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step cards */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              isActive={currentState === step.id}
              onClick={() => {
                if (step.status !== 'locked') {
                  onStepClick(step.id);
                }
              }}
              onContinue={() => onContinue(step.id)}
              canAdvance={canAdvance}
              nextStepReason={step.status === 'next' ? nextStepReason : null}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default JourneyMap;
