"use client";

/**
 * MOBILE BOTTOM NAV
 *
 * 5-item bottom bar + a "More" bottom sheet drawer that mirrors the
 * desktop sidebar's full navigation tree. The bar exposes the four
 * highest-priority destinations (Home, Journey, Careers, Jobs) and the
 * fifth slot opens a drawer containing every section group the sidebar
 * has: Yours, Explore, Account, Endeavrly, plus theme toggle and sign
 * out. This gives mobile parity with desktop so features like My
 * Career Radar, My Small Jobs, Youth Events, AI Advisor, Profile,
 * About, Feedback and User Reviews are all reachable from the phone.
 *
 * Roles:
 * - YOUTH — bar shows Home / Journey / Careers / Jobs / More. The More
 *   drawer surfaces everything the sidebar youth section has.
 * - EMPLOYER — bar shows Home / Post / Messages / Settings / More.
 *   The More drawer surfaces Browse Talent, Support.
 * - COMMUNITY_GUARDIAN — bar shows Guardian / Jobs / Profile / More.
 *
 * Touch targets are minimum 44x44 per WCAG. The drawer scrolls
 * internally so it remains usable on small viewports (360–430 px).
 */

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Home,
  Briefcase,
  MessageSquare,
  User,
  PlusCircle,
  LayoutDashboard,
  Route,
  Compass,
  Search,
  Shield,
  Radar,
  FileText,
  Calendar,
  BarChart3,
  Bot,
  Info,
  HelpCircle,
  Quote,
  MoreHorizontal,
  Sun,
  Moon,
  LogOut,
  Settings,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SMALL_JOBS_ENABLED } from "@/lib/feature-flags";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

// ── Types ────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activePattern?: RegExp;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Bottom bar primary items — 5 slots ──────────────────────────────

// The fifth slot is always the More drawer trigger; the first four are
// real navigation links so common destinations are one-tap away.
// Fourth youth slot pivots with the small-jobs flag. With jobs on,
// it's the Jobs tab (highest-frequency youth action). With jobs off,
// it's the Career Radar (the next-most-active personal surface).
const youthBarItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/my-journey", label: "Journey", icon: Route, activePattern: /^\/my-journey/ },
  { href: "/careers", label: "Careers", icon: Compass, activePattern: /^\/careers(?!\/radar)/ },
  SMALL_JOBS_ENABLED
    ? { href: "/jobs", label: "Jobs", icon: Search, activePattern: /^\/jobs/ }
    : { href: "/careers/radar", label: "Radar", icon: Radar, activePattern: /^\/careers\/radar/ },
];

const employerBarItems: NavItem[] = [
  { href: "/employer/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/employer/post-job", label: "Post", icon: PlusCircle },
  { href: "/messages", label: "Messages", icon: MessageSquare, activePattern: /^\/messages/ },
  { href: "/employer/talent", label: "Talent", icon: Users, activePattern: /^\/employer\/talent/ },
];

const guardianBarItems: NavItem[] = [
  { href: "/guardian", label: "Guardian", icon: Shield },
  { href: "/jobs", label: "Jobs", icon: Briefcase, activePattern: /^\/jobs/ },
  { href: "/profile", label: "Profile", icon: User, activePattern: /^\/profile/ },
];

// ── More drawer — full section tree, mirrored from sidebar-nav ──────

const youthDrawerSections: NavSection[] = [
  {
    title: "Yours",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/my-journey", label: "My Journey", icon: Route },
      { href: "/careers/radar", label: "My Career Radar", icon: Radar },
      ...(SMALL_JOBS_ENABLED
        ? [{ href: "/applications", label: "My Small Jobs", icon: FileText }]
        : []),
    ],
  },
  {
    title: "Explore",
    items: [
      { href: "/careers", label: "Explore Careers", icon: Compass },
      { href: "/career-events", label: "Youth Events", icon: Calendar },
      { href: "/insights", label: "Industry Insights", icon: BarChart3 },
      { href: "/career-advisor", label: "AI Advisor", icon: Bot },
    ],
  },
  ...(SMALL_JOBS_ENABLED
    ? [{
        title: "Small Jobs",
        items: [{ href: "/jobs", label: "Browse Jobs", icon: Search }],
      }]
    : []),
  {
    title: "Account",
    items: [{ href: "/profile", label: "Profile", icon: User }],
  },
  {
    title: "Endeavrly",
    items: [
      { href: "/info", label: "About", icon: Info },
      { href: "/feedback", label: "Feedback", icon: HelpCircle },
      { href: "/reviews", label: "User Reviews", icon: Quote },
    ],
  },
];

const employerDrawerSections: NavSection[] = [
  {
    title: "Manage",
    items: [
      { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/employer/post-job", label: "Post Job", icon: PlusCircle },
      { href: "/employer/talent", label: "Browse Talent", icon: Compass },
      { href: "/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/employer/settings", label: "Settings", icon: Settings },
      { href: "/feedback", label: "Support", icon: HelpCircle },
    ],
  },
];

const guardianDrawerSections: NavSection[] = [
  {
    title: "Guardian",
    items: [
      { href: "/guardian", label: "Guardian Dashboard", icon: Shield },
      ...(SMALL_JOBS_ENABLED
        ? [{ href: "/jobs", label: "Small Jobs", icon: Briefcase }]
        : []),
      { href: "/profile", label: "Profile", icon: User },
    ],
  },
  {
    title: "Endeavrly",
    items: [
      { href: "/info", label: "About", icon: Info },
      { href: "/feedback", label: "Feedback", icon: HelpCircle },
    ],
  },
];

const adminDrawerSections: NavSection[] = [
  {
    title: "Admin",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/questions", label: "Moderate Q&A", icon: MessageSquare },
      { href: "/insights", label: "Insights", icon: TrendingUp },
    ],
  },
];

// ── More drawer component ────────────────────────────────────────────

function MobileMoreMenu({
  sections,
  pathname,
  onNavigate,
}: {
  sections: NavSection[];
  pathname: string;
  onNavigate: () => void;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <SheetContent
      side="bottom"
      className="h-[85vh] max-h-[85vh] rounded-t-2xl border-t border-border/40 bg-background p-0 overflow-hidden flex flex-col"
    >
      {/* Drawer header — matches the calm youth-first visual weight */}
      <div className="shrink-0 px-5 pt-4 pb-3 border-b border-border/30">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/20" />
        <h2 className="text-base font-semibold text-foreground/90">Menu</h2>
      </div>

      {/* Scrollable section list — ensures every section is reachable
          on small viewports (360–430 px) without trapping focus. */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
              {section.title}
            </p>
            <ul>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.activePattern && item.activePattern.test(pathname)) ||
                  false;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors min-h-[44px]",
                        active
                          ? "bg-teal-500/10 text-teal-400 font-medium"
                          : "text-foreground/80 hover:bg-muted/40 active:bg-muted/60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          active ? "text-teal-400" : "text-muted-foreground/60"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer — theme toggle + sign out. Always visible at the
          bottom of the drawer so it's reachable without scrolling
          back up. Uses safe-area-inset-bottom so it doesn't sit
          under the iOS home indicator on notched devices. */}
      <div className="shrink-0 border-t border-border/30 px-2 py-2 pb-[max(env(safe-area-inset-bottom,0px),8px)] space-y-1">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground/80 hover:bg-muted/40 active:bg-muted/60 transition-colors min-h-[44px]"
        >
          {theme === "dark" ? (
            <Sun className="h-[18px] w-[18px] text-muted-foreground/60 shrink-0" />
          ) : (
            <Moon className="h-[18px] w-[18px] text-muted-foreground/60 shrink-0" />
          )}
          <span className="flex-1 text-left">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground/80 hover:bg-muted/40 active:bg-muted/60 transition-colors min-h-[44px]"
        >
          <LogOut className="h-[18px] w-[18px] text-muted-foreground/60 shrink-0" />
          <span className="flex-1 text-left">Sign out</span>
        </button>
      </div>
    </SheetContent>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [moreOpen, setMoreOpen] = useState(false);

  if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/legal")) {
    return null;
  }

  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  const role = session.user.role;
  const barItems: NavItem[] =
    role === "EMPLOYER"
      ? employerBarItems
      : role === "COMMUNITY_GUARDIAN"
        ? guardianBarItems
        : youthBarItems;

  const drawerSections: NavSection[] =
    role === "EMPLOYER"
      ? employerDrawerSections
      : role === "COMMUNITY_GUARDIAN"
        ? guardianDrawerSections
        : role === "ADMIN"
          ? adminDrawerSections
          : youthDrawerSections;

  const isActive = (item: NavItem) => {
    if (item.activePattern) {
      return item.activePattern.test(pathname);
    }
    return pathname === item.href;
  };

  return (
    <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-950/95 backdrop-blur-sm border-t border-slate-800/50 pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-14 px-1">
          {barItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 min-h-[44px] min-w-[44px] transition-colors rounded-lg",
                  active ? "text-teal-400" : "text-slate-500 active:text-slate-300"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", active && "text-teal-400")} />
                <span
                  className={cn(
                    "text-[11px] mt-0.5 font-medium leading-none",
                    active ? "text-teal-400" : "text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More drawer trigger — always the fifth bar slot. Opens
              the full navigation tree in a bottom sheet. */}
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="More navigation options"
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-h-[44px] min-w-[44px] transition-colors rounded-lg",
                moreOpen ? "text-teal-400" : "text-slate-500 active:text-slate-300"
              )}
            >
              <MoreHorizontal
                className={cn("h-5 w-5 shrink-0", moreOpen && "text-teal-400")}
              />
              <span
                className={cn(
                  "text-[11px] mt-0.5 font-medium leading-none",
                  moreOpen ? "text-teal-400" : "text-slate-500"
                )}
              >
                More
              </span>
            </button>
          </SheetTrigger>
        </div>
      </nav>

      <MobileMoreMenu
        sections={drawerSections}
        pathname={pathname}
        onNavigate={() => {
          setMoreOpen(false);
          // Fire a router refresh so any navigation-aware state (e.g.
          // active pattern highlighting) settles cleanly after the
          // drawer closes.
          router.refresh();
        }}
      />
    </Sheet>
  );
}
