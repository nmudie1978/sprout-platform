import { describe, it, expect } from "vitest";
import {
  findStyrkForCareer,
  SSB_OCCUPATION_MAP,
} from "../career-data/ssb-salary-mapping";

describe("SSB_OCCUPATION_MAP", () => {
  it("maps every entry to a STYRK-08 4-digit (or 0NNN) code", () => {
    for (const m of SSB_OCCUPATION_MAP) {
      expect(m.styrkCode).toMatch(/^\d{4}$/);
      expect(m.styrkLabel.length).toBeGreaterThan(0);
      expect(m.careerId).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("has unique careerId entries", () => {
    const ids = SSB_OCCUPATION_MAP.map((m) => m.careerId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("findStyrkForCareer", () => {
  it("returns the mapping for a known career", () => {
    const m = findStyrkForCareer("doctor");
    expect(m).toBeDefined();
    expect(m?.styrkCode).toBe("2211");
  });

  it("returns undefined for an unmapped career", () => {
    expect(findStyrkForCareer("astrophysicist")).toBeUndefined();
  });
});
