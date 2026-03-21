export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { locales, LOCALE_COOKIE, type Locale } from "@/i18n/config";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const locale = body.locale as string;

    if (!locale || !(locales as readonly string[]).includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true, locale });

    // Set cookie (1-year expiry, lax same-site)
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      path: "/",
    });

    // Persist to DB for logged-in users
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.userPreferences.upsert({
        where: { userId: session.user.id },
        update: { preferredLocale: locale },
        create: {
          userId: session.user.id,
          preferredLocale: locale,
        },
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to set locale" },
      { status: 500 }
    );
  }
}
