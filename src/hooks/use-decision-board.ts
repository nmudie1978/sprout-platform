"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EMPTY_BOARD, type DecisionBoardState } from "@/lib/decision-board/types";

const KEY = ["decision-board"];

export function useDecisionBoard() {
  const qc = useQueryClient();
  const query = useQuery<DecisionBoardState>({
    queryKey: KEY,
    queryFn: async () => {
      const res = await fetch("/api/journey/decision-board");
      if (!res.ok) return EMPTY_BOARD;
      const data = await res.json();
      return (data.board as DecisionBoardState) ?? EMPTY_BOARD;
    },
    staleTime: 60_000,
  });

  const save = useMutation({
    mutationFn: async (board: DecisionBoardState) => {
      qc.setQueryData(KEY, board); // optimistic
      const res = await fetch("/api/journey/decision-board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(board),
      });
      if (!res.ok) throw new Error("Failed to save board");
      return board;
    },
    onError: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    board: query.data ?? EMPTY_BOARD,
    isLoading: query.isLoading,
    save: save.mutate,
  };
}
