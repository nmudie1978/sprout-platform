"use client";

/**
 * JourneyReflectionsTray — Right-edge slide-in panel for the user's
 * private notes / reflections during Discover, Understand, and Clarity.
 *
 * Mirrors the SavedComparisonsTray pattern from the Career Radar so
 * the two trays feel like the same family of UI: vertical "Reflections"
 * tab, hover-open with delays, ESC + outside-click to close, calm
 * fixed-position panel that doesn't disrupt the journey content.
 *
 * Per-career, per-lens persistence via useJourneyReflections.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { X, PenLine, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useJourneyReflections,
  type ReflectionLens,
} from "@/hooks/use-journey-reflections";

interface JourneyReflectionsTrayProps {
  /** Slugified career goal — keys the reflections store. */
  careerSlug: string | null;
  /** Currently active journey tab. The tray opens to this lens. */
  activeLens: ReflectionLens;
  /** Vertical offset in pixels for the trigger tab. Default centred. */
  topOffsetPx?: number;
}

const LENS_LABEL: Record<ReflectionLens, string> = {
  discover: "Discover",
  understand: "Understand",
  clarity: "Clarity",
};

const LENS_PROMPT: Record<ReflectionLens, string> = {
  discover:
    "What sparked your curiosity about this career? What did you not know before?",
  understand:
    "What surprised you about the day-to-day reality? What's still unclear?",
  clarity:
    "What's your honest gut feeling about this path? What's your next step?",
};

const MAX_LENGTH = 4_000;

export function JourneyReflectionsTray({
  careerSlug,
  activeLens,
  topOffsetPx = 0,
}: JourneyReflectionsTrayProps) {
  const { reflections, updateLens, clearLens, hasAny, enabled } =
    useJourneyReflections(careerSlug);
  const [open, setOpen] = useState(false);
  const [lens, setLens] = useState<ReflectionLens>(activeLens);
  const [savedTick, setSavedTick] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // When the parent flips between Discover/Understand/Clarity, follow
  // along — so opening the tray immediately after switching tabs lands
  // on the lens the user is actually on.
  useEffect(() => {
    setLens(activeLens);
  }, [activeLens]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Hover on the trigger tab opens the tray — but once open, the tray
  // does NOT auto-close on mouse leave. The earlier hover-close pattern
  // raced badly: the trigger fades out the instant the panel opens,
  // leaving a small dead zone between trigger and panel. A mouse
  // dwelling in that gap fires mouseLeave on the trigger, the close
  // timer ticks, the panel slides shut, the user moves into the panel,
  // mouseEnter reopens it — and a flicker loop begins. To dismiss the
  // tray now: click the X, press ESC, click outside, or click the
  // trigger tab again.
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setOpen(true), 120);
  }, []);

  const handleHoverCancel = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  }, []);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  const handleChange = useCallback(
    (text: string) => {
      const clipped = text.slice(0, MAX_LENGTH);
      updateLens(lens, clipped);
      // Brief saved tick feedback — visual signal the keystroke landed.
      setSavedTick(true);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSavedTick(false), 1_200);
    },
    [lens, updateLens],
  );

  const handleClear = useCallback(() => {
    if (!confirm(`Clear your ${LENS_LABEL[lens]} reflection?`)) return;
    clearLens(lens);
  }, [lens, clearLens]);

  if (!enabled) return null; // hidden until a career goal is set

  const text = reflections[lens];
  const totalChars =
    reflections.discover.length +
    reflections.understand.length +
    reflections.clarity.length;

  return (
    <div
      ref={trayRef}
      className="fixed right-0 top-1/2 z-40 pointer-events-none"
      style={{ transform: `translateY(calc(-50% + ${topOffsetPx}px))` }}
    >
      {/* Trigger tab */}
      <button
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleHoverCancel}
        aria-expanded={open}
        aria-controls="journey-reflections-panel"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-auto",
          "flex items-center gap-1.5 py-3 pl-2 pr-1.5",
          "rounded-l-lg border border-r-0 border-amber-500/30",
          "bg-gradient-to-b from-amber-500/[0.08] via-amber-400/[0.06] to-rose-500/[0.06]",
          "backdrop-blur-sm shadow-[0_0_12px_rgba(245,158,11,0.12)]",
          "text-[10px] font-medium text-amber-300/85",
          "hover:text-amber-200 hover:border-amber-500/45 hover:shadow-[0_0_16px_rgba(245,158,11,0.2)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
          "transition-all duration-200",
          open && "opacity-0 pointer-events-none",
        )}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        <PenLine className="h-3 w-3 rotate-90" />
        <span>Reflections{hasAny ? ` (${totalChars})` : ""}</span>
      </button>

      {/* Panel */}
      <div
        id="journey-reflections-panel"
        role="region"
        aria-label="Journey reflections"
        aria-hidden={!open}
        className={cn(
          "w-[340px] sm:w-[380px] h-[520px] max-h-[80vh]",
          "rounded-l-xl border border-r-0 border-border/40",
          "bg-card/95 backdrop-blur-md shadow-xl",
          "flex flex-col overflow-hidden",
          "transition-transform duration-250 ease-out",
          open ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
          <div>
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <PenLine className="h-3 w-3 text-amber-400" />
              Reflections
            </h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Private notes for this career — only you see them.
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted/40 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Close reflections"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Lens segmented control */}
        <div className="px-3 pt-3 shrink-0">
          <div role="tablist" aria-label="Choose lens" className="grid grid-cols-3 gap-1 rounded-md bg-muted/30 p-1">
            {(["discover", "understand", "clarity"] as ReflectionLens[]).map((l) => {
              const active = lens === l;
              const filled = reflections[l].trim().length > 0;
              return (
                <button
                  key={l}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setLens(l)}
                  className={cn(
                    "rounded text-[11px] font-medium py-1.5 transition-all flex items-center justify-center gap-1",
                    active
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground/80",
                  )}
                >
                  <span>{LENS_LABEL[l]}</span>
                  {filled && (
                    <span
                      className="inline-block h-1 w-1 rounded-full bg-amber-400"
                      aria-label="has notes"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt + textarea */}
        <div className="flex-1 flex flex-col px-3 pt-3 min-h-0">
          <p className="text-[11px] italic text-muted-foreground/70 leading-snug mb-2">
            {LENS_PROMPT[lens]}
          </p>
          <textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Write your ${LENS_LABEL[lens]} reflections here…`}
            className={cn(
              "flex-1 min-h-0 w-full resize-none rounded-md border border-border/40",
              "bg-background/40 px-3 py-2 text-[13px] leading-relaxed",
              "placeholder:text-muted-foreground/40",
              "focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/40",
            )}
            maxLength={MAX_LENGTH}
            aria-label={`Reflections for ${LENS_LABEL[lens]}`}
          />
        </div>

        {/* Footer — char count + saved tick + clear */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/30 shrink-0">
          <div className="text-[10px] text-muted-foreground/50 tabular-nums">
            {text.length} / {MAX_LENGTH}
            {savedTick && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-500/85">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Saved
              </span>
            )}
          </div>
          {text.trim().length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-red-400 transition-colors"
              aria-label={`Clear ${LENS_LABEL[lens]} reflection`}
              title={`Clear ${LENS_LABEL[lens]} reflection`}
            >
              <Trash2 className="h-2.5 w-2.5" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
