import { describe, it, expect } from "vitest";
import { toPromptHistory } from "@/lib/career-twin/history";
import { daysBetween, isReturningAfterGap, extractQuizLabels, TWIN_CHECKIN_DAYS } from "@/lib/career-twin/memory";
import { buildCareerTwinSystemPrompt } from "@/lib/career-twin/prompt";
import { buildPersona } from "@/lib/career-twin/persona";
import { getMode } from "@/lib/career-twin/modes";

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

describe("cadence + quiz extraction", () => {
  const now = Date.parse("2026-06-02T00:00:00.000Z");

  it("daysBetween returns whole days, null on bad/empty input", () => {
    expect(daysBetween("2026-05-26T00:00:00.000Z", now)).toBe(7);
    expect(daysBetween(null, now)).toBeNull();
    expect(daysBetween("not-a-date", now)).toBeNull();
  });

  it("isReturningAfterGap triggers only at/above threshold", () => {
    expect(isReturningAfterGap(TWIN_CHECKIN_DAYS)).toBe(true);
    expect(isReturningAfterGap(TWIN_CHECKIN_DAYS - 1)).toBe(false);
    expect(isReturningAfterGap(null)).toBe(false);
  });

  it("extractQuizLabels handles string[] and object[] JSON shapes", () => {
    expect(extractQuizLabels(["Healthcare", "Tech"])).toEqual(["Healthcare", "Tech"]);
    expect(extractQuizLabels([{ industry: "Design" }, { name: "Trades" }])).toEqual(["Design", "Trades"]);
    expect(extractQuizLabels(null)).toEqual([]);
    expect(extractQuizLabels("garbage")).toEqual([]);
  });
});

describe("prompt memory injection", () => {
  const career = { id: "doctor", title: "Doctor", emoji: "🩺" };
  const persona = buildPersona({ userId: "u1", career, profile: null });
  const mode = getMode("ask_future_me");

  it("adds a remembered-context section when memory has signal", () => {
    const prompt = buildCareerTwinSystemPrompt({
      persona, mode, career, profile: null,
      memory: {
        lastVisitAt: "2026-05-01T00:00:00.000Z",
        daysSinceLastVisit: 32,
        recentReflections: ["I liked the biology module"],
        changedSinceLastVisit: ["added 1 new reflection"],
        quizLabels: ["Healthcare"],
      },
    });
    expect(prompt).toContain("WHAT YOU REMEMBER ABOUT THEM");
    expect(prompt).toContain("32 day");
    expect(prompt).toContain("never invent memories");
  });

  it("omits the section entirely when memory is null or empty", () => {
    const prompt = buildCareerTwinSystemPrompt({ persona, mode, career, profile: null, memory: null });
    expect(prompt).not.toContain("WHAT YOU REMEMBER ABOUT THEM");
  });
});
