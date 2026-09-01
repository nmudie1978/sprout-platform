"use client";

/**
 * MOBILE FILTER SHEET
 *
 * On phones the inline `CareerFilterBar` wraps five dropdowns, a salary
 * slider and a search box into a centred pile that is hard to read and
 * harder to tap. Below `sm` the bar collapses to "search + Filters", and
 * this sheet carries the full filter set instead — one control per row,
 * every target ≥44px, a live result count pinned to the bottom.
 *
 * It is a near-full-height bottom sheet (`h-[92dvh]`) rather than a
 * `max-h-[85vh]` one: `vh` on mobile Safari is the *large* viewport, so a
 * sheet sized in `vh` sits partly under the address bar and its footer
 * button cannot be reached. `dvh` tracks the visible viewport instead.
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CareerFilterState,
  CareerNature,
  SalaryRange,
  SectorFilter,
  AcademicDemandFilter,
} from "@/lib/career-filters/types";
import { CAREER_NATURE_LABELS, CAREER_NATURE_EMOJIS } from "@/lib/career-filters/types";
import { formatSalary } from "@/lib/career-filters/utils";
import {
  categoryConfig,
  growthFilters,
  NATURE_ORDER,
} from "@/components/careers/career-filter-bar";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CareerFilterState;
  categoryCounts: Record<string, number>;
  salaryBounds: SalaryRange;
  resultCount: number;
  onReset: () => void;
  onCategoryChange: (category: string) => void;
  onNatureToggle: (nature: CareerNature) => void;
  onGrowthChange: (growth: string) => void;
  onSectorChange: (sector: SectorFilter) => void;
  onAcademicDemandChange: (demand: AcademicDemandFilter) => void;
  onSalaryChange: (range: SalaryRange | null) => void;
}

/** One labelled block in the sheet. */
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** A tappable pill — 44px min height, so it works with a thumb. */
function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors",
        selected
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border bg-card text-foreground active:bg-muted"
      )}
    >
      {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </button>
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
  onNatureToggle,
  onGrowthChange,
  onSectorChange,
  onAcademicDemandChange,
  onSalaryChange,
}: MobileFilterDrawerProps) {
  const currentMin = filters.salaryRange?.min ?? salaryBounds.min;
  const currentMax = filters.salaryRange?.max ?? salaryBounds.max;

  const handleSalary = (values: number[]) => {
    const [min, max] = values;
    if (min === salaryBounds.min && max === salaryBounds.max) onSalaryChange(null);
    else onSalaryChange({ min, max });
  };

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
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] flex h-[92dvh] flex-col",
            "rounded-t-2xl border-t bg-card text-card-foreground shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
          )}
        >
          <DialogPrimitive.Description className="sr-only">
            Narrow the career list by category, work style, growth, sector,
            academic demand and salary.
          </DialogPrimitive.Description>

          {/* Handle */}
          <div className="flex shrink-0 justify-center py-2">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b px-4 pb-2">
            <DialogPrimitive.Title className="text-base font-semibold">
              Filters
            </DialogPrimitive.Title>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-11 px-3 text-sm"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset
              </Button>
              <DialogPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close filters"
                  className="h-11 w-11"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Scrollable filter list */}
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4">
            <Section title="Category">
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <Pill
                    key={key}
                    selected={filters.category === key}
                    onClick={() => onCategoryChange(key)}
                  >
                    <span aria-hidden="true">{config.emoji}</span>
                    {config.label}
                    <span className="text-xs text-muted-foreground">
                      {categoryCounts[key] || 0}
                    </span>
                  </Pill>
                ))}
              </div>
            </Section>

            <Section
              title="Work style"
              hint="What kind of work interests you? Pick as many as you like."
            >
              <div className="flex flex-wrap gap-2">
                {NATURE_ORDER.map((nature) => (
                  <Pill
                    key={nature}
                    selected={filters.careerNatures.includes(nature)}
                    onClick={() => onNatureToggle(nature)}
                  >
                    <span aria-hidden="true">{CAREER_NATURE_EMOJIS[nature]}</span>
                    {CAREER_NATURE_LABELS[nature]}
                  </Pill>
                ))}
              </div>
            </Section>

            <Section
              title="Growth"
              hint="How fast demand is expected to grow over the next 5–10 years."
            >
              <div className="flex flex-wrap gap-2">
                {growthFilters.map((g) => (
                  <Pill
                    key={g.value}
                    selected={filters.growthFilter === g.value}
                    onClick={() => onGrowthChange(g.value)}
                  >
                    {g.label}
                  </Pill>
                ))}
              </div>
            </Section>

            <Section title="Sector">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All sectors"],
                    ["public", "Public"],
                    ["private", "Private"],
                  ] as [SectorFilter, string][]
                ).map(([value, label]) => (
                  <Pill
                    key={value}
                    selected={filters.sector === value}
                    onClick={() => onSectorChange(value)}
                  >
                    {label}
                  </Pill>
                ))}
              </div>
            </Section>

            <Section
              title="Academic demand"
              hint="How strong your grades typically need to be."
            >
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "Any demand"],
                    ["low", "Up to lower"],
                    ["moderate", "Up to moderate"],
                    ["strong", "Up to strong"],
                    ["very-strong", "All levels"],
                  ] as [AcademicDemandFilter, string][]
                ).map(([value, label]) => (
                  <Pill
                    key={value}
                    selected={filters.academicDemand === value}
                    onClick={() => onAcademicDemandChange(value)}
                  >
                    {label}
                  </Pill>
                ))}
              </div>
            </Section>

            <Section title="Salary">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="tabular-nums">{formatSalary(currentMin)}</span>
                <span className="tabular-nums">{formatSalary(currentMax)}</span>
              </div>
              {/* py-3 gives the thumbs a taller grab area than the 4px track. */}
              <div className="py-3">
                <Slider
                  value={[currentMin, currentMax]}
                  min={salaryBounds.min}
                  max={salaryBounds.max}
                  step={25}
                  onValueChange={handleSalary}
                  aria-label="Salary range"
                />
              </div>
            </Section>
          </div>

          {/* Footer — pinned, clears the iOS home indicator. */}
          <div className="shrink-0 border-t bg-card p-4 pb-[max(env(safe-area-inset-bottom,0px),1rem)]">
            <Button onClick={onClose} className="h-12 w-full text-base">
              Show {resultCount} career{resultCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
