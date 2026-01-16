import { UserRole, AgeBracket } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      ageBracket?: AgeBracket | null;
      youthProfile?: {
        displayName: string;
        profileVisibility: boolean;
      } | null;
      employerProfile?: {
        companyName: string;
      } | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
    ageBracket?: AgeBracket | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    email: string;
  }
}
