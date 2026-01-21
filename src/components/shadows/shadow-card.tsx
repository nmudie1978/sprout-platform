"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Clock,
  Calendar,
  MapPin,
  Building,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { format as formatDate } from "date-fns";
import { cn } from "@/lib/utils";

type ShadowStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

type ShadowFormat = "WALKTHROUGH" | "HALF_DAY" | "FULL_DAY";

interface ShadowCardProps {
  id: string;
  roleTitle: string;
  status: ShadowStatus;
  format: ShadowFormat;
  createdAt: Date;
  scheduledDate?: Date;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  locationName?: string;
  hostName?: string;
  hostCompany?: string;
  hostVerified?: boolean;
  hasReflection?: boolean;
  viewType?: "youth" | "host";
  youthName?: string;
}

const STATUS_CONFIG: Record<
  ShadowStatus,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    icon: AlertCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  PENDING: {
    label: "Pending",
    icon: Loader2,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  DECLINED: {
    label: "Declined",
    icon: XCircle,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  NO_SHOW: {
    label: "No Show",
    icon: AlertCircle,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
  },
};

const FORMAT_LABELS: Record<ShadowFormat, string> = {
  WALKTHROUGH: "2-hour walkthrough",
  HALF_DAY: "Half-day observation",
  FULL_DAY: "Full day",
};

export function ShadowCard({
  id,
  roleTitle,
  status,
  format,
  createdAt,
  scheduledDate,
  scheduledStartTime,
  scheduledEndTime,
  locationName,
  hostName,
  hostCompany,
  hostVerified,
  hasReflection,
  viewType = "youth",
  youthName,
}: ShadowCardProps) {
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const showSchedule = status === "APPROVED" && scheduledDate;
  const showReflectionPrompt = status === "COMPLETED" && !hasReflection && viewType === "youth";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shrink-0">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-sm truncate">{roleTitle}</h3>
                  {viewType === "youth" && (hostName || hostCompany) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building className="h-3 w-3" />
                      {hostCompany || hostName}
                      {hostVerified && (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      )}
                    </p>
                  )}
                  {viewType === "host" && youthName && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      From: {youthName}
                    </p>
                  )}
                </div>

                <Badge
                  variant="secondary"
                  className={cn("shrink-0", statusConfig.bgColor, statusConfig.color)}
                >
                  <StatusIcon className={cn(
                    "h-3 w-3 mr-1",
                    status === "PENDING" && "animate-spin"
                  )} />
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Format & Date */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{FORMAT_LABELS[format]}</span>
                </div>

                {showSchedule && scheduledDate ? (
                  <div className="flex items-center gap-1 text-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDate(new Date(scheduledDate), "MMM d, yyyy")}
                      {scheduledStartTime && ` at ${scheduledStartTime}`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Requested {formatDate(new Date(createdAt), "MMM d")}</span>
                  </div>
                )}

                {locationName && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{locationName}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/shadows/${id}`}>
                    View Details
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>

                {showReflectionPrompt && (
                  <Button size="sm" asChild>
                    <Link href={`/shadows/${id}/reflection`}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Add Reflection
                    </Link>
                  </Button>
                )}

                {status === "DRAFT" && (
                  <Button size="sm" variant="default" asChild>
                    <Link href={`/shadows/${id}/edit`}>
                      Continue Editing
                    </Link>
                  </Button>
                )}

                {viewType === "host" && status === "PENDING" && (
                  <Button size="sm" variant="default" asChild>
                    <Link href={`/shadows/${id}`}>
                      Review Request
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Empty state component
export function EmptyShadowState({ viewType = "youth" }: { viewType?: "youth" | "host" }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">
          {viewType === "youth" ? "No shadow requests yet" : "No incoming requests"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          {viewType === "youth"
            ? "Career shadowing lets you observe real workplaces and understand what jobs are really like."
            : "When youth request to shadow at your workplace, they'll appear here."}
        </p>
        {viewType === "youth" && (
          <Button asChild>
            <Link href="/shadows/new">
              Request a Shadow
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
