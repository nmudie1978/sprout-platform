import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use DIRECT_URL for Prisma Client operations (Supabase pooled connection doesn't support all operations)
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

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
