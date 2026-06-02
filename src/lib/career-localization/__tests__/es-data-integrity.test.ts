import { describe, it, expect } from "vitest";
import { ES_CAREER_LOCALIZATION } from "@/lib/career-localization/es";
import { CAREER_PATHWAYS } from "@/lib/career-pathways";

const ALL_IDS = new Set(
  Object.values(CAREER_PATHWAYS).flat().map((c) => c.id),
);

describe("ES localization data integrity", () => {
  it("every localized careerId exists in the catalog", () => {
    for (const id of Object.keys(ES_CAREER_LOCALIZATION)) {
      expect(ALL_IDS.has(id), `unknown careerId in es.ts: ${id}`).toBe(true);
    }
  });

  it("every salary/educationPath override carries a real (non-placeholder) source", () => {
    for (const [id, e] of Object.entries(ES_CAREER_LOCALIZATION)) {
      for (const field of [e.salary, e.educationPath]) {
        if (field) {
          expect(field.source, `${id} missing source`).toBeTruthy();
          expect(field.source, `${id} has placeholder source`).not.toMatch(/PLACEHOLDER/i);
        }
      }
    }
  });
});
