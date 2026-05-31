/**
 * Retry transient database failures once.
 *
 * In production DATABASE_URL points at the Supabase transaction pooler
 * (:6543, pgbouncer=true). On serverless cold starts and under load,
 * interactive transactions can fail with transient connection / pool /
 * transaction-timeout errors. A single retry turns most of these
 * user-visible 500s into successes.
 *
 * Mirrors the helper proven out in the signup route; extracted here so
 * other transactional writes (e.g. setting the primary career goal) can
 * reuse the same behaviour.
 */

// Prisma transient error codes: can't-reach-db, connection issues, pool
// timeout, and interactive-transaction errors (P2028).
const TRANSIENT_DB_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1008",
  "P1017",
  "P2024",
  "P2028",
]);

export function isTransientDbError(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  if (code && TRANSIENT_DB_CODES.has(code)) return true;
  const msg = (err as { message?: string })?.message?.toLowerCase() ?? "";
  return (
    msg.includes("can't reach database") ||
    msg.includes("connection") ||
    msg.includes("timed out") ||
    msg.includes("transaction") ||
    msg.includes("too many")
  );
}

/**
 * Run `fn`, and if it throws a transient DB error, wait briefly and try
 * once more. Non-transient errors are rethrown immediately.
 *
 * Safe only for idempotent work (upserts, updateMany, deterministic
 * writes) — the primary-goal transaction qualifies.
 */
export async function withDbRetry<T>(fn: () => Promise<T>, delayMs = 250): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!isTransientDbError(err)) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return fn();
  }
}
