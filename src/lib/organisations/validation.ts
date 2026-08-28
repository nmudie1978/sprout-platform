/**
 * Zod schemas for every institutional write path.
 *
 * Kept in one file so the shape of an organisation, a licence and a cohort
 * is defined once and reused by both portals. Route handlers never trust a
 * body they haven't parsed through one of these.
 */

import { z } from "zod";
import {
  AccessCodeStatus,
  DomainEnrolmentPolicy,
  EntitlementModule,
  LicenceStatus,
  OrgCohortStatus,
  OrgCohortType,
  OrgMembershipStatus,
  OrgRole,
  OrganisationStatus,
  OrganisationType,
  SubscriptionStatus,
  SubscriptionTier,
} from "@prisma/client";

const enumOf = <T extends Record<string, string>>(e: T) =>
  z.enum(Object.values(e) as [string, ...string[]]);

export const moduleArraySchema = z.array(enumOf(EntitlementModule)).max(64);

/** Slug rules match the DB column: lowercase, hyphenated, no leading digits-only. */
export const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.");

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ── Organisation ───────────────────────────────────────────────────────────

export const createOrganisationSchema = z.object({
  name: z.string().min(2).max(160),
  slug: slugSchema.optional(),
  type: enumOf(OrganisationType),
  country: z.string().length(2).toUpperCase().optional().nullable(),
  status: enumOf(OrganisationStatus).optional(),
  logoUrl: z.string().url().max(2048).optional().nullable(),
  primaryContactName: z.string().max(120).optional().nullable(),
  primaryContactEmail: z.string().email().max(254).optional().nullable(),
  billingEmail: z.string().email().max(254).optional().nullable(),
  billingAddress: z.string().max(2000).optional().nullable(),
  internalNotes: z.string().max(5000).optional().nullable(),
});

export const updateOrganisationSchema = createOrganisationSchema.partial();

export const organisationSettingsSchema = z.object({
  allowIndividualParticipantView: z.boolean().optional(),
  advisorCanViewAssignedDetail: z.boolean().optional(),
  educatorCanViewCohortDetail: z.boolean().optional(),
  managerCanViewIndividualDetail: z.boolean().optional(),
  // Never allow an organisation to set the k-anonymity floor below 3 — that
  // is the point below which an "aggregate" stops being one.
  minimumAggregateGroupSize: z.number().int().min(3).max(100).optional(),
  requireParticipantDataSharingConsent: z.boolean().optional(),
  defaultMembershipDurationDays: z.number().int().min(1).max(3650).optional().nullable(),
  participantPrivacyNotice: z.string().max(4000).optional().nullable(),
});

// ── Licence plans and licences ─────────────────────────────────────────────

export const licencePlanSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[A-Z0-9_]+$/, "Use uppercase letters, numbers and underscores."),
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional().nullable(),
  defaultModules: moduleArraySchema.default([]),
  defaultUserLimit: z.number().int().min(1).max(10_000_000).optional().nullable(),
  defaultTermMonths: z.number().int().min(1).max(120).optional().nullable(),
  listPriceMinor: z.number().int().min(0).optional().nullable(),
  currency: z.string().length(3).toUpperCase().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const updateLicencePlanSchema = licencePlanSchema.partial().omit({ key: true });

export const createLicenceSchema = z
  .object({
    licencePlanId: z.string().min(1).optional().nullable(),
    status: enumOf(LicenceStatus).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    userLimit: z.number().int().min(1).max(10_000_000).optional().nullable(),
    enabledModules: moduleArraySchema.optional(),
    contractReference: z.string().max(120).optional().nullable(),
    contractValueMinor: z.number().int().min(0).optional().nullable(),
    annualValueMinor: z.number().int().min(0).optional().nullable(),
    currency: z.string().length(3).toUpperCase().optional().nullable(),
    renewalDate: z.coerce.date().optional().nullable(),
    autoRenew: z.boolean().optional(),
    trialEndsAt: z.coerce.date().optional().nullable(),
    commercialNotes: z.string().max(5000).optional().nullable(),
  })
  .refine((v) => !v.endDate || v.endDate > v.startDate, {
    message: "The end date must be after the start date.",
    path: ["endDate"],
  });

export const updateLicenceSchema = z.object({
  licencePlanId: z.string().min(1).optional().nullable(),
  status: enumOf(LicenceStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  userLimit: z.number().int().min(1).max(10_000_000).optional().nullable(),
  enabledModules: moduleArraySchema.optional(),
  contractReference: z.string().max(120).optional().nullable(),
  contractValueMinor: z.number().int().min(0).optional().nullable(),
  annualValueMinor: z.number().int().min(0).optional().nullable(),
  currency: z.string().length(3).toUpperCase().optional().nullable(),
  renewalDate: z.coerce.date().optional().nullable(),
  autoRenew: z.boolean().optional(),
  trialEndsAt: z.coerce.date().optional().nullable(),
  commercialNotes: z.string().max(5000).optional().nullable(),
});

// ── Cohorts ────────────────────────────────────────────────────────────────

export const createCohortSchema = z.object({
  name: z.string().min(1).max(140),
  description: z.string().max(2000).optional().nullable(),
  type: enumOf(OrgCohortType).optional(),
  status: enumOf(OrgCohortStatus).optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const updateCohortSchema = createCohortSchema.partial();

export const assignCohortMembersSchema = z.object({
  membershipIds: z.array(z.string().min(1)).min(1).max(1000),
  action: z.enum(["add", "remove"]),
});

// ── Access codes ───────────────────────────────────────────────────────────

export const createAccessCodeSchema = z
  .object({
    /** Optional human prefix; the random suffix is always appended. */
    prefix: z.string().max(40).optional().nullable(),
    label: z.string().max(160).optional().nullable(),
    cohortId: z.string().min(1).optional().nullable(),
    assignedRole: enumOf(OrgRole).optional(),
    maxUses: z.number().int().min(1).max(1_000_000).optional().nullable(),
    singleUse: z.boolean().optional(),
    expiresAt: z.coerce.date().optional().nullable(),
    allowedEmailDomains: z.array(z.string().max(253)).max(20).optional(),
    moduleOverrides: moduleArraySchema.optional(),
    membershipDurationDays: z.number().int().min(1).max(3650).optional().nullable(),
  })
  .refine((v) => !(v.singleUse && v.maxUses && v.maxUses > 1), {
    message: "A single-use code cannot also have a maximum use count above 1.",
    path: ["maxUses"],
  });

export const updateAccessCodeSchema = z.object({
  label: z.string().max(160).optional().nullable(),
  status: enumOf(AccessCodeStatus).optional(),
  cohortId: z.string().min(1).optional().nullable(),
  maxUses: z.number().int().min(1).max(1_000_000).optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  allowedEmailDomains: z.array(z.string().max(253)).max(20).optional(),
  moduleOverrides: moduleArraySchema.optional(),
});

export const redeemAccessCodeSchema = z.object({
  code: z.string().min(3).max(64),
});

// ── Invitations ────────────────────────────────────────────────────────────

export const createInvitationsSchema = z.object({
  /** Accepts a pasted list; parsed with parseBulkEmails before use. */
  emails: z.string().min(3).max(200_000),
  role: enumOf(OrgRole).optional(),
  cohortId: z.string().min(1).optional().nullable(),
  expiresInDays: z.number().int().min(1).max(180).optional(),
  message: z.string().max(1000).optional().nullable(),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(10).max(512),
});

// ── Members ────────────────────────────────────────────────────────────────

export const updateMembershipSchema = z.object({
  role: enumOf(OrgRole).optional(),
  status: enumOf(OrgMembershipStatus).optional(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const advisorAssignmentSchema = z.object({
  advisorMembershipId: z.string().min(1),
  participantMembershipIds: z.array(z.string().min(1)).min(1).max(500),
  action: z.enum(["assign", "unassign"]),
});

// ── Domains ────────────────────────────────────────────────────────────────

export const createDomainSchema = z.object({
  domain: z.string().min(3).max(253),
  enrolmentPolicy: enumOf(DomainEnrolmentPolicy).optional(),
  defaultRole: enumOf(OrgRole).optional(),
  defaultCohortId: z.string().min(1).optional().nullable(),
});

// ── Personal subscriptions (no payment involved) ───────────────────────────

export const setSubscriptionSchema = z.object({
  userId: z.string().min(1),
  tier: enumOf(SubscriptionTier),
  status: enumOf(SubscriptionStatus).optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  moduleOverrides: moduleArraySchema.optional(),
  note: z.string().max(1000).optional().nullable(),
});

// ── Participant-facing ─────────────────────────────────────────────────────

export const dataSharingConsentSchema = z.object({
  organisationId: z.string().min(1),
  consent: z.boolean(),
});
