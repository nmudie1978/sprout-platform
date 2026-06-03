import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
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
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Teacher role keeps to its own surface: /teacher/*, /profile, and
  // /feedback. Landing anywhere else (dashboard, my-journey, careers)
  // bounces them to the teacher home. They don't have a Journey or
  // career recommendations — those are youth-only experiences.
  const teacherAllowedPrefixes = ["/teacher", "/profile", "/feedback", "/info", "/legal"];
  if (
    session.user.role === "TEACHER" &&
    !teacherAllowedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    redirect("/teacher/dashboard");
  }

  // Conversely: youth and admins should not be able to reach
  // /teacher/* surfaces directly.
  if (
    pathname.startsWith("/teacher") &&
    session.user.role !== "TEACHER"
  ) {
    redirect("/dashboard");
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
      : Promise.resolve(null),
  ]);

  if (!legalAcceptance) {
    redirect("/legal/accept");
  }

  let displayName: string | null = null;
  let userProfilePic: string | null = null;

  if (session.user.role === "YOUTH" && profileData && "displayName" in profileData) {
    displayName = profileData.displayName || null;
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
        {/* Main content with bottom padding for mobile nav. The language
            switcher now lives as an icon in the dashboard header (next to the
            walkthrough control) rather than a persistent top bar. */}
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>

        {/* Footer with legal links — hidden on mobile.
            Transparent in light mode so the canvas gradient shows
            through continuously; dark mode keeps a subtle lift. */}
        <footer className="hidden lg:block py-4 mt-8 border-t border-border dark:border-white/10">
          <div className="px-6">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground dark:text-white/85">
              <Link href="/legal/terms" className="hover:text-foreground dark:hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-foreground dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/legal/safety" className="hover:text-foreground dark:hover:text-white transition-colors">
                Safety
              </Link>
              <Link href="/legal/eligibility" className="hover:text-foreground dark:hover:text-white transition-colors">
                Eligibility
              </Link>
              <Link href="/legal/disclaimer" className="hover:text-foreground dark:hover:text-white transition-colors">
                Disclaimer
              </Link>
            </div>
            <p className="text-center text-[10px] text-muted-foreground/70 dark:text-white/70 mt-2">
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
