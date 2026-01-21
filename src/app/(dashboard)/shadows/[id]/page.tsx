"use client";

import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  Building,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Shield,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ShadowPrep,
  ReportIssue,
  HostVerificationBadge,
  AgeGatingNotice,
  getTemplateInfo,
} from "@/components/shadows";

type ShadowStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

interface ShadowDetail {
  id: string;
  status: ShadowStatus;
  roleTitle: string;
  roleCategory?: string;
  format: "WALKTHROUGH" | "HALF_DAY" | "FULL_DAY";
  learningGoals: string[];
  message: string;
  createdAt: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  locationName?: string;
  locationAddress?: string;
  hostMessage?: string;
  declineReason?: string;
  requiresGuardianConsent: boolean;
  guardianNotified: boolean;
  reportedIssue: boolean;
  youth: {
    id: string;
    youthAgeBand?: string;
    youthProfile?: {
      displayName?: string;
      avatarId?: string;
      city?: string;
    };
  };
  host?: {
    id: string;
    fullName?: string;
    isVerifiedAdult?: boolean;
    employerProfile?: {
      companyName?: string;
      companyLogo?: string;
      verified?: boolean;
    };
  };
  reflection?: {
    id: string;
    createdAt: string;
  };
}

const STATUS_CONFIG: Record<
  ShadowStatus,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    icon: AlertCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    description: "This request hasn't been submitted yet.",
  },
  PENDING: {
    label: "Pending",
    icon: Loader2,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    description: "Waiting for the host to respond.",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    description: "Your shadow has been approved!",
  },
  DECLINED: {
    label: "Declined",
    icon: XCircle,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
    description: "The host was unable to accommodate this request.",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    description: "You've completed this shadow experience!",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    description: "This request was cancelled.",
  },
  NO_SHOW: {
    label: "No Show",
    icon: AlertCircle,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
    description: "The youth did not attend this shadow.",
  },
};

const LEARNING_GOAL_LABELS: Record<string, string> = {
  DAILY_WORK: "What does a typical day look like?",
  SKILLS_USED: "What skills are needed?",
  WORK_ENVIRONMENT: "What's the workplace culture like?",
  CAREER_PATH: "How do people get into this role?",
  EDUCATION_REQUIRED: "What education or training is needed?",
  CHALLENGES: "What are the hard parts of the job?",
};

export default function ShadowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const justSubmitted = searchParams.get("submitted") === "true";

  const [isReporting, setIsReporting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [scheduledEndTime, setScheduledEndTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [hostMessage, setHostMessage] = useState("");
  const [declineReason, setDeclineReason] = useState("");

  // Fetch shadow details
  const { data: shadow, isLoading } = useQuery<ShadowDetail>({
    queryKey: ["shadow", id],
    queryFn: async () => {
      const response = await fetch(`/api/shadows/${id}`);
      if (!response.ok) throw new Error("Failed to fetch shadow");
      return response.json();
    },
    enabled: !!session,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/shadows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update shadow");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shadow", id] });
      queryClient.invalidateQueries({ queryKey: ["shadows"] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (details: string) => {
      const response = await fetch(`/api/shadows/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details }),
      });
      if (!response.ok) throw new Error("Failed to submit report");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shadow", id] });
      setIsReporting(false);
    },
  });

  const handleApprove = () => {
    if (!scheduledDate || !scheduledStartTime || !scheduledEndTime) return;
    updateMutation.mutate({
      action: "approve",
      scheduledDate: scheduledDate.toISOString(),
      scheduledStartTime,
      scheduledEndTime,
      locationName,
      locationAddress,
      hostMessage,
    });
  };

  const handleDecline = () => {
    updateMutation.mutate({
      action: "decline",
      hostMessage,
      declineReason,
    });
  };

  const handleComplete = () => {
    updateMutation.mutate({
      action: "complete",
      youthAttended: true,
    });
  };

  const handleCancel = () => {
    updateMutation.mutate({ action: "cancel" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!shadow) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Shadow request not found.</p>
            <Button className="mt-4" asChild>
              <Link href="/shadows">Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isYouth = shadow.youth.id === session?.user?.id;
  const isHost = shadow.host?.id === session?.user?.id;
  const statusConfig = STATUS_CONFIG[shadow.status];
  const StatusIcon = statusConfig.icon;
  const templateInfo = getTemplateInfo(shadow.format);

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-2xl relative">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/shadows">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shadows
          </Link>
        </Button>

        {/* Just Submitted Notice */}
        {justSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  Request Submitted!
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  We'll notify you when the host responds.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shrink-0">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{shadow.roleTitle}</h1>
              {shadow.roleCategory && (
                <p className="text-sm text-muted-foreground">{shadow.roleCategory}</p>
              )}
            </div>
            <Badge
              variant="secondary"
              className={cn("shrink-0", statusConfig.bgColor, statusConfig.color)}
            >
              <StatusIcon className={cn(
                "h-3 w-3 mr-1",
                shadow.status === "PENDING" && "animate-spin"
              )} />
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {statusConfig.description}
          </p>
        </motion.div>

        {/* Approved: Show Prep */}
        {shadow.status === "APPROVED" && isYouth && shadow.scheduledDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ShadowPrep
              shadow={{
                id: shadow.id,
                roleTitle: shadow.roleTitle,
                format: shadow.format,
                scheduledDate: new Date(shadow.scheduledDate),
                scheduledStartTime: shadow.scheduledStartTime || "",
                scheduledEndTime: shadow.scheduledEndTime || "",
                locationName: shadow.locationName,
                locationAddress: shadow.locationAddress,
                hostName: shadow.host?.fullName,
                hostCompany: shadow.host?.employerProfile?.companyName,
                requiresGuardianConsent: shadow.requiresGuardianConsent,
                guardianNotified: shadow.guardianNotified,
              }}
            />
          </motion.div>
        )}

        {/* Details (for pending/other states) */}
        {shadow.status !== "APPROVED" && (
          <div className="space-y-6">
            {/* Learning Goals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Learning Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shadow.learningGoals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{LEARNING_GOAL_LABELS[goal] || goal}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Format & Details */}
            <Card>
              <CardContent className="py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Format</p>
                      <p className="text-sm text-muted-foreground">
                        {templateInfo?.title || shadow.format}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Requested</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(shadow.createdAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Request Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{shadow.message}</p>
              </CardContent>
            </Card>

            {/* Host Info */}
            {shadow.host && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {shadow.host.employerProfile?.companyLogo ? (
                        <img
                          src={shadow.host.employerProfile.companyLogo}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <Building className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {shadow.host.employerProfile?.companyName || shadow.host.fullName}
                      </p>
                      {shadow.host.employerProfile?.companyName && shadow.host.fullName && (
                        <p className="text-xs text-muted-foreground">{shadow.host.fullName}</p>
                      )}
                    </div>
                    <HostVerificationBadge
                      isVerified={shadow.host.isVerifiedAdult || false}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Host Response (for declined) */}
            {shadow.status === "DECLINED" && (shadow.hostMessage || shadow.declineReason) && (
              <Card className="border-rose-500/50">
                <CardContent className="py-4">
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-400 mb-2">
                    Host's Response
                  </p>
                  {shadow.hostMessage && (
                    <p className="text-sm">{shadow.hostMessage}</p>
                  )}
                  {shadow.declineReason && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Reason: {shadow.declineReason}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Host Actions (for pending requests) */}
        {isHost && shadow.status === "PENDING" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Respond to Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Schedule Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <div className="relative mt-1">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => setScheduledDate(e.target.value ? new Date(e.target.value) : undefined)}
                        min={format(new Date(), "yyyy-MM-dd")}
                        className="w-full pl-10 p-2.5 rounded-lg border bg-background text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Start</label>
                      <input
                        type="time"
                        value={scheduledStartTime}
                        onChange={(e) => setScheduledStartTime(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End</label>
                      <input
                        type="time"
                        value={scheduledEndTime}
                        onChange={(e) => setScheduledEndTime(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Location Name</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g., Main Office, Studio A"
                    className="w-full mt-1 p-2 rounded-lg border bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Address</label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="Full address"
                    className="w-full mt-1 p-2 rounded-lg border bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Message (optional)</label>
                  <textarea
                    value={hostMessage}
                    onChange={(e) => setHostMessage(e.target.value)}
                    placeholder="Any additional information for the youth..."
                    className="w-full mt-1 p-2 rounded-lg border bg-background resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={!scheduledDate || !scheduledStartTime || !scheduledEndTime || updateMutation.isPending}
                    className="flex-1"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                    disabled={updateMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Complete Button (for approved shadows) */}
        {isHost && shadow.status === "APPROVED" && (
          <div className="mt-6">
            <Button onClick={handleComplete} disabled={updateMutation.isPending} className="w-full">
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark as Completed
            </Button>
          </div>
        )}

        {/* Reflection Prompt (for completed) */}
        {shadow.status === "COMPLETED" && isYouth && !shadow.reflection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="border-purple-500/50 bg-purple-500/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium">Ready to reflect?</p>
                    <p className="text-sm text-muted-foreground">
                      Capture your insights from this experience.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/shadows/${id}/reflection`}>
                      Add Reflection
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Cancel Button (for youth on pending) */}
        {isYouth && shadow.status === "PENDING" && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="w-full"
            >
              Cancel Request
            </Button>
          </div>
        )}

        {/* Report Issue */}
        {(isYouth || isHost) && !shadow.reportedIssue && shadow.status !== "DRAFT" && (
          <div className="mt-8 pt-6 border-t">
            <ReportIssue
              onReport={(details) => reportMutation.mutate(details)}
              isSubmitting={reportMutation.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}
