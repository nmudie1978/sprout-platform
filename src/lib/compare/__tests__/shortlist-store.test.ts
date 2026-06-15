import { describe, it, expect, beforeEach } from "vitest";
import {
  shouldPromptForCompare,
  compareShortlistStore,
  COMPARE_MAX,
} from "../shortlist-store";
import type { Career } from "@/lib/career-pathways";

// Minimal Career stand-ins — the store only cares about identity + round-trip.
function career(id: string): Career {
  return { id, title: id, emoji: "🧭" } as unknown as Career;
}

describe("shouldPromptForCompare", () => {
  it("is true only when crossing UP to the max", () => {
    expect(shouldPromptForCompare(2, 3, 3)).toBe(true);
  });
  it("is false when already at/above max (no up-crossing)", () => {
    expect(shouldPromptForCompare(3, 3, 3)).toBe(false);
  });
  it("is false below max", () => {
    expect(shouldPromptForCompare(1, 2, 3)).toBe(false);
  });
  it("is false when removing down to max from above (can't happen, but guard)", () => {
    expect(shouldPromptForCompare(4, 3, 3)).toBe(false);
  });
  it("is false on a bulk jump to max (localStorage hydration / loadSet on page load)", () => {
    // The persisted shortlist loading 0 → 3 on refresh must NOT be read as
    // "the user just added the third" — this caused the prompt to pop up randomly.
    expect(shouldPromptForCompare(0, 3, 3)).toBe(false);
    expect(shouldPromptForCompare(1, 3, 3)).toBe(false);
  });
});

describe("compareShortlistStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
    compareShortlistStore.setUser("u1");
    compareShortlistStore.clear();
  });

  it("adds careers and reports the outcome", () => {
    expect(compareShortlistStore.add(career("a"))).toBe("added");
    expect(compareShortlistStore.getSnapshot().map((c) => c.id)).toEqual(["a"]);
  });

  it("rejects duplicates", () => {
    compareShortlistStore.add(career("a"));
    expect(compareShortlistStore.add(career("a"))).toBe("duplicate");
    expect(compareShortlistStore.getSnapshot()).toHaveLength(1);
  });

  it("rejects beyond the max", () => {
    expect(COMPARE_MAX).toBe(3);
    compareShortlistStore.add(career("a"));
    compareShortlistStore.add(career("b"));
    compareShortlistStore.add(career("c"));
    expect(compareShortlistStore.add(career("d"))).toBe("full");
    expect(compareShortlistStore.getSnapshot()).toHaveLength(3);
  });

  it("removes by id and toggles", () => {
    compareShortlistStore.add(career("a"));
    compareShortlistStore.remove("a");
    expect(compareShortlistStore.getSnapshot()).toHaveLength(0);
    compareShortlistStore.toggle(career("x"));
    expect(compareShortlistStore.getSnapshot().map((c) => c.id)).toEqual(["x"]);
    compareShortlistStore.toggle(career("x"));
    expect(compareShortlistStore.getSnapshot()).toHaveLength(0);
  });

  it("returns a STABLE snapshot reference until a mutation occurs", () => {
    const s1 = compareShortlistStore.getSnapshot();
    const s2 = compareShortlistStore.getSnapshot();
    expect(s1).toBe(s2);
    compareShortlistStore.add(career("a"));
    expect(compareShortlistStore.getSnapshot()).not.toBe(s1);
  });

  it("persists to localStorage and reloads per user", () => {
    compareShortlistStore.add(career("a"));
    compareShortlistStore.add(career("b"));
    // Switch to a different user → empty; switch back → restored from storage.
    compareShortlistStore.setUser("u2");
    expect(compareShortlistStore.getSnapshot()).toHaveLength(0);
    compareShortlistStore.setUser("u1");
    expect(compareShortlistStore.getSnapshot().map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("notifies subscribers on change", () => {
    let calls = 0;
    const unsub = compareShortlistStore.subscribe(() => {
      calls++;
    });
    compareShortlistStore.add(career("a"));
    expect(calls).toBeGreaterThan(0);
    unsub();
  });
});
