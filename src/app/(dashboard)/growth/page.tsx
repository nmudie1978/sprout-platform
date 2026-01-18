"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
} from "lucide-react";
import Link from "next/link";
import { getCareerJourney, getMultipleCareerJourneys, type CareerJourneyData, type MultipleCareerJourneys, type SingleCareerJourney } from "@/lib/my-path/actions";
import { formatCurrency } from "@/lib/utils";

// Empty State Banner - when no career goals set
function EmptyStateBanner() {
  return (
    <Card className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Target className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Set your career goals</h3>
              <p className="text-sm text-muted-foreground">
                Tell us your dream careers and we&apos;ll tailor everything to help you get there.
              </p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="outline" className="border-emerald-300 hover:bg-emerald-50">
              <Settings className="h-4 w-4 mr-2" />
              Set goals
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

// Career Tab Content Component
function CareerTabContent({
  journey,
  growthData,
}: {
  journey: SingleCareerJourney;
  growthData: any;
}) {
  const skillsToGain = journey.skillsToGain || [];

  // Generate personalised next steps based on career
  const nextSteps = [];

  // 1. Skill to build next
  if (skillsToGain.length > 0) {
    const nextSkill = skillsToGain[0];
    nextSteps.push({
      icon: Target,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      title: `Build "${nextSkill}" skill`,
      description: `This skill is essential for becoming a ${journey.targetCareer.title}. Look for jobs that help you practice it.`,
      reason: `Required for ${journey.targetCareer.title}`,
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
    description: `Even small jobs help build skills for your ${journey.targetCareer.title} goal. Every job is a step forward.`,
    reason: "Builds toward your career goal",
    href: "/jobs",
    actionLabel: "Browse jobs",
  });

  // 3. Learning suggestion
  nextSteps.push({
    icon: BookOpen,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "Explore learning resources",
    description: `Discover courses and certifications that will help you on your path to ${journey.targetCareer.title}.`,
    reason: `Aligned to ${journey.targetCareer.title} requirements`,
    href: "/growth/career-path",
    actionLabel: "View path",
  });

  // 4. Career exploration
  nextSteps.push({
    icon: GraduationCap,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    title: "Review your career path",
    description: `See what steps lie ahead on your journey to ${journey.targetCareer.title}.`,
    href: "/growth/career-path",
    actionLabel: "View path",
  });

  return (
    <div className="space-y-6">
      {/* Career Header */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{journey.targetCareer.emoji}</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{journey.targetCareer.title}</h3>
              <p className="text-sm text-muted-foreground">{journey.educationPath}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">{journey.skillMatchPercent}%</p>
              <p className="text-xs text-muted-foreground">Skill Match</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Progress */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h4 className="font-medium text-sm">Skills You Have</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {journey.skillsYouHave.length > 0 ? (
                journey.skillsYouHave.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-900/30">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Complete jobs to build skills</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-amber-600" />
              <h4 className="font-medium text-sm">Skills to Build</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {journey.skillsToGain.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {journey.skillsToGain.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{journey.skillsToGain.length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personalised Next Steps */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Next steps for {journey.targetCareer.title}</h2>
        </div>
        <div className="grid gap-3">
          {nextSteps.map((step, i) => (
            <NextActionCard key={i} {...step} />
          ))}
        </div>
      </div>

      {/* AI Assistant Prompt */}
      <Card className="border-2 border-purple-200 dark:border-purple-800/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Ask Sprout AI about {journey.targetCareer.title}</h4>
                <p className="text-xs text-muted-foreground">Get personalised advice</p>
              </div>
            </div>
            <Link href={`/career-advisor?prompt=Tell%20me%20about%20becoming%20a%20${encodeURIComponent(journey.targetCareer.title)}`}>
              <Button variant="outline" size="sm" className="border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30">
                <Bot className="h-3 w-3 mr-1" />
                Chat
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GrowthPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState<string>("");

  const { data: multiJourneys, isLoading: journeyLoading } = useQuery<MultipleCareerJourneys | null>({
    queryKey: ["multiple-career-journeys"],
    queryFn: () => getMultipleCareerJourneys(),
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

  // Set default active tab when journeys load
  const journeys = multiJourneys?.journeys || [];
  if (journeys.length > 0 && !activeTab) {
    setActiveTab(journeys[0].targetCareer.id);
  }

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

  const hasCareerGoals = journeys.length > 0;

  // No career goals set - show empty state
  if (!hasCareerGoals) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyStateBanner />
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
                <p className="text-2xl font-bold text-blue-600">-</p>
                <p className="text-xs text-muted-foreground">Career Match</p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(multiJourneys?.totalEarnings || 0)}</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Explore careers prompt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Card className="border-2">
            <CardContent className="py-6 text-center">
              <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-2">Explore career options</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover careers that match your interests and set goals to work towards.
              </p>
              <Button asChild>
                <Link href="/careers">
                  Explore Careers
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
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

  // Has career goals - show tabs
  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <h1 className="font-bold text-lg">My Career Goals</h1>
            <Badge variant="secondary" className="ml-2">
              {journeys.length} goal{journeys.length > 1 ? "s" : ""}
            </Badge>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add goal
            </Button>
          </Link>
        </div>

        {/* Progress Summary */}
        {growthData?.hasData && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="border">
              <CardContent className="py-3 text-center">
                <p className="text-xl font-bold text-emerald-600">{growthData.growth.totalJobsCompleted}</p>
                <p className="text-[10px] text-muted-foreground">Jobs Done</p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="py-3 text-center">
                <p className="text-xl font-bold text-purple-600">{growthData.growth.skillsDemonstrated?.length || 0}</p>
                <p className="text-[10px] text-muted-foreground">Skills Built</p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="py-3 text-center">
                <p className="text-xl font-bold text-amber-600">{formatCurrency(multiJourneys?.totalEarnings || 0)}</p>
                <p className="text-[10px] text-muted-foreground">Earned</p>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Career Goal Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 overflow-x-auto">
            {journeys.map((journey) => (
              <TabsTrigger
                key={journey.targetCareer.id}
                value={journey.targetCareer.id}
                className="flex items-center gap-2 data-[state=active]:bg-background px-4 py-2"
              >
                <span className="text-lg">{journey.targetCareer.emoji}</span>
                <span className="font-medium">{journey.targetCareer.title}</span>
                <Badge variant="outline" className="text-[10px] ml-1">
                  {journey.skillMatchPercent}%
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {journeys.map((journey) => (
            <TabsContent key={journey.targetCareer.id} value={journey.targetCareer.id} className="mt-4">
              <CareerTabContent journey={journey} growthData={growthData} />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
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
