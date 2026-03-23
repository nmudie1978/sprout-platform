/**
 * Journey Task Types
 *
 * Local-first task planning layer that maps to the career roadmap stages
 * (foundation/education/experience/career) with D/U/A modes within each.
 */

import type { JourneyStage } from '../career-journey-types';

// ============================================
// CORE TYPES
// ============================================

/** Maps to the D·U·A journey lenses but lowercase for task context */
export type TaskMode = 'discover' | 'understand' | 'act';

export type TaskStatus = 'todo' | 'done';

export interface JourneyTask {
  id: string;
  userId: string;
  goalId: string;
  stageId: JourneyStage;
  mode: TaskMode;
  title: string;
  notes: string;
  isDefault: boolean;
  tooltipTitle: string;
  tooltipBody: string;
  status: TaskStatus;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DEFAULT TASK DEFINITION
// ============================================

/** Shape for default tasks before they're hydrated with user/goal IDs */
export interface DefaultTaskDefinition {
  stageId: JourneyStage;
  mode: TaskMode;
  title: string;
  tooltipTitle: string;
  tooltipBody: string;
}

// ============================================
// PROGRESS SUMMARIES
// ============================================

export interface StageTaskSummary {
  stageId: JourneyStage;
  total: number;
  done: number;
  percent: number;
  byMode: Record<TaskMode, { total: number; done: number }>;
}

export interface TaskProgressSummary {
  overall: { total: number; done: number; percent: number };
  byStage: Record<JourneyStage, StageTaskSummary>;
  byMode: Record<TaskMode, { total: number; done: number; percent: number }>;
}

// ============================================
// CONSTANTS
// ============================================

export const TASK_MODES: TaskMode[] = ['discover', 'understand', 'act'];

export const MODE_LABELS: Record<TaskMode, string> = {
  discover: 'Discover',
  understand: 'Understand',
  act: 'Grow',
};

export const MODE_COLORS: Record<TaskMode, {
  text: string;
  bg: string;
  border: string;
  progress: string;
}> = {
  discover: {
    text: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-800',
    progress: 'bg-teal-400',
  },
  understand: {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    progress: 'bg-blue-500',
  },
  act: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    progress: 'bg-emerald-500',
  },
};
