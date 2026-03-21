/**
 * Journey Task Store
 *
 * localStorage CRUD store keyed by userId:goalId.
 * Clean function signatures make later DB migration trivial.
 */

import type { JourneyTask, TaskStatus } from './types';
import { DEFAULT_TASKS } from './default-tasks';

// ============================================
// STORAGE KEY
// ============================================

const STORAGE_PREFIX = 'endeavrly:journey-tasks';

function storageKey(userId: string, goalId: string): string {
  return `${STORAGE_PREFIX}:${userId}:${goalId}`;
}

// ============================================
// HELPERS
// ============================================

function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readTasks(userId: string, goalId: string): JourneyTask[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(userId, goalId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTasks(userId: string, goalId: string, tasks: JourneyTask[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(userId, goalId), JSON.stringify(tasks));
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

// ============================================
// SEED DEFAULTS
// ============================================

/**
 * Seeds default tasks for a userId+goalId pair if none exist.
 * Returns true if seeding occurred, false if tasks already existed.
 */
export function seedDefaultsIfNeeded(userId: string, goalId: string): boolean {
  const existing = readTasks(userId, goalId);
  if (existing.length > 0) return false;

  const now = new Date().toISOString();
  const tasks: JourneyTask[] = DEFAULT_TASKS.map((def, index) => ({
    id: generateId(),
    userId,
    goalId,
    stageId: def.stageId,
    mode: def.mode,
    title: def.title,
    notes: '',
    isDefault: true,
    tooltipTitle: def.tooltipTitle,
    tooltipBody: def.tooltipBody,
    status: 'todo' as TaskStatus,
    orderIndex: index,
    createdAt: now,
    updatedAt: now,
  }));

  writeTasks(userId, goalId, tasks);
  return true;
}

// ============================================
// READ
// ============================================

/** Get all tasks for a userId+goalId pair */
export function getTasks(userId: string, goalId: string): JourneyTask[] {
  return readTasks(userId, goalId).sort((a, b) => a.orderIndex - b.orderIndex);
}

// ============================================
// CREATE
// ============================================

/** Add a custom (non-default) task */
export function addTask(
  userId: string,
  goalId: string,
  task: Pick<JourneyTask, 'stageId' | 'mode' | 'title'>
): JourneyTask {
  const tasks = readTasks(userId, goalId);
  const now = new Date().toISOString();

  const newTask: JourneyTask = {
    id: generateId(),
    userId,
    goalId,
    stageId: task.stageId,
    mode: task.mode,
    title: task.title,
    notes: '',
    isDefault: false,
    tooltipTitle: '',
    tooltipBody: '',
    status: 'todo',
    orderIndex: tasks.length,
    createdAt: now,
    updatedAt: now,
  };

  writeTasks(userId, goalId, [...tasks, newTask]);
  return newTask;
}

// ============================================
// UPDATE
// ============================================

/** Toggle task status between todo and done */
export function toggleTask(userId: string, goalId: string, taskId: string): JourneyTask | null {
  const tasks = readTasks(userId, goalId);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  tasks[idx] = {
    ...tasks[idx],
    status: tasks[idx].status === 'done' ? 'todo' : 'done',
    updatedAt: now,
  };

  writeTasks(userId, goalId, tasks);
  return tasks[idx];
}

/** Update task title */
export function updateTaskTitle(
  userId: string,
  goalId: string,
  taskId: string,
  title: string
): JourneyTask | null {
  const tasks = readTasks(userId, goalId);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;

  tasks[idx] = { ...tasks[idx], title, updatedAt: new Date().toISOString() };
  writeTasks(userId, goalId, tasks);
  return tasks[idx];
}

// ============================================
// DELETE
// ============================================

/** Remove a single task */
export function removeTask(userId: string, goalId: string, taskId: string): boolean {
  const tasks = readTasks(userId, goalId);
  const filtered = tasks.filter((t) => t.id !== taskId);
  if (filtered.length === tasks.length) return false;

  writeTasks(userId, goalId, filtered);
  return true;
}

// ============================================
// RESTORE DEFAULTS
// ============================================

/** Reset to default tasks, removing all custom tasks */
export function restoreDefaults(userId: string, goalId: string): JourneyTask[] {
  const now = new Date().toISOString();
  const tasks: JourneyTask[] = DEFAULT_TASKS.map((def, index) => ({
    id: generateId(),
    userId,
    goalId,
    stageId: def.stageId,
    mode: def.mode,
    title: def.title,
    notes: '',
    isDefault: true,
    tooltipTitle: def.tooltipTitle,
    tooltipBody: def.tooltipBody,
    status: 'todo' as TaskStatus,
    orderIndex: index,
    createdAt: now,
    updatedAt: now,
  }));

  writeTasks(userId, goalId, tasks);
  return tasks;
}
