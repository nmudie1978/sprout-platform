import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { getLocalAlternatives, getEuropeanAlternatives } from "../alternatives";
import { getProgrammesForCareer } from "../index";

// Universe: unique career ids from the catalogue source.
const src = readFileSync("src/lib/career-pathways.ts", "utf8");
const careerIds = Array.from(
  new Set(Array.from(src.matchAll(/id: "([a-z0-9][a-z0-9-]*)"/g), (m) => m[1])),
);

const hasLocal = (id: string) =>
  getLocalAlternatives(id, "NO").length > 0 ||
  getProgrammesForCareer(id, { country: "NO" }).length > 0;
const hasEurope = (id: string) => getEuropeanAlternatives(id).length > 0;

const hasLocalSE = (id: string) =>
  getLocalAlternatives(id, "SE").length > 0 ||
  getProgrammesForCareer(id, { country: "SE" }).length > 0;

describe("universities coverage (Norway primary market)", () => {
  it("≥80% of careers have a local (NO) named university", () => {
    const pct = careerIds.filter(hasLocal).length / careerIds.length;
    expect(pct).toBeGreaterThanOrEqual(0.8);
  });

  it("≥80% of careers have a European alternative", () => {
    const pct = careerIds.filter(hasEurope).length / careerIds.length;
    expect(pct).toBeGreaterThanOrEqual(0.8);
  });
});

describe("universities coverage (Sweden)", () => {
  // Sweden's `local` list was empty until 2026-09-08, so a Swedish user
  // asking "where would I study this?" got the broad-Europe list and nothing
  // from their own country. Held to the same bar as Norway.
  it("≥80% of careers have a local (SE) named institution", () => {
    const pct = careerIds.filter(hasLocalSE).length / careerIds.length;
    expect(pct).toBeGreaterThanOrEqual(0.8);
  });

  it("names a Swedish institution, not a Norwegian one", () => {
    for (const id of ["doctor", "lawyer", "software-developer"]) {
      for (const uni of getLocalAlternatives(id, "SE")) {
        expect(uni.country, `${id} -> ${uni.name}`).toBe("SE");
      }
    }
  });

  // A university does not teach hairdressing. Norway points these buckets at
  // Fagskolen and videregående; Sweden should point at YH and gymnasium
  // rather than inventing a degree that does not exist.
  it("points trades and beauty at the route that actually exists", () => {
    for (const id of ["hairdresser", "electrician"]) {
      const names = getLocalAlternatives(id, "SE").map((u) => u.name.toLowerCase());
      if (names.length === 0) continue;
      expect(
        names.some((n) => n.includes("yrkeshögskolan") || n.includes("yrkesprogram")),
        `${id} should point at a vocational route`,
      ).toBe(true);
    }
  });
});
