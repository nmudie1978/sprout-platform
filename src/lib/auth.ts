import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
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
      // On sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }

      // Store VIPPS profile data for new users
      if (account?.provider === "vipps" && profile) {
        const vippsProfile = profile as VippsProfile & { sub: string };
        token.vippsProfile = {
          name: vippsProfile.name,
          phone: vippsProfile.phone_number,
          birthdate: vippsProfile.birthdate,
        };

        // Check if this is a new user (no role set yet)
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { accountStatus: true },
        });

        if (dbUser?.accountStatus === "ONBOARDING") {
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

        // Fetch fresh user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            ageBracket: true,
            accountStatus: true,
            isVerifiedAdult: true,
            youthProfile: {
              select: {
                displayName: true,
                profileVisibility: true,
                guardianConsent: true,
              },
            },
            employerProfile: {
              select: {
                companyName: true,
                eidVerified: true,
                ageVerified: true,
              },
            },
          },
        });

        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.ageBracket = dbUser.ageBracket;
          session.user.accountStatus = dbUser.accountStatus;
          session.user.isVerifiedAdult = dbUser.isVerifiedAdult;
          session.user.youthProfile = dbUser.youthProfile || null;
          session.user.employerProfile = dbUser.employerProfile || null;
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
