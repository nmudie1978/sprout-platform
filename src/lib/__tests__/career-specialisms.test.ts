/**
 * Career specialisms — data integrity + helper behaviour.
 *
 * Branches are curated content, so the value here is guarding the invariants
 * that keep the Understand-tab block honest:
 *   - the helper returns nothing for careers we haven't seeded
 *   - branch ids are unique within a base (the accordion keys on them)
 *   - every `linksToCareerId` promotion target resolves to a real career
 *     (a dead promotion link is a visible bug)
 *   - branches never carry inherited fields (salary/skills/education live on
 *     the base career — divergent duplicates are what we're avoiding)
 */

import { describe, it, expect } from "vitest";
import { getSpecialisms, hasSpecialisms, getFoundation } from "../career-specialisms";
import { getCareerById } from "../career-pathways";

describe("career-specialisms", () => {
  it("returns [] for an unknown / unseeded career", () => {
    expect(getSpecialisms("definitely-not-a-career")).toEqual([]);
    expect(getSpecialisms("software-engineer")).toEqual([]);
    expect(hasSpecialisms("definitely-not-a-career")).toBe(false);
  });

  it("returns branches for seeded careers", () => {
    expect(getSpecialisms("psychologist").length).toBeGreaterThan(0);
    expect(getSpecialisms("forensic-scientist").length).toBeGreaterThan(0);
    expect(hasSpecialisms("psychologist")).toBe(true);
  });

  it("surfaces the forensic psychology branch under psychologist", () => {
    const titles = getSpecialisms("psychologist").map((b) => b.title.toLowerCase());
    expect(titles.some((t) => t.includes("forensic"))).toBe(true);
    expect(titles.some((t) => t.includes("child"))).toBe(true);
  });

  it("keeps branch ids unique within each base career", () => {
    for (const base of ["psychologist", "forensic-scientist"]) {
      const ids = getSpecialisms(base).map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("every promotion target (linksToCareerId) resolves to a real career", () => {
    for (const base of ["psychologist", "forensic-scientist"]) {
      for (const branch of getSpecialisms(base)) {
        if (branch.linksToCareerId) {
          expect(
            getCareerById(branch.linksToCareerId),
            `${branch.title} links to missing career ${branch.linksToCareerId}`,
          ).toBeTruthy();
        }
      }
    }
  });

  it("branches carry only the differentiating fields (no inherited duplicates)", () => {
    const allowed = new Set([
      "id",
      "title",
      "setting",
      "blurb",
      "dayToDay",
      "specialisationStep",
      "linksToCareerId",
    ]);
    for (const base of ["psychologist", "forensic-scientist"]) {
      for (const branch of getSpecialisms(base)) {
        for (const key of Object.keys(branch)) {
          expect(allowed.has(key), `unexpected field "${key}" on ${branch.title}`).toBe(true);
        }
        expect(branch.dayToDay.length).toBeGreaterThan(0);
        expect(branch.specialisationStep.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns a shared foundation for seeded careers, null otherwise", () => {
    expect(getFoundation("psychologist")).toMatch(/psychology/i);
    expect(getFoundation("forensic-scientist")).toBeTruthy();
    expect(getFoundation("definitely-not-a-career")).toBeNull();
  });
});
