"use client";

/**
 * GO FURTHER TABS
 *
 * Pill-style tab switcher for the "Go Further" section:
 * - "Beyond Borders" → BeyondBordersCarousel
 * - "Career Events" → existing YouthEventsTable
 */

import { Compass, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BeyondBordersCarousel } from "@/components/insights/beyond-borders-carousel";
import { YouthEventsTable } from "@/components/insights/youth-events-table";

export function GoFurtherTabs() {
  return (
    <Tabs defaultValue="beyond-borders" className="w-full">
      <TabsList className="rounded-full bg-muted/60 p-1 h-auto w-auto inline-flex">
        <TabsTrigger
          value="beyond-borders"
          className="rounded-full px-4 py-1.5 text-sm gap-1.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-none"
        >
          <Compass className="h-3.5 w-3.5" />
          Beyond Borders
        </TabsTrigger>
        <TabsTrigger
          value="career-events"
          className="rounded-full px-4 py-1.5 text-sm gap-1.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-none"
        >
          <Calendar className="h-3.5 w-3.5" />
          Career Events
        </TabsTrigger>
      </TabsList>

      <TabsContent value="beyond-borders" className="mt-4">
        <BeyondBordersCarousel />
      </TabsContent>

      <TabsContent value="career-events" className="mt-4">
        <YouthEventsTable />
      </TabsContent>
    </Tabs>
  );
}

export default GoFurtherTabs;
