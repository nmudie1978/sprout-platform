"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import {
  JourneyAnchor,
  RecentJourneyActivity,
  ExploreWhenReady,
  type JourneyState,
  type JourneyActivity,
} from "@/components/journey";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Query onboarding status
  const { data: onboardingStatus } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const response = await fetch("/api/onboarding");
      if (!response.ok) throw new Error("Failed to fetch onboarding status");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 60 * 1000,
  });

  // Query applications for journey state
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const response = await fetch("/api/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 30 * 1000,
  });

  // Query shadows for journey state
  const { data: shadowsData } = useQuery({
    queryKey: ["my-shadows"],
    queryFn: async () => {
      const response = await fetch("/api/shadows");
      if (!response.ok) throw new Error("Failed to fetch shadows");
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
    staleTime: 60 * 1000,
  });

  // Show onboarding modal if needed
  useEffect(() => {
    if (onboardingStatus) {
      if (onboardingStatus.needsOnboarding) {
        setShowOnboarding(true);
        setOnboardingComplete(false);
      } else {
        setOnboardingComplete(true);
      }
    }
  }, [onboardingStatus]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingComplete(true);
  };

  // Extract applications array
  const applications = Array.isArray(applicationsData)
    ? applicationsData
    : (applicationsData?.applications || []);

  // Extract shadows array
  const shadows = Array.isArray(shadowsData) ? shadowsData : [];

  // Calculate journey state
  const completedJobs = applications.filter(
    (app: any) =>
      app.status === "ACCEPTED" &&
      (app.job?.status === "COMPLETED" || app.job?.status === "REVIEWED")
  );

  const pendingApps = applications.filter((app: any) => app.status === "PENDING");
  const completedShadows = shadows.filter((s: any) => s.status === "COMPLETED");

  const journeyState: JourneyState = {
    hasCompletedJobs: completedJobs.length > 0,
    completedJobsCount: completedJobs.length,
    hasActiveApplications: pendingApps.length > 0,
    pendingApplicationsCount: pendingApps.length,
    hasReflections: completedShadows.some((s: any) => s.reflection),
    reflectionsCount: completedShadows.filter((s: any) => s.reflection).length,
    hasShadowExperiences: completedShadows.length > 0,
    shadowsCount: completedShadows.length,
    hasExploredCareers: false, // Would need separate query
    lastActivityType: completedJobs.length > 0 ? "job" : null,
  };

  // Build recent journey activity from real data
  const recentActivities: JourneyActivity[] = [];

  // Add completed jobs
  completedJobs.slice(0, 3).forEach((app: any) => {
    recentActivities.push({
      id: `job-${app.id}`,
      type: "job_completed",
      title: `Completed: ${app.job?.title || "Small job"}`,
      description: app.job?.postedBy?.employerProfile?.companyName,
      date: new Date(app.job?.completedAt || app.updatedAt),
      href: `/jobs/${app.job?.id}`,
    });
  });

  // Add completed shadows
  completedShadows.slice(0, 2).forEach((shadow: any) => {
    recentActivities.push({
      id: `shadow-${shadow.id}`,
      type: "shadow_completed",
      title: `Shadowed: ${shadow.roleTitle}`,
      description: shadow.reflection ? "Reflection added" : "Experience completed",
      date: new Date(shadow.completedAt || shadow.updatedAt || shadow.createdAt),
      href: `/shadows/${shadow.id}`,
    });
  });

  // Sort by date
  recentActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Loading state
  if (session?.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p>Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = session?.user?.youthProfile?.displayName || "";

  return (
    <div className="min-h-full">
      {/* Onboarding Modal */}
      <OnboardingWizard
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Greeting - Minimal, warm */}
        {displayName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mb-4"
          >
            Hi, {displayName}
          </motion.p>
        )}

        {/* JOURNEY ANCHOR - Primary visual & emotional entry point */}
        {applicationsLoading ? (
          <div className="mb-8">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <JourneyAnchor state={journeyState} displayName={displayName} />
        )}

        {/* SECONDARY CONTENT */}
        <div className="space-y-8">
          {/* Recent Journey Activity */}
          {recentActivities.length > 0 && (
            <RecentJourneyActivity activities={recentActivities} />
          )}

          {/* Proof of Growth Snapshot - Only if they have experience */}
          {journeyState.hasCompletedJobs && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/my-journey">
                <Card className="border bg-gradient-to-br from-purple-500/5 to-indigo-500/5 hover:from-purple-500/10 hover:to-indigo-500/10 transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Your Journey</p>
                          <p className="text-xs text-muted-foreground">
                            See your growth, strengths, and progress
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )}

          {/* Explore When Ready - Soft secondary links */}
          <ExploreWhenReady />
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground">
            There's no rush. Explore at your own pace.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
