/**
 * Runtime helper for reading the provider URL health report produced
 * by `scripts/validate-provider-urls.ts`. Real-world links generated
 * in `real-world-provider.ts` can call `isProviderHealthy(host)` to
 * decide whether to surface the link directly or substitute a Google
 * search fallback.
 *
 * Loaded once at module init from `data/provider-url-validation.json`.
 * If the file is missing (e.g. before the validator has ever run) the
 * helper assumes every provider is healthy — this is the safe default
 * because surfacing a link that turns out to be broken is a worse UX
 * than always falling back to Google.
 */

import providerHealthData from "../../../data/provider-url-validation.json" assert { type: "json" };

interface ProviderResult {
  host: string;
  label: string;
  status: string;
  httpCode: number | null;
  checkedAt: string;
}

interface ProviderReport {
  generatedAt: string;
  sampleCareer: string;
  results: ProviderResult[];
}

const report = providerHealthData as ProviderReport | undefined;

const HEALTHY_STATUSES = new Set(["LIVE", "REDIRECT"]);

/**
 * Returns `true` if the given provider host is currently healthy
 * according to the most recent validation run. Unknown hosts (never
 * checked) default to healthy so we don't suppress new providers
 * accidentally.
 */
export function isProviderHealthy(host: string): boolean {
  if (!report?.results) return true;
  const hit = report.results.find((r) => r.host === host);
  if (!hit) return true;
  return HEALTHY_STATUSES.has(hit.status);
}

/**
 * Build a Google search fallback URL for a career + intent. Use this
 * when `isProviderHealthy(...)` returns false so the user still ends
 * up on relevant results instead of a 404 from a drifted provider.
 *
 *   googleSearchFallback("carpenter", "courses Norway")
 *   → "https://www.google.com/search?q=carpenter+courses+Norway"
 */
export function googleSearchFallback(career: string, intent: string): string {
  const q = encodeURIComponent(`${career} ${intent}`.trim());
  return `https://www.google.com/search?q=${q}`;
}

/** When the report was last refreshed (ISO). Useful for admin views. */
export function providerHealthGeneratedAt(): string | null {
  return report?.generatedAt ?? null;
}
