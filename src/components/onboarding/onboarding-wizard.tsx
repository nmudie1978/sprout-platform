"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Banknote,
  GraduationCap,
  Search,
  Rocket,
  Loader2,
  Check,
  Handshake,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchCareers, type Career } from "@/lib/career-pathways";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

// Step data
const PRIORITY_OPTIONS = [
  {
    id: "earn",
    label: "Earn money fast",
    description: "Find jobs that pay quickly",
    icon: Banknote,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    id: "skills",
    label: "Build skills",
    description: "Gain experience for your CV",
    icon: GraduationCap,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    id: "explore",
    label: "Explore careers",
    description: "Discover what you might enjoy",
    icon: Search,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    id: "prepare",
    label: "Prepare for future",
    description: "Get ready for bigger goals",
    icon: Rocket,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
];

const AVAILABILITY_OPTIONS = [
  {
    id: "busy",
    label: "Very busy",
    description: "I can only work occasionally",
    emoji: "🏃",
  },
  {
    id: "some",
    label: "Some free time",
    description: "A few hours per week",
    emoji: "⏰",
  },
  {
    id: "plenty",
    label: "Plenty of time",
    description: "I'm available often",
    emoji: "🌟",
  },
];

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [careerSearch, setCareerSearch] = useState("");
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Career[]>([]);

  const queryClient = useQueryClient();

  // Search careers as user types
  const handleCareerSearch = useCallback((query: string) => {
    setCareerSearch(query);
    if (query.length >= 2) {
      const results = searchCareers(query).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, []);

  // Toggle priority selection (max 2)
  const togglePriority = useCallback((priorityId: string) => {
    setSelectedPriorities((prev) => {
      if (prev.includes(priorityId)) {
        return prev.filter((p) => p !== priorityId);
      }
      if (prev.length >= 2) {
        return [...prev.slice(1), priorityId];
      }
      return [...prev, priorityId];
    });
  }, []);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerAspiration: selectedCareer?.title || (careerSearch.length > 0 ? careerSearch : null),
          currentPriorities: selectedPriorities.length > 0 ? selectedPriorities : ["explore"],
          availabilityLevel: selectedAvailability,
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      onComplete();
    },
  });

  // Skip mutation
  const skipMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPriorities: ["explore"],
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      onComplete();
    },
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      submitMutation.mutate();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    skipMutation.mutate();
  };

  const isSubmitting = submitMutation.isPending || skipMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Welcome to Sprout</DialogTitle>
          </div>
          <DialogDescription>
            Let&apos;s personalise your experience in {4 - step === 0 ? "one" : 4 - step + 1} quick step{4 - step !== 1 ? "s" : ""}
          </DialogDescription>

          {/* Progress dots */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 pt-2 overflow-y-auto max-h-[50vh]">
          <AnimatePresence mode="wait">
            {/* Step 1: Career Direction */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Where do you want to head?</h3>
                </div>

                <div className="relative">
                  <Input
                    placeholder="Search for a career (e.g., Developer, Nurse)..."
                    value={careerSearch}
                    onChange={(e) => handleCareerSearch(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                    {searchResults.map((career) => (
                      <button
                        key={career.id}
                        onClick={() => {
                          setSelectedCareer(career);
                          setCareerSearch(career.title);
                          setSearchResults([]);
                        }}
                        className={cn(
                          "w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center gap-3",
                          selectedCareer?.id === career.id && "bg-primary/5"
                        )}
                      >
                        <span className="text-lg">{career.emoji}</span>
                        <div>
                          <p className="font-medium text-sm">{career.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{career.avgSalary}</p>
                        </div>
                        {selectedCareer?.id === career.id && (
                          <Check className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected career badge */}
                {selectedCareer && searchResults.length === 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-lg">{selectedCareer.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{selectedCareer.title}</p>
                      <p className="text-xs text-muted-foreground">{selectedCareer.avgSalary}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 text-xs"
                      onClick={() => {
                        setSelectedCareer(null);
                        setCareerSearch("");
                      }}
                    >
                      Change
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center pt-2">
                  Not sure yet? That&apos;s okay - you can skip this or update it later
                </p>
              </motion.div>
            )}

            {/* Step 2: How Payments Work */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Handshake className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">How payments work</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sprout helps you find real jobs and connect with people in your local community.
                  </p>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          Payment is agreed and handled directly between you and the job poster.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sprout does not handle money or take fees.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    This keeps Sprout simple, safe, and focused on helping you find work.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Current Priorities */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">What do you want right now?</h3>
                </div>

                <p className="text-sm text-muted-foreground">
                  Pick up to 2 priorities - we&apos;ll tailor your experience
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {PRIORITY_OPTIONS.map((priority) => {
                    const Icon = priority.icon;
                    const isSelected = selectedPriorities.includes(priority.id);
                    return (
                      <button
                        key={priority.id}
                        onClick={() => togglePriority(priority.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all",
                          isSelected
                            ? `${priority.bgColor} ${priority.borderColor}`
                            : "border-muted hover:border-muted-foreground/20"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 mb-2", priority.color)} />
                        <p className="font-medium text-sm">{priority.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {priority.description}
                        </p>
                        {isSelected && (
                          <Badge className="mt-2 text-xs" variant="secondary">
                            Selected
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4: Availability */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">How busy are you?</h3>
                </div>

                <p className="text-sm text-muted-foreground">
                  This helps us find jobs that fit your schedule
                </p>

                <div className="space-y-3">
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedAvailability(option.id)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                        selectedAvailability === option.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/20"
                      )}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      {selectedAvailability === option.id && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="text-muted-foreground"
                >
                  Skip for now
                </Button>
              )}
            </div>

            <Button onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : step === 4 ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
