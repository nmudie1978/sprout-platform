import { describe, it, expect } from "vitest";
import { pickSurprise } from "../surprise";
import type { Career } from "@/lib/career-pathways";

function career(id: string): Career {
  return {
    id,
    title: id,
    emoji: "✨",
    description: "",
    avgSalary: "500,000 - 700,000 kr/year",
    educationPath: "",
    keySkills: [],
    dailyTasks: [],
    growthOutlook: "stable",
  };
}

describe("pickSurprise", () => {
  it("returns null for an empty catalogue", () => {
    expect(pickSurprise([])).toBeNull();
  });

  it("picks deterministically given an rng stub", () => {
    const pool = [career("a"), career("b"), career("c"), career("d")];
    // rng 0.5 → floor(0.5 * 4) = index 2 → "c"
    expect(pickSurprise(pool, [], () => 0.5)?.id).toBe("c");
  });

  it("excludes recently shown ids", () => {
    const pool = [career("a"), career("b"), career("c")];
    // recent excludes a,b → fresh = [c] → only "c" is reachable
    expect(pickSurprise(pool, ["a", "b"], () => 0)?.id).toBe("c");
    expect(pickSurprise(pool, ["a", "b"], () => 0.99)?.id).toBe("c");
  });

  it("falls back to the full pool when everything is recent", () => {
    const pool = [career("a"), career("b")];
    expect(pickSurprise(pool, ["a", "b"], () => 0)?.id).toBe("a");
  });

  it("clamps when rng returns exactly 1", () => {
    const pool = [career("a"), career("b")];
    expect(pickSurprise(pool, [], () => 1)?.id).toBe("b");
  });
});
