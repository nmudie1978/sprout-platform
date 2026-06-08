import { describe, it, expect } from "vitest";
import {
  defaultDetailsForCategory,
  defaultDetailsByCategory,
} from "../career-typical-days-category-defaults";
import { getCareerDetails, type CareerDetails } from "../career-typical-days";

const globalDefault: CareerDetails = {
  typicalDay: { morning: ["Review tasks and priorities for the day"], midday: [], afternoon: [] },
  whatYouActuallyDo: [],
  whoThisIsGoodFor: [],
  topSkills: [],
  entryPaths: [],
};

describe("defaultDetailsForCategory", () => {
  it("returns the tailored template for a category that has one", () => {
    expect(defaultDetailsForCategory("EDUCATION_TRAINING", globalDefault)).toBe(
      defaultDetailsByCategory.EDUCATION_TRAINING,
    );
    expect(defaultDetailsForCategory("HEALTHCARE_LIFE_SCIENCES", globalDefault)).toBe(
      defaultDetailsByCategory.HEALTHCARE_LIFE_SCIENCES,
    );
  });
  it("returns the global default for an office category without a tailored template", () => {
    expect(defaultDetailsForCategory("BUSINESS_MANAGEMENT", globalDefault)).toBe(globalDefault);
    expect(defaultDetailsForCategory("FINANCE_BANKING", globalDefault)).toBe(globalDefault);
  });
  it("returns the global default for an undefined category", () => {
    expect(defaultDetailsForCategory(undefined, globalDefault)).toBe(globalDefault);
  });
});

describe("getCareerDetails category fallback", () => {
  it("gives an EFL teacher a teaching day, not the office/PM template", () => {
    const morning = getCareerDetails("efl-teacher").typicalDay.morning.join(" ").toLowerCase();
    expect(morning).toContain("lesson"); // teaching template
    expect(morning).not.toContain("team standup"); // not the global office default
    expect(morning).not.toContain("check emails");
  });
});
