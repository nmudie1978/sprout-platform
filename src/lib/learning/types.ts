/**
 * Learning Goals — Types & Configuration
 */

export type LearningGoalCategory = 'technical' | 'soft-skills' | 'certifications' | 'general';
export type LearningGoalStatus = 'not-started' | 'in-progress' | 'completed';

export interface LearningGoal {
  id: string;
  title: string;
  category: LearningGoalCategory;
  status: LearningGoalStatus;
  skills: string[];
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_CONFIG: Record<
  LearningGoalCategory,
  { label: string; color: string; bgClass: string }
> = {
  technical: {
    label: 'Technical',
    color: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
  },
  'soft-skills': {
    label: 'Soft Skills',
    color: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
  },
  certifications: {
    label: 'Certifications',
    color: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
  },
  general: {
    label: 'General',
    color: 'text-slate-600 dark:text-slate-400',
    bgClass: 'bg-slate-100 dark:bg-slate-900/30',
  },
};

export const STATUS_CONFIG: Record<
  LearningGoalStatus,
  { label: string; color: string }
> = {
  'not-started': { label: 'Not Started', color: 'text-muted-foreground' },
  'in-progress': { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400' },
  completed: { label: 'Completed', color: 'text-emerald-600 dark:text-emerald-400' },
};
