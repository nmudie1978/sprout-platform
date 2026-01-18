"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Compass,
  Target,
  Briefcase,
  BookOpen,
  Bell,
  Archive,
  Sparkles,
} from "lucide-react";

const tabs = [
  { href: "/my-path", label: "Overview", icon: Compass, exact: true },
  { href: "/my-path/skills-jobs", label: "Skills", icon: Target },
  { href: "/my-path/job-picks", label: "Jobs", icon: Briefcase },
  { href: "/my-path/courses", label: "Learn", icon: BookOpen },
  { href: "/my-path/alerts", label: "Alerts", icon: Bell },
  { href: "/my-path/vault", label: "Vault", icon: Archive },
  { href: "/my-path/strengths", label: "Strengths", icon: Sparkles },
];

export default function MyPathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20">
        <div className="container px-4 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            My Path
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Your personalized journey to grow, earn, and prove what you can do
          </p>
        </div>
      </div>

      {/* Tabs Navigation - Horizontal scroll on mobile */}
      <div className="border-b bg-background sticky top-14 z-40">
        <div className="container px-4">
          <nav className="flex overflow-x-auto no-scrollbar -mb-px">
            {tabs.map((tab) => {
              const isActive = tab.exact
                ? pathname === tab.href
                : pathname.startsWith(tab.href);
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                    isActive
                      ? "border-orange-500 text-orange-600 dark:text-orange-400"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-6 sm:py-8">{children}</div>
    </div>
  );
}
