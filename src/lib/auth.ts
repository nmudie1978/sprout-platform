import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import { logAuditAction } from "@/lib/safety";
import { AuditAction, UserRole } from "@prisma/client";
import type { JWT } from "next-auth/jwt";
import { checkRateLimitAsync, resetRateLimit, RateLimits } from "@/lib/rate-limit";
import { normaliseEmail } from "@/lib/auth/email-verification";
import { blocksSession, unverifiedSignInError } from "@/lib/auth/verification-gate";
import {
  HANDOFF_TOKEN_TTL_MS,
  grantSecret,
  readHandoffToken,
  verificationSatisfiesGrant,
} from "@/lib/auth/signin-grant";
import { notifyAccountEvent } from "@/lib/account-notify";

// Helper to calculate age from birthdate
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// VIPPS profile data structure from OAuth
interface VippsProfile {
  name?: string;
  email?: string;
  phone_number?: string;
  birthdate?: string; // YYYY-MM-DD format
  address?: {
    street_address?: string;
    postal_code?: string;
    region?: string;
    country?: string;
  };
}

// ── Session user-field cache ────────────────────────────────────────────────
// The session() callback used to run a nested user.findUnique on EVERY
// authenticated request (every useSession()/getServerSession()/`/api/auth/
// session`). We now serve those fields from the JWT, refreshed from the DB at
// most once per SESSION_REFRESH_MS per user per server instance via this tiny
// in-memory cache. A soft-deleted/suspended account therefore loses its session
// within that window rather than instantly — an acceptable trade for removing a
// per-request query. Explicit changes (the client `update()` trigger) force a
// fresh read so they surface immediately.
const SESSION_REFRESH_MS = 60 * 1000;

async function loadSessionFields(userId: string) {
  // LegalAcceptance has no Prisma relation to User (it's keyed by a unique
  // userId), so fetch it alongside and cache it on the JWT. The dashboard
  // layout then reads acceptance from the session instead of issuing its own
  // legalAcceptance query on every navigation.
  const [user, legalAcceptance] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        ageBracket: true,
        accountStatus: true,
        isVerifiedAdult: true,
        deletedAt: true,
        // Moderation state. Loaded here so suspension is enforced at the one
        // chokepoint every authenticated request already passes through.
        isPaused: true,
        // Watermark for evicting sessions issued before a password reset.
        passwordChangedAt: true,
        // Drives the "confirm your email" banner. Cached on the JWT with
        // everything else so the banner costs no per-navigation query, and
        // refreshes within SESSION_REFRESH_MS of the user confirming.
        emailVerified: true,
        youthProfile: {
          select: {
            displayName: true,
            profileVisibility: true,
            guardianConsent: true,
          },
        },
      },
    }),
    prisma.legalAcceptance.findUnique({
      where: { userId },
      select: { termsVersion: true, privacyVersion: true },
    }),
  ]);
  if (!user) return null;
  return { ...user, legalAcceptance };
}

type SessionUserFields = Awaited<ReturnType<typeof loadSessionFields>>;

const sessionFieldCache = new Map<string, { at: number; data: SessionUserFields }>();

async function getSessionFields(userId: string, forceFresh = false): Promise<SessionUserFields> {
  const now = Date.now();
  if (!forceFresh) {
    const cached = sessionFieldCache.get(userId);
    if (cached && now - cached.at < SESSION_REFRESH_MS) return cached.data;
  }
  const data = await loadSessionFields(userId);
  // Bound memory under unexpected load — entries are tiny, but never unbounded.
  if (sessionFieldCache.size > 10_000) sessionFieldCache.clear();
  sessionFieldCache.set(userId, { at: now, data });
  return data;
}

/** Account states that must not hold a usable session. */
function isAccountBlocked(user: {
  accountStatus: string;
  isPaused: boolean;
  deletedAt: Date | null;
}): boolean {
  return (
    user.deletedAt !== null ||
    user.isPaused ||
    user.accountStatus === "SUSPENDED" ||
    user.accountStatus === "BANNED"
  );
}

// Writes the freshly-loaded (or cached) user fields onto the JWT. A missing or
// soft-deleted user marks the token revoked so the session callback blanks the id.
function applySessionFieldsToToken(token: JWT, dbUser: SessionUserFields): void {
  if (!dbUser || dbUser.deletedAt) {
    token.revoked = true;
    return;
  }
  // SUSPENSION ENFORCEMENT. The admin panel and the safeguarding-report queue
  // both "suspend" an account by setting isPaused / accountStatus, and until
  // now nothing read either back — a young person suspended for harmful
  // behaviour kept full access to the product. Revoking here means every
  // `!session.user.id` guard in the app treats them as signed out, and the
  // change takes effect within SESSION_REFRESH_MS. ONBOARDING and
  // PENDING_VERIFICATION are deliberately NOT revoked: those users still need
  // to reach the profile-completion flow.
  if (isAccountBlocked(dbUser)) {
    token.revoked = true;
    return;
  }
  // SESSION INVALIDATION ON PASSWORD RESET. Sessions are stateless 30-day
  // JWTs, so without this a reset changed the password but left anyone holding
  // a stolen session token signed in for the rest of the month — exactly the
  // situation a reset is meant to end. `authTime` is stamped once at sign-in
  // (the jwt callback below) and never moves, unlike `iat`, which NextAuth
  // refreshes on every token rotation.
  if (dbUser.passwordChangedAt) {
    const authTime = typeof token.authTime === "number" ? token.authTime : 0;
    if (dbUser.passwordChangedAt.getTime() > authTime) {
      token.revoked = true;
      return;
    }
  }
  // The same gate, applied to sessions that already exist. Without this, the
  // hard gate would only bind at sign-in and anyone holding a 30-day JWT from
  // before it landed would keep full access for a month. Revoking here means
  // the policy takes effect within SESSION_REFRESH_MS for everyone.
  if (blocksSession(dbUser)) {
    token.revoked = true;
    return;
  }
  token.revoked = false;
  token.role = dbUser.role;
  token.ageBracket = dbUser.ageBracket;
  token.accountStatus = dbUser.accountStatus;
  token.isVerifiedAdult = dbUser.isVerifiedAdult;
  token.guardianConsent = dbUser.youthProfile?.guardianConsent ?? false;
  token.youthProfile = dbUser.youthProfile ?? null;
  token.legalAcceptance = dbUser.legalAcceptance ?? null;
  // Boolean, not the timestamp — the banner only needs "confirmed or not", and
  // a JWT is readable by anyone holding it, so we put the minimum on it.
  token.emailVerified = dbUser.emailVerified !== null;
}

// ── Credentials sign-in brute-force throttle ────────────────────────────────
// The credentials callback is a public endpoint that verifies a bcrypt hash,
// so without a throttle it is an offline-speed password oracle for any account
// whose email address an attacker knows. Two Redis-backed buckets (per account
// and per source IP) are checked before the hash comparison, and both are
// cleared on success. Redis-backed means the limit holds across Vercel's
// multiple instances; see src/lib/rate-limit.ts.
const LOGIN_THROTTLE_MESSAGE =
  "Too many sign-in attempts. Please wait a few minutes and try again.";

/** Best-effort client IP from the sign-in request. */
function loginClientIp(req: unknown): string {
  const headers = (req as { headers?: Record<string, string | string[] | undefined> })?.headers;
  const raw = headers?.["x-forwarded-for"] ?? headers?.["x-real-ip"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.split(",")[0]?.trim() || "unknown";
}

function loginBuckets(email: string, ip: string): { account: string; ip: string } {
  return { account: `login:account:${email}`, ip: `login:ip:${ip}` };
}

/**
 * Throws when either bucket is exhausted. Fails OPEN on an unexpected internal
 * error — a throttle outage must not lock every user out of the product.
 */
async function assertLoginAllowed(email: string, ip: string): Promise<void> {
  let denied = false;
  try {
    const buckets = loginBuckets(email, ip);
    const [account, source] = await Promise.all([
      checkRateLimitAsync(buckets.account, RateLimits.LOGIN_PER_ACCOUNT),
      checkRateLimitAsync(buckets.ip, RateLimits.LOGIN_PER_IP),
    ]);
    denied = !account.success || !source.success;
  } catch (error) {
    console.error("[Auth] Login throttle check failed, allowing:", error);
    return;
  }
  // Thrown outside the try so a genuine denial can't be swallowed as an
  // "internal error" and turned into an allow.
  if (denied) throw new Error(LOGIN_THROTTLE_MESSAGE);
}

/** Wipe both counters after a verified sign-in. */
async function clearLoginThrottle(email: string, ip: string): Promise<void> {
  const buckets = loginBuckets(email, ip);
  await Promise.all([resetRateLimit(buckets.account), resetRateLimit(buckets.ip)]).catch(() => {});
}

export const authOptions: NextAuthOptions = {
  // PrismaAdapter for OAuth providers (VIPPS)
  // Note: credentials provider doesn't use the adapter
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // VIPPS OAuth Provider
    {
      id: "vipps",
      name: "Vipps",
      type: "oauth",
      wellKnown: "https://api.vipps.no/access-management-1.0/access/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "openid name email phoneNumber birthDate address",
        },
      },
      clientId: process.env.VIPPS_CLIENT_ID,
      clientSecret: process.env.VIPPS_CLIENT_SECRET,
      idToken: true,
      checks: ["pkce", "state"],
      profile(profile: VippsProfile & { sub: string }) {
        // Email is required from VIPPS
        if (!profile.email) {
          throw new Error("Email is required from VIPPS");
        }
        return {
          id: profile.sub,
          name: profile.name || undefined,
          // NORMALISE. Postgres unique indexes are case-sensitive, so an
          // address handed back as "Foo@Bar.com" would not collide with the
          // stored "foo@bar.com" — the adapter would happily create a SECOND
          // account for the same person. Credentials signup/signin have always
          // lowercased; this path had not, which made it the one way to get
          // two Endeavrly accounts on one address.
          email: normaliseEmail(profile.email),
          image: null,
        };
      },
    },
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Bound the work an unauthenticated caller can make us do. bcrypt is
        // deliberately slow, so an oversized password field is a cheap way to
        // burn server CPU; bcrypt only reads the first 72 bytes anyway.
        if (credentials.password.length > 200 || credentials.email.length > 320) {
          throw new Error("Invalid credentials");
        }

        // Normalise email so login matches regardless of how the user
        // typed it (case / surrounding spaces). Accounts are stored
        // lowercased at signup — see /api/auth/signup.
        const email = credentials.email.trim().toLowerCase();

        // Brute-force guard — BEFORE the DB lookup and the bcrypt compare, so
        // a throttled attacker costs us neither.
        const ip = loginClientIp(req);
        await assertLoginAllowed(email, ip);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // A suspended or banned account must not be able to sign back in.
        // Checked AFTER the password so this can't be used to probe which
        // addresses belong to moderated accounts. Note `deletedAt` is
        // deliberately not part of this — a user-requested deletion is
        // restorable by signing in, which is handled just below.
        if (
          user.isPaused ||
          user.accountStatus === "SUSPENDED" ||
          user.accountStatus === "BANNED"
        ) {
          throw new Error(
            "This account is currently suspended. Please contact support if you think that's a mistake."
          );
        }

        // EMAIL-VERIFICATION HARD GATE. An account whose address has never
        // been confirmed cannot sign in.
        //
        // Checked AFTER the password, deliberately and for the same reason the
        // suspension check is: reaching this line requires already knowing the
        // password, so the distinct error cannot be used to discover which
        // addresses have accounts or which are unconfirmed. Ordering it before
        // the password compare would turn it into exactly that oracle.
        //
        // The failed-attempt counters are NOT cleared on this path — the
        // credentials were right, but no session is issued, so treating it as
        // a successful sign-in would hand an attacker a free throttle reset.
        if (blocksSession(user)) {
          throw unverifiedSignInError();
        }

        // Verified sign-in — drop the failed-attempt counters so a user who
        // mistyped a couple of times isn't penalised afterwards.
        await clearLoginThrottle(email, ip);

        // Soft-deleted account: signing back in within the 30-day grace
        // window cancels the pending deletion and restores the account.
        if (user.deletedAt) {
          await prisma.user.update({
            where: { id: user.id },
            data: { deletedAt: null },
          });
          await logAuditAction({
            userId: user.id,
            action: AuditAction.DATA_DELETION_CANCELLED,
            metadata: { email: user.email, restoredAt: new Date().toISOString() },
          }).catch(() => {});
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
    // ── Post-verification handoff ────────────────────────────────────────
    // The provider behind "you confirmed your email, so you're in" — used by
    // the Check your email screen when it notices the link has been clicked,
    // and by the confirmation screen itself when that happens in the same
    // browser. Without it, a user who has just proved both that they know the
    // password (they chose it 60 seconds ago) and that they own the inbox is
    // still made to type the password again, on a screen that gives no sign
    // anything happened.
    //
    // It accepts NO password and NO address. The only credential is a
    // two-minute token that /api/auth/verification-status will mint only for a
    // browser holding the sealed grant cookie from its own signup, and only
    // once that account's confirmation has landed. Everything that makes this
    // safe is documented in src/lib/auth/signin-grant.ts; the checks below are
    // the second, independent enforcement of it, so a flaw in the status route
    // alone cannot mint a session.
    CredentialsProvider({
      id: "verification-handoff",
      name: "Email confirmation",
      credentials: {
        token: { label: "Handoff token", type: "text" },
      },
      async authorize(credentials, req) {
        const secret = grantSecret();
        if (!secret || !credentials?.token) throw new Error("Invalid credentials");

        // Cheap guard on an unauthenticated endpoint: the token is an HMAC and
        // therefore unguessable, but the attempt shouldn't be free either.
        const ip = loginClientIp(req);
        const attempts = await checkRateLimitAsync(
          `verification-handoff:ip:${ip}`,
          RateLimits.STRICT,
        ).catch(() => null);
        if (attempts && !attempts.success) throw new Error(LOGIN_THROTTLE_MESSAGE);

        const handoff = readHandoffToken(credentials.token, { secret });
        if (!handoff) throw new Error("Invalid credentials");

        // SINGLE USE. The token's nonce is burned in the shared rate limiter,
        // so the same token can't mint a second session. Best-effort: on a
        // Redis outage this falls back to per-instance memory, which leaves
        // replay possible within the token's two-minute life — the same
        // fail-open posture as the login throttle, and a far smaller exposure
        // than locking every new signup out of the product.
        const burn = await checkRateLimitAsync(`verification-handoff:token:${handoff.nonce}`, {
          interval: HANDOFF_TOKEN_TTL_MS,
          maxRequests: 1,
        }).catch(() => null);
        if (burn && !burn.success) throw new Error("Invalid credentials");

        const user = await prisma.user.findUnique({
          where: { id: handoff.userId },
          select: {
            id: true,
            email: true,
            role: true,
            emailVerified: true,
            accountStatus: true,
            isPaused: true,
            deletedAt: true,
          },
        });
        if (!user) throw new Error("Invalid credentials");

        // Re-checked here, not merely trusted from the status route: the
        // confirmation must post-date the grant, or signing up with someone
        // else's already-confirmed address would be a way into their account.
        if (!verificationSatisfiesGrant(user.emailVerified, handoff.grantIssuedAt)) {
          throw new Error("Invalid credentials");
        }

        // Same account-state refusals as the password path. A deleted account
        // is NOT restored here — that is a deliberate act by someone who knows
        // the password, not something a signup-flow cookie should trigger.
        if (
          user.deletedAt ||
          user.isPaused ||
          user.accountStatus === "SUSPENDED" ||
          user.accountStatus === "BANNED"
        ) {
          throw new Error("Invalid credentials");
        }

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/complete-profile", // Redirect new OAuth users here
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle VIPPS OAuth sign-in
      if (account?.provider === "vipps" && profile) {
        const vippsProfile = profile as VippsProfile & { sub: string };

        // Validate age if birthdate is provided
        if (vippsProfile.birthdate) {
          const birthDate = new Date(vippsProfile.birthdate);
          const age = calculateAge(birthDate);

          // Reject users under 15
          if (age < 15) {
            return "/auth/error?error=AgeRestriction&message=You must be at least 15 years old to use this platform";
          }
        }

        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
          // Same normalisation as the profile() callback above, or this
          // lookup misses the existing account and we link nothing.
          where: { email: normaliseEmail(vippsProfile.email) },
          include: { accounts: true },
        });

        if (existingUser) {
          // Check if VIPPS account is already linked
          const hasVippsAccount = existingUser.accounts.some(
            (acc) => acc.provider === "vipps"
          );

          if (!hasVippsAccount) {
            // Link VIPPS account to existing user and update profile data
            const updateData: Record<string, unknown> = {
              authProvider: "VIPPS",
              phoneVerified: !!vippsProfile.phone_number,
              phoneVerifiedAt: vippsProfile.phone_number ? new Date() : null,
            };

            if (vippsProfile.name) {
              updateData.fullName = vippsProfile.name;
            }
            if (vippsProfile.phone_number) {
              updateData.phoneNumber = vippsProfile.phone_number;
            }
            if (vippsProfile.birthdate) {
              updateData.dateOfBirth = new Date(vippsProfile.birthdate);
            }

            await prisma.user.update({
              where: { id: existingUser.id },
              data: updateData,
            });
          }
        }

        return true;
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // OPEN-REDIRECT GUARD. `url` comes from the `callbackUrl` query
      // parameter, i.e. straight from the attacker in a phishing link such as
      // /api/auth/signin?callbackUrl=https://evil.example. This callback used
      // to return any absolute http(s) URL verbatim, which turned Endeavrly's
      // own sign-in page into a redirector to arbitrary sites — a credible
      // phishing vector against young users, who are exactly the audience
      // least likely to re-check the address bar after signing in.
      //
      // Rule now: relative paths are resolved against our own origin; absolute
      // URLs are allowed ONLY when they are on that same origin; anything else
      // falls back to the dashboard/home.

      // Protocol-relative ("//evil.example") and backslash ("/\evil") forms
      // are browser-absolute despite starting with "/", so screen them first.
      if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) {
        return `${baseUrl}${url}`;
      }

      try {
        const target = new URL(url, baseUrl);
        if (target.origin === new URL(baseUrl).origin) {
          return target.toString();
        }
      } catch {
        // Unparseable — fall through to the safe default.
      }

      return baseUrl;
    },
    async jwt({ token, user, account, profile, trigger }) {
      if (user) {
        // Sign-in: seed identity and load all session fields once (force-fresh
        // so the cache reflects this login). These also feed the edge
        // middleware, which can't hit the DB and reads them from the JWT.
        token.id = user.id;
        token.email = user.email;
        // Fixed for the life of this session — see the password-reset check in
        // applySessionFieldsToToken.
        token.authTime = Date.now();
        applySessionFieldsToToken(token, await getSessionFields(user.id, true));
      } else if (trigger === "update" && token.id) {
        // Explicit client update() (e.g. after a guardian grants consent or a
        // profile change) — refresh immediately so new values surface without
        // requiring a re-login.
        applySessionFieldsToToken(token, await getSessionFields(token.id as string, true));
      } else if (token.id) {
        // Every other authenticated request: serve from the cache, which hits
        // the DB at most once per SESSION_REFRESH_MS per user.
        applySessionFieldsToToken(token, await getSessionFields(token.id as string));
      }

      // Store VIPPS profile data for new users (sign-in only).
      if (account?.provider === "vipps" && profile) {
        const vippsProfile = profile as VippsProfile & { sub: string };
        token.vippsProfile = {
          name: vippsProfile.name,
          phone: vippsProfile.phone_number,
          birthdate: vippsProfile.birthdate,
        };
        // accountStatus was just loaded above for the signing-in user.
        if (token.accountStatus === "ONBOARDING") {
          token.isNewVippsUser = true;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add user data from token to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;

        // Pass VIPPS-specific flags
        if (token.isNewVippsUser) {
          session.user.isNewVippsUser = true;
        }
        if (token.vippsProfile) {
          session.user.vippsProfile = token.vippsProfile as {
            name?: string;
            phone?: string;
            birthdate?: string;
          };
        }

        // All user fields are served from the JWT (refreshed on a throttle in
        // the jwt callback via the session-field cache) — no per-request DB
        // query. A revoked token (account soft-deleted or missing at the last
        // check) blanks the id so every `!session.user.id` guard treats the
        // request as unauthenticated; signing in again restores a soft-deleted
        // account (see authorize()).
        if (token.revoked) {
          session.user.id = "";
        } else {
          session.user.role = token.role as UserRole;
          session.user.ageBracket = token.ageBracket;
          session.user.accountStatus = token.accountStatus;
          session.user.isVerifiedAdult = token.isVerifiedAdult;
          session.user.youthProfile = token.youthProfile ?? null;
          session.user.legalAcceptance = token.legalAcceptance ?? null;
          session.user.emailVerified = token.emailVerified ?? false;
        }
      }
      return session;
    },
  },
  events: {
    /**
     * Operator notification on every successful sign-in that isn't the
     * operator's own. Fire-and-forget: `notifyAccountEvent` never throws, and
     * it is deliberately NOT awaited so a slow mail provider can't add
     * latency to someone's login.
     */
    async signIn({ user }) {
      if (!user?.email) return;
      void notifyAccountEvent({
        kind: "signin",
        email: user.email,
        role: (user as { role?: string }).role ?? null,
      }).then((outcome) => {
        if (!outcome.sent && outcome.reason === "MAIL_FAILED") {
          console.warn("[account-notify] sign-in notification failed:", outcome.error);
        }
      });
    },
    async createUser({ user }) {
      // When a new OAuth user is created, set up their initial state
      // This runs after PrismaAdapter creates the user
      if (user.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: "VIPPS",
            accountStatus: "ONBOARDING",
            // VIPPS is a BankID-backed identity provider and only releases an
            // address it has already confirmed, so there is nothing for us to
            // verify. Stamping it here keeps the "confirm your email" banner
            // away from users who never signed up with a password at all.
            emailVerified: new Date(),
          },
        });

        // Log the account creation
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "ACCOUNT_CREATED",
            targetType: "user",
            targetId: user.id,
            metadata: { provider: "VIPPS" },
          },
        });
      }
    },
  },
  session: {
    strategy: "jwt", // Changed from "database" to "jwt" for credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development
};
