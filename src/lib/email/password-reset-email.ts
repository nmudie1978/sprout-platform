/**
 * Password-reset email content (calm, on-brand, plain). Pure — returns the
 * subject/html/text for sendMail.
 */
export function buildPasswordResetEmail(resetUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Reset your Endeavrly password";
  const text = [
    "Hi,",
    "",
    "We received a request to reset your Endeavrly password.",
    "Open this link to choose a new one (it expires in 1 hour):",
    resetUrl,
    "",
    "If you didn't ask for this, you can safely ignore this email — your password won't change.",
    "",
    "— Endeavrly",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f5f1ea;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#2e2a25;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-size:18px;margin:0 0 16px;">Reset your password</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">We received a request to reset your Endeavrly password. Choose a new one using the button below — the link expires in 1&nbsp;hour.</p>
    <p style="margin:24px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:#177d7a;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px;">Choose a new password</a>
    </p>
    <p style="font-size:12px;line-height:1.6;color:#6b655e;margin:0 0 8px;">If the button doesn't work, paste this link into your browser:</p>
    <p style="font-size:12px;word-break:break-all;color:#177d7a;margin:0 0 24px;">${resetUrl}</p>
    <p style="font-size:12px;line-height:1.6;color:#6b655e;margin:0;">If you didn't ask for this, you can safely ignore this email — your password won't change.</p>
    <p style="font-size:12px;color:#6b655e;margin:24px 0 0;">— Endeavrly</p>
  </div></body></html>`;

  return { subject, html, text };
}
