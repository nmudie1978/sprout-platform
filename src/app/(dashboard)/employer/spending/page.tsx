"use client";

import { SpendingChart } from "@/components/spending-chart";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SpendingPage() {
  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employer">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Spending Analytics</h1>
          <p className="text-muted-foreground">
            Track your hiring expenses and worker payments over time
          </p>
        </div>
      </div>

      <SpendingChart />
    </div>
  );
}
