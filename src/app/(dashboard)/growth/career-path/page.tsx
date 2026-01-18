"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  Briefcase,
  TrendingUp,
  Sparkles,
  BookOpen,
  Settings,
  Lock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getCareerJourney, type CareerJourneyData } from "@/lib/my-path/actions";
import { formatCurrency } from "@/lib/utils";

export default function CareerPathPage() {
  const { data: session, status: sessionStatus } = useSession();

  const { data: journey, isLoading } = useQuery<CareerJourneyData | null>({
    queryKey: ["career-journey"],
    queryFn: () => getCareerJourney(),
    enabled: session?.user?.role === "YOUTH",
  });

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
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

  // No target career set
  if (!journey?.targetCareer) {
    return (
      <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700">
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Set your career goal</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Tell us what career you're working towards. We'll show you the journey to get there,
            including the education path, skills you need, and how your current jobs are building toward your goal.
          </p>
          <Link href="/profile">
            <Button size="lg">
              <Settings className="h-4 w-4 mr-2" />
              Set career goal in profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { targetCareer, educationPath, skillsNeeded, skillsYouHave, skillsToGain, skillMatchPercent, relatedCareers } = journey;

  return (
    <div className="space-y-6">
      {/* Target Career Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-purple-200 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl">{targetCareer.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{targetCareer.title}</h2>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    Your goal
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{targetCareer.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{targetCareer.avgSalary}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 capitalize">{targetCareer.growthOutlook} growth</span>
                  </div>
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
      </motion.div>

      {/* Education Path - The Journey */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              The Journey
            </CardTitle>
            <CardDescription>
              The typical path to becoming a {targetCareer.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="font-medium text-blue-900 dark:text-blue-100">{educationPath}</p>
            </div>

            {/* Now / Next / Later Steps */}
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Your progression</h4>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-500" />

                {/* Now */}
                <div className="relative flex gap-4 pb-6">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center z-10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 mb-2">Now</Badge>
                    <p className="text-sm">Build foundational skills through small jobs and gain real-world experience.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {journey.completedJobsCount} jobs completed • {formatCurrency(journey.totalEarnings)} earned
                    </p>
                  </div>
                </div>

                {/* Next */}
                <div className="relative flex gap-4 pb-6">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center z-10">
                    <Circle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mb-2">Next</Badge>
                    <p className="text-sm">Focus on education requirements and build career-specific skills.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {skillsToGain.length > 0 ? `Skills to build: ${skillsToGain.slice(0, 3).join(", ")}` : "Continue building your experience"}
                    </p>
                  </div>
                </div>

                {/* Later */}
                <div className="relative flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center z-10">
                    <Circle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 mb-2">Later</Badge>
                    <p className="text-sm">Complete required education/training and begin your career as a {targetCareer.title}.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skills Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Skills Match */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Skills Progress
              </CardTitle>
              <span className="text-2xl font-bold text-purple-600">{skillMatchPercent}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={skillMatchPercent} className="h-3 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              You have {skillsYouHave.length} of {skillsNeeded.length} skills needed for this career
            </p>

            {skillsYouHave.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Skills you have
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillsYouHave.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {skillsToGain.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  Skills to build
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillsToGain.map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-muted-foreground">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Tasks Preview */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-600" />
              What you'll do
            </CardTitle>
            <CardDescription>
              Typical daily tasks as a {targetCareer.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {targetCareer.dailyTasks.slice(0, 5).map((task, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Resources (Placeholder for now) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Recommended Learning
            </CardTitle>
            <CardDescription>
              Courses and certifications to help you on your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {/* These would be dynamically generated based on career */}
              <Link href="https://www.nav.no/utdanning" target="_blank" rel="noopener noreferrer">
                <div className="p-4 rounded-lg border hover:border-blue-300 transition-colors flex items-center justify-between group">
                  <div>
                    <h4 className="font-medium text-sm">NAV Education Resources</h4>
                    <p className="text-xs text-muted-foreground">Official Norwegian education pathways</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-600" />
                </div>
              </Link>
              <Link href="https://utdanning.no" target="_blank" rel="noopener noreferrer">
                <div className="p-4 rounded-lg border hover:border-blue-300 transition-colors flex items-center justify-between group">
                  <div>
                    <h4 className="font-medium text-sm">Utdanning.no</h4>
                    <p className="text-xs text-muted-foreground">Explore education options in Norway</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-600" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Related Careers */}
      {relatedCareers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-600" />
                  Related Careers
                </CardTitle>
                <Link href="/careers">
                  <Button variant="ghost" size="sm">
                    Explore all <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedCareers.map((career) => (
                  <Link key={career.id} href={`/careers/${career.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 transition-colors">
                      <span className="text-2xl">{career.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{career.title}</h4>
                        <p className="text-xs text-muted-foreground">{career.avgSalary}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
