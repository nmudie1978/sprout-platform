/**
 * The Entitlements Engine — pure resolution.
 *
 * One function decides what every user on the platform can do, whether they
 * are a direct consumer, a parent, a student on a school licence, or an
 * advisor at NAV. There is no second code path.
 *
 * ── The rules, in order ──────────────────────────────────────────────────
 *
 *  1. BASELINE. Every signed-in user starts with PLATFORM_BASELINE_MODULES.
 *     Institutional access is additive; it can never subtract. A school
 *     whose licence omits CLARITY does not remove CLARITY from a student
 *     who already had it as an ordinary Endeavrly user.
 *
 *  2. PERSONAL SUBSCRIPTION. If active and unexpired, adds its tier modules
 *     plus any bespoke overrides.
 *
 *  3. ORGANISATION MEMBERSHIPS. Each membership is examined independently.
 *     It contributes nothing unless ALL of these hold:
 *       - the membership is ACTIVE and not past `expiresAt`
 *       - the organisation is ONBOARDING or ACTIVE
 *       - it has a licence that is TRIAL or ACTIVE, started, and unexpired
 *     What it then contributes is:
 *       (licence.enabledModules ∪ accessCodeGrant.moduleOverrides)
 *         ∩ ROLE_PERMITTED_MODULES[membership.role]
 *
 *     The role intersection is the load-bearing part. It is why a school
 *     buying ADVANCED_ANALYTICS does not hand cohort analytics to its
 *     fifteen-year-olds, and why an access code cannot be used to smuggle a
 *     staff module to a participant.
 *
 *  4. UNION. The result is the union across all sources, with provenance
 *     recorded per module so support can always answer "why?".
 *
 * ── What this function deliberately does NOT do ──────────────────────────
 *
 *  - Seat limits. Being over `userLimit` does not strip access from users
 *    who already have it; that would punish young people for a commercial
 *    dispute between adults. The limit is enforced at JOIN time instead
 *    (see `lib/organisations/seats.ts`).
 *  - Age. Age is a personalisation signal in this product, never a gate.
 *  - Data visibility. What an advisor may SEE about a participant is a
 *    separate question answered by `lib/organisations/visibility.ts`.
 *    Entitlements answer "which capabilities exist for this user".
 */

import {
  EntitlementModule,
  LicenceStatus,
  OrgMembershipStatus,
  OrganisationStatus,
  SubscriptionStatus,
} from "@prisma/client";

import {
  ALL_MODULES,
  PLATFORM_BASELINE_MODULES,
  ROLE_PERMITTED_MODULES,
  TIER_MODULES,
} from "./modules";
import { EntitlementSourceType } from "./types";
import type {
  ActiveOrganisationContext,
  EffectiveEntitlements,
  EntitlementInput,
  EntitlementRejectionReason,
  EntitlementSource,
  InactiveOrganisationContext,
  LicenceSnapshot,
  MembershipSnapshot,
  SubscriptionSnapshot,
} from "./types";

/** Organisation states in which members may draw entitlements at all. */
const USABLE_ORGANISATION_STATUSES: ReadonlySet<OrganisationStatus> = new Set([
  OrganisationStatus.ONBOARDING,
  OrganisationStatus.ACTIVE,
]);

/** Licence states that actually confer access. TRIAL counts — that's the point. */
const USABLE_LICENCE_STATUSES: ReadonlySet<LicenceStatus> = new Set([
  LicenceStatus.TRIAL,
  LicenceStatus.ACTIVE,
]);

const USABLE_SUBSCRIPTION_STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
]);

/** Stable ordering so snapshots and diffs are readable. */
const MODULE_ORDER = new Map(ALL_MODULES.map((m, i) => [m, i]));

function sortModules(modules: Iterable<EntitlementModule>): EntitlementModule[] {
  return [...new Set(modules)].sort(
    (a, b) => (MODULE_ORDER.get(a) ?? 999) - (MODULE_ORDER.get(b) ?? 999)
  );
}

/**
 * Is a personal subscription currently conferring anything?
 * Exported because the admin portal shows this verdict directly.
 */
export function isSubscriptionUsable(
  subscription: SubscriptionSnapshot | null,
  now: Date
): boolean {
  if (!subscription) return false;
  if (!USABLE_SUBSCRIPTION_STATUSES.has(subscription.status)) return false;
  if (subscription.expiresAt && subscription.expiresAt.getTime() <= now.getTime()) return false;
  return true;
}

/**
 * Why (if at all) a licence is unusable right now. Null means it IS usable.
 * Exported so the licence list in the admin portal shows the same verdict the
 * engine uses, rather than a second, drifting opinion.
 */
export function licenceRejection(
  licence: LicenceSnapshot | null,
  now: Date
): EntitlementRejectionReason | null {
  if (!licence) return "NO_USABLE_LICENCE";
  if (!USABLE_LICENCE_STATUSES.has(licence.status)) return "LICENCE_NOT_ACTIVE";
  if (licence.startDate.getTime() > now.getTime()) return "LICENCE_NOT_STARTED";
  if (licence.endDate && licence.endDate.getTime() <= now.getTime()) return "LICENCE_EXPIRED";
  return null;
}

/** Why (if at all) a membership contributes nothing. Null means it contributes. */
export function membershipRejection(
  membership: MembershipSnapshot,
  now: Date
): EntitlementRejectionReason | null {
  if (membership.status !== OrgMembershipStatus.ACTIVE) return "MEMBERSHIP_NOT_ACTIVE";
  if (membership.expiresAt && membership.expiresAt.getTime() <= now.getTime()) {
    return "MEMBERSHIP_EXPIRED";
  }
  if (!USABLE_ORGANISATION_STATUSES.has(membership.organisationStatus)) {
    return "ORGANISATION_NOT_ACTIVE";
  }
  return licenceRejection(membership.licence, now);
}

/**
 * Resolve the complete, effective entitlement set for one user.
 *
 * Pure: same input + same `now` always yields the same output. `now` is a
 * parameter rather than a `new Date()` call so expiry behaviour is testable
 * and so a batch job can resolve many users against one consistent instant.
 */
export function resolveEntitlements(
  input: EntitlementInput,
  now: Date = new Date()
): EffectiveEntitlements {
  const sources: Partial<Record<EntitlementModule, EntitlementSource[]>> = {};
  const granted = new Set<EntitlementModule>();

  const grant = (modules: Iterable<EntitlementModule>, source: EntitlementSource): void => {
    for (const entry of modules) {
      granted.add(entry);
      const existing = sources[entry];
      if (existing) {
        existing.push(source);
      } else {
        sources[entry] = [source];
      }
    }
  };

  // ── 1. Platform baseline ────────────────────────────────────────────────
  grant(PLATFORM_BASELINE_MODULES, {
    type: EntitlementSourceType.PLATFORM_BASELINE,
    sourceId: "platform",
    label: "Endeavrly baseline",
  });

  // ── 2. Personal subscription ────────────────────────────────────────────
  const { subscription } = input;
  const subscriptionUsable = isSubscriptionUsable(subscription, now);
  if (subscription && subscriptionUsable) {
    grant([...TIER_MODULES[subscription.tier], ...subscription.moduleOverrides], {
      type: EntitlementSourceType.PERSONAL_SUBSCRIPTION,
      sourceId: subscription.tier,
      label: `Personal subscription — ${subscription.tier}`,
    });
  }

  // ── 3. Organisation memberships ─────────────────────────────────────────
  const organisations: ActiveOrganisationContext[] = [];
  const inactiveOrganisations: InactiveOrganisationContext[] = [];

  for (const membership of input.memberships) {
    const rejection = membershipRejection(membership, now);
    if (rejection) {
      inactiveOrganisations.push({
        membershipId: membership.membershipId,
        organisationId: membership.organisationId,
        organisationName: membership.organisationName,
        role: membership.role,
        reason: rejection,
      });
      continue;
    }

    // `membershipRejection` returning null guarantees a usable licence.
    const licence = membership.licence as LicenceSnapshot;
    const permitted = new Set(ROLE_PERMITTED_MODULES[membership.role]);

    const licenceModules = licence.enabledModules.filter((m) => permitted.has(m));
    grant(licenceModules, {
      type: EntitlementSourceType.ORGANISATION_LICENCE,
      sourceId: licence.id,
      label: `${membership.organisationName} — ${licence.planName ?? "custom licence"}`,
      organisationId: membership.organisationId,
    });

    // Access-code overrides ride on top, still role-filtered. A code for an
    // event cohort can add a capability the base licence lacks; it can never
    // hand a participant a staff module.
    let codeModules: EntitlementModule[] = [];
    if (membership.accessCodeGrant && membership.accessCodeGrant.moduleOverrides.length > 0) {
      codeModules = membership.accessCodeGrant.moduleOverrides.filter((m) => permitted.has(m));
      if (codeModules.length > 0) {
        grant(codeModules, {
          type: EntitlementSourceType.ACCESS_CODE_GRANT,
          sourceId: membership.accessCodeGrant.id,
          label: `Access code ${membership.accessCodeGrant.code}`,
          organisationId: membership.organisationId,
        });
      }
    }

    organisations.push({
      membershipId: membership.membershipId,
      organisationId: membership.organisationId,
      organisationName: membership.organisationName,
      organisationSlug: membership.organisationSlug,
      role: membership.role,
      expiresAt: membership.expiresAt,
      licenceId: licence.id,
      licenceStatus: licence.status,
      planName: licence.planName,
      grantedModules: sortModules([...licenceModules, ...codeModules]),
    });
  }

  return {
    userId: input.userId,
    modules: sortModules(granted),
    sources,
    organisations,
    inactiveOrganisations,
    subscriptionTier: subscription && subscriptionUsable ? subscription.tier : null,
    resolvedAt: now,
  };
}

/** Convenience predicate over an already-resolved set. */
export function hasModule(
  entitlements: EffectiveEntitlements,
  module: EntitlementModule
): boolean {
  return entitlements.modules.includes(module);
}
