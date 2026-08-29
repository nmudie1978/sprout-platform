"use client";

/**
 * Organisations — the commercial estate, and the platform/commercial
 * overview from sections 9 and 10 of the institutional spec.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Building2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformShell, StatTile, formatMinor } from "@/components/admin/platform-shell";
import { NewOrganisationDialog } from "@/components/admin/new-organisation-dialog";

interface OrganisationRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  country: string | null;
  activeUsers: number;
  licence: {
    id: string;
    status: string;
    planName: string;
    endDate: string | null;
    userLimit: number | null;
    utilisation: number | null;
    annualValueMinor: number | null;
    currency: string | null;
  } | null;
}

interface Overview {
  platform: {
    totalOrganisations: number;
    activeOrganisations: number;
    trialOrganisations: number;
    activeLicences: number;
    expiringLicences: number;
    institutionalUsers: number;
    directUsers: number;
    pendingInvitations: number;
  };
  commercial: {
    arrMinor: number;
    mrrMinor: number;
    trialPipelineMinor: number;
    totalSeats: number;
    usedSeats: number;
    seatUtilisation: number | null;
  };
  alerts: { kind: string; organisationId: string; organisationName: string; severity: number; message: string }[];
}

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  ONBOARDING: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  PROSPECT: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  SUSPENDED: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  CHURNED: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  ARCHIVED: "bg-slate-700/40 text-slate-400 border-slate-600/40",
  TRIAL: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  EXPIRED: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  CANCELLED: "bg-slate-700/40 text-slate-400 border-slate-600/40",
};

function humanise(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
}

export default function AdminOrganisationsPage() {
  const [organisations, setOrganisations] = useState<OrganisationRow[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [orgRes, overviewRes] = await Promise.all([
        fetch(`/api/admin/platform/organisations?q=${encodeURIComponent(query)}`),
        fetch("/api/admin/platform/overview"),
      ]);
      if (orgRes.ok) setOrganisations((await orgRes.json()).organisations ?? []);
      if (overviewRes.ok) setOverview(await overviewRes.json());
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    // Debounced so typing in the search box doesn't fire a request per key.
    const timer = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  return (
    <PlatformShell
      title="Organisations"
      subtitle="Institutional customers, licences and commercial status"
      onRefresh={load}
      refreshing={loading}
      actions={
        <Button size="sm" className="bg-teal-600 hover:bg-teal-500" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New organisation
        </Button>
      }
    >
      {overview && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatTile value={overview.platform.totalOrganisations} label="Organisations" />
            <StatTile
              value={overview.platform.activeOrganisations}
              label="Active"
              tone="positive"
            />
            <StatTile value={overview.platform.activeLicences} label="Active licences" />
            <StatTile value={overview.platform.trialOrganisations} label="On trial" />
            <StatTile
              value={overview.platform.expiringLicences}
              label="Expiring ≤30d"
              tone={overview.platform.expiringLicences > 0 ? "warning" : "default"}
            />
            <StatTile
              value={overview.platform.institutionalUsers.toLocaleString()}
              label="Institutional users"
            />
            <StatTile
              value={overview.platform.directUsers.toLocaleString()}
              label="Direct users"
              tone="positive"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile value={formatMinor(overview.commercial.arrMinor)} label="ARR (committed)" />
            <StatTile value={formatMinor(overview.commercial.mrrMinor)} label="MRR" />
            <StatTile
              value={formatMinor(overview.commercial.trialPipelineMinor)}
              label="Trial pipeline"
            />
            <StatTile
              value={
                overview.commercial.seatUtilisation === null
                  ? "—"
                  : `${Math.round(overview.commercial.seatUtilisation * 100)}%`
              }
              label={`Seats ${overview.commercial.usedSeats.toLocaleString()} / ${overview.commercial.totalSeats.toLocaleString()}`}
            />
          </div>

          {overview.alerts.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-amber-200">
                  {overview.alerts.length} alert{overview.alerts.length === 1 ? "" : "s"}
                </h2>
              </div>
              <ul className="space-y-1.5">
                {overview.alerts.slice(0, 8).map((alert, i) => (
                  <li key={`${alert.organisationId}-${alert.kind}-${i}`} className="text-sm">
                    <Link
                      href={`/admin/organisations/${alert.organisationId}`}
                      className="text-slate-300 hover:text-white"
                    >
                      <span
                        className={
                          alert.severity === 1
                            ? "text-rose-400"
                            : alert.severity === 2
                              ? "text-amber-400"
                              : "text-slate-500"
                        }
                      >
                        ●
                      </span>{" "}
                      {alert.message}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search organisations…"
          className="pl-9 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {loading && organisations.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full bg-slate-800" />
          ))}
        </div>
      ) : organisations.length === 0 ? (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-10 text-center">
          <Building2 className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            {query ? "No organisations match that search." : "No organisations yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Organisation</th>
                <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Type</th>
                <th className="text-left font-medium px-4 py-2.5">Licence</th>
                <th className="text-left font-medium px-4 py-2.5">Users</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {organisations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/organisations/${org.id}`}
                      className="font-medium text-slate-100 hover:text-teal-300"
                    >
                      {org.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {org.slug}
                      {org.country ? ` · ${org.country}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">
                    {humanise(org.type)}
                  </td>
                  <td className="px-4 py-3">
                    {org.licence ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{org.licence.planName}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_TONE[org.licence.status] ?? ""}`}
                        >
                          {humanise(org.licence.status)}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-slate-600">No licence</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {org.activeUsers.toLocaleString()}
                    {org.licence?.userLimit ? (
                      <span className="text-slate-500">
                        {" / "}
                        {org.licence.userLimit.toLocaleString()}
                      </span>
                    ) : null}
                    {org.licence?.utilisation !== null &&
                      org.licence?.utilisation !== undefined &&
                      org.licence.utilisation >= 0.9 && (
                        <span className="ml-1.5 text-amber-400 text-xs">
                          {Math.round(org.licence.utilisation * 100)}%
                        </span>
                      )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${STATUS_TONE[org.status] ?? ""}`}
                    >
                      {humanise(org.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewOrganisationDialog
        open={showNew}
        onOpenChange={setShowNew}
        onCreated={() => {
          setShowNew(false);
          load();
        }}
      />
    </PlatformShell>
  );
}
