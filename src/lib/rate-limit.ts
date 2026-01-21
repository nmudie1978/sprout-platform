/**
 * Rate Limiting Utility
 *
 * Production-ready rate limiting with Upstash Redis support.
 * Falls back to in-memory for development or when Redis is not configured.
 *
 * CRITICAL: For multi-instance deployments, Redis MUST be configured.
 * In-memory rate limiting does NOT work across multiple server instances.
 */

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
// REDIS CLIENT (Upstash)
// ============================================

// Lazy-loaded Redis client
let redisClient: {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
} | null = null;

let redisConfigured: boolean | null = null;

/**
 * Check if Redis is configured
 */
function isRedisConfigured(): boolean {
  if (redisConfigured !== null) return redisConfigured;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisConfigured = !!(url && token && url.length > 0 && token.length > 0);

  if (!redisConfigured && process.env.NODE_ENV === "production") {
    console.warn(
      "[Rate Limit] WARNING: Redis not configured in production. " +
      "Rate limiting will not work across multiple instances. " +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    );
  }

  return redisConfigured;
}

/**
 * Get or create Redis client.
 *
 * NOTE: @upstash/redis must be installed for Redis support.
 * Run: npm install @upstash/redis
 *
 * When Redis is not installed, falls back to in-memory rate limiting.
 */
async function getRedisClient() {
  if (!isRedisConfigured()) return null;
  if (redisClient) return redisClient;

  try {
    // Use require() wrapped in a function to bypass Next.js/webpack static analysis
    // This allows the build to succeed without @upstash/redis installed
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const dynamicRequire = new Function("moduleName", "return require(moduleName)");
    const upstashModule = dynamicRequire("@upstash/redis");
    const Redis = upstashModule.Redis;

    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    return redisClient;
  } catch (error: unknown) {
    // Handle case where @upstash/redis is not installed
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("Cannot find module") || errorMessage.includes("MODULE_NOT_FOUND")) {
      console.warn(
        "[Rate Limit] @upstash/redis not installed. Using in-memory rate limiting. " +
        "Run 'npm install @upstash/redis' for Redis support."
      );
    } else {
      console.error("[Rate Limit] Failed to initialize Redis client:", error);
    }
    redisConfigured = false;
    return null;
  }
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
  redis: NonNullable<typeof redisClient>,
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
} as const;
