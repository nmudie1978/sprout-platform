"use client";

/**
 * GO FURTHER TABS
 *
 * Pill-style tab switcher for the "Go Further" section:
 * - "Beyond Borders" -> BeyondBordersCarousel
 * - "Career Events" -> existing YouthEventsTable
 *
 * Wrapped in AnimatedBorder for a conic-gradient glow effect.
 */

import { Compass, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnimatedBorder } from "@/components/ui/animated-border";
import { BeyondBordersCarousel } from "@/components/insights/beyond-borders-carousel";
import { YouthEventsTable } from "@/components/insights/youth-events-table";

export function GoFurtherTabs() {
  return (
    <AnimatedBorder>
      <div className="p-5">
        <Tabs defaultValue="beyond-borders" className="w-full">
          <TabsList className="rounded-full bg-muted/60 p-1 h-auto w-auto inline-flex">
            <TabsTrigger
              value="beyond-borders"
              className="rounded-full px-4 py-1.5 text-sm gap-1.5 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Compass className="h-3.5 w-3.5" />
              Beyond Borders
            </TabsTrigger>
            <TabsTrigger
              value="career-events"
              className="rounded-full px-4 py-1.5 text-sm gap-1.5 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-none"
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
      </div>
    </AnimatedBorder>
  );
}

export default GoFurtherTabs;
