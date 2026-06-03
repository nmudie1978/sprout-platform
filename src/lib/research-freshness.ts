/**
 * Research-facts / evidence freshness analysis (pure, `now`-injectable).
 *
 * Extracted from `scripts/refresh-research-facts.ts` so the expiry logic can
 * be unit-tested and reused. The app enforces a 24-month recency rule on
 * research facts + evidence (`MAX_FACT_AGE_MONTHS` / `MAX_EVIDENCE_AGE_MONTHS`);
 * once an item crosses that line it blocks CI. This module classifies each
 * item as ok / expiring-soon / expired so a scheduled audit can warn *before*
 * the hard block, and emit a machine-readable status report.
 */

/** Early-warning window: flag items expiring within this many days. */
export const WARNING_WINDOW_DAYS = 6 * 30; // ~180 days

const DAY_MS = 1000 * 60 * 60 * 24;
const HEADLINE_MAX = 60;

export type FreshnessStatus = "expired" | "expiring-soon" | "ok";

/** The shape both research facts and evidence stats share for this analysis. */
export interface ResearchSourceItem {
  id: string;
  headline: string;
  sourceName: string;
  sourceUrl: string;
  sourcePublishedAt: string;
  evergreen?: boolean;
}

export interface ResearchFreshnessItem {
  id: string;
  headline: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  status: FreshnessStatus;
  daysUntilExpiry: number;
}

export interface BucketSummary {
  ok: number;
  expiringSoon: number;
  expired: number;
  total: number;
}

export interface ResearchFreshnessReport {
  generatedAt: string;
  maxFactAgeMonths: number;
  maxEvidenceAgeMonths: number;
  warningWindowDays: number;
  facts: ResearchFreshnessItem[];
  evidence: ResearchFreshnessItem[];
  summary: {
    facts: BucketSummary;
    evidence: BucketSummary;
    totalIssues: number;
    hasExpired: boolean;
  };
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "..." : s;
}

/** Classify a single research item against a max-age window, relative to `now`. */
export function analyzeItem(
  item: ResearchSourceItem,
  maxAgeMonths: number,
  now: Date,
): ResearchFreshnessItem {
  const published = new Date(item.sourcePublishedAt);
  const expiry = new Date(published);
  expiry.setMonth(expiry.getMonth() + maxAgeMonths);
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / DAY_MS);

  let status: FreshnessStatus = "ok";
  if (item.evergreen) {
    status = "ok";
  } else if (daysUntilExpiry < 0) {
    status = "expired";
  } else if (daysUntilExpiry < WARNING_WINDOW_DAYS) {
    status = "expiring-soon";
  }

  return {
    id: item.id,
    headline: truncate(item.headline, HEADLINE_MAX),
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    publishedAt: item.sourcePublishedAt,
    status,
    daysUntilExpiry,
  };
}

function summarise(items: ResearchFreshnessItem[]): BucketSummary {
  return {
    ok: items.filter((i) => i.status === "ok").length,
    expiringSoon: items.filter((i) => i.status === "expiring-soon").length,
    expired: items.filter((i) => i.status === "expired").length,
    total: items.length,
  };
}

export interface AnalyzeOptions {
  maxFactAgeMonths: number;
  maxEvidenceAgeMonths: number;
  now: Date;
}

/** Produce a full freshness report for research facts + evidence. */
export function analyzeResearchFreshness(
  facts: ResearchSourceItem[],
  evidence: ResearchSourceItem[],
  opts: AnalyzeOptions,
): ResearchFreshnessReport {
  const factItems = facts.map((f) => analyzeItem(f, opts.maxFactAgeMonths, opts.now));
  const evidenceItems = evidence.map((s) => analyzeItem(s, opts.maxEvidenceAgeMonths, opts.now));
  const factSummary = summarise(factItems);
  const evidenceSummary = summarise(evidenceItems);

  return {
    generatedAt: opts.now.toISOString(),
    maxFactAgeMonths: opts.maxFactAgeMonths,
    maxEvidenceAgeMonths: opts.maxEvidenceAgeMonths,
    warningWindowDays: WARNING_WINDOW_DAYS,
    facts: factItems,
    evidence: evidenceItems,
    summary: {
      facts: factSummary,
      evidence: evidenceSummary,
      totalIssues:
        factSummary.expiringSoon +
        factSummary.expired +
        evidenceSummary.expiringSoon +
        evidenceSummary.expired,
      hasExpired: factSummary.expired > 0 || evidenceSummary.expired > 0,
    },
  };
}
