"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Target,
  Briefcase,
  BookOpen,
  ArrowRight,
  Loader2,
  Lock,
  Settings,
  Zap,
  TrendingUp,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { getCareerJourney, type CareerJourneyData } from "@/lib/my-path/actions";
import { formatCurrency } from "@/lib/utils";

// North Star Banner Component
function NorthStarBanner({ journey }: { journey: CareerJourneyData | null }) {
  if (!journey?.targetCareer) {
    return (
      <Card className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Set your career goal</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us your dream career and we'll tailor everything to help you get there.
                </p>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="border-emerald-300 hover:bg-emerald-50">
                <Settings className="h-4 w-4 mr-2" />
                Set goal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{journey.targetCareer.emoji}</div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  <Target className="h-3 w-3 mr-1" />
                  North Star
                </Badge>
              </div>
              <h3 className="font-bold text-xl mt-1">{journey.targetCareer.title}</h3>
              <p className="text-sm text-muted-foreground">
                Everything below is tailored to help you reach this goal.
              </p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Next Action Card Component
function NextActionCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  reason,
  href,
  actionLabel,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  reason?: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <Link href={href}>
      <Card className="border-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group cursor-pointer">
        <CardContent className="py-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${iconBg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base mb-1">{title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
              {reason && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {reason}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-emerald-600 transition-colors">
              <span className="hidden sm:inline">{actionLabel}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function GrowthPage() {
  const { data: session, status: sessionStatus } = useSession();

  const { data: journey, isLoading: journeyLoading } = useQuery<CareerJourneyData | null>({
    queryKey: ["career-journey"],
    queryFn: () => getCareerJourney(),
    enabled: session?.user?.role === "YOUTH",
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

  const isLoading = sessionStatus === "loading" || journeyLoading || growthLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
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

  const hasCareerGoal = journey?.targetCareer;
  const skillsToGain = journey?.skillsToGain || [];
  const skillMatchPercent = journey?.skillMatchPercent || 0;

  // Generate personalised next steps based on North Star
  const nextSteps = [];

  // 1. Skill to build next
  if (skillsToGain.length > 0) {
    const nextSkill = skillsToGain[0];
    nextSteps.push({
      icon: Target,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      title: `Build "${nextSkill}" skill`,
      description: hasCareerGoal
        ? `This skill is essential for becoming a ${journey?.targetCareer?.title}. Look for jobs that help you practice it.`
        : "Building diverse skills makes you more attractive to employers.",
      reason: hasCareerGoal ? `Required for ${journey?.targetCareer?.title}` : undefined,
      href: "/jobs",
      actionLabel: "Find jobs",
    });
  }

  // 2. Relevant job suggestion
  nextSteps.push({
    icon: Briefcase,
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    title: "Complete a skill-building job",
    description: hasCareerGoal
      ? `Even small jobs help build skills for your ${journey?.targetCareer?.title} goal. Every job is a step forward.`
      : "Every job you complete adds to your experience and builds trust with employers.",
    reason: hasCareerGoal ? "Builds toward your career goal" : undefined,
    href: "/jobs",
    actionLabel: "Browse jobs",
  });

  // 3. Learning suggestion
  if (hasCareerGoal) {
    nextSteps.push({
      icon: BookOpen,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      title: "Explore learning resources",
      description: `Discover courses and certifications that will help you on your path to ${journey?.targetCareer?.title}.`,
      reason: `Aligned to ${journey?.targetCareer?.title} requirements`,
      href: "/growth/career-path",
      actionLabel: "View path",
    });
  }

  // 4. Career exploration
  nextSteps.push({
    icon: GraduationCap,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    title: hasCareerGoal ? "Review your career path" : "Explore career options",
    description: hasCareerGoal
      ? `See what steps lie ahead on your journey to ${journey?.targetCareer?.title}.`
      : "Discover careers that match your interests and set a goal to work towards.",
    href: hasCareerGoal ? "/growth/career-path" : "/careers",
    actionLabel: hasCareerGoal ? "View path" : "Explore",
  });

  return (
    <div className="space-y-6">
      {/* North Star Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <NorthStarBanner journey={journey ?? null} />
      </motion.div>

      {/* Progress Summary */}
      {growthData?.hasData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <Card className="border">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{growthData.growth.totalJobsCompleted}</p>
              <p className="text-xs text-muted-foreground">Jobs Done</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{growthData.growth.skillsDemonstrated?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Skills Built</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{skillMatchPercent}%</p>
              <p className="text-xs text-muted-foreground">Career Match</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(journey?.totalEarnings || 0)}</p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Personalised Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-lg">Your next steps</h2>
          </div>
          {hasCareerGoal && (
            <Badge variant="outline" className="text-xs">
              Tailored to {journey?.targetCareer?.title}
            </Badge>
          )}
        </div>
        <div className="grid gap-4">
          {nextSteps.map((step, i) => (
            <NextActionCard key={i} {...step} />
          ))}
        </div>
      </motion.div>

      {/* AI Assistant Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Card className="border-2 border-purple-200 dark:border-purple-800/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Ask Sprout AI</h4>
                  <p className="text-sm text-muted-foreground">
                    Get personalised advice based on your goals and progress
                  </p>
                </div>
              </div>
              <Link href="/career-advisor">
                <Button variant="outline" className="border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30">
                  <Bot className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/career-advisor?prompt=What%20should%20I%20do%20next%3F">
                <Button variant="secondary" size="sm" className="text-xs">
                  What should I do next?
                </Button>
              </Link>
              <Link href="/career-advisor?prompt=What%20skills%20should%20I%20build%3F">
                <Button variant="secondary" size="sm" className="text-xs">
                  What skills should I build?
                </Button>
              </Link>
              <Link href={`/career-advisor?prompt=Reality%20check%3A%20what%20is%20${encodeURIComponent(journey?.targetCareer?.title || 'my career goal')}%20like%3F`}>
                <Button variant="secondary" size="sm" className="text-xs">
                  Reality check
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        <Link href="/growth/short-term">
          <Card className="border hover:border-emerald-300 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-sm">Short-term Growth</p>
                  <p className="text-xs text-muted-foreground">Skills & reliability</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/growth/vault">
          <Card className="border hover:border-emerald-300 transition-colors cursor-pointer h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Your Vault</p>
                  <p className="text-xs text-muted-foreground">Saved items</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
}
