import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";

// Dynamic rendering needed for auth
export const dynamic = "force-dynamic";

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

  // Run legal check, profile fetch, and preferences in parallel
  const [legalAcceptance, profileData] = await Promise.all([
    prisma.legalAcceptance.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
    session.user.role === "YOUTH"
      ? prisma.youthProfile.findUnique({
          where: { userId: session.user.id },
          select: { displayName: true },
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

  let displayName: string | null = null;
  let userProfilePic: string | null = null;

  if (session.user.role === "YOUTH" && profileData && "displayName" in profileData) {
    displayName = profileData.displayName || null;
  } else if (session.user.role === "EMPLOYER" && profileData && "companyName" in profileData) {
    displayName = profileData.companyName || null;
    userProfilePic = profileData.companyLogo || null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <SidebarNav
        userRole={session.user.role}
        userName={displayName || session.user.email || "User"}
        userEmail={session.user.email || undefined}
        userProfilePic={userProfilePic}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main content with bottom padding for mobile nav */}
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <AiChatWidget />

        {/* Footer with legal links — hidden on mobile */}
        <footer className="hidden lg:block border-t py-4 mt-8 bg-muted/30">
          <div className="px-6">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
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
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              © {new Date().getFullYear()} Endeavrly. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Mobile bottom nav — visible on mobile only */}
      <MobileBottomNav />
    </div>
  );
}
