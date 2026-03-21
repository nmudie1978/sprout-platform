/**
 * Task Progress Calculator
 *
 * Derives progress summaries from task arrays.
 * Pure functions — no side effects, no storage access.
 */

import type { JourneyStage } from '../career-journey-types';
import { STAGE_ORDER } from '../career-journey-types';
import type { JourneyTask, TaskMode, StageTaskSummary, TaskProgressSummary } from './types';
import { TASK_MODES } from './types';

// ============================================
// PER-STAGE PROGRESS
// ============================================

export function calculateStageProgress(
  tasks: JourneyTask[],
  stageId: JourneyStage
): StageTaskSummary {
  const stageTasks = tasks.filter((t) => t.stageId === stageId);
  const total = stageTasks.length;
  const done = stageTasks.filter((t) => t.status === 'done').length;

  const byMode = {} as Record<TaskMode, { total: number; done: number }>;
  for (const mode of TASK_MODES) {
    const modeTasks = stageTasks.filter((t) => t.mode === mode);
    byMode[mode] = {
      total: modeTasks.length,
      done: modeTasks.filter((t) => t.status === 'done').length,
    };
  }

  return {
    stageId,
    total,
    done,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
    byMode,
  };
}

// ============================================
// PER-MODE PROGRESS
// ============================================

export function calculateModeProgress(
  tasks: JourneyTask[],
  mode: TaskMode
): { total: number; done: number; percent: number } {
  const modeTasks = tasks.filter((t) => t.mode === mode);
  const total = modeTasks.length;
  const done = modeTasks.filter((t) => t.status === 'done').length;
  return {
    total,
    done,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

// ============================================
// OVERALL PROGRESS
// ============================================

export function calculateTaskProgress(tasks: JourneyTask[]): TaskProgressSummary {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;

  const byStage = {} as Record<JourneyStage, StageTaskSummary>;
  for (const stageId of STAGE_ORDER) {
    byStage[stageId] = calculateStageProgress(tasks, stageId);
  }

  const byMode = {} as Record<TaskMode, { total: number; done: number; percent: number }>;
  for (const mode of TASK_MODES) {
    byMode[mode] = calculateModeProgress(tasks, mode);
  }

  return {
    overall: {
      total,
      done,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    },
    byStage,
    byMode,
  };
}
