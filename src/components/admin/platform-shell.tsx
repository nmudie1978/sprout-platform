"use client";

/**
 * Shared chrome for the commercial section of the internal Admin Portal.
 *
 * Matches the existing portal's slate/teal language rather than introducing a
 * second admin aesthetic. Purely presentational — every page inside it is
 * already gated by middleware and the /admin layout.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

export const PLATFORM_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/organisations", label: "Organisations" },
  { href: "/admin/licence-plans", label: "Plans & modules" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/feedback", label: "Feedback" },
] as const;

interface PlatformShellProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PlatformShell({
  title,
  subtitle,
  backHref,
  onRefresh,
  refreshing,
  actions,
  children,
}: PlatformShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {backHref && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={() => router.push(backHref)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div className="h-4 w-px bg-slate-700" />
              </>
            )}
            <Shield className="h-5 w-5 text-teal-400 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{title}</h1>
              {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
                onClick={onRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {PLATFORM_NAV.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                  active
                    ? "bg-teal-500/15 text-teal-300"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/40"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">{children}</div>
    </div>
  );
}

/** Small labelled figure, used across the commercial dashboards. */
export function StatTile({
  value,
  label,
  tone = "default",
}: {
  value: string | number;
  label: string;
  tone?: "default" | "positive" | "warning" | "critical";
}) {
  const toneClass = {
    default: "text-teal-400 border-slate-700/50",
    positive: "text-emerald-400 border-emerald-500/30",
    warning: "text-amber-400 border-amber-500/30",
    critical: "text-rose-400 border-rose-500/30",
  }[tone];

  return (
    <div className={`rounded-lg bg-slate-800 border p-4 text-center ${toneClass}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

/** Currency for the commercial dashboard. Values are stored in minor units. */
export function formatMinor(minor: number | null, currency = "NOK"): string {
  if (minor === null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}
