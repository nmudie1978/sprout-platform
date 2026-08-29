/**
 * Welcome email content (calm, on-brand, plain). Pure — returns the
 * subject/html/text for sendMail.
 *
 * Strictly transactional: a one-time "your account is ready" note with a
 * single gentle nudge into My Journey. No marketing, no tracking, no
 * newsletter/unsubscribe machinery — that keeps it consent-clean for every
 * age (see CLAUDE.md privacy-by-design + age policy).
 */

/** Minimal HTML-escape so a user-supplied name can't inject markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildWelcomeEmail(
  firstName: string,
  journeyUrl: string,
): { subject: string; html: string; text: string } {
  const name = (firstName || "").trim();
  const greetingText = name ? `Hi ${name},` : "Hi there,";
  const greetingHtml = name ? `Hi ${escapeHtml(name)},` : "Hi there,";

  const subject = "Welcome to Endeavrly";

  const text = [
    greetingText,
    "",
    "Welcome to Endeavrly — your space to explore careers, understand the real pathways into them, and build clarity about your future.",
    "",
    "The best place to start is My Journey. Pick a career that interests you and we'll walk you through it: Discover, Understand, then your own Clarity roadmap. There's no rush, and you can change direction anytime.",
    "",
    "Start here:",
    journeyUrl,
    "",
    "If you have any questions, just reply to this email.",
    "",
    "— The Endeavrly team",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f5f1ea;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#2e2a25;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-size:18px;margin:0 0 16px;">Welcome to Endeavrly</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">${greetingHtml}</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">Welcome to Endeavrly — your space to explore careers, understand the real pathways into them, and build clarity about your future.</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">The best place to start is <strong>My Journey</strong>. Pick a career that interests you and we'll walk you through it: Discover, Understand, then your own Clarity roadmap. There's no rush, and you can change direction anytime.</p>
    <p style="margin:24px 0;">
      <a href="${journeyUrl}" style="display:inline-block;background:#177d7a;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px;">Start My Journey</a>
    </p>
    <p style="font-size:12px;line-height:1.6;color:#6b655e;margin:0 0 8px;">If the button doesn't work, paste this link into your browser:</p>
    <p style="font-size:12px;word-break:break-all;color:#177d7a;margin:0 0 24px;">${journeyUrl}</p>
    <p style="font-size:12px;line-height:1.6;color:#6b655e;margin:0;">If you have any questions, just reply to this email.</p>
    <p style="font-size:12px;color:#6b655e;margin:24px 0 0;">— The Endeavrly team</p>
  </div></body></html>`;

  return { subject, html, text };
}
