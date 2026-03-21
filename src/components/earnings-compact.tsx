"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendingUp, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";

export function EarningsCompact() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-earnings"],
    queryFn: async () => {
      const response = await fetch("/api/earnings");
      if (!response.ok) throw new Error("Failed to fetch earnings");
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (earnings don't change often)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  if (isLoading) {
    return (
      <Card className="border relative z-10">
        <CardContent className="p-2.5">
          <div className="flex items-center justify-center h-12">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary = {} } = data || {};
  const {
    totalEarned = 0,
    thisMonthEarnings = 0,
    pendingAmount = 0,
  } = summary;

  return (
    <Card className="border hover:shadow-md transition-shadow relative z-10">
      <CardContent className="p-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-emerald-500/10">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium">Earnings</span>
          </div>
          {totalEarned > 0 && (
            <Link href="/earnings" className="inline-block">
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-emerald-600 hover:text-emerald-700 pointer-events-auto">
                <BarChart3 className="h-2.5 w-2.5 mr-0.5" />
                Chart
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-muted-foreground">Total</span>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
              {formatCurrency(totalEarned)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">This month</span>
            <span className="font-medium">{formatCurrency(thisMonthEarnings)}</span>
          </div>
          {pendingAmount > 0 && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-medium text-gray-600 dark:text-gray-400">{formatCurrency(pendingAmount)}</span>
            </div>
          )}
        </div>

        {totalEarned === 0 && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-[10px] text-muted-foreground text-center">
              Complete small jobs to start earning
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
