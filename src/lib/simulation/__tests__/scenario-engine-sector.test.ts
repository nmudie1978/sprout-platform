/**
 * Scenario-engine sector-employer guards.
 *
 * Regression: a "Soldier" roadmap surfaced "Yara International" (a chemicals
 * company) as the employer, because the keyword-based sector classifier had no
 * military branch and fell back to an industrial `general` list. Employers are
 * now resolved from the authoritative career *category*, so every catalogue
 * career lands on a sensible sector. These tests lock that in.
 */
import { describe, it, expect } from "vitest";
import { generateScenarios } from "@/lib/simulation/scenario-engine";
import { getAllCareers } from "@/lib/career-pathways";

/** Employers that should never appear on a non-industrial career roadmap. */
const INDUSTRIAL = ["Yara International", "Norsk Hydro"];

describe("scenario-engine sector employers", () => {
  it("a Soldier roadmap shows defence employers, never a chemicals company", () => {
    const scenarios = generateScenarios("soldier", "Soldier");
    const employers = scenarios.map((s) => s.employer.name);
    // If scenarios were generated, none should be an industrial fallback.
    for (const name of employers) {
      expect(INDUSTRIAL).not.toContain(name);
    }
    // When present, defence careers should map to recognised forces employers.
    if (employers.length > 0) {
      const looksDefence = employers.some((n) =>
        /Forsvaret|Hæren|Sjøforsvaret|Heimevernet/.test(n),
      );
      expect(looksDefence, `soldier employers: ${employers.join(", ")}`).toBe(true);
    }
  });

  it("a Police Officer roadmap never shows a chemicals company", () => {
    const employers = generateScenarios("police-officer", "Police Officer").map(
      (s) => s.employer.name,
    );
    for (const name of employers) expect(INDUSTRIAL).not.toContain(name);
  });

  it("a Social Worker roadmap never shows a chemicals company", () => {
    const employers = generateScenarios("social-worker", "Social Worker").map(
      (s) => s.employer.name,
    );
    for (const name of employers) expect(INDUSTRIAL).not.toContain(name);
  });

  // Regression: the journey report calls generateScenarios(title, title) — i.e.
  // with the display TITLE ("Sniper") as the careerId, not the slug ("sniper").
  // Category lookup is keyed by slug, so the title missed it, the keyword
  // heuristic didn't recognise "sniper", and it fell through to the `general`
  // pool — surfacing "Telenor · Graduate · Oslo" as a sniper's first employer.
  it("a Sniper roadmap (looked up by title) shows defence employers, never Telenor", () => {
    const employers = generateScenarios("Sniper", "Sniper").map(
      (s) => s.employer.name,
    );
    expect(employers).not.toContain("Telenor");
    expect(employers).not.toContain("Oslo Kommune");
    if (employers.length > 0) {
      const looksDefence = employers.some((n) =>
        /Forsvaret|Hæren|Sjøforsvaret|Heimevernet/.test(n),
      );
      expect(looksDefence, `sniper employers: ${employers.join(", ")}`).toBe(true);
    }
  });

  // Every MILITARY_DEFENCE career, when looked up by its display title (the way
  // the report does), must resolve to the military employer pool.
  it("all military careers resolve to defence employers when looked up by title", () => {
    const military = getAllCareers().filter((c) => c.pathType === "military");
    expect(military.length).toBeGreaterThan(0);
    const CIVILIAN_FALLBACK = ["Telenor", "Oslo Kommune", "DNB", "NAV"];
    for (const career of military) {
      const employers = generateScenarios(career.title, career.title).map(
        (s) => s.employer.name,
      );
      for (const name of employers) {
        expect(
          CIVILIAN_FALLBACK,
          `${career.title} → ${name}`,
        ).not.toContain(name);
      }
    }
  });
});
