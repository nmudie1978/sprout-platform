import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

/**
 * Mail helper — Resend backend.
 *
 * Required env vars:
 *   RESEND_API_KEY      Your Resend API key (starts with "re_")
 *   MAIL_FROM           Verified sender address, e.g. "Endeavrly <noreply@endeavrly.com>"
 *   NEXT_PUBLIC_APP_URL Public base URL of the app, e.g. "https://endeavrly.com"
 *
 * If RESEND_API_KEY is missing the helper logs a warning and resolves
 * successfully with `{ skipped: true }` so signup never breaks in dev.
 */

let _resend: Resend | null | undefined;
function getResend(): Resend | null {
  if (_resend !== undefined) return _resend;
  const key = process.env.RESEND_API_KEY;
  _resend = key && key.startsWith("re_") ? new Resend(key) : null;
  return _resend;
}

export interface SendMailArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface SendMailResult {
  ok: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
}

export async function sendMail({ to, subject, html, text, replyTo }: SendMailArgs): Promise<SendMailResult> {
  const resend = getResend();
  const from = process.env.MAIL_FROM;

  if (!resend || !from) {
    // IN PRODUCTION THIS IS AN ERROR, NOT A WARNING.
    //
    // Skipping a send used to be a console.warn that nobody reads, and the
    // callers can't tell either: signup and password-reset both return a
    // generic 200 whether or not mail went out (anti-enumeration). With email
    // verification as a hard gate, this branch means every new signup is
    // silently unable to confirm and therefore unable to sign in — a total
    // signup outage that reports success at every layer.
    //
    // Reported to Sentry at `error` so it pages rather than accumulates. In
    // development it stays a console warning: running without mail is normal
    // there and the verification link is printed to the server log instead.
    if (process.env.VERCEL_ENV === "production") {
      Sentry.captureException(
        new Error(
          "[mail] Resend not configured in production — email was NOT sent. " +
            "Signup verification and password reset are broken until " +
            "RESEND_API_KEY and MAIL_FROM are set.",
        ),
        { level: "error", tags: { subsystem: "mail" }, extra: { subject } },
      );
    } else {
      console.warn(
        "[mail] Resend not configured — skipping email. " +
        "Set RESEND_API_KEY and MAIL_FROM in env to enable.",
        { to, subject }
      );
    }
    return { ok: true, skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
    });
    if (error) {
      // A rejected send (revoked key -> 401, unverified sender -> 403) is the
      // exact failure that went unnoticed on 2026-06-19. Same reasoning as
      // above: the caller cannot surface it, so it has to page from here.
      console.error("[mail] Resend error:", error);
      Sentry.captureException(new Error(`[mail] Resend rejected the send: ${error.message}`), {
        level: "error",
        tags: { subsystem: "mail" },
        extra: { subject },
      });
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mail] Send failed:", message);
    return { ok: false, error: message };
  }
}
