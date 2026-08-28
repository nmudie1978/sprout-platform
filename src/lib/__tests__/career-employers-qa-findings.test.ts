import { describe, it, expect } from "vitest";
import { getCareerEmployers, hasCareerEmployers } from "../career-employers";
import { getCategoryForCareer } from "../career-pathways";

/**
 * Regression guard for the 12 failures the semantic-QA agent confirmed on
 * 2026-08-28 (`--target=employers --source=fallback`).
 *
 * Each was a career at the edge of its category inheriting that category's
 * generic employer list. These assertions are written against the SYMPTOM the
 * agent found — a named employer that would not hire the role — so they still
 * fail if someone removes the override, remaps the career, or reorders the
 * lookup chain, regardless of how the fix is implemented.
 */

const NO = "Norway";

function employerNames(careerId: string): string[] {
  return getCareerEmployers(careerId, getCategoryForCareer(careerId) ?? null, NO).map((e) => e.name);
}

describe("QA-confirmed employer failures stay fixed", () => {
  it.each([
    ["cinema-attendant", ["SAS", "Scandic Hotels", "Thon Hotels"]],
    ["amusement-park-worker", ["SAS", "Scandic Hotels"]],
    ["car-wash-attendant", ["SAS", "Scandic Hotels"]],
    ["camp-counsellor", ["Universitetet i Oslo", "NTNU"]],
    ["counter-intelligence-officer", ["NAV", "Skatteetaten"]],
    ["nav-case-worker", ["Politiet", "Skatteetaten"]],
    ["ticketing-manager", ["Norges Fotballforbund", "SATS"]],
    ["early-childhood-educator", ["NAV", "Politiet", "Skatteetaten"]],
  ])("%s is no longer shown implausible employers", (careerId, forbidden) => {
    const names = employerNames(careerId);
    expect(names.length).toBeGreaterThan(0);
    for (const bad of forbidden) expect(names).not.toContain(bad);
  });

  it.each(["base-jumper", "wingsuit-pilot", "skateboarder-pro", "motocross-rider"])(
    "%s shows no employer at all rather than a wrong one",
    (careerId) => {
      // Sponsorship-funded independents. An empty list hides the section;
      // the sector fallback would have offered SATS and the football federation.
      expect(employerNames(careerId)).toHaveLength(0);
      expect(hasCareerEmployers(careerId, getCategoryForCareer(careerId) ?? null, NO)).toBe(false);
    },
  );

  it("moves early-childhood-educator out of PUBLIC_SERVICE_SAFETY", () => {
    // The category drives the employer fallback AND the typical-day default
    // (this career has no curated day text), so the miscategorisation was
    // visible in two places, not one.
    expect(getCategoryForCareer("early-childhood-educator")).toBe("EDUCATION_TRAINING");
  });

  it("leaves the category lists themselves intact for their mainstream", () => {
    // The fix is per-career, not a rewrite of the sector lists: a receptionist
    // really does work for Scandic, a teacher really does work for a kommune.
    expect(employerNames("hotel-manager")).toContain("Scandic Hotels");
  });
});
