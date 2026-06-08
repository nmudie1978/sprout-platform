"use client";
import { useState } from "react";
import { getCareerById } from "@/lib/career-pathways";
import { buildDecisionBoard } from "@/lib/decision-board/build";
import type { DecisionRow } from "@/lib/decision-board/types";
import { useDecisionInputs } from "@/hooks/use-decision-inputs";
import { useDecisionBoard } from "@/hooks/use-decision-board";
import { DecisionRowView } from "./decision-row";

const STAGE_LABEL = ["Not started", "Discover", "Understand", "Complete"];

/** Short, honest reason for why the leader sits at #1. */
function leadReason(leader: DecisionRow): string {
  const bits: string[] = [];
  if (leader.interest === 5) bits.push("highest interest");
  else if (leader.interest != null) bits.push("your top-rated");
  if (leader.progress === 3) bits.push("journey complete");
  return bits.join(" · ");
}

export function DecisionBoardTab() {
  const { inputs, reflections, userId } = useDecisionInputs();
  const { board, save } = useDecisionBoard();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);

  const { ranked, ruledOut, leader } = buildDecisionBoard(inputs, board);

  // Fewer than 2 explored careers — nothing to weigh up yet.
  if (userId && inputs.length < 2) {
    return (
      <div className="rounded-card border border-border/60 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground/70">
        Explore a couple of careers and they&apos;ll start stacking up here — ranked by how
        much each one pulls at you.
      </div>
    );
  }

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const persistOrder = (rows: DecisionRow[]) =>
    save({ order: rows.map((r) => r.careerId), ruledOut: board.ruledOut });

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= ranked.length) return;
    const next = [...ranked];
    [next[i], next[j]] = [next[j], next[i]];
    persistOrder(next);
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return setDragId(null);
    const from = ranked.findIndex((r) => r.careerId === dragId);
    const to = ranked.findIndex((r) => r.careerId === targetId);
    if (from === -1 || to === -1) return setDragId(null);
    const next = [...ranked];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    persistOrder(next);
    setDragId(null);
  };

  const relegate = (id: string) =>
    save({
      order: board.order.filter((x) => x !== id),
      ruledOut: [...board.ruledOut, id],
    });

  const restore = (id: string) =>
    save({ order: board.order, ruledOut: board.ruledOut.filter((x) => x !== id) });

  const resetToSuggested = () => save({ order: [], ruledOut: board.ruledOut });

  return (
    <div className="space-y-4">
      {/* Lean headline — the synthesis */}
      {leader && (
        <div className="rounded-card border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm text-foreground/90">
            You&apos;ve explored {inputs.length} careers — you&apos;re leaning{" "}
            <span className="font-semibold">
              {leader.emoji} {leader.title}
            </span>
          </p>
          {leadReason(leader) && (
            <p className="mt-0.5 text-xs text-muted-foreground/70">{leadReason(leader)}</p>
          )}
        </div>
      )}

      {/* Standings */}
      <div className="space-y-1.5">
        {ranked.map((row, i) => (
          <div
            key={row.careerId}
            draggable
            onDragStart={() => setDragId(row.careerId)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(row.careerId)}
          >
            <DecisionRowView
              row={row}
              career={getCareerById(row.careerId)}
              stageLabel={STAGE_LABEL[row.progress] ?? ""}
              reflections={reflections[row.careerId] ?? []}
              expanded={expanded.has(row.careerId)}
              onToggle={() => toggle(row.careerId)}
              onUp={i > 0 ? () => move(i, -1) : undefined}
              onDown={i < ranked.length - 1 ? () => move(i, 1) : undefined}
              onRelegate={() => relegate(row.careerId)}
            />
          </div>
        ))}
      </div>

      {/* Out of the running */}
      {ruledOut.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-center text-[10px] uppercase tracking-wide text-muted-foreground/50">
            Out of the running
          </p>
          {ruledOut.map((row) => (
            <DecisionRowView
              key={row.careerId}
              row={row}
              career={getCareerById(row.careerId)}
              stageLabel={STAGE_LABEL[row.progress] ?? ""}
              reflections={reflections[row.careerId] ?? []}
              expanded={expanded.has(row.careerId)}
              onToggle={() => toggle(row.careerId)}
              onRestore={() => restore(row.careerId)}
            />
          ))}
        </div>
      )}

      {/* Reset to suggested — only when the user has imposed a manual order */}
      {board.order.length > 0 && (
        <button
          onClick={resetToSuggested}
          className="text-xs text-muted-foreground/60 underline-offset-2 hover:text-foreground hover:underline"
        >
          Reset to suggested order
        </button>
      )}
    </div>
  );
}
