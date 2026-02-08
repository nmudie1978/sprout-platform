'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  isMotionTrialEnabled,
  prefersReducedMotion,
  fadeInUp,
  DURATION,
  PREMIUM_EASE,
} from '@/lib/motion';
import { Card } from '@/components/ui/card';
import { MilestoneTimeline } from '@/components/timeline/milestone-timeline';
import type { TimelineMilestone } from '@/components/timeline/types';

const MILESTONES: TimelineMilestone[] = [
  { age: 15, title: 'First Exploration', state: 'done' },
  { age: 16, title: 'Micro-Job Experience', state: 'done' },
  { age: 17, title: 'Skill Discovery', state: 'current' },
  { age: 18, title: 'Career Direction', state: 'future' },
  { age: 19, title: 'Deep Specialisation', state: 'future' },
  { age: 20, title: 'Industry Entry', state: 'future' },
  { age: 21, title: 'Career Launch', state: 'future' },
];

export function YourTimelineSection() {
  const shouldAnimate = isMotionTrialEnabled() && !prefersReducedMotion();

  const content = (
    <>
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/40 bg-emerald-950/40 px-4 py-1.5 text-xs font-medium text-emerald-300 mb-6">
        <Sparkles className="h-3.5 w-3.5" />
        YOUR TIMELINE
      </div>

      {/* Heading */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
        See the{' '}
        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          whole picture.
        </span>
      </h2>

      {/* Subtext */}
      <p className="text-neutral-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
        Map your journey from first exploration to career launch — one step at a time.
      </p>

      {/* Timeline Card */}
      <Card className="rounded-2xl border-slate-700/60 bg-slate-800/70 backdrop-blur-sm shadow-xl shadow-black/20 overflow-hidden">
        <MilestoneTimeline milestones={MILESTONES} />
      </Card>
    </>
  );

  return (
    <section className="relative z-10 py-20 sm:py-28 bg-slate-900/75 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-5 text-center">
        {shouldAnimate ? (
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{
              duration: DURATION.section,
              ease: PREMIUM_EASE as unknown as number[],
            }}
          >
            {content}
          </motion.div>
        ) : (
          <div>{content}</div>
        )}
      </div>
    </section>
  );
}
