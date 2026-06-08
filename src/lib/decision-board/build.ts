import type {
  DecisionInput,
  DecisionBoardState,
  DecisionRow,
  DecisionBoardResult,
} from "./types";

/** Auto comparison: interest desc, progress desc, recency desc. */
function autoCompare(a: DecisionInput, b: DecisionInput): number {
  const ai = a.interest ?? 0;
  const bi = b.interest ?? 0;
  if (ai !== bi) return bi - ai;
  if (a.progress !== b.progress) return b.progress - a.progress;
  return b.updatedAt - a.updatedAt;
}

export function buildDecisionBoard(
  input: DecisionInput[],
  board: DecisionBoardState,
): DecisionBoardResult {
  const ruledOutSet = new Set(board.ruledOut);
  const byId = new Map(input.map((c) => [c.careerId, c]));

  // Standings = everything not relegated, ordered by manual order first
  // (in the saved sequence), then any remainder by auto rank.
  const standing = input.filter((c) => !ruledOutSet.has(c.careerId));
  const manual = board.order
    .map((id) => byId.get(id))
    .filter((c): c is DecisionInput => !!c && !ruledOutSet.has(c.careerId));
  const manualIds = new Set(manual.map((c) => c.careerId));
  const remainder = standing
    .filter((c) => !manualIds.has(c.careerId))
    .sort(autoCompare);
  const orderedStanding = [...manual, ...remainder];

  const ranked: DecisionRow[] = orderedStanding.map((c, i) => ({
    ...c,
    rank: i + 1,
    ruledOut: false,
  }));
  const ruledOut: DecisionRow[] = input
    .filter((c) => ruledOutSet.has(c.careerId))
    .sort(autoCompare)
    .map((c) => ({ ...c, rank: null, ruledOut: true }));

  return { ranked, ruledOut, leader: ranked[0] ?? null };
}
