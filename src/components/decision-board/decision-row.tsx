"use client";
import { ChevronUp, ChevronDown, GripVertical, X, Undo2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { InterestLevelStars } from "@/components/interest-level/interest-level-rating";
import type { DecisionRow } from "@/lib/decision-board/types";
import type { Career } from "@/lib/career-pathways";

const MEDAL = ["🥇", "🥈", "🥉"];

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
    <div
      className={cn(
        "rounded-card border border-border/60 bg-card/40",
        row.ruledOut && "opacity-50",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {row.rank !== null && (
          <span className="w-6 shrink-0 text-center text-sm font-bold tabular-nums">
            {row.rank <= 3 ? MEDAL[row.rank - 1] : row.rank}
          </span>
        )}
        <span className="shrink-0 text-sm">{row.emoji}</span>
        <button onClick={props.onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="truncate text-xs font-medium text-foreground/90">{row.title}</span>
        </button>
        {row.interest != null && <InterestLevelStars value={row.interest} />}
        <span className="hidden text-[10px] uppercase tracking-wide text-muted-foreground/60 sm:inline">
          {stageLabel}
        </span>
        {career?.avgSalary && (
          <span className="hidden text-[10px] text-muted-foreground/70 md:inline">
            {career.avgSalary}
          </span>
        )}
        {reflectionsCount > 0 && <FileText className="h-3 w-3 text-muted-foreground/65" />}
        {!row.ruledOut && (
          <span className="flex shrink-0 items-center gap-0.5">
            <button
              onClick={props.onUp}
              aria-label="Move up"
              className="p-0.5 text-muted-foreground/65 hover:text-foreground"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={props.onDown}
              aria-label="Move down"
              className="p-0.5 text-muted-foreground/65 hover:text-foreground"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <GripVertical className="h-3.5 w-3.5 cursor-grab text-muted-foreground/25" />
            <button
              onClick={props.onRelegate}
              aria-label="Out of the running"
              className="p-0.5 text-muted-foreground/60 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        {row.ruledOut && (
          <button
            onClick={props.onRestore}
            aria-label="Back into the running"
            className="p-0.5 text-muted-foreground/65 hover:text-foreground"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {props.expanded && (
        <div className="space-y-1.5 border-t border-border/30 px-3 py-2 text-[11px] text-muted-foreground/70">
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
