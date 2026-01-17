"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { User, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function ProfileStrengthCompact() {
  const { data: session, status: sessionStatus } = useSession();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: sessionStatus === "authenticated" && session?.user.role === "YOUTH",
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Don't show for non-youth users
  if (sessionStatus === "authenticated" && session?.user.role !== "YOUTH") {
    return null;
  }

  // Show loading state while session or profile is loading
  if (sessionStatus === "loading" || isLoading) {
    return (
      <Card className="border relative z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Profile</span>
            </div>
            <span className="text-sm font-bold text-muted-foreground">--%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-muted-foreground/20 w-1/2 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No profile yet - show 0%
  if (!profile) {
    return (
      <Link href="/profile" className="block">
        <Card className="border hover:shadow-md hover:border-purple-300 transition-all cursor-pointer relative z-10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Profile</span>
              </div>
              <span className="text-sm font-bold text-purple-600">0%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 w-0" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Calculate completion percentage
  const requiredChecks = [
    !!profile.avatarId,
    !!profile.displayName,
    !!profile.phoneNumber,
  ];
  const bonusChecks = [
    !!profile.bio,
    !!profile.availability,
    profile.interests && profile.interests.length > 0,
  ];

  const requiredComplete = requiredChecks.filter(Boolean).length;
  const bonusComplete = bonusChecks.filter(Boolean).length;

  const requiredPercentage = (requiredComplete / requiredChecks.length) * 60;
  const bonusPercentage = (bonusComplete / bonusChecks.length) * 40;
  const completionPercentage = Math.round(requiredPercentage + bonusPercentage);

  // 100% complete - show success state
  if (completionPercentage === 100) {
    return (
      <Link href="/profile" className="block">
        <Card className="border border-green-200 bg-green-50/50 dark:bg-green-950/20 hover:shadow-md transition-all cursor-pointer relative z-10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Profile</span>
              </div>
              <span className="text-sm font-bold text-green-600">100%</span>
            </div>
            <div className="h-1.5 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href="/profile" className="block">
      <Card className="border hover:shadow-md hover:border-purple-300 transition-all cursor-pointer relative z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Profile</span>
            </div>
            <span className="text-sm font-bold text-purple-600">{completionPercentage}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
