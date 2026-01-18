"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  Star,
  Zap,
  ArrowRight,
} from "lucide-react";
import { getStrengthsProfile, type StrengthsProfile } from "@/lib/my-path/actions";

export default function StrengthsPage() {
  const { data: profile, isLoading } = useQuery<StrengthsProfile | null>({
    queryKey: ["strengths-profile"],
    queryFn: () => getStrengthsProfile(),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return <StrengthsSkeleton />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold mb-2">Unable to load strengths</h3>
        <p className="text-sm text-muted-foreground">
          Please try again later
        </p>
      </div>
    );
  }

  const hasData =
    profile.topStrengths.length > 0 || profile.growingStrengths.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1">Your strengths</h2>
        <p className="text-sm text-muted-foreground">
          What makes you stand out, based on your activity and feedback
        </p>
      </div>

      {hasData ? (
        <>
          {/* Top Strengths */}
          <Card className="border-2 border-purple-200 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Top strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {profile.topStrengths.length > 0 ? (
                <div className="space-y-4">
                  {profile.topStrengths.map((strength, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{strength.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {strength.evidence}
                        </p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        Strong
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Complete more jobs to discover your top strengths
                </p>
              )}
            </CardContent>
          </Card>

          {/* Growing Strengths */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Growing strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {profile.growingStrengths.length > 0 ? (
                <div className="space-y-3">
                  {profile.growingStrengths.map((strength, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{strength.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {strength.evidence}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Emerging
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keep working to develop more strengths
                </p>
              )}
            </CardContent>
          </Card>

          {/* Growth Edges */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg">Try next</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.growthEdges.map((edge, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50"
                  >
                    <Lightbulb className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-sm">{edge}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">Build your strengths profile</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete jobs and receive feedback to discover what makes you
              stand out
            </p>
            <Link href="/jobs">
              <Button>
                Find jobs
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Your strengths are based on completed jobs, employer feedback, and
            demonstrated skills. Keep working to grow your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StrengthsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card className="border-2">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
