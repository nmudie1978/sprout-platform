import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { AmbientLightBackground } from "@/components/ui/ambient-light-background";
import { AmbientBackdrop } from "@/components/ui/ambient-backdrop";
import { ThemeTallyPing } from "@/components/theme-tally-ping";
import { ReportModal } from "@/components/report-modal";
import { CompareHost } from "@/components/compare/compare-host";
import { isAcceptanceCurrent } from "@/lib/legal/versions";
import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";
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

  // Acceptance + display name are both cached on the JWT (refreshed on a
  // throttle in the auth jwt() callback), so this render needs no DB query.
  // Re-prompt for consent when there's no acceptance OR the stored versions
  // are behind the current Terms/Privacy versions (GDPR Art. 7). The accept
  // flow calls session update() so a fresh acceptance surfaces immediately.
  if (!isAcceptanceCurrent(session.user.legalAcceptance)) {
    redirect("/legal/accept");
  }

  const displayName =
    session.user.role === "YOUTH"
      ? session.user.youthProfile?.displayName || null
      : null;
  const userProfilePic: string | null = null;

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

      {/* Ambient presence — faint drifting blobs + a slow breathing glow so
          the app never feels dead at rest. Sits above the light canvas but
          behind content (z-0), pointer-events-none, reduced-motion-safe.
          Time-of-day warmth is applied client-side. */}
      <AmbientBackdrop />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Main content with bottom padding for mobile nav. The language
            switcher now lives as an icon in the dashboard header (next to the
            walkthrough control) rather than a persistent top bar. */}
        {/* Soft email-verification nudge. `emailVerified` rides on the JWT
            (refreshed on the same throttle as every other session field), so
            this costs no query, and clears itself within a minute of the user
            confirming. Never a blocker — see VerifyEmailBanner. */}
        {session.user.emailVerified === false && <VerifyEmailBanner />}

        <main id="main-content" className="flex-1 pb-bottom-nav">{children}</main>

        {/* Global compare experience — persistent shortlist, floating pill,
            compare modal, and the "you now have 3 — compare?" prompt. Youth
            only (teachers don't have career exploration). */}
        {session.user.role === "YOUTH" && <CompareHost />}

        {/* Footer with legal links — hidden on mobile.
            Transparent in light mode so the canvas gradient shows
            through continuously; dark mode keeps a subtle lift. */}
        <footer className="hidden lg:block py-4 mt-8 border-t border-border dark:border-white/10">
          <div className="px-6">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground dark:text-white/85 [&>a]:inline-flex [&>a]:min-h-[40px] [&>a]:items-center lg:[&>a]:min-h-0">
              <Link href="/legal/terms" className="hover:text-foreground dark:hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-foreground dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/legal/safety" className="hover:text-foreground dark:hover:text-white transition-colors">
                Safety
              </Link>
              <ReportModal
                targetType="PLATFORM"
                trigger={
                  <button
                    type="button"
                    className="hover:text-foreground dark:hover:text-white transition-colors"
                  >
                    Report a concern
                  </button>
                }
              />
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

      {/* Mobile bottom nav is mounted globally in `providers.tsx`, which wraps
          the root layout and therefore already covers every route in this
          group (plus the authenticated routes outside it). It used to be
          mounted here as well, so every dashboard page rendered TWO stacked
          `fixed bottom-0 z-50` navs — duplicate event handlers, and a second
          identical navigation landmark announced to screen readers. */}

      {/* Anonymous dark/light tally — once per session, signed-in only. */}
      <ThemeTallyPing />
    </div>
  );
}
