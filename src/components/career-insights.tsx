"use client";

import { useState } from "react";
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
  Banknote,
  Info,
  List,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import { getAllCareers, getAllCategories, type Career } from "@/lib/career-pathways";

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

const growthConfig = {
  high: { label: "High Growth", color: "text-emerald-600" },
  medium: { label: "Moderate", color: "text-amber-600" },
  stable: { label: "Stable", color: "text-blue-600" },
};

function RecommendedCareersSection({
  recommendations,
  careerAspiration,
  hasAspiration,
  growthConfig,
  onSelectCareer,
}: {
  recommendations: CareerInsight[];
  careerAspiration: string;
  hasAspiration: boolean;
  growthConfig: Record<string, { label: string; color: string }>;
  onSelectCareer: (c: { career: Career; matchScore: number }) => void;
}) {
  const [recView, setRecView] = useState<"grid" | "list">("grid");

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recommended Careers</CardTitle>
            <CardDescription>
              {hasAspiration
                ? `Based on your primary goal: "${careerAspiration}"`
                : "Based on your primary goal"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md p-0.5 bg-background">
              <Button
                variant={recView === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setRecView("list")}
                title="List view"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={recView === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setRecView("grid")}
                title="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/careers">
                Explore All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recView === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec, index) => {
              const growth = growthConfig[rec.career.growthOutlook];
              const matchScore = Math.min(Math.round(rec.matchScore), 100);
              return (
                <motion.div
                  key={rec.career.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-2 hover:border-teal-500/30 transition-colors cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{rec.career.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{rec.career.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {rec.career.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                <Banknote className="h-3 w-3 mr-1" />
                                {rec.career.avgSalary.split(" ")[0]}
                              </Badge>
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                <TrendingUp className={`h-3 w-3 mr-1 ${growth.color}`} />
                                <span className={growth.color}>{rec.career.growthOutlook}</span>
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="relative w-10 h-10">
                              <svg className="w-10 h-10 transform -rotate-90">
                                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted/30" />
                                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${matchScore} 100`} className="text-teal-500" strokeLinecap="round" />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                {matchScore}%
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Match</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full rounded-none border-t h-8 text-xs"
                        onClick={() => onSelectCareer({ career: rec.career, matchScore })}
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y">
            {recommendations.slice(0, 6).map((rec) => {
              const growth = growthConfig[rec.career.growthOutlook];
              const matchScore = Math.min(Math.round(rec.matchScore), 100);
              return (
                <button
                  key={rec.career.id}
                  onClick={() => onSelectCareer({ career: rec.career, matchScore })}
                  className="flex items-center gap-3 w-full py-2.5 px-1 text-left hover:bg-muted/50 transition-colors rounded-lg"
                >
                  <span className="text-lg shrink-0">{rec.career.emoji}</span>
                  <span className="flex-1 min-w-0 text-sm font-medium truncate">{rec.career.title}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                    <TrendingUp className={`h-3 w-3 mr-0.5 ${growth.color}`} />
                    <span className={growth.color}>{rec.career.growthOutlook}</span>
                  </Badge>
                  {matchScore > 0 && (
                    <span className="text-xs font-semibold text-teal-500 shrink-0 w-10 text-right">{matchScore}%</span>
                  )}
                  <span className="text-xs text-muted-foreground shrink-0">{rec.career.avgSalary.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CareerInsights({ compact = false }: CareerInsightsProps) {
  const [selectedCareer, setSelectedCareer] = useState<{ career: Career; matchScore: number } | null>(null);

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
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalCompletedJobs = 0, careerAspiration = "", recommendations = [], insightsMessage = "", topCategories = [] } = data || {};
  const hasAspiration = !!(careerAspiration && careerAspiration.trim().length > 0);

  // Compact view for dashboard
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 overflow-hidden h-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-pink-500/5 to-cyan-500/5 pointer-events-none" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-pink-500/20">
                  <Compass className="h-5 w-5 text-teal-600" />
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
                  Set your career goal in My Goals to get personalised recommendations!
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/goals">
                    Set Goals
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Insight message */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-gradient-to-r from-teal-500/10 to-pink-500/10 border border-teal-500/20">
                  <Sparkles className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
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
                        className="bg-teal-500/10 text-teal-600 border-teal-500/20"
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
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-pink-500/5 to-cyan-500/5 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-pink-500/20">
              <Compass className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Your Career Insights</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {/* Experience Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-pink-500/10 border border-teal-500/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Briefcase className="h-4 w-4" />
                Careers Available
              </div>
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                {getAllCareers().length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Categories
              </div>
              <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                {getAllCategories().length}
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
                {Math.min(Math.round(recommendations[0]?.matchScore || 0), 100)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Careers */}
      {recommendations.length > 0 && (
        <RecommendedCareersSection
          recommendations={recommendations}
          careerAspiration={careerAspiration}
          hasAspiration={hasAspiration}
          growthConfig={growthConfig}
          onSelectCareer={setSelectedCareer}
        />
      )}

      {/* Career Detail Sheet */}
      <CareerDetailSheet
        career={selectedCareer?.career || null}
        onClose={() => setSelectedCareer(null)}
      />

      {/* No goal set */}
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
                <Link href="/goals">
                  Go to My Goals
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
