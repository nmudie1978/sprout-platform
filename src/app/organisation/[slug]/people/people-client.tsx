"use client";

/**
 * People in the organisation — the member list and the invitation flow.
 *
 * Every row shows who someone is and what their role is. Whether the row
 * links through to individual progress is decided server-side and arrives on
 * the payload as `canViewProgress`; this component never makes that call
 * itself, it only renders the answer.
 */

import { useCallback, useEffect, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import type { OrgRole } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ORG_ROLE_LABELS, roleHasPermission } from "@/lib/organisations/permissions";

import { InvitePeopleDialog } from "./invite-dialog";

interface Member {
  membershipId: string;
  name: string;
  email: string;
  role: OrgRole;
  status: string;
  joinedAt: string;
  cohorts: { id: string; name: string }[];
  dataSharingConsent: boolean;
  canViewProgress: boolean;
  progressUnavailableReason: string | null;
}

const REASON_COPY: Record<string, string> = {
  ORGANISATION_DISALLOWS_INDIVIDUAL_VIEW: "Aggregate-only organisation",
  ROLE_DISALLOWS_INDIVIDUAL_VIEW: "Not available to your role",
  NO_RELATIONSHIP_TO_PARTICIPANT: "Not assigned to you",
  PARTICIPANT_HAS_NOT_CONSENTED: "Hasn't agreed to share",
};

export function PeopleClient({
  organisationId,
  slug,
  role,
  allowIndividualViews,
}: {
  organisationId: string;
  slug: string;
  role: string;
  allowIndividualViews: boolean;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const canInvite = roleHasPermission(role as OrgRole, "members:invite");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const search = new URLSearchParams();
      if (query) search.set("q", query);
      if (roleFilter) search.set("role", roleFilter);
      const response = await fetch(
        `/api/organisations/${organisationId}/members?${search.toString()}`
      );
      if (response.ok) setMembers((await response.json()).members ?? []);
    } finally {
      setLoading(false);
    }
  }, [organisationId, query, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">People</h2>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length === 1 ? "" : "s"}
          </p>
        </div>
        {canInvite && (
          <Button size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite people
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All roles</option>
          {Object.entries(ORG_ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading && members.length === 0 ? (
        <Skeleton className="h-48 w-full" />
      ) : members.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/40 p-10 text-center">
          <p className="text-muted-foreground">
            {query || roleFilter ? "Nobody matches those filters." : "Nobody has joined yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Name</th>
                <th className="text-left font-medium px-4 py-2.5">Role</th>
                <th className="text-left font-medium px-4 py-2.5 hidden md:table-cell">Cohorts</th>
                <th className="text-left font-medium px-4 py-2.5">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {members.map((member) => (
                <tr key={member.membershipId} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px]">
                      {ORG_ROLE_LABELS[member.role]}
                    </Badge>
                    {member.status !== "ACTIVE" && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {member.status.toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {member.cohorts.length > 0
                      ? member.cohorts.map((c) => c.name).join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {member.canViewProgress ? (
                      <span className="text-primary text-xs">Available</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {member.progressUnavailableReason
                          ? (REASON_COPY[member.progressUnavailableReason] ?? "Not available")
                          : "Not available"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        {allowIndividualViews
          ? "Individual progress means aggregate-style completion signals only — never reflections, notes or journey text, which are never shared with an organisation."
          : "This organisation is set to aggregate-only, so no individual progress is available to anyone here."}
      </p>

      <InvitePeopleDialog
        organisationId={organisationId}
        slug={slug}
        viewerRole={role}
        open={showInvite}
        onOpenChange={setShowInvite}
        onInvited={load}
      />
    </div>
  );
}
