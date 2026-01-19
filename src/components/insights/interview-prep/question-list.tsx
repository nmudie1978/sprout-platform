"use client";

import { Badge } from "@/components/ui/badge";
import { Bookmark, Check, ChevronRight } from "lucide-react";
import type { QuestionWithState } from "@/lib/interview-prep/types";

interface QuestionListProps {
  questions: QuestionWithState[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleSave: (id: string) => void;
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function QuestionList({ questions, selectedId, onSelect, onToggleSave }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No questions match your filters</p>
        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or generate new questions</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {questions.map((question) => {
        const isSelected = selectedId === question.id;
        const isSaved = question.state?.saved || false;
        const isPracticed = (question.state?.practicedCount || 0) > 0;

        return (
          <div
            key={question.id}
            className={`group flex items-center gap-2 py-2 px-2 cursor-pointer transition-colors ${
              isSelected ? "bg-primary/5" : "hover:bg-muted/50"
            }`}
            onClick={() => onSelect(question.id)}
          >
            {/* Difficulty Badge */}
            <Badge
              className={`${difficultyColors[question.difficulty]} text-[9px] px-1.5 py-0 font-medium flex-shrink-0`}
            >
              {question.difficulty.charAt(0)}
            </Badge>

            {/* Question Text */}
            <span className={`text-xs flex-1 truncate ${isSelected ? "font-medium" : ""}`}>
              {question.questionText}
            </span>

            {/* Status Icons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {isPracticed && (
                <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-green-600" />
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(question.id);
                }}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  isSaved
                    ? "text-amber-500"
                    : "text-muted-foreground opacity-0 group-hover:opacity-100"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
              </button>

              <ChevronRight
                className={`h-3.5 w-3.5 text-muted-foreground transition-opacity ${
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
