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
      } | null;
      employerProfile?: {
        companyName: string;
        eidVerified: boolean;
        ageVerified: boolean;
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
    // VIPPS OAuth fields
    isNewVippsUser?: boolean;
    vippsProfile?: VippsProfileData;
  }
}
