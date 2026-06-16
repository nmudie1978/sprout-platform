import { UserRole, AgeBracket, AccountStatus } from "@prisma/client";
import { DefaultSession } from "next-auth";

// VIPPS profile data passed through session
interface VippsProfileData {
  name?: string;
  phone?: string;
  birthdate?: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      ageBracket?: AgeBracket | null;
      accountStatus?: AccountStatus;
      isVerifiedAdult?: boolean;
      // VIPPS OAuth fields
      isNewVippsUser?: boolean;
      vippsProfile?: VippsProfileData;
      youthProfile?: {
        displayName: string;
        profileVisibility: boolean;
        guardianConsent: boolean;
        /** YouthProfile.country — drives country-aware localization (e.g. Spain). */
        country?: string | null;
      } | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role?: UserRole; // Optional for OAuth users during initial sign-up
    ageBracket?: AgeBracket | null;
    accountStatus?: AccountStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: UserRole; // Optional for OAuth users during initial sign-up
    email: string;
    accountStatus?: AccountStatus;
    // Age + consent fields — surfaced so middleware (edge runtime,
    // no DB access) can gate minor traffic without a round-trip.
    // Populated on sign-in; stale until token refresh. Safe in the
    // "consent just granted" direction (user sees temporary block,
    // never accidental access). See src/middleware.ts guardian gate.
    ageBracket?: AgeBracket | null;
    guardianConsent?: boolean;
    isVerifiedAdult?: boolean;
    // Full user fields cached on the token so the session() callback needs no
    // per-request DB query. Refreshed on a throttle in the jwt() callback.
    youthProfile?: {
      displayName: string;
      profileVisibility: boolean;
      guardianConsent: boolean;
      country?: string | null;
    } | null;
    // Set when the account is soft-deleted/missing at the last refresh — the
    // session() callback blanks the user id so the request reads as signed-out.
    revoked?: boolean;
    // VIPPS OAuth fields
    isNewVippsUser?: boolean;
    vippsProfile?: VippsProfileData;
  }
}
