"use client";

/**
 * Cohorts — classes, programmes, job-seeker groups, apprenticeship intakes.
 */

import { useCallback, useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { OrgCohortType, OrgRole } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { roleHasPermission } from "@/lib/organisations/permissions";

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  memberCount: number;
}

const COHORT_TYPE_LABELS: Record<string, string> = {
  CLASS: "Class",
  PROGRAMME: "Programme",
  JOB_SEEKER_GROUP: "Job seeker group",
  APPRENTICESHIP: "Apprenticeship",
  GRADUATE_PROGRAMME: "Graduate programme",
  EVENT: "Event",
  OTHER: "Other",
};

export function CohortsClient({
  organisationId,
  role,
}: {
  organisationId: string;
  role: string;
}) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const canCreate = roleHasPermission(role as OrgRole, "cohorts:create");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/organisations/${organisationId}/cohorts`);
      if (response.ok) setCohorts((await response.json()).cohorts ?? []);
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Cohorts</h2>
          <p className="text-sm text-muted-foreground">
            Group people so progress can be followed by class or programme.
          </p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New cohort
          </Button>
        )}
      </div>

      {loading && cohorts.length === 0 ? (
        <Skeleton className="h-40 w-full" />
      ) : cohorts.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/40 p-10 text-center">
          <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No cohorts yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {cohorts.map((cohort) => (
            <div
              key={cohort.id}
              className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{cohort.name}</h3>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {COHORT_TYPE_LABELS[cohort.type] ?? cohort.type}
                </Badge>
              </div>
              {cohort.description && (
                <p className="text-sm text-muted-foreground">{cohort.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {cohort.memberCount} member{cohort.memberCount === 1 ? "" : "s"}
                </span>
                <span>{cohort.status.toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewCohortDialog
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

function NewCohortDialog({
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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>(OrgCohortType.PROGRAMME);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/organisations/${organisationId}/cohorts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          type,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Couldn't create that cohort.");
        return;
      }
      setName("");
      setDescription("");
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New cohort</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cohort-name">Name</Label>
            <Input
              id="cohort-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Youth Career Programme 2027"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cohort-type">Type</Label>
            <select
              id="cohort-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {Object.entries(COHORT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cohort-desc">Description</Label>
            <Textarea
              id="cohort-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || name.trim().length < 1}>
            {saving ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
