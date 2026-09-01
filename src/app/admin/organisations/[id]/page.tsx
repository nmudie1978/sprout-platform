"use client";

/**
 * One organisation's full profile — the tabbed view from section 11 of the
 * institutional spec.
 *
 * Note what is NOT here: any individual young person's data. The internal
 * portal manages the commercial relationship. Participant-level information
 * belongs to the participant, and to the organisation only under the consent
 * rules enforced in the organisation portal.
 */

import { useCallback, useEffect, useState } from "react";
import { use } from "react";
import { Building2, Check, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformShell, StatTile, formatMinor } from "@/components/admin/platform-shell";
import { IssueLicenceDialog } from "@/components/admin/issue-licence-dialog";
import { ModuleGrid } from "@/components/admin/module-grid";

interface OrganisationDetail {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  country: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  billingEmail: string | null;
  internalNotes: string | null;
  createdAt: string;
  activeUsers: number;
  activeAccessCodes: number;
  pendingInvitations: number;
  roleCounts: { role: string; count: number }[];
  settings: Record<string, unknown> | null;
  domains: { id: string; domain: string; verified: boolean; enrolmentPolicy: string }[];
  cohorts: { id: string; name: string; type: string; status: string; _count: { memberships: number } }[];
  licences: LicenceDetail[];
  currentLicence:
    | (LicenceDetail & {
        derivedStatus: string;
        daysRemaining: number | null;
        utilisation: number | null;
      })
    | null;
  recentAudit: { id: string; action: string; actor: string; summary: string | null; createdAt: string }[];
}

interface LicenceDetail {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  userLimit: number | null;
  activeUserCount: number;
  enabledModules: string[];
  contractReference: string | null;
  annualValueMinor: number | null;
  currency: string | null;
  renewalDate: string | null;
  autoRenew: boolean;
  trialEndsAt: string | null;
  commercialNotes: string | null;
  plan: { id: string; key: string; name: string } | null;
}

function humanise(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminOrganisationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [organisation, setOrganisation] = useState<OrganisationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIssue, setShowIssue] = useState(false);
  const [savingModules, setSavingModules] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/platform/organisations/${id}`);
      if (response.ok) setOrganisation((await response.json()).organisation);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveModules(licenceId: string, modules: string[]) {
    setSavingModules(true);
    try {
      await fetch(`/api/admin/platform/licences/${licenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabledModules: modules }),
      });
      await load();
    } finally {
      setSavingModules(false);
    }
  }

  async function setStatus(status: string) {
    await fetch(`/api/admin/platform/organisations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  if (loading && !organisation) {
    return (
      <PlatformShell title="Organisation" backHref="/admin/organisations">
        <Skeleton className="h-40 w-full bg-slate-800" />
      </PlatformShell>
    );
  }

  if (!organisation) {
    return (
      <PlatformShell title="Organisation" backHref="/admin/organisations">
        <p className="text-slate-400">Organisation not found.</p>
      </PlatformShell>
    );
  }

  const licence = organisation.currentLicence;

  return (
    <PlatformShell
      title={organisation.name}
      subtitle={`${humanise(organisation.type)} · ${organisation.slug}`}
      backHref="/admin/organisations"
      onRefresh={load}
      refreshing={loading}
      actions={
        <Button
          size="sm"
          className="bg-teal-600 hover:bg-teal-500"
          onClick={() => setShowIssue(true)}
        >
          Issue licence
        </Button>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatTile value={organisation.activeUsers.toLocaleString()} label="Active users" />
        <StatTile
          value={licence?.userLimit ? licence.userLimit.toLocaleString() : "Unlimited"}
          label="Seat limit"
        />
        <StatTile
          value={licence?.daysRemaining !== null && licence?.daysRemaining !== undefined ? `${licence.daysRemaining}d` : "—"}
          label="Licence remaining"
          tone={
            licence?.daysRemaining !== null &&
            licence?.daysRemaining !== undefined &&
            licence.daysRemaining <= 30
              ? "warning"
              : "default"
          }
        />
        <StatTile value={organisation.pendingInvitations} label="Pending invites" />
        <StatTile value={organisation.activeAccessCodes} label="Active codes" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-800 border border-slate-700/50 flex-wrap h-auto">
          {["overview", "licence", "modules", "people", "cohorts", "access", "audit"].map((t) => (
            <TabsTrigger key={t} value={t} className="data-[state=active]:bg-slate-700 capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <section className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 space-y-2 text-sm">
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-400" /> Organisation
              </h3>
              <Row label="Status">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {humanise(organisation.status)}
                  </Badge>
                  <select
                    value={organisation.status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
                  >
                    {["PROSPECT", "ONBOARDING", "ACTIVE", "SUSPENDED", "CHURNED", "ARCHIVED"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {humanise(s)}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </Row>
              <Row label="Country">{organisation.country ?? "—"}</Row>
              <Row label="Primary contact">
                {organisation.primaryContactName ?? organisation.primaryContactEmail ?? "—"}
              </Row>
              <Row label="Billing email">{organisation.billingEmail ?? "—"}</Row>
              <Row label="Created">{formatDate(organisation.createdAt)}</Row>
            </section>

            <section className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 space-y-2 text-sm">
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-400" /> People by role
              </h3>
              {organisation.roleCounts.length === 0 ? (
                <p className="text-slate-500">Nobody has joined yet.</p>
              ) : (
                organisation.roleCounts.map((r) => (
                  <Row key={r.role} label={humanise(r.role)}>
                    {r.count.toLocaleString()}
                  </Row>
                ))
              )}
            </section>
          </div>

          {organisation.internalNotes && (
            <section className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
              <h3 className="font-semibold text-slate-200 mb-2 text-sm">Internal notes</h3>
              <p className="text-sm text-slate-400 whitespace-pre-wrap">
                {organisation.internalNotes}
              </p>
            </section>
          )}
        </TabsContent>

        {/* ── Licence ──────────────────────────────────────────────── */}
        <TabsContent value="licence" className="space-y-3 mt-4">
          {organisation.licences.length === 0 ? (
            <EmptyPanel message="No licence issued yet. Issue one to give this organisation access." />
          ) : (
            organisation.licences.map((l) => (
              <div
                key={l.id}
                className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-sm space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">
                      {l.plan?.name ?? "Custom licence"}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {humanise(l.status)}
                    </Badge>
                    {l.id === licence?.id && (
                      <Badge className="text-[10px] bg-teal-500/15 text-teal-300 border-teal-500/30">
                        Current
                      </Badge>
                    )}
                  </div>
                  <span className="text-slate-400">
                    {formatMinor(l.annualValueMinor, l.currency ?? "NOK")} / yr
                  </span>
                </div>
                <div className="grid sm:grid-cols-4 gap-2 text-xs text-slate-400">
                  <span>Start: {formatDate(l.startDate)}</span>
                  <span>End: {formatDate(l.endDate)}</span>
                  <span>Seats: {l.userLimit?.toLocaleString() ?? "Unlimited"}</span>
                  <span>Modules: {l.enabledModules.length}</span>
                </div>
                {l.contractReference && (
                  <p className="text-xs text-slate-500">Contract: {l.contractReference}</p>
                )}
                {l.commercialNotes && (
                  <p className="text-xs text-slate-500 whitespace-pre-wrap">{l.commercialNotes}</p>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* ── Modules ──────────────────────────────────────────────── */}
        <TabsContent value="modules" className="mt-4">
          {!licence ? (
            <EmptyPanel message="Issue a licence before configuring modules." />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                What this organisation&apos;s licence enables. Role permissions still apply on top —
                enabling analytics never gives a participant analytics.
              </p>
              <ModuleGrid
                key={licence.enabledModules.join(",")}
                selected={licence.enabledModules}
                disabled={savingModules}
                onSave={(modules) => saveModules(licence.id, modules)}
              />
            </div>
          )}
        </TabsContent>

        {/* ── People ───────────────────────────────────────────────── */}
        <TabsContent value="people" className="mt-4">
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-sm">
            <p className="text-slate-300 mb-2">{organisation.activeUsers} active members.</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Individual member management lives in the organisation&apos;s own portal, where the
              privacy rules and consent state are enforced. The internal portal deliberately does
              not surface participant-level data.
            </p>
          </div>
        </TabsContent>

        {/* ── Cohorts ──────────────────────────────────────────────── */}
        <TabsContent value="cohorts" className="mt-4 space-y-2">
          {organisation.cohorts.length === 0 ? (
            <EmptyPanel message="No cohorts yet." />
          ) : (
            organisation.cohorts.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-slate-100">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {humanise(c.type)} · {humanise(c.status)}
                  </p>
                </div>
                <span className="text-slate-400">{c._count.memberships} members</span>
              </div>
            ))
          )}
        </TabsContent>

        {/* ── Access ───────────────────────────────────────────────── */}
        <TabsContent value="access" className="mt-4 space-y-3">
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-sm space-y-2">
            <h3 className="font-semibold text-slate-200">Verified email domains</h3>
            {organisation.domains.length === 0 ? (
              <p className="text-slate-500">None claimed.</p>
            ) : (
              organisation.domains.map((d) => (
                <div key={d.id} className="flex items-center gap-2">
                  <span className="text-slate-300">@{d.domain}</span>
                  {d.verified ? (
                    <Badge className="text-[10px] bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                      <Check className="h-3 w-3 mr-0.5" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-slate-400">
                      Unverified
                    </Badge>
                  )}
                  <span className="text-xs text-slate-500">{humanise(d.enrolmentPolicy)}</span>
                </div>
              ))
            )}
          </div>
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-sm">
            <p className="text-slate-300">
              {organisation.activeAccessCodes} active access code
              {organisation.activeAccessCodes === 1 ? "" : "s"} ·{" "}
              {organisation.pendingInvitations} pending invitation
              {organisation.pendingInvitations === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Codes and invitations are created by the organisation&apos;s own admins in their
              portal.
            </p>
          </div>
        </TabsContent>

        {/* ── Audit ────────────────────────────────────────────────── */}
        <TabsContent value="audit" className="mt-4">
          {organisation.recentAudit.length === 0 ? (
            <EmptyPanel message="No administrative activity recorded yet." />
          ) : (
            <div className="rounded-lg border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <tbody className="divide-y divide-slate-800">
                  {organisation.recentAudit.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 text-slate-300">
                        {entry.summary ?? humanise(entry.action)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        {entry.actor}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <IssueLicenceDialog
        organisationId={id}
        open={showIssue}
        onOpenChange={setShowIssue}
        onIssued={() => {
          setShowIssue(false);
          load();
        }}
      />
    </PlatformShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 text-right">{children}</span>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-8 text-center text-slate-500 text-sm">
      {message}
    </div>
  );
}
