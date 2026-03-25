"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  BarChart3,
  Briefcase,
  Trophy,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface ChartDataPoint {
  month: string;
  monthLabel: string;
  total: number;
  confirmed: number;
  pending: number;
  jobs: number;
}

interface EarningsChartData {
  chartData: ChartDataPoint[];
  summary: {
    totalEarnings: number;
    confirmedEarnings: number;
    totalJobs: number;
    avgMonthly: number;
    bestMonth: string | null;
    bestMonthAmount: number;
    yearOverYearGrowth: number | null;
    byCategory: Record<string, number>;
    periodYears: number;
  };
}

const categoryConfig: Record<string, { emoji: string; label: string; color: string }> = {
  BABYSITTING: { emoji: "👶", label: "Babysitting", color: "bg-pink-500/50" },
  DOG_WALKING: { emoji: "🐕", label: "Dog Walking", color: "bg-amber-500/50" },
  SNOW_CLEARING: { emoji: "❄️", label: "Snow Clearing", color: "bg-cyan-500/50" },
  CLEANING: { emoji: "🧹", label: "Cleaning", color: "bg-emerald-500/50" },
  DIY_HELP: { emoji: "🔧", label: "DIY Help", color: "bg-orange-500/50" },
  TECH_HELP: { emoji: "💻", label: "Tech Help", color: "bg-teal-500/50" },
  ERRANDS: { emoji: "🏃", label: "Errands", color: "bg-blue-500/50" },
  OTHER: { emoji: "✨", label: "Other", color: "bg-gray-500/50" },
};

export function EarningsChart() {
  const [years, setYears] = useState(1);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { data, isLoading } = useQuery<EarningsChartData>({
    queryKey: ["earnings-chart", years],
    queryFn: async () => {
      const response = await fetch(`/api/earnings/chart?years=${years}`);
      if (!response.ok) throw new Error("Failed to fetch chart data");
      return response.json();
    },
  });

  const chartData = data?.chartData || [];
  const summary = data?.summary;

  // Find max value for scaling
  const maxValue = Math.max(...chartData.map((d) => d.total), 1);

  // Visible months based on scroll (show 12 at a time for larger ranges)
  const visibleMonths = years > 1 ? 12 : chartData.length;
  const maxScroll = Math.max(0, chartData.length - visibleMonths);
  const visibleData = chartData.slice(scrollPosition, scrollPosition + visibleMonths);

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm px-6 py-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-teal-500/10">
              <BarChart3 className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Small Jobs Earnings</h1>
              <p className="text-xs text-muted-foreground/60">Track your income from completed small jobs</p>
            </div>
          </div>

          {/* Year Range Selector */}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((y) => (
              <Button
                key={y}
                variant={years === y ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  setYears(y);
                  setScrollPosition(0);
                }}
                className={`rounded-full text-xs ${
                  years === y
                    ? "bg-foreground/10 text-foreground border border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {y} Year{y > 1 ? "s" : ""}
              </Button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Loading earnings data...</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
            >
              <Card className="border border-teal-500/15 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-teal-600/70 dark:text-teal-400/70 mb-1">
                    <Wallet className="h-4 w-4" />
                    Total Earned
                  </div>
                  <div className="text-2xl font-bold text-teal-600/90 dark:text-teal-400/90">
                    {formatCurrency(summary?.totalEarnings || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground/50">
                    over {years} year{years > 1 ? "s" : ""}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-purple-500/15 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-purple-600/70 dark:text-purple-400/70 mb-1">
                    <Briefcase className="h-4 w-4" />
                    Jobs Completed
                  </div>
                  <div className="text-2xl font-bold text-purple-600/90 dark:text-purple-400/90">
                    {summary?.totalJobs || 0}
                  </div>
                  <div className="text-xs text-muted-foreground/50">
                    small jobs
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-blue-500/15 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-blue-600/70 dark:text-blue-400/70 mb-1">
                    <Calendar className="h-4 w-4" />
                    Monthly Avg
                  </div>
                  <div className="text-2xl font-bold text-blue-600/90 dark:text-blue-400/90">
                    {formatCurrency(summary?.avgMonthly || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground/50">per month</div>
                </CardContent>
              </Card>

              <Card className="border border-amber-500/15 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-amber-600/70 dark:text-amber-400/70 mb-1">
                    <Trophy className="h-4 w-4" />
                    Best Month
                  </div>
                  <div className="text-2xl font-bold text-amber-600/90 dark:text-amber-400/90">
                    {formatCurrency(summary?.bestMonthAmount || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground/50">
                    {summary?.bestMonth || "N/A"}
                  </div>
                </CardContent>
              </Card>

              <Card className={`border bg-card/80 ${
                summary?.yearOverYearGrowth != null
                  ? (summary.yearOverYearGrowth >= 0 ? "border-emerald-500/15" : "border-red-500/15")
                  : "border-border/40"
              }`}>
                <CardContent className="p-4">
                  <div className={`flex items-center gap-2 text-sm mb-1 ${
                    summary?.yearOverYearGrowth != null
                      ? (summary.yearOverYearGrowth >= 0
                        ? "text-emerald-600/70 dark:text-emerald-400/70"
                        : "text-red-500/70 dark:text-red-400/70")
                      : "text-muted-foreground"
                  }`}>
                    {(summary?.yearOverYearGrowth ?? 0) >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    Year Growth
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      summary?.yearOverYearGrowth != null
                        ? (summary?.yearOverYearGrowth ?? 0) >= 0
                          ? "text-teal-500/80"
                          : "text-red-400/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {summary?.yearOverYearGrowth != null
                      ? `${(summary?.yearOverYearGrowth ?? 0) >= 0 ? "+" : ""}${summary.yearOverYearGrowth.toFixed(1)}%`
                      : "\u2014"}
                  </div>
                  <div className="text-xs text-muted-foreground/50">
                    {summary?.yearOverYearGrowth != null ? "vs last year" : "Need 2+ years"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border border-border/40 bg-card/80">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Monthly Earnings</CardTitle>
                      <CardDescription>
                        {chartData.length > 0
                          ? `${chartData[0]?.monthLabel} - ${chartData[chartData.length - 1]?.monthLabel}`
                          : "No data"}
                      </CardDescription>
                    </div>
                    {years > 1 && chartData.length > visibleMonths && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setScrollPosition(Math.max(0, scrollPosition - 6))}
                          disabled={!canScrollLeft}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setScrollPosition(Math.min(maxScroll, scrollPosition + 6))}
                          disabled={!canScrollRight}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {chartData.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No earnings yet</p>
                      <p className="text-sm">Complete small jobs to start tracking what you earn!</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-muted-foreground pr-2 text-right">
                        <span>{formatCurrency(maxValue)}</span>
                        <span>{formatCurrency(maxValue / 2)}</span>
                        <span>{formatCurrency(0)}</span>
                      </div>

                      {/* Chart area */}
                      <div className="ml-16">
                        {/* Grid lines */}
                        <div className="absolute left-16 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                          <div className="border-t border-dashed border-muted" />
                          <div className="border-t border-dashed border-muted" />
                          <div className="border-t border-muted" />
                        </div>

                        {/* Bars */}
                        <div className="flex items-end gap-1 h-64 relative">
                          <AnimatePresence mode="wait">
                            {visibleData.map((point, index) => {
                              const height = maxValue > 0 ? (point.total / maxValue) * 100 : 0;
                              const confirmedHeight = maxValue > 0 ? (point.confirmed / maxValue) * 100 : 0;
                              const isHovered = hoveredBar === index + scrollPosition;

                              return (
                                <motion.div
                                  key={point.month}
                                  initial={{ opacity: 0, scaleY: 0 }}
                                  animate={{ opacity: 1, scaleY: 1 }}
                                  exit={{ opacity: 0, scaleY: 0 }}
                                  transition={{ delay: index * 0.02 }}
                                  className="flex-1 flex flex-col items-center relative group"
                                  onMouseEnter={() => setHoveredBar(index + scrollPosition)}
                                  onMouseLeave={() => setHoveredBar(null)}
                                >
                                  {/* Tooltip */}
                                  <AnimatePresence>
                                    {isHovered && point.total > 0 && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute bottom-full mb-2 z-10 px-3 py-2 bg-popover border rounded-lg shadow-lg text-sm whitespace-nowrap"
                                      >
                                        <div className="font-semibold">{point.monthLabel}</div>
                                        <div className="text-foreground/80">
                                          Total: {formatCurrency(point.total)}
                                        </div>
                                        {point.confirmed > 0 && (
                                          <div className="text-teal-500/80 text-xs">
                                            Confirmed: {formatCurrency(point.confirmed)}
                                          </div>
                                        )}
                                        {point.pending > 0 && (
                                          <div className="text-muted-foreground text-xs">
                                            Pending: {formatCurrency(point.pending)}
                                          </div>
                                        )}
                                        <div className="text-muted-foreground text-xs">
                                          {point.jobs} job{point.jobs !== 1 ? "s" : ""}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Bar */}
                                  <div
                                    className="w-full rounded-t-md transition-all duration-200 cursor-pointer relative overflow-hidden"
                                    style={{
                                      height: `${height}%`,
                                      minHeight: point.total > 0 ? "4px" : "0",
                                    }}
                                  >
                                    {/* Confirmed portion (bottom) */}
                                    <div
                                      className="absolute bottom-0 left-0 right-0 bg-teal-600/60 transition-all"
                                      style={{ height: `${(confirmedHeight / height) * 100}%` }}
                                    />
                                    {/* Pending portion (top) */}
                                    <div
                                      className="absolute top-0 left-0 right-0 bg-muted-foreground/25 transition-all"
                                      style={{
                                        height: `${((height - confirmedHeight) / height) * 100}%`,
                                      }}
                                    />
                                    {/* Hover overlay */}
                                    <div
                                      className={`absolute inset-0 bg-white/10 transition-opacity ${
                                        isHovered ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                  </div>

                                  {/* Empty state indicator */}
                                  {point.total === 0 && (
                                    <div className="w-full h-1 bg-muted rounded" />
                                  )}
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>

                        {/* X-axis labels */}
                        <div className="flex gap-1 mt-2">
                          {visibleData.map((point) => (
                            <div
                              key={point.month}
                              className="flex-1 text-center text-[10px] text-muted-foreground truncate"
                            >
                              {point.monthLabel}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded bg-teal-600/60" />
                      <span className="text-muted-foreground">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded bg-muted-foreground/25" />
                      <span className="text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Earnings by Category */}
            {summary?.byCategory && Object.keys(summary.byCategory).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Card className="border border-border/40 bg-card/80">
                  <CardHeader>
                    <CardTitle className="text-lg">Earnings by Category</CardTitle>
                    <CardDescription>Where your income comes from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(summary.byCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => {
                          const config = categoryConfig[category] || categoryConfig.OTHER;
                          const percentage = (amount / summary.totalEarnings) * 100;

                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span>{config.emoji}</span>
                                  <span className="font-medium">{config.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{formatCurrency(amount)}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {percentage.toFixed(0)}%
                                  </Badge>
                                </div>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ delay: 0.5, duration: 0.5 }}
                                  className={`h-full ${config.color} rounded-full`}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
