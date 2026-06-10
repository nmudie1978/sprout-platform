/**
 * Career-data recency helpers.
 *
 * The catalogue at `src/lib/career-pathways.ts` (~813 careers) is
 * hand-curated. Salaries and growth outlook can drift quietly. The
 * audit (Apr 2026) flagged this as the highest single risk to user
 * trust — users may set life decisions against figures that haven't
 * been checked in years.
 *
 * These helpers let the UI surface a small "salary data may be out
 * of date" disclaimer when a career has no `lastVerifiedAt` or it's
 * older than 12 months.
 */

import type { Career } from "@/lib/career-pathways";

/** Age cap for catalogue salaries to be considered "fresh". */
export const CAREER_DATA_MAX_AGE_DAYS = 365;

/**
 * Catalogue audit baseline. Set when the catalogue last had an
 * end-to-end review (audit on 2026-04-15). Careers that don't carry
 * an explicit `lastVerifiedAt` are treated as having been verified
 * on this baseline date — the disclaimer therefore only fires once
 * the baseline crosses the 12-month staleness threshold (2027-04-15)
 * unless individual careers get re-stamped sooner via the SSB
 * salary-drift refresh in `scripts/refresh-career-salaries.ts`.
 *
 * When the next full catalogue audit happens, bump this date so the
 * disclaimer cycle resets.
 */
export const CATALOGUE_BASELINE_VERIFIED_AT = "2026-04-15";

/** Resolve the effective lastVerifiedAt for a career, falling back
 *  to the catalogue baseline when no per-career timestamp is set. */
export function effectiveVerifiedAt(
  career: Pick<Career, "lastVerifiedAt">,
): string {
  return career.lastVerifiedAt ?? CATALOGUE_BASELINE_VERIFIED_AT;
}

/** True if the effective verified date is more than
 *  CAREER_DATA_MAX_AGE_DAYS ago. */
export function isCareerSalaryStale(
  career: Pick<Career, "lastVerifiedAt">,
  now: Date = new Date(),
): boolean {
  const verifiedRaw = effectiveVerifiedAt(career);
  const verified = new Date(verifiedRaw).getTime();
  if (Number.isNaN(verified)) return true;
  const ageDays = (now.getTime() - verified) / (1000 * 60 * 60 * 24);
  return ageDays > CAREER_DATA_MAX_AGE_DAYS;
}

/** True if the career carries an explicit, fresh per-career
 *  verification (i.e. has been actively re-stamped, not just
 *  inheriting the catalogue baseline). Use this to surface a
 *  positive "✓ Verified" pill in the UI. */
export function isCareerExplicitlyVerified(
  career: Pick<Career, "lastVerifiedAt" | "sourceUrl">,
  now: Date = new Date(),
): boolean {
  if (!career.lastVerifiedAt) return false;
  const verified = new Date(career.lastVerifiedAt).getTime();
  if (Number.isNaN(verified)) return false;
  const ageDays = (now.getTime() - verified) / (1000 * 60 * 60 * 24);
  return ageDays <= CAREER_DATA_MAX_AGE_DAYS;
}

// ── Salary provenance (UI-facing) ──────────────────────────────────
//
// A single descriptor the salary UI can render without re-deriving the
// verified/sourced logic. Three honest tiers:
//   - verified  : explicit, fresh per-career lastVerifiedAt (optionally
//                 with a public sourceUrl) → positive "✓ Verified" signal.
//   - estimated : the progression curve was synthesized from the typical
//                 range rather than hand-curated (caller passes this in).
//   - indicative: hand-curated or baseline-inherited figure with no named
//                 public source → must NOT be presented as source-backed.

export type SalaryProvenanceTier = "verified" | "estimated" | "indicative";

export interface SalaryProvenance {
  tier: SalaryProvenanceTier;
  /** Public source URL, when recorded. */
  sourceUrl?: string;
  /** Bare hostname for display, e.g. "ssb.no". */
  sourceHost?: string;
  /** Short status-chip label, e.g. "Verified Apr 2026". */
  label: string;
  /** Longer footnote shown beneath the chart. */
  note: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function hostOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/**
 * Resolve how a career's salary figure should be presented for trust.
 * Pure + deterministic (pass `now` in tests).
 *
 * `estimated` should be true when the displayed progression was
 * synthesized from the typical range (see buildSalaryProgression). A
 * verified underlying figure still wins the chip — a sourced anchor is
 * more reassuring than the "synthesized shape" caveat, which the chart's
 * own labelling already conveys.
 */
export function getSalaryProvenance(
  career: Pick<Career, "lastVerifiedAt" | "sourceUrl">,
  opts: { estimated?: boolean; now?: Date } = {},
): SalaryProvenance {
  const now = opts.now ?? new Date();
  const sourceUrl = career.sourceUrl || undefined;
  const sourceHost = hostOf(sourceUrl);

  if (isCareerExplicitlyVerified(career, now) && career.lastVerifiedAt) {
    const d = new Date(career.lastVerifiedAt);
    const stamp = `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    return {
      tier: "verified",
      sourceUrl,
      sourceHost,
      label: `Verified ${stamp}`,
      note: sourceHost
        ? `Source: ${sourceHost} · verified ${stamp}. Ranges are indicative — actual pay varies by employer, region and specialism.`
        : `Verified ${stamp}. Ranges are indicative — actual pay varies by employer, region and specialism.`,
    };
  }

  if (opts.estimated) {
    return {
      tier: "estimated",
      sourceUrl,
      sourceHost,
      label: "Estimated",
      note: "Estimated from this career’s typical salary range — a guide, not a guarantee. Actual pay varies by employer, region and specialism.",
    };
  }

  return {
    tier: "indicative",
    sourceUrl,
    sourceHost,
    label: "Indicative",
    note: "Indicative range — not yet verified against a named public source. Actual pay varies by employer, region and specialism.",
  };
}

/** Roll-up over the whole catalogue. Use in scripts / admin views. */
export function catalogueRecencySummary(
  careers: Pick<Career, "lastVerifiedAt">[],
  now: Date = new Date(),
) {
  const total = careers.length;
  const stale = careers.filter((c) => isCareerSalaryStale(c, now)).length;
  const fresh = total - stale;
  const stalePct = total === 0 ? 0 : Number(((stale / total) * 100).toFixed(1));
  return { total, fresh, stale, stalePct };
}
