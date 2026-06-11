/**
 * Password-reset token helpers (pure, server-side).
 *
 * The raw token goes ONLY into the emailed link. We persist a SHA-256 hash, so
 * a database leak cannot be used to reset anyone's password. Tokens are
 * single-use and expire after RESET_TOKEN_TTL_MS.
 */
import { randomBytes, createHash } from "crypto";

/** How long a reset link stays valid. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Minimum password length — mirrors the signup rule. */
export const PASSWORD_MIN_LENGTH = 8;

/** A high-entropy, URL-safe raw token for the email link. */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/** Deterministic hash stored in the DB (never the raw token). */
export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/** Expiry timestamp for a freshly issued token. */
export function resetTokenExpiry(now: number): Date {
  return new Date(now + RESET_TOKEN_TTL_MS);
}

/** A token row is usable only if it's unused and not past expiry. */
export function isResetTokenUsable(
  token: { usedAt: Date | null; expiresAt: Date } | null | undefined,
  now: number,
): boolean {
  if (!token) return false;
  if (token.usedAt) return false;
  return token.expiresAt.getTime() > now;
}

/** Validate a proposed new password. Returns an error string, or null if OK. */
export function validateNewPassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  return null;
}
