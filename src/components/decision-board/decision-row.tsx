"use client";
import { ChevronUp, ChevronDown, MoreVertical, X, Undo2, FileText, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { InterestLevelStars } from "@/components/interest-level/interest-level-rating";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseSalaryRangeK } from "@/lib/salary-progression";
import type { DecisionRow } from "@/lib/decision-board/types";
import type { Career } from "@/lib/career-pathways";

/** The board-wide pay span, in thousands of NOK, used to place each card's
 *  range bar on a shared scale so two careers compare at a glance. */
export type SalaryDomain = { minK: number; maxK: number };

/** A slim range bar showing this career's pay band within the board's overall
 *  span. Pure visual aid — the exact figures sit just above it. */
function SalaryBar({ band, domain }: { band: SalaryDomain; domain: SalaryDomain }) {
  const span = domain.maxK - domain.minK || 1;
  const left = Math.max(0, ((band.minK - domain.minK) / span) * 100);
  const width = Math.min(100 - left, Math.max(((band.maxK - band.minK) / span) * 100, 4));
  return (
    <div
      className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/50"
      aria-hidden
    >
      <div
        className="absolute inset-y-0 rounded-full bg-gradient-to-r from-primary/45 to-primary/80"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
}

/** Three calm dots tracking how far the journey has come:
 *  1 Discover · 2 Understand · 3 Complete. A second, honest signal alongside
 *  the interest rating — both drawn from real data, never invented. */
function JourneyDots({ progress }: { progress: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            i <= progress ? "bg-primary/70" : "bg-muted-foreground/25",
          )}
        />
      ))}
    </span>
  );
}

export function DecisionRowView(props: {
  row: DecisionRow;
  career: Career | undefined;
  stageLabel: string;
  reflections: string[];
  salaryDomain?: SalaryDomain;
  expanded: boolean;
  onToggle: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onRelegate?: () => void;
  onRestore?: () => void;
}) {
  const { row, career, stageLabel, reflections, salaryDomain } = props;
  const reflectionsCount = reflections.length;
  const band = parseSalaryRangeK(career?.avgSalary);
  const isLeader = !row.ruledOut && row.rank === 1;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-card border transition-colors",
        row.ruledOut
          ? "border-border/40 bg-card/20 opacity-60 hover:opacity-100"
          : isLeader
            ? "border-primary/40 bg-primary/[0.05] hover:bg-primary/[0.07]"
            : "border-border/50 bg-card/40 hover:bg-muted/30",
      )}
    >
      {/* Podium accent — the leading choice, felt rather than announced. */}
      {isLeader && (
        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-emerald-400/50" />
      )}

      <div className="flex items-start gap-3 px-3 py-3 sm:px-4">
        {/* Rank chip */}
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
            row.ruledOut
              ? "bg-muted/50 text-muted-foreground/60"
              : isLeader
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "border border-border/60 text-foreground/60",
          )}
        >
          {row.rank ?? "–"}
        </span>

        {/* Emoji */}
        <span className="mt-0.5 shrink-0 text-2xl leading-none">{row.emoji}</span>

        {/* Main column */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              onClick={props.onToggle}
              aria-expanded={props.expanded}
              className="truncate text-sm font-semibold text-foreground/90 hover:text-foreground"
            >
              {row.title}
            </button>
            {isLeader && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                Your pick
              </span>
            )}
            {reflectionsCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                <FileText className="h-3 w-3" />
                {reflectionsCount}
              </span>
            )}
          </div>

          {/* Signals — interest rating + journey progress, both real data */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {row.interest != null ? (
              <InterestLevelStars value={row.interest} />
            ) : (
              <span className="text-[11px] text-muted-foreground/45">Not rated</span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
              <JourneyDots progress={row.progress} />
              {stageLabel}
            </span>
          </div>

          {/* Salary — figures + comparison bar */}
          {career?.avgSalary && (
            <div className="mt-2 space-y-1">
              <p className="text-[11px] tabular-nums text-muted-foreground/70">{career.avgSalary}</p>
              {band && salaryDomain && <SalaryBar band={band} domain={salaryDomain} />}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-start gap-0.5">
          {row.ruledOut ? (
            <button
              onClick={props.onRestore}
              aria-label="Back into the running"
              className="rounded-md p-1.5 text-muted-foreground/65 hover:bg-muted/50 hover:text-foreground"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          ) : (
            <>
              <GripVertical className="mt-1 hidden h-4 w-4 cursor-grab text-muted-foreground/20 opacity-0 transition-opacity group-hover:opacity-100 sm:inline" />
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Ranking options"
                  className="rounded-md p-1.5 text-muted-foreground/55 outline-none hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={props.onUp} disabled={!props.onUp}>
                    <ChevronUp className="mr-2 h-4 w-4" /> Move up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={props.onDown} disabled={!props.onDown}>
                    <ChevronDown className="mr-2 h-4 w-4" /> Move down
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={props.onRelegate}
                    className="text-destructive focus:text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" /> Rule out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <button
            onClick={props.onToggle}
            aria-label={props.expanded ? "Hide details" : "Show details"}
            aria-expanded={props.expanded}
            className="rounded-md p-1.5 text-muted-foreground/55 hover:bg-muted/50 hover:text-foreground"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", props.expanded && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {props.expanded && (
        <div className="space-y-1.5 border-t border-border/40 bg-muted/15 px-4 py-3 text-[11px] text-muted-foreground/70">
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
