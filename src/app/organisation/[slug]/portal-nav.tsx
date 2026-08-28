"use client";

/**
 * Portal navigation, filtered by what the viewer's role can actually do.
 *
 * Hiding a tab is presentation, not security — every route behind it
 * re-checks the same permission server-side.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OrgRole } from "@prisma/client";

import { roleHasPermission, type OrgPermission } from "@/lib/organisations/permissions";

const TABS: { segment: string; label: string; permission?: OrgPermission }[] = [
  { segment: "", label: "Overview" },
  { segment: "people", label: "People", permission: "members:list" },
  { segment: "cohorts", label: "Cohorts", permission: "cohorts:list" },
  { segment: "access", label: "Access", permission: "codes:list" },
  { segment: "analytics", label: "Analytics", permission: "analytics:view_aggregate" },
  { segment: "settings", label: "Settings", permission: "org:view_settings" },
];

export function PortalNav({ slug, role }: { slug: string; role: string }) {
  const pathname = usePathname();
  const base = `/organisation/${slug}`;

  const visible = TABS.filter(
    (tab) => !tab.permission || roleHasPermission(role as OrgRole, tab.permission)
  );

  return (
    <nav className="flex gap-1 mt-3 overflow-x-auto">
      {visible.map((tab) => {
        const href = tab.segment ? `${base}/${tab.segment}` : base;
        const active = tab.segment ? pathname.startsWith(href) : pathname === base;
        return (
          <Link
            key={tab.segment || "overview"}
            href={href}
            className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
