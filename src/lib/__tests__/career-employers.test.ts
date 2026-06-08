import { describe, it, expect } from "vitest";
import {
  getRepresentativeEmployers,
  getCareerEmployers,
  hasCareerEmployers,
  employersApplyTo,
} from "../career-employers";

describe("country-localised employers", () => {
  it("employersApplyTo: true for Norway/Spain/unknown, false for countries without data", () => {
    for (const c of ["Norway", "NO", "no", "Norge", "Spain", "ES", "España"]) expect(employersApplyTo(c)).toBe(true);
    expect(employersApplyTo(undefined)).toBe(true); // app default is Norway
    expect(employersApplyTo(null)).toBe(true);
    for (const c of ["Sweden", "SE", "Italy", "IT"]) expect(employersApplyTo(c)).toBe(false);
  });

  it("returns Spanish employers (not Norwegian) for a Spain user", () => {
    const es = getCareerEmployers("software-developer", "TECHNOLOGY_IT", "Spain");
    expect(es.length).toBeGreaterThan(0);
    // must be Spanish companies, not the curated Norwegian list (Bekk/Visma)
    const names = es.map((e) => e.name).join(" ");
    expect(names).toMatch(/Indra|Telefónica|Amadeus|NTT/);
    expect(names).not.toMatch(/Bekk|Visma|Telenor/);
    expect(hasCareerEmployers("software-developer", "TECHNOLOGY_IT", "ES")).toBe(true);
  });

  it("returns Norwegian employers for Norway / unset country", () => {
    expect(getCareerEmployers("software-developer", "TECHNOLOGY_IT", "Norway")[0].name).toBe("Bekk");
    expect(getCareerEmployers("software-developer", "TECHNOLOGY_IT").length).toBeGreaterThan(0);
    expect(hasCareerEmployers("software-developer", "TECHNOLOGY_IT", "NO")).toBe(true);
  });

  it("returns [] for a country we have no employer data for", () => {
    expect(getCareerEmployers("software-developer", "TECHNOLOGY_IT", "Sweden")).toEqual([]);
    expect(hasCareerEmployers("doctor", "HEALTHCARE_LIFE_SCIENCES", "Italy")).toBe(false);
  });

  it("every Spanish sector employer has a valid https link", () => {
    for (const cat of ["HEALTHCARE_LIFE_SCIENCES", "FINANCE_BANKING", "CONSTRUCTION_TRADES", "TELECOMMUNICATIONS"]) {
      const es = getCareerEmployers("x", cat, "ES");
      expect(es.length).toBeGreaterThan(0);
      for (const e of es) {
        expect(() => new URL(e.careersUrl as string)).not.toThrow();
        expect(e.careersUrl as string).toMatch(/^https:\/\//);
      }
    }
  });
});

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
