"use client";

import { useState, useEffect, useRef } from "react";
import { PenLine, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReflection } from "@/hooks/use-reflection";
import { useIsMobile } from "@/hooks/use-media-query";

interface ReflectionPanelProps {
  careerSlug: string | null;
  phase: "discover" | "understand" | "clarity";
  /** Career title shown in the panel header */
  careerTitle?: string | null;
}

const PHASE_LABELS: Record<string, string> = {
  discover: "Discover",
  understand: "Understand",
  clarity: "Clarity",
};

const PLACEHOLDERS: Record<string, string> = {
  discover:
    "Anything stand out about this career? Jot it down here.",
  understand:
    "What do you think now that you know more? Keep a note if you like.",
  clarity:
    "Thoughts on your roadmap or next steps? Write them here.",
};

const COLLAPSE_KEY = "reflection-panel-open";

export function ReflectionPanel({
  careerSlug,
  phase,
  careerTitle,
}: ReflectionPanelProps) {
  const isMobile = useIsMobile();
  const { content, update, onBlur, status } = useReflection(careerSlug, phase);

  // Panel open/close — remember preference
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      setOpen(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [content, open]);

  if (!careerSlug) return null;

  // ── Floating trigger button (when closed) ────────────────────────
  if (!open) {
    return (
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "fixed z-40 flex items-center gap-2 rounded-full border bg-card/95 backdrop-blur-sm shadow-lg px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all",
          isMobile
            ? "bottom-20 right-4"
            : "bottom-6 right-6"
        )}
        title="Open reflections"
      >
        <PenLine className="h-3.5 w-3.5" />
        My notes
        {content.trim() && (
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        )}
      </button>
    );
  }

  // ── Open panel ────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "fixed z-40 flex flex-col border bg-card/95 backdrop-blur-sm shadow-xl rounded-t-xl sm:rounded-xl overflow-hidden transition-all",
        isMobile
          ? "inset-x-0 bottom-0 max-h-[55vh]"
          : "bottom-6 right-6 w-80 max-h-[50vh]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20">
        <div className="flex items-center gap-2 min-w-0">
          <PenLine className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold truncate">
            My notes
          </span>
          <span className="text-[10px] text-muted-foreground/60 shrink-0">
            {PHASE_LABELS[phase]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Save status */}
          {status === "saving" && (
            <span className="text-[9px] text-muted-foreground/50">
              Saving...
            </span>
          )}
          {status === "saved" && (
            <span className="text-[9px] text-teal-500/70">Saved</span>
          )}
          <button
            type="button"
            onClick={toggleOpen}
            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            title="Close notes"
          >
            {isMobile ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => update(e.target.value)}
          onBlur={onBlur}
          placeholder={PLACEHOLDERS[phase]}
          rows={3}
          className={cn(
            "w-full resize-none bg-transparent text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/40",
            "outline-none border-0 p-0 focus:ring-0"
          )}
          maxLength={2000}
        />
      </div>

      {/* Footer — subtle character hint */}
      {content.length > 1500 && (
        <div className="px-3 pb-2 text-[9px] text-muted-foreground/40 text-right">
          {content.length}/2000
        </div>
      )}
    </div>
  );
}
