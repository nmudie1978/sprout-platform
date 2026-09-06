import { describe, it, expect } from "vitest";
import { formatSekMonthlyRange } from "../format-sek-salary";

describe("formatSekMonthlyRange", () => {
  it("matches the style of the hand-curated Swedish strings", () => {
    // SCB 2025, SSYK 2512 (software and system developers).
    expect(formatSekMonthlyRange({ p10: 39600, p90: 72600, median: 53500 })).toBe(
      "39 600–72 600 kr/mån (median ca 53 500 kr/mån)",
    );
  });

  it("omits the median clause when the median is absent", () => {
    expect(formatSekMonthlyRange({ p10: 29300, p90: 39000 })).toBe(
      "29 300–39 000 kr/mån",
    );
  });

  it("throws rather than emit a reversed range", () => {
    expect(() => formatSekMonthlyRange({ p10: 50000, p90: 40000 })).toThrow();
  });

  it("throws on non-positive figures", () => {
    expect(() => formatSekMonthlyRange({ p10: 0, p90: 40000 })).toThrow();
  });
});
