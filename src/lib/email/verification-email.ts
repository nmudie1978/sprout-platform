/**
 * Transactional email content for the signup flow. Pure functions returning
 * the subject/html/text for sendMail — no I/O, so they're cheap to unit-test.
 *
 * House style follows buildPasswordResetEmail: one column, max 480px, inline
 * styles only (mail clients strip <style> blocks), a real <a> button plus the
 * same URL in plain text underneath for clients that don't render the button.
 * That combination is what makes these render correctly on both desktop and
 * mobile mail apps.
 */

const BG = "#f5f1ea";
const INK = "#2e2a25";
const MUTED = "#6b655e";
const TEAL = "#177d7a";

/** Shared shell so every auth email looks like it came from the same place. */
function wrap(inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:${BG};font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:${INK};">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
${inner}
    <p style="font-size:12px;color:${MUTED};margin:24px 0 0;">— Endeavrly</p>
  </div></body></html>`;
}

function button(href: string, label: string): string {
  return `    <p style="margin:24px 0;">
      <a href="${href}" style="display:inline-block;background:${TEAL};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px;">${label}</a>
    </p>`;
}

function fallbackLink(href: string): string {
  return `    <p style="font-size:12px;line-height:1.6;color:${MUTED};margin:0 0 8px;">If the button doesn't work, paste this link into your browser:</p>
    <p style="font-size:12px;word-break:break-all;color:${TEAL};margin:0 0 24px;">${href}</p>`;
}

/**
 * The email a brand-new account receives.
 *
 * `firstName` is optional — an address that signed up without one still gets a
 * warm, grammatical greeting rather than "Hi ,".
 */
export function buildVerificationEmail({
  verifyUrl,
  firstName,
}: {
  verifyUrl: string;
  firstName?: string | null;
}): { subject: string; html: string; text: string } {
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  const subject = "Confirm your email — Endeavrly";

  const text = [
    greeting,
    "",
    "Welcome to Endeavrly. You're getting this because this address was used to create an Endeavrly account.",
    "Confirm it's yours by opening this link (it expires in 24 hours):",
    verifyUrl,
    "",
    "Confirming your email is what lets you reset your password later, and keeps your account yours.",
    "",
    "If you didn't sign up, you can safely ignore this email — no account will be confirmed.",
    "",
    "— Endeavrly",
  ].join("\n");

  const html = wrap(`    <h1 style="font-size:18px;margin:0 0 16px;">Confirm your email</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">${greeting} welcome to Endeavrly.</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">You're getting this because this address was used to create an Endeavrly account. Confirming it is what lets you reset your password later, and keeps your account yours. The link expires in 24&nbsp;hours.</p>
${button(verifyUrl, "Confirm my email")}
${fallbackLink(verifyUrl)}
    <p style="font-size:12px;line-height:1.6;color:${MUTED};margin:0;">If you didn't sign up for Endeavrly, you can safely ignore this email — no account will be confirmed.</p>`);

  return { subject, html, text };
}

/**
 * The email sent when someone tries to sign up with an address that ALREADY
 * has an account.
 *
 * This is the other half of the enumeration-safe signup response: the browser
 * making the request is told nothing, and the notice goes to the inbox instead
 * — so only the genuine owner of the address learns anything. For that owner
 * (who has most likely just forgotten they registered) it's the most useful
 * possible message: here's how to get in, here's how to reset.
 */
export function buildExistingAccountEmail({
  signInUrl,
  resetUrl,
}: {
  signInUrl: string;
  resetUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "You already have an Endeavrly account";

  const text = [
    "Hi,",
    "",
    "Someone (probably you) just tried to create an Endeavrly account with this email address.",
    "You already have one, so we didn't make a second — your existing account is untouched.",
    "",
    `Sign in:            ${signInUrl}`,
    `Forgot your password: ${resetUrl}`,
    "",
    "If this wasn't you, there's nothing to do. Your account is unchanged and no one was told whether this address is registered.",
    "",
    "— Endeavrly",
  ].join("\n");

  const html = wrap(`    <h1 style="font-size:18px;margin:0 0 16px;">You already have an account</h1>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">Someone — probably you — just tried to create an Endeavrly account with this email address. You already have one, so we didn't make a second. Your existing account is untouched.</p>
${button(signInUrl, "Sign in to Endeavrly")}
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">Can't remember your password? <a href="${resetUrl}" style="color:${TEAL};">Reset it here</a>.</p>
${fallbackLink(signInUrl)}
    <p style="font-size:12px;line-height:1.6;color:${MUTED};margin:0;">If this wasn't you, there's nothing to do — your account is unchanged, and whoever made the request was not told whether this address is registered.</p>`);

  return { subject, html, text };
}
