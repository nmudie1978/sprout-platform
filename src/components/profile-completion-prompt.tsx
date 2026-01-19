"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, User, FileText, Clock, Heart, Phone, Briefcase, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function ProfileCompletionPrompt() {
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

  // Don't show if profile doesn't exist yet
  if (!profile) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <CardTitle className="text-base">Complete Your Profile</CardTitle>
              <CardDescription>
                Set up your profile to start applying for jobs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/profile">Create Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate completion percentage with icons
  const checks = [
    { done: !!profile.displayName, label: "Display name", icon: User },
    { done: !!profile.bio && profile.bio.length > 20, label: "Bio (20+ chars)", icon: FileText },
    { done: !!profile.phoneNumber, label: "Phone number", icon: Phone },
    { done: !!profile.availability, label: "Availability", icon: Clock },
    { done: profile.interests && profile.interests.length > 0, label: "Interests", icon: Heart },
    { done: profile.completedJobsCount > 0, label: "Complete a job", icon: Briefcase },
  ];

  const completedCount = checks.filter((c) => c.done).length;
  const completionPercentage = Math.round((completedCount / checks.length) * 100);

  // Show celebration state when 100% complete
  if (completionPercentage === 100) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">Profile Complete!</p>
                <p className="text-sm text-muted-foreground">You're all set to impress employers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 border-primary/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Profile Strength</CardTitle>
              <CardDescription>
                Stand out to employers!
              </CardDescription>
            </div>
            <div className="relative h-16 w-16">
              {/* Circular progress indicator */}
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted/30"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${completionPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{completionPercentage}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {checks.map((check, i) => {
              const Icon = check.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    check.done
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {check.done ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Icon className="h-4 w-4 flex-shrink-0 opacity-50" />
                  )}
                  <span className={`truncate ${check.done ? "line-through opacity-70" : ""}`}>
                    {check.label}
                  </span>
                </div>
              );
            })}
          </div>

          <Button asChild className="w-full">
            <Link href="/profile">
              {completionPercentage < 50 ? "Complete Profile" : "Finish Profile"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
