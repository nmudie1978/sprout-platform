"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  Loader2,
  Lock,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  Target,
  RefreshCw,
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

// Feedback types
interface FeedbackItem {
  type: "success" | "warning" | "improvement" | "tip";
  title: string;
  message: string;
  actionTip?: string;
}

function analyzeGrowthStats(growth: any): FeedbackItem[] {
  const feedback: FeedbackItem[] = [];

  if (!growth || growth.totalJobsCompleted === 0) {
    return feedback;
  }

  const { totalJobsCompleted, totalWouldRehire, monthlyProgress, skillsDemonstrated } = growth;

  // Analyze Would-Rehire Rate
  const rehireRate = totalJobsCompleted > 0 ? (totalWouldRehire / totalJobsCompleted) * 100 : 0;

  if (totalJobsCompleted >= 3) {
    if (rehireRate >= 80) {
      feedback.push({
        type: "success",
        title: "Job posters love working with you",
        message: `${Math.round(rehireRate)}% of job posters said they'd hire you again. That's excellent!`,
      });
    } else if (rehireRate >= 60) {
      feedback.push({
        type: "tip",
        title: "Good rehire rate, room to grow",
        message: `${Math.round(rehireRate)}% would rehire you. A few small improvements could push this higher.`,
        actionTip: "Try asking job posters for specific feedback after each job to understand what went well.",
      });
    } else if (rehireRate >= 40) {
      feedback.push({
        type: "warning",
        title: "Your rehire rate needs attention",
        message: `Only ${Math.round(rehireRate)}% of job posters said they'd hire you again. This is below average.`,
        actionTip: "Before each job, clarify expectations. After, ask: 'What could I have done better?' Small changes add up.",
      });
    } else {
      feedback.push({
        type: "improvement",
        title: "Let's work on this together",
        message: `Your rehire rate is ${Math.round(rehireRate)}%. This is a signal that something's not clicking.`,
        actionTip: "Consider: Are you arriving on time? Communicating clearly? Completing tasks fully? Pick one area to focus on for your next 3 jobs.",
      });
    }
  }

  // Skill Development
  if (skillsDemonstrated && skillsDemonstrated.length === 0 && totalJobsCompleted >= 2) {
    feedback.push({
      type: "tip",
      title: "No verified skills yet",
      message: "Job posters haven't tagged specific skills from your work yet.",
      actionTip: "When completing jobs, try to go above and beyond in one specific area. This makes it easier for job posters to recognise your strengths.",
    });
  } else if (skillsDemonstrated && skillsDemonstrated.length >= 5) {
    feedback.push({
      type: "success",
      title: "Building a diverse skillset",
      message: `You've demonstrated ${skillsDemonstrated.length} different skills. This versatility is valuable!`,
    });
  }

  return feedback.slice(0, 4);
}

// Feedback Card Component
function FeedbackCard({ feedback }: { feedback: FeedbackItem[] }) {
  if (feedback.length === 0) return null;

  const getIcon = (type: FeedbackItem["type"]) => {
    switch (type) {
      case "success": return ThumbsUp;
      case "warning": return AlertTriangle;
      case "improvement": return Target;
      case "tip": return Lightbulb;
    }
  };

  const getColors = (type: FeedbackItem["type"]) => {
    switch (type) {
      case "success": return {
        border: "border-emerald-500/30",
        bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
        icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600",
        title: "text-emerald-700 dark:text-emerald-400",
      };
      case "warning": return {
        border: "border-amber-500/30",
        bg: "bg-amber-50/50 dark:bg-amber-950/20",
        icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-600",
        title: "text-amber-700 dark:text-amber-400",
      };
      case "improvement": return {
        border: "border-red-500/30",
        bg: "bg-red-50/50 dark:bg-red-950/20",
        icon: "bg-red-100 dark:bg-red-900/50 text-red-600",
        title: "text-red-700 dark:text-red-400",
      };
      case "tip": return {
        border: "border-blue-500/30",
        bg: "bg-blue-50/50 dark:bg-blue-950/20",
        icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600",
        title: "text-blue-700 dark:text-blue-400",
      };
    }
  };

  const positiveItems = feedback.filter(f => f.type === "success");
  const needsWorkItems = feedback.filter(f => f.type !== "success");

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Reality Check
        </CardTitle>
        <CardDescription>
          Honest feedback based on your actual performance. Use this to grow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {needsWorkItems.map((item, i) => {
          const Icon = getIcon(item.type);
          const colors = getColors(item.type);
          return (
            <div key={i} className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${colors.icon} h-fit`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm ${colors.title}`}>{item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                  {item.actionTip && (
                    <div className="mt-2 p-2 rounded bg-white/50 dark:bg-black/20 border border-current/10">
                      <p className="text-xs text-foreground/80">
                        <Lightbulb className="h-3 w-3 inline mr-1" />
                        <strong>Tip:</strong> {item.actionTip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {positiveItems.map((item, i) => {
          const Icon = getIcon(item.type);
          const colors = getColors(item.type);
          return (
            <div key={`pos-${i}`} className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${colors.icon} h-fit`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm ${colors.title}`}>{item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function ShortTermGrowthPage() {
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
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (session?.user?.role !== "YOUTH") {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">This page is only available for youth workers.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.hasData) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-16 text-center">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No growth data yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Complete your first small job to start tracking your progress and building trust signals.
          </p>
          <Button asChild className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
            <Link href="/jobs">Browse Small Jobs</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { growth, recentSignals } = data;
  const feedbackItems = analyzeGrowthStats(growth);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
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

      {/* Reality Check */}
      {feedbackItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FeedbackCard feedback={feedbackItems} />
        </motion.div>
      )}

      {/* Trust Signals */}
      {recentSignals && recentSignals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Trust Signals
              </CardTitle>
              <CardDescription>
                Private indicators that help Sprout match you to safer, better opportunities.
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
                    <div key={signal.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
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
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                Skills You've Demonstrated
              </CardTitle>
              <CardDescription>
                Skills verified through completed jobs and job poster feedback
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
    </div>
  );
}
