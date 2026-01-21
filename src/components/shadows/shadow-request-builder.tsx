"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Building2,
  Search,
  Star,
  Globe,
  Users,
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
  { id: 1, title: "Choose Host", icon: Building2, description: "Who do you want to shadow?" },
  { id: 2, title: "Learning Goal", icon: Target, description: "What do you want to understand?" },
  { id: 3, title: "Role Focus", icon: Briefcase, description: "Which role are you curious about?" },
  { id: 4, title: "Observation Scope", icon: Eye, description: "This is observation only" },
  { id: 5, title: "Format Preference", icon: Clock, description: "How long would you like to shadow?" },
  { id: 6, title: "Availability", icon: CalendarDays, description: "When are you available?" },
  { id: 7, title: "What You Bring", icon: Heart, description: "Your commitments" },
  { id: 8, title: "Request Message", icon: MessageSquare, description: "Write your message" },
];

const TOTAL_STEPS = 8;

// Host type for selection
interface ShadowHost {
  id: string;
  name: string;
  logo?: string | null;
  bio?: string | null;
  website?: string | null;
  rating?: number | null;
  reviewCount: number;
}

interface ShadowRequestBuilderProps {
  onSubmit: (data: ShadowRequestData) => Promise<void>;
  onSaveDraft: (data: ShadowRequestData) => Promise<void>;
  initialData?: Partial<ShadowRequestData>;
  isSubmitting?: boolean;
  youthAgeBand?: "UNDER_SIXTEEN" | "SIXTEEN_SEVENTEEN" | "EIGHTEEN_TWENTY" | null;
}

export interface ShadowRequestData {
  hostId?: string;
  hostName?: string;
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

  // Host selection state
  const [hosts, setHosts] = useState<ShadowHost[]>([]);
  const [hostsLoading, setHostsLoading] = useState(true);
  const [hostSearch, setHostSearch] = useState("");

  // Form state
  const [formData, setFormData] = useState<ShadowRequestData>({
    hostId: initialData?.hostId,
    hostName: initialData?.hostName,
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

  // Fetch available hosts
  useEffect(() => {
    const fetchHosts = async () => {
      setHostsLoading(true);
      try {
        const params = new URLSearchParams();
        if (hostSearch) params.set("search", hostSearch);

        const response = await fetch(`/api/shadows/hosts?${params}`);
        if (response.ok) {
          const data = await response.json();
          setHosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch hosts:", error);
      } finally {
        setHostsLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(fetchHosts, 300);
    return () => clearTimeout(timeoutId);
  }, [hostSearch]);

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

  const selectHost = (host: ShadowHost) => {
    updateFormData({ hostId: host.id, hostName: host.name });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.hostId; // Must select a host
      case 2:
        return formData.learningGoals.length > 0 && formData.learningGoals.length <= 2;
      case 3:
        return formData.roleTitle.trim().length >= 2;
      case 4:
        return true; // Observation scope is informational
      case 5:
        return !!formData.format;
      case 6:
        return true; // Availability is optional
      case 7:
        return formData.acceptsSafeguarding;
      case 8:
        return formData.message.trim().length >= 20;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && canProceed()) {
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
              Select a verified employer you'd like to shadow. They'll receive your request directly.
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name..."
                value={hostSearch}
                onChange={(e) => setHostSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Host list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {hostsLoading ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : hosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {hostSearch
                      ? "No hosts found matching your search"
                      : "No verified hosts available yet"}
                  </p>
                  <p className="text-xs mt-1">
                    Try a different search or check back later
                  </p>
                </div>
              ) : (
                hosts.map((host) => {
                  const isSelected = formData.hostId === host.id;
                  return (
                    <button
                      key={host.id}
                      onClick={() => selectHost(host)}
                      className={cn(
                        "w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-muted-foreground/50 hover:bg-muted/30"
                      )}
                    >
                      {/* Logo/Avatar */}
                      <div className="shrink-0">
                        {host.logo ? (
                          <img
                            src={host.logo}
                            alt={host.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-purple-600" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{host.name}</h3>
                          {isSelected && (
                            <div className="p-0.5 rounded-full bg-primary text-white shrink-0">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        {host.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {host.bio}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {host.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              {host.rating.toFixed(1)}
                              {host.reviewCount > 0 && (
                                <span>({host.reviewCount})</span>
                              )}
                            </span>
                          )}
                          {host.website && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              Website
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {formData.hostId && formData.hostName && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <Check className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  Selected: <strong>{formData.hostName}</strong>
                </span>
              </div>
            )}
          </div>
        );

      case 2:
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

      case 3:
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

      case 4:
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

      case 5:
        return (
          <ShadowTemplates
            selectedFormat={formData.format}
            onSelect={(format) => updateFormData({ format })}
          />
        );

      case 6:
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

      case 7:
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

      case 8:
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
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={isSubmitting}>
            Save Draft
          </Button>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
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

        {currentStep < TOTAL_STEPS ? (
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
