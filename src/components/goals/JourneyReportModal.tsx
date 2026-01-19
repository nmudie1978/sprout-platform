"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2 } from "lucide-react";
import type { CareerGoal } from "@/lib/goals/types";

interface JourneyReportModalProps {
  open: boolean;
  onClose: () => void;
  primaryGoal: CareerGoal | null;
  secondaryGoal: CareerGoal | null;
  hasNotes: boolean;
  hasJobs: boolean;
}

export function JourneyReportModal({
  open,
  onClose,
  primaryGoal,
  secondaryGoal,
  hasNotes,
  hasJobs,
}: JourneyReportModalProps) {
  const [includeNotes, setIncludeNotes] = useState(false);
  const [includeSmallJobs, setIncludeSmallJobs] = useState(hasJobs);
  const [includeInsightsPodcasts, setIncludeInsightsPodcasts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset defaults when modal opens
  useEffect(() => {
    if (open) {
      setIncludeNotes(false);
      setIncludeSmallJobs(hasJobs);
      setIncludeInsightsPodcasts(true);
    }
  }, [open, hasJobs]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/reports/my-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          includeNotes,
          includeSmallJobs,
          includeInsightsPodcasts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-journey-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-w-[calc(100vw-2rem)] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            Generate My Journey Report
          </DialogTitle>
          <DialogDescription>
            Create a professional PDF summary of your career exploration journey.
          </DialogDescription>
        </DialogHeader>

        {/* Preview Summary */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Preview Summary
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm gap-2">
              <span className="text-muted-foreground flex-shrink-0">Primary Goal</span>
              <span className="font-medium truncate">
                {primaryGoal?.title || "Not set"}
              </span>
            </div>
            {secondaryGoal && (
              <div className="flex justify-between text-sm gap-2">
                <span className="text-muted-foreground flex-shrink-0">Secondary Goal</span>
                <span className="font-medium truncate">{secondaryGoal.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Options - mobile-friendly with larger touch targets */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Include in Report
          </p>

          <div className="flex items-center justify-between min-h-[44px] py-2">
            <Label htmlFor="include-notes" className="text-sm cursor-pointer flex-1">
              Notes & Reflections
              {!hasNotes && (
                <span className="text-xs text-muted-foreground ml-1 block sm:inline">(none saved)</span>
              )}
            </Label>
            <Switch
              id="include-notes"
              checked={includeNotes}
              onCheckedChange={setIncludeNotes}
              disabled={!hasNotes}
              className="ml-3"
            />
          </div>

          <div className="flex items-center justify-between min-h-[44px] py-2">
            <Label htmlFor="include-jobs" className="text-sm cursor-pointer flex-1">
              Work Experience
              {!hasJobs && (
                <span className="text-xs text-muted-foreground ml-1 block sm:inline">(none yet)</span>
              )}
            </Label>
            <Switch
              id="include-jobs"
              checked={includeSmallJobs}
              onCheckedChange={setIncludeSmallJobs}
              disabled={!hasJobs}
              className="ml-3"
            />
          </div>

          <div className="flex items-center justify-between min-h-[44px] py-2">
            <Label htmlFor="include-insights" className="text-sm cursor-pointer flex-1">
              Insights & Podcasts
            </Label>
            <Switch
              id="include-insights"
              checked={includeInsightsPodcasts}
              onCheckedChange={setIncludeInsightsPodcasts}
              className="ml-3"
            />
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-[11px] text-muted-foreground">
          Your report will include your initials and age band, but not your date of birth or any financial information.
        </p>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isGenerating}
            className="h-11 sm:h-10 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !primaryGoal}
            className="bg-emerald-600 hover:bg-emerald-700 h-11 sm:h-10 w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
