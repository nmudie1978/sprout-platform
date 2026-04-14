import { describe, it, expect } from "vitest";
import type { Feedback } from "@prisma/client";
import {
  aggregateFeedback,
  csvCell,
  feedbackToCsv,
  likertStats,
} from "../feedback-stats";

function row(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: "r1",
    createdAt: new Date("2026-04-10T12:00:00Z"),
    createdByUserId: null,
    role: "PARENT_GUARDIAN",
    q1: 4,
    q2: 4,
    q3: 5,
    q4: 3,
    q5: 4,
    confusingText: null,
    clarityTopics: [],
    source: null,
    userAgent: null,
    appVersion: null,
    ...overrides,
  } as Feedback;
}

describe("likertStats", () => {
  it("handles empty input", () => {
    const s = likertStats([]);
    expect(s.n).toBe(0);
    expect(s.mean).toBe(0);
    expect(s.topTwoBox).toBe(0);
    expect(s.distribution).toEqual([0, 0, 0, 0, 0]);
  });

  it("computes mean, median, stddev, top-2-box and distribution", () => {
    const s = likertStats([5, 5, 4, 3, 2]);
    expect(s.n).toBe(5);
    expect(s.mean).toBe(3.8);
    expect(s.median).toBe(4);
    expect(s.stddev).toBeCloseTo(1.3, 1);
    expect(s.topTwoBox).toBe(60);
    expect(s.distribution).toEqual([0, 1, 1, 1, 2]);
  });

  it("ignores out-of-range values in the distribution", () => {
    const s = likertStats([1, 2, 3, 4, 5, 7, 0]);
    expect(s.distribution).toEqual([1, 1, 1, 1, 1]);
  });
});

describe("aggregateFeedback", () => {
  it("rolls up counts by role, per-question stats, clarity topics and free text", () => {
    const rows: Feedback[] = [
      row({ id: "1", role: "PARENT_GUARDIAN", q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, clarityTopics: ["PRIMARY_VS_SECONDARY_GOAL", "NEXT_STEPS"] }),
      row({ id: "2", role: "PARENT_GUARDIAN", q1: 4, q2: 4, q3: 4, q4: 3, q5: 4, confusingText: "slight overwhelm at first" }),
      row({ id: "3", role: "TEEN_16_20", q1: 3, q2: 2, q3: 4, q4: 4, q5: 4, clarityTopics: ["PRIMARY_VS_SECONDARY_GOAL"] }),
    ];

    const agg = aggregateFeedback(rows);
    expect(agg.total).toBe(3);
    expect(agg.byRole.PARENT_GUARDIAN).toBe(2);
    expect(agg.byRole.TEEN_16_20).toBe(1);
    expect(agg.byRole.ADULT_OTHER).toBe(0);

    expect(agg.perQuestion.q1.mean).toBe(4);
    expect(agg.perQuestion.q1.topTwoBox).toBeCloseTo(66.7, 1);

    // Clarity topics sorted desc by count
    expect(agg.clarityTopics[0]).toMatchObject({ topic: "PRIMARY_VS_SECONDARY_GOAL", count: 2 });
    expect(agg.clarityTopics[0].pct).toBeCloseTo(66.7, 1);

    expect(agg.freeTextSubmissions).toHaveLength(1);
    expect(agg.freeTextSubmissions[0].text).toContain("overwhelm");
  });
});

describe("csvCell", () => {
  it("wraps strings with commas, quotes or newlines", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('he said "hi"')).toBe('"he said ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("formats null/undefined as empty and Date as ISO", () => {
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
    expect(csvCell(new Date("2026-04-10T12:00:00Z"))).toBe("2026-04-10T12:00:00.000Z");
  });
});

describe("feedbackToCsv", () => {
  it("produces a header and one line per row", () => {
    const rows = [row({ id: "a", confusingText: "bit, confusing" })];
    const csv = feedbackToCsv(rows);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("createdAt,role,q1");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('"bit, confusing"');
  });

  it("joins clarityTopics with '; '", () => {
    const rows = [row({ clarityTopics: ["PRIMARY_VS_SECONDARY_GOAL", "NEXT_STEPS"] })];
    const csv = feedbackToCsv(rows);
    expect(csv).toContain("PRIMARY_VS_SECONDARY_GOAL; NEXT_STEPS");
  });
});
