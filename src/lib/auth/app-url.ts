/**
 * Canonical public base URL, and validation for anything we redirect to.
 *
 * Every link we put in an email has to be absolute, and getting the origin
 * wrong means either a dead link or — worse — a link pointing at somewhere we
 * don't control. Resolution is environment-driven so the same code produces
 * localhost links in dev, the deployment URL on a preview, and the real domain
 * in production, with no hard-coded environment URLs.
 *
 * Order of preference:
 *   1. NEXT_PUBLIC_APP_URL  — explicit, wins everywhere. Set this in prod.
 *   2. NEXTAUTH_URL         — already required in production (see src/lib/env.ts).
 *   3. VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL — auto-injected per deploy.
 *   4. http://localhost:3000 — development only.
 */

const DEV_FALLBACK = "http://localhost:3000";

/** Strip a trailing slash so callers can safely append "/auth/...". */
function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Add a scheme to the bare hostnames Vercel injects. */
function withScheme(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/**
 * The absolute origin to build user-facing links from.
 *
 * Throws in production when nothing usable is configured. That is deliberate:
 * a verification email carrying a localhost link is worse than a loud failure,
 * because it fails silently in the user's inbox where nobody is watching.
 */
export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (explicit) return trimTrailingSlash(withScheme(explicit));

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return trimTrailingSlash(withScheme(vercel));

  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    throw new Error(
      "[app-url] No public base URL configured. Set NEXT_PUBLIC_APP_URL (or NEXTAUTH_URL) " +
        "— outgoing auth emails cannot be built without it.",
    );
  }
  return DEV_FALLBACK;
}

/** Build an absolute URL on our own origin from a root-relative path. */
export function absoluteUrl(path: string): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${getAppBaseUrl()}${suffix}`;
}

/**
 * Validate a caller-supplied post-verification destination.
 *
 * OPEN-REDIRECT GUARD, same rule as the NextAuth `redirect` callback in
 * src/lib/auth.ts: a `?next=` parameter arrives straight from whoever composed
 * the link, so only root-relative paths on our own origin are honoured.
 * Protocol-relative ("//evil.example") and backslash ("/\evil") forms are
 * browser-absolute despite starting with "/", so they are rejected too.
 *
 * Returns `fallback` for anything that doesn't qualify.
 */
export function safeRelativePath(raw: unknown, fallback = "/dashboard"): string {
  if (typeof raw !== "string" || !raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  // Whitespace or a control character can be used to smuggle a second header
  // or to confuse a URL parser; nothing legitimate needs them in a path.
  if (/[\s\u0000-\u001F\u007F]/.test(raw)) return fallback;
  return raw;
}
