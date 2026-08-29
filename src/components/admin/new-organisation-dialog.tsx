"use client";

/**
 * Create an organisation. Deliberately minimal — name, type, country and a
 * contact. Everything commercial happens afterwards, on the organisation's
 * own page, so this form never becomes a wall.
 */

import { useState } from "react";

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

const ORGANISATION_TYPES = [
  ["SCHOOL", "School"],
  ["UNIVERSITY", "University"],
  ["COLLEGE", "College"],
  ["MUNICIPALITY", "Municipality"],
  ["PUBLIC_SECTOR", "Public sector"],
  ["EMPLOYMENT_SERVICE", "Employment service"],
  ["CAREER_GUIDANCE", "Career guidance"],
  ["EMPLOYER", "Employer"],
  ["TRAINING_PROVIDER", "Training provider"],
  ["NON_PROFIT", "Non-profit"],
  ["OTHER", "Other"],
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function NewOrganisationDialog({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("SCHOOL");
  const [country, setCountry] = useState("NO");
  const [contactEmail, setContactEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/platform/organisations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          country: country.trim().toUpperCase() || null,
          primaryContactEmail: contactEmail.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Couldn't create that organisation.");
        return;
      }
      setName("");
      setContactEmail("");
      onCreated();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle>New organisation</DialogTitle>
          <DialogDescription className="text-slate-400">
            Creates the customer record. Issue a licence next, on its page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="NAV Oslo"
              className="bg-slate-800 border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="org-type">Type</Label>
              <select
                id="org-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 rounded-md bg-slate-800 border border-slate-700 px-3 text-sm"
              >
                {ORGANISATION_TYPES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-country">Country</Label>
              <Input
                id="org-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                maxLength={2}
                placeholder="NO"
                className="bg-slate-800 border-slate-700 uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="org-contact">Primary contact email</Label>
            <Input
              id="org-contact"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="navn@nav.no"
              className="bg-slate-800 border-slate-700"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving || name.trim().length < 2}
            className="bg-teal-600 hover:bg-teal-500"
          >
            {saving ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
