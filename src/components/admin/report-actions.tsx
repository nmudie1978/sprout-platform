"use client";

/**
 * Report moderation action buttons.
 *
 * Renders the set of admin actions for a CommunityReport and wires
 * them to the existing PATCH /api/community-reports/[id] endpoint
 * (actions: claim, addNote, pauseTarget, escalate, updateStatus).
 *
 * The parent server component does the data fetch; this client
 * component just handles the button clicks, mutation state, and a
 * page refresh after success so the server page re-renders with
 * the new status.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Shield, Loader2, MessageSquare, Pause } from "lucide-react";
import type { CommunityReportStatus, CommunityReportTargetType } from "@prisma/client";

interface Props {
  reportId: string;
  currentStatus: CommunityReportStatus;
  targetType: CommunityReportTargetType;
  targetAlreadyPaused: boolean;
}

export function ReportActions({ reportId, currentStatus, targetType, targetAlreadyPaused }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [showNote, setShowNote] = useState(false);

  const isTerminal = currentStatus === "RESOLVED" || currentStatus === "DISMISSED";

  async function runAction(action: string, body: Record<string, unknown>, successMsg: string) {
    setBusyAction(action);
    try {
      const res = await fetch(`/api/community-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Action failed");
        return;
      }
      toast.success(successMsg);
      // Refresh the server component so the new status + audit trail render
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error("Network error — please try again");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-4">
      <h2 className="text-sm font-semibold">Admin actions</h2>

      {isTerminal && (
        <p className="text-xs text-muted-foreground">
          This report is {currentStatus.toLowerCase()}. Re-open by setting a new status below.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!targetAlreadyPaused && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending || busyAction !== null || isTerminal}
            onClick={() =>
              runAction(
                "pauseTarget",
                { reason: `Paused via moderation queue (admin)` },
                targetType === "JOB_POST" ? "Job post paused" : "User paused",
              )
            }
            className="border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
          >
            {busyAction === "pauseTarget" ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Pause className="h-3.5 w-3.5 mr-1.5" />
            )}
            Pause {targetType === "JOB_POST" ? "job" : "user"}
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={pending || busyAction !== null}
          onClick={() =>
            runAction(
              "updateStatus",
              { status: "RESOLVED" },
              "Report resolved",
            )
          }
          className="border-green-500/40 text-green-700 dark:text-green-300 hover:bg-green-500/10"
        >
          {busyAction === "resolve" ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          )}
          Mark resolved
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={pending || busyAction !== null}
          onClick={() =>
            runAction(
              "updateStatus",
              { status: "DISMISSED" },
              "Report dismissed",
            )
          }
          className="border-muted-foreground/40 text-muted-foreground hover:bg-muted"
        >
          {busyAction === "dismiss" ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <XCircle className="h-3.5 w-3.5 mr-1.5" />
          )}
          Dismiss
        </Button>

        {currentStatus !== "ESCALATED" && currentStatus !== "RESOLVED" && currentStatus !== "DISMISSED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending || busyAction !== null}
            onClick={() =>
              runAction(
                "escalate",
                {},
                "Report escalated — admins notified",
              )
            }
            className="border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-500/10"
          >
            {busyAction === "escalate" ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            )}
            Escalate
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          disabled={pending || busyAction !== null}
          onClick={() => setShowNote((s) => !s)}
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          {showNote ? "Hide note" : "Add note"}
        </Button>
      </div>

      {showNote && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Internal note on this report (visible to other admins and assigned guardian)…"
            className="w-full rounded-md border border-border/40 bg-background p-2 text-xs min-h-[80px] focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            maxLength={2000}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNoteDraft("");
                setShowNote(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!noteDraft.trim() || busyAction !== null}
              onClick={async () => {
                await runAction("addNote", { note: noteDraft.trim() }, "Note saved");
                setNoteDraft("");
                setShowNote(false);
              }}
            >
              {busyAction === "addNote" ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : null}
              Save note
            </Button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 pt-2 border-t border-border/20">
        All actions are logged to AuditLog. Paused jobs / users stay paused until an admin unpauses manually.
      </p>
    </div>
  );
}
