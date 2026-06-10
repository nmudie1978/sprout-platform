/**
 * Rate Limiting Utility
 *
 * Production-ready rate limiting backed by Redis over TCP (node-redis),
 * configured via a single REDIS_URL connection string (e.g. the Vercel
 * Redis / Redis Cloud integration). Falls back to in-memory for local
 * development or when REDIS_URL is not set.
 *
 * CRITICAL: For multi-instance deployments, Redis MUST be configured.
 * In-memory rate limiting does NOT work across multiple server instances.
 *
 * Runtime note: this module opens a TCP connection and therefore must only
 * be imported from Node.js-runtime code (API route handlers), never from
 * Edge middleware.
 */

import { createClient, type RedisClientType } from "redis";

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// ============================================
// REDIS CLIENT (node-redis over REDIS_URL)
// ============================================

let redisConfigured: boolean | null = null;

/**
 * Check if Redis is configured. Hard-fails in production so a misconfigured
 * deploy can't silently run on bypassable in-memory limits.
 */
function isRedisConfigured(): boolean {
  if (redisConfigured !== null) return redisConfigured;

  const url = process.env.REDIS_URL;
  redisConfigured = !!(url && url.length > 0);

  // Hard-fail in production. In-memory rate limiting does NOT survive
  // Vercel's multi-instance runtime — rate limits on signup, reports,
  // AI endpoints etc. become bypassable at scale. If this assertion
  // fires in production, stop the deploy and set REDIS_URL
  // (RATE_LIMIT_ALLOW_IN_MEMORY=true is the explicit escape hatch for
  // a one-off test deploy only). Previews/dev stay on in-memory.
  if (!redisConfigured && process.env.NODE_ENV === "production") {
    const vercelEnv = process.env.VERCEL_ENV;
    const isProdDeploy = vercelEnv === undefined || vercelEnv === "production";
    const escapeHatch = process.env.RATE_LIMIT_ALLOW_IN_MEMORY === "true";

    if (isProdDeploy && !escapeHatch) {
      throw new Error(
        "[Rate Limit] Redis is not configured in production. " +
        "Set REDIS_URL, or set RATE_LIMIT_ALLOW_IN_MEMORY=true to acknowledge the risk."
      );
    }

    console.warn(
      "[Rate Limit] WARNING: Redis not configured. In-memory limits " +
      "do not work across instances — preview/dev only."
    );
  }

  return redisConfigured;
}

// Module-scoped singleton. On Vercel this is reused across warm invocations,
// so we open at most one TCP+TLS connection per running instance.
let redisClient: RedisClientType | null = null;
let connectPromise: Promise<RedisClientType | null> | null = null;

/**
 * Get or lazily create a connected node-redis client.
 * Returns null when Redis is unconfigured or the connection fails (the
 * caller then falls back to in-memory).
 *
 * Exported so other server-only modules (e.g. the admin token denylist)
 * share this single connection rather than opening their own.
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!isRedisConfigured()) return null;
  if (redisClient?.isOpen) return redisClient;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      const client: RedisClientType = createClient({
        url: process.env.REDIS_URL!,
        socket: {
          // Bounded backoff so a flaky connection can't spin forever.
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
          connectTimeout: 5000,
        },
      });
      // Swallow async errors so an unhandled 'error' event can't crash the
      // function; ops below already fall back to in-memory on failure.
      client.on("error", (err) => {
        console.error("[Rate Limit] Redis client error:", err);
      });
      await client.connect();
      redisClient = client;
      return client;
    } catch (error) {
      console.error("[Rate Limit] Failed to connect to Redis:", error);
      redisClient = null;
      return null;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}

// ============================================
// IN-MEMORY FALLBACK
// ============================================

// In-memory store (fallback for development or when Redis is unavailable)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes (only for in-memory)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * In-memory rate limit check (fallback)
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // No existing record or expired
  if (!record || now > record.resetAt) {
    const resetAt = now + config.interval;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: resetAt,
    };
  }

  // Increment count
  record.count++;

  // Check if over limit
  if (record.count > config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    reset: record.resetAt,
  };
}

// ============================================
// REDIS RATE LIMIT
// ============================================

/**
 * Redis-based rate limit check
 */
async function checkRateLimitRedis(
  redis: RedisClientType,
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const intervalSeconds = Math.ceil(config.interval / 1000);

  try {
    // Increment counter
    const count = await redis.incr(key);

    // Set expiry on first request
    if (count === 1) {
      await redis.expire(key, intervalSeconds);
    }

    // Get TTL for reset time
    const ttl = await redis.ttl(key);
    const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : config.interval);

    const success = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);

    return {
      success,
      limit: config.maxRequests,
      remaining,
      reset: resetAt,
    };
  } catch (error) {
    console.error("[Rate Limit] Redis error, falling back to in-memory:", error);
    // Fall back to in-memory on Redis error
    return checkRateLimitInMemory(identifier, config);
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Check if request should be rate limited.
 * Uses Redis when configured, falls back to in-memory.
 *
 * @param identifier - Unique identifier for the rate limit bucket (e.g., "chat:userId")
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimitAsync(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, maxRequests: 60 }
): Promise<RateLimitResult> {
  const redis = await getRedisClient();

  if (redis) {
    return checkRateLimitRedis(redis, identifier, config);
  }

  return checkRateLimitInMemory(identifier, config);
}

/**
 * Synchronous rate limit check (in-memory only).
 * Use checkRateLimitAsync when possible for Redis support.
 *
 * @deprecated Use checkRateLimitAsync for production deployments
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, maxRequests: 60 }
): RateLimitResult {
  // Log warning in production if Redis isn't configured
  if (process.env.NODE_ENV === "production" && !isRedisConfigured()) {
    console.warn(
      `[Rate Limit] Using in-memory rate limiting for "${identifier}". ` +
      "This does not work across multiple instances."
    );
  }

  return checkRateLimitInMemory(identifier, config);
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": Math.floor(reset / 1000).toString(),
  };
}

/**
 * Preset rate limit configs
 */
export const RateLimits = {
  // Strict: 10 requests per minute (e.g., login attempts)
  STRICT: { interval: 60000, maxRequests: 10 },

  // Standard: 60 requests per minute (e.g., general API)
  STANDARD: { interval: 60000, maxRequests: 60 },

  // Generous: 120 requests per minute (e.g., read-only endpoints)
  GENEROUS: { interval: 60000, maxRequests: 120 },

  // AI Chat: 20 messages per hour (expensive)
  AI_CHAT: { interval: 3600000, maxRequests: 20 },

  // Questions: 3 per day (already implemented in API)
  QUESTIONS: { interval: 86400000, maxRequests: 3 },

  // Timeline generation: 5 per hour (AI-generated career timelines)
  TIMELINE_GENERATION: { interval: 3600000, maxRequests: 5 },

  // ─── Monthly per-user OpenAI quotas (cost control) ───────────────
  // These sit on top of the short-window rate limits above. They cap
  // total spend per user over a 30-day rolling window so a single
  // account can't drain the monthly OpenAI budget. Numbers are
  // deliberately generous for legitimate users — tune down if budget
  // becomes tight.
  AI_MONTHLY_TIMELINE: { interval: 30 * 24 * 3600_000, maxRequests: 20 },
  AI_MONTHLY_NARRATE: { interval: 30 * 24 * 3600_000, maxRequests: 600 },
  AI_MONTHLY_CAREER_PATHS: { interval: 30 * 24 * 3600_000, maxRequests: 10 },
} as const;
