"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pause, Trash2, PlayCircle, CheckCircle, RotateCcw } from "lucide-react";

interface JobStatusManagerProps {
  jobId: string;
  currentStatus: string;
}

export function JobStatusManager({ jobId, currentStatus }: JobStatusManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"ON_HOLD" | "CANCELLED" | "POSTED" | "COMPLETED" | null>(null);
  const [reason, setReason] = useState("");

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, statusReason }: { status: string; statusReason?: string }) => {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, statusReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to update job status");
      }

      return response.json();
    },
    onSuccess: () => {
      const actionMessages = {
        ON_HOLD: { title: "Job paused", description: "This job is now paused and hidden from youth." },
        CANCELLED: { title: "Job cancelled", description: "This job has been cancelled." },
        POSTED: { title: "Job reopened", description: "This job is now open and visible to youth again." },
        COMPLETED: { title: "Job marked as done", description: "Great work! This job has been marked as done." },
      };

      const message = actionMessages[selectedAction!];
      toast({
        title: message.title,
        description: message.description,
      });

      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      setDialogOpen(false);
      setReason("");
      setSelectedAction(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    },
  });

  const handleAction = (action: "ON_HOLD" | "CANCELLED" | "POSTED" | "COMPLETED") => {
    setSelectedAction(action);
    if (action === "POSTED" || action === "COMPLETED") {
      // Reactivate or complete immediately without asking for reason
      updateStatusMutation.mutate({ status: action });
    } else {
      // Ask for reason for ON_HOLD or CANCELLED
      setDialogOpen(true);
    }
  };

  const handleConfirm = () => {
    if (selectedAction && reason.trim()) {
      updateStatusMutation.mutate({
        status: selectedAction,
        statusReason: reason,
      });
    }
  };

  const getDialogContent = () => {
    if (selectedAction === "ON_HOLD") {
      return {
        title: "Pause Job",
        description: "This job will be paused and hidden from youth. You can reopen it later.",
        placeholder: "e.g., Need to postpone until next week, dealing with health issues, etc.",
      };
    } else if (selectedAction === "CANCELLED") {
      return {
        title: "Cancel Job",
        description: "This job will be cancelled. You can reopen it later if needed.",
        placeholder: "e.g., Found someone else, no longer needed, circumstances changed, etc.",
      };
    }
    return { title: "", description: "", placeholder: "" };
  };

  const dialogContent = getDialogContent();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* ASSIGNED (IN_PROGRESS) - can mark as done, reopen, or pause */}
          {(currentStatus === "IN_PROGRESS" || currentStatus === "ASSIGNED") && (
            <>
              <DropdownMenuItem onClick={() => handleAction("COMPLETED")} className="text-purple-600 focus:text-purple-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Done
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("POSTED")}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reopen for Applications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("ON_HOLD")}>
                <Pause className="mr-2 h-4 w-4" />
                Pause Job
              </DropdownMenuItem>
            </>
          )}

          {/* OPEN (POSTED) - can pause */}
          {currentStatus === "POSTED" && (
            <DropdownMenuItem onClick={() => handleAction("ON_HOLD")}>
              <Pause className="mr-2 h-4 w-4" />
              Pause Job
            </DropdownMenuItem>
          )}

          {/* PAUSED (ON_HOLD) - can reopen */}
          {currentStatus === "ON_HOLD" && (
            <DropdownMenuItem onClick={() => handleAction("POSTED")}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Reopen Job
            </DropdownMenuItem>
          )}

          {/* CANCELLED - can reopen */}
          {currentStatus === "CANCELLED" && (
            <DropdownMenuItem onClick={() => handleAction("POSTED")} className="text-emerald-600 focus:text-emerald-600">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reopen Job
            </DropdownMenuItem>
          )}

          {/* All active statuses can be cancelled */}
          {(currentStatus === "POSTED" || currentStatus === "ON_HOLD" || currentStatus === "IN_PROGRESS" || currentStatus === "ASSIGNED") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction("CANCELLED")}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel Job
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="reason">Reason (required)</Label>
            <Textarea
              id="reason"
              placeholder={dialogContent.placeholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This helps you keep track and can be shown to applicants if needed.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setReason("");
              setSelectedAction(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={!reason.trim() || updateStatusMutation.isPending}
              className={selectedAction === "CANCELLED" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
