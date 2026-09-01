/**
 * Email-verification helpers (pure, server-side).
 *
 * Deliberately mirrors src/lib/auth/password-reset.ts: the raw token goes ONLY
 * into the emailed link, we persist a SHA-256 hash, and every token is
 * single-use and time-limited. A database leak therefore can't be used to mark
 * anyone's address as verified.
 */
import { randomBytes, createHash } from "crypto";

/** How long a verification link stays valid. */
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Minimum gap between two "resend verification email" requests for the same
 * account. Short enough that a user who genuinely didn't get the first mail
 * isn't left waiting, long enough that the button can't be used to flood an
 * inbox (see also the per-IP + per-account rate limits on the route).
 */
export const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

/**
 * Cookie holding the address awaiting confirmation, set by signup.
 *
 * httpOnly, so no script can read it, and it never appears in a URL. It exists
 * so the "check your email" screen can name the inbox and the resend button
 * has a target while the user is still signed out — which in turn lets the
 * resend endpoint refuse to mail an address supplied by the caller.
 */
export const PENDING_VERIFICATION_COOKIE = "endeavrly_pending_verification";

/** How long that cookie lives — long enough to finish signup, not to linger. */
export const PENDING_VERIFICATION_MAX_AGE_S = 30 * 60; // 30 minutes

/** A high-entropy, URL-safe raw token for the email link. */
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

/** Deterministic hash stored in the DB (never the raw token). */
export function hashVerificationToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/** Expiry timestamp for a freshly issued token. */
export function verificationTokenExpiry(now: number): Date {
  return new Date(now + VERIFICATION_TOKEN_TTL_MS);
}

/** A token row is usable only if it's unused and not past expiry. */
export function isVerificationTokenUsable(
  token: { usedAt: Date | null; expiresAt: Date } | null | undefined,
  now: number,
): boolean {
  if (!token) return false;
  if (token.usedAt) return false;
  return token.expiresAt.getTime() > now;
}

/**
 * Whether a fresh verification email may be sent, given when the most recent
 * one was issued. `lastSentAt` of null (never sent) always allows.
 */
export function canResendVerification(
  lastSentAt: Date | null | undefined,
  now: number,
): boolean {
  if (!lastSentAt) return true;
  return now - lastSentAt.getTime() >= RESEND_COOLDOWN_MS;
}

/** Whole seconds a caller must wait before resending. 0 when allowed now. */
export function resendCooldownRemainingMs(
  lastSentAt: Date | null | undefined,
  now: number,
): number {
  if (!lastSentAt) return 0;
  const remaining = RESEND_COOLDOWN_MS - (now - lastSentAt.getTime());
  return remaining > 0 ? remaining : 0;
}

/**
 * The canonical stored form of an address: trimmed and lowercased.
 *
 * Every read AND write path must run an address through this before it touches
 * the database — that, plus the `@unique` constraint on User.email, is what
 * makes "Foo@Bar.com" and "foo@bar.com" the same account rather than two.
 */
export function normaliseEmail(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

/**
 * Privacy-conscious rendering of an address for the "check your email" screen.
 * Keeps enough for the user to recognise which inbox to open, without printing
 * the full address onto a screen someone else might be looking at.
 *
 *   "alexandra@hotmail.com" -> "a•••••••a@hotmail.com"
 *   "jo@x.co"               -> "j•o@x.co"
 *   "a@x.co"                -> "•@x.co"
 */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "•••";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!domain) return "•••";

  let maskedLocal: string;
  if (local.length <= 1) {
    maskedLocal = "•";
  } else if (local.length === 2) {
    maskedLocal = `${local[0]}•`;
  } else {
    maskedLocal = `${local[0]}${"•".repeat(local.length - 2)}${local[local.length - 1]}`;
  }
  return `${maskedLocal}@${domain}`;
}

/** The outcomes the verify-email endpoint can produce. */
export type VerificationOutcome =
  | "success"
  | "already"
  | "expired"
  | "invalid";

/** Every outcome value, for exhaustive validation of the ?status= param. */
export const VERIFICATION_OUTCOMES: readonly VerificationOutcome[] = [
  "success",
  "already",
  "expired",
  "invalid",
] as const;

/** Narrow an untrusted ?status= query value to a known outcome. */
export function parseVerificationOutcome(raw: unknown): VerificationOutcome {
  return VERIFICATION_OUTCOMES.includes(raw as VerificationOutcome)
    ? (raw as VerificationOutcome)
    : "invalid";
}
