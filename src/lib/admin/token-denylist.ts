/**
 * Admin JWT denylist (revocation list).
 *
 * The admin session token is a stateless JWT signed with
 * ADMIN_SESSION_SECRET and stored in an HttpOnly cookie. Clearing the
 * cookie on logout removes it from the browser, but the token itself
 * remains cryptographically valid until `exp`. If the cookie is
 * stolen (XSS, leaked log, compromised dev machine) the attacker
 * retains admin access for up to 7 days.
 *
 * This module adds a Redis-backed revocation list: on logout we store
 * a hash of the token with a TTL equal to the token's remaining life,
 * and every `verifyAdminSession` consults the list before trusting
 * the JWT.
 *
 * If Redis isn't configured the denylist is a no-op — the rate-limit
 * library now hard-fails in production without Redis, so this branch
 * only matters in local dev and previews.
 *
 * Shares the single node-redis connection (REDIS_URL) owned by the
 * rate-limit module rather than opening its own.
 */

import { createHash } from "crypto";
import { getRedisClient } from "@/lib/rate-limit";

function key(token: string): string {
  const h = createHash("sha256").update(token).digest("hex");
  return `admin-denylist:${h}`;
}

/**
 * Record a token as revoked. `expEpochSeconds` is the JWT's `exp`
 * claim — the denylist entry expires at the same moment, so there is
 * no point holding it longer.
 */
export async function revokeAdminToken(
  token: string,
  expEpochSeconds: number,
): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const ttl = Math.max(60, expEpochSeconds - nowSeconds);
  try {
    await client.set(key(token), "1", { EX: ttl });
  } catch (err) {
    console.error("[admin-denylist] revoke failed:", err);
  }
}

/**
 * Check if a token has been revoked. Returns true if the token is
 * denylisted (and must therefore be rejected).
 */
export async function isAdminTokenRevoked(token: string): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) return false;
  try {
    const hit = await client.get(key(token));
    return hit != null;
  } catch (err) {
    // Fail open in dev, fail closed in prod — an unreachable Redis
    // shouldn't lock every admin out of the app, but we also shouldn't
    // silently trust tokens that may have been revoked.
    console.error("[admin-denylist] lookup failed:", err);
    return process.env.NODE_ENV === "production";
  }
}
