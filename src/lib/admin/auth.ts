import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { isAdminTokenRevoked, revokeAdminToken } from "./token-denylist";

const ADMIN_SESSION_COOKIE = "endeavrly_admin_session";
const SESSION_EXPIRY_DAYS = 7;

// Get secrets from environment
function getAdminUsername(): string {
  const username = process.env.ADMIN_USERNAME;
  if (!username) {
    throw new Error("ADMIN_USERNAME environment variable is not set");
  }
  return username;
}

function getAdminPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error("ADMIN_PASSWORD_HASH environment variable is not set");
  }
  return hash;
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  username: string;
  iat: number;
  exp: number;
}

/**
 * Check if all required admin env vars are configured
 */
export function checkAdminEnvVars(): { configured: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!process.env.ADMIN_USERNAME) {
    missing.push("ADMIN_USERNAME");
  }
  if (!process.env.ADMIN_PASSWORD_HASH) {
    missing.push("ADMIN_PASSWORD_HASH");
  }
  if (!process.env.ADMIN_SESSION_SECRET) {
    missing.push("ADMIN_SESSION_SECRET");
  }

  return {
    configured: missing.length === 0,
    missing,
  };
}

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const envCheck = checkAdminEnvVars();
  if (!envCheck.configured) {
    return false;
  }

  try {
    const adminUsername = getAdminUsername();
    const adminPasswordHash = getAdminPasswordHash();

    // Check username
    if (username !== adminUsername) {
      return false;
    }

    // Verify password against hash
    const isValid = await bcrypt.compare(password, adminPasswordHash);
    return isValid;
  } catch {
    return false;
  }
}

/**
 * Create a signed admin session token
 */
export async function createAdminSession(username: string): Promise<string> {
  const secret = getSessionSecret();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);

  return token;
}

/**
 * Verify admin session token
 */
export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret);

    // Reject tokens that were revoked via logout. The denylist is a
    // no-op when Redis isn't configured (dev/preview) — production
    // is guarded by the rate-limit lib's hard-fail on missing Redis.
    if (await isAdminTokenRevoked(token)) {
      return null;
    }

    return {
      username: payload.username as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

/**
 * Set admin session cookie (HTTP-only, secure)
 */
export async function setAdminSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Get admin session from cookie
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    return verifyAdminSession(token);
  } catch {
    return null;
  }
}

/**
 * Clear admin session cookie AND revoke the token server-side.
 *
 * Without the revocation step, a stolen cookie remains usable until
 * `exp` (7 days). We verify the token (quietly — ignoring failures so
 * logout is always idempotent), read its `exp`, and write it to the
 * Redis denylist with a TTL that matches.
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (existing) {
    try {
      const secret = getSessionSecret();
      const { payload } = await jwtVerify(existing, secret);
      const exp = typeof payload.exp === "number" ? payload.exp : 0;
      if (exp > 0) {
        await revokeAdminToken(existing, exp);
      }
    } catch {
      // Token was already invalid/expired — nothing to revoke.
    }
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

/**
 * Check if request has valid admin session
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null;
}
