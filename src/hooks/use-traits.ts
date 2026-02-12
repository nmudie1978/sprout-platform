"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TraitId, ObservationValue } from "@/lib/traits/trait-catalog";

interface TraitObservationRecord {
  id: string;
  profileId: string;
  traitId: string;
  observation: string;
  contextType: string | null;
  contextId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TraitObservationsResponse {
  observations: TraitObservationRecord[];
}

/**
 * Fetch all trait observations for the current user.
 */
export function useTraitObservations(enabled = true) {
  return useQuery<TraitObservationsResponse>({
    queryKey: ["trait-observations"],
    queryFn: async () => {
      const res = await fetch("/api/journey/traits");
      if (!res.ok) throw new Error("Failed to fetch trait observations");
      return res.json();
    },
    enabled,
  });
}

/**
 * Record (upsert) a trait observation.
 */
export function useRecordObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      traitId,
      observation,
      contextType,
      contextId,
    }: {
      traitId: TraitId;
      observation: ObservationValue;
      contextType?: string;
      contextId?: string;
    }) => {
      const res = await fetch("/api/journey/traits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traitId, observation, contextType, contextId }),
      });
      if (!res.ok) throw new Error("Failed to save observation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trait-observations"] });
    },
  });
}

/**
 * Delete a trait observation.
 */
export function useDeleteObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (traitId: TraitId) => {
      const res = await fetch(`/api/journey/traits?traitId=${traitId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete observation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trait-observations"] });
    },
  });
}
