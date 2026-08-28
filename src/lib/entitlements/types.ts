/**
 * Input and output shapes for entitlement resolution.
 *
 * The input types are deliberately plain data, NOT Prisma model types. That
 * keeps `resolve.ts` a pure function with no database dependency, so the
 * whole access-control rulebook is unit-testable without a DB — which is the
 * only realistic way to keep a rulebook this consequential honest.
 */

import type {
  EntitlementModule,
  LicenceStatus,
  OrgMembershipStatus,
  OrganisationStatus,
  OrgRole,
  SubscriptionStatus,
  SubscriptionTier,
} from "@prisma/client";

/**
 * Provenance of a granted module. Computed during resolution and never
 * persisted, which is why this is a TypeScript union rather than a database
 * enum — storing it would mean two sources of truth that could drift.
 */
export const EntitlementSourceType = {
  PLATFORM_BASELINE: "PLATFORM_BASELINE",
  PERSONAL_SUBSCRIPTION: "PERSONAL_SUBSCRIPTION",
  ORGANISATION_LICENCE: "ORGANISATION_LICENCE",
  ACCESS_CODE_GRANT: "ACCESS_CODE_GRANT",
  MANUAL_GRANT: "MANUAL_GRANT",
} as const;

export type EntitlementSourceType =
  (typeof EntitlementSourceType)[keyof typeof EntitlementSourceType];

export interface LicenceSnapshot {
  id: string;
  status: LicenceStatus;
  startDate: Date;
  endDate: Date | null;
  enabledModules: EntitlementModule[];
  userLimit: number | null;
  activeUserCount: number;
  planKey: string | null;
  planName: string | null;
}

export interface AccessCodeGrantSnapshot {
  id: string;
  code: string;
  moduleOverrides: EntitlementModule[];
}

export interface MembershipSnapshot {
  membershipId: string;
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  organisationStatus: OrganisationStatus;
  role: OrgRole;
  status: OrgMembershipStatus;
  expiresAt: Date | null;
  /** The licence the membership draws from — the newest usable one. */
  licence: LicenceSnapshot | null;
  /** Set when the membership was created by redeeming a code with overrides. */
  accessCodeGrant: AccessCodeGrantSnapshot | null;
}

export interface SubscriptionSnapshot {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: Date | null;
  moduleOverrides: EntitlementModule[];
}

export interface EntitlementInput {
  userId: string;
  subscription: SubscriptionSnapshot | null;
  memberships: MembershipSnapshot[];
}

/** Why a user has a module. One module can have several. */
export interface EntitlementSource {
  type: EntitlementSourceType;
  /** Organisation id, licence id or subscription tier — whatever identifies it. */
  sourceId: string;
  /** Human-readable, safe to show in the admin portal. */
  label: string;
  organisationId?: string;
}

/** A membership that resolution accepted, with the context it contributes. */
export interface ActiveOrganisationContext {
  membershipId: string;
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  role: OrgRole;
  expiresAt: Date | null;
  licenceId: string | null;
  licenceStatus: LicenceStatus | null;
  planName: string | null;
  /** Modules this membership alone contributed, after role filtering. */
  grantedModules: EntitlementModule[];
}

/** A membership resolution rejected, and why — surfaced to support/admin UI. */
export interface InactiveOrganisationContext {
  membershipId: string;
  organisationId: string;
  organisationName: string;
  role: OrgRole;
  reason: EntitlementRejectionReason;
}

export type EntitlementRejectionReason =
  | "MEMBERSHIP_NOT_ACTIVE"
  | "MEMBERSHIP_EXPIRED"
  | "ORGANISATION_NOT_ACTIVE"
  | "NO_USABLE_LICENCE"
  | "LICENCE_NOT_STARTED"
  | "LICENCE_EXPIRED"
  | "LICENCE_NOT_ACTIVE";

export interface EffectiveEntitlements {
  userId: string;
  /** Sorted, de-duplicated. The answer to "what can this user do?". */
  modules: EntitlementModule[];
  /** module → every source that granted it. Never empty for a granted module. */
  sources: Partial<Record<EntitlementModule, EntitlementSource[]>>;
  organisations: ActiveOrganisationContext[];
  inactiveOrganisations: InactiveOrganisationContext[];
  subscriptionTier: SubscriptionTier | null;
  /** Timestamp resolution was computed at, so callers can reason about staleness. */
  resolvedAt: Date;
}
