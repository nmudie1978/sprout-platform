/**
 * Formats SCB percentile figures as a Swedish monthly salary string.
 *
 * Style deliberately matches the hand-curated entries so generated and
 * curated figures read identically — a user should not be able to tell which
 * is which from the prose, only from the provenance label.
 *
 * Swedish convention: space as the thousands separator, en-dash
 * for the range, monthly ("kr/mån") not annual. Never annualise to match the
 * Norwegian convention; Swedish pay is quoted as månadslön.
 */
export interface SekPercentiles {
  p10: number;
  p90: number;
  median?: number;
}

// A PLAIN space (U+0020), matching the 52 hand-curated Swedish strings
// exactly. A non-breaking space would typeset better, but the point is that
// generated and curated figures are indistinguishable in the UI — so the
// generator follows the existing data rather than improving on it.
const THIN = " ";

function sv(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, THIN);
}

export function formatSekMonthlyRange({ p10, p90, median }: SekPercentiles): string {
  if (!(p10 > 0) || !(p90 > 0)) throw new Error(`non-positive salary: ${p10}-${p90}`);
  if (p10 > p90) throw new Error(`reversed salary range: ${p10} > ${p90}`);
  const range = `${sv(p10)}–${sv(p90)} kr/mån`;
  return median ? `${range} (median ca ${sv(median)} kr/mån)` : range;
}
