/**
 * Access codes — pure generation and validation.
 *
 * The redemption FLOW (create membership, assign cohort, recalculate
 * entitlements) lives in the service layer; everything decidable without a
 * database lives here so the validation ladder can be tested exhaustively.
 *
 * Validation ladder, in the order the spec specifies:
 *   status → expiry → usage limit → already-redeemed → domain rules
 */

import { AccessCodeStatus, EntitlementModule, OrgRole } from "@prisma/client";

/** Confusable characters excluded, matching the existing school-mode codes. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export interface AccessCodeSnapshot {
  id: string;
  code: string;
  status: AccessCodeStatus;
  organisationId: string;
  organisationStatus: string;
  cohortId: string | null;
  assignedRole: OrgRole;
  maxUses: number | null;
  currentUses: number;
  singleUse: boolean;
  expiresAt: Date | null;
  allowedEmailDomains: string[];
  moduleOverrides: EntitlementModule[];
  membershipDurationDays: number | null;
}

export type AccessCodeRejection =
  | "CODE_NOT_FOUND"
  | "CODE_INACTIVE"
  | "CODE_EXPIRED"
  | "CODE_EXHAUSTED"
  | "CODE_ALREADY_REDEEMED"
  | "EMAIL_DOMAIN_NOT_ALLOWED"
  | "ORGANISATION_NOT_ACTIVE";

export type AccessCodeValidation =
  | { valid: true; code: AccessCodeSnapshot }
  | { valid: false; reason: AccessCodeRejection };

/** Human-facing copy. Calm, non-accusatory — a young person may see these. */
export const ACCESS_CODE_MESSAGES: Record<AccessCodeRejection, string> = {
  CODE_NOT_FOUND: "We couldn't find that code. Check it and try again.",
  CODE_INACTIVE: "That code isn't active at the moment.",
  CODE_EXPIRED: "That code has expired. Ask whoever shared it for a current one.",
  CODE_EXHAUSTED: "That code has already been used the maximum number of times.",
  CODE_ALREADY_REDEEMED: "You've already joined using that code.",
  EMAIL_DOMAIN_NOT_ALLOWED:
    "That code is for a different email address. Try the one your organisation has on file.",
  ORGANISATION_NOT_ACTIVE: "That organisation isn't active on Endeavrly right now.",
};

/** Normalise user input: trim, uppercase, collapse internal whitespace. */
export function normaliseAccessCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** The domain part of an email, lowercased and without the "@". */
export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).trim().toLowerCase();
}

/**
 * Generate a readable code. `prefix` lets an admin produce
 * "NAV-YOUTH-2027"-style codes; the random suffix keeps them unguessable
 * enough that a code can't be brute-forced into a school's cohort.
 *
 * `randomInt` is injected so generation is deterministic under test.
 */
export function generateAccessCode(
  prefix: string | null,
  length = 8,
  randomInt: (max: number) => number = (max) => Math.floor(Math.random() * max)
): string {
  let suffix = "";
  for (let i = 0; i < length; i += 1) {
    suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  const cleanPrefix = prefix
    ? normaliseAccessCode(prefix).replace(/[^A-Z0-9-]/g, "").replace(/-+$/, "")
    : "";
  return cleanPrefix ? `${cleanPrefix}-${suffix}` : suffix;
}

/**
 * Run the full validation ladder.
 *
 * `now` is a parameter, not `new Date()`, so expiry is testable.
 * Returning the first failure (rather than a list) is intentional: telling
 * someone exactly which of five rules they tripped is useful; telling them
 * all five leaks the code's configuration.
 */
export function validateAccessCode(
  code: AccessCodeSnapshot | null,
  context: { email: string; alreadyRedeemed: boolean },
  now: Date = new Date()
): AccessCodeValidation {
  if (!code) return { valid: false, reason: "CODE_NOT_FOUND" };

  if (code.organisationStatus !== "ACTIVE" && code.organisationStatus !== "ONBOARDING") {
    return { valid: false, reason: "ORGANISATION_NOT_ACTIVE" };
  }

  if (code.status !== AccessCodeStatus.ACTIVE) {
    return {
      valid: false,
      reason: code.status === AccessCodeStatus.EXPIRED ? "CODE_EXPIRED" : "CODE_INACTIVE",
    };
  }

  if (code.expiresAt && code.expiresAt.getTime() <= now.getTime()) {
    return { valid: false, reason: "CODE_EXPIRED" };
  }

  const effectiveMax = code.singleUse ? 1 : code.maxUses;
  if (effectiveMax !== null && code.currentUses >= effectiveMax) {
    return { valid: false, reason: "CODE_EXHAUSTED" };
  }

  if (context.alreadyRedeemed) {
    return { valid: false, reason: "CODE_ALREADY_REDEEMED" };
  }

  if (code.allowedEmailDomains.length > 0) {
    const domain = emailDomain(context.email);
    const allowed = code.allowedEmailDomains.some((d) => d.trim().toLowerCase() === domain);
    if (!allowed) return { valid: false, reason: "EMAIL_DOMAIN_NOT_ALLOWED" };
  }

  return { valid: true, code };
}

/**
 * The status a code should now hold, given its usage and expiry. Applied on
 * redemption and by the nightly job, so an exhausted code stops advertising
 * itself as ACTIVE in the admin list.
 */
export function derivedCodeStatus(
  code: Pick<AccessCodeSnapshot, "status" | "maxUses" | "currentUses" | "singleUse" | "expiresAt">,
  now: Date = new Date()
): AccessCodeStatus {
  if (code.status === AccessCodeStatus.INACTIVE) return AccessCodeStatus.INACTIVE;
  if (code.expiresAt && code.expiresAt.getTime() <= now.getTime()) return AccessCodeStatus.EXPIRED;
  const effectiveMax = code.singleUse ? 1 : code.maxUses;
  if (effectiveMax !== null && code.currentUses >= effectiveMax) return AccessCodeStatus.EXHAUSTED;
  return AccessCodeStatus.ACTIVE;
}

/** When a membership created by this code should lapse. Null = no expiry. */
export function membershipExpiryFor(
  code: Pick<AccessCodeSnapshot, "membershipDurationDays">,
  orgDefaultDays: number | null,
  now: Date = new Date()
): Date | null {
  const days = code.membershipDurationDays ?? orgDefaultDays;
  if (!days || days <= 0) return null;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}
