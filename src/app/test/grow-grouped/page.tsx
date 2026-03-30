'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ArrowLeft, Plus, BookOpen, Users, Briefcase, Play, Zap, Pencil, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// SHARED TYPES
// ============================================

type ActionStatus = 'todo' | 'in_progress' | 'done';

interface GrowAction {
  id: string;
  title: string;
  subtitle: string;
  type: string;
}

// ============================================
// TYPE CONFIG — icon + colour per action type
// ============================================

const TYPE_CONFIG: Record<string, { icon: typeof BookOpen; color: string; bg: string }> = {
  Research:   { icon: BookOpen,  color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  Connect:    { icon: Users,     color: 'text-violet-400', bg: 'bg-violet-400/10' },
  Experience: { icon: Briefcase, color: 'text-amber-400',  bg: 'bg-amber-400/10' },
  Explore:    { icon: Play,      color: 'text-emerald-400',bg: 'bg-emerald-400/10' },
  Learn:      { icon: Zap,       color: 'text-cyan-400',   bg: 'bg-cyan-400/10' },
  Reflect:    { icon: Pencil,    color: 'text-rose-400',   bg: 'bg-rose-400/10' },
  Custom:     { icon: Target,    color: 'text-muted-foreground', bg: 'bg-muted' },
};

// ============================================
// DEMO ACTIONS
// ============================================

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

export default function GrowGroupedPage() {
  const [actions, setActions] = useState<GrowAction[]>(DEMO_ACTIONS);
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>(
    () => Object.fromEntries(DEMO_ACTIONS.map((a) => [a.id, 'todo' as ActionStatus]))
  );
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [newActionTitle, setNewActionTitle] = useState('');

  // Derive groups
  const groupOrder: string[] = [];
  const grouped: Record<string, GrowAction[]> = {};
  for (const action of actions) {
    if (!grouped[action.type]) {
      grouped[action.type] = [];
      groupOrder.push(action.type);
    }
    grouped[action.type].push(action);
  }

  // Overall progress
  const completedCount = actions.filter((a) => statuses[a.id] === 'done').length;
  const totalCount = actions.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleStatus = (id: string) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'done' ? 'todo' : 'done',
    }));
  };

  const toggleGroup = (type: string) => {
    setExpandedGroups((prev) => ({ ...prev, [type]: !isGroupExpanded(type) }));
  };

  const isGroupExpanded = (type: string): boolean => {
    // If explicitly set, use that
    if (expandedGroups[type] !== undefined) return expandedGroups[type];
    // Default: expanded if any item is still todo, collapsed if all done
    const groupActions = grouped[type] || [];
    return groupActions.some((a) => statuses[a.id] !== 'done');
  };

  const addActionToGroup = (type: string) => {
    const title = newActionTitle.trim();
    if (!title) return;
    const id = `custom-${Date.now()}`;
    const newAction: GrowAction = { id, title, subtitle: 'Your own action', type };
    setActions((prev) => [...prev, newAction]);
    setStatuses((prev) => ({ ...prev, [id]: 'todo' }));
    setNewActionTitle('');
    setAddingToGroup(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8">
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
            Grow Prototype: Grouped
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See your progress by category.
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{completedCount} of {totalCount} actions completed</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-muted-foreground/40"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Grouped sections */}
        <div className="space-y-3">
          {groupOrder.map((type) => {
            const groupActions = grouped[type];
            const config = TYPE_CONFIG[type] || TYPE_CONFIG.Custom;
            const Icon = config.icon;
            const doneInGroup = groupActions.filter((a) => statuses[a.id] === 'done').length;
            const totalInGroup = groupActions.length;
            const allDone = doneInGroup === totalInGroup;
            const groupProgress = totalInGroup > 0 ? (doneInGroup / totalInGroup) * 100 : 0;
            const expanded = isGroupExpanded(type);

            return (
              <div
                key={type}
                className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden"
              >
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(type)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config.bg)}>
                    {allDone ? (
                      <CheckCircle2 className={cn('h-4 w-4', config.color)} />
                    ) : (
                      <Icon className={cn('h-4 w-4', config.color)} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-xs text-muted-foreground">
                        {doneInGroup}/{totalInGroup}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1 h-1 w-full max-w-[120px] rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          allDone ? 'bg-emerald-400/60' : 'bg-muted-foreground/30'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${groupProgress}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                      expanded && 'rotate-180'
                    )}
                  />
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/30 px-2 py-1">
                        {groupActions.map((action) => {
                          const isDone = statuses[action.id] === 'done';
                          return (
                            <motion.div
                              key={action.id}
                              layout
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.15 }}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40 cursor-pointer',
                                isDone && 'opacity-50'
                              )}
                              onClick={() => toggleStatus(action.id)}
                            >
                              <button
                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStatus(action.id);
                                }}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    'text-sm font-medium truncate',
                                    isDone && 'line-through text-muted-foreground'
                                  )}
                                >
                                  {action.title}
                                </p>
                                <p
                                  className={cn(
                                    'text-xs text-muted-foreground truncate',
                                    isDone && 'line-through'
                                  )}
                                >
                                  {action.subtitle}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Add action row */}
                        {addingToGroup === type ? (
                          <div className="flex items-center gap-3 px-3 py-2.5">
                            <Plus className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                            <input
                              type="text"
                              autoFocus
                              value={newActionTitle}
                              onChange={(e) => setNewActionTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addActionToGroup(type);
                                if (e.key === 'Escape') {
                                  setAddingToGroup(null);
                                  setNewActionTitle('');
                                }
                              }}
                              onBlur={() => {
                                if (!newActionTitle.trim()) {
                                  setAddingToGroup(null);
                                  setNewActionTitle('');
                                }
                              }}
                              placeholder="Add an action..."
                              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
                            />
                            {newActionTitle.trim() && (
                              <button
                                onClick={() => addActionToGroup(type)}
                                className="shrink-0 rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAddingToGroup(type);
                              setNewActionTitle('');
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                          >
                            <Plus className="h-5 w-5 shrink-0" />
                            <span className="text-sm">Add action</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/60 pt-8 pb-8">
          These are suggestions — add your own, skip what doesn't fit.
        </p>
      </div>
    </div>
  );
}
