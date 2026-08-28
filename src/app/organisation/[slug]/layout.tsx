/**
 * Organisation portal shell.
 *
 * A separate top-level route rather than part of the youth dashboard, so
 * institutional complexity never leaks into the young person's experience —
 * section 23 of the spec. A user who is both a participant somewhere and an
 * advisor somewhere else moves between two clean surfaces.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { requirePortalAccess } from "@/lib/organisations/portal-guard";
import { ORG_ROLE_LABELS } from "@/lib/organisations/permissions";
import type { OrgRole } from "@prisma/client";

import { PortalNav } from "./portal-nav";

export const metadata: Metadata = {
  title: "Organisation — Endeavrly",
  robots: "noindex, nofollow",
};

export default async function OrganisationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Every page under this layout is guarded here as well as in its own body,
  // so a new page added later can't accidentally ship unguarded.
  const context = await requirePortalAccess(slug);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Organisation</p>
              <h1 className="text-lg font-semibold truncate">{context.organisationName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {ORG_ROLE_LABELS[context.role as OrgRole]}
              </span>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                My Journey →
              </Link>
            </div>
          </div>
          <PortalNav slug={slug} role={context.role} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
