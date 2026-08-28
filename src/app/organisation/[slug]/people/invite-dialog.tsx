"use client";

/**
 * Bulk invitation.
 *
 * Paste a class list, pick a role and cohort, get back copyable links. The
 * raw tokens are shown once, here, and never stored — only their hashes go
 * to the database.
 */

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { OrgRole } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ORG_ROLE_LABELS } from "@/lib/organisations/permissions";

interface Cohort {
  id: string;
  name: string;
}

interface Result {
  invitations: { email: string; url: string }[];
  skipped: { email: string; reason: string }[];
  invalidEmails: string[];
  seatWarning: string | null;
}

export function InvitePeopleDialog({
  organisationId,
  viewerRole,
  open,
  onOpenChange,
  onInvited,
}: {
  organisationId: string;
  slug: string;
  viewerRole: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
}) {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState<string>(OrgRole.PARTICIPANT);
  const [cohortId, setCohortId] = useState("");
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/organisations/${organisationId}/cohorts`)
      .then((r) => (r.ok ? r.json() : { cohorts: [] }))
      .then((d) => setCohorts(d.cohorts ?? []))
      .catch(() => setCohorts([]));
  }, [open, organisationId]);

  // Only an organisation admin may mint another admin — mirrors the same
  // rule enforced server-side, so the option simply isn't offered.
  const assignableRoles = Object.entries(ORG_ROLE_LABELS).filter(
    ([value]) =>
      value !== OrgRole.ORGANISATION_ADMIN || viewerRole === OrgRole.ORGANISATION_ADMIN
  );

  async function send() {
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/organisations/${organisationId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, role, cohortId: cohortId || null }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Couldn't send those invitations.");
        return;
      }
      setResult(data);
      onInvited();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setEmails("");
    setResult(null);
    setError(null);
    onOpenChange(false);
  }

  async function copy(url: string) {
    const absolute = `${window.location.origin}${url}`;
    await navigator.clipboard.writeText(absolute);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : reset())}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>
            Anyone who already has an Endeavrly account keeps it — accepting adds this
            organisation to their existing profile.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            {result.seatWarning && (
              <p className="text-sm text-amber-600 dark:text-amber-400">{result.seatWarning}</p>
            )}
            <p className="text-sm">
              {result.invitations.length} invitation
              {result.invitations.length === 1 ? "" : "s"} created. Share these links — they are
              shown once.
            </p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/50">
              {result.invitations.map((invitation) => (
                <div
                  key={invitation.email}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <span className="truncate">{invitation.email}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 shrink-0"
                    onClick={() => copy(invitation.url)}
                  >
                    {copied === invitation.url ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            {result.skipped.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Skipped {result.skipped.length}: already a member or already invited.
              </p>
            )}
            {result.invalidEmails.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Couldn&apos;t read: {result.invalidEmails.join(", ")}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="emails">Email addresses</Label>
              <Textarea
                id="emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={6}
                placeholder="One per line, or separated by commas"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="invite-role">Role</Label>
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {assignableRoles.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-cohort">Cohort (optional)</Label>
                <select
                  id="invite-cohort"
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
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={reset}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={reset} disabled={sending}>
                Cancel
              </Button>
              <Button onClick={send} disabled={sending || emails.trim().length < 3}>
                {sending ? "Creating…" : "Create invitations"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
