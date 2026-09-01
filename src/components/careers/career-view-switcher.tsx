"use client";

import { LayoutGrid, Rows3, StretchHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ViewMode } from "@/components/career-card-v2";

/**
 * Segmented control for choosing how the careers catalogue is rendered.
 *
 * The three renderers already exist in career-card-v2 (ListRow, SmallCard,
 * LargeCard); this only lets people choose between them. Labels are plain
 * English rather than icon-only, so the choice is legible without hovering.
 */

export const CAREER_VIEW_MODES = ["list", "small", "large"] as const;

export const CAREER_VIEW_OPTIONS: {
  mode: ViewMode;
  label: string;
  description: string;
  Icon: typeof Rows3;
}[] = [
  {
    mode: "list",
    label: "Table",
    description: "Compact rows — best for comparing salary, growth and demand",
    Icon: Rows3,
  },
  {
    mode: "small",
    label: "Cards",
    description: "A grid of cards with a taste of the day-to-day",
    Icon: LayoutGrid,
  },
  {
    mode: "large",
    label: "Detailed",
    description: "Fewer, richer cards with skills and salary",
    Icon: StretchHorizontal,
  },
];

export function CareerViewSwitcher({
  viewMode,
  onChange,
  className,
}: {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Choose how careers are displayed"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-control border border-border bg-card/60 p-0.5",
        className
      )}
    >
      {CAREER_VIEW_OPTIONS.map(({ mode, label, description, Icon }) => {
        const active = viewMode === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={active}
            title={description}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-[calc(var(--radius)-0.35rem)] px-3 min-h-[38px] sm:min-h-0 sm:px-2.5 sm:py-1 text-xs font-medium transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {/* The label is the accessible name on wide screens; on narrow
                ones it collapses to the icon, so keep a text alternative. */}
            <span className="hidden sm:inline">{label}</span>
            <span className="sr-only sm:hidden">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
