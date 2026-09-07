import { describe, it, expect } from "vitest";
import { SCB_SALARY_MAPPING, SCB_UNMAPPED_CAREERS } from "../scb-salary-mapping";
import { MANUAL_SSYK_OVERRIDES } from "../scb-manual-overrides";
import occupations from "../scb-occupations.generated.json";
import { CAREER_PATHWAYS } from "@/lib/career-pathways";

const VALID_SSYK = new Set(occupations.occupations.map((o) => o.code));
const ALL_CAREER_IDS = new Set(
  Object.values(CAREER_PATHWAYS).flat().map((c) => c.id),
);

describe("SCB salary mapping", () => {
  it("maps every entry to an SSYK code SCB actually publishes", () => {
    for (const m of SCB_SALARY_MAPPING) {
      expect(VALID_SSYK.has(m.ssykCode), `${m.careerId} → unknown SSYK ${m.ssykCode}`).toBe(true);
    }
  });

  it("carries the SSYK label alongside the code, so a wrong mapping is readable", () => {
    for (const m of SCB_SALARY_MAPPING) {
      expect(m.ssykLabel, `${m.careerId} has no SSYK label`).toBeTruthy();
    }
  });

  it("references only careers that exist in the catalog", () => {
    for (const m of SCB_SALARY_MAPPING) {
      expect(ALL_CAREER_IDS.has(m.careerId), `unknown careerId ${m.careerId}`).toBe(true);
    }
    for (const id of SCB_UNMAPPED_CAREERS) {
      expect(ALL_CAREER_IDS.has(id), `unknown unmapped careerId ${id}`).toBe(true);
    }
  });

  it("maps each career at most once", () => {
    const seen = new Set<string>();
    for (const m of SCB_SALARY_MAPPING) {
      expect(seen.has(m.careerId), `duplicate mapping for ${m.careerId}`).toBe(false);
      seen.add(m.careerId);
    }
  });

  it("never both maps and unmaps the same career", () => {
    const mapped = new Set(SCB_SALARY_MAPPING.map((m) => m.careerId));
    for (const id of SCB_UNMAPPED_CAREERS) {
      expect(mapped.has(id), `${id} is both mapped and listed unmapped`).toBe(false);
    }
  });

  // The collisions are the whole reason this crosswalk exists. Pin the two
  // worst so a regenerated mapping cannot quietly reintroduce them.
  it("resolves the known SSYK code collisions", () => {
    const byCareer = new Map(SCB_SALARY_MAPPING.map((m) => [m.careerId, m]));

    // STYRK 2212 (specialist doctors) collides with SSYK 2212 "Resident
    // physicians" — doctors still in training, on materially lower pay.
    const surgeon = byCareer.get("surgeon");
    if (surgeon) {
      expect(surgeon.ssykCode, "surgeon must not use the resident-physician code").not.toBe("2212");
      expect(surgeon.ssykLabel.toLowerCase()).not.toContain("resident");
    }

    // STYRK 1412 (restaurant managers) collides with SSYK "Headmasters".
    const restaurant = byCareer.get("restaurant-manager");
    if (restaurant) {
      expect(restaurant.ssykLabel.toLowerCase()).not.toContain("headmaster");
    }
  });

  it("every manual override targets a real SSYK code or an explicit null", () => {
    for (const [styrk, o] of Object.entries(MANUAL_SSYK_OVERRIDES)) {
      expect(o.note, `${styrk} override has no justification`).toBeTruthy();
      if (o.ssykCode !== null) {
        expect(VALID_SSYK.has(o.ssykCode), `${styrk} → unknown SSYK ${o.ssykCode}`).toBe(true);
      }
    }
  });
});
