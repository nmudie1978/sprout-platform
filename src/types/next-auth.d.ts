import { UserRole, AgeBracket, AccountStatus } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      ageBracket?: AgeBracket | null;
      accountStatus?: AccountStatus;
      isVerifiedAdult?: boolean;
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
    role: UserRole;
    ageBracket?: AgeBracket | null;
    accountStatus?: AccountStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    email: string;
    accountStatus?: AccountStatus;
  }
}
