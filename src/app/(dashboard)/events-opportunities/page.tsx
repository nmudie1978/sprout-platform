import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EventsOpportunitiesView } from "./events-opportunities-view";

export const dynamic = "force-dynamic";

/**
 * Server entry: resolve the signed-in user's country (YouthProfile.country)
 * so the Events & Opportunities directory is tailored at first paint — no
 * wrong-country flash. Unknown/missing country → the view shows global sources.
 */
export default async function EventsOpportunitiesPage() {
  const session = await getServerSession(authOptions);

  let country: string | null = null;
  if (session?.user?.id) {
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { country: true },
    });
    country = profile?.country ?? null;
  }

  return <EventsOpportunitiesView country={country} />;
}
