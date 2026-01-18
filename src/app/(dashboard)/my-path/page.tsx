"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Compass,
  Target,
  Briefcase,
  Archive,
  Bell,
  Sparkles,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Zap,
} from "lucide-react";
import {
  getMyPathOverview,
  generatePathSnapshot,
  type PathOverview,
  type PathSnapshotData,
} from "@/lib/my-path/actions";
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

const actionTypeConfig = {
  earn: { icon: Briefcase, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  learn: { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  grow: { icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
};

export default function MyPathOverviewPage() {
  const queryClient = useQueryClient();

  const { data: overview, isLoading } = useQuery<PathOverview | null>({
    queryKey: ["my-path-overview"],
    queryFn: () => getMyPathOverview(),
    staleTime: 60 * 1000,
  });

  const generateMutation = useMutation({
    mutationFn: generatePathSnapshot,
    onSuccess: (newSnapshot) => {
      queryClient.setQueryData<PathOverview | null>(
        ["my-path-overview"],
        (old) =>
          old
            ? {
                ...old,
                snapshot: newSnapshot,
              }
            : null
      );
    },
  });

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (!overview) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load your path data.</p>
      </div>
    );
  }

  const { snapshot, topSkills, recentVault, recommendedJobs, alertCount } = overview;

  return (
    <div className="space-y-6">
      {/* Right Now Card */}
      <Card className="border-2 border-orange-200 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Right now</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshot ? (
            <>
              <div>
                <h3 className="font-semibold text-xl mb-1">{snapshot.headline}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {snapshot.direction.map((dir, i) => (
                    <Badge key={i} variant="secondary" className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                      {dir}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className={
                      snapshot.confidence === "high"
                        ? "border-green-500 text-green-600"
                        : snapshot.confidence === "medium"
                          ? "border-amber-500 text-amber-600"
                          : "border-slate-400 text-slate-500"
                    }
                  >
                    {snapshot.confidence} confidence
                  </Badge>
                </div>
              </div>

              {snapshot.rationale && (
                <p className="text-sm text-muted-foreground">{snapshot.rationale}</p>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Next steps</p>
                <div className="grid gap-2">
                  {snapshot.nextActions.slice(0, 3).map((action, i) => {
                    const config = actionTypeConfig[action.type];
                    const Icon = config.icon;
                    return (
                      <Link
                        key={i}
                        href={action.link || "#"}
                        className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-muted/50 border transition-colors group"
                      >
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <span className="text-sm flex-1">{action.action}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">
                Generate your personalized path to get started
              </p>
              <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Generate My Path
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Best Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Next best jobs</CardTitle>
              </div>
              <Link href="/my-path/job-picks">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block p-3 rounded-lg border hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">
                      {categoryEmoji[job.category] || "✨"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{job.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {job.location}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No job recommendations yet. Complete jobs to get personalized picks!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Your Strengths */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Your strengths</CardTitle>
              </div>
              <Link href="/my-path/strengths">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topSkills.length > 0 ? (
              <div className="space-y-3">
                {topSkills.slice(0, 3).map((skill) => (
                  <div key={skill.skillId} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{skill.skillName}</span>
                        <span className="text-xs text-muted-foreground">
                          {skill.totalStrength}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                          style={{ width: `${skill.totalStrength}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete jobs to discover your strengths
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Vault Highlights */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Vault highlights</CardTitle>
              </div>
              <Link href="/my-path/vault">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentVault.length > 0 ? (
              <div className="space-y-2">
                {recentVault.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Build your proof portfolio
                </p>
                <Link href="/my-path/vault">
                  <Button variant="outline" size="sm">
                    Add first item
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg">Alerts</CardTitle>
                {alertCount > 0 && (
                  <Badge className="bg-amber-500 text-white">{alertCount}</Badge>
                )}
              </div>
              <Link href="/my-path/alerts">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {alertCount > 0 ? (
              <p className="text-sm text-muted-foreground">
                You have {alertCount} new opportunity alert{alertCount > 1 ? "s" : ""}.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No new alerts. We'll notify you when jobs match your interests.
              </p>
            )}
            <Link href="/my-path/alerts" className="block mt-3">
              <Button variant="outline" size="sm" className="w-full">
                Manage alerts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
