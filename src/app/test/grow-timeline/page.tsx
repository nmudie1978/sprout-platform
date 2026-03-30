'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ArrowLeft, Plus, Trash2, Sparkles, BookOpen, Users, Briefcase, Play, Zap, Pencil, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES & CONFIG
// ============================================

type ActionStatus = 'todo' | 'done';

interface GrowAction {
  id: string;
  title: string;
  subtitle: string;
  type: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof BookOpen; color: string }> = {
  Research: { icon: BookOpen, color: 'text-blue-400' },
  Connect: { icon: Users, color: 'text-violet-400' },
  Experience: { icon: Briefcase, color: 'text-amber-400' },
  Explore: { icon: Play, color: 'text-red-400' },
  Learn: { icon: Zap, color: 'text-teal-400' },
  Reflect: { icon: Pencil, color: 'text-emerald-400' },
  Custom: { icon: Target, color: 'text-muted-foreground' },
};

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

// ============================================
// MAIN PAGE
// ============================================

export default function GrowTimelinePage() {
  const [actions, setActions] = useState<GrowAction[]>(DEMO_ACTIONS);
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>({});
  const [addingCustom, setAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const doneCount = Object.values(statuses).filter((s) => s === 'done').length;
  const totalCount = actions.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  // Find the first todo action (the "next up" action)
  const nextUpId = actions.find((a) => statuses[a.id] !== 'done')?.id ?? null;

  function toggleStatus(id: string) {
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'done' ? 'todo' : 'done',
    }));
  }

  function removeAction(id: string) {
    setActions((prev) => prev.filter((a) => a.id !== id));
    setStatuses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function addCustomAction() {
    if (!customTitle.trim()) return;
    const newAction: GrowAction = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      subtitle: 'Your own step',
      type: 'Custom',
    };
    setActions((prev) => [...prev, newAction]);
    setCustomTitle('');
    setAddingCustom(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/test/journey-v2"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-semibold tracking-tight">
              Grow Prototype: Timeline
            </h1>
            <p className="text-xs text-muted-foreground">
              Milestone timeline layout
            </p>
          </div>
          <Sparkles className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-foreground/80">
              {doneCount} of {totalCount} steps completed
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
            <motion.div
              className="h-full rounded-full bg-emerald-500/70"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {actions.map((action, index) => {
              const isDone = statuses[action.id] === 'done';
              const isNextUp = action.id === nextUpId;
              const isLast = index === actions.length - 1;
              const prevDone = index > 0 && statuses[actions[index - 1].id] === 'done';
              const config = TYPE_CONFIG[action.type] ?? TYPE_CONFIG.Custom;
              const Icon = config.icon;

              // Line between this node and the next should be solid if this node is done
              const lineSolid = isDone;

              return (
                <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="relative flex gap-4"
                >
                  {/* Timeline column: node + line */}
                  <div className="flex flex-col items-center">
                    {/* Node */}
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                      {isDone ? (
                        <motion.div
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <CheckCircle2 className="h-6 w-6 text-emerald-500/80" />
                        </motion.div>
                      ) : (
                        <div className="relative">
                          {isNextUp && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-emerald-500/20"
                              animate={{
                                scale: [1, 1.8, 1],
                                opacity: [0.4, 0, 0.4],
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                          )}
                          <Circle
                            className={cn(
                              'h-6 w-6',
                              isNextUp
                                ? 'text-emerald-500/60'
                                : 'text-muted-foreground/30',
                            )}
                          />
                          <div
                            className={cn(
                              'absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                              isNextUp
                                ? 'bg-emerald-500/60'
                                : 'bg-muted-foreground/20',
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Connecting line */}
                    {!isLast && (
                      <div
                        className={cn(
                          'w-px flex-1 min-h-[24px]',
                          lineSolid
                            ? 'bg-emerald-500/30'
                            : 'border-l border-dashed border-muted-foreground/20',
                        )}
                      />
                    )}
                  </div>

                  {/* Action card */}
                  <div
                    className={cn(
                      'group mb-4 flex-1 rounded-xl border p-4 transition-all duration-200',
                      isDone
                        ? 'border-border/30 bg-muted/20'
                        : isNextUp
                          ? 'border-emerald-500/20 bg-card shadow-sm'
                          : 'border-border/40 bg-card/60',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type icon */}
                      <div
                        className={cn(
                          'mt-0.5 rounded-lg p-1.5 transition-opacity',
                          isDone ? 'opacity-40' : 'opacity-100',
                          isDone ? 'bg-muted/40' : 'bg-muted/60',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isDone ? 'text-muted-foreground/50' : config.color,
                          )}
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium leading-tight transition-all',
                            isDone
                              ? 'text-muted-foreground/50 line-through decoration-muted-foreground/30'
                              : 'text-foreground/90',
                          )}
                        >
                          {action.title}
                        </p>
                        <p
                          className={cn(
                            'mt-0.5 text-xs leading-relaxed',
                            isDone
                              ? 'text-muted-foreground/30'
                              : 'text-muted-foreground/70',
                          )}
                        >
                          {action.subtitle}
                        </p>

                        {/* Type badge */}
                        <span
                          className={cn(
                            'mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                            isDone
                              ? 'bg-muted/30 text-muted-foreground/30'
                              : 'bg-muted/50 text-muted-foreground/60',
                          )}
                        >
                          {action.type}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        {action.id.startsWith('custom-') && (
                          <button
                            onClick={() => removeAction(action.id)}
                            className="rounded-md p-1.5 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive/70 group-hover:opacity-100"
                            aria-label="Remove action"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleStatus(action.id)}
                          className={cn(
                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                            isDone
                              ? 'text-muted-foreground/50 hover:bg-muted/40 hover:text-muted-foreground/70'
                              : isNextUp
                                ? 'bg-emerald-500/10 text-emerald-400/80 hover:bg-emerald-500/20'
                                : 'text-muted-foreground/50 hover:bg-muted/40 hover:text-muted-foreground/70',
                          )}
                        >
                          {isDone ? 'Undo' : 'Mark done'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add custom action */}
          <div className="relative flex gap-4">
            {/* Timeline column: end node */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                <Plus className="h-4 w-4 text-muted-foreground/30" />
              </div>
            </div>

            {/* Add button / form */}
            <div className="flex-1 pb-4">
              <AnimatePresence mode="wait">
                {addingCustom ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-border/40 bg-card p-4"
                  >
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addCustomAction();
                        if (e.key === 'Escape') {
                          setAddingCustom(false);
                          setCustomTitle('');
                        }
                      }}
                      placeholder="What do you want to do next?"
                      className="w-full rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-muted-foreground/20"
                      autoFocus
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={addCustomAction}
                        disabled={!customTitle.trim()}
                        className="rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/15 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Add step
                      </button>
                      <button
                        onClick={() => {
                          setAddingCustom(false);
                          setCustomTitle('');
                        }}
                        className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground/70"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setAddingCustom(true)}
                    className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border/30 px-4 py-3 text-sm text-muted-foreground/40 transition-colors hover:border-border/50 hover:text-muted-foreground/60"
                  >
                    <Plus className="h-4 w-4" />
                    Add your own step
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-border/20 pt-6 text-center">
          <p className="text-xs text-muted-foreground/40">
            Move at your own pace — there&apos;s no deadline.
          </p>
        </div>
      </main>
    </div>
  );
}
