"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Compass,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Briefcase,
  Loader2,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { CareerCard } from "@/components/career-card";
import { getAllCareers, type Career } from "@/lib/career-pathways";

interface CareerInsight {
  career: Career;
  matchScore: number;
}

interface CareerInsightsData {
  totalCompletedJobs: number;
  careerAspiration?: string;
  topCategories: {
    category: string;
    count: number;
    careers: Career[];
  }[];
  recommendations: CareerInsight[];
  insightsMessage: string;
}

interface CareerInsightsProps {
  compact?: boolean;
}

export function CareerInsights({ compact = false }: CareerInsightsProps) {
  const { data, isLoading } = useQuery<CareerInsightsData>({
    queryKey: ["career-insights"],
    queryFn: async () => {
      const response = await fetch("/api/career-insights");
      if (!response.ok) throw new Error("Failed to fetch career insights");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalCompletedJobs = 0, careerAspiration = "", recommendations = [], insightsMessage = "", topCategories = [] } = data || {};
  const hasAspiration = careerAspiration && careerAspiration.trim().length > 0;

  // Compact view for dashboard
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 overflow-hidden h-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5 pointer-events-none" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Compass className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Career Paths</CardTitle>
                  <CardDescription>Based on your career goal</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {!hasAspiration ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm text-muted-foreground mb-3">
                  Set your career aspiration in your profile to get personalised recommendations!
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile">
                    Update Profile
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Insight message */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <p className="text-sm">{insightsMessage}</p>
                </div>

                {/* Top recommendations */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Top Matches
                  </div>
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <motion.div
                      key={rec.career.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rec.career.emoji}</span>
                        <div>
                          <div className="font-medium text-sm">{rec.career.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {rec.career.growthOutlook === "high" ? "High growth" : rec.career.growthOutlook === "medium" ? "Medium growth" : "Stable"}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-purple-500/10 text-purple-600 border-purple-500/20"
                      >
                        {Math.min(Math.round(rec.matchScore), 100)}%
                      </Badge>
                    </motion.div>
                  ))}
                </div>

                {/* Link to full page */}
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/careers">
                    <Compass className="mr-2 h-4 w-4" />
                    Explore All Careers
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Full view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <Card className="border-2 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Compass className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Your Career Insights</CardTitle>
              <CardDescription>{insightsMessage}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {/* Experience Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Briefcase className="h-4 w-4" />
                Careers Available
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {getAllCareers().length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Categories
              </div>
              <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                {topCategories.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Sparkles className="h-4 w-4" />
                Top Matches
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {Math.min(recommendations.length, 4)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Rocket className="h-4 w-4" />
                Top Match
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {recommendations[0]?.matchScore || 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Careers */}
      {recommendations.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recommended Careers</CardTitle>
                <CardDescription>
                  Based on your career aspiration
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/careers">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((rec, index) => (
                <motion.div
                  key={rec.career.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CareerCard
                    career={rec.career}
                    matchScore={Math.min(Math.round(rec.matchScore), 100)}
                    showExpandButton
                    compact
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No aspiration set */}
      {!hasAspiration && (
        <Card className="border-2">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Set Your Career Goal</h3>
              <p className="text-muted-foreground mb-4">
                Tell us what career you're interested in to get personalised recommendations!
              </p>
              <Button asChild>
                <Link href="/profile">
                  Update Profile
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
