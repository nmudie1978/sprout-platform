import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin/auth";

export async function POST() {
  try {
    await clearAdminSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Also support GET for direct navigation to /api/admin/logout
export async function GET() {
  try {
    await clearAdminSessionCookie();

    // Redirect to login page
    return NextResponse.redirect(new URL("/admin/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.redirect(new URL("/admin/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }
}
