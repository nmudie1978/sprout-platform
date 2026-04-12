"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import type { InsightUpdate } from "@/lib/industry-insights/insight-updates";

interface InsightUpdateToastProps {
  update: InsightUpdate | null;
  onDismiss: () => void;
}

/**
 * Subtle, ephemeral toast for newly detected insight updates.
 *
 * - Animates in gently from the top
 * - Auto-dismissed by the parent hook after ~3s
 * - Non-blocking, no modal behaviour
 * - Calm styling that matches Endeavrly's tone
 */
export function InsightUpdateToast({ update, onDismiss }: InsightUpdateToastProps) {
  return (
    <AnimatePresence>
      {update && (
        <motion.div
          key={update.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="pointer-events-auto w-full max-w-sm rounded-xl border border-border/60 bg-background/95 backdrop-blur-sm shadow-sm px-4 py-3"
        >
          <div className="flex items-start gap-3">
            {/* Subtle pulse dot */}
            <div className="mt-1 flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500/70" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground/90 leading-snug">
                {update.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                {update.summary}
              </p>
              {update.url && (
                <a
                  href={update.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 hover:underline mt-1"
                >
                  View <ArrowRight className="h-2.5 w-2.5" />
                </a>
              )}
            </div>

            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-0.5 rounded-md text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
