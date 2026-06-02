import { describe, it, expect } from "vitest";
import type { Career } from "@/lib/career-pathways";
import { localizeCareer } from "@/lib/career-localization";

const base: Career = {
  id: "doctor",
  title: "Doctor",
  emoji: "🩺",
  description: "Diagnose and treat illness.",
  avgSalary: "700,000 - 1,400,000 kr/year",
  educationPath: "Medical degree (6 yrs) via Samordna opptak",
  keySkills: ["empathy"],
  dailyTasks: ["see patients"],
  growthOutlook: "high",
};

describe("localizeCareer", () => {
  it("Norway/default → unchanged + isLocalized true", () => {
    const v = localizeCareer(base, "Norway");
    expect(v.avgSalary).toBe(base.avgSalary);
    expect(v.educationPath).toBe(base.educationPath);
    expect(v.isLocalized).toBe(true);
  });

  it("Spain + localized career → ES overrides, EUR salary, no NOK", () => {
    const v = localizeCareer(base, "Spain"); // doctor is in es.ts
    expect(v.isLocalized).toBe(true);
    expect(v.avgSalary).toMatch(/€|EUR/);
    expect(v.avgSalary).not.toMatch(/kr/);
  });

  it("Spain + NON-localized career → suppress salary+path, isLocalized false", () => {
    const v = localizeCareer({ ...base, id: "zzz-not-localized" }, "Spain");
    expect(v.isLocalized).toBe(false);
    expect(v.avgSalary).toBe("");
    expect(v.educationPath).toBe("");
    expect(v.description).toBe(base.description); // universal text kept
  });

  it("logged-out/undefined country → unchanged", () => {
    expect(localizeCareer(base, undefined).avgSalary).toBe(base.avgSalary);
    expect(localizeCareer(base, null).isLocalized).toBe(true);
  });
});
