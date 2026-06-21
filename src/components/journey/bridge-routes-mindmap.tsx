"use client";

/**
 * Bridge Routes Mindmap — view + dialog
 *
 * A calm map of routes back into work for the Clarity foundation stage
 * `other`. Desktop: a left→right fan (HTML nodes over an SVG edge layer, using
 * the pure `layoutMindmap`). Mobile: a vertical accordion of the same model.
 * Leaves are *explore*, not checkboxes — no progress mechanics.
 */

import { ExternalLink } from "lucide-react";
import type { BridgeBranch, BridgeMindmap } from "../../lib/journey/bridge-mindmap-types";
import { layoutMindmap } from "./bridge-mindmap-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

function leafClasses(state: string, navFact?: boolean): string {
  if (state === "tried") return "border-border bg-muted/40 text-muted-foreground line-through";
  if (navFact) return "border-teal-500 bg-teal-500/10 text-foreground shadow-[0_0_0_3px_rgba(20,184,166,0.12)]";
  return "border-teal-500/70 bg-background text-foreground";
}

function branchClasses(branch: BridgeBranch): string {
  if (branch.kind === "tried") return "bg-muted/50 text-muted-foreground border-border";
  if (branch.kind === "workplace-nav") return "bg-teal-600 text-white border-teal-600";
  if (branch.emphasis) return "bg-teal-500/15 text-teal-900 dark:text-teal-100 border-teal-500 ring-2 ring-teal-500/40";
  return "bg-teal-500/10 text-teal-900 dark:text-teal-100 border-teal-500/50";
}

/** Desktop fan. */
function MindmapFan({ model }: { model: BridgeMindmap }) {
  const L = layoutMindmap(model, { width: 920 });
  return (
    <div className="hidden md:block overflow-x-auto">
      <div className="relative" style={{ width: L.width, height: L.height }}>
        <svg
          className="absolute inset-0 pointer-events-none"
          width={L.width}
          height={L.height}
          viewBox={`0 0 ${L.width} ${L.height}`}
          aria-hidden
        >
          {L.edges.map((e, i) => (
            <path key={i} d={e.d} fill="none" className="stroke-teal-500/40" strokeWidth={2} />
          ))}
        </svg>

        {/* centre */}
        <div
          className="absolute rounded-2xl bg-teal-700 text-white p-3 flex flex-col justify-center"
          style={{ left: L.center.x, top: L.center.y, width: L.center.w, height: L.center.h }}
        >
          <span className="text-[10px] uppercase tracking-wide text-teal-200">Your bridge</span>
          <span className="text-sm font-semibold leading-tight">Back into work as {L.center.data.targetCareer}</span>
          {L.center.data.previousOccupation && (
            <span className="text-[11px] text-teal-200 mt-0.5">from {L.center.data.previousOccupation}</span>
          )}
        </div>

        {/* branches + leaves */}
        {L.branches.map((b) => (
          <div key={b.branch.id}>
            <div
              className={`absolute rounded-xl border px-3 flex items-center text-[13px] font-semibold ${branchClasses(b.branch)}`}
              style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
            >
              {b.branch.title}
            </div>
            {b.leaves.map((lf) => (
              <div
                key={lf.leaf.id}
                className={`absolute rounded-lg border px-3 py-1.5 text-[12px] flex flex-col justify-center overflow-hidden ${leafClasses(lf.leaf.state, lf.leaf.navFact)}`}
                style={{ left: lf.x, top: lf.y, width: lf.w, height: lf.h }}
              >
                <span className="font-medium leading-tight line-clamp-1">{lf.leaf.label}</span>
                {lf.leaf.detail && (
                  <span className="text-[10.5px] opacity-70 leading-tight line-clamp-1">{lf.leaf.detail}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mobile accordion. */
function MindmapAccordion({ model }: { model: BridgeMindmap }) {
  return (
    <div className="md:hidden space-y-2">
      <div className="rounded-xl bg-teal-700 text-white p-3">
        <span className="text-[10px] uppercase tracking-wide text-teal-200">Your bridge</span>
        <p className="text-sm font-semibold leading-tight">Back into work as {model.center.targetCareer}</p>
        {model.center.previousOccupation && (
          <p className="text-[11px] text-teal-200">from {model.center.previousOccupation}</p>
        )}
      </div>
      {model.branches.map((branch) => (
        <details
          key={branch.id}
          open={branch.emphasis}
          className={`rounded-xl border ${branch.kind === "tried" ? "border-border bg-muted/40" : "border-teal-500/40"}`}
        >
          <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold flex items-center gap-2">
            {branch.kind === "workplace-nav" && (
              <span className="text-[9px] font-bold rounded bg-teal-700 text-white px-1.5 py-0.5">NAV</span>
            )}
            <span className={branch.kind === "tried" ? "text-muted-foreground" : ""}>{branch.title}</span>
          </summary>
          <ul className="px-3 pb-3 space-y-2">
            {branch.leaves.map((lf) => (
              <li
                key={lf.id}
                className={`text-[13px] ${lf.state === "tried" ? "text-muted-foreground line-through" : ""}`}
              >
                <span className="font-medium break-words">{lf.label}</span>
                {lf.detail && <p className="text-[11.5px] text-muted-foreground mt-0.5 break-words">{lf.detail}</p>}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

/** Inner visual — usable on a page or inside the dialog. */
export function BridgeMindmapView({ model }: { model: BridgeMindmap }) {
  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <MindmapFan model={model} />
      <MindmapAccordion model={model} />
      <p className="mt-4 text-[11px] text-muted-foreground flex items-center gap-1">
        <ExternalLink className="h-3 w-3" /> NAV routes are guidance — confirm details with your NAV advisor on nav.no.
      </p>
    </div>
  );
}

export function BridgeRoutesMindmap({
  model,
  open,
  onClose,
}: {
  model: BridgeMindmap;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Routes back into work</DialogTitle>
          <DialogDescription>
            Avenues to explore — glowing ones are still untried, greyed ones you&apos;ve already tried.
          </DialogDescription>
        </DialogHeader>
        <BridgeMindmapView model={model} />
      </DialogContent>
    </Dialog>
  );
}
