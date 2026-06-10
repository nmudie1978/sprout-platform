import { describe, it, expect } from "vitest";
import {
  inferEducationRoute,
  categoryRouteDefault,
  type Career,
} from "../career-pathways";

/**
 * #1 accuracy fix: inferEducationRoute() must no longer blanket-default to
 * "university" for careers whose educationPath has no degree/vocational
 * keyword. It now consults the career's CareerCategory so that trade /
 * creative / hands-on careers get a more honest route shape.
 */

function career(partial: Partial<Career> & Pick<Career, "id" | "educationPath">): Career {
  return {
    title: "Test",
    emoji: "🧪",
    description: "",
    avgSalary: "",
    keySkills: [],
    dailyTasks: [],
    growthOutlook: "stable",
    ...partial,
  };
}

describe("categoryRouteDefault", () => {
  it("returns vocational for the trades", () => {
    expect(categoryRouteDefault("CONSTRUCTION_TRADES")).toBe("vocational");
  });

  it("returns mixed for categories with several valid routes", () => {
    for (const cat of [
      "CREATIVE_MEDIA",
      "HOSPITALITY_TOURISM",
      "SPORT_FITNESS",
      "LOGISTICS_TRANSPORT",
      "MANUFACTURING_ENGINEERING",
      "SOCIAL_CARE_COMMUNITY",
      "PUBLIC_SERVICE_SAFETY",
    ] as const) {
      expect(categoryRouteDefault(cat)).toBe("mixed");
    }
  });

  it("returns university for predominantly degree-based categories", () => {
    for (const cat of [
      "HEALTHCARE_LIFE_SCIENCES",
      "EDUCATION_TRAINING",
      "TECHNOLOGY_IT",
      "FINANCE_BANKING",
      "BUSINESS_MANAGEMENT",
    ] as const) {
      expect(categoryRouteDefault(cat)).toBe("university");
    }
  });

  it("returns university when the category is unknown", () => {
    expect(categoryRouteDefault(undefined)).toBe("university");
  });
});

describe("inferEducationRoute", () => {
  it("prefers an explicit educationRoute field", () => {
    const c = career({
      id: "youtuber",
      educationPath: "Self-taught",
      educationRoute: "on-the-job",
    });
    expect(inferEducationRoute(c)).toBe("on-the-job");
  });

  it("still honours a vocational keyword in the path (carpenter)", () => {
    // real catalog id; path contains "Vocational"/"Apprenticeship"
    const c = career({
      id: "carpenter",
      educationPath: "Vocational training (2 years) + Apprenticeship (2 years)",
    });
    expect(inferEducationRoute(c)).toBe("vocational");
  });

  it("still honours a university keyword (general-surgeon)", () => {
    const c = career({
      id: "general-surgeon",
      educationPath: "Medical Degree (6 years) + General Surgery Specialisation",
    });
    expect(inferEducationRoute(c)).toBe("university");
  });

  it("uses the category default instead of university for a keyword-less creative career", () => {
    // youtuber is a real CREATIVE_MEDIA id; "Self-taught" has no route keyword.
    // Previously returned "university" (wrong); now "mixed".
    const c = career({ id: "youtuber", educationPath: "Self-taught" });
    expect(inferEducationRoute(c)).toBe("mixed");
  });

  it("uses vocational for a keyword-less trades career", () => {
    // bricklayer is a CONSTRUCTION_TRADES-only id (not cross-listed into
    // MANUFACTURING_ENGINEERING, which would resolve "mixed" first-wins).
    // Strip the keyword to exercise the category fallback path.
    const c = career({ id: "bricklayer", educationPath: "Hands-on training" });
    expect(inferEducationRoute(c)).toBe("vocational");
  });

  it("falls back to university for a keyword-less career in an unknown category", () => {
    const c = career({ id: "not-a-real-career-xyz", educationPath: "Some training" });
    expect(inferEducationRoute(c)).toBe("university");
  });
});
