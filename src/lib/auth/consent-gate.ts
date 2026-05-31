// ── Age is a personalisation signal, not an in-app gate ──────────────
//
// Endeavrly does not block any in-app action by age or guardian consent.
// Every signed-in user — at any age, with or without guardian consent —
// can read AND write across the product: set goals, save reflections,
// store quiz results, persist skills/profile fields, and so on.
//
// Age is used only to:
//   (a) personalise the Clarity-tab roadmap (e.g. no university step
//       before 18, professional certs spaced to post-experience), and
//   (b) enforce the one-time signup eligibility floor (15–23), which
//       lives in /api/auth/signup — NOT here.
// See CLAUDE.md <age_policy>.
//
// This list is intentionally EMPTY: nothing is consent-write-gated. The
// mechanism is kept (rather than ripped out of middleware) so a single
// route could be re-gated in one line if the policy ever changed, and so
// the "gates nothing" guarantee stays unit-tested.
export const CONSENT_WRITE_GATED_API_PREFIXES: string[] = [];

export const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isConsentWriteGatedApi(pathname: string): boolean {
  return CONSENT_WRITE_GATED_API_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}
