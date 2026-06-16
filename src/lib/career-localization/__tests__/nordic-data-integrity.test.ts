import { describe, it, expect } from "vitest";
import { SV_CAREER_LOCALIZATION } from "@/lib/career-localization/sv";
import { DA_CAREER_LOCALIZATION } from "@/lib/career-localization/da";
import { CAREER_PATHWAYS } from "@/lib/career-pathways";

const ALL_IDS = new Set(
  Object.values(CAREER_PATHWAYS).flat().map((c) => c.id),
);

describe.each([
  ["sv", SV_CAREER_LOCALIZATION],
  ["da", DA_CAREER_LOCALIZATION],
])("%s localization data integrity", (locale, table) => {
  it("every localized careerId exists in the catalog", () => {
    for (const id of Object.keys(table)) {
      expect(ALL_IDS.has(id), `unknown careerId in ${locale}.ts: ${id}`).toBe(true);
    }
  });

  it("every salary/educationPath override carries a real (non-placeholder) source", () => {
    for (const [id, e] of Object.entries(table)) {
      for (const field of [e.salary, e.educationPath]) {
        if (field) {
          expect(field.source, `${locale}:${id} missing source`).toBeTruthy();
          expect(field.source, `${locale}:${id} placeholder source`).not.toMatch(/PLACEHOLDER/i);
          expect(field.source, `${locale}:${id} non-http source`).toMatch(/^https?:\/\//);
          expect(field.value, `${locale}:${id} empty value`).toBeTruthy();
        }
      }
    }
  });

  it("has a meaningful number of seeded careers", () => {
    expect(Object.keys(table).length).toBeGreaterThanOrEqual(20);
  });
});
