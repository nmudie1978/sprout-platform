import { describe, it, expect } from "vitest";
import { pickDiverseHighGrowth } from "../diverse-suggestions";
import type { Career } from "@/lib/career-pathways";

function c(id: string, growth: Career["growthOutlook"] = "high"): Career {
  return {
    id,
    title: id,
    emoji: "✨",
    description: "",
    avgSalary: "500,000 - 700,000 kr/year",
    educationPath: "",
    keySkills: [],
    dailyTasks: [],
    growthOutlook: growth,
  };
}

// deterministic rng for tests (no shuffling — preserves input order)
const idRng = () => 0;

describe("pickDiverseHighGrowth", () => {
  const catOf = (id: string) => id.split("-")[0]; // "med-1" -> "med"

  it("spans categories rather than clustering one", () => {
    const careers = [
      c("med-1"), c("med-2"), c("med-3"), c("med-4"), c("med-5"), c("med-6"),
      c("tech-1"), c("biz-1"), c("law-1"),
    ];
    const picked = pickDiverseHighGrowth(careers, catOf, { limit: 4, rng: idRng });
    const cats = new Set(picked.map((p) => catOf(p.id)));
    // 4 picks from 4 different categories (round-robin), not 4 medical
    expect(picked).toHaveLength(4);
    expect(cats.size).toBe(4);
  });

  it("only includes high-growth careers", () => {
    const careers = [c("a-1", "high"), c("b-1", "medium"), c("c-1", "stable")];
    const picked = pickDiverseHighGrowth(careers, catOf, { limit: 6, rng: idRng });
    expect(picked.map((p) => p.id)).toEqual(["a-1"]);
  });

  it("respects exclude", () => {
    const careers = [c("a-1"), c("b-1")];
    const picked = pickDiverseHighGrowth(careers, catOf, {
      limit: 6,
      exclude: (x) => x.id === "a-1",
      rng: idRng,
    });
    expect(picked.map((p) => p.id)).toEqual(["b-1"]);
  });

  it("falls back to a second pick per category when categories run out", () => {
    const careers = [c("a-1"), c("a-2"), c("b-1")];
    const picked = pickDiverseHighGrowth(careers, catOf, { limit: 3, rng: idRng });
    // round 0: a-1, b-1 ; round 1: a-2
    expect(picked).toHaveLength(3);
    expect(new Set(picked.map((p) => p.id))).toEqual(new Set(["a-1", "a-2", "b-1"]));
  });

  it("returns [] for non-positive limit", () => {
    expect(pickDiverseHighGrowth([c("a-1")], catOf, { limit: 0, rng: idRng })).toEqual([]);
  });
});
