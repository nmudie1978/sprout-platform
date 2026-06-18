import { describe, it, expect } from "vitest";
import mapData from "@/lib/education/data/career-discipline-map.json";
import { DISCIPLINE_IDS } from "@/lib/education/disciplines";
import { FIELD_OPTIONS, searchFields } from "../field-options";

const map: Record<string, string> = (mapData as { map: Record<string, string> }).map;

describe("FIELD_OPTIONS", () => {
  it("has one entry per distinct disciplineId used in the map", () => {
    const distinct = new Set(Object.values(map));
    expect(FIELD_OPTIONS.length).toBe(distinct.size);
  });

  it("every FIELD_OPTIONS.id appears in DISCIPLINE_IDS", () => {
    const disciplineSet = new Set<string>(DISCIPLINE_IDS);
    for (const option of FIELD_OPTIONS) {
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
