"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ActiveFilterChip } from "@/lib/career-filters/types";

interface CareerActiveChipsProps {
  chips: ActiveFilterChip[];
  onRemove: (chip: ActiveFilterChip) => void;
  onClearAll: () => void;
}

const chipTypeColors: Record<ActiveFilterChip["type"], string> = {
  category: "bg-blue-500/10 text-blue-600 border-blue-200",
  search: "bg-purple-500/10 text-purple-600 border-purple-200",
  growth: "bg-green-500/10 text-green-600 border-green-200",
  salary: "bg-amber-500/10 text-amber-600 border-amber-200",
  education: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  skill: "bg-pink-500/10 text-pink-600 border-pink-200",
  nature: "bg-teal-500/10 text-teal-600 border-teal-200",
  entryLevel: "bg-orange-500/10 text-orange-600 border-orange-200",
};

const chipTypeLabels: Record<ActiveFilterChip["type"], string> = {
  category: "Category",
  search: "Search",
  growth: "Growth",
  salary: "Salary",
  education: "Education",
  skill: "Skill",
  nature: "Type",
  entryLevel: "Level",
};

export function CareerActiveChips({
  chips,
  onRemove,
  onClearAll,
}: CareerActiveChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] text-muted-foreground font-medium">
        Filters:
      </span>
      {chips.map((chip, index) => (
        <Badge
          key={`${chip.type}-${index}`}
          variant="outline"
          className={`text-[10px] pl-2 pr-1 py-0.5 gap-1 border ${chipTypeColors[chip.type]}`}
        >
          <span className="opacity-70">{chipTypeLabels[chip.type]}:</span>
          {chip.label}
          <button
            onClick={() => onRemove(chip)}
            className="hover:bg-muted/50 rounded-full p-0.5 ml-0.5"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-5 px-2 text-[10px] text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
