"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Clock,
  MessageSquare,
  Star,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  Wallet,
  Calendar,
  Bookmark,
  Target,
  Info,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { SingleCareerJourney } from "@/lib/my-path/actions";

// Types for progress data
interface FoundationalProgressData {
  jobsCompleted: number;
  reliabilityScore: number; // 0-100 based on completion rate, punctuality
  communicationScore: number; // 0-100 based on response rate, quality
  rehireRate: number; // percentage of employers who would rehire
  avgRating: number; // 0-5 average rating
}

interface CareerProgressData {
  learningStarted: boolean;
  coursesInProgress: number;
  coursesCompleted: number;
  certificationsEarned: number;
  projectsCompleted: number;
  // Future: actual learning platform integrations
}

interface RunwayData {
  totalEarnings: number;
  availabilityLevel: string | null; // "busy", "some", "plenty"
  savedLearningPaths: number;
  hasCareerGoal: boolean;
}

interface HonestProgressSectionProps {
  careerName: string;
  careerEmoji: string;
  foundational: FoundationalProgressData;
  careerProgress: CareerProgressData;
  runway: RunwayData;
}

// Helper to get stage label for foundational progress
function getFoundationalStage(data: FoundationalProgressData): {
  label: string;
  description: string;
  color: string;
} {
  if (data.jobsCompleted === 0) {
    return {
      label: "Getting Started",
      description: "Complete your first job to begin building your foundation",
      color: "text-muted-foreground",
    };
  }
  if (data.jobsCompleted < 3) {
    return {
      label: "Early Stage",
      description: "Building initial work experience",
      color: "text-blue-600",
    };
  }
  if (data.jobsCompleted < 10) {
    return {
      label: "Developing",
      description: "Establishing reliability and skills",
      color: "text-amber-600",
    };
  }
  if (data.reliabilityScore >= 80 && data.rehireRate >= 70) {
    return {
      label: "Strong Foundation",
      description: "Proven track record of reliability",
      color: "text-emerald-600",
    };
  }
  return {
    label: "Building",
    description: "Growing your work experience",
    color: "text-purple-600",
  };
}

// Foundational Progress Component
function FoundationalProgress({
  data,
  careerName,
}: {
  data: FoundationalProgressData;
  careerName: string;
}) {
  const stage = getFoundationalStage(data);
  const hasData = data.jobsCompleted > 0;

  const indicators = [
    {
      label: "Reliability",
      value: data.reliabilityScore,
      icon: Clock,
      description: "Showing up on time, completing jobs",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Communication",
      value: data.communicationScore,
      icon: MessageSquare,
      description: "Responsive, clear messages",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Trust",
      value: data.rehireRate,
      icon: Users,
      description: "Would-rehire rate from employers",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <Card className="border">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Foundational Work Skills</h4>
              <p className="text-[10px] text-muted-foreground">From real jobs</p>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[10px]", stage.color)}>
            {stage.label}
          </Badge>
        </div>

        {/* Progress Indicators */}
        {hasData ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {indicators.map((indicator) => {
                const Icon = indicator.icon;
                return (
                  <div key={indicator.label} className="text-center">
                    <div className={cn("mx-auto w-8 h-8 rounded-full flex items-center justify-center mb-1", indicator.bgColor)}>
                      <Icon className={cn("h-4 w-4", indicator.color)} />
                    </div>
                    <p className="text-xs font-medium">{indicator.label}</p>
                    <p className={cn("text-lg font-bold", indicator.value > 0 ? indicator.color : "text-muted-foreground")}>
                      {indicator.value > 0 ? `${indicator.value}%` : "-"}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs bg-muted/50 rounded-lg p-2">
              <span className="text-muted-foreground">{data.jobsCompleted} jobs completed</span>
              {data.avgRating > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Star className="h-3 w-3 fill-current" />
                  {data.avgRating.toFixed(1)} avg
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              No jobs completed yet
            </p>
            <Link href="/jobs">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Find your first job
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Honest Disclaimer */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <span>
              These skills matter in every career, but they do NOT teach {careerName} skills directly.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Career-Specific Progress Component
function CareerSpecificProgress({
  data,
  careerName,
  careerEmoji,
}: {
  data: CareerProgressData;
  careerName: string;
  careerEmoji: string;
}) {
  const hasAnyProgress = data.learningStarted || data.coursesInProgress > 0 || data.coursesCompleted > 0;

  const milestones = [
    {
      label: "Learning started",
      achieved: data.learningStarted,
      icon: BookOpen,
    },
    {
      label: "First course in progress",
      achieved: data.coursesInProgress > 0,
      icon: GraduationCap,
    },
    {
      label: "Course completed",
      achieved: data.coursesCompleted > 0,
      icon: Award,
    },
  ];

  return (
    <Card className="border-2 border-emerald-200 dark:border-emerald-800/50">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">What Moves You Toward {careerName}</h4>
              <p className="text-[10px] text-muted-foreground">Real career progress</p>
            </div>
          </div>
          <span className="text-lg">{careerEmoji}</span>
        </div>

        {hasAnyProgress ? (
          <div className="space-y-2">
            {milestones.map((milestone, i) => {
              const Icon = milestone.icon;
              return (
                <div
                  key={milestone.label}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg",
                    milestone.achieved ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      milestone.achieved
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {milestone.achieved ? (
                      <Icon className="h-3 w-3" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs",
                      milestone.achieved ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-muted-foreground"
                    )}
                  >
                    {milestone.label}
                  </span>
                </div>
              );
            })}

            {data.certificationsEarned > 0 && (
              <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Certifications earned
                </span>
                <Badge className="bg-amber-500">{data.certificationsEarned}</Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 bg-muted/30 rounded-lg">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">You haven&apos;t started this yet</p>
            <p className="text-[10px] text-muted-foreground mb-3">
              That&apos;s normal — this is where your real {careerName} journey will begin
            </p>
            <Link href={`/growth/career-path?goal=${encodeURIComponent(careerName)}`}>
              <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                Explore learning paths
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* What counts note */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
            <Target className="h-3 w-3 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span>
              This section tracks courses, certifications, and projects that directly build {careerName} skills.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Runway & Readiness Component
function RunwayReadiness({
  data,
  careerName,
}: {
  data: RunwayData;
  careerName: string;
}) {
  const availabilityLabels: Record<string, string> = {
    busy: "Limited time available",
    some: "Some time for learning",
    plenty: "Good time for learning",
  };

  const runwayIndicators = [
    {
      label: "Earnings",
      value: data.totalEarnings > 0 ? formatCurrency(data.totalEarnings) : "-",
      description: data.totalEarnings > 0
        ? "Can fund courses, materials, or save for future"
        : "Complete jobs to build your learning runway",
      icon: Wallet,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      hasValue: data.totalEarnings > 0,
    },
    {
      label: "Time",
      value: data.availabilityLevel ? availabilityLabels[data.availabilityLevel] : "Not set",
      description: "Your availability for learning",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      hasValue: !!data.availabilityLevel,
    },
    {
      label: "Saved Paths",
      value: data.savedLearningPaths > 0 ? `${data.savedLearningPaths} saved` : "None yet",
      description: "Learning paths you're tracking",
      icon: Bookmark,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      hasValue: data.savedLearningPaths > 0,
    },
  ];

  return (
    <Card className="border">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Target className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Your Learning Runway</h4>
            <p className="text-[10px] text-muted-foreground">Resources that enable your journey</p>
          </div>
        </div>

        <div className="space-y-2">
          {runwayIndicators.map((indicator) => {
            const Icon = indicator.icon;
            return (
              <div
                key={indicator.label}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg",
                  indicator.hasValue ? "bg-muted/50" : "bg-muted/20"
                )}
              >
                <div className={cn("p-1.5 rounded-lg", indicator.bgColor)}>
                  <Icon className={cn("h-3.5 w-3.5", indicator.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{indicator.label}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      indicator.hasValue ? indicator.color : "text-muted-foreground"
                    )}>
                      {indicator.value}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {indicator.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connection note */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <span>
              Small jobs give you the time, trust, and resources to pursue {careerName}.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Honest Progress Section Component
export function HonestProgressSection({
  careerName,
  careerEmoji,
  foundational,
  careerProgress,
  runway,
}: HonestProgressSectionProps) {
  return (
    <div className="space-y-4">
      {/* Section Header with Core Principle */}
      <div className="text-center pb-2">
        <h3 className="font-semibold text-sm mb-1">Your Progress Toward {careerName}</h3>
        <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
          Small jobs don&apos;t make you a {careerName}. They give you the time, trust, and resources to become one.
        </p>
      </div>

      {/* Three Progress Areas */}
      <div className="space-y-3">
        {/* Area 1: Foundational */}
        <FoundationalProgress data={foundational} careerName={careerName} />

        {/* Area 2: Career-Specific (Primary) */}
        <CareerSpecificProgress
          data={careerProgress}
          careerName={careerName}
          careerEmoji={careerEmoji}
        />

        {/* Area 3: Runway */}
        <RunwayReadiness data={runway} careerName={careerName} />
      </div>

      {/* What matters next hint */}
      <Card className="border border-dashed">
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">What matters next</p>
              <p className="text-[10px] text-muted-foreground">
                {careerProgress.learningStarted
                  ? `Continue your ${careerName} learning journey`
                  : foundational.jobsCompleted < 3
                    ? "Build your foundation with a few more jobs, then explore learning paths"
                    : `You have a solid foundation — time to start your ${careerName} learning`}
              </p>
            </div>
            <Link href={
              careerProgress.learningStarted
                ? `/growth/career-path?goal=${encodeURIComponent(careerName)}`
                : foundational.jobsCompleted < 3
                  ? "/jobs"
                  : `/growth/career-path?goal=${encodeURIComponent(careerName)}`
            }>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                Go
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export types for use in parent components
export type { FoundationalProgressData, CareerProgressData, RunwayData };
