import { describe, it, expect } from "vitest";
import { jurisdictionFor, unreviewedJurisdictions } from "../jurisdictions";

describe("jurisdictionFor", () => {
  it("serves Norway its own reviewed terms", () => {
    const j = jurisdictionFor("Norway");
    expect(j.country).toBe("Norway");
    expect(j.governingLaw).toBe("Norwegian law");
    expect(j.supervisoryAuthority.short).toBe("Datatilsynet");
  });

  // The safety property this module exists for. A drafted jurisdiction must
  // NOT reach users until a lawyer has signed it off — showing someone
  // another country's reviewed terms is a disclosed position; showing them
  // unreviewed copy written by engineers is not.
  it("does not serve an unreviewed draft, even when one exists", () => {
    const j = jurisdictionFor("Sweden");
    expect(j.country).toBe("Norway");
    expect(j.supervisoryAuthority.short).not.toBe("IMY");
  });

  it("falls back to Norway for unknown or missing countries", () => {
    expect(jurisdictionFor("Brazil").country).toBe("Norway");
    expect(jurisdictionFor(null).country).toBe("Norway");
    expect(jurisdictionFor(undefined).country).toBe("Norway");
  });

  it("never returns a jurisdiction that has not been reviewed", () => {
    for (const c of ["Norway", "Sweden", "Denmark", "Spain", null]) {
      expect(jurisdictionFor(c).reviewed, `${c} served unreviewed copy`).toBe(true);
    }
  });

  it("requires a review note wherever review is claimed", () => {
    expect(jurisdictionFor("Norway").reviewNote).toBeTruthy();
  });
});

describe("unreviewedJurisdictions", () => {
  it("lists Sweden as still awaiting counsel", () => {
    const names = unreviewedJurisdictions().map((j) => j.country);
    expect(names).toContain("Sweden");
  });
});
