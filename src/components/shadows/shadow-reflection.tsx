"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Heart,
  HeartCrack,
  Sparkles,
  Target,
  ArrowRight,
  Check,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Common skills that might be noticed
const COMMON_SKILLS = [
  "Communication",
  "Problem-solving",
  "Teamwork",
  "Time management",
  "Creativity",
  "Technical skills",
  "Customer service",
  "Leadership",
  "Attention to detail",
  "Adaptability",
  "Critical thinking",
  "Organisation",
];

interface ShadowReflectionData {
  whatSurprised?: string;
  whatLiked?: string;
  whatDisliked?: string;
  skillsNoticed: string[];
  wouldExplore?: boolean;
  wouldExploreReason?: string;
  keyTakeaways: string[];
  questionsAsked: string[];
  followUpActions: string[];
  overallExperience?: number;
  hostHelpfulness?: number;
}

interface ShadowReflectionProps {
  roleTitle: string;
  initialData?: Partial<ShadowReflectionData>;
  onSubmit: (data: ShadowReflectionData) => Promise<void>;
  isSubmitting?: boolean;
}

export function ShadowReflection({
  roleTitle,
  initialData,
  onSubmit,
  isSubmitting = false,
}: ShadowReflectionProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ShadowReflectionData>({
    whatSurprised: initialData?.whatSurprised || "",
    whatLiked: initialData?.whatLiked || "",
    whatDisliked: initialData?.whatDisliked || "",
    skillsNoticed: initialData?.skillsNoticed || [],
    wouldExplore: initialData?.wouldExplore,
    wouldExploreReason: initialData?.wouldExploreReason || "",
    keyTakeaways: initialData?.keyTakeaways || [],
    questionsAsked: initialData?.questionsAsked || [],
    followUpActions: initialData?.followUpActions || [],
    overallExperience: initialData?.overallExperience,
    hostHelpfulness: initialData?.hostHelpfulness,
  });

  const [newTakeaway, setNewTakeaway] = useState("");
  const [newAction, setNewAction] = useState("");

  const updateData = (updates: Partial<ShadowReflectionData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const toggleSkill = (skill: string) => {
    const current = data.skillsNoticed;
    if (current.includes(skill)) {
      updateData({ skillsNoticed: current.filter(s => s !== skill) });
    } else {
      updateData({ skillsNoticed: [...current, skill] });
    }
  };

  const addTakeaway = () => {
    if (newTakeaway.trim() && data.keyTakeaways.length < 3) {
      updateData({ keyTakeaways: [...data.keyTakeaways, newTakeaway.trim()] });
      setNewTakeaway("");
    }
  };

  const removeTakeaway = (index: number) => {
    updateData({
      keyTakeaways: data.keyTakeaways.filter((_, i) => i !== index),
    });
  };

  const addAction = () => {
    if (newAction.trim() && data.followUpActions.length < 3) {
      updateData({ followUpActions: [...data.followUpActions, newAction.trim()] });
      setNewAction("");
    }
  };

  const removeAction = (index: number) => {
    updateData({
      followUpActions: data.followUpActions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    await onSubmit(data);
  };

  const totalSteps = 4;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 font-medium text-sm mb-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                What surprised you?
              </label>
              <textarea
                value={data.whatSurprised}
                onChange={(e) => updateData({ whatSurprised: e.target.value })}
                placeholder="Was there anything unexpected about the job or workplace?"
                className="w-full p-3 rounded-lg border bg-background text-sm resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-medium text-sm mb-2">
                <Heart className="h-4 w-4 text-rose-500" />
                What did you like?
              </label>
              <textarea
                value={data.whatLiked}
                onChange={(e) => updateData({ whatLiked: e.target.value })}
                placeholder="What parts of the job or environment appealed to you?"
                className="w-full p-3 rounded-lg border bg-background text-sm resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-medium text-sm mb-2">
                <HeartCrack className="h-4 w-4 text-muted-foreground" />
                What didn't you like?
              </label>
              <textarea
                value={data.whatDisliked}
                onChange={(e) => updateData({ whatDisliked: e.target.value })}
                placeholder="Were there aspects that didn't appeal to you? That's okay!"
                className="w-full p-3 rounded-lg border bg-background text-sm resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 font-medium text-sm mb-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Skills you noticed being used
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Select skills you observed during the shadow
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-all",
                      data.skillsNoticed.includes(skill)
                        ? "bg-purple-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 font-medium text-sm mb-2">
                <Target className="h-4 w-4 text-emerald-500" />
                Would you explore this career further?
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateData({ wouldExplore: true })}
                  className={cn(
                    "flex-1 p-3 rounded-lg border text-sm transition-all",
                    data.wouldExplore === true
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "hover:border-muted-foreground/50"
                  )}
                >
                  Yes, I'm interested
                </button>
                <button
                  onClick={() => updateData({ wouldExplore: false })}
                  className={cn(
                    "flex-1 p-3 rounded-lg border text-sm transition-all",
                    data.wouldExplore === false
                      ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      : "hover:border-muted-foreground/50"
                  )}
                >
                  Not for me
                </button>
              </div>

              {data.wouldExplore !== undefined && (
                <textarea
                  value={data.wouldExploreReason}
                  onChange={(e) => updateData({ wouldExploreReason: e.target.value })}
                  placeholder={
                    data.wouldExplore
                      ? "What about it interests you?"
                      : "What made you realise it's not for you? (This is valuable insight!)"
                  }
                  className="w-full mt-3 p-3 rounded-lg border bg-background text-sm resize-none"
                  rows={2}
                />
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="font-medium text-sm mb-2 block">
                Key Takeaways (up to 3)
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                What are the most important things you learned?
              </p>

              <div className="space-y-2 mb-3">
                {data.keyTakeaways.map((takeaway, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                  >
                    <span className="flex-1 text-sm">{takeaway}</span>
                    <button
                      onClick={() => removeTakeaway(index)}
                      className="p-1 hover:bg-muted-foreground/20 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {data.keyTakeaways.length < 3 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTakeaway}
                    onChange={(e) => setNewTakeaway(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTakeaway()}
                    placeholder="Add a takeaway..."
                    className="flex-1 p-2 rounded-lg border bg-background text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={addTakeaway}
                    disabled={!newTakeaway.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="font-medium text-sm mb-2 block">
                Follow-up Actions (up to 3)
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                What do you want to do next based on this experience?
              </p>

              <div className="space-y-2 mb-3">
                {data.followUpActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <ArrowRight className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="flex-1 text-sm">{action}</span>
                    <button
                      onClick={() => removeAction(index)}
                      className="p-1 hover:bg-muted-foreground/20 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {data.followUpActions.length < 3 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addAction()}
                    placeholder="e.g., Research training options..."
                    className="flex-1 p-2 rounded-lg border bg-background text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={addAction}
                    disabled={!newAction.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="font-medium text-sm mb-2 block">
                Overall Experience
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                How was the shadow experience overall?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => updateData({ overallExperience: rating })}
                    className={cn(
                      "flex-1 p-3 rounded-lg border text-center transition-all",
                      data.overallExperience === rating
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "hover:border-muted-foreground/50"
                    )}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Not great</span>
                <span>Amazing</span>
              </div>
            </div>

            <div>
              <label className="font-medium text-sm mb-2 block">
                Host Helpfulness
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                How helpful was your host in explaining things?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => updateData({ hostHelpfulness: rating })}
                    className={cn(
                      "flex-1 p-3 rounded-lg border text-center transition-all",
                      data.hostHelpfulness === rating
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "hover:border-muted-foreground/50"
                    )}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Not very</span>
                <span>Very helpful</span>
              </div>
            </div>

            {/* Summary */}
            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <h4 className="font-medium text-sm mb-3">Your Reflection Summary</h4>
                <div className="space-y-2 text-sm">
                  {data.skillsNoticed.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Skills noticed: </span>
                      <span>{data.skillsNoticed.join(", ")}</span>
                    </div>
                  )}
                  {data.wouldExplore !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Further exploration: </span>
                      <Badge variant={data.wouldExplore ? "default" : "secondary"}>
                        {data.wouldExplore ? "Interested" : "Not for me"}
                      </Badge>
                    </div>
                  )}
                  {data.keyTakeaways.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Key takeaways: </span>
                      <span>{data.keyTakeaways.length}</span>
                    </div>
                  )}
                  {data.followUpActions.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Follow-up actions: </span>
                      <span>{data.followUpActions.length}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-emerald-500/20">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold">Shadow Reflection</h2>
              <p className="text-sm text-muted-foreground">
                {roleTitle} experience
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardContent className="py-6">
            {renderStep()}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(prev => prev - 1)}
          disabled={step === 1 || isSubmitting}
        >
          Back
        </Button>

        {step < totalSteps ? (
          <Button onClick={() => setStep(prev => prev + 1)}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Reflection
                <Check className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Footer Note */}
      <p className="text-xs text-center text-muted-foreground mt-6">
        This reflection will be saved to your Journey and help you track your growth.
      </p>
    </div>
  );
}
