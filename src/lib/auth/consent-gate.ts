// ── Softened guardian-consent gate (GDPR Art 8) ──────────────────────
//
// Under-18 youth (ageBracket SIXTEEN_SEVENTEEN) who don't yet have
// guardian consent can BROWSE and read the whole platform freely — the
// point is exploration. What they can't do until a guardian confirms is
// WRITE genuinely personal data: save reflections, store quiz results,
// persist skills/profile fields, etc. This list covers the API routes
// that persist a minor's personal data; the gate only fires on mutating
// methods (POST/PUT/PATCH/DELETE), so GET reads are always allowed.
//
// NOTE: setting a Primary/Secondary Goal (`/api/goals`) is deliberately
// NOT gated. Choosing a career goal is the core exploration action of the
// product and must be available to everyone, at any age, with or without
// guardian consent. It is not sensitive contact/identity data.
//
// This is intentionally narrower than the old gate, which blocked the
// entire authenticated surface. The canonical legal block (under-16 at
// signup) lives in /api/auth/signup; this is the in-app data-write layer.
export const CONSENT_WRITE_GATED_API_PREFIXES = [
  "/api/journey",
  "/api/discover",
  "/api/careers/swipe",
  "/api/careers/saved",
  "/api/profile/career-goals",
  "/api/profile/skills",
  "/api/insights/saved",
  "/api/insights/progress",
  "/api/insights/interactions",
  "/api/insights/newsletter",
  "/api/life-skills",
  "/api/interview-prep",
];

export const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isConsentWriteGatedApi(pathname: string): boolean {
  return CONSENT_WRITE_GATED_API_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}
