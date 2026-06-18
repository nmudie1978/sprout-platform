import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import { logAuditAction } from "@/lib/safety";
import { AuditAction, UserRole } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

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

// Writes the freshly-loaded (or cached) user fields onto the JWT. A missing or
// soft-deleted user marks the token revoked so the session callback blanks the id.
function applySessionFieldsToToken(token: JWT, dbUser: SessionUserFields): void {
  if (!dbUser || dbUser.deletedAt) {
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
          email: profile.email,
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Normalise email so login matches regardless of how the user
        // typed it (case / surrounding spaces). Accounts are stored
        // lowercased at signup — see /api/auth/signup.
        const email = credentials.email.trim().toLowerCase();

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
          where: { email: vippsProfile.email },
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
      // If the URL is already a full URL (starts with http), use it
      if (url.startsWith("http")) {
        return url;
      }
      // If it's a relative URL, append to baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Default to baseUrl
      return baseUrl;
    },
    async jwt({ token, user, account, profile, trigger }) {
      if (user) {
        // Sign-in: seed identity and load all session fields once (force-fresh
        // so the cache reflects this login). These also feed the edge
        // middleware, which can't hit the DB and reads them from the JWT.
        token.id = user.id;
        token.email = user.email;
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
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // When a new OAuth user is created, set up their initial state
      // This runs after PrismaAdapter creates the user
      if (user.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: "VIPPS",
            accountStatus: "ONBOARDING",
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
