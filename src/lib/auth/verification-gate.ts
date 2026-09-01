/**
 * The email-verification access policy.
 *
 * Endeavrly ships a HARD GATE: an account whose address has not been confirmed
 * cannot hold a session at all. Signing in is refused, and any session issued
 * before the gate is revoked at the next token refresh.
 *
 * This is a deliberate, owner-approved tightening of the earlier soft gate
 * (banner + full access). It is worth being clear-eyed about the cost, because
 * it cuts against CLAUDE.md's "start exploring immediately" principle: a young
 * person who mistypes their address, or whose school mail filter eats the
 * message, cannot get in at all until they sort it out. Everything downstream
 * of this file — the resend path on the sign-in screen, the credential-proved
 * resend endpoint, the grandfathering of pre-existing accounts — exists to keep
 * that failure mode recoverable rather than terminal.
 *
 * The gate is env-controlled so it can be turned off in one deploy without a
 * code change, which matters if it ever locks out real users at scale.
 */

/** The message shown when an unverified account tries to sign in. */
export const UNVERIFIED_SIGNIN_MESSAGE =
  "Please confirm your email address before signing in. Check your inbox for the link we sent you.";

/**
 * A stable marker on the thrown sign-in error.
 *
 * NextAuth surfaces `authorize()` errors to the client as an opaque string, so
 * the sign-in page needs something reliable to match on to decide whether to
 * offer the "resend" affordance. Matching on the human-readable sentence would
 * break the moment anyone reworded it.
 */
export const UNVERIFIED_ERROR_CODE = "EmailNotVerified";

/** The error `authorize()` throws for an unconfirmed account. */
export function unverifiedSignInError(): Error {
  return new Error(`${UNVERIFIED_ERROR_CODE}: ${UNVERIFIED_SIGNIN_MESSAGE}`);
}

/** Whether a sign-in failure was the verification gate (vs. bad credentials). */
export function isUnverifiedError(error: string | null | undefined): boolean {
  return typeof error === "string" && error.includes(UNVERIFIED_ERROR_CODE);
}

/**
 * Is the hard gate switched on?
 *
 * Defaults to ON. Set NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED="false" to fall
 * back to the soft gate (sign in freely, banner nudges). Read from the
 * environment on every call rather than cached at module load, so tests and a
 * runtime config change both take effect without a restart.
 */
export function isVerificationRequired(): boolean {
  return process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED !== "false";
}

/**
 * May this account hold a session?
 *
 * `emailVerified` is the timestamp from the User row; null means unconfirmed.
 * Kept separate from `isVerificationRequired()` so the caller can decide
 * whether the gate applies, and this stays a pure function of the account.
 */
export function isVerifiedEnoughToSignIn(
  user: { emailVerified: Date | null },
): boolean {
  return user.emailVerified !== null;
}

/**
 * The single decision both the sign-in path and the session-refresh path use,
 * so they can never disagree about who is allowed in.
 */
export function blocksSession(user: { emailVerified: Date | null }): boolean {
  return isVerificationRequired() && !isVerifiedEnoughToSignIn(user);
}
