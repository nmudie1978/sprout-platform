import { describe, it, expect } from "vitest";
import { getSalaryProvenance } from "../career-data-recency";

const NOW = new Date("2026-06-10T00:00:00Z");

describe("getSalaryProvenance", () => {
  it("verified tier when career has a fresh lastVerifiedAt + sourceUrl", () => {
    const p = getSalaryProvenance(
      { lastVerifiedAt: "2026-04-14", sourceUrl: "https://www.ssb.no/en/statbank/table/11418" },
      { now: NOW },
    );
    expect(p.tier).toBe("verified");
    expect(p.sourceHost).toBe("ssb.no");
    expect(p.label).toBe("Verified Apr 2026");
    expect(p.note).toContain("ssb.no");
  });

  it("verified tier without a sourceUrl still reads honestly (no fake source)", () => {
    const p = getSalaryProvenance({ lastVerifiedAt: "2026-04-14" }, { now: NOW });
    expect(p.tier).toBe("verified");
    expect(p.sourceHost).toBeUndefined();
    expect(p.note).not.toContain("Source:");
  });

  it("estimated tier when synthesized AND no fresh verification", () => {
    const p = getSalaryProvenance({}, { estimated: true, now: NOW });
    expect(p.tier).toBe("estimated");
    expect(p.label).toBe("Estimated");
  });

  it("indicative tier when curated-but-unsourced (no overclaim of a public source)", () => {
    const p = getSalaryProvenance({}, { now: NOW });
    expect(p.tier).toBe("indicative");
    expect(p.note).not.toMatch(/public salary data|Source:/);
  });

  it("a stale lastVerifiedAt does not count as verified", () => {
    const p = getSalaryProvenance({ lastVerifiedAt: "2024-01-01" }, { now: NOW });
    expect(p.tier).not.toBe("verified");
  });

  it("a fresh underlying verification beats the estimated caveat", () => {
    const p = getSalaryProvenance(
      { lastVerifiedAt: "2026-04-14", sourceUrl: "https://ssb.no" },
      { estimated: true, now: NOW },
    );
    expect(p.tier).toBe("verified");
  });
});
