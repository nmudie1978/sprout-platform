"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, TrendingUp, Star, ArrowRight, LayoutDashboard, Calendar, Building2, CheckCircle2, MapPin, Clock, AlertCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ProfileCompletionPrompt } from "@/components/profile-completion-prompt";
import { PageHeader } from "@/components/page-header";
import { DashboardReviews } from "@/components/dashboard-reviews";
import { EarningsDisplay } from "@/components/earnings-display";
import { BadgesDisplay } from "@/components/badges-display";
import { CareerInsights } from "@/components/career-insights";

export default function DashboardPage() {
  const { data: session } = useSession();

  const { data: applications } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const response = await fetch("/api/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
  });

  const { data: jobs } = useQuery({
    queryKey: ["nearby-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs?status=POSTED");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

  const pendingApplications = applications?.filter(
    (app: any) => app.status === "PENDING"
  );
  const acceptedApplications = applications?.filter(
    (app: any) => app.status === "ACCEPTED"
  );

  if (session?.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Dashboard loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Funky gradient mesh background - money & growth themed */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Base gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-amber-50/40 to-green-50/60" />

        {/* Mesh overlay gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-yellow-200/30 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-emerald-200/40 via-green-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-amber-100/30 via-transparent to-transparent rounded-full blur-3xl" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(34 197 94) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <PageHeader
        title="Welcome"
        gradientText="Back!"
        description="Here's what's happening with your jobs and career exploration"
        icon={LayoutDashboard}
      />

      {/* Stats */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="hover-lift border-2 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">
              Active Applications
            </CardTitle>
            <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold gradient-text">
              {pendingApplications?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Waiting for response
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-2 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">
              Jobs Accepted
            </CardTitle>
            <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold gradient-text">
              {acceptedApplications?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ready to complete
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift border-2 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">
              Completed Jobs
            </CardTitle>
            <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 p-2">
              <Star className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold gradient-text">
              {session.user.youthProfile?.completedJobsCount || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Building experience
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile, Earnings, Badges & Careers Row */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ProfileCompletionPrompt />
        <EarningsDisplay />
        <BadgesDisplay compact />
        <CareerInsights compact />
      </div>

      {/* My Applications - Full Width */}
      <div className="mb-8">
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">My Applications</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs">
                Find More Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {applications && applications.length > 0 ? (
              applications.map((app: any) => {
                const isAccepted = app.status === "ACCEPTED";
                const isRejected = app.status === "REJECTED";
                const isPending = app.status === "PENDING";
                const jobStatus = app.job.status;

                // Get job status badge
                const getJobStatusBadge = () => {
                  switch (jobStatus) {
                    case "IN_PROGRESS":
                      return (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <Loader2 className="mr-1 h-3 w-3" />
                          In Progress
                        </Badge>
                      );
                    case "ON_HOLD":
                      return (
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          On Hold
                        </Badge>
                      );
                    case "COMPLETED":
                      return (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      );
                    case "CANCELLED":
                      return (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Cancelled
                        </Badge>
                      );
                    default:
                      return null;
                  }
                };

                // Get application status badge
                const getApplicationStatusBadge = () => {
                  if (isAccepted) {
                    return (
                      <Badge className="bg-emerald-500 text-white">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Accepted
                      </Badge>
                    );
                  }
                  if (isRejected) {
                    return (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Not Selected
                      </Badge>
                    );
                  }
                  return (
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  );
                };

                return (
                  <Link key={app.id} href={`/jobs/${app.job.id}`}>
                    <Card
                      className={`hover-lift transition-all cursor-pointer group ${
                        isAccepted
                          ? "border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-background"
                          : isRejected
                          ? "border-2 opacity-60"
                          : "border-2 hover:border-primary/50"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className={`text-base line-clamp-1 ${isAccepted ? "text-emerald-800 dark:text-emerald-200" : ""} group-hover:text-primary transition-colors`}>
                              {app.job.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Building2 className={`h-4 w-4 ${isAccepted ? "text-emerald-600" : ""}`} />
                              <span className="font-medium">
                                {app.job.postedBy?.employerProfile?.companyName || "Individual Employer"}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {getApplicationStatusBadge()}
                            {isAccepted && getJobStatusBadge()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="space-y-2 text-sm">
                          {/* Date range */}
                          <div className={`flex items-center gap-1.5 ${isAccepted ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-muted-foreground"}`}>
                            <Calendar className="h-4 w-4" />
                            <span>
                              {app.job.startDate || app.job.endDate || app.job.dateTime ? (
                                <>
                                  {app.job.startDate || app.job.dateTime ? formatDate(app.job.startDate || app.job.dateTime) : ""}
                                  {app.job.endDate && (app.job.startDate || app.job.dateTime) && " - "}
                                  {app.job.endDate && formatDate(app.job.endDate)}
                                </>
                              ) : (
                                "Date TBC"
                              )}
                            </span>
                          </div>
                          {/* Location */}
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{app.job.location}</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(app.job.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          {/* Pay */}
                          <div className={`font-bold ${isAccepted ? "text-emerald-700 dark:text-emerald-300" : "text-primary"}`}>
                            {formatCurrency(app.job.payAmount)}
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                          Applied {formatDate(app.createdAt)}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            ) : (
              <Card className="border-2">
                <CardContent className="py-12 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No applications yet. Start browsing jobs!
                  </p>
                  <Button asChild className="shadow-lg">
                    <Link href="/jobs">Find Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Near You */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-2">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Jobs Near You</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs && jobs.length > 0 ? (
            jobs.slice(0, 6).map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="hover-lift border-2 transition-all cursor-pointer group hover:border-primary/50 hover:shadow-md h-full">
                  <div className="p-4">
                    {/* Title and Price Row */}
                    <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-dashed">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <span className="font-bold text-primary text-sm whitespace-nowrap">
                        {formatCurrency(job.payAmount)}{job.payType === "HOURLY" ? "/hr" : ""}
                      </span>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {job.startDate || job.endDate || job.dateTime ? (
                          <>
                            {job.startDate || job.dateTime ? formatDate(job.startDate || job.dateTime) : ""}
                            {job.endDate && (job.startDate || job.dateTime) && " - "}
                            {job.endDate && formatDate(job.endDate)}
                          </>
                        ) : (
                          <span className="text-muted-foreground font-normal">Date TBC</span>
                        )}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate">
                          {job.postedBy?.employerProfile?.companyName || "Individual"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{job.location}</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="border-2 col-span-full">
              <CardContent className="py-8 text-center">
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No jobs available right now. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="mb-6 text-2xl font-bold">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-lift border-2 cursor-pointer group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Link href="/explore" className="block p-6 text-center relative">
              <div className="mx-auto mb-3 h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🎯
              </div>
              <span className="font-semibold">Explore Careers</span>
            </Link>
          </Card>
          <Card className="hover-lift border-2 cursor-pointer group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Link href="/profile" className="block p-6 text-center relative">
              <div className="mx-auto mb-3 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                👤
              </div>
              <span className="font-semibold">Update Profile</span>
            </Link>
          </Card>
          <Card className="hover-lift border-2 cursor-pointer group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Link href="/ask-a-pro" className="block p-6 text-center relative">
              <div className="mx-auto mb-3 h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                💬
              </div>
              <span className="font-semibold">Ask a Pro</span>
            </Link>
          </Card>
          <Card className="hover-lift border-2 cursor-pointer group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Link href="/jobs" className="block p-6 text-center relative">
              <div className="mx-auto mb-3 h-14 w-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                💼
              </div>
              <span className="font-semibold">Find Jobs</span>
            </Link>
          </Card>
        </div>
      </div>

      {/* Reviews & Rating Section */}
      <div className="mt-10">
        <h2 className="mb-6 text-2xl font-bold">Your Reviews & Rating</h2>
        <DashboardReviews />
      </div>
    </div>
  );
}
