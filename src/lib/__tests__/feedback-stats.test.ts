import { describe, it, expect } from "vitest";
import type { Feedback } from "@prisma/client";
import {
  aggregateFeedback,
  csvCell,
  feedbackToCsv,
  KIND_LABEL,
  AREA_LABEL,
  ROLE_LABEL,
} from "../feedback-stats";

function row(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: "r1",
    createdAt: new Date("2026-04-10T12:00:00Z"),
    createdByUserId: null,
    rating: null,
    kind: "CONFUSED",
    area: "JOURNEY",
    message: null,
    role: "TEEN_16_20",
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    confusingText: null,
    clarityTopics: [],
    source: null,
    userAgent: null,
    appVersion: null,
    ...overrides,
  } as Feedback;
}

describe("label maps", () => {
  it("cover every enum value with no stale concepts", () => {
    expect(KIND_LABEL.PRAISE).toBe("Something I liked");
    expect(AREA_LABEL.CAREER_TWIN).toBe("Career Twin");
    expect(ROLE_LABEL.TEEN_16_20).toBe("Teen (15–23)");
    const all = JSON.stringify({ KIND_LABEL, AREA_LABEL, ROLE_LABEL });
    expect(all).not.toMatch(/secondary|small job/i);
  });
});

describe("aggregateFeedback", () => {
  it("counts new-model rows by kind, area and role, and isolates legacy rows", () => {
    const rows: Feedback[] = [
      row({ id: "1", kind: "CONFUSED", area: "JOURNEY", role: "TEEN_16_20", message: "lost on step 2" }),
      row({ id: "2", kind: "IDEA", area: "CAREER_RADAR", role: "PARENT_GUARDIAN", message: "add a filter" }),
      row({ id: "3", kind: "CONFUSED", area: null, role: null, message: "  " }),
      // legacy Likert row — no kind
      row({ id: "4", kind: null, area: null, role: "PARENT_GUARDIAN", q1: 4, message: null }),
    ];
    const agg = aggregateFeedback(rows);

    expect(agg.total).toBe(3);          // rows with a kind
    expect(agg.legacyCount).toBe(1);    // rows without a kind
    expect(agg.byKind.CONFUSED).toBe(2);
    expect(agg.byKind.IDEA).toBe(1);
    expect(agg.byKind.PROBLEM).toBe(0);
    expect(agg.byArea.JOURNEY).toBe(1);
    expect(agg.byArea.CAREER_RADAR).toBe(1);
    expect(agg.byRole.TEEN_16_20).toBe(1);
    expect(agg.byRole.PARENT_GUARDIAN).toBe(1); // legacy row's role is NOT counted

    // messages: new-model rows with non-empty message, newest first
    expect(agg.messages.map((m) => m.id)).toEqual(["1", "2"]);
    expect(agg.messages[0].kind).toBe("CONFUSED");
  });

  it("rolls up the 1-5 rating: average, distribution, and rating-only rows are not legacy", () => {
    const rows: Feedback[] = [
      row({ id: "1", rating: 5, kind: "PRAISE", message: "great" }), // rated + written
      row({ id: "2", rating: 4, kind: null, message: null }),        // rating-only
      row({ id: "3", rating: 4, kind: null, message: null }),        // rating-only
      row({ id: "4", rating: 1, kind: "PROBLEM", message: "broke" }),
      row({ id: "5", rating: null, kind: null, q1: 3, message: null }), // true legacy
    ];
    const agg = aggregateFeedback(rows);

    expect(agg.ratingCount).toBe(4);
    expect(agg.ratingAvg).toBe(3.5); // (5+4+4+1)/4
    expect(agg.ratingDistribution[4]).toBe(2);
    expect(agg.ratingDistribution[5]).toBe(1);
    expect(agg.ratingDistribution[1]).toBe(1);
    expect(agg.ratingDistribution[3]).toBe(0);
    expect(agg.legacyCount).toBe(1); // only row 5 (no kind, no rating)
    expect(agg.total).toBe(2);       // rows 1 and 4 have a kind
  });

  it("returns ratingAvg null when there are no ratings", () => {
    const agg = aggregateFeedback([row({ kind: "IDEA", message: "hi" })]);
    expect(agg.ratingCount).toBe(0);
    expect(agg.ratingAvg).toBeNull();
  });
});

describe("csvCell", () => {
  it("wraps strings with commas, quotes or newlines", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('he said "hi"')).toBe('"he said ""hi"""');
    expect(csvCell(null)).toBe("");
    expect(csvCell(new Date("2026-04-10T12:00:00Z"))).toBe("2026-04-10T12:00:00.000Z");
  });
});

describe("feedbackToCsv", () => {
  it("has the new typed columns and one line per row", () => {
    const rows = [row({ id: "a", kind: "PROBLEM", area: "LIBRARY", message: "bug, here" })];
    const csv = feedbackToCsv(rows);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "id,createdAt,rating,kind,area,role,message,legacyText,source,userAgent,appVersion,createdByUserId",
    );
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("PROBLEM");
    expect(lines[1]).toContain('"bug, here"');
  });
});
