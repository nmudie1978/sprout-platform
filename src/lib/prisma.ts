import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy Prisma client. Instantiating PrismaClient at module-load fails on
// Vercel during the "collect page data" build phase because DATABASE_URL /
// DIRECT_URL aren't populated then — any route that imports this module
// blows up with "Invalid value undefined for datasource db". We defer
// construction behind a Proxy so property access at runtime triggers init
// with a real URL, while build-time module imports stay side-effect-free.
function createClient(): PrismaClient {
  // Runtime queries should use the POOLED connection (DATABASE_URL →
  // Supabase PgBouncer on :6543). The direct connection (DIRECT_URL,
  // :5432) is reserved for `prisma migrate deploy` via the schema's
  // `directUrl`. Preferring DIRECT_URL here forced every serverless query
  // onto the direct connection, exhausting its small limit and causing
  // intermittent connection 500s on cold invocations. Fall back to
  // DIRECT_URL only if DATABASE_URL is somehow absent.
  const pooled = process.env.DATABASE_URL?.trim();
  const direct = process.env.DIRECT_URL?.trim();
  const databaseUrl = pooled || direct;

  // Fail-loud guard. Runtime MUST use the pooled connection (DATABASE_URL →
  // Supabase PgBouncer/Supavisor on :6543). If DATABASE_URL is blank we
  // silently fall back to DIRECT_URL (:5432) — and every serverless instance
  // then opens its own direct connection, saturating Supabase's ~60-connection
  // direct limit. Light reads still squeak through, but multi-query interactive
  // transactions (e.g. the goal switch in /api/goals) can't acquire a
  // connection and 500. This regressed silently once (prod DATABASE_URL was
  // emptied) — surface it loudly so it can't happen quietly again.
  if (process.env.NODE_ENV === 'production' && !pooled && direct) {
    console.error(
      '[prisma] DATABASE_URL is empty in production — falling back to the ' +
      'DIRECT (:5432) connection. Under serverless load this exhausts Supabase\'s ' +
      'direct-connection limit and 500s on heavy transactions. Set DATABASE_URL ' +
      'to the Supabase transaction-pooler URL (:6543, ?pgbouncer=true&connection_limit=1).',
    );
  }

  return new PrismaClient({
    // Only pass the datasources override when we actually have a URL —
    // otherwise Prisma throws at ctor time. When absent, Prisma falls back
    // to its default env-driven resolution and any query will fail with a
    // clear error instead of crashing the import.
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as unknown as object, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

// ============================================
// RLS CONTEXT SUPPORT
// ============================================

/**
 * Execute a database operation with RLS context set.
 * This sets the `app.current_user_id` session variable that RLS policies use.
 *
 * IMPORTANT: Use this for any operations that need RLS enforcement,
 * especially for multi-tenant data isolation.
 *
 * Example:
 * ```ts
 * const reports = await withRLSContext(userId, async (tx) => {
 *   return tx.communityReport.findMany();
 * });
 * ```
 *
 * @param userId - The ID of the current user (for RLS policies)
 * @param operation - The database operation to execute
 * @returns The result of the operation
 */
export async function withRLSContext<T>(
  userId: string | null | undefined,
  operation: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Set the RLS context for this transaction
    if (userId) {
      await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    } else {
      // Clear any existing context if no user
      await tx.$executeRaw`SELECT set_config('app.current_user_id', '', true)`;
    }

    // Execute the operation within the RLS context
    return operation(tx);
  });
}

/**
 * Set RLS context without a transaction.
 * Use this at the start of a request if you need multiple operations
 * but don't want to wrap everything in a transaction.
 *
 * NOTE: This only works for the current connection. In serverless
 * environments with connection pooling, prefer withRLSContext().
 *
 * @param userId - The ID of the current user
 */
export async function setRLSContext(userId: string | null | undefined): Promise<void> {
  if (userId) {
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, false)`;
  } else {
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', '', false)`;
  }
}

/**
 * Clear RLS context after a request.
 * Call this at the end of request handling to ensure clean state.
 */
export async function clearRLSContext(): Promise<void> {
  await prisma.$executeRaw`SELECT set_config('app.current_user_id', '', false)`;
}

/**
 * Check if RLS context is properly set (for debugging/testing)
 */
export async function getRLSContext(): Promise<string | null> {
  const result = await prisma.$queryRaw<[{ current_setting: string }]>`
    SELECT current_setting('app.current_user_id', true) as current_setting
  `;
  return result[0]?.current_setting || null;
}

export default prisma;
