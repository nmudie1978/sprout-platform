"use client";

/**
 * SavedComparisonsTray — Right-edge slide-in tray for previously
 * saved career comparisons.
 *
 * Progressive disclosure: hidden by default, revealed on hover/click/focus.
 * Saved comparison sets persist in localStorage and can be loaded
 * back into the radar's compare shortlist with one click.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, Layers, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────

export interface SavedComparison {
  id: string;
  title: string;
  careers: { id: string; title: string; emoji: string }[];
  savedAt: number; // timestamp
}

// ── Persistence ───────────────────────────────────────────────────

const STORAGE_KEY = "saved-career-comparisons";
const MAX_SAVED = 15;

export function getSavedComparisons(): SavedComparison[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveComparison(comparison: SavedComparison): void {
  try {
    const existing = getSavedComparisons();
    // Deduplicate by career IDs (same set = same comparison)
    const key = comparison.careers
      .map((c) => c.id)
      .sort()
      .join(",");
    const filtered = existing.filter((e) => {
      const eKey = e.careers
        .map((c) => c.id)
        .sort()
        .join(",");
      return eKey !== key;
    });
    // Prepend new, cap at MAX_SAVED
    const updated = [comparison, ...filtered].slice(0, MAX_SAVED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* noop */
  }
}

export function deleteComparison(id: string): void {
  try {
    const existing = getSavedComparisons();
    const updated = existing.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* noop */
  }
}

// ── Component ─────────────────────────────────────────────────────

interface SavedComparisonsTrayProps {
  onLoadComparison: (careers: { id: string; title: string; emoji: string }[]) => void;
  className?: string;
}

export function SavedComparisonsTray({
  onLoadComparison,
  className,
}: SavedComparisonsTrayProps) {
  const [open, setOpen] = useState(false);
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const trayRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Load from localStorage on mount
  useEffect(() => {
    setComparisons(getSavedComparisons());
  }, []);

  // Refresh when tray opens (in case other tabs saved)
  useEffect(() => {
    if (open) setComparisons(getSavedComparisons());
  }, [open]);

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

  // Hover open (desktop only, with delay)
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

  const handleLoad = useCallback(
    (comparison: SavedComparison) => {
      onLoadComparison(comparison.careers);
      setOpen(false);
    },
    [onLoadComparison],
  );

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteComparison(id);
    setComparisons(getSavedComparisons());
  }, []);

  const count = comparisons.length;

  return (
    <div
      ref={trayRef}
      className={cn("fixed right-0 top-1/2 -translate-y-1/2 z-40 pointer-events-none", className)}
    >
      {/* ── Trigger tab ──────────────────────────────────────────── */}
      <button
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-expanded={open}
        aria-controls="saved-comparisons-panel"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-auto",
          "flex items-center gap-1.5 py-3 pl-2 pr-1.5",
          "rounded-l-lg border border-r-0 border-teal-500/25",
          "bg-gradient-to-b from-teal-500/[0.08] via-pink-500/[0.06] to-amber-500/[0.08]",
          "backdrop-blur-sm shadow-[0_0_12px_rgba(20,184,166,0.12)]",
          "text-[10px] font-medium text-teal-300/80",
          "hover:text-teal-200 hover:border-teal-500/40 hover:shadow-[0_0_16px_rgba(20,184,166,0.2)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50",
          "transition-all duration-200",
          "writing-mode-vertical",
          open && "opacity-0 pointer-events-none",
        )}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        <Layers className="h-3 w-3 rotate-90" />
        <span>Saved{count > 0 ? ` (${count})` : ""}</span>
      </button>

      {/* ── Panel ────────────────────────────────────────────────── */}
      <div
        id="saved-comparisons-panel"
        role="region"
        aria-label="Saved comparisons"
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
            <h3 className="text-xs font-semibold text-foreground">Saved Comparisons</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {count === 0 ? "Nothing saved yet" : `${count} saved`}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted/40 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Close saved comparisons"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 space-y-1.5">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Layers className="h-8 w-8 text-muted-foreground/20 mb-3" />
              <p className="text-xs text-muted-foreground/50 leading-relaxed">
                Compare 2-3 careers on the radar, then they'll appear here for quick access later.
              </p>
            </div>
          ) : (
            comparisons.map((comp) => (
              <button
                key={comp.id}
                onClick={() => handleLoad(comp)}
                className={cn(
                  "w-full text-left rounded-lg px-3 py-2.5",
                  "border border-border/70 bg-background/50 shadow-sm",
                  "hover:bg-muted/40 hover:border-teal-500/50 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40",
                  "transition-all duration-150 group",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {/* Emoji row */}
                    <div className="flex items-center gap-1 mb-1">
                      {comp.careers.map((c) => (
                        <span key={c.id} className="text-sm" title={c.title}>
                          {c.emoji}
                        </span>
                      ))}
                    </div>
                    {/* Title */}
                    <p className="text-[11px] font-medium text-foreground/80 truncate leading-tight">
                      {comp.title}
                    </p>
                    {/* Career names */}
                    <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">
                      {comp.careers.map((c) => c.title).join(" vs ")}
                    </p>
                    {/* Time */}
                    <p className="text-[9px] text-muted-foreground/30 mt-1">
                      {formatTimeAgo(comp.savedAt)}
                    </p>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(e, comp.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted-foreground/30 hover:text-red-400 transition-all shrink-0"
                    aria-label={`Delete ${comp.title}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        {count > 0 && (
          <div className="px-4 py-2 border-t border-border/20 shrink-0">
            <p className="text-[9px] text-muted-foreground/40 text-center">
              Click to load into radar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
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
