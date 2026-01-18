"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { getSkillsJobsLadder, type SkillsJobsLadder } from "@/lib/my-path/actions";
import { formatCurrency } from "@/lib/utils";

const categoryEmoji: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

export default function SkillsJobsPage() {
  const { data: ladder, isLoading } = useQuery<SkillsJobsLadder | null>({
    queryKey: ["skills-jobs-ladder"],
    queryFn: () => getSkillsJobsLadder(),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return <SkillsJobsSkeleton />;
  }

  if (!ladder) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load skills data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Target Roles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Your target direction</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {ladder.targetRoles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ladder.targetRoles.map((role, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-sm py-1.5 px-3"
                >
                  {role}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Set your career interests to get personalized skill recommendations
              </p>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Update profile
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills You're Building */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Skills you're building</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {ladder.buildingSkills.length > 0 ? (
              <div className="space-y-4">
                {ladder.buildingSkills.map((skill) => (
                  <div key={skill.skillId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">{skill.skillName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {skill.currentStrength}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${skill.currentStrength}%` }}
                      />
                    </div>
                    {skill.sources.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        From: {skill.sources.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete jobs to start building skills
              </p>
            )}
          </CardContent>
        </Card>

        {/* Skills to Strengthen */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Skills to strengthen</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {ladder.gapSkills.length > 0 ? (
              <div className="space-y-4">
                {ladder.gapSkills.map((skill) => (
                  <div key={skill.skillId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{skill.skillName}</span>
                      <Badge variant="outline" className="text-xs">
                        Not started
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: "5%" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Look for jobs that build this skill
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Great! You're developing all core skills
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Jobs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Jobs to level up your skills</CardTitle>
            <Link href="/my-path/job-picks">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ladder.recommendedJobs.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {ladder.recommendedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block p-4 rounded-lg border hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {categoryEmoji[job.category] || "✨"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{job.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {job.location}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.reasons.slice(0, 2).map((reason, i) => (
                          <Badge key={i} variant="outline" className="text-xs py-0">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="font-bold text-gray-600 dark:text-gray-400 shrink-0">
                      {formatCurrency(job.payAmount)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No job recommendations yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SkillsJobsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
