"use client";

/**
 * ConversationReport moderation actions — mirror of
 * src/components/admin/report-actions.tsx (which targets CommunityReport),
 * adapted for the conversation-report status machine.
 *
 * Wires to PATCH /api/admin/conversation-reports/[id] — claim,
 * addNote, updateStatus (RESOLVED | DISMISSED | OPEN).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Shield, Loader2, MessageSquare } from "lucide-react";
import type { ConversationReportStatus } from "@prisma/client";

interface Props {
  reportId: string;
  currentStatus: ConversationReportStatus;
}

export function ConversationReportActions({ reportId, currentStatus }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [actionTakenDraft, setActionTakenDraft] = useState("");
  const [showNote, setShowNote] = useState(false);

  const isTerminal = currentStatus === "RESOLVED" || currentStatus === "DISMISSED";

  async function run(action: string, body: Record<string, unknown>, msg: string) {
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/conversation-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Action failed");
        return;
      }
      toast.success(msg);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-4">
      <h2 className="text-sm font-semibold">Admin actions</h2>

      {isTerminal && (
        <p className="text-xs text-muted-foreground">
          This report is {currentStatus.toLowerCase()}. Re-open it by setting a different status below.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {currentStatus === "OPEN" && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending || busy !== null}
            onClick={() => run("claim", {}, "Claimed for review")}
            className="border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
          >
            {busy === "claim" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Shield className="h-3.5 w-3.5 mr-1.5" />}
            Claim / Mark in review
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={pending || busy !== null}
          onClick={() =>
            run(
              "updateStatus",
              { status: "RESOLVED", actionTaken: actionTakenDraft || undefined },
              "Report resolved",
            )
          }
          className="border-green-500/40 text-green-700 dark:text-green-300 hover:bg-green-500/10"
        >
          {busy === "resolve" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
          Mark resolved
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={pending || busy !== null}
          onClick={() =>
            run(
              "updateStatus",
              { status: "DISMISSED", actionTaken: actionTakenDraft || undefined },
              "Report dismissed",
            )
          }
          className="border-muted-foreground/40 text-muted-foreground hover:bg-muted"
        >
          {busy === "dismiss" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5 mr-1.5" />}
          Dismiss
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={pending || busy !== null}
          onClick={() => setShowNote((s) => !s)}
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          {showNote ? "Hide note" : "Add note"}
        </Button>
      </div>

      {showNote && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground block">
            Internal reviewer note
          </label>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Visible to admins and the assigned guardian. Not shown to reporter or reported user."
            className="w-full rounded-md border border-border/40 bg-background p-2 text-xs min-h-[80px] focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            maxLength={2000}
          />

          <label className="text-[11px] uppercase tracking-wider text-muted-foreground block pt-2">
            Action taken (optional, ≤500 chars)
          </label>
          <input
            type="text"
            value={actionTakenDraft}
            onChange={(e) => setActionTakenDraft(e.target.value)}
            placeholder="e.g. 'User warned', 'Account suspended 7 days'"
            className="w-full rounded-md border border-border/40 bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            maxLength={500}
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNoteDraft("");
                setActionTakenDraft("");
                setShowNote(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!noteDraft.trim() || busy !== null}
              onClick={async () => {
                await run("addNote", { note: noteDraft.trim() }, "Note saved");
                setNoteDraft("");
                setShowNote(false);
              }}
            >
              {busy === "addNote" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
              Save note
            </Button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 pt-2 border-t border-border/20">
        All actions are logged to AuditLog. The conversation was auto-frozen when the report was filed.
      </p>
    </div>
  );
}
