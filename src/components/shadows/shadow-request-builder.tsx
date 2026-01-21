"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Briefcase,
  Eye,
  Clock,
  CalendarDays,
  Heart,
  MessageSquare,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ShadowTemplates, type ShadowFormat } from "./shadow-templates";
import { SafeguardingRules, EmergencyContactInput } from "./shadow-safety";

// Learning Goals
const LEARNING_GOALS = [
  { id: "DAILY_WORK", label: "What does a typical day look like?", icon: "📅" },
  { id: "SKILLS_USED", label: "What skills are needed?", icon: "🛠️" },
  { id: "WORK_ENVIRONMENT", label: "What's the workplace culture like?", icon: "🏢" },
  { id: "CAREER_PATH", label: "How do people get into this role?", icon: "🛤️" },
  { id: "EDUCATION_REQUIRED", label: "What education or training is needed?", icon: "📚" },
  { id: "CHALLENGES", label: "What are the hard parts of the job?", icon: "⚡" },
];

// Commitments
const COMMITMENTS = [
  { id: "punctuality", label: "Punctuality", description: "I'll arrive on time" },
  { id: "curiosity", label: "Curiosity", description: "I'll ask thoughtful questions" },
  { id: "respect", label: "Respect", description: "I'll respect the workplace" },
  { id: "followRules", label: "Follow rules", description: "I'll follow all instructions" },
];

// Days of the week
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Step configuration
const STEPS = [
  { id: 1, title: "Learning Goal", icon: Target, description: "What do you want to understand?" },
  { id: 2, title: "Role Focus", icon: Briefcase, description: "Which role are you curious about?" },
  { id: 3, title: "Observation Scope", icon: Eye, description: "This is observation only" },
  { id: 4, title: "Format Preference", icon: Clock, description: "How long would you like to shadow?" },
  { id: 5, title: "Availability", icon: CalendarDays, description: "When are you available?" },
  { id: 6, title: "What You Bring", icon: Heart, description: "Your commitments" },
  { id: 7, title: "Request Message", icon: MessageSquare, description: "Write your message" },
];

interface ShadowRequestBuilderProps {
  onSubmit: (data: ShadowRequestData) => Promise<void>;
  onSaveDraft: (data: ShadowRequestData) => Promise<void>;
  initialData?: Partial<ShadowRequestData>;
  isSubmitting?: boolean;
  youthAgeBand?: "UNDER_SIXTEEN" | "SIXTEEN_SEVENTEEN" | "EIGHTEEN_TWENTY" | null;
}

export interface ShadowRequestData {
  learningGoals: string[];
  roleTitle: string;
  roleCategory?: string;
  format: ShadowFormat;
  availabilityStart?: Date;
  availabilityEnd?: Date;
  preferredDays: string[];
  flexibleSchedule: boolean;
  commitsPunctuality: boolean;
  commitsCuriosity: boolean;
  commitsRespect: boolean;
  commitsFollowRules: boolean;
  acceptsNda: boolean;
  acceptsSafeguarding: boolean;
  message: string;
  aiAssistedDraft: boolean;
  emergencyContact?: string;
  emergencyContactPhone?: string;
}

export function ShadowRequestBuilder({
  onSubmit,
  onSaveDraft,
  initialData,
  isSubmitting = false,
  youthAgeBand,
}: ShadowRequestBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isRewriting, setIsRewriting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ShadowRequestData>({
    learningGoals: initialData?.learningGoals || [],
    roleTitle: initialData?.roleTitle || "",
    roleCategory: initialData?.roleCategory || "",
    format: initialData?.format || "WALKTHROUGH",
    availabilityStart: initialData?.availabilityStart,
    availabilityEnd: initialData?.availabilityEnd,
    preferredDays: initialData?.preferredDays || [],
    flexibleSchedule: initialData?.flexibleSchedule ?? true,
    commitsPunctuality: initialData?.commitsPunctuality ?? true,
    commitsCuriosity: initialData?.commitsCuriosity ?? true,
    commitsRespect: initialData?.commitsRespect ?? true,
    commitsFollowRules: initialData?.commitsFollowRules ?? true,
    acceptsNda: initialData?.acceptsNda ?? false,
    acceptsSafeguarding: initialData?.acceptsSafeguarding ?? false,
    message: initialData?.message || "",
    aiAssistedDraft: initialData?.aiAssistedDraft ?? false,
    emergencyContact: initialData?.emergencyContact || "",
    emergencyContactPhone: initialData?.emergencyContactPhone || "",
  });

  const updateFormData = useCallback((updates: Partial<ShadowRequestData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleLearningGoal = (goalId: string) => {
    const current = formData.learningGoals;
    if (current.includes(goalId)) {
      updateFormData({ learningGoals: current.filter(g => g !== goalId) });
    } else if (current.length < 2) {
      updateFormData({ learningGoals: [...current, goalId] });
    }
  };

  const togglePreferredDay = (day: string) => {
    const current = formData.preferredDays;
    if (current.includes(day)) {
      updateFormData({ preferredDays: current.filter(d => d !== day) });
    } else {
      updateFormData({ preferredDays: [...current, day] });
    }
  };

  const handleAiRewrite = async () => {
    if (!formData.message || formData.message.trim().length < 10) return;

    setIsRewriting(true);
    try {
      const response = await fetch("/api/shadows/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalMessage: formData.message,
          roleTitle: formData.roleTitle,
          learningGoals: formData.learningGoals,
          format: formData.format,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updateFormData({
          message: data.rewritten,
          aiAssistedDraft: true,
        });
      }
    } catch (error) {
      console.error("Failed to rewrite message:", error);
    } finally {
      setIsRewriting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.learningGoals.length > 0 && formData.learningGoals.length <= 2;
      case 2:
        return formData.roleTitle.trim().length >= 2;
      case 3:
        return true; // Observation scope is informational
      case 4:
        return !!formData.format;
      case 5:
        return true; // Availability is optional
      case 6:
        return formData.acceptsSafeguarding;
      case 7:
        return formData.message.trim().length >= 20;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 7 && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (canProceed()) {
      await onSubmit(formData);
    }
  };

  const handleSaveDraft = async () => {
    await onSaveDraft(formData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select up to 2 things you'd most like to learn about.
            </p>
            <div className="grid gap-3">
              {LEARNING_GOALS.map(goal => {
                const isSelected = formData.learningGoals.includes(goal.id);
                const isDisabled = !isSelected && formData.learningGoals.length >= 2;

                return (
                  <button
                    key={goal.id}
                    onClick={() => !isDisabled && toggleLearningGoal(goal.id)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-muted-foreground/50"
                    )}
                  >
                    <span className="text-lg">{goal.icon}</span>
                    <span className="flex-1 text-sm">{goal.label}</span>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-primary text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose ONE specific role you want to observe. Being specific helps hosts understand your interest.
            </p>
            <div>
              <label className="text-sm font-medium">Role Title</label>
              <input
                type="text"
                value={formData.roleTitle}
                onChange={(e) => updateFormData({ roleTitle: e.target.value })}
                placeholder="e.g., Software Developer, Veterinarian, Chef..."
                className="w-full mt-1 p-3 rounded-lg border bg-background"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be specific — "Graphic Designer" is better than "Creative job"
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Industry (optional)</label>
              <input
                type="text"
                value={formData.roleCategory || ""}
                onChange={(e) => updateFormData({ roleCategory: e.target.value })}
                placeholder="e.g., Tech, Healthcare, Hospitality..."
                className="w-full mt-1 p-3 rounded-lg border bg-background"
                maxLength={50}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Eye className="h-6 w-6 text-purple-600 shrink-0" />
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-200">
                  Observation Only
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  Career shadowing is about watching and learning, not working. You will not be expected to perform any tasks.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">What this means:</h4>
              {[
                "You'll watch how real work happens",
                "You can ask questions, but won't do the work",
                "There's no performance expectation",
                "You're there to learn, not to prove yourself",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <ShadowTemplates
            selectedFormat={formData.format}
            onSelect={(format) => updateFormData({ format })}
          />
        );

      case 5:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Share your general availability. Exact dates will be confirmed with your host.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Earliest Available</label>
                <div className="relative mt-1">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={formData.availabilityStart ? format(formData.availabilityStart, "yyyy-MM-dd") : ""}
                    onChange={(e) => updateFormData({
                      availabilityStart: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="w-full pl-10 p-2.5 rounded-lg border bg-background text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Latest Available</label>
                <div className="relative mt-1">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={formData.availabilityEnd ? format(formData.availabilityEnd, "yyyy-MM-dd") : ""}
                    onChange={(e) => updateFormData({
                      availabilityEnd: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    min={formData.availabilityStart
                      ? format(formData.availabilityStart, "yyyy-MM-dd")
                      : format(new Date(), "yyyy-MM-dd")}
                    className="w-full pl-10 p-2.5 rounded-lg border bg-background text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Preferred Days</label>
              <p className="text-xs text-muted-foreground mb-2">Select days that work best for you</p>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    onClick={() => togglePreferredDay(day)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-all",
                      formData.preferredDays.includes(day)
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={formData.flexibleSchedule}
                onCheckedChange={(checked) =>
                  updateFormData({ flexibleSchedule: checked === true })
                }
              />
              <span className="text-sm">I'm flexible and can adjust to the host's schedule</span>
            </label>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Your Commitments</h4>
              <div className="space-y-3">
                {COMMITMENTS.map(commitment => {
                  const key = `commits${commitment.id.charAt(0).toUpperCase() + commitment.id.slice(1)}` as keyof ShadowRequestData;
                  const isChecked = formData[key] as boolean;

                  return (
                    <label
                      key={commitment.id}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          updateFormData({ [key]: checked === true })
                        }
                        className="mt-0.5"
                      />
                      <div>
                        <span className="font-medium text-sm">{commitment.label}</span>
                        <p className="text-xs text-muted-foreground">{commitment.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.acceptsNda}
                  onCheckedChange={(checked) =>
                    updateFormData({ acceptsNda: checked === true })
                  }
                  className="mt-0.5"
                />
                <div>
                  <span className="font-medium text-sm">NDA Acceptance (if required)</span>
                  <p className="text-xs text-muted-foreground">
                    Some hosts may require you to keep certain information confidential
                  </p>
                </div>
              </label>
            </div>

            <SafeguardingRules
              accepted={formData.acceptsSafeguarding}
              onAccept={(accepted) => updateFormData({ acceptsSafeguarding: accepted })}
            />

            {youthAgeBand === "UNDER_SIXTEEN" && (
              <EmergencyContactInput
                contact={formData.emergencyContact || ""}
                phone={formData.emergencyContactPhone || ""}
                onChange={(contact, phone) =>
                  updateFormData({
                    emergencyContact: contact,
                    emergencyContactPhone: phone,
                  })
                }
                required
              />
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Write a brief message to introduce yourself and explain your interest.
            </p>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Your Message</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAiRewrite}
                  disabled={isRewriting || formData.message.trim().length < 10}
                  className="text-xs"
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Polish
                    </>
                  )}
                </Button>
              </div>

              <textarea
                value={formData.message}
                onChange={(e) => updateFormData({ message: e.target.value })}
                placeholder="Hi, I'm interested in learning about what a day looks like in your role. I'm exploring career options and think this could be a great fit for my interests..."
                className="w-full p-3 rounded-lg border bg-background text-sm resize-none"
                rows={6}
              />

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {formData.message.length} characters
                </p>
                {formData.aiAssistedDraft && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-assisted
                  </Badge>
                )}
              </div>
            </div>

            {formData.message.trim().length > 0 && formData.message.trim().length < 20 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">Please write at least a few sentences.</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepInfo = STEPS[currentStep - 1];
  const StepIcon = currentStepInfo.icon;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of 7
          </span>
          <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={isSubmitting}>
            Save Draft
          </Button>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 7) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Header */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
              <StepIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold">{currentStepInfo.title}</h2>
              <p className="text-sm text-muted-foreground">{currentStepInfo.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="py-6">
              {renderStepContent()}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < 7 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Request
                <Check className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
