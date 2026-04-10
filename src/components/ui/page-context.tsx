"use client";

import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageContextProps {
  /** Unique key for this page (used for localStorage dismissal) */
  pageKey: string;
  /** What this page is for — one sentence */
  purpose: string;
  /** What the user should do here — one sentence (optional) */
  action?: string;
}

const STORAGE_PREFIX = "endeavrly-page-ctx-";

export function PageContext({ pageKey, purpose, action }: PageContextProps) {
  const storageKey = `${STORAGE_PREFIX}${pageKey}`;
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    // Show by default on first visit, remember dismissal after
    setDismissed(stored === "dismissed");
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    setExpanded(false);
    localStorage.setItem(storageKey, "dismissed");
  };

  const handleReopen = () => {
    setDismissed(false);
    setExpanded(true);
    localStorage.removeItem(storageKey);
  };

  // Dismissed state — show subtle "?" trigger
  if (dismissed) {
    return (
      <button
        onClick={handleReopen}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors mb-3"
      >
        <Info className="h-3 w-3" />
        <span>What&apos;s this page?</span>
      </button>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border border-teal-500/15 bg-teal-500/[0.03] px-4 py-3 mb-4 transition-all",
    )}>
      <div className="flex items-start gap-3">
        <Info className="h-3.5 w-3.5 text-teal-500/50 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          {expanded ? (
            <div className="space-y-1">
              <p className="text-xs text-foreground/70 leading-relaxed">
                <span className="font-medium text-foreground/80">Why you&apos;re here: </span>
                {purpose}
              </p>
              {action && (
                <p className="text-xs text-foreground/70 leading-relaxed">
                  {action}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-foreground/60 hover:text-foreground/80 transition-colors text-left"
            >
              {purpose}
              <span className="text-teal-500/50 ml-1">Learn more</span>
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0"
          title="Got it"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
