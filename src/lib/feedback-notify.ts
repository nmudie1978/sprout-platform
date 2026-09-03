/**
 * Feedback notification.
 *
 * Feedback used to land in a table and wait for someone to remember to open
 * /admin/feedback. One submission — "I dont know what career twin even does"
 * — sat unread for eleven weeks. This sends a short email the moment a piece
 * of feedback arrives, so a real usability signal reaches a person the same
 * day.
 *
 * Two rules shape what the email contains:
 *
 *  1. DATA MINIMISATION. Feedback often comes from a fifteen-year-old. The
 *     email carries what is needed to triage — kind, area, rating, and the
 *     words they wrote — and nothing that identifies them. No email address,
 *     no display name. A short id prefix is included ONLY so the recipient
 *     can find the row in the portal if they need to.
 *
 *  2. NEVER BLOCK THE USER. A mail failure must not turn a successful
 *     submission into an error. `notifyNewFeedback` swallows everything and
 *     reports its outcome as a value.
 */

import type { FeedbackArea, FeedbackKind, FeedbackRole } from "@prisma/client";

import { AREA_LABEL, KIND_LABEL, ROLE_LABEL } from "@/lib/feedback-stats";
import { sendMail, type SendMailResult } from "@/lib/mail";

export interface FeedbackNotificationInput {
  id: string;
  kind: FeedbackKind | null;
  area: FeedbackArea | null;
  role: FeedbackRole | null;
  rating: number | null;
  message: string | null;
  /** Whether the submitter was signed in. The account itself is never named. */
  signedIn: boolean;
  submittedAt: Date;
}

export interface FeedbackNotification {
  subject: string;
  text: string;
  html: string;
}

/** Escape for interpolation into the HTML body. Feedback is user-written. */
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

/** "★★★★☆" — reads at a glance on a phone. */
function stars(rating: number | null): string | null {
  if (rating === null || rating < 1 || rating > 5) return null;
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

/**
 * Build the notification. Pure — no env reads beyond the app URL, no sending.
 *
 * The subject leads with the kind and area because that is what decides
 * whether this needs attention now or at the next review.
 */
export function buildFeedbackNotification(
  input: FeedbackNotificationInput
): FeedbackNotification {
  const kind = input.kind ? KIND_LABEL[input.kind] : null;
  const area = input.area ? AREA_LABEL[input.area] : null;
  const role = input.role ? ROLE_LABEL[input.role] : null;
  const rated = stars(input.rating);

  // A rating with no words is still signal, and says so plainly rather than
  // pretending there is something to read.
  const headline = kind ?? (rated ? "New rating" : "New feedback");
  const subject = area ? `${headline} — ${area}` : headline;

  const facts: [string, string][] = [];
  if (kind) facts.push(["Kind", kind]);
  if (area) facts.push(["Area", area]);
  if (rated) facts.push(["Rating", `${rated}  (${input.rating}/5)`]);
  if (role) facts.push(["From", role]);
  facts.push(["Account", input.signedIn ? "Signed in" : "Anonymous"]);
  facts.push(["Received", input.submittedAt.toISOString().replace("T", " ").slice(0, 16) + " UTC"]);
  facts.push(["Ref", input.id.slice(0, 8)]);

  const portal = `${appUrl()}/admin/feedback`;

  const text = [
    subject,
    "",
    ...facts.map(([k, v]) => `${k}: ${v}`),
    "",
    input.message ? `They wrote:\n\n  ${input.message}` : "No written message — rating only.",
    "",
    `All feedback: ${portal}`,
  ].join("\n");

  const html = `
<div style="font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#16202B">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7A8898">Endeavrly feedback</p>
  <h1 style="margin:0 0 20px;font-size:20px;line-height:1.3;font-weight:600">${escapeHtml(subject)}</h1>

  ${
    input.message
      ? `<blockquote style="margin:0 0 20px;padding:14px 16px;background:#F6F8FA;border-left:3px solid #0E8C82;border-radius:2px;font-size:15px;line-height:1.55;white-space:pre-wrap">${escapeHtml(
          input.message
        )}</blockquote>`
      : `<p style="margin:0 0 20px;font-size:15px;color:#4A5A6B">No written message — rating only.</p>`
  }

  <table style="border-collapse:collapse;font-size:13px;color:#4A5A6B;margin:0 0 24px">
    ${facts
      .map(
        ([k, v]) =>
          `<tr><td style="padding:3px 16px 3px 0;color:#7A8898">${escapeHtml(k)}</td><td style="padding:3px 0">${escapeHtml(v)}</td></tr>`
      )
      .join("")}
  </table>

  <a href="${portal}" style="display:inline-block;padding:9px 16px;background:#0E8C82;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;font-weight:500">Open feedback</a>

  <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#7A8898">
    Sent because someone left feedback in Endeavrly. The submitter is not identified in this
    email — open the portal to see the full record.
  </p>
</div>`.trim();

  return { subject, text, html };
}

/** Where notifications go. Null disables them without erroring. */
export function feedbackRecipient(): string | null {
  const to = process.env.FEEDBACK_NOTIFY_TO || process.env.ADMIN_EMAIL;
  return to && to.includes("@") ? to : null;
}

export type NotifyOutcome =
  | { sent: true; id?: string }
  | { sent: false; reason: "NO_RECIPIENT" | "MAIL_SKIPPED" | "MAIL_FAILED"; error?: string };

/**
 * Send the notification. Never throws — a broken mailbox must not cost us a
 * young person's feedback. The caller records the outcome and carries on.
 */
export async function notifyNewFeedback(
  input: FeedbackNotificationInput
): Promise<NotifyOutcome> {
  const to = feedbackRecipient();
  if (!to) return { sent: false, reason: "NO_RECIPIENT" };

  try {
    const { subject, html, text } = buildFeedbackNotification(input);
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
