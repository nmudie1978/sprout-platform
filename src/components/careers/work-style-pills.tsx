"use client";

import {
  type CareerNature,
  CAREER_NATURE_LABELS,
  CAREER_NATURE_EMOJIS,
} from "@/lib/career-filters/types";

const NATURE_ORDER: CareerNature[] = [
  "hands-on",
  "analytical",
  "people-focused",
  "creative",
  "technical",
  "outdoors-active",
  "structured-organised",
  "leadership",
];

interface WorkStylePillsProps {
  selected: CareerNature[];
  onToggle: (nature: CareerNature) => void;
  wrap?: boolean;
}

export function WorkStylePills({ selected, onToggle, wrap }: WorkStylePillsProps) {
  return (
    <div
      className={
        wrap
          ? "flex flex-wrap gap-2"
          : "flex gap-1.5 overflow-x-auto scrollbar-hide"
      }
    >
      {NATURE_ORDER.map((nature) => {
        const isSelected = selected.includes(nature);
        return (
          <button
            key={nature}
            onClick={() => onToggle(nature)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
              isSelected
                ? "bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-300 dark:border-teal-700"
                : "bg-background border hover:bg-muted/80"
            }`}
          >
            <span>{CAREER_NATURE_EMOJIS[nature]}</span>
            {CAREER_NATURE_LABELS[nature]}
          </button>
        );
      })}
    </div>
  );
}
