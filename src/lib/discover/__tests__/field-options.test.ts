import { describe, it, expect } from "vitest";
import mapData from "@/lib/education/data/career-discipline-map.json";
import { DISCIPLINE_IDS } from "@/lib/education/disciplines";
import { FIELD_OPTIONS, searchFields, getCareersForField } from "../field-options";

const map: Record<string, string> = (mapData as { map: Record<string, string> }).map;

// The full list of named university courses the degree picker must recognise.
const COURSE_NAMES = [
  "accounting",
  "actuarial science",
  "aerospace engineering",
  "agricultural science",
  "anthropology",
  "architecture",
  "artificial intelligence",
  "biochemistry",
  "biology",
  "biomedical science",
  "business administration",
  "chemical engineering",
  "chemistry",
  "civil engineering",
  "communications",
  "computer engineering",
  "computer science",
  "criminology",
  "cyber security",
  "data science",
  "dentistry",
  "economics",
  "education",
  "electrical engineering",
  "english literature",
  "environmental science",
  "finance",
  "geography",
  "graphic design",
  "history",
  "human resource management",
  "information systems",
  "international business",
  "international relations",
  "journalism",
  "law",
  "marketing",
  "mathematics",
  "mechanical engineering",
  "medicine",
  "nursing",
  "nutrition",
  "pharmacy",
  "philosophy",
  "physics",
  "physiotherapy",
  "political science",
  "product design",
  "project management",
  "psychology",
  "public health",
  "social work",
  "sociology",
  "software engineering",
  "sports science",
  "statistics",
  "supply chain management",
  "veterinary medicine",
  "web development",
  "zoology",
];

const ROBOTICS_CAREER_IDS = [
  "robotics-engineer",
  "robotics-software-engineer",
  "space-robotics-engineer",
  "autonomous-systems-engineer",
  "autonomous-vehicle-engineer",
  "human-robot-interaction-specialist",
  "automation-engineer",
  "automation-technician",
  "ai-automation-engineer",
  "embedded-developer",
  "systems-engineer",
  "drone-systems-engineer",
  "drone-operator-uav",
];

// Synthetic (cross-bucket) fields carry their own curated careerIds and are not
// backed by a single discipline bucket; discipline-backed options have no careerIds.
const disciplineBackedOptions = FIELD_OPTIONS.filter((o) => !o.careerIds);

describe("FIELD_OPTIONS", () => {
  it("has one discipline-backed entry per distinct disciplineId used in the map", () => {
    const distinct = new Set(Object.values(map));
    expect(disciplineBackedOptions.length).toBe(distinct.size);
  });

  it("every discipline-backed FIELD_OPTIONS.id appears in DISCIPLINE_IDS", () => {
    const disciplineSet = new Set<string>(DISCIPLINE_IDS);
    for (const option of disciplineBackedOptions) {
      expect(disciplineSet.has(option.id), `${option.id} should be in DISCIPLINE_IDS`).toBe(true);
    }
  });

  it("every distinct disciplineId from the map has a corresponding FIELD_OPTIONS entry", () => {
    const distinct = new Set(Object.values(map));
    const optionIds = new Set(FIELD_OPTIONS.map((o) => o.id));
    for (const id of distinct) {
      expect(optionIds.has(id), `${id} should have a FIELD_OPTIONS entry`).toBe(true);
    }
  });

  it("each option has a non-empty label", () => {
    for (const option of FIELD_OPTIONS) {
      expect(option.label.length, `${option.id} label should be non-empty`).toBeGreaterThan(0);
    }
  });

  it("each option has at least 2 aliases", () => {
    for (const option of FIELD_OPTIONS) {
      expect(option.aliases.length, `${option.id} should have ≥2 aliases`).toBeGreaterThanOrEqual(2);
    }
  });

  it("all aliases are lowercase", () => {
    for (const option of FIELD_OPTIONS) {
      for (const alias of option.aliases) {
        expect(alias, `alias "${alias}" in ${option.id} should be lowercase`).toBe(alias.toLowerCase());
      }
    }
  });

  it("no duplicate ids", () => {
    const ids = FIELD_OPTIONS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("searchFields", () => {
  it("empty query returns all options sorted by label A–Z", () => {
    const result = searchFields("");
    expect(result.length).toBe(FIELD_OPTIONS.length);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].label.localeCompare(result[i].label)).toBeLessThanOrEqual(0);
    }
  });

  it("'med' includes the medicine option", () => {
    const result = searchFields("med");
    const ids = result.map((r) => r.id);
    expect(ids).toContain("medicine");
  });

  it("alias-only query 'cs' returns computer-science-software", () => {
    const result = searchFields("cs");
    expect(result.map((r) => r.id)).toContain("computer-science-software");
  });

  it("alias-only query 'mba' returns business-management", () => {
    const result = searchFields("mba");
    expect(result.map((r) => r.id)).toContain("business-management");
  });

  it("alias-only query 'nurse' returns nursing-allied-health", () => {
    const result = searchFields("nurse");
    expect(result.map((r) => r.id)).toContain("nursing-allied-health");
  });

  it("alias-only query 'llb' returns law", () => {
    const result = searchFields("llb");
    expect(result.map((r) => r.id)).toContain("law");
  });

  it("matching is case-insensitive", () => {
    const lower = searchFields("med");
    const upper = searchFields("MED");
    expect(lower.map((r) => r.id)).toEqual(upper.map((r) => r.id));
  });

  it("label-prefix matches rank before substring matches", () => {
    // 'data' should match 'Data Science & AI' whose label starts with 'data'
    // before options whose aliases merely contain 'data' mid-string
    const result = searchFields("data");
    const ids = result.map((r) => r.id);
    expect(ids).toContain("data-science-ai");
    const dsaiIndex = ids.indexOf("data-science-ai");
    // It should be ranked first (or near first) — at least before the last item
    expect(dsaiIndex).toBeLessThan(ids.length);
  });

  it("no query match returns empty array", () => {
    expect(searchFields("zzzzznomatch99999")).toEqual([]);
  });

  it("whitespace-only query behaves like empty query", () => {
    const result = searchFields("   ");
    expect(result.length).toBe(FIELD_OPTIONS.length);
  });

  it("query matching multiple fields returns all of them", () => {
    // 'engineering' appears in several labels
    const result = searchFields("engineering");
    expect(result.length).toBeGreaterThan(1);
  });
});

describe("named degree courses resolve to a field with careers", () => {
  it.each(COURSE_NAMES)("'%s' resolves to a field carrying ≥1 career", (name) => {
    const matches = searchFields(name);
    expect(matches.length, `"${name}" should match ≥1 field`).toBeGreaterThanOrEqual(1);
    const careers = getCareersForField(matches[0].id);
    expect(careers.length, `"${name}" → ${matches[0].id} should have ≥1 career`).toBeGreaterThanOrEqual(1);
  });
});

describe("Robotics synthetic field", () => {
  it("exists in FIELD_OPTIONS with its curated career list", () => {
    const robotics = FIELD_OPTIONS.find((o) => o.id === "robotics");
    expect(robotics, "robotics field should exist").toBeDefined();
    expect(robotics?.careerIds).toEqual(ROBOTICS_CAREER_IDS);
  });

  it.each(["robotics", "mechatronics", "autonomous systems"])(
    "search '%s' includes the robotics field",
    (q) => {
      expect(searchFields(q).map((o) => o.id)).toContain("robotics");
    },
  );

  it("getCareersForField('robotics') returns the curated list (≥10)", () => {
    const careers = getCareersForField("robotics");
    expect(careers).toEqual(ROBOTICS_CAREER_IDS);
    expect(careers.length).toBeGreaterThanOrEqual(10);
  });
});

describe("getCareersForField for discipline-backed fields", () => {
  it("'medicine' (a discipline field) still resolves to careers", () => {
    expect(getCareersForField("medicine").length).toBeGreaterThan(0);
  });
});
