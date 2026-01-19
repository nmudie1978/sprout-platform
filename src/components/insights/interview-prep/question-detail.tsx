"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Bookmark,
  Play,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  Star,
  ArrowLeft,
} from "lucide-react";
import type { QuestionWithState, UserQuestionState } from "@/lib/interview-prep/types";

interface QuestionDetailProps {
  question: QuestionWithState;
  onBack?: () => void; // For mobile
  onSave: (questionId: string) => void;
  onMarkPracticed: (questionId: string, confidence?: number, notes?: string) => void;
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function QuestionDetail({ question, onBack, onSave, onMarkPracticed }: QuestionDetailProps) {
  const [showTip, setShowTip] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const [notes, setNotes] = useState(question.state?.notes || "");
  const [confidence, setConfidence] = useState(question.state?.confidence || 0);

  const isSaved = question.state?.saved || false;
  const isPracticed = (question.state?.practicedCount || 0) > 0;

  // Timer for practice mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPracticing) {
      interval = setInterval(() => {
        setPracticeTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPracticing]);

  // Reset state when question changes
  useEffect(() => {
    setShowTip(false);
    setIsPracticing(false);
    setPracticeTime(0);
    setNotes(question.state?.notes || "");
    setConfidence(question.state?.confidence || 0);
  }, [question.id, question.state?.notes, question.state?.confidence]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishPractice = () => {
    setIsPracticing(false);
    onMarkPracticed(question.id, confidence, notes);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-2 pb-3 border-b">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 -ml-1 rounded hover:bg-muted lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${difficultyColors[question.difficulty]} text-[10px]`}>
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {question.category}
            </Badge>
            {isPracticed && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-[10px]">
                <Check className="h-2.5 w-2.5 mr-0.5" />
                Practiced
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-sm leading-tight">{question.questionText}</h3>
        </div>
        <button
          onClick={() => onSave(question.id)}
          className={`p-1.5 rounded transition-colors ${
            isSaved ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {/* Answer Framework */}
        {question.answerHint && (
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <p className="text-[10px] font-medium text-blue-700 dark:text-blue-400 mb-1">Answer Framework</p>
            <p className="text-xs text-blue-600 dark:text-blue-300">{question.answerHint}</p>
          </div>
        )}

        {/* Tip (collapsible) */}
        {question.tip && (
          <div className="border rounded-md">
            <button
              onClick={() => setShowTip(!showTip)}
              className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted/50 transition-colors"
            >
              <Lightbulb className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
              <span className="text-xs font-medium flex-1">Tips for this question</span>
              {showTip ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
            {showTip && (
              <div className="px-2 pb-2">
                <p className="text-xs text-muted-foreground pl-5">{question.tip}</p>
              </div>
            )}
          </div>
        )}

        {/* Practice Mode */}
        {isPracticing ? (
          <div className="space-y-3 p-3 rounded-lg border-2 border-primary/20 bg-primary/5">
            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5 text-primary" />
              <span>{formatTime(practiceTime)}</span>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                Your notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down key points for your answer..."
                className="text-xs min-h-[60px] resize-none"
              />
            </div>

            {/* Confidence Rating */}
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                How confident do you feel?
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setConfidence(rating)}
                    className={`p-1 rounded transition-colors ${
                      confidence >= rating
                        ? "text-amber-500"
                        : "text-muted-foreground hover:text-amber-400"
                    }`}
                  >
                    <Star
                      className={`h-5 w-5 ${confidence >= rating ? "fill-current" : ""}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleFinishPractice} className="w-full" size="sm">
              <Check className="h-3.5 w-3.5 mr-1" />
              Done Practicing
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsPracticing(true)}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            Start Practice
          </Button>
        )}

        {/* Previous practice info */}
        {isPracticed && !isPracticing && question.state && (
          <div className="text-[10px] text-muted-foreground text-center">
            Practiced {question.state.practicedCount} time{question.state.practicedCount > 1 ? "s" : ""}
            {question.state.confidence && (
              <> • Confidence: {question.state.confidence}/5</>
            )}
          </div>
        )}

        {/* Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
