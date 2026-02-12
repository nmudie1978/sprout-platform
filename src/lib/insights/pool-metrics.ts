/**
 * Pool Observability / Metrics
 *
 * Lightweight console-based logging for verification and batch serving.
 * Pool metadata file (pool-metadata.json) acts as the persistent metrics store.
 */

import type { PoolMetadata } from "./pool-types";

export function logVerificationResult(
  domain: string,
  passed: boolean,
  errorType?: string,
): void {
  const status = passed ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  const suffix = errorType ? ` (${errorType})` : "";
  console.log(`  ${status} ${domain}${suffix}`);
}

export function logBatchServed(
  batchSize: number,
  excludeCount: number,
  relaxedConstraints?: string[],
): void {
  const relaxed =
    relaxedConstraints && relaxedConstraints.length > 0
      ? ` [relaxed: ${relaxedConstraints.join(", ")}]`
      : "";
  console.log(
    `[insights-pool] Served batch of ${batchSize} (excluded ${excludeCount})${relaxed}`,
  );
}

export function getPoolHealthSummary(meta: PoolMetadata): string {
  const lines = [
    `Pool Health Summary`,
    `  Total items: ${meta.totalItems}`,
    `  Verified: ${meta.totalVerified}`,
    `  Failed: ${meta.totalFailed}`,
    `  Pending: ${meta.totalPending}`,
    `  Duplicates rejected: ${meta.duplicatesRejected}`,
    `  Last refresh: ${meta.lastRefreshISO}`,
    ``,
    `  By type:`,
    ...Object.entries(meta.byType).map(([t, n]) => `    ${t}: ${n}`),
    ``,
    `  By domain (top 10):`,
    ...Object.entries(meta.byDomain)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([d, n]) => `    ${d}: ${n}`),
  ];
  return lines.join("\n");
}
