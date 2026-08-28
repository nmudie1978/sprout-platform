/**
 * The signed-in user's effective entitlements.
 *
 * Client components call this instead of reasoning about licences. It is the
 * only entitlement data that ever reaches the browser, and it is shaped as
 * capabilities — never as plan names — so no UI can start branching on
 * "is this the Enterprise plan?".
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { getUserEntitlements } from "@/lib/entitlements/service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("UNAUTHORIZED", "Sign in to continue.");

  const entitlements = await getUserEntitlements(session.user.id);

  return NextResponse.json({
    modules: entitlements.modules,
    subscriptionTier: entitlements.subscriptionTier,
    organisations: entitlements.organisations.map((org) => ({
      organisationId: org.organisationId,
      organisationName: org.organisationName,
      organisationSlug: org.organisationSlug,
      role: org.role,
      // The licence id and plan name stay server-side. The client needs to
      // know which organisations a user belongs to and what they can do —
      // not the commercial terms behind it.
    })),
  });
}
