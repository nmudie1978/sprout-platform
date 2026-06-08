import { describe, it, expect } from "vitest";
import { getProgrammesForCareer } from "../index";
import esSupplement from "../data/es-supplement.json";

describe("Spain Study Path data", () => {
  it("returns Spanish (ES) programmes for high-value careers", () => {
    for (const career of [
      "doctor",
      "nurse",
      "lawyer",
      "software-developer",
      "teacher",
      "data-analyst",
    ]) {
      const es = getProgrammesForCareer(career, { country: "ES" });
      expect(es.length, `${career} should have ES programmes`).toBeGreaterThan(0);
      // every ES programme must point at a Spanish institution
      for (const p of es) expect(p.country).toBe("ES");
    }
  });

  it("routes specialised careers to a Spanish base via advancedCareerMap", () => {
    // dermatologist -> doctor, mathematics-teacher -> teacher
    expect(getProgrammesForCareer("dermatologist", { country: "ES" }).length).toBeGreaterThan(0);
    expect(getProgrammesForCareer("mathematics-teacher", { country: "ES" }).length).toBeGreaterThan(0);
  });

  it("every Spanish supplement programme has a valid https URL and required fields", () => {
    const progs = (esSupplement as { programmes: Array<Record<string, unknown>> }).programmes;
    expect(progs.length).toBeGreaterThanOrEqual(30);
    for (const p of progs) {
      expect(p.id, "programme id").toBeTruthy();
      expect(p.careerId, "careerId").toBeTruthy();
      expect(typeof p.url).toBe("string");
      expect(() => new URL(p.url as string)).not.toThrow();
      expect(p.url as string).toMatch(/^https:\/\//);
    }
  });

  it("has no duplicate programme ids in the supplement", () => {
    const ids = (esSupplement as { programmes: Array<{ id: string }> }).programmes.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

import { getSpanishReadiness } from "../index";

describe("Spanish School Readiness", () => {
  it("returns readiness for high-value careers with the expected shape", () => {
    for (const c of ["doctor", "lawyer", "software-developer", "architect"]) {
      const r = getSpanishReadiness(c);
      expect(r, `${c} readiness`).not.toBeNull();
      expect(typeof r!.modality).toBe("string");
      expect(r!.subjects.length).toBeGreaterThan(0);
      expect(["low", "moderate", "high", "very-high"]).toContain(r!.selectivity);
    }
  });

  it("resolves specialisations via advancedCareerMap (dermatologist → doctor)", () => {
    const derm = getSpanishReadiness("dermatologist");
    const doc = getSpanishReadiness("doctor");
    expect(derm).not.toBeNull();
    expect(derm!.modality).toBe(doc!.modality);
  });

  it("returns null for a career with no Spanish readiness data", () => {
    expect(getSpanishReadiness("youtuber")).toBeNull();
  });
});
