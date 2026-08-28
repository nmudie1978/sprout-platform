"use client";

/**
 * The organisation context strip.
 *
 * Renders NOTHING for the overwhelming majority of users — anyone with no
 * organisation memberships. That is the point of section 23: institutional
 * complexity stays invisible unless it applies to you.
 *
 * For someone who does belong to an organisation it is a quiet strip, not a
 * mode switch: their personal journey remains the product, and this is a way
 * back to a staff portal or a reminder of what they're sharing.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import type { OrgRole } from "@prisma/client";

import { ORG_ROLE_LABELS } from "@/lib/organisations/permissions";

interface Membership {
  membershipId: string;
  organisationId: string;
  name: string;
  slug: string;
  role: OrgRole;
  status: string;
  hasStaffPortal: boolean;
  cohorts: { id: string; name: string }[];
  dataSharing: {
    consented: boolean;
    required: boolean;
    organisationCanViewIndividuals: boolean;
    notice: string | null;
  };
}

export function OrganisationContext() {
  const [memberships, setMemberships] = useState<Membership[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me/organisations")
      .then((r) => (r.ok ? r.json() : { organisations: [] }))
      .then((d) => {
        if (!cancelled) setMemberships(d.organisations ?? []);
      })
      .catch(() => {
        // A failure here must never break the dashboard. Rendering nothing is
        // the correct outcome — the personal journey stands on its own.
        if (!cancelled) setMemberships([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!memberships || memberships.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">
          {memberships.length === 1 ? "Your programme" : "Your programmes"}
        </h3>
      </div>

      <ul className="space-y-2">
        {memberships.map((membership) => (
          <li
            key={membership.membershipId}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="text-sm">{membership.name}</p>
              <p className="text-xs text-muted-foreground">
                {ORG_ROLE_LABELS[membership.role]}
                {membership.cohorts.length > 0
                  ? ` · ${membership.cohorts.map((c) => c.name).join(", ")}`
                  : ""}
              </p>
            </div>
            {membership.hasStaffPortal && (
              <Link
                href={`/organisation/${membership.slug}`}
                className="text-sm text-primary hover:underline shrink-0"
              >
                Open portal →
              </Link>
            )}
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Your journey, saved careers and reflections are yours. Manage what you share in{" "}
        <Link href="/profile" className="underline">
          your profile
        </Link>
        .
      </p>
    </div>
  );
}
