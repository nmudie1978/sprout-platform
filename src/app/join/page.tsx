import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { JoinClient } from "./join-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join a programme — Endeavrly",
  robots: "noindex, nofollow",
};

/**
 * The one institutional surface an ordinary user ever meets.
 *
 * Nothing here is required. A young person can use Endeavrly for years and
 * never visit this page. It exists only for someone who has been handed a
 * code by their school, their advisor or an event.
 */
export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // Preserve the code/token through sign-in so the young person doesn't
    // have to find the email again after registering.
    const query = new URLSearchParams();
    if (params.code) query.set("code", params.code);
    if (params.token) query.set("token", params.token);
    const callback = `/join${query.toString() ? `?${query.toString()}` : ""}`;
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callback)}`);
  }

  return <JoinClient initialCode={params.code ?? ""} invitationToken={params.token ?? null} />;
}
