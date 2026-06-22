import { describe, it, expect } from "vitest";
import { buildBridgeMindmap } from "../build-bridge-mindmap";
import type { BridgeInput } from "../bridge-mindmap-types";

const base: BridgeInput = {
  previousOccupation: "interior design",
  targetCareer: "Animator",
  withNav: false,
  triedRoutes: [],
  blocker: "unknown-routes",
};

describe("entry-level programmes branch", () => {
  it("always includes a programmes branch with clickable resource links", () => {
    const m = buildBridgeMindmap(base);
    const programmes = m.branches.find((b) => b.kind === "programmes");
    expect(programmes).toBeTruthy();
    expect(programmes!.leaves.some((l) => l.url?.startsWith("https://"))).toBe(true);
    // The LinkedIn pathways link the owner asked for is present.
    expect(programmes!.leaves.some((l) => l.url === "https://careers.linkedin.com/pathways-programs")).toBe(true);
  });

  it("never floats programmes above the blocker-led branch", () => {
    for (const blocker of ["no-callbacks", "no-experience"] as const) {
      const m = buildBridgeMindmap({ ...base, blocker, withNav: true });
      expect(m.branches[0].kind).not.toBe("programmes");
    }
  });
});
