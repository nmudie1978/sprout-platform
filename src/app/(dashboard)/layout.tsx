import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navigation } from "@/components/navigation";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";

// Dynamic rendering needed for auth, but allow short revalidation
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get current pathname to avoid redirect loops
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";

  // Only redirect employers if they're NOT already on an employer page
  if (session.user.role === "EMPLOYER" && !pathname.startsWith("/employer")) {
    redirect("/employer/dashboard");
  }

  // Run legal check and profile fetch in parallel instead of sequentially
  const [legalAcceptance, profileData] = await Promise.all([
    prisma.legalAcceptance.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
    session.user.role === "YOUTH"
      ? prisma.youthProfile.findUnique({
          where: { userId: session.user.id },
          select: { avatarId: true, displayName: true },
        })
      : session.user.role === "EMPLOYER"
        ? prisma.employerProfile.findUnique({
            where: { userId: session.user.id },
            select: { companyName: true, companyLogo: true },
          })
        : Promise.resolve(null),
  ]);

  if (!legalAcceptance) {
    redirect("/legal/accept");
  }

  let userAvatarId: string | null = null;
  let displayName: string | null = null;
  let userProfilePic: string | null = null;

  if (session.user.role === "YOUTH" && profileData && "avatarId" in profileData) {
    userAvatarId = profileData.avatarId || null;
    displayName = profileData.displayName || null;
  } else if (session.user.role === "EMPLOYER" && profileData && "companyName" in profileData) {
    displayName = profileData.companyName || null;
    userProfilePic = profileData.companyLogo || null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        userRole={session.user.role}
        userName={displayName || session.user.email || "User"}
        userEmail={session.user.email || undefined}
        userAvatarId={userAvatarId}
        userProfilePic={userProfilePic}
      />
      {/* Main content with bottom padding for mobile nav */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <AiChatWidget />

      {/* Footer with legal links - hidden on mobile since we have bottom nav */}
      <footer className="hidden md:block border-t py-6 mt-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <Link href="/legal/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/legal/safety" className="hover:text-foreground transition-colors">
              Safety
            </Link>
            <Link href="/legal/eligibility" className="hover:text-foreground transition-colors">
              Eligibility
            </Link>
            <Link href="/legal/disclaimer" className="hover:text-foreground transition-colors">
              Disclaimer
            </Link>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            © {new Date().getFullYear()} Sprout. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
