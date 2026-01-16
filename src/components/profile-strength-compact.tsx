"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, AlertCircle, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

export function ProfileStrengthCompact() {
  const { data: session } = useSession();

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: session?.user.role === "YOUTH",
  });

  if (!session || session.user.role !== "YOUTH") {
    return null;
  }

  // No profile yet
  if (!profile) {
    return (
      <Card className="border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">Setup Profile</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Create your profile to apply for jobs
          </p>
          <Button size="sm" className="w-full h-8 text-xs" asChild>
            <Link href="/profile">
              Create Profile
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate completion
  const checks = [
    { done: !!profile.displayName },
    { done: !!profile.bio && profile.bio.length > 20 },
    { done: !!profile.phoneNumber },
    { done: !!profile.availability },
    { done: profile.interests && profile.interests.length > 0 },
    { done: profile.completedJobsCount > 0 },
  ];

  const completedCount = checks.filter((c) => c.done).length;
  const completionPercentage = Math.round((completedCount / checks.length) * 100);

  // Complete profile
  if (completionPercentage === 100) {
    return (
      <Card className="border border-green-300 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-500/20">
              <Sparkles className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Profile Complete</p>
              <p className="text-xs text-muted-foreground">Ready to impress!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium">Profile</span>
          </div>
          <span className="text-xs font-bold text-purple-600">{completionPercentage}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{completedCount}/{checks.length} complete</span>
          <span>{checks.length - completedCount} remaining</span>
        </div>

        <Button size="sm" variant="outline" className="w-full h-8 text-xs" asChild>
          <Link href="/profile">
            {completionPercentage < 50 ? "Complete" : "Finish"} Profile
            <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
