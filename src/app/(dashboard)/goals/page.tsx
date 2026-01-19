"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Star,
  Clock,
  ChevronRight,
  CheckCircle2,
  X,
  Compass,
  BookOpen,
  Briefcase,
  Lightbulb,
  ArrowRight,
  StickyNote,
} from "lucide-react";
import type {
  CareerGoal,
  GoalSlot,
  GoalStatus,
  GoalConfidence,
  GoalTimeframe,
  NextStep,
} from "@/lib/goals/types";
import {
  STATUS_CONFIG,
  CONFIDENCE_CONFIG,
  TIMEFRAME_CONFIG,
  SUGGESTED_ACTIONS_BY_CAREER,
  ONBOARDING_SUGGESTIONS,
  createEmptyGoal,
} from "@/lib/goals/types";
import { GoalPodcasts } from "@/components/goal-podcasts";
import { WorkplaceInsightPlaceholder } from "@/components/goals/WorkplaceInsightPlaceholder";

// Note type for the Notes/Journal feature
interface UserNote {
  id: string;
  content: string;
  createdAt: string;
}

// Goal Card Component
function GoalCard({
  goal,
  slot,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onClear,
  editForm,
  setEditForm,
}: {
  goal: CareerGoal | null;
  slot: GoalSlot;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClear: () => void;
  editForm: CareerGoal | null;
  setEditForm: (form: CareerGoal | null) => void;
}) {
  const isPrimary = slot === "primary";

  const addNextStep = () => {
    if (!editForm || editForm.nextSteps.length >= 5) return;
    setEditForm({
      ...editForm,
      nextSteps: [
        ...editForm.nextSteps,
        { id: crypto.randomUUID(), text: "", completed: false },
      ],
    });
  };

  const updateNextStep = (id: string, text: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      nextSteps: editForm.nextSteps.map((s) =>
        s.id === id ? { ...s, text } : s
      ),
    });
  };

  const removeNextStep = (id: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      nextSteps: editForm.nextSteps.filter((s) => s.id !== id),
    });
  };

  const addSkill = (skill: string) => {
    if (!editForm || !skill.trim() || editForm.skills.length >= 8) return;
    if (editForm.skills.includes(skill.trim())) return;
    setEditForm({
      ...editForm,
      skills: [...editForm.skills, skill.trim()],
    });
  };

  const removeSkill = (skill: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter((s) => s !== skill),
    });
  };

  // Empty state - show placeholder
  if (!goal && !isEditing) {
    return (
      <Card
        className={`border-2 border-dashed ${
          isPrimary
            ? "border-purple-300 dark:border-purple-700"
            : "border-slate-300 dark:border-slate-700"
        }`}
      >
        <CardContent className="py-8 text-center">
          <div
            className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isPrimary
                ? "bg-purple-100 dark:bg-purple-900/50"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            <Target
              className={`h-6 w-6 ${
                isPrimary
                  ? "text-purple-500"
                  : "text-slate-500"
              }`}
            />
          </div>
          <h3 className="font-semibold mb-1">
            {isPrimary ? "No Primary Goal Set" : "No Secondary Goal"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isPrimary
              ? "Set a primary career goal to get personalized suggestions"
              : "Add a backup goal you're exploring"}
          </p>
          <Link href="/careers">
            <Button
              variant={isPrimary ? "default" : "outline"}
              className={isPrimary ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <Compass className="h-4 w-4 mr-2" />
              Explore Careers
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Editing state
  if (isEditing && editForm) {
    return (
      <Card
        className={`border-2 ${
          isPrimary
            ? "border-purple-500 dark:border-purple-600"
            : "border-slate-400 dark:border-slate-600"
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPrimary && <Star className="h-5 w-5 text-purple-500" />}
              <span className="text-sm font-medium text-muted-foreground">
                {isPrimary ? "Primary Goal" : "Secondary Goal"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                className={isPrimary ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1 block">Career Goal</label>
            <Input
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              placeholder="e.g., Software Developer"
              className="text-lg font-semibold"
            />
          </div>

          {/* Status & Confidence & Timeframe Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={editForm.status}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, status: v as GoalStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exploring">Exploring</SelectItem>
                  <SelectItem value="committed">Committed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Confidence</label>
              <Select
                value={editForm.confidence}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, confidence: v as GoalConfidence })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Timeframe</label>
              <Select
                value={editForm.timeframe}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, timeframe: v as GoalTimeframe })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-year">This year</SelectItem>
                  <SelectItem value="1-2-years">1-2 years</SelectItem>
                  <SelectItem value="3-plus-years">3+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Why */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Why this goal?
            </label>
            <Textarea
              value={editForm.why}
              onChange={(e) =>
                setEditForm({ ...editForm, why: e.target.value })
              }
              placeholder="What draws you to this career?"
              className="resize-none"
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Next Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Next Steps</label>
              <span className="text-xs text-muted-foreground">
                {editForm.nextSteps.length}/5
              </span>
            </div>
            <div className="space-y-2">
              {editForm.nextSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-2">
                  <Input
                    value={step.text}
                    onChange={(e) => updateNextStep(step.id, e.target.value)}
                    placeholder="e.g., Research required qualifications"
                    className="flex-1"
                    maxLength={200}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNextStep(step.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {editForm.nextSteps.length < 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNextStep}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Step
                </Button>
              )}
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Skills to Build</label>
              <span className="text-xs text-muted-foreground">
                {editForm.skills.length}/8
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {editForm.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                  onClick={() => removeSkill(skill)}
                >
                  {skill}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            {editForm.skills.length < 8 && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                  maxLength={50}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display state
  const statusConfig = STATUS_CONFIG[goal!.status];
  const confidenceConfig = CONFIDENCE_CONFIG[goal!.confidence];
  const timeframeConfig = TIMEFRAME_CONFIG[goal!.timeframe];

  return (
    <Card
      className={`${
        isPrimary
          ? "border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/30 dark:to-background"
          : "border border-slate-200 dark:border-slate-800"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isPrimary && <Star className="h-5 w-5 text-purple-500 fill-purple-500" />}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isPrimary ? "Primary Goal" : "Secondary Goal"}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="h-8 w-8 text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardTitle
          className={`text-xl ${isPrimary ? "text-purple-900 dark:text-purple-100" : ""}`}
        >
          {goal!.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          <Badge variant="outline" className={confidenceConfig.color}>
            {confidenceConfig.label} confidence
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {timeframeConfig.label}
          </Badge>
        </div>

        {/* Why */}
        {goal!.why && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <span className="font-medium">Why: </span>
            {goal!.why}
          </div>
        )}

        {/* Next Steps */}
        {goal!.nextSteps.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Next Steps
            </h4>
            <div className="space-y-1">
              {goal!.nextSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={step.completed}
                    disabled
                    className="h-4 w-4"
                  />
                  <span
                    className={step.completed ? "line-through text-muted-foreground" : ""}
                  >
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {goal!.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Skills to Build
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {goal!.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Last updated */}
        {goal!.updatedAt && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(goal!.updatedAt).toLocaleDateString()}
          </p>
        )}

        {/* Podcast Recommendations - Optional listening from professionals */}
        <GoalPodcasts
          goalTitle={goal!.title}
          isPrimary={isPrimary}
        />

        {/* Workplace Insight Placeholder - Primary Goal only */}
        {isPrimary && (
          <WorkplaceInsightPlaceholder goalTitle={goal!.title} />
        )}
      </CardContent>
    </Card>
  );
}

// Notes Section Component
function NotesSection({
  notes,
  isLoading,
  onAdd,
  onDelete,
}: {
  notes: UserNote[];
  isLoading: boolean;
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAdd(newNote.trim());
    setNewNote("");
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-amber-500" />
            Notes & Journal
          </CardTitle>
          {!isAdding && (
            <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-4">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your thoughts, reflections, or anything you want to remember..."
              className="mb-2 resize-none"
              rows={3}
              maxLength={2000}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote("");
                }}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={!newNote.trim()}>
                Save Note
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2" />
                <div className="h-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notes yet. Start journaling your career thoughts!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="group relative p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(note.createdAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(note.id)}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Suggested Actions Component
function SuggestedActions({ primaryGoal }: { primaryGoal: CareerGoal | null }) {
  const actions = primaryGoal
    ? SUGGESTED_ACTIONS_BY_CAREER[primaryGoal.title.toLowerCase().replace(/\s+/g, "-")] ||
      SUGGESTED_ACTIONS_BY_CAREER.default
    : ONBOARDING_SUGGESTIONS;

  const iconMap: Record<string, React.ElementType> = {
    search: Compass,
    users: Target,
    "graduation-cap": BookOpen,
    briefcase: Briefcase,
    star: Star,
    banknote: Target,
    code: Target,
    globe: Compass,
    play: Target,
    refresh: Target,
    building: Briefcase,
    heart: Star,
    "hand-heart": Star,
    award: Star,
    folder: Briefcase,
    pencil: Edit2,
    trophy: Star,
    tool: Target,
    network: Target,
    user: Target,
    compass: Compass,
    clipboard: BookOpen,
    target: Target,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          {primaryGoal ? "Suggested Next Actions" : "Get Started"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.slice(0, 5).map((action) => {
            const Icon = iconMap[action.icon || "target"] || Target;
            return (
              <Link
                key={action.id}
                href={action.href || "/careers"}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="flex-1 text-sm font-medium">{action.text}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Goals Page
export default function GoalsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Editing states
  const [editingSlot, setEditingSlot] = useState<GoalSlot | null>(null);
  const [primaryEditForm, setPrimaryEditForm] = useState<CareerGoal | null>(null);
  const [secondaryEditForm, setSecondaryEditForm] = useState<CareerGoal | null>(null);

  // Fetch goals
  const { data: goalsData, isLoading: isLoadingGoals } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  // Fetch notes
  const { data: notesData, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({
      slot,
      goal,
    }: {
      slot: GoalSlot;
      goal: CareerGoal | null;
    }) => {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, goal }),
      });
      if (!response.ok) throw new Error("Failed to update goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setEditingSlot(null);
      setPrimaryEditForm(null);
      setSecondaryEditForm(null);
      toast({ title: "Goal updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (slot: GoalSlot) => {
      const response = await fetch(`/api/goals?slot=${slot}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: "Goal cleared" });
    },
    onError: () => {
      toast({ title: "Failed to clear goal", variant: "destructive" });
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to add note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Note added!" });
    },
    onError: () => {
      toast({ title: "Failed to add note", variant: "destructive" });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const response = await fetch(`/api/notes?id=${noteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Note deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete note", variant: "destructive" });
    },
  });

  const primaryGoal: CareerGoal | null = goalsData?.primaryGoal || null;
  const secondaryGoal: CareerGoal | null = goalsData?.secondaryGoal || null;
  const notes: UserNote[] = notesData?.notes || [];

  // Handlers
  const handleEditPrimary = useCallback(() => {
    setPrimaryEditForm(primaryGoal || createEmptyGoal(""));
    setEditingSlot("primary");
  }, [primaryGoal]);

  const handleEditSecondary = useCallback(() => {
    setSecondaryEditForm(secondaryGoal || createEmptyGoal(""));
    setEditingSlot("secondary");
  }, [secondaryGoal]);

  const handleSavePrimary = useCallback(() => {
    if (!primaryEditForm || !primaryEditForm.title.trim()) {
      toast({ title: "Please enter a goal title", variant: "destructive" });
      return;
    }
    updateGoalMutation.mutate({ slot: "primary", goal: primaryEditForm });
  }, [primaryEditForm, updateGoalMutation, toast]);

  const handleSaveSecondary = useCallback(() => {
    if (!secondaryEditForm || !secondaryEditForm.title.trim()) {
      toast({ title: "Please enter a goal title", variant: "destructive" });
      return;
    }
    updateGoalMutation.mutate({ slot: "secondary", goal: secondaryEditForm });
  }, [secondaryEditForm, updateGoalMutation, toast]);

  const handleCancel = useCallback(() => {
    setEditingSlot(null);
    setPrimaryEditForm(null);
    setSecondaryEditForm(null);
  }, []);

  if (isLoadingGoals) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-48 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
            <Target className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">My Goals</h1>
        </div>
        <p className="text-muted-foreground">
          Focus on what matters. Set one primary and one secondary career goal.
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Primary Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GoalCard
            goal={primaryGoal}
            slot="primary"
            isEditing={editingSlot === "primary"}
            onEdit={handleEditPrimary}
            onSave={handleSavePrimary}
            onCancel={handleCancel}
            onClear={() => deleteGoalMutation.mutate("primary")}
            editForm={primaryEditForm}
            setEditForm={setPrimaryEditForm}
          />
        </motion.div>

        {/* Secondary Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GoalCard
            goal={secondaryGoal}
            slot="secondary"
            isEditing={editingSlot === "secondary"}
            onEdit={handleEditSecondary}
            onSave={handleSaveSecondary}
            onCancel={handleCancel}
            onClear={() => deleteGoalMutation.mutate("secondary")}
            editForm={secondaryEditForm}
            setEditForm={setSecondaryEditForm}
          />
        </motion.div>

        {/* Suggested Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SuggestedActions primaryGoal={primaryGoal} />
        </motion.div>

        {/* Notes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <NotesSection
            notes={notes}
            isLoading={isLoadingNotes}
            onAdd={(content) => addNoteMutation.mutate(content)}
            onDelete={(id) => deleteNoteMutation.mutate(id)}
          />
        </motion.div>
      </div>
    </div>
  );
}
