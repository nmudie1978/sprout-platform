import { SubscriptionTier } from "@prisma/client";

/**
 * Quantitative entitlements — the "how many", alongside the existing
 * "which modules".
 *
 * The module system answers a boolean: may this user reach Career Twin at
 * all? Free and Pro both can, so a module cannot express the difference
 * between five questions and unlimited. That is what this adds, and it is the
 * only structural change the Free/Pro model needs to the rulebook.
 *
 * `null` means unlimited. Not `Infinity`, and not a large sentinel like
 * 999999: those both survive arithmetic and comparison silently, so a bug
 * that loses the "unlimited" meaning shows up as a very high limit rather
 * than as an error. `null` forces every caller to handle the case.
 */
export interface EntitlementLimits {
  /** Careers a user may take through My Journey. */
  careerExplorations: number | null;
  /** Successfully submitted Career Twin questions. */
  careerTwinQuestions: number | null;
  /** Careers a user may keep saved. */
  savedCareers: number | null;
}

/**
 * The free allowances.
 *
 * These are LIFETIME, not monthly (brief §19). A monthly reset would turn the
 * limit into a rhythm to wait out rather than a decision to make, and would
 * mean a young person's exploration history quietly stopped mattering.
 */
export const FREE_LIMITS: EntitlementLimits = {
  careerExplorations: 10,
  careerTwinQuestions: 5,
  // No saved-career limit existed before this change; 20 is a starting point
  // chosen to sit clear of the 10 explorations so the two limits are not hit
  // at the same moment. Tune it here, never at a call site.
  savedCareers: 20,
};

/** Pro removes every limit. That is the whole proposition. */
export const UNLIMITED: EntitlementLimits = {
  careerExplorations: null,
  careerTwinQuestions: null,
  savedCareers: null,
};

const BY_TIER: Record<SubscriptionTier, EntitlementLimits> = {
  [SubscriptionTier.FREE]: FREE_LIMITS,
  [SubscriptionTier.PRO]: UNLIMITED,
  // Legacy consumer tiers, kept so the enum stays exhaustive while they are
  // deprecated. They behave as Pro: someone who paid under an older name must
  // not be downgraded by a rename.
  [SubscriptionTier.PREMIUM]: UNLIMITED,
  [SubscriptionTier.FAMILY]: UNLIMITED,
  [SubscriptionTier.FAMILY_PLUS]: UNLIMITED,
};

/**
 * Take the most generous of two limit sets, field by field.
 *
 * A user can hold entitlements from more than one source — a personal
 * subscription and a school licence. Access should never be reduced by
 * gaining a second source, so unlimited always wins and otherwise the larger
 * number does.
 */
export function mergeLimits(a: EntitlementLimits, b: EntitlementLimits): EntitlementLimits {
  const best = (x: number | null, y: number | null): number | null =>
    x === null || y === null ? null : Math.max(x, y);
  return {
    careerExplorations: best(a.careerExplorations, b.careerExplorations),
    careerTwinQuestions: best(a.careerTwinQuestions, b.careerTwinQuestions),
    savedCareers: best(a.savedCareers, b.savedCareers),
  };
}

/** The limits a tier grants. */
export function limitsForTier(tier: SubscriptionTier): EntitlementLimits {
  return BY_TIER[tier] ?? FREE_LIMITS;
}

/**
 * Whether one more of something is allowed.
 *
 * `used` is the count already consumed. Unlimited always allows; otherwise
 * the next unit must fit strictly inside the allowance, so a limit of 10 with
 * 10 used refuses.
 */
export function allowsAnother(used: number, limit: number | null): boolean {
  return limit === null || used < limit;
}

/** How many remain, or null when unlimited. Never negative. */
export function remaining(used: number, limit: number | null): number | null {
  return limit === null ? null : Math.max(0, limit - used);
}
