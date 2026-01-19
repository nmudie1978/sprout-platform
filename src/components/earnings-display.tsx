"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Banknote,
  Calendar,
  Building2,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

const categoryEmojis: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

export function EarningsDisplay() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-earnings"],
    queryFn: async () => {
      const response = await fetch("/api/earnings");
      if (!response.ok) throw new Error("Failed to fetch earnings");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { earnings = [], summary = {} } = data || {};
  const {
    totalEarned = 0,
    pendingAmount = 0,
    confirmedAmount = 0,
    thisMonthEarnings = 0,
    totalJobs = 0,
  } = summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-amber-500/5 pointer-events-none" />
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">My Earnings</CardTitle>
                <CardDescription>Track your income</CardDescription>
              </div>
            </div>
            {totalEarned > 0 && (
              <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10">
                <Link href="/earnings">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Chart
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Banknote className="h-4 w-4" />
                Total Earned
              </div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {formatCurrency(totalEarned)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                This Month
              </div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {formatCurrency(thisMonthEarnings)}
              </div>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Confirmed:</span>
              <span className="font-medium text-gray-600 dark:text-gray-400">{formatCurrency(confirmedAmount)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">Pending:</span>
              <span className="font-medium text-gray-600 dark:text-gray-400">{formatCurrency(pendingAmount)}</span>
            </div>
          </div>

          {/* Recent Earnings List */}
          {earnings.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Recent Earnings</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {earnings.slice(0, 5).map((earning: any) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {categoryEmojis[earning.job.category] || "✨"}
                      </span>
                      <div>
                        <div className="font-medium text-sm">{earning.job.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {earning.job.postedBy?.employerProfile?.companyName || "Employer"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(earning.amount)}
                      </div>
                      <Badge
                        variant={earning.status === "CONFIRMED" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {earning.status === "CONFIRMED" ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {earnings.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{earnings.length - 5} more earnings
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-sm text-muted-foreground">
                Complete small jobs to start earning!
              </p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href="/jobs">
                  Find Small Jobs
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
