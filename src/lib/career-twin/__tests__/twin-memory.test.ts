import { describe, it, expect } from "vitest";
import { toPromptHistory } from "@/lib/career-twin/history";

describe("toPromptHistory", () => {
  it("keeps only the last N turns and clamps content length", () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: "x".repeat(5000),
      mode: null,
      createdAt: new Date(),
    }));
    const out = toPromptHistory(rows, 6);
    expect(out).toHaveLength(6);
    expect(out[0].content.length).toBeLessThanOrEqual(2000);
    expect(out.every((m) => m.role === "user" || m.role === "assistant")).toBe(true);
  });

  it("drops rows with unknown roles", () => {
    const rows = [
      { role: "system", content: "a", mode: null, createdAt: new Date() },
      { role: "user", content: "b", mode: null, createdAt: new Date() },
    ];
    expect(toPromptHistory(rows, 6)).toEqual([{ role: "user", content: "b" }]);
  });
});
