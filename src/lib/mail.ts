import { Resend } from "resend";

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
    console.warn(
      "[mail] Resend not configured — skipping email. " +
      "Set RESEND_API_KEY and MAIL_FROM in env to enable.",
      { to, subject }
    );
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
      console.error("[mail] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mail] Send failed:", message);
    return { ok: false, error: message };
  }
}
