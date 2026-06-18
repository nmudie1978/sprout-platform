import { describe, it, expect } from "vitest";
import {
  buildShelf,
  isNonUniversity,
  SHELF_LIMIT,
  type ShelfContext,
  type ShelfDef,
} from "../shelves";
import type { Career } from "@/lib/career-pathways";

function career(overrides: Partial<Career> & { id: string }): Career {
  return {
    title: overrides.id,
    emoji: "✨",
    description: "",
    avgSalary: "500,000 - 700,000 kr/year",
    educationPath: "",
    keySkills: [],
    dailyTasks: [],
    growthOutlook: "stable",
    ...overrides,
  };
}

// categoryOf is unused when fixtures set explicit traits, so a stub is fine.
const ctx: ShelfContext = { categoryOf: () => null };

describe("isNonUniversity", () => {
  it("treats vocational / certification / on-the-job routes as non-university", () => {
    expect(isNonUniversity(career({ id: "a", educationRoute: "vocational" }))).toBe(true);
    expect(isNonUniversity(career({ id: "b", educationRoute: "certification" }))).toBe(true);
    expect(isNonUniversity(career({ id: "c", educationRoute: "on-the-job" }))).toBe(true);
  });

  it("treats explicit university route as university", () => {
    expect(isNonUniversity(career({ id: "d", educationRoute: "university" }))).toBe(false);
  });

  it("falls back to entryLevel then to education-path text", () => {
    expect(isNonUniversity(career({ id: "e", entryLevel: true }))).toBe(true);
    expect(
      isNonUniversity(career({ id: "f", educationPath: "Earn your fagbrev via apprenticeship" })),
    ).toBe(true);
    expect(
      isNonUniversity(career({ id: "g", educationPath: "Bachelor's in nursing" })),
    ).toBe(false);
  });
});

describe("buildShelf hybrid behaviour", () => {
  const def: ShelfDef = {
    id: "t",
    title: "t",
    emoji: "✨",
    blurb: "",
    match: (c) => c.growthOutlook === "high",
    pinnedIds: ["pin"],
    hiddenIds: ["nope"],
  };

  it("pins lead the list, then auto matches in catalogue order", () => {
    const pool = [
      career({ id: "auto1", growthOutlook: "high" }),
      career({ id: "pin", growthOutlook: "stable" }), // pinned despite not matching
      career({ id: "auto2", growthOutlook: "high" }),
    ];
    expect(buildShelf(def, pool, ctx).map((c) => c.id)).toEqual(["pin", "auto1", "auto2"]);
  });

  it("never includes a hidden id even if it matches", () => {
    const pool = [
      career({ id: "nope", growthOutlook: "high" }),
      career({ id: "ok", growthOutlook: "high" }),
    ];
    expect(buildShelf(def, pool, ctx).map((c) => c.id)).toEqual(["ok"]);
  });

  it("does not duplicate a pinned id that also matches the rule", () => {
    const pool = [career({ id: "pin", growthOutlook: "high" })];
    expect(buildShelf(def, pool, ctx).map((c) => c.id)).toEqual(["pin"]);
  });

  it("caps the result at the limit", () => {
    const pool = Array.from({ length: SHELF_LIMIT + 5 }, (_, i) =>
      career({ id: `c${i}`, growthOutlook: "high" }),
    );
    expect(buildShelf(def, pool, ctx)).toHaveLength(SHELF_LIMIT);
  });
});
