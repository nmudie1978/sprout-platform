import { describe, it, expect } from "vitest";
import { buildMorePool } from "../more-pool";
import type { Career } from "@/lib/career-pathways";

/**
 * Minimal Career fixture — only the fields buildMorePool reads matter
 * (id), the rest are filled to satisfy the type.
 */
function career(id: string, extra: Partial<Career> = {}): Career {
  return {
    id,
    title: id,
    emoji: "💼",
    description: "",
    avgSalary: "",
    educationPath: "",
    keySkills: [],
    dailyTasks: [],
    growthOutlook: "stable",
    ...extra,
  } as Career;
}

describe("buildMorePool", () => {
  const sectorOf = (id: string): "public" | "private" | "mixed" =>
    id.includes("pub-") ? "public" : id.includes("mix-") ? "mixed" : "private";

  // A career "matches" a preset if its id contains the preset string.
  const matchesPreset = (c: Career, preset: string) => c.id.includes(preset);

  it("removes careers already shown on the radar/report", () => {
    const deepPool = [career("a"), career("b"), career("c")];
    const result = buildMorePool({
      deepPool,
      visibleIds: new Set(["a", "c"]),
      sectorFilter: "all",
      presetFilter: null,
      matchesPreset,
      getSector: sectorOf,
    });
    expect(result.map((c) => c.id)).toEqual(["b"]);
  });

  it("preserves the rank order of deepPool", () => {
    const deepPool = [career("z"), career("y"), career("x")];
    const result = buildMorePool({
      deepPool,
      visibleIds: new Set(),
      sectorFilter: "all",
      presetFilter: null,
      matchesPreset,
      getSector: sectorOf,
    });
    expect(result.map((c) => c.id)).toEqual(["z", "y", "x"]);
  });

  it("applies the sector filter, keeping matching sector and 'mixed'", () => {
    const deepPool = [
      career("priv-1"),
      career("pub-1"),
      career("mix-1"),
    ];
    const result = buildMorePool({
      deepPool,
      visibleIds: new Set(),
      sectorFilter: "private",
      presetFilter: null,
      matchesPreset,
      getSector: sectorOf,
    });
    // private kept, public dropped, mixed kept (counts as either)
    expect(result.map((c) => c.id)).toEqual(["priv-1", "mix-1"]);
  });

  it("ignores sector when sectorFilter is 'all'", () => {
    const deepPool = [career("priv-1"), career("pub-1"), career("mix-1")];
    const result = buildMorePool({
      deepPool,
      visibleIds: new Set(),
      sectorFilter: "all",
      presetFilter: null,
      matchesPreset,
      getSector: sectorOf,
    });
    expect(result).toHaveLength(3);
  });

  it("applies the preset filter when set", () => {
    const deepPool = [
      career("creative-a"),
      career("tech-b"),
      career("creative-c"),
    ];
    const result = buildMorePool({
      deepPool,
      visibleIds: new Set(),
      sectorFilter: "all",
      presetFilter: "creative",
      matchesPreset,
      getSector: sectorOf,
    });
    expect(result.map((c) => c.id)).toEqual(["creative-a", "creative-c"]);
  });

  it("combines preset + sector + dedupe together", () => {
    const deepPool = [
      career("creative-priv-1"), // kept
      career("creative-pub-1"), // dropped by sector
      career("tech-priv-1"), // dropped by preset
      career("creative-priv-2"), // dropped: already visible
    ];
    const result = buildMorePool({
      deepPool,
      visibleIds: new Set(["creative-priv-2"]),
      sectorFilter: "private",
      presetFilter: "creative",
      matchesPreset,
      getSector: sectorOf,
    });
    expect(result.map((c) => c.id)).toEqual(["creative-priv-1"]);
  });

  it("returns an empty array when everything is already visible", () => {
    const deepPool = [career("a"), career("b")];
    const result = buildMorePool({
      deepPool,
      visibleIds: new Set(["a", "b"]),
      sectorFilter: "all",
      presetFilter: null,
      matchesPreset,
      getSector: sectorOf,
    });
    expect(result).toEqual([]);
  });
});
