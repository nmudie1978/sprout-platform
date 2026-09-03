/**
 * IT Service Management cluster guards.
 *
 * ITSM roles existed in the catalogue before this suite, but only as
 * telecom-scoped variants filed under TELECOMMUNICATIONS — so a young person
 * browsing Technology & IT never saw them, and searching "ITSM" or
 * "service desk" returned nothing at all. These tests lock in the fix:
 * a cross-industry cluster in TECHNOLOGY_IT, findable by the words people
 * actually type, with an entry rung a school leaver can reach.
 */
import { describe, it, expect } from "vitest";
import { CAREER_PATHWAYS, getAllCareers, getCareerById } from "@/lib/career-pathways";
import { searchCatalog } from "@/lib/careers-catalog/from-catalog";

const ITSM_IDS = [
  "service-desk-analyst",
  "incident-manager",
  "problem-manager",
  "change-enablement-manager",
  "service-desk-manager",
  "service-delivery-manager",
  "it-service-manager",
] as const;

describe("IT service management careers", () => {
  it("has the full cluster in Technology & IT, not only in Telecommunications", () => {
    const techIds = new Set(CAREER_PATHWAYS.TECHNOLOGY_IT.map((c) => c.id));
    const missing = ITSM_IDS.filter((id) => !techIds.has(id));
    expect(missing, `ITSM careers absent from TECHNOLOGY_IT:\n${missing.join("\n")}`).toEqual([]);
  });

  it("is findable by the terms people actually search for", () => {
    const all = getAllCareers();
    for (const term of ["itsm", "itil", "service desk", "incident", "service management"]) {
      expect(searchCatalog(all, term).length, `search "${term}" returned nothing`).toBeGreaterThan(0);
    }
  });

  // The point of adding this cluster is that ITSM is reachable without a
  // degree. If every rung demanded university, it would be no more use to a
  // 17-year-old than the roles it replaced.
  it("offers a school-leaver entry rung and stays a non-degree route", () => {
    const analyst = getCareerById("service-desk-analyst");
    expect(analyst?.entryLevel).toBe(true);
    expect(analyst?.educationRoute).toBe("certification");

    const universityOnly = ITSM_IDS.filter(
      (id) => getCareerById(id)?.educationRoute === "university",
    );
    expect(universityOnly, `ITSM rungs wrongly gated behind a degree:\n${universityOnly.join("\n")}`).toEqual([]);
  });

  it("keeps the telecom-specific variants distinct", () => {
    // Same job families, but framed around telecom networks — they stay put
    // under TELECOMMUNICATIONS rather than being merged or deleted.
    for (const id of ["telco-incident-manager", "telco-problem-manager", "telco-change-manager", "telco-service-delivery-manager"]) {
      expect(getCareerById(id), `${id} disappeared`).toBeDefined();
    }
  });
});
