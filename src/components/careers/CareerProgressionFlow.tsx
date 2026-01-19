"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CareerProgressionData {
  entry: string[];
  core: string[];
  next: string[];
}

interface CareerProgressionFlowProps {
  progression: CareerProgressionData;
  compact?: boolean;
  className?: string;
}

interface StageProps {
  label: string;
  sublabel: string;
  roles: string[];
  colorClass: string;
  bgClass: string;
}

function Stage({ label, sublabel, roles, colorClass, bgClass }: StageProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", colorClass)}>
          {label}
        </span>
        <span className="text-[9px] text-muted-foreground">
          {sublabel}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => (
          <span
            key={role}
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
              "border border-transparent",
              bgClass,
              colorClass
            )}
          >
            {role}
          </span>
        ))}
      </div>
    </div>
  );
}

function StageConnector() {
  return (
    <div className="hidden md:flex items-center justify-center px-1 py-4">
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
    </div>
  );
}

function MobileStageConnector() {
  return (
    <div className="flex md:hidden items-center justify-center py-1">
      <div className="h-3 w-px bg-muted-foreground/20" />
    </div>
  );
}

export function CareerProgressionFlow({
  progression,
  compact = true,
  className,
}: CareerProgressionFlowProps) {
  // Don't render if no progression data
  if (!progression || (!progression.entry.length && !progression.core.length && !progression.next.length)) {
    return null;
  }

  const stages: StageProps[] = [
    {
      label: "Entry",
      sublabel: "Beginner",
      roles: progression.entry,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Core role",
      sublabel: "Intermediate",
      roles: progression.core,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Next roles",
      sublabel: "Advanced",
      roles: progression.next,
      colorClass: "text-purple-600 dark:text-purple-400",
      bgClass: "bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  return (
    <div className={cn("", className)}>
      {/* Desktop: horizontal layout */}
      <div className="hidden md:flex items-start">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex items-start flex-1">
            <Stage {...stage} />
            {index < stages.length - 1 && <StageConnector />}
          </div>
        ))}
      </div>

      {/* Mobile: stacked vertical layout */}
      <div className="flex md:hidden flex-col">
        {stages.map((stage, index) => (
          <div key={stage.label}>
            <Stage {...stage} />
            {index < stages.length - 1 && <MobileStageConnector />}
          </div>
        ))}
      </div>
    </div>
  );
}
