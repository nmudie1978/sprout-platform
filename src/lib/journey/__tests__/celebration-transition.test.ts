import { describe, it, expect } from "vitest";
import { nextCelebrationState, type CelebrationBaseline } from "../celebration";

/**
 * The journey-complete celebration must fire ONCE each time a career
 * crosses incomplete → complete, but never on merely re-opening an
 * already-complete journey. nextCelebrationState is the pure core.
 */
describe("nextCelebrationState", () => {
  it("first observation of an INCOMPLETE journey: no celebration, baseline recorded", () => {
    const r = nextCelebrationState(null, "doctor", false);
    expect(r.celebrate).toBe(false);
    expect(r.baseline).toEqual({ careerId: "doctor", complete: false });
  });

  it("first observation of an ALREADY-COMPLETE journey: NO celebration (not random on revisit)", () => {
    const r = nextCelebrationState(null, "doctor", true);
    expect(r.celebrate).toBe(false);
    expect(r.baseline).toEqual({ careerId: "doctor", complete: true });
  });

  it("incomplete → complete for the same career: celebrates once", () => {
    const base: CelebrationBaseline = { careerId: "doctor", complete: false };
    const r = nextCelebrationState(base, "doctor", true);
    expect(r.celebrate).toBe(true);
    expect(r.baseline.complete).toBe(true);
  });

  it("complete → complete (stable, e.g. re-render): does NOT re-celebrate", () => {
    const base: CelebrationBaseline = { careerId: "doctor", complete: true };
    const r = nextCelebrationState(base, "doctor", true);
    expect(r.celebrate).toBe(false);
  });

  it("switching to another already-complete career: NO celebration", () => {
    const base: CelebrationBaseline = { careerId: "doctor", complete: true };
    const r = nextCelebrationState(base, "nurse", true);
    expect(r.celebrate).toBe(false);
    expect(r.baseline).toEqual({ careerId: "nurse", complete: true });
  });

  it("switching to an incomplete career then completing it: celebrates", () => {
    let s = nextCelebrationState({ careerId: "doctor", complete: true }, "nurse", false);
    expect(s.celebrate).toBe(false);
    s = nextCelebrationState(s.baseline, "nurse", true);
    expect(s.celebrate).toBe(true);
  });

  it("re-completion (complete → incomplete → complete) celebrates again — each time", () => {
    let s = nextCelebrationState({ careerId: "doctor", complete: true }, "doctor", false);
    expect(s.celebrate).toBe(false);
    s = nextCelebrationState(s.baseline, "doctor", true);
    expect(s.celebrate).toBe(true);
  });
});
