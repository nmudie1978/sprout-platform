/**
 * Rate Limiting Utility
 *
 * Simple in-memory rate limiting for development.
 * For production, use Upstash Redis or similar.
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, maxRequests: 60 } // 60 req/min default
): { success: boolean; limit: number; remaining: number; reset: number } {
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

/**
 * Get rate limit headers
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
