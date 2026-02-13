"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Square,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { CareerFilterState, CareerNature, SalaryRange } from "@/lib/career-filters/types";
import { formatSalary } from "@/lib/career-filters/utils";
import type { ViewMode } from "@/components/career-card-v2";
import { WorkStylePills } from "@/components/careers/work-style-pills";

const categoryConfig: Record<string, { label: string; emoji: string }> = {
  ALL: { label: "All", emoji: "🌟" },
  HEALTHCARE_LIFE_SCIENCES: { label: "Healthcare", emoji: "🏥" },
  EDUCATION_TRAINING: { label: "Education", emoji: "📚" },
  TECHNOLOGY_IT: { label: "Tech & IT", emoji: "💻" },
  BUSINESS_MANAGEMENT: { label: "Business", emoji: "💼" },
  FINANCE_BANKING: { label: "Finance", emoji: "🏦" },
  SALES_MARKETING: { label: "Marketing", emoji: "📣" },
  MANUFACTURING_ENGINEERING: { label: "Engineering", emoji: "⚙️" },
  LOGISTICS_TRANSPORT: { label: "Logistics", emoji: "🚛" },
  HOSPITALITY_TOURISM: { label: "Hospitality", emoji: "🏨" },
};

const growthFilters = [
  { value: "all", label: "All Growth" },
  { value: "high", label: "High Growth" },
  { value: "medium", label: "Moderate" },
  { value: "stable", label: "Stable" },
];

interface CareerFilterBarProps {
  filters: CareerFilterState;
  categoryCounts: Record<string, number>;
  hasActiveFilters: boolean;
  advancedFilterCount: number;
  showAdvancedFilters: boolean;
  viewMode: ViewMode;
  salaryBounds: SalaryRange;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onGrowthChange: (growth: string) => void;
  onSalaryChange: (range: SalaryRange | null) => void;
  onToggleAdvanced: () => void;
  onClearAll: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  selectedNatures: CareerNature[];
  onNatureToggle: (nature: CareerNature) => void;
}

export function CareerFilterBar({
  filters,
  categoryCounts,
  hasActiveFilters,
  advancedFilterCount,
  showAdvancedFilters,
  viewMode,
  salaryBounds,
  onCategoryChange,
  onSearchChange,
  onGrowthChange,
  onSalaryChange,
  onToggleAdvanced,
  onClearAll,
  onViewModeChange,
  selectedNatures,
  onNatureToggle,
}: CareerFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync debounced search to parent
  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Sync parent search to local (for external clears)
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

  return (
    <div className="sticky top-0 z-40 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b mb-4">
      {/* All Filters Container */}
      <div className="border-2 border-purple-500/20 rounded-lg p-3 bg-muted/20">
        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                filters.category === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border hover:bg-muted/80"
              }`}
            >
              <span>{config.emoji}</span>
              {config.label}
              <span
                className={`ml-0.5 px-1 py-0 rounded-full text-[9px] ${
                  filters.category === key ? "bg-white/20" : "bg-muted"
                }`}
              >
                {categoryCounts[key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Growth Filter + View Toggle Row */}
        <div className="flex items-center gap-2 mt-2">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search careers or skills..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-8 pl-7 text-xs"
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

          {/* Growth Filter */}
          <select
            value={filters.growthFilter}
            onChange={(e) => onGrowthChange(e.target.value)}
            className="h-8 px-2 rounded-md border bg-background text-xs"
          >
            {growthFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          {/* More Filters Button */}
          <Button
            variant={showAdvancedFilters ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleAdvanced}
            className="h-8 px-2 text-xs gap-1"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="hidden sm:inline">Filters</span>
            {advancedFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[9px] bg-primary text-primary-foreground"
              >
                {advancedFilterCount}
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md p-0.5 bg-background ml-auto">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => onViewModeChange("list")}
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "small" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => onViewModeChange("small")}
              title="Small cards"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "large" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => onViewModeChange("large")}
              title="Large cards"
            >
              <Square className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Compact Salary Slider */}
        <div className="mt-3 pt-3 border-t border-purple-500/10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
              Salary
            </span>
            <div className="flex-1 max-w-[200px]">
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
        </div>

        {/* Work Style Preferences */}
        <div className="mt-3 pt-3 border-t border-purple-500/10">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            What kind of work interests you?
          </p>
          <WorkStylePills selected={selectedNatures} onToggle={onNatureToggle} />
        </div>
      </div>
    </div>
  );
}
