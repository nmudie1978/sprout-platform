export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllowances } from "@/lib/entitlements/usage";
import { pricingFor } from "@/lib/pricing/plans";

/**
 * GET /api/entitlements
 *
 * The user's plan, allowances and usage — what the account page renders and
 * what any client surface should read rather than inferring a plan for
 * itself. One endpoint so there is a single description of "what may I do",
 * instead of each component assembling its own and drifting.
 *
 * This is a read for display. It is NOT what protects anything: every limit
 * is enforced again in the route that performs the action, because a client
 * can simply not call this.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [allowances, profile] = await Promise.all([
    getAllowances(session.user.id),
    prisma.youthProfile
      .findUnique({ where: { userId: session.user.id }, select: { country: true } })
      .catch(() => null),
  ]);

  const subscription = await prisma.personalSubscription
    .findUnique({
      where: { userId: session.user.id },
      select: {
        tier: true,
        status: true,
        expiresAt: true,
        billingInterval: true,
        currency: true,
        grantedBy: true,
      },
    })
    .catch(() => null);

  const country = profile?.country ?? null;
  const pricing = pricingFor(country);

  return NextResponse.json({
    // Deprecated paid tiers resolve as Pro entitlements, so report them as
    // Pro rather than leaking an internal tier name to the UI.
    plan: allowances.limits.careerExplorations === null ? "PRO" : "FREE",
    country,
    currency: pricing.currency,
    billingInterval: subscription?.billingInterval ?? null,
    expiresAt: subscription?.expiresAt ?? null,
    // Lets the account page explain WHY someone has Pro without paying,
    // rather than showing a subscription they do not remember buying.
    grantedBy: subscription?.grantedBy ?? null,
    allowances: {
      careerExplorations: allowances.careerExplorations,
      careerTwinQuestions: allowances.careerTwinQuestions,
      savedCareers: allowances.savedCareers,
    },
  });
}
