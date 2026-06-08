import type { InterestLevel } from "@/lib/interest-level/types";

/** Persisted board state (YouthProfile.decisionBoard). */
export interface DecisionBoardState {
  /** Manual ranking by careerId. Empty ⇒ use the auto rank. */
  order: string[];
  /** Career ids relegated to "Out of the running". */
  ruledOut: string[];
}

/** A career that has been explored, as input to the board. */
export interface DecisionInput {
  careerId: string;
  title: string;
  emoji: string;
  interest: InterestLevel | null;
  /** 0 Discover · 1 Understand · 2 Clarity · 3 Complete — highest reached. */
  progress: number;
  /** ms epoch of the journey's last update; final tiebreak. */
  updatedAt: number;
}

export interface DecisionRow extends DecisionInput {
  /** 1-based rank in the standings (relegated rows get null). */
  rank: number | null;
  ruledOut: boolean;
}

export interface DecisionBoardResult {
  ranked: DecisionRow[]; // in standings order, rank 1..N
  ruledOut: DecisionRow[]; // relegated, rank null
  /** The current #1, or null when fewer than one ranked career. */
  leader: DecisionRow | null;
}

export const EMPTY_BOARD: DecisionBoardState = { order: [], ruledOut: [] };
