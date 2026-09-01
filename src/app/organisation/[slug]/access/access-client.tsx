"use client";

/**
 * Access codes — the self-service way into a programme.
 *
 * A code is shared with a class, an event or a cohort, and anyone with an
 * Endeavrly account can redeem it. Codes never create accounts and never
 * grant organisation admin.
 */

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Plus } from "lucide-react";
import { OrgRole } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ORG_ROLE_LABELS, roleHasPermission } from "@/lib/organisations/permissions";

interface AccessCode {
  id: string;
  code: string;
  label: string | null;
  status: string;
  effectiveStatus: string;
  assignedRole: string;
  maxUses: number | null;
  currentUses: number;
  singleUse: boolean;
  expiresAt: string | null;
  allowedEmailDomains: string[];
  cohort: { id: string; name: string } | null;
}

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  INACTIVE: "text-muted-foreground",
  EXPIRED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  EXHAUSTED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
};

export function AccessCodesClient({
  organisationId,
  role,
}: {
  organisationId: string;
  role: string;
}) {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const canCreate = roleHasPermission(role as OrgRole, "codes:create");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/organisations/${organisationId}/access-codes`);
      if (response.ok) setCodes((await response.json()).codes ?? []);
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Access codes</h2>
          <p className="text-sm text-muted-foreground">
            Share a code so people can join themselves at{" "}
            <span className="font-mono text-xs">/join</span>.
          </p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New code
          </Button>
        )}
      </div>

      {loading && codes.length === 0 ? (
        <Skeleton className="h-40 w-full" />
      ) : codes.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/40 p-10 text-center">
          <KeyRound className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No access codes yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {codes.map((code) => (
            <div
              key={code.id}
              className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {code.code}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => copyCode(code.code)}
                  >
                    {copied === code.code ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${STATUS_TONE[code.effectiveStatus] ?? ""}`}
                >
                  {code.effectiveStatus.toLowerCase()}
                </Badge>
              </div>

              {code.label && <p className="text-sm">{code.label}</p>}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Joins as {ORG_ROLE_LABELS[code.assignedRole as OrgRole]}</span>
                {code.cohort && <span>Cohort: {code.cohort.name}</span>}
                <span>
                  {code.currentUses}
                  {code.maxUses ? ` / ${code.maxUses}` : ""} used
                </span>
                {code.expiresAt && (
                  <span>
                    Expires {new Date(code.expiresAt).toLocaleDateString("en-GB")}
                  </span>
                )}
                {code.allowedEmailDomains.length > 0 && (
                  <span>Restricted to @{code.allowedEmailDomains.join(", @")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <NewCodeDialog
        organisationId={organisationId}
        open={showNew}
        onOpenChange={setShowNew}
        onCreated={() => {
          setShowNew(false);
          load();
        }}
      />
    </div>
  );
}

function NewCodeDialog({
  organisationId,
  open,
  onOpenChange,
  onCreated,
}: {
  organisationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [prefix, setPrefix] = useState("");
  const [label, setLabel] = useState("");
  const [assignedRole, setAssignedRole] = useState<string>(OrgRole.PARTICIPANT);
  const [cohortId, setCohortId] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [domains, setDomains] = useState("");
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/organisations/${organisationId}/cohorts`)
      .then((r) => (r.ok ? r.json() : { cohorts: [] }))
      .then((d) => setCohorts(d.cohorts ?? []))
      .catch(() => setCohorts([]));
  }, [open, organisationId]);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/organisations/${organisationId}/access-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix: prefix.trim() || null,
          label: label.trim() || null,
          assignedRole,
          cohortId: cohortId || null,
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt || null,
          allowedEmailDomains: domains
            .split(/[\s,;]+/)
            .map((d) => d.trim())
            .filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Couldn't create that code.");
        return;
      }
      setPrefix("");
      setLabel("");
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  // Admin can't be granted by a code — enforced server-side too.
  const assignableRoles = Object.entries(ORG_ROLE_LABELS).filter(
    ([value]) => value !== OrgRole.ORGANISATION_ADMIN
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New access code</DialogTitle>
          <DialogDescription>
            A random suffix is always added, so a code can&apos;t be guessed from the prefix.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code-prefix">Prefix (optional)</Label>
              <Input
                id="code-prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="NAV-YOUTH-2027"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code-role">Joins as</Label>
              <select
                id="code-role"
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {assignableRoles.map(([value, roleLabel]) => (
                  <option key={value} value={value}>
                    {roleLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code-label">Label</Label>
            <Input
              id="code-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Youth Career Programme 2027"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code-cohort">Cohort</Label>
              <select
                id="code-cohort"
                value={cohortId}
                onChange={(e) => setCohortId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">None</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code-max">Max uses</Label>
              <Input
                id="code-max"
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code-expires">Expires</Label>
              <Input
                id="code-expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code-domains">Restrict to email domains (optional)</Label>
            <Input
              id="code-domains"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              placeholder="oslo.kommune.no, nav.no"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Creating…" : "Create code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
