"use client";

/**
 * SIDEBAR NAVIGATION
 *
 * Always-dark sidebar with grouped navigation sections.
 * Priorities: Journey & Growth first, Small Jobs second.
 * Supports all user roles. Includes light/dark toggle + sign out.
 * Collapsible on tablet (icon-only mode). Hidden on mobile (bottom nav used instead).
 */

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Compass,
  MessageSquare,
  TrendingUp,
  BarChart3,
  User,
  HelpCircle,
  Info,
  Star,
  Bot,
  Wallet,
  Shield,
  Building2,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Route,
  Settings,
  Search,
  FileText,
  Calendar,
  Quote,
  ChevronDown,
  Radar,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

interface SidebarNavProps {
  userRole: "YOUTH" | "EMPLOYER" | "ADMIN" | "COMMUNITY_GUARDIAN";
  userName?: string;
  userEmail?: string;
  userProfilePic?: string | null;
}

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: number;
  statusDot?: boolean;
  collapsed?: boolean;
  /**
   * Marks this nav item as a "personal" surface (My Journey, My Jobs, My
   * Career Radar, etc.) — gets a subtle teal accent so the user can see at
   * a glance which sections belong to them vs. catalogue/exploration ones.
   */
  personal?: boolean;
}

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  collapsed?: boolean;
  /**
   * "Yours" sections get a teal-tinted header and a soft bordered container
   * around the children, physically separating personal surfaces from
   * catalogue ones.
   */
  accent?: boolean;
}

// ── Nav Item ─────────────────────────────────────────────────────────

function NavItem({ href, icon: Icon, label, active, badge, statusDot, collapsed, personal }: NavItemProps) {
  const router = useRouter();
  const handleMouseEnter = useCallback(() => {
    router.prefetch(href);
  }, [router, href]);

  return (
    <Link href={href} prefetch={true} className="block group relative" title={collapsed ? label : undefined} onMouseEnter={handleMouseEnter}>
      {/* Active glow indicator */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
      )}
      {/* Personal accent — a quiet 2px teal rail that shows this section
          belongs to the user. Sits flush with the active glow when active. */}
      {personal && !active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full bg-teal-400/40 group-hover:bg-teal-400/70 transition-colors" />
      )}
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-xl text-sm transition-all duration-200 ease-out overflow-hidden",
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
          active
            ? "bg-teal-500/15 text-teal-300 font-medium shadow-[inset_0_0_20px_rgba(20,184,166,0.08)]"
            : personal
            ? "text-teal-100/80 hover:text-teal-100 hover:bg-teal-500/[0.06]"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
        )}
      >
        {/* Hover glow effect */}
        {!active && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-teal-500/[0.06] via-transparent to-transparent pointer-events-none" />
        )}
        <Icon className={cn(
          "h-[18px] w-[18px] shrink-0 transition-all duration-200 ease-out",
          active
            ? "text-teal-400 drop-shadow-[0_0_6px_rgba(45,212,191,0.5)]"
            : personal
            ? "text-teal-400/70 group-hover:scale-110 group-hover:text-teal-300"
            : "group-hover:scale-110 group-hover:text-slate-200"
        )} />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && statusDot && (
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0 shadow-[0_0_4px_rgba(45,212,191,0.6)]" />
        )}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none animate-pulse">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Nav Group (parent item with collapsible children) ───────────────

interface NavGroupProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  /** Whether any child route is active — keeps the group open. */
  childActive?: boolean;
  children: React.ReactNode;
}

function NavGroup({ href, icon: Icon, label, active, collapsed, childActive, children }: NavGroupProps) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(!!(active || childActive));

  // Auto-open when a child route becomes active (e.g. via direct nav)
  useEffect(() => {
    if (active || childActive) setOpen(true);
  }, [active, childActive]);

  const handleMouseEnter = useCallback(() => router.prefetch(href), [router, href]);

  return (
    <div>
      <div className="block group relative">
        {(active || childActive) && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
        )}
        <div
          className={cn(
            "relative flex items-center gap-3 rounded-xl text-sm transition-all duration-200 ease-out overflow-hidden",
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
            (active || childActive)
              ? "bg-teal-500/15 text-teal-300 font-medium shadow-[inset_0_0_20px_rgba(20,184,166,0.08)]"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          )}
        >
          <Link
            href={href}
            prefetch={true}
            onMouseEnter={handleMouseEnter}
            className="flex items-center gap-3 flex-1 min-w-0"
            title={collapsed ? label : undefined}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-all duration-200 ease-out",
                (active || childActive)
                  ? "text-teal-400 drop-shadow-[0_0_6px_rgba(45,212,191,0.5)]"
                  : "group-hover:scale-110 group-hover:text-slate-200"
              )}
            />
            {!collapsed && <span className="flex-1 truncate">{label}</span>}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
              }}
              className="p-0.5 rounded hover:bg-white/10 transition-colors"
              aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  open ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
          )}
        </div>
      </div>
      {!collapsed && open && (
        <div className="relative mt-0.5 ml-[18px] pl-3 border-l border-slate-800/60 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Nav Section ──────────────────────────────────────────────────────

function NavSection({ title, children, collapsed, accent }: NavSectionProps) {
  if (accent) {
    return (
      <div className="mb-5">
        {!collapsed && (
          <div className="flex items-center gap-1.5 px-3 mb-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.8)] motion-safe:animate-[yours-pulse_3.2s_ease-in-out_infinite]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-teal-300">
              {title}
            </p>
          </div>
        )}
        {collapsed && <div className="w-6 border-t border-teal-500/40 mx-auto mb-2" />}
        <div
          className={cn(
            "relative space-y-0.5 rounded-xl border border-teal-500/20 bg-gradient-to-b from-teal-500/[0.07] to-teal-500/[0.02] overflow-hidden",
            collapsed ? "p-1" : "p-1.5"
          )}
        >
          {/* Ambient outer glow — soft, slow pulse */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-xl motion-safe:animate-[yours-glow_5s_ease-in-out_infinite]"
            style={{
              boxShadow:
                "0 0 18px 0 rgba(45,212,191,0.10), inset 0 0 24px 0 rgba(20,184,166,0.06)",
            }}
          />
          {/* Slow drifting sheen across the panel */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 motion-safe:animate-[yours-sheen_9s_linear_infinite]"
            style={{
              background:
                "linear-gradient(115deg, transparent 35%, rgba(45,212,191,0.08) 50%, transparent 65%)",
              backgroundSize: "250% 100%",
            }}
          />
          <div className="relative">{children}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-5">
      {!collapsed && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 px-3 mb-1.5">
          {title}
        </p>
      )}
      {collapsed && <div className="w-6 border-t border-slate-800/50 mx-auto mb-2" />}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export function SidebarNav({ userRole, userName, userEmail, userProfilePic }: SidebarNavProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check guardian status
  const { data: guardianInfo } = useQuery({
    queryKey: ["my-guardian-status"],
    queryFn: async () => {
      const response = await fetch("/api/guardian");
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const isGuardian = guardianInfo?.isGuardian || guardianInfo?.isAdmin;

  // Pending applications count
  const { data: applicationsData } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const response = await fetch("/api/applications");
      if (!response.ok) return { applications: [] };
      return response.json();
    },
    enabled: userRole === "YOUTH",
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData?.applications || []);
  const pendingCount = applications.filter((a: any) => a.status === "PENDING").length;

  // Check if there's an active journey (goal set)
  const { data: goalsData } = useQuery<{ primaryGoal: { title: string } | null }>({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) return { primaryGoal: null };
      return response.json();
    },
    enabled: userRole === "YOUTH",
    staleTime: 5 * 60 * 1000,
  });
  const hasActiveJourney = !!goalsData?.primaryGoal?.title;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const displayName = userName || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "hidden lg:block relative sticky top-0 h-screen shrink-0 transition-all duration-300 ease-out",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Animated shine border */}
      <div
        style={
          {
            "--border-width": "1px",
            "--border-radius": "0px",
            "--duration": "14s",
            "--mask-linear-gradient": "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            "--background-radial-gradient": "radial-gradient(transparent,transparent,#14b8a6,#2dd4bf,transparent,transparent)",
          } as React.CSSProperties
        }
        className="before:absolute before:inset-0 before:aspect-square before:size-full before:rounded-[--border-radius] before:p-[--border-width] before:will-change-[background-position] before:content-[''] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:[mask:--mask-linear-gradient] motion-safe:before:animate-shine absolute inset-0 pointer-events-none"
      />
      <aside
        className="relative flex flex-col bg-slate-950 h-full overflow-y-auto overflow-x-hidden"
      >
      {/* Floating ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-teal-500/[0.03] blur-3xl animate-[float-slow_20s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 -right-10 w-32 h-32 rounded-full bg-teal-500/[0.03] blur-3xl animate-[float-medium_15s_ease-in-out_infinite]" />
        <div className="absolute -bottom-10 left-1/2 w-36 h-36 rounded-full bg-teal-500/[0.02] blur-3xl animate-[float-fast_12s_ease-in-out_infinite]" />
      </div>

      {/* Brand */}
      <div className={cn("flex items-center gap-2.5 p-4 mb-2 relative", collapsed && "justify-center")}>
        <div className="relative w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0 group/logo cursor-default">
          <Star className="h-4 w-4 text-teal-400 transition-transform duration-500 group-hover/logo:rotate-[360deg] group-hover/logo:scale-110" />
          <div className="absolute inset-0 rounded-xl bg-teal-400/20 opacity-0 group-hover/logo:opacity-100 blur-md transition-opacity duration-500" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base tracking-tight text-slate-100 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text">
            Endeavrly
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 relative">
        {userRole === "YOUTH" && (
          <>
            {/* YOURS — personal surfaces, physically separated at the top */}
            <NavSection title="Yours" collapsed={collapsed} accent>
              <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive("/dashboard")} collapsed={collapsed} personal />
              <NavItem href="/my-journey" icon={Route} label="My Journey" active={isActive("/my-journey")} statusDot={hasActiveJourney} collapsed={collapsed} personal />
              <NavItem href="/careers/radar" icon={Radar} label="My Career Radar" active={isActive("/careers/radar")} collapsed={collapsed} personal />
              <NavItem href="/applications" icon={FileText} label="My Jobs" active={isActive("/applications")} collapsed={collapsed} badge={pendingCount || undefined} personal />
              <NavItem href="/messages" icon={MessageSquare} label="Messages" active={isActive("/messages")} collapsed={collapsed} personal />
            </NavSection>

            <NavSection title="Explore" collapsed={collapsed}>
              <NavItem href="/careers" icon={Compass} label="Explore Careers" active={pathname === "/careers"} collapsed={collapsed} />
              <NavItem href="/career-events" icon={Calendar} label="Youth Events" active={isActive("/career-events")} collapsed={collapsed} />
              <NavItem href="/insights" icon={BarChart3} label="Industry Insights" active={isActive("/insights")} collapsed={collapsed} />
              <NavItem href="/career-advisor" icon={Bot} label="AI Advisor" active={isActive("/career-advisor")} collapsed={collapsed} />
            </NavSection>

            <NavSection title="Small Jobs" collapsed={collapsed}>
              <NavItem href="/jobs" icon={Search} label="Browse Jobs" active={isActive("/jobs")} collapsed={collapsed} />
            </NavSection>

            <NavSection title="Account" collapsed={collapsed}>
              <NavItem href="/profile" icon={User} label="Profile" active={isActive("/profile")} collapsed={collapsed} />
              {isGuardian && (
                <NavItem href="/guardian" icon={Shield} label="Guardian" active={isActive("/guardian")} collapsed={collapsed} />
              )}
            </NavSection>

            <NavSection title="Endeavrly" collapsed={collapsed}>
              <NavItem href="/info" icon={Info} label="About" active={isActive("/info")} collapsed={collapsed} />
              <NavItem href="/feedback" icon={HelpCircle} label="Support" active={isActive("/feedback")} collapsed={collapsed} />
              <NavItem href="/reviews" icon={Quote} label="User Reviews" active={isActive("/reviews")} collapsed={collapsed} />
            </NavSection>
          </>
        )}

        {userRole === "EMPLOYER" && (
          <>
            <NavSection title="Manage" collapsed={collapsed}>
              <NavItem href="/employer/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive("/employer/dashboard")} collapsed={collapsed} />
              <NavItem href="/employer/post-job" icon={PlusCircle} label="Post Job" active={isActive("/employer/post-job")} collapsed={collapsed} />
              <NavItem href="/employer/talent" icon={Compass} label="Browse Talent" active={isActive("/employer/talent")} collapsed={collapsed} />
              <NavItem href="/messages" icon={MessageSquare} label="Messages" active={isActive("/messages")} collapsed={collapsed} />
            </NavSection>

            <NavSection title="Account" collapsed={collapsed}>
              <NavItem href="/employer/settings" icon={Settings} label="Settings" active={isActive("/employer/settings")} collapsed={collapsed} />
              <NavItem href="/feedback" icon={HelpCircle} label="Support" active={isActive("/feedback")} collapsed={collapsed} />
            </NavSection>
          </>
        )}

        {userRole === "ADMIN" && (
          <>
            <NavSection title="Admin" collapsed={collapsed}>
              <NavItem href="/admin/analytics" icon={BarChart3} label="Analytics" active={isActive("/admin/analytics")} collapsed={collapsed} />
              <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive("/dashboard")} collapsed={collapsed} />
              <NavItem href="/admin/questions" icon={MessageSquare} label="Moderate Q&A" active={isActive("/admin/questions")} collapsed={collapsed} />
              <NavItem href="/insights" icon={TrendingUp} label="Insights" active={isActive("/insights")} collapsed={collapsed} />
            </NavSection>
          </>
        )}

        {userRole === "COMMUNITY_GUARDIAN" && (
          <>
            <NavSection title="Guardian" collapsed={collapsed}>
              <NavItem href="/guardian" icon={Shield} label="Guardian Dashboard" active={isActive("/guardian")} collapsed={collapsed} />
              <NavItem href="/jobs" icon={Briefcase} label="Small Jobs" active={isActive("/jobs")} collapsed={collapsed} />
            </NavSection>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-3 mt-auto space-y-1 relative">
        {/* Subtle top fade */}
        <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200 group/theme",
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
          )}
          title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-[18px] w-[18px] shrink-0 transition-transform duration-300 group-hover/theme:rotate-90 group-hover/theme:text-amber-400" />
          ) : (
            <Moon className="h-[18px] w-[18px] shrink-0 transition-transform duration-300 group-hover/theme:-rotate-12 group-hover/theme:text-blue-400" />
          )}
          {!collapsed && <span>{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group/signout",
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover/signout:translate-x-0.5" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl text-sm text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all duration-200",
            collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
      </aside>
    </div>
  );
}

export default SidebarNav;
