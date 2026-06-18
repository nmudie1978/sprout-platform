"use client";

import type { Career } from "@/lib/career-pathways";
import { localizeCareer } from "@/lib/career-localization";
import { parseSalaryRange, formatSalary } from "@/lib/career-filters/utils";

interface CareerShelfProps {
  emoji: string;
  title: string;
  blurb: string;
  careers: Career[];
  userCountry: string | null;
  onOpen: (career: Career) => void;
}

const GROWTH_META: Record<Career["growthOutlook"], { label: string; dot: string }> = {
  high: { label: "Growing", dot: "bg-emerald-400" },
  medium: { label: "Steady", dot: "bg-amber-400" },
  stable: { label: "Stable", dot: "bg-sky-400" },
};

function salaryLabel(career: Career): string | null {
  const range = parseSalaryRange(career.avgSalary);
  if (!range || range.min <= 0) return null;
  return `from ${formatSalary(range.min)}`;
}

/**
 * One themed shelf: a calm header and a horizontal scroll-snap row of
 * compact career cards. Each card opens the existing detail sheet via
 * `onOpen`. Display text is localized; selection still uses raw careers.
 */
export function CareerShelf({
  emoji,
  title,
  blurb,
  careers,
  userCountry,
  onOpen,
}: CareerShelfProps) {
  if (careers.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span aria-hidden className="text-base">
          {emoji}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{blurb}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
        {careers.map((career) => {
          const view = localizeCareer(career, userCountry);
          const salary = salaryLabel(career);
          const growth = GROWTH_META[career.growthOutlook];
          return (
            <button
              key={career.id}
              type="button"
              onClick={() => onOpen(career)}
              className="snap-start shrink-0 w-44 text-left rounded-control border border-border bg-background hover:border-primary/40 hover:bg-foreground/[0.03] transition-colors p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="text-xl" aria-hidden>
                {career.emoji}
              </div>
              <div className="mt-1.5 text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
                {view.title}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                {salary && <span>{salary}</span>}
                <span className="inline-flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${growth.dot}`} aria-hidden />
                  {growth.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
