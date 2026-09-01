/**
 * Issuing and consuming email-verification tokens.
 *
 * The pure token maths lives in ./email-verification; this module is the thin
 * database + mail layer around it, shared by /api/auth/signup,
 * /api/auth/resend-verification and /api/auth/verify-email so all three can
 * never drift apart on token lifetime, single-use semantics or cooldown.
 */
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { logAndSwallow } from "@/lib/observability";
import { absoluteUrl } from "@/lib/auth/app-url";
import {
  buildVerificationEmail,
  buildExistingAccountEmail,
} from "@/lib/email/verification-email";
import {
  generateVerificationToken,
  hashVerificationToken,
  verificationTokenExpiry,
  canResendVerification,
  resendCooldownRemainingMs,
  type VerificationOutcome,
} from "@/lib/auth/email-verification";

export interface IssueResult {
  /** False only when the caller is inside the resend cooldown. */
  sent: boolean;
  /** Milliseconds still to wait, when `sent` is false. */
  retryAfterMs: number;
}

/**
 * Issue a fresh verification token and email the link.
 *
 * Any outstanding token for the account is invalidated first, so only the most
 * recent link ever works — a link forwarded from an old email can't be replayed
 * after a resend.
 *
 * `respectCooldown` is true for user-triggered resends and false for the send
 * that happens during signup (which is already covered by the signup rate
 * limit, and must never be skipped).
 */
export async function issueVerificationEmail({
  userId,
  email,
  firstName,
  respectCooldown = true,
  now = Date.now(),
}: {
  userId: string;
  email: string;
  firstName?: string | null;
  respectCooldown?: boolean;
  now?: number;
}): Promise<IssueResult> {
  if (respectCooldown) {
    const latest = await prisma.emailVerificationToken.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (!canResendVerification(latest?.createdAt, now)) {
      return {
        sent: false,
        retryAfterMs: resendCooldownRemainingMs(latest?.createdAt, now),
      };
    }
  }

  const rawToken = generateVerificationToken();
  const tokenHash = hashVerificationToken(rawToken);

  await prisma.$transaction([
    prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date(now) },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId,
        email,
        tokenHash,
        expiresAt: verificationTokenExpiry(now),
      },
    }),
  ]);

  // The raw token appears here and nowhere else — never logged, never stored.
  const verifyUrl = absoluteUrl(
    `/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`,
  );
  const { subject, html, text } = buildVerificationEmail({ verifyUrl, firstName });
  const result = await sendMail({ to: email, subject, html, text });

  if (result.skipped) {
    // Mail isn't configured. Make it loud rather than letting every new signup
    // silently never receive anything — the same guard the reset flow uses.
    logAndSwallow("verification:mail-skipped")(
      new Error(
        "Verification email skipped: Resend not configured (RESEND_API_KEY/MAIL_FROM).",
      ),
    );
    // In development, print the link so the flow is testable without a mailbox.
    if (process.env.NODE_ENV !== "production") {
      console.info(`[verification] Dev verification link for ${email}: ${verifyUrl}`);
    }
  } else if (!result.ok) {
    logAndSwallow("verification:mail-failed")(
      new Error(`Verification email failed: ${result.error ?? "unknown error"}`),
    );
  }

  return { sent: true, retryAfterMs: 0 };
}

/**
 * Tell the owner of an already-registered address that someone tried to sign
 * up with it again. Sent INSTEAD of creating a second account.
 */
export async function sendExistingAccountNotice(email: string): Promise<void> {
  const { subject, html, text } = buildExistingAccountEmail({
    signInUrl: absoluteUrl("/auth/signin"),
    resetUrl: absoluteUrl("/auth/forgot-password"),
  });
  const result = await sendMail({ to: email, subject, html, text });
  if (!result.ok) {
    logAndSwallow("verification:existing-account-notice")(
      new Error(`Existing-account notice failed: ${result.error ?? "unknown error"}`),
    );
  }
}

/**
 * Consume a raw verification token.
 *
 * Deliberately tolerant of the two things that happen constantly in the real
 * world and are not attacks:
 *
 *  • Mail-security scanners (Outlook Safe Links, corporate gateways) fetch
 *    every link in an email before the human sees it. That fetch verifies the
 *    address and burns the token; when the human then clicks, we report
 *    "already" rather than an alarming failure.
 *  • People click the link twice, or click an older copy of the email.
 *
 * Returns only a coarse outcome — the caller must not surface token internals.
 */
export async function consumeVerificationTokenDetailed(
  rawToken: string,
  now = Date.now(),
): Promise<{ outcome: VerificationOutcome; userId: string | null }> {
  if (!rawToken) return { outcome: "invalid", userId: null };

  const tokenHash = hashVerificationToken(rawToken);
  const token = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      email: true,
      usedAt: true,
      expiresAt: true,
      user: { select: { email: true, emailVerified: true, deletedAt: true } },
    },
  });

  if (!token || !token.user || token.user.deletedAt) return { outcome: "invalid", userId: null };

  // A link issued for a previous address must never verify the current one.
  if (token.email !== token.user.email) return { outcome: "invalid", userId: null };

  if (token.user.emailVerified) return { outcome: "already", userId: token.userId };
  if (token.usedAt) return { outcome: "expired", userId: null };
  if (token.expiresAt.getTime() <= now) return { outcome: "expired", userId: null };

  // ATOMIC SINGLE-USE CLAIM. Two requests arriving together (the classic case:
  // a link scanner and the human clicking at the same moment) both reach here
  // with an unused token. `updateMany` filtered on `usedAt: null` is decided by
  // the database, so exactly one of them gets count === 1.
  const claim = await prisma.emailVerificationToken.updateMany({
    where: { id: token.id, usedAt: null },
    data: { usedAt: new Date(now) },
  });
  if (claim.count === 0) {
    const fresh = await prisma.user.findUnique({
      where: { id: token.userId },
      select: { emailVerified: true },
    });
    return fresh?.emailVerified
      ? { outcome: "already" as const, userId: token.userId }
      : { outcome: "expired" as const, userId: null };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { emailVerified: new Date(now) },
    }),
    // Any sibling token is now moot — only one confirmation is ever needed.
    prisma.emailVerificationToken.updateMany({
      where: { userId: token.userId, usedAt: null },
      data: { usedAt: new Date(now) },
    }),
  ]);

  return { outcome: "success", userId: token.userId };
}

/**
 * Back-compatible wrapper: the coarse outcome only. Most callers (and every
 * existing test) want just this; the detailed form exists so the verify-email
 * route can mint a session for the account it just confirmed.
 */
export async function consumeVerificationToken(
  rawToken: string,
  now = Date.now(),
): Promise<VerificationOutcome> {
  return (await consumeVerificationTokenDetailed(rawToken, now)).outcome;
}
