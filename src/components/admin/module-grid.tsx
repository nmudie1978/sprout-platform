"use client";

/**
 * Module picker. The only UI in the product that talks about modules by name,
 * which is the point: everywhere else asks the entitlement engine instead.
 *
 * Staff modules are visually separated so it is obvious at a glance that
 * enabling one is an organisational-tooling decision, not a participant one.
 */

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { MODULE_CATALOGUE } from "@/lib/entitlements/modules";

interface Props {
  selected: string[];
  disabled?: boolean;
  onSave: (modules: string[]) => void;
}

/**
 * NOTE: the draft is seeded from props once. Callers must pass a `key` that
 * changes when the saved module list changes (see the organisation and plan
 * pages), so a reload remounts the grid rather than leaving a stale draft
 * looking as though it were persisted. That is cheaper and less error-prone
 * than syncing state in an effect.
 */
export function ModuleGrid({ selected, disabled, onSave }: Props) {
  const [draft, setDraft] = useState<string[]>(selected);

  const dirty =
    draft.length !== selected.length || draft.some((m) => !selected.includes(m));

  function toggle(module: string) {
    setDraft((current) =>
      current.includes(module) ? current.filter((m) => m !== module) : [...current, module]
    );
  }

  const participantModules = MODULE_CATALOGUE.filter((m) => m.audience === "participant");
  const staffModules = MODULE_CATALOGUE.filter((m) => m.audience === "staff");

  return (
    <div className="space-y-5">
      <Section title="Participant capabilities">
        {participantModules.map((m) => (
          <ModuleCheckbox
            key={m.module}
            module={m.module}
            label={m.label}
            description={m.description}
            checked={draft.includes(m.module)}
            disabled={disabled}
            onToggle={toggle}
          />
        ))}
      </Section>

      <Section
        title="Staff capabilities"
        hint="Granted only to advisors, educators, managers and organisation admins — never to participants or parents."
      >
        {staffModules.map((m) => (
          <ModuleCheckbox
            key={m.module}
            module={m.module}
            label={m.label}
            description={m.description}
            checked={draft.includes(m.module)}
            disabled={disabled}
            onToggle={toggle}
          />
        ))}
      </Section>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={() => onSave(draft)}
          disabled={disabled || !dirty}
          className="bg-teal-600 hover:bg-teal-500"
        >
          {disabled ? "Saving…" : "Save modules"}
        </Button>
        {dirty && (
          <button
            type="button"
            onClick={() => setDraft(selected)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Reset
          </button>
        )}
        <span className="text-xs text-slate-500">{draft.length} enabled</span>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      {hint && <p className="text-xs text-slate-500 mb-2 mt-0.5">{hint}</p>}
      <div className="grid sm:grid-cols-2 gap-2 mt-2">{children}</div>
    </div>
  );
}

function ModuleCheckbox({
  module,
  label,
  description,
  checked,
  disabled,
  onToggle,
}: {
  module: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: (module: string) => void;
}) {
  return (
    <label
      className={`flex gap-2.5 rounded-lg border p-3 cursor-pointer transition-colors ${
        checked
          ? "border-teal-500/40 bg-teal-500/5"
          : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600"
      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(module)}
        disabled={disabled}
        className="mt-0.5 accent-teal-500"
      />
      <span className="min-w-0">
        <span className="block text-sm text-slate-100">{label}</span>
        <span className="block text-xs text-slate-500 leading-snug">{description}</span>
      </span>
    </label>
  );
}
