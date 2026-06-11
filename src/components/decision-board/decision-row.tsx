"use client";
import { ChevronUp, ChevronDown, GripVertical, X, Undo2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { InterestLevelStars } from "@/components/interest-level/interest-level-rating";
import type { DecisionRow } from "@/lib/decision-board/types";
import type { Career } from "@/lib/career-pathways";

const MEDAL = ["🥇", "🥈", "🥉"];

// Shared grid template — the column header and every row use this identical
// class string so columns stay aligned at every breakpoint. Status + Salary
// columns appear from `md` up (matching the cells' `hidden md:block`); the
// track count changes with them so the header never drifts from the rows.
//   base: Rank | Career | Rating | Actions      (4 tracks)
//   md+ : Rank | Career | Rating | Status | Salary | Actions   (6 tracks)
export const DB_ROW_GRID =
  "grid items-center gap-x-3 px-3 grid-cols-[2rem_minmax(0,1fr)_auto_auto] " +
  "md:grid-cols-[2rem_minmax(0,1fr)_5.5rem_6rem_11rem_auto]";

export function DecisionRowView(props: {
  row: DecisionRow;
  career: Career | undefined;
  stageLabel: string;
  reflections: string[];
  expanded: boolean;
  onToggle: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onRelegate?: () => void;
  onRestore?: () => void;
}) {
  const { row, career, stageLabel, reflections } = props;
  const reflectionsCount = reflections.length;

  return (
    <div className={cn("border-b border-border/40 last:border-b-0", row.ruledOut && "opacity-50")}>
      {/* Table row */}
      <div className={cn(DB_ROW_GRID, "py-2 hover:bg-muted/40 transition-colors")}>
        {/* Rank */}
        <span className="text-center text-sm font-bold tabular-nums">
          {row.rank !== null ? (row.rank <= 3 ? MEDAL[row.rank - 1] : row.rank) : ""}
        </span>

        {/* Career (emoji + title) — clicking toggles the detail row */}
        <button
          onClick={props.onToggle}
          className="flex min-w-0 items-center gap-2 text-left"
          aria-expanded={props.expanded}
        >
          <span className="shrink-0 text-sm leading-none">{row.emoji}</span>
          <span className="truncate text-xs font-medium text-foreground/90">{row.title}</span>
          {reflectionsCount > 0 && <FileText className="h-3 w-3 shrink-0 text-muted-foreground/65" />}
        </button>

        {/* Rating */}
        <span className="flex justify-start md:justify-center">
          {row.interest != null ? (
            <InterestLevelStars value={row.interest} />
          ) : (
            <span className="text-[10px] text-muted-foreground/40">—</span>
          )}
        </span>

        {/* Status */}
        <span className="hidden text-center text-[10px] uppercase tracking-wide text-muted-foreground/65 md:block">
          {stageLabel}
        </span>

        {/* Salary */}
        <span className="hidden whitespace-nowrap text-right text-[10px] tabular-nums text-muted-foreground/75 md:block">
          {career?.avgSalary ?? ""}
        </span>

        {/* Actions */}
        <span className="flex shrink-0 items-center justify-end gap-0.5">
          {!row.ruledOut ? (
            <>
              <button
                onClick={props.onUp}
                aria-label="Move up"
                className="p-0.5 text-muted-foreground/65 hover:text-foreground disabled:opacity-30"
                disabled={!props.onUp}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={props.onDown}
                aria-label="Move down"
                className="p-0.5 text-muted-foreground/65 hover:text-foreground disabled:opacity-30"
                disabled={!props.onDown}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <GripVertical className="hidden h-3.5 w-3.5 cursor-grab text-muted-foreground/25 sm:inline" />
              <button
                onClick={props.onRelegate}
                aria-label="Out of the running"
                className="p-0.5 text-muted-foreground/60 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <button
              onClick={props.onRestore}
              aria-label="Back into the running"
              className="p-0.5 text-muted-foreground/65 hover:text-foreground"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
          )}
        </span>
      </div>

      {/* Expanded detail — spans the full row width */}
      {props.expanded && (
        <div className="space-y-1.5 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground/70">
          {/* Salary on small screens, where the column is hidden */}
          {career?.avgSalary && (
            <p className="md:hidden">
              <span className="font-medium text-foreground/70">Pay: </span>
              {career.avgSalary}
            </p>
          )}
          {career?.description && (
            <p>
              <span className="font-medium text-foreground/70">What it is: </span>
              {career.description}
            </p>
          )}
          {career?.educationPath && (
            <p>
              <span className="font-medium text-foreground/70">Getting in: </span>
              {career.educationPath}
            </p>
          )}
          {reflectionsCount > 0 && (
            <div className="pt-0.5">
              <p className="font-medium text-foreground/70">Your reflections</p>
              <ul className="mt-0.5 space-y-0.5">
                {reflections.map((r, i) => (
                  <li key={i} className="text-muted-foreground/60">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
