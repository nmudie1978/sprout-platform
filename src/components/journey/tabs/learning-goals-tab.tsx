'use client';

import { useState, useCallback } from 'react';
import { ExternalLink, GraduationCap, Plus, Pencil, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLearningGoals } from '@/hooks/use-learning-goals';
import { getCourseSearchLinks } from '@/lib/learning/course-links';
import {
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  type LearningGoal,
  type LearningGoalCategory,
  type LearningGoalStatus,
} from '@/lib/learning/types';

// ============================================
// ADD / EDIT GOAL DIALOG
// ============================================

interface GoalDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; category: LearningGoalCategory; skills: string[] }) => void;
  initial?: LearningGoal | null;
}

function GoalDialog({ open, onClose, onSave, initial }: GoalDialogProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState<LearningGoalCategory>(initial?.category ?? 'general');
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  }, [skillInput, skills]);

  const handleRemoveSkill = useCallback((skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), category, skills });
    onClose();
  }, [title, category, skills, onSave, onClose]);

  // Generate course links from skills
  const previewLinks = skills.length > 0 ? getCourseSearchLinks(skills[0]) : [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Goal' : 'Add Learning Goal'}</DialogTitle>
          <DialogDescription>
            {initial
              ? 'Update your learning goal details.'
              : 'Set a learning goal to track your progress.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="goal-title" className="text-sm font-medium mb-1.5 block">
              Goal Title
            </label>
            <input
              id="goal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Learn JavaScript basics"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v as LearningGoalCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_CONFIG) as LearningGoalCategory[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {CATEGORY_CONFIG[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div>
            <label htmlFor="skill-input" className="text-sm font-medium mb-1.5 block">
              Skills
            </label>
            <div className="flex gap-2">
              <input
                id="skill-input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill and press Enter"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={50}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Course link preview */}
          {previewLinks.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Course suggestions based on skills:</p>
              <div className="flex flex-wrap gap-2">
                {previewLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                    {link.free && <span className="text-emerald-600">(free)</span>}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {initial ? 'Save Changes' : 'Add Goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// GOAL CARD
// ============================================

function LearningGoalCard({
  goal,
  onEdit,
  onDelete,
  onProgressChange,
}: {
  goal: LearningGoal;
  onEdit: () => void;
  onDelete: () => void;
  onProgressChange: (progress: number) => void;
}) {
  const catConfig = CATEGORY_CONFIG[goal.category];
  const statusConfig = STATUS_CONFIG[goal.status];
  const courseLinks = goal.skills.length > 0 ? getCourseSearchLinks(goal.skills[0]) : [];

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-medium text-sm leading-tight">{goal.title}</h4>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${catConfig.bgClass} ${catConfig.color} border-0`}>
              {catConfig.label}
            </Badge>
            <span className={`text-[10px] font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="Edit goal"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
            title="Delete goal"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Skills */}
      {goal.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {goal.skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Progress</span>
          <span className="text-[11px] font-medium">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={goal.progress}
          onChange={(e) => onProgressChange(Number(e.target.value))}
          className="w-full h-1 accent-primary cursor-pointer"
          aria-label={`Set progress for ${goal.title}`}
        />
      </div>

      {/* Course links */}
      {courseLinks.length > 0 && (
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t">
          <GraduationCap className="h-3 w-3 shrink-0" />
          <span className="shrink-0">Find courses:</span>
          {courseLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-2.5 w-2.5" />
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// FILTER CONTROLS
// ============================================

type FilterCategory = LearningGoalCategory | 'all';
type FilterStatus = LearningGoalStatus | 'all';

// ============================================
// MAIN TAB
// ============================================

export function LearningGoalsTab() {
  const { goals, addGoal, updateGoal, deleteGoal, updateProgress } = useLearningGoals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const handleSave = useCallback(
    (data: { title: string; category: LearningGoalCategory; skills: string[] }) => {
      if (editingGoal) {
        updateGoal(editingGoal.id, data);
      } else {
        addGoal(data);
      }
      setEditingGoal(null);
    },
    [editingGoal, addGoal, updateGoal]
  );

  const handleEdit = useCallback((goal: LearningGoal) => {
    setEditingGoal(goal);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingGoal(null);
  }, []);

  // Filter goals
  const filtered = goals.filter((g) => {
    if (filterCategory !== 'all' && g.category !== filterCategory) return false;
    if (filterStatus !== 'all' && g.status !== filterStatus) return false;
    return true;
  });

  // Summary
  const total = goals.length;
  const completed = goals.filter((g) => g.status === 'completed').length;
  const inProgress = goals.filter((g) => g.status === 'in-progress').length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {total > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{total} goal{total !== 1 ? 's' : ''}</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            {completed} completed
          </span>
          <span className="text-blue-600 dark:text-blue-400">
            {inProgress} in progress
          </span>
        </div>
      )}

      {/* Add Goal + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => { setEditingGoal(null); setDialogOpen(true); }}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>

        {total > 0 && (
          <>
            <Select
              value={filterCategory}
              onValueChange={(v) => setFilterCategory(v as FilterCategory)}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(Object.keys(CATEGORY_CONFIG) as LearningGoalCategory[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {CATEGORY_CONFIG[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as FilterStatus)}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(Object.keys(STATUS_CONFIG) as LearningGoalStatus[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {STATUS_CONFIG[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Goals list */}
      {filtered.length > 0 ? (
        <div className="grid gap-3">
          {filtered.map((goal) => (
            <LearningGoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => handleEdit(goal)}
              onDelete={() => deleteGoal(goal.id)}
              onProgressChange={(p) => updateProgress(goal.id, p)}
            />
          ))}
        </div>
      ) : total > 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No goals match your filters.
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No learning goals yet.</p>
        </div>
      )}

      {/* Add/Edit dialog */}
      <GoalDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        initial={editingGoal}
      />
    </div>
  );
}
