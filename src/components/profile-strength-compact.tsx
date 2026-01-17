"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, AlertCircle, ChevronRight, XCircle } from "lucide-react";
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
    staleTime: 30 * 1000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  if (!session || session.user.role !== "YOUTH") {
    return null;
  }

  // No profile yet
  if (!profile) {
    return (
      <Card className="border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 relative z-10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">Setup Profile</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Create your profile to apply for jobs
          </p>
          <Link href="/profile" className="block">
            <Button size="sm" className="w-full h-8 text-xs pointer-events-auto">
              Create Profile
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Separate required vs bonus checks
  const requiredChecks = [
    { label: "Avatar", done: !!profile.avatarId },
    { label: "Display Name", done: !!profile.displayName },
    { label: "Phone Number", done: !!profile.phoneNumber },
  ];

  const bonusChecks = [
    { label: "Bio", done: !!profile.bio },
    { label: "Availability", done: !!profile.availability },
    { label: "Interests", done: profile.interests && profile.interests.length > 0 },
  ];

  const requiredComplete = requiredChecks.filter((c) => c.done).length;
  const bonusComplete = bonusChecks.filter((c) => c.done).length;
  const allRequiredComplete = requiredComplete === requiredChecks.length;

  // Calculate percentage: required fields are 60%, bonus fields are 40%
  const requiredPercentage = (requiredComplete / requiredChecks.length) * 60;
  const bonusPercentage = (bonusComplete / bonusChecks.length) * 40;
  const completionPercentage = Math.round(requiredPercentage + bonusPercentage);

  // All complete (100%) - don't show anything, profile is done
  if (completionPercentage === 100) {
    return null;
  }

  // Required fields missing - show red warning
  if (!allRequiredComplete) {
    const missingRequired = requiredChecks.filter((c) => !c.done);
    return (
      <Card className="border border-red-300 bg-red-50/50 dark:bg-red-950/20 relative z-10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">Required Fields Missing</span>
          </div>
          <div className="text-xs text-red-600/80 dark:text-red-400/80 mb-3 space-y-0.5">
            {missingRequired.map((item) => (
              <div key={item.label}>• {item.label}</div>
            ))}
          </div>
          <Link href="/profile" className="block">
            <Button size="sm" variant="destructive" className="w-full h-8 text-xs pointer-events-auto">
              Complete Required Fields
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // All required complete, some bonus missing
  return (
    <Card className="border hover:shadow-md transition-shadow relative z-10">
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

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span>Required complete</span>
          <span className="mx-1">•</span>
          <span>{bonusChecks.length - bonusComplete} optional left</span>
        </div>

        <Link href="/profile" className="block">
          <Button size="sm" variant="outline" className="w-full h-8 text-xs pointer-events-auto">
            Boost Profile
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
