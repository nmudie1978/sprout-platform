"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import type { InsightUpdate } from "@/lib/industry-insights/insight-updates";

interface RecentInsightUpdatesProps {
  updates: InsightUpdate[];
}

/**
 * Small, secondary list of recently detected insight updates.
 * Acts as quiet history so ephemeral toasts aren't lost forever.
 * Limited to the 3 most recent updates.
 */
export function RecentInsightUpdates({ updates }: RecentInsightUpdatesProps) {
  if (updates.length === 0) return null;

  const recent = updates.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mt-3 mb-1"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Clock className="h-3 w-3 text-muted-foreground/50" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Latest detected updates
        </span>
      </div>

      <div className="space-y-1.5">
        {recent.map((update) => (
          <div
            key={update.id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/30 border border-border/30"
          >
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-teal-500/50" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-foreground/80 leading-snug truncate">
                {update.summary}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {update.sourceName} &middot; {formatRelativeDate(update.detectedAt)}
              </p>
            </div>
            {update.url && (
              <a
                href={update.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-1 rounded-md text-muted-foreground/40 hover:text-teal-500 transition-colors"
                aria-label={`View ${update.title}`}
              >
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
