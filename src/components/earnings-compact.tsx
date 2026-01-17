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
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium">Earnings</span>
          </div>
          {totalEarned > 0 && (
            <Link href="/earnings" className="inline-block">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 pointer-events-auto">
                <BarChart3 className="h-3 w-3 mr-1" />
                Chart
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-emerald-600">
              {formatCurrency(totalEarned)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">This month</span>
            <span className="font-medium">{formatCurrency(thisMonthEarnings)}</span>
          </div>
          {pendingAmount > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-medium text-amber-600">{formatCurrency(pendingAmount)}</span>
            </div>
          )}
        </div>

        {totalEarned === 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Complete jobs to start earning
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
