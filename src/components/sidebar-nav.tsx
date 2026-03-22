"use client";

/**
 * SIDEBAR NAVIGATION — Style 6 "Campus"
 *
 * Always-dark sidebar with grouped navigation sections.
 * Priorities: Journey & Growth first, Small Jobs second.
 * Supports all user roles. Includes light/dark toggle + sign out.
 * Collapsible on tablet (icon-only mode). Hidden on mobile (bottom nav used instead).
 */

import { useState, useCallback } from "react";
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
  Target,
  HelpCircle,
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
  collapsed?: boolean;
}

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  collapsed?: boolean;
}

// ── Nav Item ─────────────────────────────────────────────────────────

function NavItem({ href, icon: Icon, label, active, badge, collapsed }: NavItemProps) {
  const router = useRouter();
  const handleMouseEnter = useCallback(() => {
    router.prefetch(href);
  }, [router, href]);

  return (
    <Link href={href} prefetch={true} className="block group" title={collapsed ? label : undefined} onMouseEnter={handleMouseEnter}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl text-sm transition-all",
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
          active
            ? "bg-indigo-500/20 text-indigo-300 font-medium"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Nav Section ──────────────────────────────────────────────────────

function NavSection({ title, children, collapsed }: NavSectionProps) {
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

  // Check guardian status — cached for 10 min, rarely changes
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

  // Pending applications count — cached for 2 min
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const displayName = userName || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-slate-950 border-r border-slate-800/50 sticky top-0 h-screen overflow-y-auto overflow-x-hidden transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Brand */}
      <div className={cn("flex items-center gap-2.5 p-4 mb-2", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
          <Star className="h-4 w-4 text-indigo-400" />
        </div>
        {!collapsed && <span className="font-bold text-base tracking-tight text-slate-100">Endeavrly</span>}
      </div>

      {/* Navigation — varies by role */}
      <nav className="flex-1 px-2">
        {userRole === "YOUTH" && (
          <>
            <NavSection title="Explore" collapsed={collapsed}>
              <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive("/dashboard")} collapsed={collapsed} />
              <NavItem href="/my-journey" icon={Route} label="My Journey" active={isActive("/my-journey")} collapsed={collapsed} />
              <NavItem href="/careers" icon={Compass} label="Explore Careers" active={isActive("/careers")} collapsed={collapsed} />
              <NavItem href="/insights" icon={BarChart3} label="Industry Insights" active={isActive("/insights")} collapsed={collapsed} />
              <NavItem href="/career-advisor" icon={Bot} label="AI Advisor" active={isActive("/career-advisor")} collapsed={collapsed} />
            </NavSection>

            <NavSection title="Small Jobs" collapsed={collapsed}>
              <NavItem href="/jobs" icon={Search} label="Browse Jobs" active={isActive("/jobs")} collapsed={collapsed} />
              <NavItem href="/applications" icon={FileText} label="My Applications" active={isActive("/applications")} collapsed={collapsed} badge={pendingCount || undefined} />
              <NavItem href="/messages" icon={MessageSquare} label="Messages" active={isActive("/messages")} collapsed={collapsed} />
            </NavSection>

            <NavSection title="Account" collapsed={collapsed}>
              <NavItem href="/profile" icon={User} label="Profile" active={isActive("/profile")} collapsed={collapsed} />
              <NavItem href="/earnings" icon={Wallet} label="Earnings" active={isActive("/earnings")} collapsed={collapsed} />
              <NavItem href="/goals" icon={Target} label="Goals" active={isActive("/goals")} collapsed={collapsed} />
              {isGuardian && (
                <NavItem href="/guardian" icon={Shield} label="Guardian" active={isActive("/guardian")} collapsed={collapsed} />
              )}
              <NavItem href="/feedback" icon={HelpCircle} label="Support" active={isActive("/feedback")} collapsed={collapsed} />
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

      {/* Bottom section: user, theme toggle, collapse */}
      <div className="px-2 pb-3 mt-auto space-y-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors",
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
          )}
          title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
        >
          {theme === "dark" ? <Sun className="h-[18px] w-[18px] shrink-0" /> : <Moon className="h-[18px] w-[18px] shrink-0" />}
          {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors",
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl text-sm text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors",
            collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export default SidebarNav;
