'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, BookOpen, Users, Briefcase, Play, Zap, Pencil, Target, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// SHARED TYPES & DATA
// ============================================

type ActionStatus = 'todo' | 'in_progress' | 'done';

interface GrowAction {
  id: string;
  title: string;
  subtitle: string;
  type: string;
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

const TYPE_CONFIG: Record<string, { icon: typeof BookOpen; color: string; bg: string; label: string }> = {
  Research: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Research' },
  Connect: { icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Connect' },
  Experience: { icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Experience' },
  Explore: { icon: Play, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Explore' },
  Learn: { icon: Zap, color: 'text-teal-400', bg: 'bg-teal-500/10', label: 'Learn' },
  Reflect: { icon: Pencil, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Reflect' },
  Custom: { icon: Target, color: 'text-sky-400', bg: 'bg-sky-500/10', label: 'Custom' },
};

// ============================================
// PAGE COMPONENT
// ============================================

export default function GrowCardsPage() {
  const [actions] = useState<GrowAction[]>(DEMO_ACTIONS);
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>(
    () => Object.fromEntries(DEMO_ACTIONS.map((a) => [a.id, 'todo' as ActionStatus]))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right

  const completedIds = new Set(
    Object.entries(statuses)
      .filter(([, s]) => s === 'done')
      .map(([id]) => id)
  );

  const pendingActions = actions.filter((a) => !completedIds.has(a.id));
  const completedActions = actions.filter((a) => completedIds.has(a.id));

  // Clamp current index to pending actions
  const safeIndex = Math.min(currentIndex, Math.max(0, pendingActions.length - 1));
  const currentAction = pendingActions[safeIndex] ?? null;

  const markComplete = (id: string) => {
    setStatuses((prev) => ({ ...prev, [id]: 'done' }));
    // After completing, stay at current index (next card slides in)
    // but clamp if we're at the end
    if (safeIndex >= pendingActions.length - 1) {
      setCurrentIndex(Math.max(0, safeIndex - 1));
    }
    setDirection(1);
  };

  const skipAction = () => {
    // Move current action to the end by going to next
    if (pendingActions.length > 1) {
      navigate(1);
    }
  };

  const navigate = (dir: number) => {
    if (pendingActions.length === 0) return;
    setDirection(dir);
    setCurrentIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return pendingActions.length - 1;
      if (next >= pendingActions.length) return 0;
      return next;
    });
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/test/journey-v2"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journey
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Grow Prototype: Cards
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Focus on one action at a time.
          </p>
        </div>

        {/* Progress dots */}
        <div className="mb-8 flex items-center justify-center gap-2 flex-wrap">
          {actions.map((action, i) => {
            const isDone = completedIds.has(action.id);
            const pendingIdx = pendingActions.indexOf(action);
            const isCurrent = !isDone && pendingIdx === safeIndex;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (isDone) return;
                  setDirection(pendingIdx > safeIndex ? 1 : -1);
                  setCurrentIndex(pendingIdx);
                }}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-all duration-300',
                  isDone && 'bg-emerald-500',
                  isCurrent && 'ring-2 ring-foreground/40 ring-offset-2 ring-offset-background bg-foreground/60',
                  !isDone && !isCurrent && 'bg-muted-foreground/20'
                )}
                title={action.title}
              />
            );
          })}
        </div>

        {/* Main card area */}
        <div className="relative mb-8" style={{ minHeight: 320 }}>
          {pendingActions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
              <h2 className="text-lg font-semibold mb-1">All done!</h2>
              <p className="text-sm text-muted-foreground">
                You have completed every action. Amazing progress.
              </p>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Left nav */}
              <button
                onClick={() => navigate(-1)}
                disabled={pendingActions.length <= 1}
                className="shrink-0 p-2 rounded-full text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Card */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  {currentAction && (
                    <motion.div
                      key={currentAction.id}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="w-full"
                    >
                      {(() => {
                        const config = TYPE_CONFIG[currentAction.type] || TYPE_CONFIG.Custom;
                        const ActionIcon = config.icon;
                        return (
                          <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
                            {/* Type badge */}
                            <div className="flex items-center gap-2.5 mb-6">
                              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', config.bg)}>
                                <ActionIcon className={cn('h-4.5 w-4.5', config.color)} />
                              </div>
                              <span className={cn('text-xs font-medium tracking-wide uppercase', config.color)}>
                                {config.label}
                              </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-lg font-semibold text-foreground/90 leading-snug mb-2">
                              {currentAction.title}
                            </h2>

                            {/* Subtitle */}
                            <p className="text-sm text-muted-foreground/60 leading-relaxed mb-8">
                              {currentAction.subtitle}
                            </p>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={skipAction}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/40 border border-border/20 transition-colors"
                              >
                                <SkipForward className="h-3.5 w-3.5" />
                                Skip for now
                              </button>
                              <button
                                onClick={() => markComplete(currentAction.id)}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark Complete
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right nav */}
              <button
                onClick={() => navigate(1)}
                disabled={pendingActions.length <= 1}
                className="shrink-0 p-2 rounded-full text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Card position indicator */}
        {pendingActions.length > 0 && (
          <p className="text-center text-xs text-muted-foreground/40 mb-8">
            {safeIndex + 1} of {pendingActions.length} remaining
          </p>
        )}

        {/* Completed section */}
        {completedActions.length > 0 && (
          <div className="border-t border-border/20 pt-6">
            <p className="text-xs font-medium text-muted-foreground/50 mb-3">
              Completed ({completedActions.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {completedActions.map((action) => {
                const config = TYPE_CONFIG[action.type] || TYPE_CONFIG.Custom;
                const ActionIcon = config.icon;
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-emerald-500/15 bg-emerald-500/[0.05] text-emerald-400/70'
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {action.title}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground/30">
            One step at a time.
          </p>
        </div>
      </div>
    </div>
  );
}
