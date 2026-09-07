/**
 * ACCOUNT ACTIVITY NOTIFICATIONS
 *
 * Emails the operator when someone signs up, or when anyone other than the
 * operator signs in. Deliberately small: it exists so a one-person team knows
 * the platform is being used without sitting in a dashboard, not as an
 * analytics channel.
 *
 * Shape mirrors lib/feedback-notify.ts — a pure builder that is easy to test,
 * plus a send that never throws. Nothing here may ever fail a signup or a
 * sign-in: the notification is a side effect for the operator's benefit, and
 * a broken mailbox must not lock a young person out of their account.
 *
 * PRIVACY NOTE. This puts a user's email address into the operator's inbox.
 * That is a legitimate-interest processing of data the operator already
 * controls, but it means:
 *   • the address is the ONLY personal field included — no IP, no device, no
 *     location, no behaviour;
 *   • self sign-ins are skipped, so the operator's own activity isn't logged
 *     back to them;
 *   • there is no store. If the email isn't sent, nothing is recorded.
 */

import { sendMail, type SendMailResult } from "@/lib/mail";

export type AccountEventKind = "signup" | "signin";

export interface AccountNotificationInput {
  kind: AccountEventKind;
  /** The account the event concerns. */
  email: string;
  /** Youth / Teacher / Admin — helps the operator triage at a glance. */
  role?: string | null;
  /** Signup only: the country chosen at registration. */
  country?: string | null;
  /** Defaults to now; injectable for tests. */
  at?: Date;
}

export interface AccountNotification {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://endeavrly.com").replace(/\/$/, "");
}

/**
 * The operator's address. `ACCOUNT_NOTIFY_TO` lets these be routed separately
 * from feedback (they are far higher volume); otherwise it falls back to the
 * same addresses feedback uses, so configuring one env var is enough.
 */
export function accountRecipient(): string | null {
  const to =
    process.env.ACCOUNT_NOTIFY_TO ||
    process.env.FEEDBACK_NOTIFY_TO ||
    process.env.ADMIN_EMAIL;
  return to && to.includes("@") ? to : null;
}

/**
 * True when this event is the operator's own activity, which we don't report
 * back to them. Compared case-insensitively against the recipient.
 */
export function isSelf(email: string, recipient = accountRecipient()): boolean {
  if (!recipient) return false;
  return email.trim().toLowerCase() === recipient.trim().toLowerCase();
}

export function buildAccountNotification(
  input: AccountNotificationInput,
): AccountNotification {
  const at = input.at ?? new Date();
  const when = at.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const isSignup = input.kind === "signup";

  const subject = isSignup
    ? `New sign-up — ${input.email}`
    : `Sign-in — ${input.email}`;

  const facts: [string, string][] = [["Email", input.email]];
  if (input.role) facts.push(["Role", input.role]);
  if (isSignup && input.country) facts.push(["Country", input.country]);
  facts.push(["When", when]);

  const portal = `${appUrl()}/admin/analytics`;

  const text = [
    isSignup ? "Someone new joined Endeavrly." : "Someone signed in to Endeavrly.",
    "",
    ...facts.map(([k, v]) => `${k}: ${v}`),
    "",
    `Dashboard: ${portal}`,
  ].join("\n");

  const rows = facts
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:13px">${escapeHtml(k)}</td>` +
        `<td style="padding:4px 0;color:#0f172a;font-size:13px"><strong>${escapeHtml(v)}</strong></td></tr>`,
    )
    .join("");

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px">
  <h2 style="margin:0 0 4px;font-size:17px;color:#0f172a">
    ${isSignup ? "New sign-up" : "Sign-in"}
  </h2>
  <p style="margin:0 0 16px;color:#64748b;font-size:14px">
    ${isSignup ? "Someone new joined Endeavrly." : "Someone signed in to Endeavrly."}
  </p>
  <table style="border-collapse:collapse;margin-bottom:20px">${rows}</table>
  <a href="${portal}" style="display:inline-block;background:#14b8a6;color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px;font-size:14px">
    Open the dashboard
  </a>
</div>`.trim();

  return { subject, html, text };
}

export type NotifyOutcome =
  | { sent: true; id?: string }
  | {
      sent: false;
      reason: "NO_RECIPIENT" | "SELF" | "MAIL_SKIPPED" | "MAIL_FAILED";
      error?: string;
    };

/**
 * Send the notification. Never throws — see the module note. Returns why it
 * didn't send so the caller can log it without having to guess.
 */
export async function notifyAccountEvent(
  input: AccountNotificationInput,
): Promise<NotifyOutcome> {
  const to = accountRecipient();
  if (!to) return { sent: false, reason: "NO_RECIPIENT" };

  // The operator's own sign-ins are noise, and reporting them back would be
  // logging their behaviour to themselves for no benefit.
  if (input.kind === "signin" && isSelf(input.email, to)) {
    return { sent: false, reason: "SELF" };
  }

  try {
    const { subject, html, text } = buildAccountNotification(input);
    const result: SendMailResult = await sendMail({ to, subject, html, text });

    if (result.skipped) return { sent: false, reason: "MAIL_SKIPPED" };
    if (!result.ok) return { sent: false, reason: "MAIL_FAILED", error: result.error };
    return { sent: true, id: result.id };
  } catch (error) {
    return {
      sent: false,
      reason: "MAIL_FAILED",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
