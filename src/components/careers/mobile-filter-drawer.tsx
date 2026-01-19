"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CareerFilterState;
  salaryBounds: SalaryRange;
  allSkills: string[];
  resultCount: number;
  onSalaryChange: (range: SalaryRange | null) => void;
  onEducationToggle: (level: EducationLevel) => void;
  onSkillsChange: (skills: string[]) => void;
  onNatureToggle: (nature: CareerNature) => void;
  onEntryLevelChange: (enabled: boolean) => void;
  onReset: () => void;
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

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  salaryBounds,
  allSkills,
  resultCount,
  onSalaryChange,
  onEducationToggle,
  onSkillsChange,
  onNatureToggle,
  onEntryLevelChange,
  onReset,
}: MobileFilterDrawerProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] bg-background border-t rounded-t-xl shadow-lg",
            "max-h-[85vh] flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
          )}
        >
          {/* Handle bar */}
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 border-b">
            <DialogPrimitive.Title className="text-sm font-semibold">
              Filters
            </DialogPrimitive.Title>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-7 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <X className="h-4 w-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
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
                      className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
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
                      className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEntryLevelChange(!filters.entryLevelOnly)}
                className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                  filters.entryLevelOnly
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <span className="text-xs font-medium block">
                  Entry-level only
                </span>
                <span className="text-[10px] text-muted-foreground">
                  No higher education required
                </span>
              </button>
            </div>
          </div>

          {/* Footer with results count */}
          <div className="border-t p-4 bg-background">
            <Button onClick={onClose} className="w-full" size="sm">
              Show {resultCount} career{resultCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
