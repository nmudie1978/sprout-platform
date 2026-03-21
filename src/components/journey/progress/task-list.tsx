'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import type { JourneyTask, TaskMode } from '@/lib/journey/tasks/types';
import { MODE_LABELS, MODE_COLORS } from '@/lib/journey/tasks/types';
import { cn } from '@/lib/utils';
import { TaskItem } from './task-item';
import { AddTaskForm } from './add-task-form';
import type { JourneyStage } from '@/lib/journey/career-journey-types';

interface TaskListProps {
  tasks: JourneyTask[];
  mode: TaskMode;
  stageId: JourneyStage;
  onToggle: (taskId: string) => void;
  onRemove: (taskId: string) => void;
  onAdd: (stageId: JourneyStage, mode: TaskMode, title: string) => void;
  /** Compact mode hides the mode header */
  compact?: boolean;
}

export function TaskList({
  tasks,
  mode,
  stageId,
  onToggle,
  onRemove,
  onAdd,
  compact = false,
}: TaskListProps) {
  const colors = MODE_COLORS[mode];
  const done = tasks.filter((t) => t.status === 'done').length;
  const total = tasks.length;

  return (
    <div className="space-y-1">
      {/* Mode header */}
      {!compact && (
        <div className="flex items-center justify-between px-1 mb-1.5">
          <h4 className={cn('text-xs font-semibold uppercase tracking-wider', colors.text)}>
            {MODE_LABELS[mode]}
          </h4>
          {total > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {done}/{total}
            </span>
          )}
        </div>
      )}

      {/* Task items */}
      <TooltipProvider>
        <div className="space-y-0.5">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onRemove={onRemove}
            />
          ))}
        </div>
      </TooltipProvider>

      {/* Add task form */}
      <AddTaskForm
        stageId={stageId}
        mode={mode}
        onAdd={onAdd}
      />
    </div>
  );
}
