"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categoryEmojis: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

type FilterType = "all" | "pending" | "accepted" | "in_progress" | "completed" | "rejected";

interface ApplicationCardProps {
  app: any;
  onReorder?: (applicationId: string, direction: "up" | "down" | "top" | "bottom") => void;
  isFirst?: boolean;
  isLast?: boolean;
  isReordering?: boolean;
}

function ApplicationCard({ app, onReorder, isFirst, isLast, isReordering }: ApplicationCardProps) {
  const isAccepted = app.status === "ACCEPTED";
  const isRejected = app.status === "REJECTED";
  const isPending = app.status === "PENDING";
  const jobStatus = app.job.status;

  const isJobDone = isAccepted && (jobStatus === "COMPLETED" || jobStatus === "REVIEWED");
  const isJobInProgress = isAccepted && jobStatus === "IN_PROGRESS";

  const getStatusColor = () => {
    if (isJobDone) return "border-l-green-500 bg-green-50/50 dark:bg-green-950/20";
    if (isJobInProgress) return "border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20";
    if (isAccepted) return "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20";
    if (isRejected) return "border-l-red-400 bg-red-50/30 dark:bg-red-950/10 opacity-60";
    return "border-l-blue-400 bg-blue-50/30 dark:bg-blue-950/10";
  };

  const getStatusBadge = () => {
    if (isJobDone) {
      return (
        <Badge className="h-5 text-[10px] bg-green-600 text-white px-1.5">
          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
          Done
        </Badge>
      );
    }
    if (isJobInProgress) {
      return (
        <Badge className="h-5 text-[10px] bg-purple-500 text-white px-1.5">
          In Progress
        </Badge>
      );
    }
    if (isAccepted) {
      return (
        <Badge className="h-5 text-[10px] bg-emerald-500 text-white px-1.5">
          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
          Accepted
        </Badge>
      );
    }
    if (isRejected) {
      return (
        <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
          <XCircle className="h-2.5 w-2.5 mr-0.5" />
          Declined
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
        <Clock className="h-2.5 w-2.5 mr-0.5" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="group relative">
      <Link href={`/jobs/${app.job.id}`} className="block">
        <motion.div
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          className={`p-4 rounded-xl border-l-4 border bg-card hover:shadow-md transition-all cursor-pointer ${getStatusColor()}`}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl flex-shrink-0">
                {categoryEmojis[app.job.category] || "✨"}
              </span>
              <div className="min-w-0">
                <h4 className="font-medium text-base truncate leading-tight">
                  {app.job.title}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {app.job.postedBy?.employerProfile?.companyName || "Employer"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Reorder controls - visible on hover */}
              {onReorder && (
                <div className="flex items-center border rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-r-none"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onReorder(app.id, "top");
                          }}
                          disabled={isReordering || isFirst}
                        >
                          <ChevronsUp className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Move to top</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-none border-x"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onReorder(app.id, "up");
                          }}
                          disabled={isReordering || isFirst}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Move up</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-l-none"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onReorder(app.id, "down");
                          }}
                          disabled={isReordering || isLast}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Move down</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {app.job.location?.split(",")[0] || "TBC"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {app.job.startDate ? formatDate(app.job.startDate).split(",")[0] : "TBC"}
              </span>
            </div>
            <span className="font-bold text-primary text-base">
              {formatCurrency(app.job.payAmount)}
            </span>
          </div>

          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
            Applied {formatDate(app.createdAt)}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}

export default function ApplicationsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [filter, setFilter] = useState<FilterType>("all");
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const response = await fetch("/api/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ applicationId, direction }: { applicationId: string; direction: "up" | "down" | "top" | "bottom" }) => {
      const response = await fetch("/api/applications/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, direction }),
      });
      if (!response.ok) throw new Error("Failed to reorder application");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });

  const handleReorder = (applicationId: string, direction: "up" | "down" | "top" | "bottom") => {
    reorderMutation.mutate({ applicationId, direction });
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p>Loading applications...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session?.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">This page is only available for youth workers.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter applications based on selected filter - preserve API order (displayOrder)
  const filteredApplications = applications?.filter((app: any) => {
    const isAccepted = app.status === "ACCEPTED";
    const jobStatus = app.job?.status;
    const isJobDone = isAccepted && (jobStatus === "COMPLETED" || jobStatus === "REVIEWED");
    const isJobInProgress = isAccepted && jobStatus === "IN_PROGRESS";

    switch (filter) {
      case "pending":
        return app.status === "PENDING";
      case "accepted":
        return isAccepted && !isJobInProgress && !isJobDone;
      case "in_progress":
        return isJobInProgress;
      case "completed":
        return isJobDone;
      case "rejected":
        return app.status === "REJECTED";
      default:
        return true;
    }
  }) || [];

  const counts = {
    all: applications?.length || 0,
    pending: applications?.filter((a: any) => a.status === "PENDING").length || 0,
    accepted: applications?.filter((a: any) => {
      const isAccepted = a.status === "ACCEPTED";
      const jobStatus = a.job?.status;
      return isAccepted && jobStatus !== "IN_PROGRESS" && jobStatus !== "COMPLETED" && jobStatus !== "REVIEWED";
    }).length || 0,
    in_progress: applications?.filter((a: any) => a.status === "ACCEPTED" && a.job?.status === "IN_PROGRESS").length || 0,
    completed: applications?.filter((a: any) => a.status === "ACCEPTED" && (a.job?.status === "COMPLETED" || a.job?.status === "REVIEWED")).length || 0,
    rejected: applications?.filter((a: any) => a.status === "REJECTED").length || 0,
  };

  const filterButtons: { key: FilterType; label: string; color: string }[] = [
    { key: "all", label: "All", color: "bg-slate-500" },
    { key: "pending", label: "Pending", color: "bg-blue-500" },
    { key: "accepted", label: "Accepted", color: "bg-emerald-500" },
    { key: "in_progress", label: "In Progress", color: "bg-purple-500" },
    { key: "completed", label: "Completed", color: "bg-green-600" },
    { key: "rejected", label: "Declined", color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">My Applications</h1>
              <p className="text-sm text-muted-foreground">
                {applications?.length || 0} total applications
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by status</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <Button
                key={btn.key}
                variant={filter === btn.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(btn.key)}
                className={filter === btn.key ? btn.color : ""}
              >
                {btn.label}
                <Badge
                  variant="secondary"
                  className={`ml-2 text-xs ${filter === btn.key ? "bg-white/20 text-white" : ""}`}
                >
                  {counts[btn.key]}
                </Badge>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {filteredApplications.length > 0 ? (
            <div className="grid gap-3">
              {filteredApplications.map((app: any, index: number) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * Math.min(index, 10) }}
                >
                  <ApplicationCard
                    app={app}
                    onReorder={handleReorder}
                    isFirst={index === 0}
                    isLast={index === filteredApplications.length - 1}
                    isReordering={reorderMutation.isPending}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-muted-foreground mb-4">
                  {filter === "all"
                    ? "You haven't applied to any jobs yet"
                    : `No ${filter.replace("_", " ")} applications`}
                </p>
                {filter === "all" ? (
                  <Button asChild>
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setFilter("all")}>
                    View All Applications
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
