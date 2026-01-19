"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

// Types
type FeedbackRole = "TEEN_16_20" | "PARENT_GUARDIAN" | "ADULT_OTHER";
type ClarityTopic =
  | "PRIMARY_VS_SECONDARY_GOAL"
  | "REAL_LIFE_WORK"
  | "SMALL_JOBS"
  | "NEXT_STEPS"
  | "NONE";

// Likert questions
const LIKERT_QUESTIONS = [
  { id: "q1", text: "I understood what this app is for." },
  { id: "q2", text: "I understood what I should do first." },
  { id: "q3", text: "The app felt calm and not overwhelming." },
  { id: "q4", text: "The focus on having a main goal made sense to me." },
  {
    id: "q5",
    text: "I would feel comfortable using this (or letting my child use this).",
  },
] as const;

const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

// Clarity topics
const CLARITY_OPTIONS: { value: ClarityTopic; label: string }[] = [
  {
    value: "PRIMARY_VS_SECONDARY_GOAL",
    label: "Choosing a primary vs secondary goal",
  },
  { value: "REAL_LIFE_WORK", label: "Understanding real-life work" },
  { value: "SMALL_JOBS", label: "Small jobs and experience" },
  { value: "NEXT_STEPS", label: "Next steps after choosing a goal" },
  { value: "NONE", label: "None of the above" },
];

// Role options
const ROLE_OPTIONS: { value: FeedbackRole; label: string }[] = [
  { value: "TEEN_16_20", label: "Teen (16–20)" },
  { value: "PARENT_GUARDIAN", label: "Parent / Guardian" },
  { value: "ADULT_OTHER", label: "Adult (teacher / mentor / other)" },
];

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || undefined;

  // Form state
  const [role, setRole] = useState<FeedbackRole | "">("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [confusingText, setConfusingText] = useState("");
  const [clarityTopics, setClarityTopics] = useState<ClarityTopic[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if form is valid
  const isValid =
    role !== "" &&
    LIKERT_QUESTIONS.every((q) => ratings[q.id] !== undefined);

  // Handle clarity topic toggle
  const toggleClarityTopic = (topic: ClarityTopic) => {
    setClarityTopics((prev) => {
      // If selecting "None", clear others
      if (topic === "NONE") {
        return prev.includes("NONE") ? [] : ["NONE"];
      }
      // If selecting another topic, remove "None"
      const withoutNone = prev.filter((t) => t !== "NONE");
      if (prev.includes(topic)) {
        return withoutNone.filter((t) => t !== topic);
      }
      return [...withoutNone, topic];
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          q1: ratings.q1,
          q2: ratings.q2,
          q3: ratings.q3,
          q4: ratings.q4,
          q5: ratings.q5,
          confusingText: confusingText.trim() || null,
          clarityTopics: clarityTopics.length > 0 ? clarityTopics : null,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit feedback");
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card className="text-center">
          <CardContent className="pt-12 pb-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Thank you</h1>
            <p className="text-muted-foreground">
              Your feedback helps improve Sprout.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Give Feedback</h1>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
            Beta
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Help us understand how well Sprout works for you. Takes about 1 minute.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Who are you? */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Who are you?</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={role}
              onValueChange={(value: string) => setRole(value as FeedbackRole)}
              className="space-y-2"
            >
              {ROLE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={`role-${option.value}`} />
                  <Label htmlFor={`role-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Step 2: Likert Questions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Rate the following statements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {LIKERT_QUESTIONS.map((question) => (
              <div key={question.id} className="space-y-3">
                <p className="text-sm font-medium">{question.text}</p>
                <RadioGroup
                  value={ratings[question.id]?.toString() || ""}
                  onValueChange={(value: string) =>
                    setRatings((prev) => ({
                      ...prev,
                      [question.id]: parseInt(value),
                    }))
                  }
                  className="flex flex-wrap gap-2"
                >
                  {LIKERT_OPTIONS.map((option) => (
                    <div key={option.value} className="flex-1 min-w-[60px]">
                      <RadioGroupItem
                        value={option.value.toString()}
                        id={`${question.id}-${option.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`${question.id}-${option.value}`}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-colors"
                      >
                        <span className="text-lg font-semibold">
                          {option.value}
                        </span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight hidden sm:block">
                          {option.label}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step 3: Free text (optional) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              What, if anything, felt confusing or unclear?
              <span className="text-muted-foreground font-normal text-sm ml-2">
                (optional)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={confusingText}
              onChange={(e) => setConfusingText(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={500}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between mt-2">
              <p className="text-[11px] text-muted-foreground">
                Please avoid sharing personal contact details.
              </p>
              <span className="text-[11px] text-muted-foreground">
                {confusingText.length}/500
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Clarity topics (optional) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Which of these would you like more clarity on?
              <span className="text-muted-foreground font-normal text-sm ml-2">
                (optional)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {CLARITY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={option.value}
                    checked={clarityTopics.includes(option.value)}
                    onCheckedChange={() => toggleClarityTopic(option.value)}
                  />
                  <Label
                    htmlFor={option.value}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </div>
    </div>
  );
}
