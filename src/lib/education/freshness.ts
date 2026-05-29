/**
 * Data freshness helpers.
 *
 * A record's `lastVerifiedAt` is an ISO date string set by:
 *   - Sync importers (e.g. scripts/sync-norway-programmes.ts hits
 *     utdanning.no and stamps every record it touches with today's
 *     date + verificationSource = "utdanning.no").
 *   - Semantic-QA passes that confirm a hand-curated record is still
 *     accurate (verificationSource = "qa-agent:<model>" or "manual").
 *
 * UI consumers render a small "Verified Apr 2026" / "Curated" pill via
 * <FreshnessPill>. The pill is calm by design — it never alarms, never
 * uses red, and is honest about hand-curated content rather than
 * inventing a date.
 *
 * Thresholds are deliberately generous (90 / 270 days) because
 * education programmes really do change once a year at most. We don't
 * want to nag the user about a 60-day-old record that's still accurate.
 */

export type FreshnessState =
  | 'fresh' // verified within 90 days
  | 'aging' // 90 to 270 days
  | 'stale' // older than 270 days
  | 'curated'; // never verified — hand-curated content

export interface FreshnessInfo {
  state: FreshnessState;
  /** ISO date or undefined for curated. */
  verifiedAt?: string;
  /** Human-readable label, e.g. "Verified Apr 2026" / "Curated content". */
  label: string;
  /** Tooltip body explaining what the state means. */
  tooltip: string;
  /** Provenance, if available — used inside the tooltip. */
  source?: string;
}

const FRESH_DAYS = 90;
const AGING_DAYS = 270;

/**
 * Compute freshness state from a `lastVerifiedAt` value. Pass undefined
 * for hand-curated records — returns "curated", which the UI renders
 * honestly rather than pretending it's fresh.
 *
 * `now` is injectable for tests; defaults to `new Date()`.
 */
export function getFreshnessInfo(
  lastVerifiedAt: string | undefined,
  source: string | undefined = undefined,
  now: Date = new Date(),
): FreshnessInfo {
  if (!lastVerifiedAt) {
    return {
      state: 'curated',
      label: 'Curated content',
      tooltip:
        'Hand-curated by the Endeavrly editorial team. Not yet on a verification cycle.',
    };
  }

  const verified = new Date(lastVerifiedAt);
  if (Number.isNaN(verified.getTime())) {
    return {
      state: 'curated',
      label: 'Curated content',
      tooltip: 'Verification date not available.',
    };
  }

  const ageMs = now.getTime() - verified.getTime();
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  const monthYear = verified.toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });

  let state: FreshnessState;
  if (ageDays <= FRESH_DAYS) state = 'fresh';
  else if (ageDays <= AGING_DAYS) state = 'aging';
  else state = 'stale';

  const sourceFragment = source ? ` Source: ${source}.` : '';

  return {
    state,
    verifiedAt: lastVerifiedAt,
    label: `Verified ${monthYear}`,
    tooltip:
      state === 'fresh'
        ? `Last verified ${ageDays} day${ageDays === 1 ? '' : 's'} ago.${sourceFragment}`
        : state === 'aging'
          ? `Last verified ${ageDays} days ago — due for a re-check.${sourceFragment}`
          : `Last verified ${ageDays} days ago.${sourceFragment}`,
    source,
  };
}

/**
 * Aggregate freshness across many records (e.g. all programmes in a
 * stage). Returns the WORST state so the UI can show a single conservative
 * pill at the top of a list. If any record is curated, the aggregate is
 * curated. Otherwise the aggregate equals the worst date-derived state.
 */
export function aggregateFreshness(
  records: Array<{ lastVerifiedAt?: string; verificationSource?: string }>,
  now: Date = new Date(),
): FreshnessInfo {
  if (records.length === 0) {
    return {
      state: 'curated',
      label: 'Curated content',
      tooltip: 'No records.',
    };
  }
  const infos = records.map((r) =>
    getFreshnessInfo(r.lastVerifiedAt, r.verificationSource, now),
  );
  const order: Record<FreshnessState, number> = {
    fresh: 0,
    aging: 1,
    stale: 2,
    curated: 3,
  };
  let worst = infos[0];
  for (const info of infos) {
    if (order[info.state] > order[worst.state]) worst = info;
  }
  return worst;
}
