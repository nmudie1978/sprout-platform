// src/lib/career-localization/__tests__/display.test.ts
import { describe, it, expect } from "vitest";
import { displaySalary, displayEducation, showsSalaryProgression } from "../display";
import type { LocalizedCareerView } from "../types";

function lc(over: Partial<LocalizedCareerView>): LocalizedCareerView {
  return { id: "x", title: "X", emoji: "", description: "", avgSalary: "700,000 - 1,400,000 kr/year",
    educationPath: "Medical Degree", keySkills: [], dailyTasks: [], growthOutlook: "high",
    isLocalized: true, ...over } as LocalizedCareerView;
}

describe("displaySalary", () => {
  it("returns the salary when localized and non-empty", () => {
    expect(displaySalary(lc({}))).toBe("700,000 - 1,400,000 kr/year");
  });
  it("returns null when not localized", () => {
    expect(displaySalary(lc({ isLocalized: false, avgSalary: "" }))).toBeNull();
  });
  it("returns null when localized but salary suppressed/empty", () => {
    expect(displaySalary(lc({ isLocalized: true, avgSalary: "" }))).toBeNull();
  });
});

describe("displayEducation", () => {
  it("returns the path when localized and non-empty", () => {
    expect(displayEducation(lc({ educationPath: "Grado en Medicina" }))).toBe("Grado en Medicina");
  });
  it("returns null when not localized or empty", () => {
    expect(displayEducation(lc({ isLocalized: false, educationPath: "" }))).toBeNull();
    expect(displayEducation(lc({ educationPath: "  " }))).toBeNull();
  });
});

describe("showsSalaryProgression", () => {
  it("shows for Norway / no country (NOK progression is Norway-only)", () => {
    expect(showsSalaryProgression(null)).toBe(true);
    expect(showsSalaryProgression(undefined)).toBe(true);
    expect(showsSalaryProgression("Norway")).toBe(true);
  });
  it("hides for any other launched country", () => {
    expect(showsSalaryProgression("Spain")).toBe(false);
  });
});
