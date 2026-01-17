import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { email, industries, frequency } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (!industries || industries.length === 0) {
      return NextResponse.json({ error: "Select at least one industry" }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      // Update existing subscription
      const updated = await prisma.newsletterSubscription.update({
        where: { email },
        data: {
          industries,
          frequency: frequency || "weekly",
          isActive: true,
          unsubscribedAt: null,
          userId: session?.user?.id || existing.userId,
        },
      });
      return NextResponse.json({ success: true, subscription: updated, updated: true });
    }

    // Create new subscription
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email,
        industries,
        frequency: frequency || "weekly",
        userId: session?.user?.id,
        confirmedAt: new Date(), // Auto-confirm for now
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

// DELETE - Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await prisma.newsletterSubscription.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Not subscribed" }, { status: 404 });
    }
    console.error("Error unsubscribing:", error);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}

// GET - Check subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || session?.user?.email;

    if (!email) {
      return NextResponse.json({ isSubscribed: false });
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    return NextResponse.json({
      isSubscribed: !!subscription?.isActive,
      subscription: subscription
        ? {
            industries: subscription.industries,
            frequency: subscription.frequency,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ error: "Failed to check subscription" }, { status: 500 });
  }
}
