/**
 * The one way feature code should ask about access.
 *
 * Section 22 of the spec asks that entitlement checks not be scattered
 * through the application. This file is the countermeasure: a route or page
 * that needs a capability calls one function here and never learns what a
 * licence, a plan or a subscription is.
 *
 *   // API route
 *   const gate = await requireModule(EntitlementModule.CAREER_TWIN);
 *   if (!gate.ok) return gate.response;
 *
 *   // Server component
 *   const canUseTwin = await userHasModule(session.user.id, EntitlementModule.CAREER_TWIN);
 *
 * NOTE ON EXISTING FEATURES: none of the surfaces that shipped before this
 * layer are gated. Every one of them is in PLATFORM_BASELINE_MODULES, so
 * wrapping them would be a no-op today — and a liability tomorrow, because a
 * future edit to the baseline would silently switch off a feature real users
 * already rely on. Gate NEW capabilities; leave the existing product alone.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { EntitlementModule } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

import { getModuleDefinition } from "./modules";
import { getUserEntitlements } from "./service";

export type ModuleGate =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Authenticate and confirm the caller holds `module`.
 *
 * A missing entitlement is 403 with a stable `FORBIDDEN` code and a message
 * naming the capability, so the client can show something better than
 * "something went wrong".
 */
export async function requireModule(module: EntitlementModule): Promise<ModuleGate> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, response: apiError("UNAUTHORIZED", "Sign in to continue.") };
  }

  const entitlements = await getUserEntitlements(session.user.id);
  if (!entitlements.modules.includes(module)) {
    const definition = getModuleDefinition(module);
    return {
      ok: false,
      response: apiError(
        "FORBIDDEN",
        `${definition.label} isn't available on your account.`,
        { details: { module } }
      ),
    };
  }

  return { ok: true, userId: session.user.id };
}

/** Predicate form, for server components deciding whether to render something. */
export async function userHasModule(
  userId: string,
  module: EntitlementModule
): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId);
  return entitlements.modules.includes(module);
}

/**
 * Every module the caller holds. For a page that renders several optional
 * surfaces and would otherwise make one round-trip per check.
 */
export async function currentUserModules(): Promise<EntitlementModule[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return (await getUserEntitlements(session.user.id)).modules;
}
