"use client";

import { useState, useMemo, useCallback } from "react";
import type { Career, CareerCategory } from "@/lib/career-pathways";
import { CAREER_PATHWAYS, getAllCareers } from "@/lib/career-pathways";
import type {
  CareerFilterState,
  ActiveFilterChip,
  EducationLevel,
  CareerNature,
  SalaryRange,
} from "./types";
import {
  DEFAULT_FILTER_STATE,
  EDUCATION_LEVEL_LABELS,
  CAREER_NATURE_LABELS,
} from "./types";
import {
  salaryOverlaps,
  matchesEducationLevel,
  hasAllSkills,
  matchesAnyNature,
  formatSalary,
} from "./utils";

interface UseCareerFiltersReturn {
  filters: CareerFilterState;
  updateFilter: <K extends keyof CareerFilterState>(
    key: K,
    value: CareerFilterState[K]
  ) => void;
  toggleArrayFilter: (
    key: "educationLevels" | "skills" | "careerNatures",
    value: EducationLevel | CareerNature | string
  ) => void;
  clearAllFilters: () => void;
  removeFilter: (chip: ActiveFilterChip) => void;
  activeChips: ActiveFilterChip[];
  filteredCareers: Career[];
  hasActiveFilters: boolean;
  advancedFilterCount: number;
}

const categoryLabels: Record<string, string> = {
  ALL: "All",
  HEALTHCARE_LIFE_SCIENCES: "Healthcare",
  EDUCATION_TRAINING: "Education",
  TECHNOLOGY_IT: "Tech & IT",
  BUSINESS_MANAGEMENT: "Business",
  FINANCE_BANKING: "Finance",
  SALES_MARKETING: "Marketing",
  MANUFACTURING_ENGINEERING: "Engineering",
  LOGISTICS_TRANSPORT: "Logistics",
  HOSPITALITY_TOURISM: "Hospitality",
  TELECOMMUNICATIONS: "Telecom",
};

const growthLabels: Record<string, string> = {
  all: "All Growth",
  high: "High Growth",
  medium: "Moderate",
  stable: "Stable",
};

export function useCareerFilters(
  recommendationMap?: Map<string, number>
): UseCareerFiltersReturn {
  const [filters, setFilters] = useState<CareerFilterState>(DEFAULT_FILTER_STATE);

  const updateFilter = useCallback(
    <K extends keyof CareerFilterState>(key: K, value: CareerFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleArrayFilter = useCallback(
    (
      key: "educationLevels" | "skills" | "careerNatures",
      value: EducationLevel | CareerNature | string
    ) => {
      setFilters((prev) => {
        if (key === "educationLevels") {
          const arr = prev.educationLevels;
          const val = value as EducationLevel;
          const exists = arr.includes(val);
          return {
            ...prev,
            educationLevels: exists
              ? arr.filter((v) => v !== val)
              : [...arr, val],
          };
        }
        if (key === "careerNatures") {
          const arr = prev.careerNatures;
          const val = value as CareerNature;
          const exists = arr.includes(val);
          return {
            ...prev,
            careerNatures: exists
              ? arr.filter((v) => v !== val)
              : [...arr, val],
          };
        }
        // key === "skills"
        const arr = prev.skills;
        const val = value as string;
        const exists = arr.includes(val);
        return {
          ...prev,
          skills: exists ? arr.filter((v) => v !== val) : [...arr, val],
        };
      });
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  const removeFilter = useCallback((chip: ActiveFilterChip) => {
    switch (chip.type) {
      case "category":
        setFilters((prev) => ({ ...prev, category: "ALL" }));
        break;
      case "search":
        setFilters((prev) => ({ ...prev, searchQuery: "" }));
        break;
      case "growth":
        setFilters((prev) => ({ ...prev, growthFilter: "all" }));
        break;
      case "salary":
        setFilters((prev) => ({ ...prev, salaryRange: null }));
        break;
      case "education":
        setFilters((prev) => ({
          ...prev,
          educationLevels: prev.educationLevels.filter(
            (e) => e !== chip.value
          ),
        }));
        break;
      case "skill":
        setFilters((prev) => ({
          ...prev,
          skills: prev.skills.filter((s) => s !== chip.value),
        }));
        break;
      case "nature":
        setFilters((prev) => ({
          ...prev,
          careerNatures: prev.careerNatures.filter((n) => n !== chip.value),
        }));
        break;
    }
  }, []);

  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    if (filters.category !== "ALL") {
      chips.push({
        type: "category",
        label: categoryLabels[filters.category] || filters.category,
        value: filters.category,
      });
    }

    if (filters.searchQuery.trim()) {
      chips.push({
        type: "search",
        label: `"${filters.searchQuery}"`,
        value: filters.searchQuery,
      });
    }

    if (filters.growthFilter !== "all") {
      chips.push({
        type: "growth",
        label: growthLabels[filters.growthFilter] || filters.growthFilter,
        value: filters.growthFilter,
      });
    }

    if (filters.salaryRange) {
      chips.push({
        type: "salary",
        label: `${formatSalary(filters.salaryRange.min)} - ${formatSalary(filters.salaryRange.max)}`,
        value: filters.salaryRange,
      });
    }

    for (const edu of filters.educationLevels) {
      chips.push({
        type: "education",
        label: EDUCATION_LEVEL_LABELS[edu],
        value: edu,
      });
    }

    for (const skill of filters.skills) {
      chips.push({
        type: "skill",
        label: skill,
        value: skill,
      });
    }

    for (const nature of filters.careerNatures) {
      chips.push({
        type: "nature",
        label: CAREER_NATURE_LABELS[nature],
        value: nature,
      });
    }

    return chips;
  }, [filters]);

  const filteredCareers = useMemo(() => {
    let careers: Career[];

    // Start with category filter
    if (filters.category === "ALL") {
      careers = getAllCareers();
    } else {
      careers = CAREER_PATHWAYS[filters.category as CareerCategory] || [];
    }

    // Apply search
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      careers = careers.filter(
        (career) =>
          career.title.toLowerCase().includes(query) ||
          career.description.toLowerCase().includes(query) ||
          career.keySkills.some((skill) =>
            skill.toLowerCase().includes(query)
          )
      );
    }

    // Apply growth filter
    if (filters.growthFilter !== "all") {
      careers = careers.filter(
        (career) => career.growthOutlook === filters.growthFilter
      );
    }

    // Apply salary range filter
    if (filters.salaryRange) {
      careers = careers.filter((career) =>
        salaryOverlaps(career, filters.salaryRange!)
      );
    }

    // Apply education level filter
    if (filters.educationLevels.length > 0) {
      careers = careers.filter((career) =>
        matchesEducationLevel(career, filters.educationLevels)
      );
    }

    // Apply skills filter (AND - must have all selected skills)
    if (filters.skills.length > 0) {
      careers = careers.filter((career) =>
        hasAllSkills(career, filters.skills)
      );
    }

    // Apply career nature filter (OR - matches any selected nature)
    if (filters.careerNatures.length > 0) {
      careers = careers.filter((career) =>
        matchesAnyNature(career, filters.careerNatures)
      );
    }

    // Sort: by match score (if available), then by title
    return careers.sort((a, b) => {
      if (recommendationMap) {
        const scoreA = recommendationMap.get(a.id) || 0;
        const scoreB = recommendationMap.get(b.id) || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
      }
      return a.title.localeCompare(b.title);
    });
  }, [filters, recommendationMap]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.category !== "ALL" ||
      filters.searchQuery.trim() !== "" ||
      filters.growthFilter !== "all" ||
      filters.salaryRange !== null ||
      filters.educationLevels.length > 0 ||
      filters.skills.length > 0 ||
      filters.careerNatures.length > 0
    );
  }, [filters]);

  const advancedFilterCount = useMemo(() => {
    let count = 0;
    if (filters.salaryRange) count++;
    count += filters.educationLevels.length;
    count += filters.skills.length;
    count += filters.careerNatures.length;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    toggleArrayFilter,
    clearAllFilters,
    removeFilter,
    activeChips,
    filteredCareers,
    hasActiveFilters,
    advancedFilterCount,
  };
}
