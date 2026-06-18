"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronUp, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { wrapIndex, stepIndex } from "@/lib/library/carousel-nav";
import type { LocalReflectionEntry, ReflectionLens } from "@/lib/library/tabs";

export interface ReflectionGroup {
  slug: string;
  career: { label: string; emoji: string };
  /** Entries pre-sorted in journey order (Discover → Understand → Clarity). */
  entries: LocalReflectionEntry[];
}

// Per-lens visual language for the reflection branches — each stage gets a
// glowing node + colour-matched expand panel, connected by a gradient trunk.
const LENS_STYLE: Record<
  ReflectionLens,
  { text: string; dot: string; glow: string; panelBorder: string; panelBg: string }
> = {
  discover: {
    text: "text-sky-400",
    dot: "bg-sky-400",
    glow: "shadow-[0_0_10px_1px_rgba(56,189,248,0.45)]",
    panelBorder: "border-sky-400/60",
    panelBg: "bg-sky-400/[0.06]",
  },
  understand: {
    text: "text-violet-400",
    dot: "bg-violet-400",
    glow: "shadow-[0_0_10px_1px_rgba(167,139,250,0.45)]",
    panelBorder: "border-violet-400/60",
    panelBg: "bg-violet-400/[0.06]",
  },
  clarity: {
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_10px_1px_rgba(52,211,153,0.45)]",
    panelBorder: "border-emerald-400/60",
    panelBg: "bg-emerald-400/[0.06]",
  },
};

/**
 * Reflections shown as a vertical carousel: one career group at a time, with
 * ▲/▼ controls + dot indicators to cycle (wrap-around), arrow-key support, a
 * collapse toggle on the active card, and per-reflection expand within it.
 */
export function ReflectionsCarousel({ groups }: { groups: ReflectionGroup[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const total = groups.length;
  const safeIndex = wrapIndex(activeIndex, total);
  const active = groups[safeIndex];

  const go = (delta: number) => {
    setDir(delta);
    setActiveIndex((i) => stepIndex(i, total, delta));
    setCollapsed(false);
  };
  const jumpTo = (idx: number) => {
    setDir(idx >= safeIndex ? 1 : -1);
    setActiveIndex(idx);
    setCollapsed(false);
  };

  if (!active) return null;

  return (
    <div
      className="space-y-2"
      role="group"
      aria-roledescription="carousel"
      aria-label="Reflections by career"
      tabIndex={0}
      onKeyDown={(ev) => {
        if (ev.key === "ArrowUp") {
          ev.preventDefault();
          go(-1);
        } else if (ev.key === "ArrowDown") {
          ev.preventDefault();
          go(1);
        }
      }}
    >
      {/* ▲ previous career */}
      {total > 1 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous career"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-card/40 text-muted-foreground/70 transition-colors hover:text-foreground hover:border-border"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      )}

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.section
          key={active.slug}
          custom={dir}
          initial={{ opacity: 0, y: dir >= 0 ? 24 : -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: dir >= 0 ? -24 : 24 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-card border border-border/60 bg-card/40 overflow-hidden"
        >
          {/* Header doubles as a collapse toggle for the active card. */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            className="flex w-full items-center gap-2 px-3 py-2.5 border-b border-border/40 bg-muted/10 text-left transition-colors hover:bg-muted/20"
          >
            <span className="text-sm shrink-0">{active.career.emoji}</span>
            <h3 className="text-xs font-bold uppercase tracking-wide text-foreground truncate">
              {active.career.label}
            </h3>
            <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold tabular-nums text-primary">
              {active.entries.length}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground/55 transition-transform",
                collapsed && "-rotate-90",
              )}
            />
          </button>

          {/* Each stage hangs off a gradient trunk as a retractable branch:
              a one-line preview when collapsed, the full reflection when
              expanded. Expanding reveals an "open in My Journey" link. */}
          {!collapsed && (
            <div className="relative px-3 py-2">
              <div
                aria-hidden
                className="absolute left-[26px] top-4 bottom-4 w-0.5 rounded bg-gradient-to-b from-sky-400 via-violet-400 to-emerald-400 opacity-40"
              />
              <div className="space-y-0.5">
                {active.entries.map((e) => {
                  const st = LENS_STYLE[e.lens];
                  const open = expanded.has(e.id);
                  return (
                    <div key={e.id} className="relative">
                      <button
                        type="button"
                        onClick={() => toggle(e.id)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/20"
                      >
                        <span
                          className={cn(
                            "relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-card",
                            st.dot,
                            st.glow,
                          )}
                        />
                        <span className={cn("shrink-0 text-sm font-semibold", st.text)}>
                          {e.lensLabel}
                        </span>
                        {!open && (
                          <span className="truncate text-xs text-muted-foreground/70">
                            {e.text}
                          </span>
                        )}
                        <ChevronRight
                          className={cn(
                            "ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/55 transition-transform",
                            open && "rotate-90",
                          )}
                        />
                      </button>
                      {open && (
                        <div
                          className={cn(
                            "mb-1 ml-[34px] rounded-r-lg border-l-2 px-3 py-2.5",
                            st.panelBorder,
                            st.panelBg,
                          )}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                            {e.text}
                          </p>
                          <button
                            type="button"
                            onClick={() => router.push(`/my-journey#${e.lens}`)}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            Open {e.lensLabel} in My Journey
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* ▼ next career + dot indicators */}
      {total > 1 && (
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next career"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-card/40 text-muted-foreground/70 transition-colors hover:text-foreground hover:border-border"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {groups.map((g, i) => (
              <button
                key={g.slug}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={`Show ${g.career.label}`}
                aria-current={i === safeIndex}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === safeIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
              />
            ))}
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground/60">
            {safeIndex + 1} of {total}
          </span>
        </div>
      )}
    </div>
  );
}
