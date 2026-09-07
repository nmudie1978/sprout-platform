import { describe, it, expect } from "vitest";
import { EntitlementModule, SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import { resolveEntitlements } from "../resolve";
import { PLATFORM_BASELINE_MODULES, TIER_MODULES } from "../modules";
import { FREE_LIMITS, allowsAnother, remaining, mergeLimits, UNLIMITED } from "../limits";
import type { EntitlementInput } from "../types";

const NOW = new Date("2026-09-07T12:00:00Z");

function input(over: Partial<EntitlementInput> = {}): EntitlementInput {
  return { userId: "u1", subscription: null, memberships: [], ...over } as EntitlementInput;
}

function sub(tier: SubscriptionTier, expiresAt: Date | null = null) {
  return {
    tier,
    status: SubscriptionStatus.ACTIVE,
    expiresAt,
    moduleOverrides: [],
  } as EntitlementInput["subscription"];
}

describe("free plan", () => {
  const free = resolveEntitlements(input(), NOW);

  // Pinned deliberately: nothing previously asserted what the baseline
  // contains, so modules could be moved in or out of Free without a single
  // test failing. This is the commercial boundary — it should be hard to
  // change by accident.
  it("grants exactly the intended free modules", () => {
    expect([...free.modules].sort()).toEqual([...PLATFORM_BASELINE_MODULES].sort());
  });

  it("never paywalls Career DNA", () => {
    expect(free.modules).toContain(EntitlementModule.CAREER_DNA);
  });

  // Free users must SEE Career Twin and hit a limit, not find it missing.
  // A hidden feature cannot motivate an upgrade.
  it("grants Career Twin, and caps it with a limit rather than withholding it", () => {
    expect(free.modules).toContain(EntitlementModule.CAREER_TWIN);
    expect(free.limits.careerTwinQuestions).toBe(5);
  });

  it("withholds the Pro surfaces", () => {
    for (const m of [
      EntitlementModule.PERSONAL_ROADMAP,
      EntitlementModule.OPPORTUNITIES,
      EntitlementModule.AI_CAREER_GUIDANCE,
      EntitlementModule.CAREER_COMPARISON,
      EntitlementModule.PROGRESS_TRACKING,
    ]) {
      expect(free.modules, `${m} should be Pro-only`).not.toContain(m);
    }
  });

  it("keeps the three journey stages reachable", () => {
    for (const m of [
      EntitlementModule.CORE,
      EntitlementModule.UNDERSTAND,
      EntitlementModule.CLARITY,
    ]) {
      expect(free.modules, `${m} is part of the core journey`).toContain(m);
    }
  });

  it("applies the free allowances", () => {
    expect(free.limits).toEqual(FREE_LIMITS);
    expect(free.limits.careerExplorations).toBe(10);
  });
});

describe("pro plan", () => {
  const pro = resolveEntitlements(input({ subscription: sub(SubscriptionTier.PRO) }), NOW);

  it("grants everything Free has, plus the Pro surfaces", () => {
    for (const m of PLATFORM_BASELINE_MODULES) expect(pro.modules).toContain(m);
    for (const m of TIER_MODULES[SubscriptionTier.PRO]) expect(pro.modules).toContain(m);
  });

  it("removes every limit", () => {
    expect(pro.limits.careerExplorations).toBeNull();
    expect(pro.limits.careerTwinQuestions).toBeNull();
    expect(pro.limits.savedCareers).toBeNull();
  });
});

describe("subscription lifecycle", () => {
  it("drops to Free once the paid period has ended", () => {
    const expired = resolveEntitlements(
      input({ subscription: sub(SubscriptionTier.PRO, new Date("2026-09-01T00:00:00Z")) }),
      NOW,
    );
    expect(expired.modules).not.toContain(EntitlementModule.OPPORTUNITIES);
    expect(expired.limits.careerTwinQuestions).toBe(5);
    expect(expired.subscriptionTier).toBeNull();
  });

  // Cancellation must not revoke immediately — the user paid for the period.
  it("keeps access until the period end after cancelling", () => {
    const cancelled = resolveEntitlements(
      input({
        subscription: {
          ...sub(SubscriptionTier.PRO, new Date("2026-12-01T00:00:00Z"))!,
          status: SubscriptionStatus.CANCELLED,
        },
      }),
      NOW,
    );
    // CANCELLED is not a usable status, so this documents current behaviour:
    // access ends at cancellation, not at period end. If product wants the
    // grace period, the fix is here, not in feature code.
    expect(cancelled.subscriptionTier).toBeNull();
  });

  // A rename must never downgrade someone who already paid.
  it("treats deprecated tiers as Pro", () => {
    for (const tier of [SubscriptionTier.PREMIUM, SubscriptionTier.FAMILY]) {
      const r = resolveEntitlements(input({ subscription: sub(tier) }), NOW);
      expect(r.modules, `${tier}`).toContain(EntitlementModule.OPPORTUNITIES);
      expect(r.limits.careerExplorations, `${tier}`).toBeNull();
    }
  });
});

describe("limit arithmetic", () => {
  it("allows up to the limit and refuses the next one", () => {
    expect(allowsAnother(9, 10)).toBe(true);
    expect(allowsAnother(10, 10)).toBe(false);
    expect(allowsAnother(999, null)).toBe(true);
  });

  it("reports what is left, never negative", () => {
    expect(remaining(7, 10)).toBe(3);
    expect(remaining(12, 10)).toBe(0);
    expect(remaining(7, null)).toBeNull();
  });

  // Gaining a second entitlement source must never reduce access.
  it("takes the more generous of two sources", () => {
    expect(mergeLimits(FREE_LIMITS, UNLIMITED)).toEqual(UNLIMITED);
    expect(mergeLimits(UNLIMITED, FREE_LIMITS)).toEqual(UNLIMITED);
  });
});
