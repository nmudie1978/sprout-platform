"use client";

import { memo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Clock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { RoleThumbnailSquare } from "@/components/role-thumbnail";
import { JobCourseLinks } from "@/components/job-course-links";
import type { ViewMode } from "@/hooks/useViewMode";

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

export interface JobCardV2Props {
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
  viewMode: ViewMode;
  userCity?: string | null;
  showDeadline?: boolean;
}

// Format date compactly
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

// Format duration
function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Check if job location matches user's city
function isJobNearby(jobLocation: string | undefined, userCity: string | null | undefined): boolean {
  if (!jobLocation || !userCity) return false;
  return jobLocation.toLowerCase().includes(userCity.toLowerCase());
}

// Calculate days until deadline
function getDaysUntilDeadline(deadline: string | null | undefined) {
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

// Format relative time
function formatTimeAgo(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const now = Date.now();
  const posted = new Date(dateStr).getTime();
  const diffMs = now - posted;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${weeks}w ago`;
}

// Grid template shared between header and rows
const LIST_GRID = "grid-cols-[2.5fr_1fr_1fr_1fr_auto_auto]";

// ============================================
// LIST HEADER - Column labels
// ============================================
export function JobListHeader() {
  return (
    <div className={`hidden lg:grid ${LIST_GRID} items-center gap-4 px-4 py-2 border-b bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider`}>
      <span>Job</span>
      <span>Location</span>
      <span>Date</span>
      <span>Posted</span>
      <span className="text-right">Pay</span>
      <span className="w-3.5" />
    </div>
  );
}

// ============================================
// LIST VIEW - Full-width horizontal row
// ============================================
function ListRow({ job, userCity, showDeadline }: Omit<JobCardV2Props, "viewMode">) {
  const employer = job.postedBy?.employerProfile;
  const startDate = job.startDate || job.dateTime;
  const isNearby = isJobNearby(job.location, userCity);
  const deadline = getDaysUntilDeadline(job.applicationDeadline);
  const postedAgo = formatTimeAgo(job.createdAt);

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      {/* Desktop: grid row */}
      <div className={`hidden lg:grid ${LIST_GRID} items-center gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
        isNearby ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <RoleThumbnailSquare category={job.category} title={job.title} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
                {job.title}
              </h4>
              {isNearby && (
                <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 shrink-0">
                  Near you
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <span className="truncate font-medium">{employer?.companyName || "Individual"}</span>
              {employer?.verified && <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className={`h-3 w-3 shrink-0 ${isNearby ? "text-emerald-500" : ""}`} />
          <span className="truncate">{job.location?.split(",")[0] || "TBC"}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>
            {formatDateCompact(startDate)}
            {job.duration ? ` · ${formatDuration(job.duration)}` : ""}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          {showDeadline && deadline.days >= 0 ? (
            <span className={deadline.urgent ? "text-orange-500 font-medium" : ""}>
              <AlertCircle className="h-3 w-3 inline mr-1" />
              {deadline.days === 0 ? "Due today" : `${deadline.days}d left`}
            </span>
          ) : postedAgo ? (
            <span>{postedAgo}</span>
          ) : null}
        </div>

        <div className="text-right">
          <span className="font-bold text-sm">{formatCurrency(job.payAmount)}</span>
          {job.payType && (
            <p className="text-[10px] text-muted-foreground">
              {job.payType === "HOURLY" ? "/hr" : "fixed"}
            </p>
          )}
        </div>

        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Mobile: stacked row */}
      <div className={`flex lg:hidden items-start gap-3 px-3 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
        isNearby ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
      }`}>
        <RoleThumbnailSquare category={job.category} title={job.title} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
              {job.title}
            </h4>
            {isNearby && (
              <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 shrink-0">Near you</Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <span className="truncate font-medium">{employer?.companyName || "Individual"}</span>
            {employer?.verified && <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/70 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className={`h-2.5 w-2.5 shrink-0 ${isNearby ? "text-emerald-500" : ""}`} />
              {job.location?.split(",")[0] || "TBC"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 shrink-0" />
              {formatDateCompact(startDate)}
            </span>
            {postedAgo && <span>{postedAgo}</span>}
          </div>
        </div>
        <div className="text-right shrink-0 pt-0.5">
          <span className="font-bold text-sm">{formatCurrency(job.payAmount)}</span>
          {job.payType && (
            <p className="text-[10px] text-muted-foreground">{job.payType === "HOURLY" ? "/hr" : "fixed"}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ============================================
// GRID VIEW - Standard card layout
// ============================================
function GridCard({ job, userCity, showDeadline }: Omit<JobCardV2Props, "viewMode">) {
  const employer = job.postedBy?.employerProfile;
  const startDate = job.startDate || job.dateTime;
  const isNearby = isJobNearby(job.location, userCity);
  const deadline = getDaysUntilDeadline(job.applicationDeadline);

  return (
    <Link href={`/jobs/${job.id}`} className="block group h-full">
      <Card className={`overflow-hidden border rounded-lg hover:shadow-lg transition-all relative h-full flex flex-col ${
        isNearby
          ? "border-2 border-emerald-400 dark:border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
          : "hover:border-primary/30"
      }`}>
        {/* Nearby badge */}
        {isNearby && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-1.5 py-0.5">
              Near you
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="p-3 pb-2 flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <RoleThumbnailSquare category={job.category} title={job.title} size="lg" />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  {employer?.companyName || "Individual"}
                  {employer?.verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-bold text-base text-foreground">
                {formatCurrency(job.payAmount)}
              </span>
              {job.payType && (
                <p className="text-[10px] text-muted-foreground">
                  {job.payType === "HOURLY" ? "/hr" : "fixed"}
                </p>
              )}
            </div>
          </div>

          {/* Structured signals row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 truncate">
              <MapPin className={`h-3 w-3 shrink-0 ${isNearby ? "text-emerald-500" : ""}`} />
              {job.location?.split(",")[0] || "TBC"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {startDate ? formatDateCompact(startDate) : "TBC"}
            </span>
            {job.duration && (
              <span className="text-muted-foreground">{formatDuration(job.duration)}</span>
            )}
          </div>
        </div>

        {/* Course links */}
        <div className="px-3 pb-1.5">
          <JobCourseLinks category={job.category} />
        </div>

        {/* Footer — action-first */}
        <div className="px-3 py-2 border-t bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showDeadline && job.applicationDeadline && !deadline.passed ? (
              <span className={`text-[10px] flex items-center gap-1 ${
                deadline.urgent ? "text-amber-600 font-medium" : "text-muted-foreground"
              }`}>
                <Clock className="h-3 w-3" />
                By {formatDateCompact(job.applicationDeadline)}
              </span>
            ) : deadline.passed ? (
              <span className="text-[10px] text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Closed
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Open to apply
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">
            View Job
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

// ============================================
// COMPACT VIEW - Dense list with smaller cards
// ============================================
function CompactCard({ job, userCity, showDeadline }: Omit<JobCardV2Props, "viewMode">) {
  const employer = job.postedBy?.employerProfile;
  const startDate = job.startDate || job.dateTime;
  const isNearby = isJobNearby(job.location, userCity);
  const deadline = getDaysUntilDeadline(job.applicationDeadline);

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <Card className={`p-2 border rounded-lg hover:shadow-md transition-all relative ${
        isNearby
          ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
          : "hover:border-primary/30"
      }`}>
        {/* Nearby indicator dot */}
        {isNearby && (
          <div className="absolute -top-1 -right-1 z-10">
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Thumbnail */}
          <RoleThumbnailSquare category={job.category} title={job.title} size="sm" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
                {job.title}
              </h4>
              <span className="font-bold text-sm shrink-0">{formatCurrency(job.payAmount)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className={`h-2.5 w-2.5 ${isNearby ? "text-emerald-500" : ""}`} />
                {job.location?.split(",")[0] || "TBC"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {formatDateCompact(startDate)}
              </span>
              {!deadline.passed && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Open</span>
                </>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </Card>
    </Link>
  );
}

// ============================================
// MAIN COMPONENT - Switch between views
// ============================================
export const JobCardV2 = memo(function JobCardV2({
  job,
  viewMode,
  userCity,
  showDeadline = true,
}: JobCardV2Props) {
  const props = { job, userCity, showDeadline };

  switch (viewMode) {
    case "list":
      return <ListRow {...props} />;
    case "compact":
      return <CompactCard {...props} />;
    case "grid":
    default:
      return <GridCard {...props} />;
  }
});

export { type ViewMode };
