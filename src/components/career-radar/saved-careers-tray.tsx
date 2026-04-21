"use client";

/**
 * SavedCareersTray — Right-edge slide-in tray for individual careers
 * the user has hearted from CareerDetailSheet (anywhere in the app).
 *
 * Reads/writes via the shared `useCuriositySaves()` hook so any change
 * here is reflected immediately on the dashboard "Saved careers"
 * section (and vice versa) — the hook broadcasts a sync event to all
 * mounted instances.
 *
 * Mirrors SavedComparisonsTray's look and behaviour so the two trays
 * sit naturally side-by-side on the right edge of the radar.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Heart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import { getAllCareers, type Career } from "@/lib/career-pathways";

interface SavedCareersTrayProps {
  /** Vertical offset in pixels for the trigger tab so this tray
   *  doesn't sit on top of the SavedComparisonsTray. Default: 80px
   *  BELOW centre, putting the heart tab just below the layers tab. */
  topOffsetPx?: number;
  className?: string;
}

export function SavedCareersTray({ topOffsetPx = 80, className }: SavedCareersTrayProps) {
  const { curiosities, removeCuriosity } = useCuriositySaves();
  const [open, setOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setOpen(true), 150);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => setOpen(false), 300);
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleOpen = useCallback((careerId: string) => {
    const career: Career | undefined = getAllCareers().find((c) => c.id === careerId);
    if (!career) return;
    window.dispatchEvent(new CustomEvent("open-career-detail", { detail: career }));
    setOpen(false);
  }, []);

  const handleRemove = useCallback(
    (e: React.MouseEvent, careerId: string) => {
      e.stopPropagation();
      removeCuriosity(careerId);
    },
    [removeCuriosity],
  );

  const count = curiosities.length;

  return (
    <div
      ref={trayRef}
      className={cn(
        "fixed right-0 top-1/2 z-40 pointer-events-none",
        className,
      )}
      style={{ transform: `translateY(calc(-50% + ${topOffsetPx}px))` }}
    >
      {/* Trigger tab — vertical text */}
      <button
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-expanded={open}
        aria-controls="saved-careers-panel"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-auto",
          "flex items-center gap-1.5 py-3 pl-2 pr-1.5",
          "rounded-l-lg border border-r-0 border-pink-500/30",
          "bg-gradient-to-b from-pink-500/[0.08] via-rose-500/[0.06] to-amber-500/[0.08]",
          "backdrop-blur-sm shadow-[0_0_12px_rgba(244,114,182,0.12)]",
          "text-[10px] font-medium text-pink-300/85",
          "hover:text-pink-200 hover:border-pink-500/45 hover:shadow-[0_0_16px_rgba(244,114,182,0.2)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50",
          "transition-all duration-200",
          open && "opacity-0 pointer-events-none",
        )}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        <Heart className="h-3 w-3 rotate-90 fill-pink-400/40" />
        <span>Saved{count > 0 ? ` (${count})` : ""}</span>
      </button>

      {/* Panel */}
      <div
        id="saved-careers-panel"
        role="region"
        aria-label="Saved careers"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-hidden={!open}
        className={cn(
          "w-[300px] sm:w-[320px] h-[420px] max-h-[70vh]",
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
            <h3 className="text-xs font-semibold text-foreground">Saved Careers</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {count === 0
                ? "Heart any career to keep it here"
                : `${count} saved · synced with dashboard`}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted/40 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Close saved careers"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 space-y-1.5">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Heart className="h-8 w-8 text-muted-foreground/20 mb-3" />
              <p className="text-xs text-muted-foreground/50 leading-relaxed">
                Open any career on the radar or under Explore Careers and tap the heart to keep it here for later.
              </p>
            </div>
          ) : (
            curiosities.map((c) => (
              <div
                key={c.careerId}
                role="button"
                tabIndex={0}
                onClick={() => handleOpen(c.careerId)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen(c.careerId); } }}
                className={cn(
                  "w-full text-left rounded-lg px-3 py-2.5 cursor-pointer",
                  "border border-border/70 bg-background/50 shadow-sm",
                  "hover:bg-muted/40 hover:border-pink-500/45 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/40",
                  "transition-all duration-150 group",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="text-base shrink-0" aria-hidden>{c.careerEmoji}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-foreground/85 truncate leading-tight">
                        {c.careerTitle}
                      </p>
                      <p className="text-[9px] text-muted-foreground/40 mt-0.5">
                        Saved {formatTimeAgo(new Date(c.savedAt).getTime())}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemove(e, c.careerId)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted-foreground/30 hover:text-red-400 transition-all shrink-0"
                    aria-label={`Remove ${c.careerTitle}`}
                    title="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {count > 0 && (
          <div className="px-4 py-2 border-t border-border/20 shrink-0">
            <p className="text-[9px] text-muted-foreground/40 text-center">
              Click to reopen · also visible on dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
