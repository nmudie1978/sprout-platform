import { describe, it, expect } from "vitest";
import {
  buildExploringGroups,
  CATEGORY_LABELS,
  OTHER_CATEGORY,
  type ExploringEntry,
} from "@/lib/library/exploring";
import type { InterestLevel } from "@/lib/interest-level/types";

function entry(
  careerId: string,
  category: ExploringEntry["category"],
  interest: InterestLevel | null,
  opts: Partial<Pick<ExploringEntry, "title" | "emoji" | "completed">> = {},
): ExploringEntry {
  return {
    careerId,
    title: opts.title ?? careerId,
    emoji: opts.emoji ?? "💼",
    category,
    interest,
    completed: opts.completed ?? false,
  };
}

describe("buildExploringGroups", () => {
  it("returns no groups for empty input", () => {
    expect(buildExploringGroups([])).toEqual([]);
  });

  it("groups careers under their category with the right label", () => {
    const groups = buildExploringGroups([
      entry("nurse", "HEALTHCARE_LIFE_SCIENCES", 3),
      entry("doctor", "HEALTHCARE_LIFE_SCIENCES", 4),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("HEALTHCARE_LIFE_SCIENCES");
    expect(groups[0].label).toBe(CATEGORY_LABELS.HEALTHCARE_LIFE_SCIENCES);
    expect(groups[0].entries.map((e) => e.careerId)).toEqual(["doctor", "nurse"]);
  });

  it("orders categories by the highest interest inside each", () => {
    const groups = buildExploringGroups([
      entry("teacher", "EDUCATION_TRAINING", 2),
      entry("trader", "FINANCE_BANKING", 5),
      entry("nurse", "HEALTHCARE_LIFE_SCIENCES", 4),
    ]);
    expect(groups.map((g) => g.category)).toEqual([
      "FINANCE_BANKING", // top = 5
      "HEALTHCARE_LIFE_SCIENCES", // top = 4
      "EDUCATION_TRAINING", // top = 2
    ]);
  });

  it("within a category sorts by interest desc, then title A→Z", () => {
    const groups = buildExploringGroups([
      entry("c", "TECHNOLOGY_IT", 3, { title: "Charlie" }),
      entry("a", "TECHNOLOGY_IT", 5, { title: "Alpha" }),
      entry("b", "TECHNOLOGY_IT", 3, { title: "Bravo" }),
    ]);
    expect(groups[0].entries.map((e) => e.title)).toEqual([
      "Alpha", // 5
      "Bravo", // 3, B before C
      "Charlie", // 3
    ]);
  });

  it("treats unrated careers as lowest and sorts them last in a category", () => {
    const groups = buildExploringGroups([
      entry("unrated", "TECHNOLOGY_IT", null, { title: "Zeta" }),
      entry("rated", "TECHNOLOGY_IT", 1, { title: "Yan" }),
    ]);
    expect(groups[0].entries.map((e) => e.careerId)).toEqual(["rated", "unrated"]);
  });

  it("puts uncategorised careers in a final 'Other' group, even with high interest", () => {
    const groups = buildExploringGroups([
      entry("mystery", null, 5, { title: "Mystery" }),
      entry("nurse", "HEALTHCARE_LIFE_SCIENCES", 2),
    ]);
    expect(groups.map((g) => g.category)).toEqual([
      "HEALTHCARE_LIFE_SCIENCES",
      OTHER_CATEGORY, // pinned last despite its 5★ entry
    ]);
    expect(groups[1].label).toBe("Other");
  });

  it("still renders a header for a single-career category", () => {
    const groups = buildExploringGroups([entry("solo", "MILITARY_DEFENCE", 3)]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe(CATEGORY_LABELS.MILITARY_DEFENCE);
    expect(groups[0].entries).toHaveLength(1);
  });

  it("carries the completed flag without affecting order", () => {
    const groups = buildExploringGroups([
      entry("done", "SPORT_FITNESS", 2, { title: "Done", completed: true }),
      entry("wip", "SPORT_FITNESS", 4, { title: "Wip", completed: false }),
    ]);
    // Wip (4★) outranks Done (2★) regardless of completion.
    expect(groups[0].entries.map((e) => e.careerId)).toEqual(["wip", "done"]);
    expect(groups[0].entries.find((e) => e.careerId === "done")?.completed).toBe(true);
  });
});
