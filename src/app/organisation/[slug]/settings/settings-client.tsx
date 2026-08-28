"use client";

/**
 * Organisation settings — the privacy policy the institution chooses.
 *
 * Deliberately written in plain language about young people rather than in
 * the language of flags and roles. An administrator toggling these is making
 * a decision about children's data, and the copy should say so.
 */

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface Settings {
  allowIndividualParticipantView: boolean;
  advisorCanViewAssignedDetail: boolean;
  educatorCanViewCohortDetail: boolean;
  managerCanViewIndividualDetail: boolean;
  minimumAggregateGroupSize: number;
  requireParticipantDataSharingConsent: boolean;
  defaultMembershipDurationDays: number | null;
  participantPrivacyNotice: string | null;
}

interface Payload {
  organisation: {
    name: string;
    slug: string;
    type: string;
    settings: Settings | null;
    domains: { id: string; domain: string; verified: boolean; enrolmentPolicy: string }[];
  };
  licence: {
    status: string;
    planName: string | null;
    startDate: string;
    endDate: string | null;
    userLimit: number | null;
    activeUserCount: number;
  } | null;
  modules: string[];
}

const DEFAULTS: Settings = {
  allowIndividualParticipantView: false,
  advisorCanViewAssignedDetail: true,
  educatorCanViewCohortDetail: false,
  managerCanViewIndividualDetail: false,
  minimumAggregateGroupSize: 5,
  requireParticipantDataSharingConsent: true,
  defaultMembershipDurationDays: null,
  participantPrivacyNotice: null,
};

export function SettingsClient({
  organisationId,
  canEdit,
}: {
  organisationId: string;
  canEdit: boolean;
}) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [draft, setDraft] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/organisations/${organisationId}/settings`);
      if (response.ok) {
        const data: Payload = await response.json();
        setPayload(data);
        setDraft({ ...DEFAULTS, ...(data.organisation.settings ?? {}) });
      }
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch(`/api/organisations/${organisationId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  if (loading && !payload) return <Skeleton className="h-96 w-full" />;
  if (!payload) return <p className="text-muted-foreground">Couldn&apos;t load settings.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          What this organisation can see about the young people using Endeavrly through it.
        </p>
      </div>

      <section className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Privacy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Reflections, notes and journey text are never shared with an organisation under any
              setting. These controls only govern completion-style progress signals.
            </p>
          </div>
        </div>

        <SettingRow
          label="Show individual progress to staff"
          description="Off means every staff member sees aggregate figures only, including admins."
          checked={draft.allowIndividualParticipantView}
          disabled={!canEdit}
          onChange={(v) => set("allowIndividualParticipantView", v)}
        />

        {draft.allowIndividualParticipantView && (
          <div className="pl-4 border-l-2 border-border/60 space-y-5">
            <SettingRow
              label="Advisors can see their assigned participants"
              description="Only participants explicitly assigned to that advisor."
              checked={draft.advisorCanViewAssignedDetail}
              disabled={!canEdit}
              onChange={(v) => set("advisorCanViewAssignedDetail", v)}
            />
            <SettingRow
              label="Educators can see their own cohorts"
              description="Only participants in a cohort the educator belongs to."
              checked={draft.educatorCanViewCohortDetail}
              disabled={!canEdit}
              onChange={(v) => set("educatorCanViewCohortDetail", v)}
            />
            <SettingRow
              label="Managers can see individual progress"
              description="Not recommended. Managers run programmes, which are measured in aggregate."
              checked={draft.managerCanViewIndividualDetail}
              disabled={!canEdit}
              onChange={(v) => set("managerCanViewIndividualDetail", v)}
            />
          </div>
        )}

        <SettingRow
          label="Ask participants before sharing their progress"
          description="Each young person decides. Turning this off should have a legal basis you can point to."
          checked={draft.requireParticipantDataSharingConsent}
          disabled={!canEdit}
          onChange={(v) => set("requireParticipantDataSharingConsent", v)}
        />

        <div className="space-y-1.5">
          <Label htmlFor="min-group">Minimum group size for any statistic</Label>
          <Input
            id="min-group"
            type="number"
            min={3}
            max={100}
            value={draft.minimumAggregateGroupSize}
            disabled={!canEdit}
            onChange={(e) => set("minimumAggregateGroupSize", Number(e.target.value))}
            className="max-w-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            Below this, figures are hidden rather than shown. Can&apos;t go below 3.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notice">What participants see when they join</Label>
          <Textarea
            id="notice"
            rows={3}
            value={draft.participantPrivacyNotice ?? ""}
            disabled={!canEdit}
            onChange={(e) => set("participantPrivacyNotice", e.target.value || null)}
            placeholder="e.g. Your careers advisor will see how far you've got, not what you wrote."
          />
        </div>

        {canEdit && (
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
            {saved && <span className="text-sm text-primary">Saved</span>}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-2">
        <h3 className="font-medium">Licence</h3>
        {payload.licence ? (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              {payload.licence.planName ?? "Custom"} ·{" "}
              {payload.licence.status.toLowerCase()}
            </p>
            <p>
              {payload.licence.activeUserCount.toLocaleString()} of{" "}
              {payload.licence.userLimit?.toLocaleString() ?? "unlimited"} seats used
            </p>
            {payload.licence.endDate && (
              <p>
                Runs until{" "}
                {new Date(payload.licence.endDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            <p className="text-xs pt-1">
              {payload.modules.length} capabilities included. To change any of this, talk to
              Endeavrly.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active licence.</p>
        )}
      </section>
    </div>
  );
}

function SettingRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
