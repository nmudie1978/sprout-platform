import { describe, it, expect } from "vitest";
import { getSwedishContextForAI, getCondensedSwedishContext } from "../swedish-context";
import { getCondensedNorwegianContext } from "../norwegian-context";
import { getCountryContext } from "../country-context";

const full = getSwedishContextForAI();
const condensed = getCondensedSwedishContext();

describe("Swedish AI context", () => {
  it("is wired into the country context Sweden actually resolves to", () => {
    const ctx = getCountryContext("Sweden");
    expect(ctx.condensedAiContext()).toBe(condensed);
  });

  // The point of this file. Sweden previously had 2.6KB against Norway's
  // 8.4KB, which produced generic advice wearing Swedish nouns.
  it("is comparable in depth to the Norwegian context", () => {
    expect(full.length).toBeGreaterThan(6000);
    expect(condensed.length).toBeGreaterThan(getCondensedNorwegianContext().length * 0.6);
  });

  // Facts a young person cannot get right by guessing, and which are the
  // ones most likely to be answered with a Norwegian assumption.
  it("states that Sweden has no statutory minimum wage", () => {
    expect(condensed).toMatch(/NO statutory minimum wage/i);
    expect(condensed).toContain("kollektivavtal");
  });

  it("says pay is monthly, not annual", () => {
    expect(condensed).toMatch(/MONTHLY|månadslön/);
  });

  it("covers the 16-17 night-work rule", () => {
    expect(condensed).toContain("22:00");
  });

  // Distinctly Swedish and the most useful thing to tell a 16-year-old:
  // kommuner run guaranteed summer jobs, applied for in the new year.
  it("mentions kommunala feriejobb and when to apply", () => {
    expect(condensed).toMatch(/feriejobb/i);
    expect(condensed).toMatch(/January-March/i);
  });

  it("gives Högskoleprovet as a real second route, not a footnote", () => {
    expect(condensed).toContain("Högskoleprovet");
    expect(condensed).toMatch(/third of places/i);
  });

  it("corrects the belief that a vocational programme closes the university door", () => {
    expect(condensed).toMatch(/does not close that door/i);
  });

  it("carries the Gy25 reform, which today's 15-year-olds graduate under", () => {
    expect(condensed).toContain("Gy25");
    expect(condensed).toContain("2028");
  });

  // A Norwegian fact leaking into Swedish guidance is the failure mode this
  // whole file exists to prevent.
  it("contains no Norwegian institutions or currency", () => {
    for (const term of ["NOK", "Lånekassen", "Samordna", "fagbrev", "videregående", "NTNU"]) {
      expect(full, `leaks "${term}"`).not.toContain(term);
    }
  });
});
