"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AcademicDemandFilter,
  CareerFilterState,
  CareerNature,
  SalaryRange,
  SectorFilter,
} from "@/lib/career-filters/types";
import { formatSalary } from "@/lib/career-filters/utils";
import { WorkStylePills } from "@/components/careers/work-style-pills";

/**
 * MOBILE FILTER SHEET
 *
 * The desktop filter bar is a single wrapping row of dropdowns, selects and
 * a slider. On a phone that wrapped to ~5 rows of *sticky* chrome, so a
 * third of the screen was filter UI before the first career appeared — and
 * each control was a 10px-label dropdown anchored to a tiny trigger.
 *
 * This sheet carries the exact same filters and the exact same handlers,
 * laid out as a full-width, thumb-reachable bottom sheet: one section per
 * filter, options as tappable rows/pills, and a sticky "Show N careers"
 * confirm that stays clear of the home indicator.
 */

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  ALL: { label: "All", emoji: "\u{1F31F}" },
  HEALTHCARE_LIFE_SCIENCES: { label: "Healthcare", emoji: "\u{1F3E5}" },
  EDUCATION_TRAINING: { label: "Education", emoji: "\u{1F4DA}" },
  TECHNOLOGY_IT: { label: "Tech & IT", emoji: "\u{1F4BB}" },
  ARTIFICIAL_INTELLIGENCE: { label: "AI", emoji: "\u{1F916}" },
  BUSINESS_MANAGEMENT: { label: "Business", emoji: "\u{1F4BC}" },
  FINANCE_BANKING: { label: "Finance", emoji: "\u{1F3E6}" },
  SALES_MARKETING: { label: "Marketing", emoji: "\u{1F4E3}" },
  MANUFACTURING_ENGINEERING: { label: "Engineering", emoji: "⚙️" },
  LOGISTICS_TRANSPORT: { label: "Logistics", emoji: "\u{1F69B}" },
  HOSPITALITY_TOURISM: { label: "Hospitality", emoji: "\u{1F3E8}" },
  TELECOMMUNICATIONS: { label: "Telecoms", emoji: "\u{1F4E1}" },
  CREATIVE_MEDIA: { label: "Creative & Media", emoji: "\u{1F3A8}" },
  PUBLIC_SERVICE_SAFETY: { label: "Public Service", emoji: "\u{1F6A8}" },
  MILITARY_DEFENCE: { label: "Military", emoji: "\u{1FA96}" },
  SPORT_FITNESS: { label: "Sport & Fitness", emoji: "\u{1F3C5}" },
  REAL_ESTATE_PROPERTY: { label: "Property", emoji: "\u{1F3E1}" },
  SOCIAL_CARE_COMMUNITY: { label: "Social Care", emoji: "\u{1F91D}" },
  CONSTRUCTION_TRADES: { label: "Construction", emoji: "\u{1F3D7}️" },
};

const GROWTH_OPTIONS = [
  { value: "all", label: "All growth" },
  { value: "high", label: "High growth" },
  { value: "medium", label: "Moderate" },
  { value: "stable", label: "Stable" },
];

const SECTOR_OPTIONS: { value: SectorFilter; label: string }[] = [
  { value: "all", label: "All sectors" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const DEMAND_OPTIONS: { value: AcademicDemandFilter; label: string }[] = [
  { value: "all", label: "Any demand" },
  { value: "low", label: "Up to lower" },
  { value: "moderate", label: "Up to moderate" },
  { value: "strong", label: "Up to strong" },
  { value: "very-strong", label: "All levels" },
];

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CareerFilterState;
  categoryCounts: Record<string, number>;
  salaryBounds: SalaryRange;
  resultCount: number;
  onReset: () => void;
  onCategoryChange: (category: string) => void;
  onGrowthChange: (growth: string) => void;
  onSectorChange: (sector: SectorFilter) => void;
  onAcademicDemandChange: (demand: AcademicDemandFilter) => void;
  onSalaryChange: (range: SalaryRange | null) => void;
  onNatureToggle: (nature: CareerNature) => void;
}

/** A section heading inside the sheet. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

/** A single-select list rendered as full-width, 44px-tall tap rows. */
function OptionRows<T extends string>({
  options,
  value,
  onSelect,
  counts,
}: {
  options: { value: T; label: string; emoji?: string }[];
  value: T;
  onSelect: (value: T) => void;
  counts?: Record<string, number>;
}) {
  return (
    <div className="-mx-1 grid grid-cols-1">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={selected}
            className={cn(
              "flex min-h-[44px] w-full items-center gap-2 rounded-md px-3 text-left text-sm transition-colors",
              selected
                ? "bg-primary/10 font-medium text-foreground"
                : "text-foreground/80 active:bg-muted/60"
            )}
          >
            {opt.emoji && <span aria-hidden>{opt.emoji}</span>}
            <span className="flex-1 truncate">{opt.label}</span>
            {counts?.[opt.value] !== undefined && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {counts[opt.value]}
              </span>
            )}
            {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  categoryCounts,
  salaryBounds,
  resultCount,
  onReset,
  onCategoryChange,
  onGrowthChange,
  onSectorChange,
  onAcademicDemandChange,
  onSalaryChange,
  onNatureToggle,
}: MobileFilterDrawerProps) {
  const currentMin = filters.salaryRange?.min ?? salaryBounds.min;
  const currentMax = filters.salaryRange?.max ?? salaryBounds.max;
  const salaryIsActive = filters.salaryRange !== null;

  const handleSalary = (values: number[]) => {
    const [min, max] = values;
    if (min === salaryBounds.min && max === salaryBounds.max) {
      onSalaryChange(null);
    } else {
      onSalaryChange({ min, max });
    }
  };

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(
    ([value, config]) => ({
      value,
      label: config.label,
      emoji: config.emoji,
    })
  );

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[100] bg-black/50 dark:bg-background/80 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] bg-card text-card-foreground border-t rounded-t-2xl shadow-lg",
            // `dvh` so the sheet tracks the visible viewport rather than
            // sliding its footer under the iOS URL bar.
            "max-h-[88dvh] flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
          )}
        >
          {/* Grab handle */}
          <div className="flex justify-center py-2.5">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 pb-2">
            <DialogPrimitive.Title className="text-base font-semibold">
              Filters
            </DialogPrimitive.Title>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onReset} className="px-2 text-xs">
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Reset
              </Button>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close filters">
                  <X className="h-5 w-5" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4">
            <Section title="What kind of work interests you?">
              <WorkStylePills
                selected={filters.careerNatures}
                onToggle={onNatureToggle}
                wrap
              />
            </Section>

            <Section title="Salary">
              <div className="px-1">
                <Slider
                  value={[currentMin, currentMax]}
                  min={salaryBounds.min}
                  max={salaryBounds.max}
                  step={25}
                  onValueChange={handleSalary}
                  aria-label="Salary range"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {salaryIsActive ? (
                    <span className="font-medium text-primary">
                      {formatSalary(currentMin)}–{formatSalary(currentMax)}
                    </span>
                  ) : (
                    `${formatSalary(salaryBounds.min)}–${formatSalary(salaryBounds.max)}`
                  )}
                </p>
              </div>
            </Section>

            <Section title="Growth">
              <OptionRows
                options={GROWTH_OPTIONS}
                value={filters.growthFilter}
                onSelect={onGrowthChange}
              />
            </Section>

            <Section title="Sector">
              <OptionRows
                options={SECTOR_OPTIONS}
                value={filters.sector}
                onSelect={onSectorChange}
              />
            </Section>

            <Section title="Academic demand">
              <OptionRows
                options={DEMAND_OPTIONS}
                value={filters.academicDemand}
                onSelect={onAcademicDemandChange}
              />
            </Section>

            <Section title="Category">
              <OptionRows
                options={categoryOptions}
                value={filters.category}
                onSelect={onCategoryChange}
                counts={categoryCounts}
              />
            </Section>
          </div>

          {/* Sticky confirm — clear of the home indicator. */}
          <div className="border-t bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button onClick={onClose} className="w-full">
              Show {resultCount} career{resultCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
