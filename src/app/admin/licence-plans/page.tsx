"use client";

/**
 * Licence plans — the commercial packaging surface.
 *
 * Endeavrly can invent, rename and repackage plans here without a deploy,
 * because no application code ever branches on a plan key.
 */

import { useCallback, useEffect, useState } from "react";
import { Layers, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlatformShell, formatMinor } from "@/components/admin/platform-shell";
import { ModuleGrid } from "@/components/admin/module-grid";

interface Plan {
  id: string;
  key: string;
  name: string;
  description: string | null;
  defaultModules: string[];
  defaultUserLimit: number | null;
  defaultTermMonths: number | null;
  listPriceMinor: number | null;
  currency: string | null;
  isActive: boolean;
  licenceCount: number;
}

export default function LicencePlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/platform/licence-plans");
      if (response.ok) setPlans((await response.json()).plans ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveModules(planId: string, modules: string[]) {
    setSaving(true);
    try {
      await fetch(`/api/admin/platform/licence-plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultModules: modules }),
      });
      await load();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PlatformShell
      title="Plans & modules"
      subtitle="Commercial packaging. Application code never branches on a plan name."
      backHref="/admin/organisations"
      onRefresh={load}
      refreshing={loading}
      actions={
        <Button size="sm" className="bg-teal-600 hover:bg-teal-500" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New plan
        </Button>
      }
    >
      {loading && plans.length === 0 ? (
        <Skeleton className="h-40 w-full bg-slate-800" />
      ) : plans.length === 0 ? (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-10 text-center">
          <Layers className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            No plans yet. Create one, or issue custom licences without a plan.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-100">{plan.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{plan.key}</p>
                </div>
                {!plan.isActive && (
                  <Badge variant="outline" className="text-[10px] text-slate-400">
                    Inactive
                  </Badge>
                )}
              </div>
              {plan.description && (
                <p className="text-sm text-slate-400">{plan.description}</p>
              )}
              <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                <span>{plan.defaultModules.length} modules</span>
                <span>
                  {plan.defaultUserLimit
                    ? `${plan.defaultUserLimit.toLocaleString()} seats`
                    : "Unlimited seats"}
                </span>
                <span>{plan.defaultTermMonths ? `${plan.defaultTermMonths} months` : "No term"}</span>
                <span>{formatMinor(plan.listPriceMinor, plan.currency ?? "NOK")}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  {plan.licenceCount} licence{plan.licenceCount === 1 ? "" : "s"} issued
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-teal-400 hover:text-teal-300 h-7"
                  onClick={() => setEditing(plan)}
                >
                  Edit modules
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-3xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.name} — default modules</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Changes apply to licences issued from now on. Existing licences keep the modules they
            were issued with.
          </p>
          {editing && (
            <ModuleGrid
              key={editing.defaultModules.join(",")}
              selected={editing.defaultModules}
              disabled={saving}
              onSave={(modules) => saveModules(editing.id, modules)}
            />
          )}
        </DialogContent>
      </Dialog>

      <NewPlanDialog
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

function NewPlanDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [userLimit, setUserLimit] = useState("");
  const [termMonths, setTermMonths] = useState("12");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/platform/licence-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
          name: name.trim(),
          description: description.trim() || null,
          defaultModules: [],
          defaultUserLimit: userLimit ? Number(userLimit) : null,
          defaultTermMonths: termMonths ? Number(termMonths) : null,
          currency: "NOK",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Couldn't create that plan.");
        return;
      }
      setKey("");
      setName("");
      setDescription("");
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle>New licence plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-key">Key</Label>
              <Input
                id="plan-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="EDUCATION_PLUS"
                className="bg-slate-800 border-slate-700 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Education Plus"
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-desc">Description</Label>
            <Input
              id="plan-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-seats">Default seats</Label>
              <Input
                id="plan-seats"
                type="number"
                min={1}
                value={userLimit}
                onChange={(e) => setUserLimit(e.target.value)}
                placeholder="Unlimited"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-term">Term (months)</Label>
              <Input
                id="plan-term"
                type="number"
                min={1}
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Modules are chosen after creating the plan.
          </p>
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving || key.trim().length < 2 || name.trim().length < 2}
            className="bg-teal-600 hover:bg-teal-500"
          >
            {saving ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
