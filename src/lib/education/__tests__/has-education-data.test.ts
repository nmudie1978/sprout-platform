import { describe, it, expect } from "vitest";
import { hasEducationData, COUNTRIES_WITH_EDUCATION_DATA } from "../index";

describe("hasEducationData", () => {
  it("is true for the Nordic countries we have curated programmes for", () => {
    for (const c of ["NO", "SE", "DK", "FI", "IS"]) {
      expect(hasEducationData(c)).toBe(true);
    }
  });

  it("is false for Spain (launched but no education data)", () => {
    expect(hasEducationData("ES")).toBe(false);
  });

  it("is false for other non-data countries (Italy, Serbia)", () => {
    expect(hasEducationData("IT")).toBe(false);
    expect(hasEducationData("RS")).toBe(false);
  });

  it("is false for undefined/null/empty", () => {
    expect(hasEducationData(undefined)).toBe(false);
    expect(hasEducationData(null)).toBe(false);
    expect(hasEducationData("")).toBe(false);
  });

  it("the data-country list does not include ES", () => {
    expect(COUNTRIES_WITH_EDUCATION_DATA).not.toContain("ES");
  });
});
