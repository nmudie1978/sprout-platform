"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  ArrowLeft,
  Flag,
  MessageSquare,
  PauseCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  ExternalLink,
  Loader2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

// Status badge colors
const statusColors: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  UNDER_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ACTION_TAKEN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  ESCALATED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  RESOLVED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  DISMISSED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const reasonLabels: Record<string, string> = {
  INAPPROPRIATE_CONTENT: "Inappropriate Content",
  SUSPECTED_SCAM: "Suspected Scam",
  SAFETY_CONCERN: "Safety Concern",
  HARASSMENT: "Harassment",
  SPAM: "Spam",
  UNDERPAYMENT: "Underpayment",
  OTHER: "Other",
};

export default function ReportDetailPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const reportId = params.id as string;

  const [note, setNote] = useState("");
  const [pauseReason, setPauseReason] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Fetch report details
  const { data: report, isLoading, error } = useQuery({
    queryKey: ["guardian-report", reportId],
    queryFn: async () => {
      const response = await fetch(`/api/community-reports/${reportId}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch report");
      }
      return response.json();
    },
    enabled: !!session?.user?.id && !!reportId,
  });

  // Generic mutation for report actions
  const actionMutation = useMutation({
    mutationFn: async ({ action, data }: { action: string; data?: any }) => {
      const response = await fetch(`/api/community-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Action failed");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      const messages: Record<string, string> = {
        claim: "Report claimed successfully",
        addNote: "Note added successfully",
        pauseTarget: "Target paused successfully",
        escalate: "Report escalated to admin",
        updateStatus: "Status updated successfully",
      };
      toast({ title: messages[variables.action] || "Action completed" });
      queryClient.invalidateQueries({ queryKey: ["guardian-report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["guardian-reports"] });
      queryClient.invalidateQueries({ queryKey: ["guardian-overview"] });
      setNote("");
      setPauseReason("");
      setNewStatus("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleClaim = () => {
    actionMutation.mutate({ action: "claim" });
  };

  const handleAddNote = () => {
    if (!note.trim()) {
      toast({ title: "Please enter a note", variant: "destructive" });
      return;
    }
    actionMutation.mutate({ action: "addNote", data: { note: note.trim() } });
  };

  const handlePauseTarget = () => {
    if (!pauseReason.trim()) {
      toast({ title: "Please enter a reason for pausing", variant: "destructive" });
      return;
    }
    actionMutation.mutate({ action: "pauseTarget", data: { reason: pauseReason.trim() } });
  };

  const handleEscalate = () => {
    actionMutation.mutate({ action: "escalate" });
  };

  const handleUpdateStatus = (status: string) => {
    actionMutation.mutate({ action: "updateStatus", data: { status } });
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "This report could not be found or you don't have access."}
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMyReport = report.assignedGuardianUserId === session?.user?.id;
  const canTakeAction = isMyReport || report.status === "OPEN";
  const isPaused = report.target?.isPaused;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Report Details
          </h1>
          <p className="text-muted-foreground text-sm">
            ID: {report.id.slice(0, 8)}...
          </p>
        </div>
        <Badge className={statusColors[report.status]}>
          {report.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Main Report Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {report.targetType === "JOB_POST" ? (
                    <Briefcase className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  {reasonLabels[report.reason] || report.reason}
                </CardTitle>
                <CardDescription>
                  {report.targetType === "JOB_POST" ? "Job Post" : "User"} Report
                  {" · "}
                  Submitted {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </CardDescription>
              </div>
              {report.escalatedToAdmin && (
                <Badge variant="destructive">Escalated to Admin</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reporter Info */}
            <div>
              <Label className="text-muted-foreground text-xs">Reported By</Label>
              <p className="font-medium">
                {report.reporter?.youthProfile?.displayName ||
                  report.reporter?.employerProfile?.companyName ||
                  "Anonymous User"}
              </p>
            </div>

            {/* Details */}
            {report.details && (
              <div>
                <Label className="text-muted-foreground text-xs">Details Provided</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{report.details}</p>
              </div>
            )}

            {/* Community */}
            <div>
              <Label className="text-muted-foreground text-xs">Community</Label>
              <p className="font-medium">{report.community?.name || "Unknown"}</p>
            </div>

            {/* Assigned Guardian */}
            {report.assignedGuardian && (
              <div>
                <Label className="text-muted-foreground text-xs">Assigned Guardian</Label>
                <p className="font-medium">
                  {report.assignedGuardian?.youthProfile?.displayName ||
                    report.assignedGuardian?.employerProfile?.companyName ||
                    report.assignedGuardian?.email}
                  {isMyReport && " (You)"}
                </p>
              </div>
            )}

            {/* Guardian Note */}
            {report.guardianNote && (
              <div>
                <Label className="text-muted-foreground text-xs">Guardian Note</Label>
                <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <MessageSquare className="h-4 w-4 inline mr-2 text-blue-600" />
                  {report.guardianNote}
                </div>
              </div>
            )}

            {/* Action Taken */}
            {report.actionTaken && (
              <div>
                <Label className="text-muted-foreground text-xs">Action Taken</Label>
                <div className="mt-1 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" />
                  {report.actionTaken}
                  {report.actionTakenAt && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({format(new Date(report.actionTakenAt), "PPp")})
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {report.targetType === "JOB_POST" ? "Reported Job Post" : "Reported User"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.target ? (
              <div className="space-y-3">
                {report.targetType === "JOB_POST" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{report.target.title}</h3>
                      {isPaused && (
                        <Badge variant="destructive" className="gap-1">
                          <PauseCircle className="h-3 w-3" />
                          Paused
                        </Badge>
                      )}
                    </div>
                    {report.target.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {report.target.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Posted by: {report.target.postedBy?.employerProfile?.companyName || "Unknown"}
                      </span>
                      {report.target.payAmount && (
                        <span>
                          {report.target.payAmount} NOK
                          {report.target.payType === "HOURLY" ? "/hr" : ""}
                        </span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/jobs/${report.targetId}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Job Post
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {report.target.youthProfile?.displayName ||
                          report.target.employerProfile?.companyName ||
                          report.target.email}
                      </h3>
                      {isPaused && (
                        <Badge variant="destructive" className="gap-1">
                          <PauseCircle className="h-3 w-3" />
                          Paused
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Role: {report.target.role}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Target information not available</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {(report.status === "OPEN" || report.status === "UNDER_REVIEW") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
              <CardDescription>
                Take action on this report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Claim Button */}
              {report.status === "OPEN" && !report.assignedGuardianUserId && (
                <div>
                  <Button
                    onClick={handleClaim}
                    disabled={actionMutation.isPending}
                  >
                    {actionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Flag className="h-4 w-4 mr-2" />
                    )}
                    Claim This Report
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Claiming assigns this report to you for review
                  </p>
                </div>
              )}

              {/* Add Note */}
              {canTakeAction && (
                <div className="space-y-2">
                  <Label>Add a Note</Label>
                  <Textarea
                    placeholder="Add internal notes about this report..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddNote}
                    disabled={actionMutation.isPending || !note.trim()}
                  >
                    {actionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    Add Note
                  </Button>
                </div>
              )}

              {/* Pause Target */}
              {canTakeAction && !isPaused && (
                <div className="space-y-2">
                  <Label>
                    Pause {report.targetType === "JOB_POST" ? "Job Post" : "User"}
                  </Label>
                  <Textarea
                    placeholder={`Reason for pausing this ${report.targetType === "JOB_POST" ? "job post" : "user"}...`}
                    value={pauseReason}
                    onChange={(e) => setPauseReason(e.target.value)}
                    rows={2}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={actionMutation.isPending || !pauseReason.trim()}
                      >
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Pause {report.targetType === "JOB_POST" ? "Job Post" : "User"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Pause</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will pause the {report.targetType === "JOB_POST" ? "job post" : "user"}.
                          {report.targetType === "JOB_POST"
                            ? " The job will be hidden from search results."
                            : " The user will be unable to perform actions on the platform."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePauseTarget}>
                          Confirm Pause
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {/* Already Paused */}
              {isPaused && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <PauseCircle className="h-4 w-4 inline mr-2 text-amber-600" />
                  This {report.targetType === "JOB_POST" ? "job post" : "user"} is already paused.
                </div>
              )}

              {/* Escalate */}
              {canTakeAction && !report.escalatedToAdmin && (
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Escalate to Admin
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Escalate Report</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will escalate the report to platform administrators for review.
                          Use this for serious violations that require admin intervention.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleEscalate}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Escalate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <p className="text-xs text-muted-foreground mt-1">
                    Escalate for serious violations requiring admin attention
                  </p>
                </div>
              )}

              {/* Update Status */}
              {canTakeAction && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Update Status</Label>
                  <div className="flex gap-2">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RESOLVED">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Resolved
                          </span>
                        </SelectItem>
                        <SelectItem value="DISMISSED">
                          <span className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-gray-600" />
                            Dismissed
                          </span>
                        </SelectItem>
                        <SelectItem value="ACTION_TAKEN">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            Action Taken
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => handleUpdateStatus(newStatus)}
                      disabled={actionMutation.isPending || !newStatus}
                    >
                      {actionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Update
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Closed Report Info */}
        {(report.status === "RESOLVED" || report.status === "DISMISSED") && (
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="py-6 text-center">
              {report.status === "RESOLVED" ? (
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
              ) : (
                <XCircle className="h-12 w-12 mx-auto text-gray-500 mb-2" />
              )}
              <h3 className="font-semibold">
                Report {report.status === "RESOLVED" ? "Resolved" : "Dismissed"}
              </h3>
              <p className="text-sm text-muted-foreground">
                This report has been closed and no further action is needed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
