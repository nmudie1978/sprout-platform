import { describe, it, expect } from "vitest";
import { buildDecisionBoard } from "../build";
import { EMPTY_BOARD } from "../types";
import type { DecisionInput } from "../types";

const mk = (p: Partial<DecisionInput> & { careerId: string }): DecisionInput => ({
  title: p.careerId,
  emoji: "🎯",
  interest: null,
  progress: 0,
  updatedAt: 0,
  ...p,
});

describe("buildDecisionBoard", () => {
  it("auto-ranks by interest desc, then progress, then recency", () => {
    const input = [
      mk({ careerId: "a", interest: 3, progress: 3, updatedAt: 1 }),
      mk({ careerId: "b", interest: 5, progress: 1, updatedAt: 1 }),
      mk({ careerId: "c", interest: 5, progress: 3, updatedAt: 1 }),
    ];
    const r = buildDecisionBoard(input, EMPTY_BOARD);
    expect(r.ranked.map((x) => x.careerId)).toEqual(["c", "b", "a"]);
    expect(r.ranked.map((x) => x.rank)).toEqual([1, 2, 3]);
    expect(r.leader?.careerId).toBe("c");
  });

  it("uses recency as the final tiebreak", () => {
    const input = [
      mk({ careerId: "old", interest: 4, progress: 2, updatedAt: 10 }),
      mk({ careerId: "new", interest: 4, progress: 2, updatedAt: 20 }),
    ];
    const r = buildDecisionBoard(input, EMPTY_BOARD);
    expect(r.ranked.map((x) => x.careerId)).toEqual(["new", "old"]);
  });

  it("honours manual order over the auto rank", () => {
    const input = [
      mk({ careerId: "a", interest: 5, progress: 3 }),
      mk({ careerId: "b", interest: 1, progress: 0 }),
    ];
    const r = buildDecisionBoard(input, { order: ["b", "a"], ruledOut: [] });
    expect(r.ranked.map((x) => x.careerId)).toEqual(["b", "a"]);
  });

  it("appends careers missing from manual order by auto rank", () => {
    const input = [
      mk({ careerId: "a", interest: 5 }),
      mk({ careerId: "b", interest: 4 }),
      mk({ careerId: "c", interest: 3 }),
    ];
    const r = buildDecisionBoard(input, { order: ["c"], ruledOut: [] });
    expect(r.ranked.map((x) => x.careerId)).toEqual(["c", "a", "b"]);
  });

  it("excludes ruled-out careers from the standings", () => {
    const input = [mk({ careerId: "a", interest: 5 }), mk({ careerId: "b", interest: 4 })];
    const r = buildDecisionBoard(input, { order: [], ruledOut: ["a"] });
    expect(r.ranked.map((x) => x.careerId)).toEqual(["b"]);
    expect(r.ranked[0].rank).toBe(1);
    expect(r.ruledOut.map((x) => x.careerId)).toEqual(["a"]);
    expect(r.ruledOut[0].rank).toBeNull();
    expect(r.leader?.careerId).toBe("b");
  });

  it("returns a null leader for an empty board", () => {
    expect(buildDecisionBoard([], EMPTY_BOARD).leader).toBeNull();
  });
});
