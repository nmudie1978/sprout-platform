import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { AmbientLightBackground } from "@/components/ui/ambient-light-background";
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

  // Only redirect employers if they're NOT already on an employer page.
  // Skip the redirect when small-jobs is disabled — /employer/* is
  // itself bounced to /dashboard by middleware in that mode, so the
  // two would otherwise loop. Employers land on /employer-paused
  // instead (handled below).
  const smallJobsEnabled =
    process.env.NEXT_PUBLIC_SMALL_JOBS_ENABLED === "true";
  if (
    smallJobsEnabled &&
    session.user.role === "EMPLOYER" &&
    !pathname.startsWith("/employer")
  ) {
    redirect("/employer/dashboard");
  }
  if (!smallJobsEnabled && session.user.role === "EMPLOYER") {
    redirect("/employer-paused");
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <SidebarNav
        userRole={session.user.role}
        userName={displayName || session.user.email || "User"}
        userEmail={session.user.email || undefined}
        userProfilePic={userProfilePic}
      />

      {/* Glowing divider between sidebar and main content */}
      <div className="hidden lg:block relative z-20 w-px">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/20 to-transparent" />
        <div
          className="absolute inset-0 w-px"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.3) 30%, rgba(20,184,166,0.1) 70%, transparent 100%)',
            boxShadow: '0 0 8px rgba(20,184,166,0.15), 0 0 20px rgba(20,184,166,0.05)',
          }}
        />
      </div>

      {/* Light-mode ambient canvas — calm premium backdrop.
          Rendered once at shell level so every page inherits it. */}
      <AmbientLightBackground />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Main content with bottom padding for mobile nav */}
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <AiChatWidget />

        {/* Footer with legal links — hidden on mobile.
            Transparent in light mode so the canvas gradient shows
            through continuously; dark mode keeps a subtle lift. */}
        <footer className="hidden lg:block py-4 mt-8 border-t border-white/10">
          <div className="px-6">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-white/85">
              <Link href="/legal/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/legal/safety" className="hover:text-white transition-colors">
                Safety
              </Link>
              <Link href="/legal/eligibility" className="hover:text-white transition-colors">
                Eligibility
              </Link>
              <Link href="/legal/disclaimer" className="hover:text-white transition-colors">
                Disclaimer
              </Link>
            </div>
            <p className="text-center text-[10px] text-white/70 mt-2">
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
