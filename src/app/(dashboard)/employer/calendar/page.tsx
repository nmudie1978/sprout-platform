"use client";

import { JobCalendar } from "@/components/job-calendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employer">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Job Calendar</h1>
          <p className="text-muted-foreground">
            View your scheduled jobs at a glance
          </p>
        </div>
      </div>

      <JobCalendar />
    </div>
  );
}
