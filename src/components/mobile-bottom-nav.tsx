"use client";

/**
 * MOBILE BOTTOM NAV — Updated for Style 6
 *
 * Priority order reflects app focus:
 * Journey > Careers > Dashboard (Home) > Jobs > Profile
 *
 * Supports YOUTH, EMPLOYER, ADMIN, COMMUNITY_GUARDIAN roles.
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activePattern?: RegExp;
}

const youthNavItems: NavItem[] = [
  { href: "/my-journey", label: "Journey", icon: Route, activePattern: /^\/my-journey/ },
  { href: "/careers", label: "Careers", icon: Compass, activePattern: /^\/careers|^\/insights/ },
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/jobs", label: "Jobs", icon: Search, activePattern: /^\/jobs/ },
  { href: "/profile", label: "Profile", icon: User, activePattern: /^\/profile/ },
];

const employerNavItems: NavItem[] = [
  { href: "/employer/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/employer/post-job", label: "Post", icon: PlusCircle },
  { href: "/messages", label: "Messages", icon: MessageSquare, activePattern: /^\/messages/ },
  { href: "/employer/settings", label: "Settings", icon: User, activePattern: /^\/employer\/settings/ },
];

const guardianNavItems: NavItem[] = [
  { href: "/guardian", label: "Guardian", icon: Shield },
  { href: "/jobs", label: "Jobs", icon: Briefcase, activePattern: /^\/jobs/ },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/legal")) {
    return null;
  }

  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  const navItems =
    session.user.role === "EMPLOYER" ? employerNavItems :
    session.user.role === "COMMUNITY_GUARDIAN" ? guardianNavItems :
    youthNavItems;

  const isActive = (item: NavItem) => {
    if (item.activePattern) {
      return item.activePattern.test(pathname);
    }
    return pathname === item.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[56px] py-2 transition-colors rounded-lg",
                active
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-indigo-400")} />
              <span className={cn(
                "text-[10px] mt-1 font-medium",
                active ? "text-indigo-400" : "text-slate-500"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
