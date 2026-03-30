'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function GrowChecklistPage() {
  const [actions, setActions] = useState<GrowAction[]>(DEMO_ACTIONS);
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>(
    () => Object.fromEntries(DEMO_ACTIONS.map((a) => [a.id, 'todo' as ActionStatus]))
  );
  const [newActionTitle, setNewActionTitle] = useState('');

  const toggleStatus = (id: string) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'done' ? 'todo' : 'done',
    }));
  };

  const removeAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    setStatuses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const addAction = () => {
    const title = newActionTitle.trim();
    if (!title) return;
    const id = `custom-${Date.now()}`;
    const newAction: GrowAction = {
      id,
      title,
      subtitle: 'Your own action',
      type: 'Custom',
    };
    setActions((prev) => [...prev, newAction]);
    setStatuses((prev) => ({ ...prev, [id]: 'todo' }));
    setNewActionTitle('');
  };

  const todoActions = actions.filter((a) => statuses[a.id] !== 'done');
  const doneActions = actions.filter((a) => statuses[a.id] === 'done');
  const completedCount = doneActions.length;
  const totalCount = actions.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const nextBestStep = todoActions[0] ?? null;
  const remainingTodo = todoActions.slice(1);

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
            Grow Prototype: Checklist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Small steps that move you forward.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{completedCount} of {totalCount} completed</span>
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

        {/* Next Best Step */}
        <AnimatePresence mode="wait">
          {nextBestStep && (
            <motion.div
              key={nextBestStep.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Next Best Step</span>
              </div>
              <div
                className="group flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4 cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => toggleStatus(nextBestStep.id)}
              >
                <button
                  className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(nextBestStep.id);
                  }}
                >
                  <Circle className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{nextBestStep.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {nextBestStep.subtitle}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {nextBestStep.type}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Todo list */}
        {remainingTodo.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Up next
            </h2>
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {remainingTodo.map((action) => (
                  <ActionRow
                    key={action.id}
                    action={action}
                    status="todo"
                    onToggle={() => toggleStatus(action.id)}
                    onRemove={() => removeAction(action.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Add action input */}
        <div className="mb-8">
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3">
            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addAction();
              }}
              placeholder="Add your own action..."
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
            />
            {newActionTitle.trim() && (
              <button
                onClick={addAction}
                className="shrink-0 rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Add
              </button>
            )}
          </div>
        </div>

        {/* Completed list */}
        <AnimatePresence>
          {doneActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Completed
              </h2>
              <div className="space-y-1">
                <AnimatePresence initial={false}>
                  {doneActions.map((action) => (
                    <ActionRow
                      key={action.id}
                      action={action}
                      status="done"
                      onToggle={() => toggleStatus(action.id)}
                      onRemove={() => removeAction(action.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/60 pt-4 pb-8">
          These are suggestions, not homework.
        </p>
      </div>
    </div>
  );
}

function ActionRow({
  action,
  status,
  onToggle,
  onRemove,
}: {
  action: GrowAction;
  status: ActionStatus;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const isDone = status === 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/40',
        isDone && 'opacity-50'
      )}
    >
      <button
        onClick={onToggle}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
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
      <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        {action.type}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="shrink-0 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-foreground transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
