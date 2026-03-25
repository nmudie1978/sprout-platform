"use client";

import { Calendar } from "lucide-react";
import { YouthEventsTable } from "@/components/insights/youth-events-table";
import { PageContext } from "@/components/ui/page-context";

export default function CareerEventsPage() {
  return (
    <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 max-w-5xl">
      <PageContext
        pageKey="career-events"
        purpose="Find upcoming career events, open days, and workshops near you."
        action="Browse events, filter by type or location, and click through to register."
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-teal-500/10">
          <Calendar className="h-5 w-5 text-teal-500" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Career Events</h1>
          <p className="text-xs text-muted-foreground/60">
            Upcoming events, open days, and workshops to explore careers
          </p>
        </div>
      </div>

      <YouthEventsTable />
    </div>
  );
}
