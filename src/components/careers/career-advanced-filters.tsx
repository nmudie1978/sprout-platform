"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { CareerSalarySlider } from "./career-salary-slider";
import { CareerSkillAutocomplete } from "./career-skill-autocomplete";
import type {
  CareerFilterState,
  EducationLevel,
  CareerNature,
  SalaryRange,
} from "@/lib/career-filters/types";
import {
  EDUCATION_LEVEL_LABELS,
  CAREER_NATURE_LABELS,
  CAREER_NATURE_EMOJIS,
} from "@/lib/career-filters/types";

interface CareerAdvancedFiltersProps {
  filters: CareerFilterState;
  salaryBounds: SalaryRange;
  allSkills: string[];
  onSalaryChange: (range: SalaryRange | null) => void;
  onEducationToggle: (level: EducationLevel) => void;
  onSkillsChange: (skills: string[]) => void;
  onNatureToggle: (nature: CareerNature) => void;
  onEntryLevelChange: (enabled: boolean) => void;
  isOpen: boolean;
}

const educationLevels: EducationLevel[] = [
  "no-formal",
  "vocational",
  "bachelor",
  "master",
  "doctorate",
];

const careerNatures: CareerNature[] = [
  "hands-on",
  "analytical",
  "people-focused",
  "creative",
  "technical",
];

export function CareerAdvancedFilters({
  filters,
  salaryBounds,
  allSkills,
  onSalaryChange,
  onEducationToggle,
  onSkillsChange,
  onNatureToggle,
  onEntryLevelChange,
  isOpen,
}: CareerAdvancedFiltersProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-5">
            {/* Salary Range */}
            <CareerSalarySlider
              bounds={salaryBounds}
              value={filters.salaryRange}
              onChange={onSalaryChange}
            />

            {/* Education Level */}
            <div className="space-y-2">
              <span className="text-xs font-medium">Education Level</span>
              <div className="flex flex-wrap gap-1.5">
                {educationLevels.map((level) => {
                  const isSelected = filters.educationLevels.includes(level);
                  return (
                    <button
                      key={level}
                      onClick={() => onEducationToggle(level)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border hover:bg-muted"
                      }`}
                    >
                      {EDUCATION_LEVEL_LABELS[level]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills Autocomplete */}
            <CareerSkillAutocomplete
              allSkills={allSkills}
              selectedSkills={filters.skills}
              onSkillsChange={onSkillsChange}
            />

            {/* Career Type/Nature */}
            <div className="space-y-2">
              <span className="text-xs font-medium">Career Type</span>
              <div className="flex flex-wrap gap-1.5">
                {careerNatures.map((nature) => {
                  const isSelected = filters.careerNatures.includes(nature);
                  return (
                    <button
                      key={nature}
                      onClick={() => onNatureToggle(nature)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border hover:bg-muted"
                      }`}
                    >
                      <span>{CAREER_NATURE_EMOJIS[nature]}</span>
                      {CAREER_NATURE_LABELS[nature]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entry Level Only */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="entry-level"
                checked={filters.entryLevelOnly}
                onCheckedChange={(checked) =>
                  onEntryLevelChange(checked === true)
                }
              />
              <label
                htmlFor="entry-level"
                className="text-xs font-medium cursor-pointer"
              >
                Entry-level only
                <span className="text-muted-foreground ml-1">
                  (No higher education required)
                </span>
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
