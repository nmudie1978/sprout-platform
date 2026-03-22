"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CareerGoal, GoalSlot, GoalsResponse } from "@/lib/goals/types";

/**
 * Fetch the user's primary and secondary goals.
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
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["personal-career-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["journey-state"] });
    },
  });
}

/**
 * Clear a specific goal slot, or both slots.
 */
export function useClearGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slot: GoalSlot | "both") => {
      if (slot === "both") {
        const res1 = await fetch("/api/goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot: "primary", goal: null }),
        });
        if (!res1.ok) throw new Error("Failed to clear primary goal");
        const res2 = await fetch("/api/goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot: "secondary", goal: null }),
        });
        if (!res2.ok) throw new Error("Failed to clear secondary goal");
        return res2.json();
      }
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, goal: null }),
      });
      if (!res.ok) throw new Error("Failed to clear goal");
      return res.json();
    },
    onSuccess: (_data, slot) => {
      toast.success(
        slot === "both" ? "Both goals cleared" : `${slot === "primary" ? "Primary" : "Secondary"} goal cleared`
      );
      queryClient.removeQueries({ queryKey: ["personal-career-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["journey-state"] });
    },
    onError: () => {
      toast.error("Failed to clear goal");
    },
  });
}

/**
 * Promote secondary goal to primary (swap them).
 */
export function usePromoteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      currentPrimary,
      currentSecondary,
    }: {
      currentPrimary: CareerGoal | null;
      currentSecondary: CareerGoal;
    }) => {
      const now = new Date().toISOString();

      // Step 1: Clear secondary to avoid duplicate-title conflict
      const clear = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: "secondary", goal: null }),
      });
      if (!clear.ok) throw new Error("Failed to clear secondary slot");

      // Step 2: Set the old secondary as the new primary
      const res1 = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: "primary",
          goal: { ...currentSecondary, updatedAt: now },
        }),
      });
      if (!res1.ok) throw new Error("Failed to promote goal");

      // Step 3: Move old primary to secondary (or leave cleared)
      const res2 = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: "secondary",
          goal: currentPrimary
            ? { ...currentPrimary, updatedAt: now }
            : null,
        }),
      });
      if (!res2.ok) throw new Error("Failed to demote old primary");

      return res2.json();
    },
    onSuccess: () => {
      toast.success("Goals swapped!", {
        description: "Your secondary goal is now primary.",
      });
      // Fully clear cached timeline data so the new primary triggers a fresh fetch
      queryClient.removeQueries({ queryKey: ["personal-career-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["journey-state"] });
    },
    onError: () => {
      toast.error("Failed to swap goals");
    },
  });
}
