/**
 * Guards for explored-derived recommendations (dashboard "Recommended for you").
 */
import { describe, it, expect } from "vitest";
import { getAllCareers, getCategoryForCareer } from "@/lib/career-pathways";
import {
  getExploredRecommendations,
  type RecommendationSignal,
} from "@/lib/discover/explored-recommendations";

const ALL = getAllCareers();
const LOOKUP = { all: ALL, categoryForCareer: getCategoryForCareer };
const exists = (id: string) => ALL.some((c) => c.id === id);

describe("getExploredRecommendations", () => {
  it("returns nothing for a brand-new user (no signals)", () => {
    expect(getExploredRecommendations([], LOOKUP)).toEqual([]);
  });

  it("never recommends a career the user has already engaged with", () => {
    // Seed with a real career id.
    const seedId = exists("doctor") ? "doctor" : ALL[0].id;
    const signals: RecommendationSignal[] = [
      { careerId: seedId, weight: 5, kind: "rated", title: "Seed" },
    ];
    const recs = getExploredRecommendations(signals, LOOKUP, 5);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.some((r) => r.career.id === seedId)).toBe(false);
  });

  it("recommends same-category neighbours and attributes the reason", () => {
    const seedId = exists("doctor") ? "doctor" : ALL[0].id;
    const recs = getExploredRecommendations(
      [{ careerId: seedId, weight: 5, kind: "explored", title: "Doctor" }],
      LOOKUP,
      3,
    );
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].reason).toContain("Because you explored Doctor");
    // No duplicate careers in the output.
    const ids = recs.map((r) => r.career.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is deterministic — same input yields the same order", () => {
    const seedId = exists("doctor") ? "doctor" : ALL[0].id;
    const signals: RecommendationSignal[] = [
      { careerId: seedId, weight: 4, kind: "rated", title: "Seed" },
    ];
    const a = getExploredRecommendations(signals, LOOKUP, 3).map((r) => r.career.id);
    const b = getExploredRecommendations(signals, LOOKUP, 3).map((r) => r.career.id);
    expect(a).toEqual(b);
  });

  it("ignores unknown career ids without throwing", () => {
    const recs = getExploredRecommendations(
      [{ careerId: "not-a-real-career-xyz", weight: 5, kind: "saved" }],
      LOOKUP,
      3,
    );
    expect(recs).toEqual([]);
  });

  it("uses the 'saved' attribution when the strongest source is a save", () => {
    const seedId = exists("nurse") ? "nurse" : ALL[0].id;
    const recs = getExploredRecommendations(
      [{ careerId: seedId, weight: 2, kind: "saved", title: "Nurse" }],
      LOOKUP,
      3,
    );
    if (recs.length > 0) {
      expect(recs[0].reason).toContain("Because you saved Nurse");
    }
  });
});
