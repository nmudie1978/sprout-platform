"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Sparkles,
  Bookmark,
  Code,
  Heart,
  Wrench,
  Palette,
  MessageSquare,
} from "lucide-react";
import type { FilterState, Category, Difficulty, UserStats } from "@/lib/interview-prep/types";

interface FiltersToolbarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onGenerateClick: () => void;
  stats: UserStats;
}

const categories: { id: Category | "All"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "All", label: "All", icon: MessageSquare },
  { id: "General", label: "General", icon: MessageSquare },
  { id: "Tech", label: "Tech", icon: Code },
  { id: "Healthcare", label: "Health", icon: Heart },
  { id: "Green", label: "Green", icon: Wrench },
  { id: "Creative", label: "Creative", icon: Palette },
];

const difficulties: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];

const difficultyColors: Record<string, string> = {
  All: "bg-muted",
  Easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function FiltersToolbar({ filters, onFiltersChange, onGenerateClick, stats }: FiltersToolbarProps) {
  return (
    <div className="space-y-2">
      {/* Top row: Search + Generate */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Button
          size="sm"
          onClick={onGenerateClick}
          className="h-8 text-xs gap-1"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate
        </Button>
      </div>

      {/* Second row: Category + Difficulty + Saved filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Category Pills */}
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onFiltersChange({ ...filters, category: cat.id })}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                  filters.category === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3 w-3" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Difficulty Pills */}
        <div className="flex gap-1">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => onFiltersChange({ ...filters, difficulty: diff })}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                filters.difficulty === diff
                  ? difficultyColors[diff]
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {diff === "All" ? "All" : diff.charAt(0)}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Saved Filter */}
        <button
          onClick={() => onFiltersChange({ ...filters, showSavedOnly: !filters.showSavedOnly })}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
            filters.showSavedOnly
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <Bookmark className="h-3 w-3" />
          Saved
        </button>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Practiced: {stats.totalPracticed}</span>
          <span>Saved: {stats.totalSaved}</span>
        </div>
      </div>
    </div>
  );
}
