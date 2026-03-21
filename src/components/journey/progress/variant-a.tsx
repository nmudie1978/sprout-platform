'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { STAGE_ORDER, STAGE_CONFIG, type JourneyStage } from '@/lib/journey/career-journey-types';
import type { JourneyTask, TaskMode } from '@/lib/journey/tasks/types';
import { TASK_MODES, MODE_LABELS, MODE_COLORS } from '@/lib/journey/tasks/types';
import { TaskList } from './task-list';

interface VariantAProps {
  tasks: JourneyTask[];
  onToggle: (taskId: string) => void;
  onRemove: (taskId: string) => void;
  onAdd: (stageId: JourneyStage, mode: TaskMode, title: string) => void;
}

/**
 * Variant A — Stage-Linked Task Lanes
 *
 * Stage selector chips at top, then 3 D/U/A columns below.
 * Stacks on mobile.
 */
export function VariantA({ tasks, onToggle, onRemove, onAdd }: VariantAProps) {
  const [selectedStage, setSelectedStage] = useState<JourneyStage>('foundation');

  const stageTasks = tasks.filter((t) => t.stageId === selectedStage);

  return (
    <div className="space-y-4">
      {/* Stage selector chips */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Career stage">
        {STAGE_ORDER.map((stageId) => {
          const config = STAGE_CONFIG[stageId];
          const isActive = stageId === selectedStage;
          const stageTaskCount = tasks.filter((t) => t.stageId === stageId).length;
          const stageDoneCount = tasks.filter((t) => t.stageId === stageId && t.status === 'done').length;

          return (
            <button
              key={stageId}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedStage(stageId)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isActive
                  ? cn(config.bgClass, config.textClass, 'ring-1', `ring-current/20`)
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
              {stageTaskCount > 0 && (
                <span className={cn(
                  'text-[10px]',
                  isActive ? 'opacity-80' : 'opacity-50'
                )}>
                  {stageDoneCount}/{stageTaskCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* D/U/A Columns */}
      <div className="grid gap-4 md:grid-cols-3">
        {TASK_MODES.map((mode) => {
          const modeTasks = stageTasks.filter((t) => t.mode === mode);
          const colors = MODE_COLORS[mode];

          return (
            <div
              key={mode}
              className={cn(
                'rounded-xl border p-3',
                colors.border,
                colors.bg
              )}
            >
              <TaskList
                tasks={modeTasks}
                mode={mode}
                stageId={selectedStage}
                onToggle={onToggle}
                onRemove={onRemove}
                onAdd={onAdd}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
