"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Lightbulb,
  TrendingUp,
  Target,
  AlertCircle,
  Sparkles,
  Bot,
  ArrowRight,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getCareerJourneyForGoal, type CareerJourneyData } from "@/lib/my-path/actions";

interface Insight {
  type: "strength" | "opportunity" | "gap" | "trend";
  title: string;
  description: string;
  actionable?: string;
  href?: string;
}

function generateInsights(journey: CareerJourneyData | null, growthData: any, goalName: string): Insight[] {
  const insights: Insight[] = [];

  // Skill-based insights
  if (journey?.skillsYouHave && journey.skillsYouHave.length > 0) {
    insights.push({
      type: "strength",
      title: `Your strongest skill is "${journey.skillsYouHave[0]}"`,
      description: `This skill has been demonstrated through your completed jobs and is valued for ${goalName}.`,
      actionable: "Keep building on this strength by taking on more challenging jobs that use it.",
    });
  }

  // Career match insights
  if (journey?.targetCareer && journey.skillMatchPercent !== undefined) {
    if (journey.skillMatchPercent < 30) {
      insights.push({
        type: "gap",
        title: `You're ${journey.skillMatchPercent}% matched to ${journey.targetCareer.title}`,
        description: `Focus on building: ${journey.skillsToGain?.slice(0, 2).join(", ") || "key skills"}.`,
        actionable: "Look for jobs that help you develop these specific skills.",
        href: "/jobs",
      });
    } else if (journey.skillMatchPercent >= 50) {
      insights.push({
        type: "opportunity",
        title: `You're ${journey.skillMatchPercent}% of the way to ${journey.targetCareer.title}!`,
        description: "You're making great progress toward your career goal.",
        actionable: "Keep going! Your next steps are becoming clearer.",
        href: `/growth/career-path?goal=${encodeURIComponent(goalName)}`,
      });
    }
  }

  // Growth-based insights
  if (growthData?.growth) {
    const { totalJobsCompleted, totalWouldRehire } = growthData.growth;

    if (totalJobsCompleted >= 5) {
      const rehireRate = (totalWouldRehire / totalJobsCompleted) * 100;
      if (rehireRate >= 80) {
        insights.push({
          type: "strength",
          title: "Employers trust you",
          description: `${Math.round(rehireRate)}% of employers would hire you again. This is excellent!`,
          actionable: "Your reliability is a major asset. Consider taking on more responsible jobs.",
        });
      }
    }

    if (totalJobsCompleted < 3) {
      insights.push({
        type: "opportunity",
        title: "Complete more jobs to unlock insights",
        description: "We need a few more data points to give you personalised insights.",
        actionable: "Try completing 2-3 more jobs to see deeper analysis.",
        href: "/jobs",
      });
    }
  }

  // Skills to gain insight
  if (journey?.skillsToGain && journey.skillsToGain.length > 0 && journey.targetCareer) {
    insights.push({
      type: "gap",
      title: `Missing skill: "${journey.skillsToGain[0]}"`,
      description: `This skill is important for ${journey.targetCareer.title}.`,
      actionable: "Look for jobs or learning resources that can help you build this skill.",
      href: "/jobs",
    });
  }

  // General trend insight (placeholder - would be enhanced with real trend data)
  if (journey?.targetCareer?.growthOutlook === "high") {
    insights.push({
      type: "trend",
      title: `${journey.targetCareer.title} demand is growing`,
      description: "This career has a high growth outlook, meaning more opportunities in the future.",
      actionable: "You've chosen a career with strong future prospects!",
    });
  }

  return insights.slice(0, 5); // Limit to 5 insights
}

export default function InsightsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const goalParam = searchParams.get("goal");

  // Fetch user's career goals to use as fallback when no ?goal= param
  const { data: careerGoalsData, isLoading: goalsLoading } = useQuery<{ goals: string[]; activeGoal: string | null }>({
    queryKey: ["career-goals"],
    queryFn: async () => {
      const response = await fetch("/api/profile/career-goals");
      if (!response.ok) return { goals: [], activeGoal: null };
      return response.json();
    },
    enabled: session?.user?.role === "YOUTH" && !goalParam,
  });

  // Use URL param if provided, otherwise use active goal or first goal
  const effectiveGoal = goalParam || careerGoalsData?.activeGoal || careerGoalsData?.goals?.[0] || null;

  const { data: journey, isLoading: journeyLoading } = useQuery<CareerJourneyData | null>({
    queryKey: ["career-journey", effectiveGoal],
    queryFn: () => effectiveGoal ? getCareerJourneyForGoal(effectiveGoal) : Promise.resolve(null),
    enabled: session?.user?.role === "YOUTH" && !!effectiveGoal,
  });

  const { data: growthData, isLoading: growthLoading } = useQuery({
    queryKey: ["growth-data"],
    queryFn: async () => {
      const response = await fetch("/api/growth");
      if (!response.ok) throw new Error("Failed to fetch growth data");
      return response.json();
    },
    enabled: session?.user?.role === "YOUTH",
  });

  const isLoading = sessionStatus === "loading" || goalsLoading || journeyLoading || growthLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
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

  // No career goals set at all
  if (!effectiveGoal) {
    return (
      <Card className="border-2 border-dashed border-amber-300 dark:border-amber-700">
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <Lightbulb className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No career goals set</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Set your career goals first to see personalised insights.
          </p>
          <Link href="/growth">
            <Button size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Set Career Goals
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const insights = generateInsights(journey ?? null, growthData, effectiveGoal);

  const getInsightConfig = (type: Insight["type"]) => {
    switch (type) {
      case "strength":
        return {
          icon: CheckCircle2,
          color: "text-emerald-600",
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          borderColor: "border-emerald-200 dark:border-emerald-800",
        };
      case "opportunity":
        return {
          icon: Zap,
          color: "text-blue-600",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      case "gap":
        return {
          icon: Target,
          color: "text-amber-600",
          bg: "bg-amber-100 dark:bg-amber-900/30",
          borderColor: "border-amber-200 dark:border-amber-800",
        };
      case "trend":
        return {
          icon: TrendingUp,
          color: "text-purple-600",
          bg: "bg-purple-100 dark:bg-purple-900/30",
          borderColor: "border-purple-200 dark:border-purple-800",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/growth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to My Growth
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold">Insights for {effectiveGoal}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Personalised analysis based on your progress toward becoming a {journey?.targetCareer?.title || effectiveGoal}.
        </p>
      </motion.div>

      {/* Insights List */}
      {insights.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No insights yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Complete some jobs to receive personalised insights for {effectiveGoal}.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/jobs">Browse Small Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, i) => {
            const config = getInsightConfig(insight.type);
            const Icon = config.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`border-2 ${config.borderColor}`}>
                  <CardContent className="py-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        {insight.actionable && (
                          <p className="text-sm mt-2 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span className="text-foreground/80">{insight.actionable}</span>
                          </p>
                        )}
                      </div>
                      {insight.href && (
                        <Link href={insight.href}>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AI Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-2 border-purple-200 dark:border-purple-800/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Want deeper insights?</h4>
                  <p className="text-sm text-muted-foreground">
                    Ask Sprout AI for personalised advice about {effectiveGoal}
                  </p>
                </div>
              </div>
              <Link href={`/career-advisor?goal=${encodeURIComponent(effectiveGoal)}`}>
                <Button variant="outline" className="border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30">
                  <Bot className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
