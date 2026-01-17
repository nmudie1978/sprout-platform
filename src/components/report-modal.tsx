"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Flag, AlertTriangle, Loader2 } from "lucide-react";

const REPORT_REASONS = {
  INAPPROPRIATE_CONTENT: "Inappropriate or offensive content",
  SUSPECTED_SCAM: "Suspected scam or fraud",
  SAFETY_CONCERN: "Safety concern",
  HARASSMENT: "Harassment or bullying",
  SPAM: "Spam or irrelevant content",
  UNDERPAYMENT: "Pay below legal minimum",
  OTHER: "Other",
} as const;

type ReportReason = keyof typeof REPORT_REASONS;

interface ReportModalProps {
  targetType: "JOB_POST" | "USER";
  targetId: string;
  targetName?: string;
  trigger?: React.ReactNode;
}

export function ReportModal({
  targetType,
  targetId,
  targetName,
  trigger,
}: ReportModalProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const { toast } = useToast();

  const reportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/community-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details: details.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit report");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Submitted",
        description: data.hasGuardian
          ? "A community guardian will review your report."
          : "Your report has been submitted for platform review.",
      });
      setOpen(false);
      setReason("");
      setDetails("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for your report.",
        variant: "destructive",
      });
      return;
    }
    reportMutation.mutate();
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
      <Flag className="h-4 w-4 mr-1" />
      Report
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report {targetType === "JOB_POST" ? "Job Post" : "User"}
          </DialogTitle>
          <DialogDescription>
            {targetName && (
              <span className="block text-foreground font-medium mt-1">
                {targetName}
              </span>
            )}
            Help keep our community safe by reporting content that violates our
            guidelines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for report <span className="text-destructive">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as ReportReason)}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_REASONS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">
              Additional details{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="details"
              placeholder="Provide any additional context that might help us understand the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {details.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={reportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!reason || reportMutation.isPending}
            >
              {reportMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
