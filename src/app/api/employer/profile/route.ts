export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  companyName: z.string().min(1).max(120).optional(),
  website: z.string().url().max(300).nullish(),
  companyLogo: z.string().url().max(500).nullish(),
  bio: z.string().max(2000).nullish(),
  phoneNumber: z.string().max(40).nullish(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(profile);
    // Add cache headers - employer profile is user-specific
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error("Failed to fetch employer profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { companyName, website, companyLogo, bio, phoneNumber } = parsed.data;

    const profile = await prisma.employerProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(companyName !== undefined ? { companyName } : {}),
        website: website || null,
        companyLogo: companyLogo || null,
        bio: bio || null,
        phoneNumber: phoneNumber || null,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to update employer profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
