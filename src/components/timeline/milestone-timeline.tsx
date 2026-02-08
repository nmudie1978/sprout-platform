'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  isMotionTrialEnabled,
  prefersReducedMotion,
  PREMIUM_EASE,
  DURATION,
  STAGGER,
  staggerContainer,
  staggerItem,
} from '@/lib/motion';
import type { MilestoneTimelineProps } from './types';

export function MilestoneTimeline({ milestones, className }: MilestoneTimelineProps) {
  const n = milestones.length;
  const currentIndex = milestones.findIndex((m) => m.state === 'current');
  const progressPercent = currentIndex >= 0 ? (currentIndex / (n - 1)) * 100 : 0;

  const shouldAnimate = isMotionTrialEnabled() && !prefersReducedMotion();

  // Offset so lines start/end at node centers
  const edgeInset = `calc(100% / ${2 * n})`;

  return (
    <div className={cn('relative px-6 py-10 sm:px-10 sm:py-12', className)}>
      {/* Mobile: horizontal scroll container */}
      <div className="overflow-x-auto snap-x snap-mandatory sm:overflow-visible [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative min-w-[600px] sm:min-w-0">
          {/* Track line (full width between first and last node centers) */}
          <div
            className="absolute top-[22px] h-[2px] bg-border sm:top-[22px]"
            style={{ left: edgeInset, right: edgeInset }}
          />

          {/* Progress fill */}
          {shouldAnimate ? (
            <motion.div
              className="absolute top-[22px] h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 origin-left sm:top-[22px]"
              style={{ left: edgeInset, right: edgeInset }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: progressPercent / 100 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: PREMIUM_EASE as unknown as number[],
              }}
            />
          ) : (
            <div
              className="absolute top-[22px] h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 sm:top-[22px]"
              style={{
                left: edgeInset,
                right: edgeInset,
                transform: `scaleX(${progressPercent / 100})`,
                transformOrigin: 'left',
              }}
            />
          )}

          {/* Milestones */}
          {shouldAnimate ? (
            <motion.div
              className="relative flex justify-between"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.5 }}
              variants={{
                initial: {},
                animate: {
                  transition: staggerContainer(STAGGER.standard, 0.4),
                },
              }}
            >
              {milestones.map((milestone) => (
                <motion.div
                  key={milestone.age}
                  variants={staggerItem}
                  className="flex flex-col items-center gap-2.5 snap-center"
                >
                  <MilestoneNode state={milestone.state} />
                  <MilestoneLabel age={milestone.age} title={milestone.title} state={milestone.state} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="relative flex justify-between">
              {milestones.map((milestone) => (
                <div
                  key={milestone.age}
                  className="flex flex-col items-center gap-2.5 snap-center"
                >
                  <MilestoneNode state={milestone.state} />
                  <MilestoneLabel age={milestone.age} title={milestone.title} state={milestone.state} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MilestoneNode({ state }: { state: 'done' | 'current' | 'future' }) {
  if (state === 'done') {
    return (
      <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </div>
    );
  }

  if (state === 'current') {
    return (
      <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-500 bg-white ring-4 ring-emerald-500/20 dark:bg-[#0f1117]">
        <div className="h-3 w-3 rounded-full bg-emerald-500" />
      </div>
    );
  }

  // future
  return (
    <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-muted ring-1 ring-border" />
  );
}

function MilestoneLabel({
  age,
  title,
  state,
}: {
  age: number;
  title: string;
  state: 'done' | 'current' | 'future';
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-[90px]">
      <span
        className={cn(
          'text-sm tabular-nums',
          state === 'current'
            ? 'font-bold text-emerald-600 dark:text-emerald-400'
            : state === 'future'
              ? 'font-medium text-muted-foreground'
              : 'font-medium text-foreground'
        )}
      >
        {age}
      </span>
      <span
        className={cn(
          'text-xs leading-tight mt-0.5',
          state === 'current'
            ? 'font-semibold text-foreground'
            : state === 'future'
              ? 'text-muted-foreground'
              : 'text-muted-foreground'
        )}
      >
        {title}
      </span>
    </div>
  );
}
