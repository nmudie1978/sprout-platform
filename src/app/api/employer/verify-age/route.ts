import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dateOfBirth } = await req.json();

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: "Date of birth is required" },
        { status: 400 }
      );
    }

    // Calculate age
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json(
        { error: "You must be at least 18 years old to post jobs" },
        { status: 400 }
      );
    }

    // Update employer profile
    const profile = await prisma.employerProfile.update({
      where: { userId: session.user.id },
      data: {
        dateOfBirth: new Date(dateOfBirth),
        ageVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      ageVerified: profile.ageVerified,
    });
  } catch (error) {
    console.error("Age verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify age" },
      { status: 500 }
    );
  }
}
