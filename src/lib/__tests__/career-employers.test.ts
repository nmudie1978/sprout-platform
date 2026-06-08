import { describe, it, expect } from "vitest";
import {
  getRepresentativeEmployers,
  getCareerEmployers,
  hasCareerEmployers,
} from "../career-employers";

describe("getRepresentativeEmployers", () => {
  it("prefers curated employers (top 2) when the career has them", () => {
    // project-manager has a curated list led by Capgemini, Sopra Steria.
    const result = getRepresentativeEmployers("project-manager", "BUSINESS_MANAGEMENT");
    expect(result).toEqual(["Capgemini", "Sopra Steria"]);
  });

  it("follows curated aliases (telco-project-manager → project-manager)", () => {
    const result = getRepresentativeEmployers("telco-project-manager");
    expect(result).toEqual(["Capgemini", "Sopra Steria"]);
  });

  it("falls back to category representatives when the career is uncurated", () => {
    // A finance career not in CAREER_EMPLOYERS still gets a realistic example.
    const result = getRepresentativeEmployers("financial-advisor", "FINANCE_BANKING");
    expect(result).toEqual(["DNB", "Storebrand"]);
  });

  it("uses the telecom category for the user's telco-engineer example", () => {
    const result = getRepresentativeEmployers("telecoms-network-engineer", "TELECOMMUNICATIONS");
    expect(result[0]).toBe("Telenor");
  });

  it("returns at most two names", () => {
    const result = getRepresentativeEmployers("unknown-career", "MANUFACTURING_ENGINEERING");
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("returns empty when neither the career nor its category is known", () => {
    expect(getRepresentativeEmployers("unknown-career", undefined)).toEqual([]);
    expect(getRepresentativeEmployers("unknown-career", "NOT_A_CATEGORY")).toEqual([]);
  });
});

describe("getCareerEmployers", () => {
  it("returns the full curated list when the career has one", () => {
    const result = getCareerEmployers("software-developer", "TECHNOLOGY_IT");
    expect(result.length).toBeGreaterThan(2);
    expect(result[0].name).toBe("Bekk");
  });

  it("falls back to the full sector list for an uncurated career", () => {
    // dermatologist is not curated → healthcare sector employers.
    const result = getCareerEmployers("dermatologist", "HEALTHCARE_LIFE_SCIENCES");
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.map((e) => e.name)).toContain("Oslo universitetssykehus");
  });

  it("every returned employer has a working careers/site link", () => {
    const result = getCareerEmployers("dermatologist", "HEALTHCARE_LIFE_SCIENCES");
    for (const emp of result) {
      // Each sector employer must carry a valid absolute URL so the UI
      // never renders a dead 'Careers' affordance.
      expect(() => new URL(emp.careersUrl as string)).not.toThrow();
      expect(emp.careersUrl).toMatch(/^https:\/\//);
    }
  });

  it("returns [] when neither career nor category is known", () => {
    expect(getCareerEmployers("unknown-career", undefined)).toEqual([]);
    expect(getCareerEmployers("unknown-career", "NOT_A_CATEGORY")).toEqual([]);
  });
});

describe("hasCareerEmployers", () => {
  it("is true for an uncurated career with a known category (sector fallback)", () => {
    expect(hasCareerEmployers("dermatologist", "HEALTHCARE_LIFE_SCIENCES")).toBe(true);
  });

  it("is false when neither career nor category is known", () => {
    expect(hasCareerEmployers("unknown-career", undefined)).toBe(false);
  });
});
