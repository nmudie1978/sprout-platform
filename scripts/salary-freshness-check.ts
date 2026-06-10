/**
 * scripts/salary-freshness-check.ts
 *
 * Read-only freshness alarm for the career-salary catalogue. The catalogue's
 * trust labelling falls back to a hardcoded baseline
 * (CATALOGUE_BASELINE_VERIFIED_AT) that expires CAREER_DATA_MAX_AGE_DAYS
 * later. There is no automated salary refresh yet (the SSB integration in
 * scripts/refresh-career-salaries.ts is still a placeholder), so without a
 * reminder the catalogue silently ages past that baseline.
 *
 * This script reports source/verification coverage and the days remaining
 * until the baseline expires, and exits 1 when expiry is within WARN_DAYS so
 * a scheduled CI run goes RED as an early warning — prompting a human to
 * refresh the data and bump the baseline BEFORE every salary flips to
 * "may be out of date".
 *
 * Read-only: never edits data, never deploys.
 *
 * Usage: npx tsx scripts/salary-freshness-check.ts
 */
import { getAllCareers } from "../src/lib/career-pathways";
import {
  CATALOGUE_BASELINE_VERIFIED_AT,
  CAREER_DATA_MAX_AGE_DAYS,
} from "../src/lib/career-data-recency";

const WARN_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function main(): void {
  const careers = getAllCareers();
  const total = careers.length;
  const withSource = careers.filter((c) => c.sourceUrl).length;
  const withDate = careers.filter((c) => c.lastVerifiedAt).length;

  const baselineMs = new Date(CATALOGUE_BASELINE_VERIFIED_AT).getTime();
  const expiryMs = baselineMs + CAREER_DATA_MAX_AGE_DAYS * MS_PER_DAY;
  const daysUntilExpiry = Math.round((expiryMs - Date.now()) / MS_PER_DAY);

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  console.log("Career-salary freshness");
  console.log(`  careers in catalogue : ${total}`);
  console.log(`  with named sourceUrl : ${withSource} (${pct(withSource)}%)`);
  console.log(`  with lastVerifiedAt  : ${withDate} (${pct(withDate)}%)`);
  console.log(
    `  baseline ${CATALOGUE_BASELINE_VERIFIED_AT} expires in ${daysUntilExpiry} days ` +
      `(max age ${CAREER_DATA_MAX_AGE_DAYS}d)`,
  );

  if (daysUntilExpiry < WARN_DAYS) {
    console.error(
      `::error::Salary catalogue baseline expires in ${daysUntilExpiry} days ` +
        `(< ${WARN_DAYS}). Refresh salaries (SSB StatBank table 11418) and bump ` +
        `CATALOGUE_BASELINE_VERIFIED_AT in src/lib/career-data-recency.ts.`,
    );
    process.exit(1);
  }

  console.log(`OK — more than ${WARN_DAYS} days of runway.`);
  process.exit(0);
}

main();
