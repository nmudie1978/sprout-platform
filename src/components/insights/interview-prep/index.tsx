"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { FiltersToolbar } from "./filters-toolbar";
import { QuestionList } from "./question-list";
import { QuestionDetail } from "./question-detail";
import { GenerateModal } from "./generate-modal";
import { getSeededQuestions, generateQuestionSet } from "@/lib/interview-prep/mock-generator";
import type {
  QuestionWithState,
  FilterState,
  UserQuestionState,
  UserStats,
  GenerateOptions,
  Category,
} from "@/lib/interview-prep/types";

export function InterviewPrepBank() {
  // Core state
  const [questions, setQuestions] = useState<QuestionWithState[]>([]);
  const [userStates, setUserStates] = useState<Record<string, UserQuestionState>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category: "All",
    difficulty: "All",
    searchQuery: "",
    showSavedOnly: false,
  });

  // Load initial seeded questions
  useEffect(() => {
    const seeded = getSeededQuestions("All");
    setQuestions(seeded.map(q => ({ ...q, state: undefined })));
  }, []);

  // Merge questions with user states
  const questionsWithState = useMemo((): QuestionWithState[] => {
    return questions.map(q => ({
      ...q,
      state: userStates[q.id],
    }));
  }, [questions, userStates]);

  // Apply filters
  const filteredQuestions = useMemo(() => {
    return questionsWithState.filter(q => {
      // Category filter
      if (filters.category !== "All" && q.category !== filters.category) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty !== "All" && q.difficulty !== filters.difficulty) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(search);
        const matchesTags = q.tags.some(t => t.toLowerCase().includes(search));
        if (!matchesText && !matchesTags) {
          return false;
        }
      }

      // Saved only filter
      if (filters.showSavedOnly && !q.state?.saved) {
        return false;
      }

      return true;
    });
  }, [questionsWithState, filters]);

  // Get selected question
  const selectedQuestion = useMemo(() => {
    if (!selectedId) return null;
    return questionsWithState.find(q => q.id === selectedId) || null;
  }, [selectedId, questionsWithState]);

  // Calculate stats
  const stats = useMemo((): UserStats => {
    const states = Object.values(userStates);
    const practiced = states.filter(s => s.practicedCount > 0);
    const saved = states.filter(s => s.saved);
    const confidences = practiced.filter(s => s.confidence).map(s => s.confidence!);

    return {
      totalPracticed: practiced.length,
      totalSaved: saved.length,
      avgConfidence: confidences.length > 0
        ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length * 10) / 10
        : 0,
    };
  }, [userStates]);

  // Handlers
  const handleSelectQuestion = (id: string) => {
    setSelectedId(id);
    setMobileShowDetail(true);
  };

  const handleToggleSave = (questionId: string) => {
    setUserStates(prev => {
      const current = prev[questionId] || { id: questionId, questionId, saved: false, practicedCount: 0 };
      return {
        ...prev,
        [questionId]: { ...current, saved: !current.saved },
      };
    });
  };

  const handleMarkPracticed = (questionId: string, confidence?: number, notes?: string) => {
    setUserStates(prev => {
      const current = prev[questionId] || { id: questionId, questionId, saved: false, practicedCount: 0 };
      return {
        ...prev,
        [questionId]: {
          ...current,
          practicedCount: current.practicedCount + 1,
          lastPracticedAt: new Date(),
          confidence: confidence ?? current.confidence,
          notes: notes ?? current.notes,
        },
      };
    });
  };

  const handleGenerate = (options: GenerateOptions) => {
    const newQuestions = generateQuestionSet(options);
    setQuestions(prev => [...newQuestions, ...prev]);
    if (newQuestions.length > 0) {
      setSelectedId(newQuestions[0].id);
      setMobileShowDetail(true);
    }
  };

  const handleBack = () => {
    setMobileShowDetail(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Interview Prep Bank
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {/* Filters Toolbar */}
        <div className="mb-3">
          <FiltersToolbar
            filters={filters}
            onFiltersChange={setFilters}
            onGenerateClick={() => setShowGenerateModal(true)}
            stats={stats}
          />
        </div>

        {/* Two-Panel Layout */}
        <div className="flex gap-3 min-h-[300px] max-h-[400px]">
          {/* Left Panel: Question List */}
          <div
            className={`flex-1 overflow-y-auto border rounded-md ${
              mobileShowDetail ? "hidden lg:block" : "block"
            }`}
          >
            <QuestionList
              questions={filteredQuestions}
              selectedId={selectedId}
              onSelect={handleSelectQuestion}
              onToggleSave={handleToggleSave}
            />
          </div>

          {/* Right Panel: Question Detail */}
          <div
            className={`lg:w-[45%] lg:flex-shrink-0 border rounded-md p-3 ${
              mobileShowDetail ? "block w-full" : "hidden lg:block"
            }`}
          >
            {selectedQuestion ? (
              <QuestionDetail
                question={selectedQuestion}
                onBack={mobileShowDetail ? handleBack : undefined}
                onSave={handleToggleSave}
                onMarkPracticed={handleMarkPracticed}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a question to view details</p>
                  <p className="text-xs mt-1">or generate new questions</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Modal */}
        <GenerateModal
          open={showGenerateModal}
          onOpenChange={setShowGenerateModal}
          onGenerate={handleGenerate}
          defaultCategory={filters.category === "All" ? "General" : filters.category as Category}
        />
      </CardContent>
    </Card>
  );
}
