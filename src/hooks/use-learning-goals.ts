'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  LearningGoal,
  LearningGoalCategory,
  LearningGoalStatus,
} from '@/lib/learning/types';

const STORAGE_KEY = 'endeavrly-learning-goals';

function loadGoals(): LearningGoal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useLearningGoals() {
  const [goals, setGoals] = useState<LearningGoal[]>(() => loadGoals());

  // Persist to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    }
  }, [goals]);

  const addGoal = useCallback(
    (data: { title: string; category: LearningGoalCategory; skills: string[] }) => {
      const now = new Date().toISOString();
      const goal: LearningGoal = {
        id: crypto.randomUUID(),
        title: data.title,
        category: data.category,
        status: 'not-started',
        skills: data.skills,
        progress: 0,
        createdAt: now,
        updatedAt: now,
      };
      setGoals((prev) => [goal, ...prev]);
    },
    []
  );

  const updateGoal = useCallback(
    (
      id: string,
      updates: Partial<Pick<LearningGoal, 'title' | 'category' | 'skills'>>
    ) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id
            ? { ...g, ...updates, updatedAt: new Date().toISOString() }
            : g
        )
      );
    },
    []
  );

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const clamped = Math.min(100, Math.max(0, progress));
        const status: LearningGoalStatus =
          clamped === 100 ? 'completed' : clamped > 0 ? 'in-progress' : 'not-started';
        return { ...g, progress: clamped, status, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const updateStatus = useCallback((id: string, status: LearningGoalStatus) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const progress = status === 'completed' ? 100 : status === 'not-started' ? 0 : g.progress;
        return { ...g, status, progress, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  return { goals, addGoal, updateGoal, deleteGoal, updateProgress, updateStatus };
}
