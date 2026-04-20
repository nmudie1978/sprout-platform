"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { CareerFilterState, CareerNature, SalaryRange, SectorFilter, AcademicDemandFilter } from "@/lib/career-filters/types";
import { CAREER_NATURE_LABELS, CAREER_NATURE_EMOJIS } from "@/lib/career-filters/types";
import { formatSalary } from "@/lib/career-filters/utils";

const categoryConfig: Record<string, { label: string; emoji: string }> = {
  ALL: { label: "All", emoji: "\u{1F31F}" },
  HEALTHCARE_LIFE_SCIENCES: { label: "Healthcare", emoji: "\u{1F3E5}" },
  EDUCATION_TRAINING: { label: "Education", emoji: "\u{1F4DA}" },
  TECHNOLOGY_IT: { label: "Tech & IT", emoji: "\u{1F4BB}" },
  ARTIFICIAL_INTELLIGENCE: { label: "AI", emoji: "\u{1F916}" },
  BUSINESS_MANAGEMENT: { label: "Business", emoji: "\u{1F4BC}" },
  FINANCE_BANKING: { label: "Finance", emoji: "\u{1F3E6}" },
  SALES_MARKETING: { label: "Marketing", emoji: "\u{1F4E3}" },
  MANUFACTURING_ENGINEERING: { label: "Engineering", emoji: "\u2699\uFE0F" },
  LOGISTICS_TRANSPORT: { label: "Logistics", emoji: "\u{1F69B}" },
  HOSPITALITY_TOURISM: { label: "Hospitality", emoji: "\u{1F3E8}" },
  MILITARY_DEFENCE: { label: "Military", emoji: "\u{1FA96}" },
  REAL_ESTATE_PROPERTY: { label: "Property", emoji: "\u{1F3E1}" },
  SOCIAL_CARE_COMMUNITY: { label: "Social Care", emoji: "\u{1F91D}" },
  CONSTRUCTION_TRADES: { label: "Construction", emoji: "\u{1F3D7}\uFE0F" },
};

const growthFilters = [
  { value: "all", label: "All Growth" },
  { value: "high", label: "High Growth" },
  { value: "medium", label: "Moderate" },
  { value: "stable", label: "Stable" },
];

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

// ── Dropdown wrapper ────────────────────────────────────────────────

function FilterDropdown({
  label,
  children,
  badge,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  badge?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-10 sm:h-8 px-3 sm:px-2.5 rounded-md border border-white/20 dark:border-border bg-white/15 dark:bg-background text-xs text-white dark:text-foreground hover:bg-white/25 dark:hover:bg-muted/80 transition-colors whitespace-nowrap overflow-hidden max-w-[180px]"
        title={typeof label === "string" ? label : undefined}
      >
        {label}
        {badge !== undefined && badge > 0 && (
          <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-primary text-primary-foreground">
            {badge}
          </Badge>
        )}
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[200px] rounded-lg border bg-popover shadow-lg py-1 max-h-[280px] overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
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
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-3 py-2.5 sm:py-1.5 text-xs text-left hover:bg-muted/80 transition-colors ${
        selected ? "text-primary font-medium" : "text-foreground"
      }`}
    >
      <span className={`flex items-center justify-center h-3.5 w-3.5 shrink-0 rounded border ${
        selected ? "bg-primary border-primary" : "border-muted-foreground/30"
      }`}>
        {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────

interface CareerFilterBarProps {
  filters: CareerFilterState;
  categoryCounts: Record<string, number>;
  hasActiveFilters: boolean;
  salaryBounds: SalaryRange;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onGrowthChange: (growth: string) => void;
  onSectorChange: (sector: SectorFilter) => void;
  onAcademicDemandChange: (demand: AcademicDemandFilter) => void;
  onSalaryChange: (range: SalaryRange | null) => void;
  onClearAll: () => void;
  selectedNatures: CareerNature[];
  onNatureToggle: (nature: CareerNature) => void;
}

export function CareerFilterBar({
  filters,
  categoryCounts,
  hasActiveFilters,
  salaryBounds,
  onCategoryChange,
  onSearchChange,
  onGrowthChange,
  onSectorChange,
  onAcademicDemandChange,
  onSalaryChange,
  onClearAll,
  selectedNatures,
  onNatureToggle,
}: CareerFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  useEffect(() => {
    if (filters.searchQuery !== localSearch && filters.searchQuery === "") {
      setLocalSearch("");
    }
  }, [filters.searchQuery]);

  const currentSalaryMin = filters.salaryRange?.min ?? salaryBounds.min;
  const currentSalaryMax = filters.salaryRange?.max ?? salaryBounds.max;
  const salaryIsActive = filters.salaryRange !== null;

  const handleSalaryChange = (values: number[]) => {
    const [min, max] = values;
    if (min === salaryBounds.min && max === salaryBounds.max) {
      onSalaryChange(null);
    } else {
      onSalaryChange({ min, max });
    }
  };

  const activeCategoryLabel =
    filters.category === "ALL"
      ? "Category"
      : categoryConfig[filters.category]?.label || "Category";

  return (
    <div className="sticky top-0 z-40 -mx-3 px-3 sm:-mx-4 sm:px-4 py-2 bg-white/10 dark:bg-background/80 backdrop-blur-md border-b border-white/15 dark:border-border/40 mb-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:w-auto sm:min-w-[160px] sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-3.5 sm:w-3.5 text-white/70 dark:text-muted-foreground" />
          <Input
            placeholder="Search careers or skills..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-10 sm:h-8 pl-8 sm:pl-7 text-sm sm:text-xs bg-white/15 dark:bg-background border-white/20 dark:border-input text-white dark:text-foreground placeholder:text-white/60 dark:placeholder:text-muted-foreground"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <FilterDropdown
          label={<span>{filters.category !== "ALL" ? categoryConfig[filters.category]?.emoji + " " : ""}{activeCategoryLabel}</span>}
        >
          {Object.entries(categoryConfig).map(([key, config]) => (
            <DropdownItem
              key={key}
              selected={filters.category === key}
              onClick={() => onCategoryChange(key)}
            >
              <span className="mr-1">{config.emoji}</span>
              {config.label}
              <span className="ml-auto text-muted-foreground pl-2">{categoryCounts[key] || 0}</span>
            </DropdownItem>
          ))}
        </FilterDropdown>

        {/* Work Style Multi-select Dropdown */}
        <FilterDropdown
          label="Work Style"
          badge={selectedNatures.length || undefined}
        >
          {NATURE_ORDER.map((nature) => (
            <DropdownItem
              key={nature}
              selected={selectedNatures.includes(nature)}
              onClick={() => onNatureToggle(nature)}
            >
              <span className="mr-1">{CAREER_NATURE_EMOJIS[nature]}</span>
              {CAREER_NATURE_LABELS[nature]}
            </DropdownItem>
          ))}
        </FilterDropdown>

        {/* Growth Filter */}
        <select
          value={filters.growthFilter}
          onChange={(e) => onGrowthChange(e.target.value)}
          className="h-10 sm:h-8 px-2.5 sm:px-2 rounded-md border border-white/20 dark:border-border bg-white/15 dark:bg-background text-xs text-white dark:text-foreground [&>option]:text-foreground"
          title="Growth reflects how fast demand for this career is expected to increase over the next 5–10 years"
        >
          {growthFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>

        {/* Sector */}
        <select
          value={filters.sector}
          onChange={(e) => onSectorChange(e.target.value as SectorFilter)}
          className="h-10 sm:h-8 px-2.5 sm:px-2 rounded-md border border-white/20 dark:border-border bg-white/15 dark:bg-background text-xs text-white dark:text-foreground [&>option]:text-foreground"
          title="Filter by public or private sector"
        >
          <option value="all">All Sectors</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        {/* Academic Demand */}
        <select
          value={filters.academicDemand}
          onChange={(e) => onAcademicDemandChange(e.target.value as AcademicDemandFilter)}
          className="h-10 sm:h-8 px-2.5 sm:px-2 rounded-md border border-white/20 dark:border-border bg-white/15 dark:bg-background text-xs text-white dark:text-foreground [&>option]:text-foreground"
          title="Filter by academic demand level (Norwegian 1–6 grading)"
        >
          <option value="all">Any demand</option>
          <option value="low">Up to lower</option>
          <option value="moderate">Up to moderate</option>
          <option value="strong">Up to strong</option>
          <option value="very-strong">All levels</option>
        </select>

        {/* Salary */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/80 dark:text-muted-foreground whitespace-nowrap">Salary</span>
          <div className="w-[120px]">
            <Slider
              value={[currentSalaryMin, currentSalaryMax]}
              min={salaryBounds.min}
              max={salaryBounds.max}
              step={25}
              onValueChange={handleSalaryChange}
              className="cursor-pointer"
            />
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {salaryIsActive ? (
              <span className="text-primary font-medium">
                {formatSalary(currentSalaryMin)}-{formatSalary(currentSalaryMax)}
              </span>
            ) : (
              `${formatSalary(salaryBounds.min)}-${formatSalary(salaryBounds.max)}`
            )}
          </span>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2 text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}

      </div>
    </div>
  );
}
