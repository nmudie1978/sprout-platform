"use client";

/**
 * REPORT BROKEN LINK BUTTON
 *
 * Tiny flag button users can click to report a broken/dead link.
 * Reports are stored in localStorage. After REPORT_THRESHOLD reports
 * for a URL, the item is auto-hidden from the feed.
 *
 * MVP: localStorage-based. Future: persist to DB via API.
 */

import { useState, useCallback } from "react";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STORAGE_KEY = "endeavrly-broken-link-reports";
const REPORT_THRESHOLD = 2;

interface ReportState {
  [url: string]: {
    count: number;
    lastReportedAt: string;
  };
}

function getReports(): ReportState {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveReports(reports: ReportState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

/** Check if a URL has been reported enough to be hidden. */
export function isLinkHidden(url: string): boolean {
  try {
    const reports = getReports();
    return (reports[url]?.count ?? 0) >= REPORT_THRESHOLD;
  } catch {
    return false;
  }
}

/** Check if the current user has already reported this URL. */
function hasUserReported(url: string): boolean {
  try {
    const key = `endeavrly-reported-${url}`;
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function markUserReported(url: string) {
  try {
    localStorage.setItem(`endeavrly-reported-${url}`, "true");
  } catch {
    // silent
  }
}

interface ReportBrokenLinkProps {
  url: string;
  className?: string;
}

export function ReportBrokenLink({ url, className }: ReportBrokenLinkProps) {
  const [reported, setReported] = useState(() => hasUserReported(url));

  const handleReport = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (reported) return;

      const reports = getReports();
      const current = reports[url] || { count: 0, lastReportedAt: "" };
      reports[url] = {
        count: current.count + 1,
        lastReportedAt: new Date().toISOString(),
      };
      saveReports(reports);
      markUserReported(url);
      setReported(true);

      if (reports[url].count >= REPORT_THRESHOLD) {
        toast.success("Link hidden — thanks for reporting.");
      } else {
        toast.success("Thanks — we'll check this link.");
      }
    },
    [url, reported]
  );

  if (reported) {
    return (
      <span className={cn("p-1 text-muted-foreground/20", className)} title="Reported">
        <Flag className="h-3 w-3" />
      </span>
    );
  }

  return (
    <button
      onClick={handleReport}
      className={cn(
        "p-1 rounded text-muted-foreground/25 hover:text-amber-500/60 hover:bg-amber-500/10 transition-colors",
        className
      )}
      title="Report broken link"
      aria-label="Report broken link"
    >
      <Flag className="h-3 w-3" />
    </button>
  );
}
