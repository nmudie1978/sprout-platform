"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Target,
  ChevronRight,
  ChevronDown,
  Plus,
  Briefcase,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";

// Types
interface SteppingStone {
  id: string;
  title: string;
  type: "skill" | "experience" | "learning";
  isCompleted: boolean;
}

interface MonthlyAction {
  id: string;
  title: string;
  href: string;
  type: "job" | "explore" | "learn";
  isCompleted: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  steppingStones: SteppingStone[];
  monthlyActions: MonthlyAction[];
  progress: number; // 0-100
}

// Type icons
const TYPE_ICONS = {
  skill: GraduationCap,
  experience: Briefcase,
  learning: BookOpen,
  job: Briefcase,
  explore: Target,
  learn: BookOpen,
};

const TYPE_COLORS = {
  skill: "text-purple-600 bg-purple-500/10",
  experience: "text-blue-600 bg-blue-500/10",
  learning: "text-amber-600 bg-amber-500/10",
  job: "text-emerald-600 bg-emerald-500/10",
  explore: "text-cyan-600 bg-cyan-500/10",
  learn: "text-rose-600 bg-rose-500/10",
};

// Stepping Stone Item
function SteppingStoneItem({ stone }: { stone: SteppingStone }) {
  const Icon = TYPE_ICONS[stone.type];
  const colorClass = TYPE_COLORS[stone.type];

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`p-1.5 rounded-lg ${colorClass.split(" ")[1]}`}>
        <Icon className={`h-3.5 w-3.5 ${colorClass.split(" ")[0]}`} />
      </div>
      <span
        className={`text-sm flex-1 ${
          stone.isCompleted ? "line-through text-muted-foreground" : ""
        }`}
      >
        {stone.title}
      </span>
      {stone.isCompleted ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground/30" />
      )}
    </div>
  );
}

// Monthly Action Item
function MonthlyActionItem({ action }: { action: MonthlyAction }) {
  const Icon = TYPE_ICONS[action.type];
  const colorClass = TYPE_COLORS[action.type];

  return (
    <Link
      href={action.href}
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
    >
      <div className={`p-1.5 rounded-lg ${colorClass.split(" ")[1]}`}>
        <Icon className={`h-3.5 w-3.5 ${colorClass.split(" ")[0]}`} />
      </div>
      <span
        className={`text-sm flex-1 ${
          action.isCompleted ? "line-through text-muted-foreground" : ""
        }`}
      >
        {action.title}
      </span>
      {action.isCompleted ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </Link>
  );
}

// Goal Card Component
function GoalCard({ goal, isExpanded, onToggle }: { goal: Goal; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Card className="overflow-hidden">
      {/* Goal Header */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
      >
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shrink-0">
          <Target className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{goal.title}</h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {goal.description}
            </p>
          )}
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{goal.progress}%</span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 pb-4 px-4 border-t">
              {/* Stepping Stones */}
              {goal.steppingStones.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Stepping Stones
                  </h4>
                  <div className="space-y-1">
                    {goal.steppingStones.map((stone) => (
                      <SteppingStoneItem key={stone.id} stone={stone} />
                    ))}
                  </div>
                </div>
              )}

              {/* This Month's Actions */}
              {goal.monthlyActions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    This Month
                  </h4>
                  <div className="space-y-2">
                    {goal.monthlyActions.map((action) => (
                      <MonthlyActionItem key={action.id} action={action} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Empty State
function EmptyGoalStack() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Target className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">No goals yet</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
          Setting a goal helps you focus your journey. What are you working toward?
        </p>
        <Button asChild>
          <Link href="/careers">
            <Plus className="h-4 w-4 mr-2" />
            Explore careers to find your goal
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Goal Stack Component
interface GoalStackProps {
  goals?: Goal[];
}

export function GoalStack({ goals = [] }: GoalStackProps) {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(
    goals.length > 0 ? goals[0].id : null
  );

  const handleToggle = (goalId: string) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  // Sample goal for demo
  const sampleGoals: Goal[] = goals.length > 0 ? goals : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            Goal Stack
          </h2>
          <p className="text-xs text-muted-foreground">
            Your long-term goals and the steps to get there
          </p>
        </div>
        {goals.length > 0 && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/careers">
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Link>
          </Button>
        )}
      </div>

      {sampleGoals.length === 0 ? (
        <EmptyGoalStack />
      ) : (
        <div className="space-y-3">
          {sampleGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isExpanded={expandedGoalId === goal.id}
              onToggle={() => handleToggle(goal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Export types
export type { Goal, SteppingStone, MonthlyAction };
