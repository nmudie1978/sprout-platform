/**
 * The ENDEAVRLY_SUPER_ADMIN guard for the internal commercial portal.
 *
 * Reuses the existing Admin Portal session (`endeavrly_admin_session`,
 * ADMIN_USERNAME / ADMIN_PASSWORD_HASH) rather than introducing a second
 * authentication system. Middleware already gates every `/admin/*` page on
 * that cookie; this is the equivalent gate for the `/api/admin/platform/*`
 * routes, which the page matcher does NOT protect on its own.
 *
 * Every mutating platform route must call `requireSuperAdmin` and use the
 * returned actor label for its audit entry, so no commercial change is ever
 * anonymous.
 */

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { apiError } from "@/lib/api-error";
import { superAdminActor } from "@/lib/organisations/audit";

export interface SuperAdminContext {
  username: string;
  /** Audit actor label, e.g. "super-admin:nicky". */
  actor: string;
}

export type SuperAdminResult =
  | { ok: true; context: SuperAdminContext }
  | { ok: false; response: NextResponse };

export async function requireSuperAdmin(): Promise<SuperAdminResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false,
      response: apiError("UNAUTHORIZED", "Endeavrly administrator sign-in required."),
    };
  }
  return {
    ok: true,
    context: { username: session.username, actor: superAdminActor(session.username) },
  };
}
