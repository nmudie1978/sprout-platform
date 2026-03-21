'use client';

import { cn } from '@/lib/utils';
import type { TaskProgressSummary } from '@/lib/journey/tasks/types';
import { MODE_LABELS, MODE_COLORS, TASK_MODES } from '@/lib/journey/tasks/types';
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/journey/career-journey-types';

interface DUAProgressBarProps {
  progress: TaskProgressSummary;
  className?: string;
}

/**
 * Segmented D/U/A progress bar with stage breakdown.
 */
export function DUAProgressBar({ progress, className }: DUAProgressBarProps) {
  const { overall, byMode } = progress;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Overall progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Task Progress</span>
        <span className="text-sm text-muted-foreground">
          {overall.done}/{overall.total} completed
        </span>
      </div>

      {/* Overall bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="h-full rounded-full bg-purple-500 transition-all duration-500"
          style={{ width: `${overall.percent}%` }}
        />
      </div>

      {/* D/U/A breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {TASK_MODES.map((mode) => {
          const modeProgress = byMode[mode];
          const colors = MODE_COLORS[mode];
          return (
            <div key={mode} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={cn('text-[11px] font-medium', colors.text)}>
                  {MODE_LABELS[mode]}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {modeProgress.percent}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', colors.progress)}
                  style={{ width: `${modeProgress.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-stage mini bars */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {STAGE_ORDER.map((stageId) => {
          const stageProgress = progress.byStage[stageId];
          const stageConfig = STAGE_CONFIG[stageId];
          return (
            <div key={stageId} className="space-y-0.5">
              <span className={cn('text-[10px] font-medium', stageConfig.textClass)}>
                {stageConfig.label}
              </span>
              <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stageProgress.percent}%`,
                    backgroundColor: stageConfig.color,
                  }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground">
                {stageProgress.done}/{stageProgress.total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
