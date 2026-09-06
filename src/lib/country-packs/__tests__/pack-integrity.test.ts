import { describe, it, expect } from "vitest";
import { getPack, getPackCareer, PACK_COUNTRIES } from "@/lib/country-packs";
import type { CountryPack } from "@/lib/country-packs/types";
import { CAREER_PATHWAYS } from "@/lib/career-pathways";

/**
 * Data integrity across every country pack. Replaces the per-table
 * es-data-integrity / nordic-data-integrity tests, which imported the
 * hand-written override modules directly — those are now generated packs.
 *
 * The heavier checks that need the network (does every verified source URL
 * actually resolve?) live in scripts/validate-country-packs.ts, which runs
 * in the build.
 */
const ALL_IDS = new Set(Object.values(CAREER_PATHWAYS).flat().map((c) => c.id));

const PACKS: [string, CountryPack][] = PACK_COUNTRIES.map((country) => [
  country,
  getPack(country)!,
]);

it("registers the expected pack countries", () => {
  expect(PACK_COUNTRIES.sort()).toEqual(["Denmark", "Spain", "Sweden"]);
});

describe.each(PACKS)("%s pack integrity", (country, pack) => {
  it("declares a country name matching its registry key", () => {
    expect(pack.country).toBe(country);
  });

  it("every careerId exists in the catalog", () => {
    for (const id of Object.keys(pack.careers)) {
      expect(ALL_IDS.has(id), `unknown careerId in ${country}: ${id}`).toBe(true);
    }
  });

  it("every record's key matches its careerId field", () => {
    for (const [id, entry] of Object.entries(pack.careers)) {
      expect(entry.careerId, `${country}:${id} key/field mismatch`).toBe(id);
    }
  });

  it("every provenanced field carries a real, non-placeholder https source", () => {
    for (const [id, entry] of Object.entries(pack.careers)) {
      for (const field of [entry.salary, entry.educationPath]) {
        if (!field) continue;
        expect(field.value, `${country}:${id} empty value`).toBeTruthy();
        expect(field.source, `${country}:${id} missing source`).toBeTruthy();
        expect(field.source, `${country}:${id} placeholder source`).not.toMatch(/PLACEHOLDER/i);
        expect(field.source, `${country}:${id} non-http source`).toMatch(/^https?:\/\//);
        expect(["verified", "estimated"]).toContain(field.tier);
      }
    }
  });

  // The point of the two-tier bar: an "estimated" figure without a source is
  // an invented figure, and this platform shows those to 15-year-olds.
  it("verified fields carry an https source", () => {
    for (const [id, entry] of Object.entries(pack.careers)) {
      for (const field of [entry.salary, entry.educationPath]) {
        if (field?.tier !== "verified") continue;
        expect(field.source, `${country}:${id} verified without https`).toMatch(/^https:\/\//);
      }
    }
  });

  it("meta coverage counts match the actual records", () => {
    expect(pack.meta.coverage.careers).toBe(Object.keys(pack.careers).length);
  });

  it("has a meaningful number of seeded careers", () => {
    expect(Object.keys(pack.careers).length).toBeGreaterThanOrEqual(20);
  });
});

describe("lookup helpers", () => {
  it("getPack returns null for Norway and unknown countries", () => {
    // Norway is deliberately not a pack country — its data is still native.
    expect(getPack("Norway")).toBeNull();
    expect(getPack("Brazil")).toBeNull();
    expect(getPack(null)).toBeNull();
    expect(getPack(undefined)).toBeNull();
  });

  it("getPackCareer returns null for an unknown career in a real pack", () => {
    expect(getPackCareer("Sweden", "definitely-not-a-career")).toBeNull();
  });

  it("getPackCareer resolves a known career", () => {
    const entry = getPackCareer("Sweden", "software-developer");
    expect(entry?.careerId).toBe("software-developer");
    expect(entry?.salary?.value).toBeTruthy();
  });
});
