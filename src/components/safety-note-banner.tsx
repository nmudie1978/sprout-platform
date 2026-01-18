"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

// Safety markers that trigger safety notes display
export const SAFETY_MARKERS = [
  "(ground floor only)",
  "(non-medical)",
  "(not cutting)",
  "(non-instructional)",
];

// Disallowed job types message
export const DISALLOWED_JOB_TYPES_MESSAGE =
  "Some job types are not allowed for safety reasons: construction, heavy machinery, night work, medical care, financial handling, driving jobs, or unsupervised one-on-one adult-only home visits.";

interface SafetyNoteBannerProps {
  safetyNotes?: string | null;
  title?: string;
  className?: string;
}

export function SafetyNoteBanner({
  safetyNotes,
  title,
  className = "",
}: SafetyNoteBannerProps) {
  if (!safetyNotes) return null;

  return (
    <Alert
      className={`border-amber-500/50 bg-amber-500/10 ${className}`}
    >
      <Shield className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-700 dark:text-amber-400 text-sm font-medium">
        {title || "Safety Note"}
      </AlertTitle>
      <AlertDescription className="text-amber-600 dark:text-amber-500 text-sm">
        {safetyNotes}
      </AlertDescription>
    </Alert>
  );
}

interface DisallowedJobsWarningProps {
  className?: string;
}

export function DisallowedJobsWarning({ className = "" }: DisallowedJobsWarningProps) {
  return (
    <Alert
      className={`border-orange-500/50 bg-orange-500/10 ${className}`}
    >
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-600 dark:text-orange-500 text-sm">
        {DISALLOWED_JOB_TYPES_MESSAGE}
      </AlertDescription>
    </Alert>
  );
}

// Check if a template title contains safety markers
export function hasSafetyMarker(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return SAFETY_MARKERS.some((marker) => lowerTitle.includes(marker.toLowerCase()));
}

// Extract safety notes from template if it has safety markers
export function extractSafetyNotes(
  title: string,
  safetyNotes?: string | null
): string | null {
  if (safetyNotes) return safetyNotes;
  if (hasSafetyMarker(title)) {
    // Generate a default safety note based on the marker
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("(ground floor only)")) {
      return "This task should only be performed at ground level - no ladders or heights.";
    }
    if (lowerTitle.includes("(non-medical)")) {
      return "This task does not include handling prescription medications or medical procedures.";
    }
    if (lowerTitle.includes("(not cutting)")) {
      return "This task does not include cutting, trimming, or grooming with sharp tools.";
    }
    if (lowerTitle.includes("(non-instructional)")) {
      return "This is an assistance role only - no teaching or instruction should be provided.";
    }
  }
  return null;
}
