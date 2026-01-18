"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Zap,
  BarChart3,
  GraduationCap,
  Archive,
  Lightbulb,
  Bot,
  Users,
} from "lucide-react";

const tabs = [
  { href: "/growth", label: "Next Steps", icon: Zap, exact: true },
  { href: "/growth/short-term", label: "Short-term", icon: BarChart3 },
  { href: "/growth/career-path", label: "Career Path", icon: GraduationCap },
  { href: "/growth/pro-insights", label: "Pro Insights", icon: Users },
  { href: "/growth/vault", label: "Vault", icon: Archive },
  { href: "/growth/insights", label: "Insights", icon: Lightbulb },
];

export default function GrowthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 py-8 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight">
              My{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                Growth
              </span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Your personal progression hub. Build skills through small jobs, track your journey to your dream career, and get personalised insights along the way.
          </p>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="border-b mb-6">
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
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
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

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
