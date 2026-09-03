import { describe, it, expect } from "vitest";
import {
  defaultDetailsForCategory,
  defaultDetailsByCategory,
} from "../career-typical-days-category-defaults";
import { getCareerDetails, hasDetailedContent, type CareerDetails } from "../career-typical-days";

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

describe("field-science careers never inherit the clinical template", () => {
  // These sit in HEALTHCARE_LIFE_SCIENCES (the catalogue's "life sciences"
  // bucket) but are field/research roles, so the clinical fallback told them
  // they would care for patients. Regression guard for that.
  const fieldScienceIds = [
    "paleontologist",
    "paleobiologist",
    "vertebrate-paleontologist",
    "fossil-preparation-technician",
    "geologist",
    "geochemist",
    "volcanologist",
    "oceanographer",
    "sedimentologist",
    "petroleum-geoscientist",
    "marine-biologist",
    "zoologist",
    "botanist",
    "wildlife-biologist",
    "conservation-scientist",
    "speleologist",
    "polar-researcher",
    "planetary-scientist",
    "ecologist",
    "climate-change-analyst",
    "natural-resource-manager",
  ];

  it.each(fieldScienceIds)("%s is curated, not a fallback template", (id) => {
    // Each one now has a hand-written entry, so it must not be object-identical
    // to any shared template.
    const details = getCareerDetails(id);
    expect(details).not.toBe(defaultDetailsByCategory.HEALTHCARE_LIFE_SCIENCES);
    expect(hasDetailedContent(id)).toBe(true);
    // Curated entries carry the fields the Journey tabs actually render.
    expect(details.whatYouActuallyDo.length).toBeGreaterThanOrEqual(4);
    expect(details.typicalDay.tools?.length).toBeGreaterThanOrEqual(3);
    expect(details.typicalDay.environment).toBeTruthy();
    expect(details.realityCheck).toBeTruthy();
    expect(details.entryPaths.length).toBeGreaterThanOrEqual(4);
  });

  it.each(fieldScienceIds)("%s is never described as treating patients", (id) => {
    const details = getCareerDetails(id);
    const text = [
      ...details.whatYouActuallyDo,
      ...details.typicalDay.morning,
      ...details.typicalDay.midday,
      ...details.typicalDay.afternoon,
      details.typicalDay.environment ?? "",
    ]
      .join(" ")
      .toLowerCase();
    expect(text).not.toMatch(/patient|clinic|hospital|treatment/);
  });

  it("keeps the clinical template for actual clinical careers", () => {
    const nurse = getCareerDetails("obstetric-nurse");
    expect(nurse).toBe(defaultDetailsByCategory.HEALTHCARE_LIFE_SCIENCES);
  });

  it("prefers a career id override over the category template", () => {
    expect(defaultDetailsForCategory("HEALTHCARE_LIFE_SCIENCES", globalDefault, "geologist")).not.toBe(
      defaultDetailsByCategory.HEALTHCARE_LIFE_SCIENCES,
    );
    expect(defaultDetailsForCategory("HEALTHCARE_LIFE_SCIENCES", globalDefault, "nurse")).toBe(
      defaultDetailsByCategory.HEALTHCARE_LIFE_SCIENCES,
    );
  });
});

describe("volcanologist is curated, not a fallback", () => {
  const details = getCareerDetails("volcanologist");

  it("describes volcano monitoring rather than patient care", () => {
    const doing = details.whatYouActuallyDo.join(" ").toLowerCase();
    expect(doing).toContain("volcano");
    expect(doing).not.toContain("patient");
  });

  it("gives a research/field work environment", () => {
    expect(details.typicalDay.environment?.toLowerCase()).not.toContain("clinic");
    expect(details.typicalDay.environment?.toLowerCase()).toMatch(/field|lab|observatory/);
  });

  it("lists geoscience tools", () => {
    expect(details.typicalDay.tools?.join(" ").toLowerCase()).toContain("seismometer");
  });

  it("is honest that Norway has no mainland volcanoes", () => {
    expect(details.realityCheck?.toLowerCase()).toContain("no active volcanoes on the mainland");
  });
});
