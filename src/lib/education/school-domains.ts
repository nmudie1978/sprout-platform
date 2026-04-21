/**
 * School-domain email gate.
 *
 * Used on TEACHER signup. We accept:
 *   - Norwegian school patterns: *.skole.no, *.vgs.no, *.fylkeskommune.no
 *     (these cover the vast majority of state-sector teachers)
 *   - Any .edu TLD (international schools, universities)
 *   - An explicit allowlist from SCHOOL_EMAIL_ALLOWLIST env var
 *     (comma-separated full domains, e.g. "example-school.com,demo.edu")
 *
 * We deliberately do NOT accept bare ".no" — a .no domain proves nothing
 * (anyone can register one). A misfire here is preferable to a false
 * positive: admins can widen the allowlist for legitimate teachers who
 * hit the gate.
 *
 * This is signup-time gating. It is not a substitute for human review —
 * the `/admin/reports` queue and the existing account-suspension actions
 * remain the ultimate control.
 */

const STATIC_PATTERNS: readonly (RegExp | string)[] = [
  /\.skole\.no$/i,
  /\.vgs\.no$/i,
  /\.fylkeskommune\.no$/i,
  /\.kommune\.no$/i,
  /\.edu$/i,
  /\.ac\.uk$/i,
  /\.sch\.uk$/i,
];

function getAllowlist(): string[] {
  const raw = process.env.SCHOOL_EMAIL_ALLOWLIST;
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isSchoolEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const at = email.indexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain) return false;

  for (const p of STATIC_PATTERNS) {
    if (typeof p === "string") {
      if (domain === p.toLowerCase()) return true;
    } else if (p.test(domain)) {
      return true;
    }
  }
  const allow = getAllowlist();
  return allow.includes(domain);
}
