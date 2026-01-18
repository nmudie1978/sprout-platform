"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Award,
  Briefcase,
  Star,
  Shield,
  Clock,
  MessageSquare,
  Users,
  Sparkles,
  ChevronRight,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";

// Trust signal type to icon/color mapping
const trustSignalConfig: Record<string, { icon: typeof Star; color: string; bg: string }> = {
  ON_TIME: { icon: Clock, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  GOOD_COMMS: { icon: MessageSquare, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  REPEAT_HIRE: { icon: Users, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  HELPED_OTHER: { icon: Sparkles, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  COMMUNITY_REPORT_RESOLVED: { icon: Shield, color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/30" },
  POSITIVE_TREND: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  CONSISTENCY_STREAK: { icon: Award, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
};

// Skill category colors
const skillCategoryColors: Record<string, string> = {
  CARE: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  HOME: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  OUTDOOR: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  TECH: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  SERVICE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  CREATIVE: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function GrowthPage() {
  const { data: session, status: sessionStatus } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["growth-data"],
    queryFn: async () => {
      const response = await fetch("/api/growth");
      if (!response.ok) throw new Error("Failed to fetch growth data");
      return response.json();
    },
    enabled: session?.user?.role === "YOUTH",
  });

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">This page is only available for youth workers.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.hasData) {
    return (
      <div className="container mx-auto px-4 py-8 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />

        <PageHeader
          title="Your"
          gradientText="Growth"
          description="Track your progress and build trust over time"
          icon={TrendingUp}
        />

        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No growth data yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Complete your first job to start tracking your progress and earning trust signals.
            </p>
            <Button asChild className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { growth, recentSignals } = data;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />

      <PageHeader
        title="Your"
        gradientText="Growth"
        description="Private view of your progress and achievements"
        icon={TrendingUp}
      />

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="border-2 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{growth.totalJobsCompleted}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Briefcase className="h-3 w-3" />
              Jobs Completed
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{growth.totalWouldRehire}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Star className="h-3 w-3" />
              Would Rehire
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{growth.skillsDemonstrated.length}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Award className="h-3 w-3" />
              Skills Shown
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {growth.trustSignals.reduce((sum: number, s: any) => sum + s.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Trust Signals
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Community Contributions Section */}
      {recentSignals && recentSignals.some((s: any) => s.type === "HELPED_OTHER" || s.type === "COMMUNITY_REPORT_RESOLVED") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="border-2 border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-600" />
                  Community Contributions
                </CardTitle>
                <CardDescription>
                  You're making a positive impact! These signal your contributions to the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {recentSignals
                    .filter((s: any) => s.type === "HELPED_OTHER" || s.type === "COMMUNITY_REPORT_RESOLVED")
                    .map((signal: any) => {
                      const config = trustSignalConfig[signal.type] || {
                        icon: Star,
                        color: "text-gray-600",
                        bg: "bg-gray-100",
                      };
                      const Icon = config.icon;

                      return (
                        <div
                          key={signal.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-pink-500/10"
                        >
                          <div className={`p-2 rounded-lg ${config.bg}`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{signal.label}</div>
                            <div className="text-xs text-muted-foreground">{signal.description}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(signal.earnedAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <p className="text-sm text-pink-700 dark:text-pink-300">
                    <Sparkles className="h-4 w-4 inline mr-1" />
                    Community contributions show employers you're a team player who helps others succeed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      {/* Trust Signals Section */}
      {recentSignals && recentSignals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Trust Signals
              </CardTitle>
              <CardDescription>
                Private indicators that help Sprout match you to safer, better opportunities.
                These are never shown to employers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {recentSignals.slice(0, 6).map((signal: any) => {
                  const config = trustSignalConfig[signal.type] || {
                    icon: Star,
                    color: "text-gray-600",
                    bg: "bg-gray-100",
                  };
                  const Icon = config.icon;

                  return (
                    <div
                      key={signal.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{signal.label}</div>
                        <div className="text-xs text-muted-foreground">{signal.description}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(signal.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Skills Demonstrated */}
      {growth.skillsDemonstrated && growth.skillsDemonstrated.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                Skills You've Demonstrated
                </CardTitle>
                <CardDescription>
                  Skills verified through completed jobs and employer feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {growth.skillsDemonstrated.map((skill: any) => (
                    <Badge
                      key={skill.slug}
                      variant="secondary"
                      className={skillCategoryColors[skill.category] || skillCategoryColors.OTHER}
                    >
                      {skill.name}
                      {skill.count > 1 && (
                        <span className="ml-1 opacity-70">x{skill.count}</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      {/* Monthly Progress */}
      {growth.monthlyProgress && growth.monthlyProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Responsibility Over Time
              </CardTitle>
              <CardDescription>
                Your growth in taking on more responsibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {growth.monthlyProgress.slice(-6).reverse().map((month: any) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {new Date(month.month + "-01").toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                      <span className="text-muted-foreground">
                        {month.jobsCompleted} job{month.jobsCompleted !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        Basic: {month.responsibilityDistribution.BASIC}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">
                        Intermediate: {month.responsibilityDistribution.INTERMEDIATE}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20">
                        Advanced: {month.responsibilityDistribution.ADVANCED}
                      </Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Privacy Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10 text-center"
      >
        <Lock className="h-4 w-4 inline mr-2 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          This data is private to you and helps Sprout match you to better opportunities.
        </span>
      </motion.div>
    </div>
  );
}
