'use client';

import { useSession } from 'next-auth/react';
import { ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJourneyTasks } from '@/hooks/use-journey-tasks';
import { DUAProgressBar } from './dua-progress-bar';
import { RestoreDefaultsButton } from './restore-defaults-button';
import { VariantA } from './variant-a';

interface ProgressSectionProps {
  goalId: string | undefined;
}

/**
 * Orchestrator component that renders the task-based progress section
 * below the career timeline.
 */
export function ProgressSection({ goalId }: ProgressSectionProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { tasks, progress, isReady, toggle, add, remove, restore } = useJourneyTasks(
    userId,
    goalId
  );

  // Don't render until we have userId AND goalId
  if (!userId || !goalId) return null;

  // Don't render until tasks are loaded from localStorage
  if (!isReady) return null;

  // Empty state — no tasks at all
  if (tasks.length === 0) {
    return (
      <section className="mt-8">
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 text-center">
          <ListChecks className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">No tasks yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Add your first task to start tracking your progress.
          </p>
          <RestoreDefaultsButton
            onRestore={restore}
            className="mt-3 mx-auto justify-center"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-semibold">Your Progress</h2>
        </div>
        <RestoreDefaultsButton onRestore={restore} />
      </div>

      {/* D/U/A Progress bar — shown for all variants */}
      <DUAProgressBar progress={progress} />

      <VariantA
        tasks={tasks}
        onToggle={toggle}
        onRemove={remove}
        onAdd={add}
      />
    </section>
  );
}
