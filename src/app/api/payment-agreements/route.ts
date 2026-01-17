/**
 * Payment Agreement API
 *
 * IMPORTANT: This is INFORMATIONAL ONLY - NO money moves through the platform.
 * Payment agreements record the terms agreed upon between parties.
 * Actual payments happen externally (Vipps, cash, bank transfer).
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentAgreementStatus } from "@prisma/client";

// GET /api/payment-agreements?conversationId=xxx
// Get payment agreement for a conversation
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = req.nextUrl.searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participant1Id: true,
        participant2Id: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.participant1Id !== session.user.id &&
      conversation.participant2Id !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get payment agreement
    const agreement = await prisma.paymentAgreement.findUnique({
      where: { conversationId },
      include: {
        markedPaidBy: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!agreement) {
      return NextResponse.json({ agreement: null });
    }

    return NextResponse.json({
      agreement: {
        id: agreement.id,
        paymentMethod: agreement.paymentMethod,
        agreedAmount: agreement.agreedAmount,
        currency: agreement.currency,
        status: agreement.status,
        markedPaidAt: agreement.markedPaidAt,
        markedPaidBy: agreement.markedPaidBy
          ? {
              id: agreement.markedPaidBy.id,
              role: agreement.markedPaidBy.role,
            }
          : null,
        notes: agreement.notes,
        createdAt: agreement.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to fetch payment agreement:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment agreement" },
      { status: 500 }
    );
  }
}

// POST /api/payment-agreements
// Create or update a payment agreement (INFORMATIONAL ONLY)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, paymentMethod, agreedAmount, notes } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    // Validate payment method
    const validMethods: PaymentMethod[] = ["VIPPS", "CASH", "BANK_TRANSFER"];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Validate amount if provided
    if (agreedAmount !== undefined && agreedAmount !== null) {
      const amount = Number(agreedAmount);
      if (isNaN(amount) || amount < 0 || amount > 100000) {
        return NextResponse.json(
          { error: "Amount must be between 0 and 100,000 NOK" },
          { status: 400 }
        );
      }
    }

    // Validate notes if provided (max 200 chars)
    if (notes && notes.length > 200) {
      return NextResponse.json(
        { error: "Notes cannot exceed 200 characters" },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participant1Id: true,
        participant2Id: true,
        status: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.participant1Id !== session.user.id &&
      conversation.participant2Id !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cannot modify agreement if conversation is frozen
    if (conversation.status === "FROZEN") {
      return NextResponse.json(
        { error: "Cannot modify payment agreement - conversation is frozen" },
        { status: 403 }
      );
    }

    // Check if agreement already exists
    const existingAgreement = await prisma.paymentAgreement.findUnique({
      where: { conversationId },
    });

    let agreement;
    if (existingAgreement) {
      // Update existing agreement
      agreement = await prisma.paymentAgreement.update({
        where: { conversationId },
        data: {
          paymentMethod: paymentMethod as PaymentMethod,
          agreedAmount: agreedAmount !== undefined ? Number(agreedAmount) : undefined,
          notes: notes || undefined,
        },
      });
    } else {
      // Create new agreement
      agreement = await prisma.paymentAgreement.create({
        data: {
          conversationId,
          paymentMethod: paymentMethod as PaymentMethod,
          agreedAmount: agreedAmount !== undefined ? Number(agreedAmount) : null,
          currency: "NOK",
          notes: notes || null,
        },
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        actorId: session.user.id,
        action: "PROFILE_UPDATE" as any, // Using closest existing action
        targetType: "payment_agreement",
        targetId: agreement.id,
        metadata: {
          conversationId,
          paymentMethod,
          agreedAmount: agreedAmount || null,
          action: existingAgreement ? "updated" : "created",
        },
      },
    });

    return NextResponse.json(
      {
        agreement: {
          id: agreement.id,
          paymentMethod: agreement.paymentMethod,
          agreedAmount: agreement.agreedAmount,
          currency: agreement.currency,
          status: agreement.status,
          notes: agreement.notes,
          createdAt: agreement.createdAt,
        },
        message: "Payment agreement saved. Remember: actual payment happens outside the platform.",
      },
      { status: existingAgreement ? 200 : 201 }
    );
  } catch (error) {
    console.error("Failed to save payment agreement:", error);
    return NextResponse.json(
      { error: "Failed to save payment agreement" },
      { status: 500 }
    );
  }
}

// PATCH /api/payment-agreements
// Mark payment as completed (INFORMATIONAL ONLY - no actual transaction)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, markPaid } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participant1Id: true,
        participant2Id: true,
        status: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.participant1Id !== session.user.id &&
      conversation.participant2Id !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the agreement
    const agreement = await prisma.paymentAgreement.findUnique({
      where: { conversationId },
    });

    if (!agreement) {
      return NextResponse.json(
        { error: "No payment agreement found" },
        { status: 404 }
      );
    }

    // Update the agreement status
    const updatedAgreement = await prisma.paymentAgreement.update({
      where: { conversationId },
      data: {
        status: markPaid ? "MARKED_PAID" : "AGREED",
        markedPaidById: markPaid ? session.user.id : null,
        markedPaidAt: markPaid ? new Date() : null,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        actorId: session.user.id,
        action: "PROFILE_UPDATE" as any,
        targetType: "payment_agreement",
        targetId: agreement.id,
        metadata: {
          conversationId,
          action: markPaid ? "marked_paid" : "unmarked_paid",
        },
      },
    });

    return NextResponse.json({
      agreement: {
        id: updatedAgreement.id,
        status: updatedAgreement.status,
        markedPaidAt: updatedAgreement.markedPaidAt,
      },
      message: markPaid
        ? "Payment marked as completed. This is for record-keeping only - payment was made outside the platform."
        : "Payment status reset.",
    });
  } catch (error) {
    console.error("Failed to update payment agreement:", error);
    return NextResponse.json(
      { error: "Failed to update payment agreement" },
      { status: 500 }
    );
  }
}
