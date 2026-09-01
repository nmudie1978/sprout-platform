"use client";

/**
 * Issue a licence to an organisation.
 *
 * Choosing a plan prefills seats, term and modules; every one of them stays
 * editable, because the whole point of the model is that a bespoke contract
 * needs no new plan.
 */

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Plan {
  id: string;
  key: string;
  name: string;
  defaultModules: string[];
  defaultUserLimit: number | null;
  defaultTermMonths: number | null;
  listPriceMinor: number | null;
  currency: string | null;
}

interface Props {
  organisationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIssued: () => void;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function IssueLicenceDialog({ organisationId, open, onOpenChange, onIssued }: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<string>("");
  const [status, setStatus] = useState("TRIAL");
  const [startDate, setStartDate] = useState(isoDate(new Date()));
  const [endDate, setEndDate] = useState("");
  const [userLimit, setUserLimit] = useState("");
  const [annualValue, setAnnualValue] = useState("");
  const [contractReference, setContractReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/platform/licence-plans")
      .then((r) => (r.ok ? r.json() : { plans: [] }))
      .then((d) => setPlans(d.plans ?? []))
      .catch(() => setPlans([]));
  }, [open]);

  // Prefill from the chosen plan — a starting point, not a constraint.
  useEffect(() => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    if (plan.defaultUserLimit) setUserLimit(String(plan.defaultUserLimit));
    if (plan.defaultTermMonths) {
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + plan.defaultTermMonths);
      setEndDate(isoDate(end));
    }
    if (plan.listPriceMinor) setAnnualValue(String(plan.listPriceMinor / 100));
  }, [planId, plans, startDate]);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/platform/organisations/${organisationId}/licences`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            licencePlanId: planId || null,
            status,
            startDate,
            endDate: endDate || null,
            userLimit: userLimit ? Number(userLimit) : null,
            annualValueMinor: annualValue ? Math.round(Number(annualValue) * 100) : null,
            currency: "NOK",
            contractReference: contractReference || null,
            trialEndsAt: status === "TRIAL" && endDate ? endDate : null,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Couldn't issue that licence.");
        return;
      }
      onIssued();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const selectedPlan = plans.find((p) => p.id === planId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue licence</DialogTitle>
          <DialogDescription className="text-slate-400">
            Seeds modules from the plan, then keeps its own copy — editing the plan later never
            changes this licence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="plan">Plan</Label>
            <select
              id="plan"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full h-10 rounded-md bg-slate-800 border border-slate-700 px-3 text-sm"
            >
              <option value="">Custom (no plan)</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {selectedPlan && (
              <p className="text-xs text-slate-500">
                {selectedPlan.defaultModules.length} modules by default
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-md bg-slate-800 border border-slate-700 px-3 text-sm"
              >
                {["TRIAL", "ACTIVE", "SUSPENDED"].map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seats">Seat limit</Label>
              <Input
                id="seats"
                type="number"
                min={1}
                value={userLimit}
                onChange={(e) => setUserLimit(e.target.value)}
                placeholder="Unlimited"
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start">Start date</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">End date</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="value">Annual value (NOK)</Label>
              <Input
                id="value"
                type="number"
                min={0}
                value={annualValue}
                onChange={(e) => setAnnualValue(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref">Contract reference</Label>
              <Input
                id="ref"
                value={contractReference}
                onChange={(e) => setContractReference(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Recorded for reporting only. Endeavrly takes no payment in the product.
          </p>

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="bg-teal-600 hover:bg-teal-500">
            {saving ? "Issuing…" : "Issue licence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
