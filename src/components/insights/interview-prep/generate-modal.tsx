"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, X, Plus, Minus } from "lucide-react";
import type { Category, GenerateOptions } from "@/lib/interview-prep/types";

interface GenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (options: GenerateOptions) => void;
  defaultCategory?: Category;
  defaultRole?: string;
}

const categories: Category[] = ["General", "Tech", "Healthcare", "Green", "Creative"];

const focusAreaSuggestions: Record<Category, string[]> = {
  General: ["communication", "teamwork", "leadership", "problem-solving", "motivation"],
  Tech: ["debugging", "coding", "system-design", "collaboration", "learning"],
  Healthcare: ["patient-care", "empathy", "stress", "teamwork", "ethics"],
  Green: ["safety", "technical", "teamwork", "sustainability", "certifications"],
  Creative: ["portfolio", "feedback", "process", "deadlines", "client-work"],
};

export function GenerateModal({
  open,
  onOpenChange,
  onGenerate,
  defaultCategory = "General",
  defaultRole = "",
}: GenerateModalProps) {
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [roleTarget, setRoleTarget] = useState(defaultRole);
  const [difficultyMix, setDifficultyMix] = useState({ easy: 2, medium: 3, hard: 1 });
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [customFocus, setCustomFocus] = useState("");

  const totalQuestions = difficultyMix.easy + difficultyMix.medium + difficultyMix.hard;

  const adjustDifficulty = (level: "easy" | "medium" | "hard", delta: number) => {
    const newValue = Math.max(0, Math.min(6, difficultyMix[level] + delta));
    setDifficultyMix({ ...difficultyMix, [level]: newValue });
  };

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((a) => a !== area));
    } else if (focusAreas.length < 3) {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const addCustomFocus = () => {
    if (customFocus.trim() && focusAreas.length < 3 && !focusAreas.includes(customFocus.trim())) {
      setFocusAreas([...focusAreas, customFocus.trim()]);
      setCustomFocus("");
    }
  };

  const handleGenerate = () => {
    onGenerate({
      category,
      roleTarget: roleTarget || undefined,
      difficultyMix,
      focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
      count: totalQuestions,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Generate New Questions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category */}
          <div>
            <Label className="text-xs">Category</Label>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setFocusAreas([]);
                  }}
                  className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Role Target */}
          <div>
            <Label htmlFor="role" className="text-xs">
              Target Role (optional)
            </Label>
            <Input
              id="role"
              value={roleTarget}
              onChange={(e) => setRoleTarget(e.target.value)}
              placeholder="e.g., Software Engineer, Nurse"
              className="h-8 text-xs mt-1.5"
            />
          </div>

          {/* Difficulty Mix */}
          <div>
            <Label className="text-xs">Difficulty Mix ({totalQuestions} questions)</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <div
                  key={level}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <span className={`text-[10px] font-medium capitalize ${
                    level === "easy" ? "text-green-600" :
                    level === "medium" ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {level}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustDifficulty(level, -1)}
                      className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted/80"
                      disabled={difficultyMix[level] === 0}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-xs font-medium">
                      {difficultyMix[level]}
                    </span>
                    <button
                      onClick={() => adjustDifficulty(level, 1)}
                      className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted/80"
                      disabled={difficultyMix[level] === 6}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <Label className="text-xs">Focus Areas (optional, max 3)</Label>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {focusAreaSuggestions[category].map((area) => (
                <button
                  key={area}
                  onClick={() => toggleFocusArea(area)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                    focusAreas.includes(area)
                      ? "bg-primary/20 text-primary border border-primary"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* Custom focus input */}
            <div className="flex gap-1 mt-2">
              <Input
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="Add custom focus..."
                className="h-7 text-[10px]"
                onKeyDown={(e) => e.key === "Enter" && addCustomFocus()}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={addCustomFocus}
                disabled={!customFocus.trim() || focusAreas.length >= 3}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Selected focus areas */}
            {focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {focusAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="text-[10px] gap-1 pr-1"
                  >
                    {area}
                    <button
                      onClick={() => toggleFocusArea(area)}
                      className="hover:text-destructive"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            className="w-full"
            disabled={totalQuestions === 0}
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Generate {totalQuestions} Questions
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            Questions are generated based on your selections
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
