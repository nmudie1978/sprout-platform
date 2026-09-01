"use client";

/**
 * DEV PAGE: the three Explore Careers views, side by side.
 *
 * /careers is behind auth, so this renders the same <CareerCardV2> renderers
 * with mock careers — no sign-in needed — to compare Table / Cards / Detailed
 * and to headless-screenshot them. Visit /dev/career-views.
 */

import { useState } from "react";

import { CareerCardV2, LIST_GRID, type ViewMode } from "@/components/career-card-v2";
import {
  CareerViewSwitcher,
  CAREER_VIEW_OPTIONS,
} from "@/components/careers/career-view-switcher";
import type { Career } from "@/lib/career-pathways";

function c(o: Partial<Career> & { id: string; title: string }): Career {
  return {
    emoji: "💼",
    description: "A sample career used for the dev preview.",
    avgSalary: "650,000 kr/year",
    educationPath: "Bachelor's degree",
    keySkills: ["Communication", "Problem solving", "Analysis", "Teamwork"],
    dailyTasks: ["Meet clients", "Review data", "Write reports"],
    growthOutlook: "stable",
    ...o,
  } as Career;
}

const CAREERS: Career[] = [
  c({ id: "actuary", title: "Actuary", emoji: "📐", avgSalary: "750,000 kr/year", educationPath: "Master's degree", growthOutlook: "high" }),
  c({ id: "able-seaman", title: "Able Seaman", emoji: "🚢", avgSalary: "450,000 kr/year", educationPath: "Certificate", growthOutlook: "medium", entryLevel: true }),
  c({ id: "adolescent-medicine-specialist", title: "Adolescent Medicine Specialist", emoji: "🧑‍⚕️", avgSalary: "950,000 kr/year", educationPath: "Professional degree", growthOutlook: "high" }),
  c({ id: "agile-coach", title: "Agile Coach", emoji: "🧭", avgSalary: "850,000 kr/year", growthOutlook: "high" }),
  c({ id: "aerospace-technician", title: "Aerospace Technician", emoji: "🛰️", avgSalary: "650,000 kr/year", educationPath: "Vocational", entryLevel: true }),
  c({ id: "addiction-counsellor", title: "Addiction Counsellor", emoji: "💬", avgSalary: "480,000 kr/year", growthOutlook: "high" }),
];

const BLURB: Record<ViewMode, string> = {
  list: "Compact rows. Densest of the three — best for comparing salary, growth and demand down a column.",
  small: "A grid of cards. Each shows the emoji, a taste of the day-to-day and top skills.",
  large: "Fewer, richer cards. Most room for skills and salary; best for slow browsing.",
};

export default function CareerViewsDevPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold text-foreground">Explore Careers — three views</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          The same six careers in each view. On /careers the choice sits above
          the results and is remembered per person.
        </p>
        <CareerViewSwitcher viewMode={viewMode} onChange={setViewMode} />
        <p className="text-xs text-muted-foreground">{BLURB[viewMode]}</p>
      </header>

      {/* Interactive — mirrors the real page exactly */}
      <section className="space-y-2">
        <ViewBlock mode={viewMode} />
      </section>

      {/* All three at once, for comparing without clicking */}
      <section className="space-y-8 border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">All three, stacked</h2>
        {CAREER_VIEW_OPTIONS.map(({ mode, label }) => (
          <div key={mode} className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{label}</h3>
            <p className="text-xs text-muted-foreground">{BLURB[mode]}</p>
            <ViewBlock mode={mode} />
          </div>
        ))}
      </section>
    </div>
  );
}

function ViewBlock({ mode }: { mode: ViewMode }) {
  return (
    <>
      {/* Mirrors the real /careers list: one horizontal scroll container over
          header + body, three columns below sm. Kept in sync so this sandbox
          stays a faithful preview of the shipped table. */}
      <div className={mode === "list" ? "overflow-x-auto" : undefined}>
      {mode === "list" && (
        <div className={`grid ${LIST_GRID} items-center gap-x-2 md:gap-x-4 px-3 py-1 border border-border border-b-0 rounded-t-control bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 w-full xl:w-fit`}>
          <span>Career</span>
          <span className="text-right">Salary</span>
          <span className="hidden md:block text-center">Growth</span>
          <span className="hidden xl:block text-center">Sector</span>
          <span className="hidden xl:block text-center">Path</span>
          <span className="hidden xl:block text-center">Demand</span>
          <span className="text-center">Match</span>
          <span className="hidden md:block">Learn more</span>
        </div>
      )}
      <div
        className={
          mode === "list"
            ? "border border-border rounded-b-control overflow-hidden bg-background w-full xl:w-fit"
            : mode === "small"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        }
      >
        {CAREERS.map((career) => (
          <CareerCardV2
            key={career.id}
            career={career}
            viewMode={mode}
            onLearnMore={() => {}}
          />
        ))}
      </div>
      </div>
    </>
  );
}
