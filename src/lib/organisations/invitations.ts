/**
 * Organisation invitations — token handling and pure validation.
 *
 * Security posture: the raw token is generated once, emailed, and never
 * stored. Only its SHA-256 hash goes to the database, so a database leak
 * yields nothing replayable. This mirrors the existing PasswordResetToken
 * approach rather than inventing a second convention.
 */

import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { InvitationStatus, OrgRole } from "@prisma/client";

/** 32 bytes of entropy, url-safe. Long enough that guessing is not a threat. */
export function generateInvitationToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time comparison of two hex hashes. Lookup is by hash so this is
 * belt-and-braces, but invitation acceptance is an unauthenticated endpoint
 * and cheap constant-time habits there are worth keeping.
 */
export function invitationTokenMatches(token: string, storedHash: string): boolean {
  const computed = hashInvitationToken(token);
  if (computed.length !== storedHash.length) return false;
  return timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
}

export const DEFAULT_INVITATION_TTL_DAYS = 30;

export function invitationExpiry(
  days = DEFAULT_INVITATION_TTL_DAYS,
  now: Date = new Date()
): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

export interface InvitationSnapshot {
  id: string;
  organisationId: string;
  organisationName: string;
  organisationStatus: string;
  email: string;
  role: OrgRole;
  cohortId: string | null;
  status: InvitationStatus;
  expiresAt: Date;
}

export type InvitationRejection =
  | "INVITATION_NOT_FOUND"
  | "INVITATION_ALREADY_ACCEPTED"
  | "INVITATION_REVOKED"
  | "INVITATION_EXPIRED"
  | "ORGANISATION_NOT_ACTIVE"
  | "EMAIL_MISMATCH";

export type InvitationValidation =
  | { valid: true; invitation: InvitationSnapshot }
  | { valid: false; reason: InvitationRejection };

export const INVITATION_MESSAGES: Record<InvitationRejection, string> = {
  INVITATION_NOT_FOUND: "That invitation link isn't valid. Ask for a new one.",
  INVITATION_ALREADY_ACCEPTED: "That invitation has already been used.",
  INVITATION_REVOKED: "That invitation was withdrawn.",
  INVITATION_EXPIRED: "That invitation has expired. Ask for a fresh one.",
  ORGANISATION_NOT_ACTIVE: "That organisation isn't active on Endeavrly right now.",
  EMAIL_MISMATCH:
    "That invitation was sent to a different email address. Sign in with that address to accept it.",
};

/**
 * Validate an invitation for a given signed-in account.
 *
 * `accountEmail` is null when previewing the invitation before sign-in —
 * the preview screen needs to name the organisation without knowing who is
 * looking, so the email check is skipped in that case only.
 */
export function validateInvitation(
  invitation: InvitationSnapshot | null,
  accountEmail: string | null,
  now: Date = new Date()
): InvitationValidation {
  if (!invitation) return { valid: false, reason: "INVITATION_NOT_FOUND" };

  if (invitation.status === InvitationStatus.ACCEPTED) {
    return { valid: false, reason: "INVITATION_ALREADY_ACCEPTED" };
  }
  if (invitation.status === InvitationStatus.REVOKED) {
    return { valid: false, reason: "INVITATION_REVOKED" };
  }
  if (
    invitation.status === InvitationStatus.EXPIRED ||
    invitation.expiresAt.getTime() <= now.getTime()
  ) {
    return { valid: false, reason: "INVITATION_EXPIRED" };
  }
  if (
    invitation.organisationStatus !== "ACTIVE" &&
    invitation.organisationStatus !== "ONBOARDING"
  ) {
    return { valid: false, reason: "ORGANISATION_NOT_ACTIVE" };
  }

  if (accountEmail !== null) {
    // An invitation is addressed to a person, not transferable. Without this
    // check a forwarded link would enrol whoever opened it.
    if (accountEmail.trim().toLowerCase() !== invitation.email.trim().toLowerCase()) {
      return { valid: false, reason: "EMAIL_MISMATCH" };
    }
  }

  return { valid: true, invitation };
}

/** Split, normalise and de-duplicate a bulk-invite paste. */
export function parseBulkEmails(raw: string): { emails: string[]; invalid: string[] } {
  const candidates = raw
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const emails: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  // Deliberately permissive: real institutional address books contain things
  // a strict RFC parser rejects. We only guard the shape that matters.
  const shape = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

  for (const candidate of candidates) {
    if (!shape.test(candidate)) {
      invalid.push(candidate);
      continue;
    }
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    emails.push(candidate);
  }

  return { emails, invalid };
}
