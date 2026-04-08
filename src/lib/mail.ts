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

/**
 * Build the guardian consent email and send it. Returns the result so
 * callers can decide whether to surface a warning to the youth.
 */
export async function sendGuardianConsentEmail(args: {
  guardianEmail: string;
  youthDisplayName: string;
  youthFirstName: string;
  consentToken: string;
}): Promise<SendMailResult> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "https://endeavrly.com";
  const consentUrl = `${baseUrl}/guardian-consent/${args.consentToken}`;

  const subject = `${args.youthFirstName} has asked you to confirm their Endeavrly account`;

  const text =
`Hi,

${args.youthDisplayName} has signed up for Endeavrly and listed you as their guardian.

Endeavrly is a youth-first careers and small-jobs platform for ages 15–23. Because they're under 18, we need a parent or guardian to confirm before they can fully use the platform.

Please review and confirm here:
${consentUrl}

What Endeavrly is:
  • A safe place to explore careers and find age-appropriate small jobs.
  • Structured messaging only — no open chat between minors and adults.
  • No in-app payments. No behavioural ads. No public follower counts.

If you don't recognise ${args.youthFirstName}, you can ignore this email and no account will be activated.

Thanks,
The Endeavrly team`;

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #f6f7f9; margin: 0; padding: 32px 16px; color: #0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);">
      <tr>
        <td style="padding: 28px 32px 8px 32px;">
          <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #14b8a6; margin: 0 0 12px 0;">Endeavrly</p>
          <h1 style="font-size: 22px; line-height: 1.3; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">
            ${escapeHtml(args.youthFirstName)} has asked you to confirm their account
          </h1>
          <p style="font-size: 15px; line-height: 1.55; color: #334155; margin: 0 0 16px 0;">
            <strong>${escapeHtml(args.youthDisplayName)}</strong> has signed up for Endeavrly and listed you as their guardian. Because they're under 18, we need a parent or guardian to confirm before they can fully use the platform.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 32px 24px 32px;">
          <a href="${consentUrl}" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 10px;">
            Review and confirm
          </a>
          <p style="font-size: 12px; color: #64748b; margin: 12px 0 0 0; word-break: break-all;">
            Or copy this link into your browser:<br>
            <span style="color: #0f766e;">${consentUrl}</span>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 32px 28px 32px;">
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 10px 0;">What Endeavrly is</p>
            <ul style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0; padding-left: 18px;">
              <li>A safe place to explore careers and find age-appropriate small jobs.</li>
              <li>Structured messaging only — no open chat between minors and adults.</li>
              <li>No in-app payments. No behavioural ads. No public follower counts.</li>
            </ul>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 32px 28px 32px;">
          <p style="font-size: 12px; line-height: 1.55; color: #94a3b8; margin: 0;">
            If you don't recognise ${escapeHtml(args.youthFirstName)}, you can ignore this email and no account will be activated.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendMail({ to: args.guardianEmail, subject, html, text });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
