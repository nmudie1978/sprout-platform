"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { CareerGoal, GoalSlot, GoalsResponse } from "@/lib/goals/types";
import { syncGuidanceGoal } from "@/lib/guidance/rules";

/**
 * Invalidate all caches that derive from the career goal.
 * Called after any goal mutation to ensure the entire app
 * treats the new goal as the single source of truth.
 */
function invalidateGoalDependentCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({ queryKey: ["personal-career-timeline"] });
  queryClient.invalidateQueries({ queryKey: ["goals"] });
  queryClient.invalidateQueries({ queryKey: ["profile"] });
  queryClient.invalidateQueries({ queryKey: ["journey-state"] });
  queryClient.invalidateQueries({ queryKey: ["goal-data"] });
  queryClient.invalidateQueries({ queryKey: ["discover-reflections"] });
  queryClient.invalidateQueries({ queryKey: ["education-context"] });
}

/**
 * Fetch the user's career goal.
 */
export function useGoals(enabled = true) {
  return useQuery<GoalsResponse>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Failed to fetch goals");
      return res.json();
    },
    enabled,
    staleTime: 60_000, // 1 min — goals rarely change mid-session
  });
}

/**
 * Update a goal in a specific slot.
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slot, goal }: { slot: GoalSlot; goal: CareerGoal }) => {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, goal }),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      if (variables.slot === "primary") {
        syncGuidanceGoal(variables.goal.title);
      }
      invalidateGoalDependentCaches(queryClient);
    },
  });
}

/**
 * Clear the user's career goal.
 */
export function useClearGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slot: GoalSlot = "primary") => {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, goal: null }),
      });
      if (!res.ok) throw new Error("Failed to clear goal");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Primary goal cleared", variant: "success" });
      syncGuidanceGoal(null);
      invalidateGoalDependentCaches(queryClient);
    },
    onError: () => {
      toast({ title: "Failed to clear goal", variant: "destructive" });
    },
  });
}
