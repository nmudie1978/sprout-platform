"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  FileWarning,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  PauseCircle,
  Flag,
  Eye,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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

export default function GuardianDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch guardian overview
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["guardian-overview"],
    queryFn: async () => {
      const response = await fetch("/api/guardian");
      if (!response.ok) throw new Error("Failed to fetch overview");
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  // Fetch reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["guardian-reports"],
    queryFn: async () => {
      const response = await fetch("/api/community-reports");
      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    },
    enabled: !!session?.user?.id && (overview?.isGuardian || overview?.isAdmin),
  });

  // Fetch job posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["guardian-posts"],
    queryFn: async () => {
      const response = await fetch("/api/guardian/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    enabled: !!session?.user?.id && (overview?.isGuardian || overview?.isAdmin),
  });

  // Fetch conversation reports
  const { data: conversationReportsData, isLoading: conversationReportsLoading } = useQuery({
    queryKey: ["guardian-conversation-reports"],
    queryFn: async () => {
      const response = await fetch("/api/guardian/conversation-reports");
      if (!response.ok) throw new Error("Failed to fetch conversation reports");
      return response.json();
    },
    enabled: !!session?.user?.id && (overview?.isGuardian || overview?.isAdmin),
  });

  // Claim report mutation
  const claimMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/community-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Report claimed successfully" });
      queryClient.invalidateQueries({ queryKey: ["guardian-reports"] });
      queryClient.invalidateQueries({ queryKey: ["guardian-overview"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (overviewLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  // Not a guardian or admin
  if (!overview?.isGuardian && !overview?.isAdmin) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Guardian Assignment</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You are not currently assigned as a community guardian. If you
              believe this is an error, please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const openReports = reports?.filter((r: any) => r.status === "OPEN") || [];
  const underReviewReports = reports?.filter((r: any) => r.status === "UNDER_REVIEW") || [];
  const pausedPosts = posts?.filter((p: any) => p.isPaused) || [];

  // Conversation reports
  const conversationReports = conversationReportsData?.reports || [];
  const openConversationReports = conversationReports.filter((r: any) => r.status === "OPEN");

  // Claim conversation report mutation
  const claimConversationReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/guardian/conversation-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Message report claimed successfully" });
      queryClient.invalidateQueries({ queryKey: ["guardian-conversation-reports"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Guardian Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {overview?.communityName ? (
              <>
                Community: <span className="font-medium text-foreground">{overview.communityName}</span>
              </>
            ) : overview?.isAdmin ? (
              "Platform Administrator - All communities"
            ) : (
              "No community assigned"
            )}
          </p>
        </div>
        {overview?.isAdmin && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Admin Access
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Reports</p>
                <p className="text-3xl font-bold">{overview?.counts?.openReports || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-3xl font-bold">{overview?.counts?.underReviewReports || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jobs in Community</p>
                <p className="text-3xl font-bold">{overview?.counts?.totalJobsInCommunity || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paused Jobs</p>
                <p className="text-3xl font-bold">{overview?.counts?.pausedJobs || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <PauseCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Message Reports
            {openConversationReports.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {openConversationReports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileWarning className="h-4 w-4" />
            Job Reports
            {openReports.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {openReports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="posts" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Job Posts
          </TabsTrigger>
        </TabsList>

        {/* Message Reports Tab */}
        <TabsContent value="messages" className="space-y-4">
          {conversationReportsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : conversationReports.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No Message Reports</h3>
                <p className="text-muted-foreground">
                  There are no conversation reports to review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conversationReports.map((report: any) => {
                const reporterName =
                  report.reporter?.youthProfile?.displayName ||
                  report.reporter?.employerProfile?.companyName ||
                  "Unknown";
                const reportedName =
                  report.reported?.youthProfile?.displayName ||
                  report.reported?.employerProfile?.companyName ||
                  "Unknown";

                return (
                  <Card
                    key={report.id}
                    className={`hover:shadow-md transition-shadow ${
                      report.status === "OPEN" ? "border-amber-300" : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={
                                report.status === "OPEN"
                                  ? "bg-amber-100 text-amber-800"
                                  : report.status === "IN_REVIEW"
                                  ? "bg-blue-100 text-blue-800"
                                  : report.status === "RESOLVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }
                            >
                              {report.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline">
                              {report.category.replace("_", " ")}
                            </Badge>
                            {report.conversation?.status === "FROZEN" && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Conversation Frozen
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-lg mb-1">
                            Message Report: {report.category.replace("_", " ")}
                          </h3>

                          <div className="text-sm text-muted-foreground mb-2">
                            <p>
                              <strong>Reporter:</strong> {reporterName} ({report.reporter?.role})
                            </p>
                            <p>
                              <strong>Reported User:</strong> {reportedName} ({report.reported?.role})
                            </p>
                            {report.conversation?.job && (
                              <p>
                                <strong>Related Job:</strong> {report.conversation.job.title}
                              </p>
                            )}
                          </div>

                          {report.details && (
                            <p className="text-muted-foreground text-sm mb-2 p-2 bg-muted rounded">
                              &ldquo;{report.details}&rdquo;
                            </p>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Reported{" "}
                            {formatDistanceToNow(new Date(report.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          {report.status === "OPEN" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                claimConversationReportMutation.mutate(report.id)
                              }
                              disabled={claimConversationReportMutation.isPending}
                            >
                              <Flag className="h-4 w-4 mr-1" />
                              Claim
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/guardian/message-report/${report.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Job Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {reportsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : reports?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No Reports</h3>
                <p className="text-muted-foreground">
                  There are no reports to review at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports?.map((report: any) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={statusColors[report.status]}>
                            {report.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline">
                            {report.targetType === "JOB_POST" ? "Job Post" : "User"}
                          </Badge>
                          {report.escalatedToAdmin && (
                            <Badge variant="destructive">Escalated</Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg mb-1">
                          {reasonLabels[report.reason] || report.reason}
                        </h3>

                        {report.details && (
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                            {report.details}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Reported by:{" "}
                            {report.reporter?.youthProfile?.displayName ||
                              report.reporter?.employerProfile?.companyName ||
                              "Anonymous"}
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(report.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {report.guardianNote && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                              <MessageSquare className="h-4 w-4 inline mr-1" />
                              <strong>Note:</strong> {report.guardianNote}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {report.status === "OPEN" && !report.assignedGuardianUserId && (
                          <Button
                            size="sm"
                            onClick={() => claimMutation.mutate(report.id)}
                            disabled={claimMutation.isPending}
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            Claim
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/guardian/report/${report.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Job Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Job Posts</h3>
                <p className="text-muted-foreground">
                  There are no job posts in this community yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts?.map((job: any) => (
                <Card
                  key={job.id}
                  className={`hover:shadow-md transition-shadow ${
                    job.isPaused ? "border-red-200 bg-red-50/50 dark:bg-red-950/20" : ""
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{job.title}</h3>
                          {job.isPaused && (
                            <Badge variant="destructive" className="gap-1">
                              <PauseCircle className="h-3 w-3" />
                              Paused
                            </Badge>
                          )}
                          <Badge variant="outline">{job.status}</Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {job.postedBy?.employerProfile?.companyName || "Unknown employer"}
                          </span>
                          <span>{job.location}</span>
                          <span>
                            {job.payAmount} NOK {job.payType === "HOURLY" ? "/hr" : ""}
                          </span>
                          <span>{job._count?.applications || 0} applications</span>
                        </div>

                        {job.isPaused && job.pausedReason && (
                          <p className="text-sm text-red-600 mt-2">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            Reason: {job.pausedReason}
                          </p>
                        )}
                      </div>

                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/jobs/${job.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
