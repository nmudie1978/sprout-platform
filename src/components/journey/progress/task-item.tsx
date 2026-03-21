'use client';

import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { JourneyTask } from '@/lib/journey/tasks/types';

interface TaskItemProps {
  task: JourneyTask;
  onToggle: (taskId: string) => void;
  onRemove: (taskId: string) => void;
}

export function TaskItem({ task, onToggle, onRemove }: TaskItemProps) {
  const isDone = task.status === 'done';
  const hasTooltip = task.tooltipTitle && task.tooltipBody;

  const content = (
    <div
      className={cn(
        'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors',
        'hover:bg-muted/40',
        isDone && 'opacity-70'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
        aria-label={isDone ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
      >
        {isDone ? (
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
        ) : (
          <Circle className="h-4.5 w-4.5 text-muted-foreground/50 hover:text-muted-foreground" />
        )}
      </button>

      {/* Title */}
      <span
        className={cn(
          'flex-1 text-sm leading-tight',
          isDone && 'line-through text-muted-foreground'
        )}
      >
        {task.title}
      </span>

      {/* Delete button (visible on hover) */}
      <button
        onClick={() => onRemove(task.id)}
        className={cn(
          'flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded p-0.5',
          'text-muted-foreground/40 hover:text-destructive'
        )}
        aria-label={`Remove "${task.title}"`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  if (hasTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="text-xs font-medium">{task.tooltipTitle}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{task.tooltipBody}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
