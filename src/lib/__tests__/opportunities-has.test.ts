import { describe, it, expect } from "vitest";
import { hasOpportunities, getOpportunitiesForCareer } from "../opportunities";

describe("hasOpportunities", () => {
  it("is true for a career that has at least one opportunity", () => {
    // software-developer is tagged on the Bekk internship in the dataset.
    expect(getOpportunitiesForCareer("software-developer").length).toBeGreaterThan(0);
    expect(hasOpportunities("software-developer")).toBe(true);
  });

  it("is false for a career with no opportunities", () => {
    expect(hasOpportunities("totally-unknown-career-xyz")).toBe(false);
  });

  it("agrees with getOpportunitiesForCareer", () => {
    for (const id of ["software-developer", "totally-unknown-career-xyz"]) {
      expect(hasOpportunities(id)).toBe(getOpportunitiesForCareer(id).length > 0);
    }
  });
});
