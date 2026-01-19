"use client";

import { memo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Clock, Calendar, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { RoleThumbnailSquare } from "@/components/role-thumbnail";
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

// ============================================
// LIST VIEW - Full-width horizontal row
// ============================================
function ListRow({ job, userCity, showDeadline }: Omit<JobCardV2Props, "viewMode">) {
  const category = categoryConfig[job.category] || categoryConfig.OTHER;
  const employer = job.postedBy?.employerProfile;
  const startDate = job.startDate || job.dateTime;
  const isNearby = isJobNearby(job.location, userCity);
  const deadline = getDaysUntilDeadline(job.applicationDeadline);

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className={`flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
        isNearby ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
      }`}>
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <RoleThumbnailSquare category={job.category} title={job.title} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {job.title}
              </h4>
              {isNearby && (
                <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 shrink-0">
                  Near you
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              {employer?.companyName || "Individual"}
              {employer?.verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
              <span className="mx-1">•</span>
              <span>{category.label}</span>
            </p>
          </div>
        </div>

        {/* Middle: Location + Date */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-1.5 w-32">
            <MapPin className={`h-3 w-3 shrink-0 ${isNearby ? "text-emerald-500" : ""}`} />
            <span className="truncate">{job.location?.split(",")[0] || "TBC"}</span>
          </div>
          <div className="flex items-center gap-1.5 w-24">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formatDateCompact(startDate)}</span>
          </div>
        </div>

        {/* Right: Price + CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="font-bold text-sm">{formatCurrency(job.payAmount)}</span>
            {job.payType && (
              <p className="text-[10px] text-muted-foreground">
                {job.payType === "HOURLY" ? "/hr" : "fixed"}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// ============================================
// GRID VIEW - Standard card layout
// ============================================
function GridCard({ job, userCity, showDeadline }: Omit<JobCardV2Props, "viewMode">) {
  const category = categoryConfig[job.category] || categoryConfig.OTHER;
  const employer = job.postedBy?.employerProfile;
  const startDate = job.startDate || job.dateTime;
  const isNearby = isJobNearby(job.location, userCity);
  const deadline = getDaysUntilDeadline(job.applicationDeadline);

  return (
    <Link href={`/jobs/${job.id}`} className="block group h-full">
      <Card className={`overflow-hidden border hover:shadow-lg transition-all relative h-full flex flex-col ${
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
        <div className="p-4 pb-3 flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <RoleThumbnailSquare category={job.category} title={job.title} size="lg" />
              <div className="min-w-0">
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {employer?.companyName || "Individual"}
                  {employer?.verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
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
            <span className="truncate">{job.location || "Location TBC"}</span>
          </div>
        </div>

        {/* Schedule Row */}
        <div className="px-4 py-2 bg-muted/30 border-y flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {startDate ? formatDateCompact(startDate) : "TBC"}
            </span>
          </div>
          {formatTime(startDate) && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{formatTime(startDate)}</span>
            </div>
          )}
          {job.duration && (
            <span className="text-muted-foreground">{formatDuration(job.duration)}</span>
          )}
        </div>

        {/* Footer */}
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
                  <span>Closed</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  <span>Apply by {formatDateCompact(job.applicationDeadline)}</span>
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
}

// ============================================
// COMPACT VIEW - Dense list with smaller cards
// ============================================
function CompactCard({ job, userCity, showDeadline }: Omit<JobCardV2Props, "viewMode">) {
  const category = categoryConfig[job.category] || categoryConfig.OTHER;
  const employer = job.postedBy?.employerProfile;
  const startDate = job.startDate || job.dateTime;
  const isNearby = isJobNearby(job.location, userCity);
  const deadline = getDaysUntilDeadline(job.applicationDeadline);

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <Card className={`p-2.5 border hover:shadow-md transition-all relative ${
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

        <div className="flex items-center gap-2.5">
          {/* Thumbnail */}
          <RoleThumbnailSquare category={job.category} title={job.title} size="sm" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {job.title}
              </h4>
              <span className="font-bold text-sm shrink-0">{formatCurrency(job.payAmount)}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <span className="truncate">{employer?.companyName || "Individual"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                {job.location?.split(",")[0] || "TBC"}
              </span>
              <span>•</span>
              <span>{formatDateCompact(startDate)}</span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
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
