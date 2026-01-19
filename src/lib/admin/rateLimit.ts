/**
 * Simple in-memory rate limiter for admin login
 * Limits login attempts per IP to prevent brute force attacks
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

// In-memory store (will reset on server restart - acceptable for MVP)
const loginAttempts = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5; // Maximum attempts before lockout
const WINDOW_MS = 15 * 60 * 1000; // 15 minute window
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minute lockout

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback - in development, use a constant
  return "127.0.0.1";
}

/**
 * Check if IP is currently rate limited
 */
export function isRateLimited(ip: string): {
  limited: boolean;
  retryAfter?: number;
  remainingAttempts?: number;
} {
  const entry = loginAttempts.get(ip);
  const now = Date.now();

  if (!entry) {
    return { limited: false, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if locked out
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfter = Math.ceil((entry.lockedUntil - now) / 1000);
    return { limited: true, retryAfter };
  }

  // Check if window has expired (reset attempts)
  if (now - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return { limited: false, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    // Apply lockout
    entry.lockedUntil = now + LOCKOUT_MS;
    const retryAfter = Math.ceil(LOCKOUT_MS / 1000);
    return { limited: true, retryAfter };
  }

  return {
    limited: false,
    remainingAttempts: MAX_ATTEMPTS - entry.attempts,
  };
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) {
    loginAttempts.set(ip, {
      attempts: 1,
      firstAttempt: now,
      lockedUntil: null,
    });
    return;
  }

  // If window expired, start fresh
  if (now - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, {
      attempts: 1,
      firstAttempt: now,
      lockedUntil: null,
    });
    return;
  }

  // Increment attempts
  entry.attempts++;

  // Apply lockout if max reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
  }
}

/**
 * Clear rate limit for IP (on successful login)
 */
export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Format retry time for user display
 */
export function formatRetryTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}
