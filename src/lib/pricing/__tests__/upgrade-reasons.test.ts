import { describe, it, expect } from "vitest";
import { UPGRADE_COPY, upgradeHref, type UpgradeReason } from "../upgrade-reasons";

const REASONS = Object.keys(UPGRADE_COPY) as UpgradeReason[];

describe("upgrade copy", () => {
  it("covers every reason with all three fields", () => {
    for (const r of REASONS) {
      const c = UPGRADE_COPY[r];
      expect(c.headline, r).toBeTruthy();
      expect(c.body, r).toBeTruthy();
      expect(c.cta, r).toBeTruthy();
    }
  });

  // brand-voice.md bans this register outright, and a young person who has
  // just been stopped mid-task is the last person who should be sold to.
  it("avoids the sales register the brand voice forbids", () => {
    const banned = [
      "unlock your potential",
      "dominate",
      "crush your goals",
      "unstoppable",
      "revolutionary",
      "leverage",
      "synergies",
      "act now",
      "don't miss out",
      "limited time",
    ];
    for (const r of REASONS) {
      const text = `${UPGRADE_COPY[r].headline} ${UPGRADE_COPY[r].body}`.toLowerCase();
      for (const phrase of banned) {
        expect(text, `${r} uses "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  it("states what happened without blaming the reader", () => {
    for (const r of REASONS) {
      const text = `${UPGRADE_COPY[r].headline} ${UPGRADE_COPY[r].body}`.toLowerCase();
      for (const phrase of ["you failed", "you ran out", "you should have", "upgrade now"]) {
        expect(text, `${r}`).not.toContain(phrase);
      }
    }
  });

  it("reassures that work already done is kept, where a limit is reached", () => {
    // Being cut off is the moment someone fears losing what they have built.
    expect(UPGRADE_COPY.career_limit.body.toLowerCase()).toContain("stay yours");
  });
});

describe("upgradeHref", () => {
  it("carries the reason so the pricing page can name what stopped them", () => {
    expect(upgradeHref("career_limit")).toBe("/pricing?reason=career_limit");
  });

  // The brief is explicit: a limit must not dump someone on the homepage.
  it("carries the origin so the user can get back to what they were doing", () => {
    const href = upgradeHref("career_twin_limit", "/my-journey");
    expect(href).toContain("reason=career_twin_limit");
    expect(href).toContain("from=%2Fmy-journey");
  });
});
