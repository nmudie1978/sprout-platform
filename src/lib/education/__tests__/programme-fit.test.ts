import { describe, it, expect } from "vitest";
import { programmeCareerFit, resolveProgrammeField } from "@/lib/education/programme-fit";

describe("resolveProgrammeField", () => {
  it("resolves an exact field label", () => {
    expect(resolveProgrammeField("Psychology")?.id).toBe("psychology");
  });
  it("resolves a known alias (case-insensitive)", () => {
    // "robotics" is an alias of the synthetic Robotics field
    expect(resolveProgrammeField("Robotics")?.id).toBe("robotics");
  });
  it("returns null for unknown / empty programmes", () => {
    expect(resolveProgrammeField("underwater basket weaving")).toBeNull();
    expect(resolveProgrammeField("")).toBeNull();
    expect(resolveProgrammeField(null)).toBeNull();
  });
});

describe("programmeCareerFit", () => {
  it("flags a clear cross-discipline mismatch (Robotics -> Psychologist)", () => {
    expect(programmeCareerFit("robotics", "psychologist")).toBe("mismatch");
  });

  it("treats a reachable career as a fit (Robotics -> Robotics Engineer)", () => {
    expect(programmeCareerFit("robotics", "robotics-engineer")).toBe("fit");
  });

  it("treats a same-discipline career as a fit (Psychology -> Psychologist)", () => {
    expect(programmeCareerFit("Psychology", "psychologist")).toBe("fit");
  });

  it("stays silent (unknown) when the programme can't be resolved", () => {
    expect(programmeCareerFit("underwater basket weaving", "psychologist")).toBe("unknown");
  });

  it("stays silent (unknown) when inputs are missing", () => {
    expect(programmeCareerFit(null, "psychologist")).toBe("unknown");
    expect(programmeCareerFit("robotics", null)).toBe("unknown");
    expect(programmeCareerFit("", "")).toBe("unknown");
  });
});
