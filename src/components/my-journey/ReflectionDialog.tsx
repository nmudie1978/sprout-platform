'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { prefersReducedMotion, PREMIUM_EASE, DURATION } from '@/lib/motion';
import {
  REFLECTION_STEPS,
  STEP_META,
  type ReflectionStep,
  type ReflectionEntry,
} from '@/lib/my-journey/reflection-types';

interface ReflectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: Omit<ReflectionEntry, 'id' | 'createdAt'>) => void;
}

// ────────────────────────────────────────────
// Animation variants
// ────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATION.section,
      ease: PREMIUM_EASE as unknown as string,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: {
      duration: DURATION.standard,
      ease: PREMIUM_EASE as unknown as string,
    },
  }),
};

// ────────────────────────────────────────────
// Progress dots — soft, minimal
// ────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-500',
            i === current
              ? 'h-2 w-6 bg-emerald-500/70'
              : i < current
                ? 'h-1.5 w-1.5 bg-emerald-400/40'
                : 'h-1.5 w-1.5 bg-muted-foreground/15'
          )}
        />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────
// Soft textarea — expressive, not form-like
// ────────────────────────────────────────────

function SoftTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className={cn(
        'w-full resize-none rounded-2xl border-0 bg-muted/30 px-5 py-4',
        'text-sm leading-relaxed placeholder:text-muted-foreground/35',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:bg-muted/50',
        'transition-all duration-500 ease-out',
        'dark:bg-white/[0.04] dark:focus:bg-white/[0.07] dark:focus:ring-emerald-400/10',
      )}
    />
  );
}

// ────────────────────────────────────────────
// Main dialog
// ────────────────────────────────────────────

type FlowState = ReflectionStep | 'complete';

export function ReflectionDialog({ open, onClose, onSave }: ReflectionDialogProps) {
  const [flowState, setFlowState] = useState<FlowState>('tried');
  const [direction, setDirection] = useState(1);
  const reduced = typeof window !== 'undefined' && prefersReducedMotion();

  // Form state — only awareness fields
  const [tried, setTried] = useState('');
  const [learned, setLearned] = useState('');
  const [surprised, setSurprised] = useState('');

  const stepIndex = flowState === 'complete'
    ? REFLECTION_STEPS.length
    : REFLECTION_STEPS.indexOf(flowState as ReflectionStep);
  const isFirstStep = stepIndex === 0;
  const isLastPromptStep = stepIndex === REFLECTION_STEPS.length - 1;
  const isComplete = flowState === 'complete';

  const resetForm = useCallback(() => {
    setFlowState('tried');
    setDirection(1);
    setTried('');
    setLearned('');
    setSurprised('');
  }, []);

  const handleContinue = () => {
    if (isLastPromptStep) {
      // Save and show completion
      onSave({
        awareness: {
          tried: tried || undefined,
          learned: learned || undefined,
          surprised: surprised || undefined,
        },
        energy: { level: 3 },
        capability: {},
        direction: {},
      });
      setDirection(1);
      setFlowState('complete');
      return;
    }
    setDirection(1);
    setFlowState(REFLECTION_STEPS[stepIndex + 1]);
  };

  const handleBack = () => {
    if (isComplete || isFirstStep) return;
    setDirection(-1);
    setFlowState(REFLECTION_STEPS[stepIndex - 1]);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
      onClose();
    }
  };

  const handleFinish = () => {
    resetForm();
    onClose();
  };

  const getValue = (step: ReflectionStep): string => {
    switch (step) {
      case 'tried': return tried;
      case 'learned': return learned;
      case 'surprised': return surprised;
    }
  };

  const setValue = (step: ReflectionStep, value: string) => {
    switch (step) {
      case 'tried': setTried(value); break;
      case 'learned': setLearned(value); break;
      case 'surprised': setSurprised(value); break;
    }
  };

  const MotionDiv = reduced ? 'div' : motion.div;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-lg border-0 p-0 overflow-hidden sm:rounded-2xl',
          'bg-gradient-to-b from-background to-muted/20',
          'dark:to-muted/5',
          'shadow-xl shadow-black/5 dark:shadow-black/20',
        )}
      >
        {/* Accessible title — visually hidden */}
        <DialogTitle className="sr-only">
          {isComplete ? 'Reflection complete' : 'Self-reflection'}
        </DialogTitle>

        <div className={cn('px-8 pt-8 pb-10', isComplete && 'pt-14 pb-14')}>
          <AnimatePresence mode="wait" custom={direction}>
            {isComplete ? (
              /* ──── Completion Screen ──── */
              <MotionDiv
                key="complete"
                {...(!reduced && {
                  custom: direction,
                  variants: slideVariants,
                  initial: 'enter',
                  animate: 'center',
                  exit: 'exit',
                })}
                className="flex flex-col items-center text-center"
              >
                {/* Soft gradient orb — decorative, not celebratory */}
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500/15 to-teal-400/10 dark:from-emerald-400/10 dark:to-teal-300/5 mb-8" />

                <h2 className="text-xl font-semibold tracking-tight mb-2">
                  That&apos;s enough for now.
                </h2>
                <p className="text-sm text-muted-foreground/60 mb-10">
                  Small moments of reflection add up.
                </p>

                <div className="w-full max-w-[240px] space-y-3">
                  <Button
                    onClick={handleFinish}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11"
                  >
                    Back to My Journey
                  </Button>
                  <button
                    onClick={handleFinish}
                    className="w-full text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors py-1"
                  >
                    Add another reflection later
                  </button>
                </div>
              </MotionDiv>
            ) : (
              /* ──── Prompt Step ──── */
              <MotionDiv
                key={flowState}
                {...(!reduced && {
                  custom: direction,
                  variants: slideVariants,
                  initial: 'enter',
                  animate: 'center',
                  exit: 'exit',
                })}
                className="space-y-6"
              >
                {/* Progress */}
                <ProgressDots current={stepIndex} total={REFLECTION_STEPS.length} />

                {/* Prompt */}
                <div className="text-center space-y-1.5 pt-2">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {STEP_META[flowState as ReflectionStep].title}
                  </h2>
                  <p className="text-sm text-muted-foreground/50">
                    {STEP_META[flowState as ReflectionStep].description}
                  </p>
                </div>

                {/* Input */}
                <SoftTextarea
                  value={getValue(flowState as ReflectionStep)}
                  onChange={(v) => setValue(flowState as ReflectionStep, v)}
                  placeholder={STEP_META[flowState as ReflectionStep].placeholder}
                />

                {/* Reassurance */}
                <p className="text-[11px] text-muted-foreground/30 text-center">
                  All of this is optional — write what feels right.
                </p>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    disabled={isFirstStep}
                    className={cn(
                      'text-muted-foreground/50 hover:text-muted-foreground',
                      isFirstStep && 'invisible'
                    )}
                  >
                    <ChevronLeft className="h-4 w-4 mr-0.5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleContinue}
                    size="sm"
                    className="rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isLastPromptStep ? 'Finish' : 'Continue'}
                  </Button>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
