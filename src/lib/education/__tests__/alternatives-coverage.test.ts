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

// TODO(unskip in Task 6 once discipline-bucket data lands): the 80% gate.
describe("universities coverage (Norway primary market)", () => {
  it.skip("≥80% of careers have a local (NO) named university", () => {
    const pct = careerIds.filter(hasLocal).length / careerIds.length;
    expect(pct).toBeGreaterThanOrEqual(0.8);
  });

  it.skip("≥80% of careers have a European alternative", () => {
    const pct = careerIds.filter(hasEurope).length / careerIds.length;
    expect(pct).toBeGreaterThanOrEqual(0.8);
  });
});
