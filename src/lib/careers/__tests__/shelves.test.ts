import { describe, it, expect } from "vitest";
import {
  buildShelf,
  isNonUniversity,
  SHELVES,
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

const shelf = (id: string) => SHELVES.find((s) => s.id === id) as ShelfDef;

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

describe("SHELVES auto-rules", () => {
  it("high-growth selects only high growthOutlook", () => {
    const pool = [
      career({ id: "hi", growthOutlook: "high" }),
      career({ id: "mid", growthOutlook: "medium" }),
    ];
    expect(buildShelf(shelf("high-growth"), pool, ctx).map((c) => c.id)).toEqual(["hi"]);
  });

  it("surprising-salaries needs high pay AND no degree", () => {
    const pool = [
      career({ id: "rich-novoc", avgSalary: "900,000 - 1,200,000 kr/year", educationRoute: "vocational" }),
      career({ id: "rich-uni", avgSalary: "900,000 - 1,200,000 kr/year", educationRoute: "university" }),
      career({ id: "poor-novoc", avgSalary: "300,000 - 400,000 kr/year", educationRoute: "vocational" }),
    ];
    expect(buildShelf(shelf("surprising-salaries"), pool, ctx).map((c) => c.id)).toEqual([
      "rich-novoc",
    ]);
  });

  it("hands-on selects hands-on or outdoors work settings", () => {
    const pool = [
      career({ id: "h", workSetting: "hands-on" }),
      career({ id: "o", workSetting: "outdoors" }),
      career({ id: "d", workSetting: "desk" }),
    ];
    expect(buildShelf(shelf("hands-on"), pool, ctx).map((c) => c.id).sort()).toEqual(["h", "o"]);
  });

  it("helping-people selects high people intensity", () => {
    const pool = [
      career({ id: "y", peopleIntensity: "high" }),
      career({ id: "n", peopleIntensity: "low" }),
    ];
    expect(buildShelf(shelf("helping-people"), pool, ctx).map((c) => c.id)).toEqual(["y"]);
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
    expect(buildShelf(shelf("high-growth"), pool, ctx)).toHaveLength(SHELF_LIMIT);
  });
});
