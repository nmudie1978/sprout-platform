export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimitAsync, RateLimits } from "@/lib/rate-limit";

// Security/legal: every action is scoped to the signed-in user's OWN account
// email. The endpoint never trusts a client-supplied address, so nobody can
// subscribe / unsubscribe / enumerate a third party's email, and writes are
// rate-limited. (Double opt-in is a separate follow-up; the address used is
// already the verified account email.)

// POST - Subscribe the current user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Please sign in to subscribe." }, { status: 401 });
    }

    const rl = await checkRateLimitAsync(`newsletter:${session.user.id}`, RateLimits.STRICT);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const body = await request.json();
    const { industries, frequency } = body;
    if (!Array.isArray(industries) || industries.length === 0) {
      return NextResponse.json({ error: "Select at least one industry" }, { status: 400 });
    }

    const email = session.user.email;
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email },
      update: {
        industries,
        frequency: frequency || "weekly",
        isActive: true,
        unsubscribedAt: null,
        userId: session.user.id,
      },
      create: {
        email,
        industries,
        frequency: frequency || "weekly",
        userId: session.user.id,
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

// DELETE - Unsubscribe the current user
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    await prisma.newsletterSubscription.updateMany({
      where: { email: session.user.email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}

// GET - Current user's own subscription status (no arbitrary email lookup)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ isSubscribed: false });
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email: session.user.email },
    });

    return NextResponse.json({
      isSubscribed: !!subscription?.isActive,
      subscription: subscription
        ? { industries: subscription.industries, frequency: subscription.frequency }
        : null,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ error: "Failed to check subscription" }, { status: 500 });
  }
}
