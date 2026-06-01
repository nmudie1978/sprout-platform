export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch available shadow hosts.
//
// Hosts were previously verified job-poster (employer) accounts. Those have
// been removed from Endeavrly, so there are no hosts to return. The endpoint
// is kept as a no-op until the wider shadowing feature is retired in its own
// pass.
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json([]);
}
