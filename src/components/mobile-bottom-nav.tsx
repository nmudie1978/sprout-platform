"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Home, Briefcase, MessageSquare, User, PlusCircle, LayoutDashboard, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activePattern?: RegExp;
}

const youthNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/growth", label: "Growth", icon: TrendingUp, activePattern: /^\/growth/ },
  { href: "/jobs", label: "Small Jobs", icon: Briefcase, activePattern: /^\/jobs/ },
  { href: "/messages", label: "Messages", icon: MessageSquare, activePattern: /^\/messages/ },
  { href: "/profile", label: "", icon: User, activePattern: /^\/profile/ },
];

const employerNavItems: NavItem[] = [
  { href: "/employer/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/employer/post-job", label: "Post", icon: PlusCircle },
  { href: "/messages", label: "Messages", icon: MessageSquare, activePattern: /^\/messages/ },
  { href: "/employer/settings", label: "Settings", icon: User, activePattern: /^\/employer\/settings/ },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't show on auth pages or landing page
  if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/legal")) {
    return null;
  }

  // Don't show if not authenticated
  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  const navItems = session.user.role === "EMPLOYER" ? employerNavItems : youthNavItems;

  const isActive = (item: NavItem) => {
    if (item.activePattern) {
      return item.activePattern.test(pathname);
    }
    return pathname === item.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] py-2 transition-colors",
                "active:bg-muted/50 rounded-lg",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", active && "text-primary")} />
              {item.label && (
                <span className={cn(
                  "text-[10px] mt-1 font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
