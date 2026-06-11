"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CareerProgressionData {
  entry: string[];
  core: string[];
  next?: string[];
  nextExpert?: string[];
  nextLead?: string[];
}

interface CareerProgressionFlowProps {
  progression: CareerProgressionData;
  className?: string;
}

function Chips({ roles, colorClass, bgClass }: { roles: string[]; colorClass: string; bgClass: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <span
          key={role}
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-transparent",
            bgClass,
            colorClass,
          )}
        >
          {role}
        </span>
      ))}
    </div>
  );
}

function Stage({
  label,
  sublabel,
  roles,
  colorClass,
  bgClass,
}: {
  label: string;
  sublabel: string;
  roles: string[];
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", colorClass)}>{label}</span>
        <span className="text-[9px] text-muted-foreground">{sublabel}</span>
      </div>
      <Chips roles={roles} colorClass={colorClass} bgClass={bgClass} />
    </div>
  );
}

/** The forked third stage: two labelled rows (Expert / Lead). */
function ForkStage({ expert, lead }: { expert: string[]; lead: string[] }) {
  return (
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px]" aria-hidden>
          🛠
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
          Expert
        </span>
        <span className="text-[9px] text-muted-foreground">stay hands-on</span>
      </div>
      <Chips roles={expert} colorClass="text-violet-600 dark:text-violet-400" bgClass="bg-violet-50 dark:bg-violet-950/40" />
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-[10px]" aria-hidden>
          👥
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
          Lead
        </span>
        <span className="text-[9px] text-muted-foreground">lead people</span>
      </div>
      <Chips roles={lead} colorClass="text-amber-600 dark:text-amber-400" bgClass="bg-amber-50 dark:bg-amber-950/40" />
    </div>
  );
}

function Connector() {
  return (
    <div className="hidden md:flex items-center justify-center px-1 py-4">
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/65" />
    </div>
  );
}

export function CareerProgressionFlow({ progression, className }: CareerProgressionFlowProps) {
  const { entry, core } = progression;
  const forked = !!(progression.nextExpert?.length && progression.nextLead?.length);
  const flatNext = progression.next ?? [];

  // Nothing to show.
  if (!entry.length && !core.length && !flatNext.length && !forked) return null;

  return (
    <div className={cn("", className)}>
      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-0">
        <Stage
          label="Entry"
          sublabel="Beginner"
          roles={entry}
          colorClass="text-emerald-600 dark:text-emerald-400"
          bgClass="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <Connector />
        <Stage
          label="Core role"
          sublabel="Intermediate"
          roles={core}
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-50 dark:bg-blue-950/40"
        />
        <Connector />
        {forked ? (
          <ForkStage expert={progression.nextExpert!} lead={progression.nextLead!} />
        ) : (
          <Stage
            label="Grows into"
            sublabel="Advanced"
            roles={flatNext}
            colorClass="text-teal-600 dark:text-teal-400"
            bgClass="bg-teal-50 dark:bg-teal-950/40"
          />
        )}
      </div>
      {forked && (
        <p className="mt-2 text-[10px] text-muted-foreground/70">
          Two ways to grow — deepen your craft or lead people. Neither is higher; they&apos;re different
          directions.
        </p>
      )}
    </div>
  );
}
