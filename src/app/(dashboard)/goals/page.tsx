"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Calendar,
  TrendingUp,
  Star,
  Rocket,
  Trophy,
  Briefcase,
  ChevronRight,
} from "lucide-react";

// Goal type
interface Goal {
  id: string;
  title: string;
  completed: boolean;
  category: "career" | "skills" | "jobs" | "learning";
  createdAt: string;
}

// Category configuration
const categoryConfig = {
  career: { label: "Career", color: "bg-purple-500", icon: Rocket },
  skills: { label: "Skills", color: "bg-blue-500", icon: TrendingUp },
  jobs: { label: "Jobs", color: "bg-emerald-500", icon: Target },
  learning: { label: "Learning", color: "bg-amber-500", icon: Star },
};

// Suggested goals based on youth platform context
const suggestedGoals = [
  { title: "Complete my profile", category: "career" as const },
  { title: "Apply to my first job", category: "jobs" as const },
  { title: "Explore 5 different careers", category: "career" as const },
  { title: "Complete a job successfully", category: "jobs" as const },
  { title: "Get my first positive review", category: "jobs" as const },
  { title: "Learn a new skill this month", category: "skills" as const },
  { title: "Save my first earnings", category: "jobs" as const },
  { title: "Connect with a mentor", category: "learning" as const },
];

export default function GoalsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newGoal, setNewGoal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Goal["category"]>("career");
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Fetch career goals from database
  const { data: careerGoalsData, isLoading: isLoadingCareerGoals } = useQuery({
    queryKey: ["career-goals"],
    queryFn: async () => {
      const response = await fetch("/api/profile/career-goals");
      if (!response.ok) return { goals: [], activeGoal: null };
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  const careerGoals: string[] = Array.isArray(careerGoalsData?.goals) ? careerGoalsData.goals : [];

  // For MVP, store personal goals in localStorage (could be moved to DB later)
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["my-goals", session?.user?.id],
    queryFn: () => {
      if (typeof window === "undefined") return [];
      const stored = localStorage.getItem(`sprout-goals-${session?.user?.id}`);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!session?.user?.id,
  });

  const saveGoals = (newGoals: Goal[]) => {
    if (typeof window !== "undefined" && session?.user?.id) {
      localStorage.setItem(`sprout-goals-${session.user.id}`, JSON.stringify(newGoals));
    }
  };

  const addGoalMutation = useMutation({
    mutationFn: async (goal: Omit<Goal, "id" | "createdAt">) => {
      const newGoalItem: Goal = {
        ...goal,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const updatedGoals = [...goals, newGoalItem];
      saveGoals(updatedGoals);
      return updatedGoals;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["my-goals", session?.user?.id], data);
      setNewGoal("");
      toast({ title: "Goal added!", description: "Keep working towards your dreams." });
    },
  });

  const toggleGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const updatedGoals = goals.map((g: Goal) =>
        g.id === goalId ? { ...g, completed: !g.completed } : g
      );
      saveGoals(updatedGoals);
      return updatedGoals;
    },
    onSuccess: (data, goalId) => {
      queryClient.setQueryData(["my-goals", session?.user?.id], data);
      const goal = data.find((g: Goal) => g.id === goalId);
      if (goal?.completed) {
        toast({ title: "Goal completed!", description: "Great job! Keep it up." });
      }
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const updatedGoals = goals.filter((g: Goal) => g.id !== goalId);
      saveGoals(updatedGoals);
      return updatedGoals;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["my-goals", session?.user?.id], data);
      toast({ title: "Goal removed" });
    },
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    addGoalMutation.mutate({ title: newGoal.trim(), completed: false, category: selectedCategory });
  };

  const handleAddSuggestedGoal = (suggestion: typeof suggestedGoals[0]) => {
    // Check if already exists
    if (goals.some((g: Goal) => g.title.toLowerCase() === suggestion.title.toLowerCase())) {
      toast({ title: "Goal already exists", variant: "destructive" });
      return;
    }
    addGoalMutation.mutate({ title: suggestion.title, completed: false, category: suggestion.category });
  };

  // Calculate progress
  const completedCount = goals.filter((g: Goal) => g.completed).length;
  const totalCount = goals.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter goals
  const activeGoals = goals.filter((g: Goal) => !g.completed);
  const completedGoals = goals.filter((g: Goal) => g.completed);

  if (isLoading || isLoadingCareerGoals) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
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
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <Target className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">My Goals</h1>
        </div>
        <p className="text-muted-foreground">
          Set personal goals and track your progress on your career journey.
        </p>
      </motion.div>

      {/* Career Goals - Compact Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6 border border-purple-200 dark:border-purple-800">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-sm">Career Goals</span>
                {careerGoals.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {careerGoals.length}/4
                  </Badge>
                )}
              </div>
              <Link href="/careers">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-600 hover:text-purple-700">
                  {careerGoals.length > 0 ? "Edit" : "Add"}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
            {careerGoals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {careerGoals.map((career, index) => (
                  <Badge
                    key={career}
                    variant={index === 0 ? "default" : "secondary"}
                    className={index === 0 ? "bg-purple-500 hover:bg-purple-600" : ""}
                  >
                    {index === 0 && <Star className="h-3 w-3 mr-1" />}
                    {career}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No career goals yet.{" "}
                <Link href="/careers" className="text-purple-600 hover:underline">
                  Explore careers
                </Link>{" "}
                to add some.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Card */}
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="mb-6 border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">Personal Goals Progress</span>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  {completedCount} / {totalCount} completed
                </Badge>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {progressPercent === 100
                  ? "Amazing! You've completed all your goals!"
                  : progressPercent >= 50
                    ? "Great progress! Keep going!"
                    : "You're on your way. Every step counts!"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Goal Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add a New Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="What do you want to achieve?"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!newGoal.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(categoryConfig) as Goal["category"][]).map((cat) => {
                  const config = categoryConfig[cat];
                  return (
                    <Button
                      key={cat}
                      type="button"
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={selectedCategory === cat ? config.color : ""}
                    >
                      <config.icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Suggested Goals */}
      {showSuggestions && goals.length < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6 border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Suggested Goals
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(false)}
                  className="text-muted-foreground"
                >
                  Hide
                </Button>
              </div>
              <CardDescription>
                Not sure where to start? Try one of these:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestedGoals.map((suggestion, i) => {
                  const config = categoryConfig[suggestion.category];
                  const alreadyAdded = goals.some(
                    (g: Goal) => g.title.toLowerCase() === suggestion.title.toLowerCase()
                  );
                  return (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSuggestedGoal(suggestion)}
                      disabled={alreadyAdded}
                      className={alreadyAdded ? "opacity-50" : "hover:border-primary"}
                    >
                      <config.icon className={`h-3 w-3 mr-1 ${alreadyAdded ? "" : "text-" + suggestion.category}`} />
                      {suggestion.title}
                      {alreadyAdded && <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Circle className="h-5 w-5" />
              Active Goals
              {activeGoals.length > 0 && (
                <Badge variant="secondary">{activeGoals.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeGoals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No active goals yet. Add one above to get started!</p>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-2">
                  {activeGoals.map((goal: Goal) => {
                    const config = categoryConfig[goal.category];
                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                      >
                        <Checkbox
                          checked={goal.completed}
                          onCheckedChange={() => toggleGoalMutation.mutate(goal.id)}
                          className="h-5 w-5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{goal.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={`text-xs ${config.color} text-white`}>
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(goal.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoalMutation.mutate(goal.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Completed Goals
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {completedGoals.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedGoals.map((goal: Goal) => {
                  const config = categoryConfig[goal.category];
                  return (
                    <motion.div
                      key={goal.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-green-50/50 dark:bg-green-950/20 group"
                    >
                      <Checkbox
                        checked={goal.completed}
                        onCheckedChange={() => toggleGoalMutation.mutate(goal.id)}
                        className="h-5 w-5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-through text-muted-foreground truncate">
                          {goal.title}
                        </p>
                        <Badge variant="secondary" className={`text-xs mt-1 ${config.color} text-white`}>
                          {config.label}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoalMutation.mutate(goal.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
