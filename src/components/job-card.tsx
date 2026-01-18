"use client";

import { memo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Clock, Calendar, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

// Category configuration
const categoryConfig: Record<string, { emoji: string; label: string }> = {
  BABYSITTING: { emoji: "👶", label: "Babysitting" },
  DOG_WALKING: { emoji: "🐕", label: "Dog Walking" },
  SNOW_CLEARING: { emoji: "❄️", label: "Snow Clearing" },
  CLEANING: { emoji: "🧹", label: "Cleaning" },
  DIY_HELP: { emoji: "🔧", label: "DIY Help" },
  TECH_HELP: { emoji: "💻", label: "Tech Help" },
  ERRANDS: { emoji: "🏃", label: "Errands" },
  OTHER: { emoji: "✨", label: "Other" },
};

interface JobCardProps {
  job: {
    id: string;
    title: string;
    category: string;
    payAmount: number;
    payType?: string;
    location?: string;
    startDate?: string | null;
    endDate?: string | null;
    dateTime?: string | null;
    duration?: number | null;
    applicationDeadline?: string | null;
    createdAt?: string;
    postedBy?: {
      employerProfile?: {
        companyName?: string;
        verified?: boolean;
      };
    };
  };
  variant?: "default" | "compact";
  showDeadline?: boolean;
  userCity?: string | null; // User's city for highlighting nearby jobs
}

// Format date to readable string
function formatJobDate(date: string | null | undefined): string {
  if (!date) return "TBC";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Format date compactly (e.g., "Mon 15 Jan")
function formatDateCompact(date: string | null | undefined): string {
  if (!date) return "TBC";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// Format time
function formatTime(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Check if job location matches user's city
function isJobNearby(jobLocation: string | undefined, userCity: string | null | undefined): boolean {
  if (!jobLocation || !userCity) return false;
  return jobLocation.toLowerCase().includes(userCity.toLowerCase());
}

// Calculate days until deadline
function getDaysUntilDeadline(deadline: string | null | undefined): { days: number; urgent: boolean; passed: boolean } {
  if (!deadline) return { days: -1, urgent: false, passed: false };
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    days: diffDays,
    urgent: diffDays >= 0 && diffDays <= 2,
    passed: diffDays < 0,
  };
}

// Format duration in hours/minutes
function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export const JobCard = memo(function JobCard({ job, variant = "default", showDeadline = true, userCity }: JobCardProps) {
  const category = categoryConfig[job.category] || categoryConfig.OTHER;
  const employer = job.postedBy?.employerProfile;
  const startDate = job.startDate || job.dateTime;
  const deadline = getDaysUntilDeadline(job.applicationDeadline);
  const isNearby = isJobNearby(job.location, userCity);

  if (variant === "compact") {
    // Compact variant for dashboard widgets
    return (
      <Link href={`/jobs/${job.id}`} className="block group">
        <Card className={`p-3 border hover:shadow-md transition-all relative ${
          isNearby
            ? "border-2 border-emerald-400 dark:border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.25)] hover:shadow-[0_0_15px_rgba(52,211,153,0.35)]"
            : "hover:border-primary/30"
        }`}>
          {/* Nearby indicator */}
          {isNearby && (
            <div className="absolute -top-1.5 -right-1.5 z-10">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
          )}

          {/* Header: Title + Pay */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">{category.emoji}</span>
              <div className="min-w-0">
                <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {job.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {employer?.companyName || "Individual"}
                  {employer?.verified && (
                    <CheckCircle2 className="h-3 w-3 text-blue-500 inline ml-1" />
                  )}
                </p>
              </div>
            </div>
            <span className="font-bold text-sm text-gray-600 dark:text-gray-400 shrink-0">
              {formatCurrency(job.payAmount)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <MapPin className={`h-3 w-3 shrink-0 ${isNearby ? "text-emerald-500" : ""}`} />
            <span className="truncate">{job.location?.split(",")[0] || "Location TBC"}</span>
          </div>

          {/* Dates Row - Compact */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {formatDateCompact(startDate)}
              {job.endDate && startDate !== job.endDate && ` - ${formatDateCompact(job.endDate)}`}
            </span>
            {job.duration && (
              <span className="text-muted-foreground/60">• {formatDuration(job.duration)}</span>
            )}
          </div>

          {/* Deadline */}
          {showDeadline && job.applicationDeadline && (
            <div className={`text-xs pt-2 border-t ${
              deadline.passed
                ? "text-red-500"
                : deadline.urgent
                  ? "text-amber-600 font-medium"
                  : "text-muted-foreground"
            }`}>
              {deadline.passed ? (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Closed
                </span>
              ) : (
                <span>
                  Apply by {formatDateCompact(job.applicationDeadline)}
                  {deadline.urgent && ` (${deadline.days === 0 ? "Today" : deadline.days === 1 ? "Tomorrow" : `${deadline.days}d`})`}
                </span>
              )}
            </div>
          )}
        </Card>
      </Link>
    );
  }

  // Default variant - full card with all details
  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <Card className={`overflow-hidden border hover:shadow-lg transition-all relative ${
        isNearby
          ? "border-2 border-emerald-400 dark:border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.3)] dark:shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]"
          : "hover:border-primary/30"
      }`}>
        {/* Nearby badge */}
        {isNearby && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 shadow-sm">
              Near you
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <span className="text-xl">{category.emoji}</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {employer?.companyName || "Individual"}
                  {employer?.verified && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                  )}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-bold text-lg text-gray-600 dark:text-gray-400">
                {formatCurrency(job.payAmount)}
              </span>
              {job.payType && (
                <p className="text-xs text-muted-foreground">
                  {job.payType === "HOURLY" ? "/hr" : "fixed"}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className={`h-4 w-4 shrink-0 ${isNearby ? "text-emerald-500" : ""}`} />
            <span className="truncate">{job.location || "Location to be confirmed"}</span>
          </div>
        </div>

        {/* Compact Schedule Row */}
        <div className="px-4 py-2 bg-muted/30 border-y flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {startDate ? formatDateCompact(startDate) : "TBC"}
              {job.endDate && startDate !== job.endDate && (
                <span> - {formatDateCompact(job.endDate)}</span>
              )}
            </span>
          </div>
          {formatTime(startDate) && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{formatTime(startDate)}</span>
            </div>
          )}
          {job.duration && (
            <div className="text-muted-foreground">
              {formatDuration(job.duration)}
            </div>
          )}
        </div>

        {/* Footer with Deadline */}
        <div className="p-4 pt-3 flex items-center justify-between">
          {showDeadline && job.applicationDeadline ? (
            <div className={`text-xs flex items-center gap-1.5 ${
              deadline.passed
                ? "text-red-500"
                : deadline.urgent
                  ? "text-amber-600 font-medium"
                  : "text-muted-foreground"
            }`}>
              {deadline.passed ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Applications closed</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Apply by {formatDateCompact(job.applicationDeadline)}
                    {deadline.urgent && (
                      <Badge variant="outline" className="ml-1.5 text-[10px] px-1.5 py-0 border-amber-500 text-amber-600">
                        {deadline.days === 0 ? "Today!" : deadline.days === 1 ? "Tomorrow" : `${deadline.days}d left`}
                      </Badge>
                    )}
                  </span>
                </>
              )}
            </div>
          ) : (
            <Badge variant="secondary" className="text-xs">
              {category.label}
            </Badge>
          )}
          <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            View details
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
});

// Export a simpler version for dashboard use
export const JobCardSimple = memo(function JobCardSimple({ job }: { job: any }) {
  const category = categoryConfig[job.category] || categoryConfig.OTHER;
  const employer = job.postedBy?.employerProfile;
  const startDate = job.startDate || job.dateTime;
  const deadline = getDaysUntilDeadline(job.applicationDeadline);

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <Card className="p-4 border hover:border-primary/30 hover:shadow-md transition-all h-full">
        {/* Header: Emoji + Title + Pay */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0">
            <span className="text-lg">{category.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1 mb-0.5">
              {job.title}
            </h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {employer?.companyName || "Individual"}
              {employer?.verified && (
                <CheckCircle2 className="h-3 w-3 text-blue-500" />
              )}
            </p>
          </div>
          <span className="font-bold text-gray-600 dark:text-gray-400 shrink-0">
            {formatCurrency(job.payAmount)}
          </span>
        </div>

        {/* Info Grid */}
        <div className="space-y-2 text-xs">
          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{job.location?.split(",")[0] || "Location TBC"}</span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>
              {formatJobDate(startDate)}
              {job.endDate && startDate !== job.endDate && ` → ${formatJobDate(job.endDate)}`}
            </span>
            {job.duration && (
              <span className="text-muted-foreground/60">• {formatDuration(job.duration)}</span>
            )}
          </div>

          {/* Deadline */}
          {job.applicationDeadline && (
            <div className={`flex items-center gap-2 pt-2 border-t ${
              deadline.passed
                ? "text-red-500"
                : deadline.urgent
                  ? "text-amber-600"
                  : "text-muted-foreground"
            }`}>
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {deadline.passed ? (
                <span>Closed</span>
              ) : (
                <span>
                  Apply by {formatJobDate(job.applicationDeadline)}
                  {deadline.urgent && (
                    <span className="ml-1 font-medium">
                      ({deadline.days === 0 ? "Today" : deadline.days === 1 ? "Tomorrow" : `${deadline.days}d`})
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
});
