'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { JourneyTask, TaskProgressSummary } from '@/lib/journey/tasks/types';
import type { JourneyStage } from '@/lib/journey/career-journey-types';
import type { TaskMode } from '@/lib/journey/tasks/types';
import {
  seedDefaultsIfNeeded,
  getTasks,
  addTask,
  toggleTask,
  removeTask,
  restoreDefaults,
} from '@/lib/journey/tasks/task-store';
import { calculateTaskProgress } from '@/lib/journey/tasks/task-progress';

interface UseJourneyTasksReturn {
  tasks: JourneyTask[];
  progress: TaskProgressSummary;
  isReady: boolean;
  toggle: (taskId: string) => void;
  add: (stageId: JourneyStage, mode: TaskMode, title: string) => void;
  remove: (taskId: string) => void;
  restore: () => void;
}

/**
 * React hook wrapping the localStorage task store.
 * Seeds defaults on first load for a given userId+goalId pair.
 */
export function useJourneyTasks(
  userId: string | undefined,
  goalId: string | undefined
): UseJourneyTasksReturn {
  const [tasks, setTasks] = useState<JourneyTask[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Load tasks on mount or when userId/goalId changes
  useEffect(() => {
    if (!userId || !goalId) {
      setTasks([]);
      setIsReady(false);
      return;
    }

    seedDefaultsIfNeeded(userId, goalId);
    setTasks(getTasks(userId, goalId));
    setIsReady(true);
  }, [userId, goalId]);

  const toggle = useCallback(
    (taskId: string) => {
      if (!userId || !goalId) return;
      toggleTask(userId, goalId, taskId);
      setTasks(getTasks(userId, goalId));
    },
    [userId, goalId]
  );

  const add = useCallback(
    (stageId: JourneyStage, mode: TaskMode, title: string) => {
      if (!userId || !goalId || !title.trim()) return;
      addTask(userId, goalId, { stageId, mode, title: title.trim() });
      setTasks(getTasks(userId, goalId));
    },
    [userId, goalId]
  );

  const remove = useCallback(
    (taskId: string) => {
      if (!userId || !goalId) return;
      removeTask(userId, goalId, taskId);
      setTasks(getTasks(userId, goalId));
    },
    [userId, goalId]
  );

  const restore = useCallback(() => {
    if (!userId || !goalId) return;
    const restored = restoreDefaults(userId, goalId);
    setTasks(restored);
  }, [userId, goalId]);

  const progress = useMemo(() => calculateTaskProgress(tasks), [tasks]);

  return { tasks, progress, isReady, toggle, add, remove, restore };
}
