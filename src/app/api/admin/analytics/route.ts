export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLaunchStats } from "@/lib/admin/launch-stats";

// Admin emails that can access analytics (in addition to role === "ADMIN").
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  "admin@endeavrly.no",
].filter(Boolean);

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const isAdmin =
      session?.user?.role === "ADMIN" ||
      ADMIN_EMAILS.includes(session?.user?.email || "");

    if (!session || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getLaunchStats();

    const response = NextResponse.json(stats);
    // Launch stats are aggregate-heavy; cache briefly.
    response.headers.set(
      "Cache-Control",
      "private, max-age=300, stale-while-revalidate=120",
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch launch statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
