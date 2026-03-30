'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ArrowLeft, ArrowRight, Sparkles, BookOpen, Users, Briefcase, Play, Zap, Pencil, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Shared types and data ---

type ActionType = 'Research' | 'Connect' | 'Experience' | 'Explore' | 'Learn' | 'Reflect' | 'Custom';

interface GrowAction {
  id: string;
  title: string;
  subtitle: string;
  type: ActionType;
}

const DEMO_ACTIONS: GrowAction[] = [
  { id: 'research', title: 'Research training programmes', subtitle: 'Entry requirements, deadlines, and locations', type: 'Research' },
  { id: 'talk', title: 'Talk to someone in the field', subtitle: '15 minutes with a professional teaches more than hours online', type: 'Connect' },
  { id: 'hands-on', title: 'Try a hands-on experience', subtitle: 'Volunteering, shadowing, or a small project', type: 'Experience' },
  { id: 'watch', title: 'Watch 3 Day in the Life videos', subtitle: 'Get a broader picture from different perspectives', type: 'Explore' },
  { id: 'skill', title: 'Start building a key skill', subtitle: 'Find an online course, book, or practice opportunity', type: 'Learn' },
  { id: 'reflect', title: 'Reflect on whether this still feels right', subtitle: "It's OK to change direction", type: 'Reflect' },
  { id: 'community', title: 'Join a community', subtitle: 'Connect with people in the field', type: 'Connect' },
  { id: 'portfolio', title: 'Start a portfolio project', subtitle: 'Build something to show what you can do', type: 'Learn' },
];

const TYPE_CONFIG: Record<ActionType, { icon: React.ElementType; color: string; bg: string }> = {
  Research: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  Connect: { icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  Experience: { icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  Explore: { icon: Play, color: 'text-purple-400', bg: 'bg-purple-500/15' },
  Learn: { icon: Zap, color: 'text-rose-400', bg: 'bg-rose-500/15' },
  Reflect: { icon: Pencil, color: 'text-teal-400', bg: 'bg-teal-500/15' },
  Custom: { icon: Target, color: 'text-slate-400', bg: 'bg-slate-500/15' },
};

// --- Component ---

export default function GrowFocusPage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  const remaining = DEMO_ACTIONS.filter(
    (a) => !completedIds.has(a.id) && !skippedIds.has(a.id)
  );
  const completed = DEMO_ACTIONS.filter((a) => completedIds.has(a.id));
  const currentAction = remaining[0] ?? null;
  const comingUp = remaining.slice(1, 4);

  const totalSteps = DEMO_ACTIONS.length - skippedIds.size;
  const currentStepNumber = Math.min(completedIds.size + 1, totalSteps);
  const progressPercent = totalSteps > 0 ? (completedIds.size / totalSteps) * 100 : 100;
  const allDone = remaining.length === 0;

  const markDone = (id: string) => {
    setCompletedIds((prev) => new Set(prev).add(id));
  };

  const skip = (id: string) => {
    setSkippedIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-lg px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/test/journey-v2"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journey
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Grow Prototype: Focus
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One meaningful step at a time.
          </p>
        </div>

        {/* Minimal progress */}
        {!allDone && (
          <div className="mb-10">
            <p className="mb-2 text-sm text-muted-foreground">
              Step {currentStepNumber} of {totalSteps}
            </p>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-muted-foreground/30"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Main focus card or completion state */}
        <AnimatePresence mode="wait">
          {allDone ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-12 flex flex-col items-center text-center py-16"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
                <Sparkles className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                You did it.
              </h2>
              <p className="text-muted-foreground max-w-xs">
                Every step you took brought you closer to where you want to be. Take a moment to appreciate how far you have come.
              </p>
              <div className="mt-8 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-muted-foreground">
                  {completedIds.size} step{completedIds.size !== 1 ? 's' : ''} completed
                </span>
              </div>
            </motion.div>
          ) : currentAction ? (
            <motion.div
              key={currentAction.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mb-12"
            >
              <FocusCard
                action={currentAction}
                onComplete={() => markDone(currentAction.id)}
                onSkip={() => skip(currentAction.id)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Coming up */}
        {comingUp.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              Coming up
            </h3>
            <div className="space-y-2">
              {comingUp.map((action) => {
                const config = TYPE_CONFIG[action.type];
                const Icon = config.icon;
                return (
                  <div
                    key={action.id}
                    className="flex items-center gap-3 py-1.5"
                  >
                    <Icon className={cn('h-3.5 w-3.5', config.color, 'opacity-50')} />
                    <span className="text-sm text-muted-foreground/70">
                      {action.title}
                    </span>
                  </div>
                );
              })}
              {remaining.length > 4 && (
                <p className="text-xs text-muted-foreground/40 pl-6.5">
                  +{remaining.length - 4} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Completed section */}
        {completed.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex w-full items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <span>Completed ({completed.length})</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  showCompleted && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {showCompleted && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    {completed.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-3 py-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/30" />
                        <span className="text-sm text-muted-foreground/40 line-through">
                          {action.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/40 pt-8 pb-8">
          You&apos;re doing great. One step at a time.
        </p>
      </div>
    </div>
  );
}

// --- Focus Card ---

function FocusCard({
  action,
  onComplete,
  onSkip,
}: {
  action: GrowAction;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const config = TYPE_CONFIG[action.type];
  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-8 text-center">
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-full', config.bg)}>
          <Icon className={cn('h-8 w-8', config.color)} />
        </div>
      </div>

      {/* Label */}
      <div className="mb-2 flex items-center justify-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground/50" />
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">
          Your Next Step
        </p>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold mb-2">
        {action.title}
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
        {action.subtitle}
      </p>

      {/* Complete button */}
      <button
        onClick={onComplete}
        className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
      >
        <CheckCircle2 className="h-4 w-4" />
        I&apos;ve done this
      </button>

      {/* Skip link */}
      <div className="mt-4">
        <button
          onClick={onSkip}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          Skip — not for me
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
