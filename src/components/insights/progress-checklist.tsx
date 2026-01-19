"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Trophy,
  Code,
  Wrench,
  Heart,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  id: string;
  type: "requirement" | "resource" | "certification";
  label: string;
  url?: string;
}

interface IndustryChecklist {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  steps: Step[];
}

const industryChecklists: IndustryChecklist[] = [
  {
    id: "tech",
    name: "Technology & AI",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    steps: [
      { id: "t-req-1", type: "requirement", label: "Lær grunnleggende programmering" },
      { id: "t-res-1", type: "resource", label: "Fullfør freeCodeCamp kurs", url: "https://www.freecodecamp.org" },
      { id: "t-res-2", type: "resource", label: "Ta CS50 (Harvard)", url: "https://cs50.harvard.edu" },
      { id: "t-cert-1", type: "certification", label: "Google IT Support Certificate" },
    ],
  },
  {
    id: "green",
    name: "Grønn Energi",
    icon: Wrench,
    color: "from-green-500 to-teal-500",
    steps: [
      { id: "g-req-1", type: "requirement", label: "Fullfør VGS eller yrkesfag" },
      { id: "g-res-1", type: "resource", label: "Utforsk Vilbli.no", url: "https://www.vilbli.no" },
      { id: "g-res-2", type: "resource", label: "Les om bransjen på Energi Norge", url: "https://www.energinorge.no" },
      { id: "g-cert-1", type: "certification", label: "Fagbrev Energimontør" },
    ],
  },
  {
    id: "health",
    name: "Helse & Omsorg",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    steps: [
      { id: "h-req-1", type: "requirement", label: "Fullfør Helse- og oppvekstfag VG1" },
      { id: "h-res-1", type: "resource", label: "Les på Helsedirektoratet", url: "https://www.helsedirektoratet.no" },
      { id: "h-res-2", type: "resource", label: "Utforsk Utdanning.no - Helse", url: "https://utdanning.no/tema/helse" },
      { id: "h-cert-1", type: "certification", label: "Fagbrev Helsefagarbeider" },
    ],
  },
  {
    id: "creative",
    name: "Kreative Tjenester",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    steps: [
      { id: "c-req-1", type: "requirement", label: "Bygg en portefølje med arbeid" },
      { id: "c-res-1", type: "resource", label: "Ta kurs på Skillshare", url: "https://www.skillshare.com" },
      { id: "c-res-2", type: "resource", label: "Lær på Canva Design School", url: "https://www.canva.com/designschool" },
      { id: "c-cert-1", type: "certification", label: "Google Digital Marketing" },
    ],
  },
];

const typeConfig = {
  requirement: { label: "Krav", icon: CheckCircle2, color: "text-green-600" },
  resource: { label: "Ressurs", icon: BookOpen, color: "text-blue-600" },
  certification: { label: "Sertifisering", icon: GraduationCap, color: "text-purple-600" },
};

export function ProgressChecklist() {
  const { data: session } = useSession();
  const [selectedIndustry, setSelectedIndustry] = useState<string>("tech");
  const [expanded, setExpanded] = useState<boolean>(true);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const currentChecklist = industryChecklists.find((c) => c.id === selectedIndustry);
  const Icon = currentChecklist?.icon || Code;

  // Load progress from API
  useEffect(() => {
    if (session?.user) {
      fetch(`/api/insights/progress?industryId=${selectedIndustry}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.progress) {
            setCompletedSteps(new Set(data.progress.map((p: { stepId: string }) => p.stepId)));
          }
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else {
      // Load from localStorage for non-logged in users
      const saved = localStorage.getItem(`progress-${selectedIndustry}`);
      if (saved) {
        setCompletedSteps(new Set(JSON.parse(saved)));
      }
      setIsLoading(false);
    }
  }, [session, selectedIndustry]);

  const toggleStep = async (stepId: string, stepType: string) => {
    const newCompleted = new Set(completedSteps);
    const isCompleting = !completedSteps.has(stepId);

    if (isCompleting) {
      newCompleted.add(stepId);
    } else {
      newCompleted.delete(stepId);
    }
    setCompletedSteps(newCompleted);

    // Save to API or localStorage
    if (session?.user) {
      try {
        await fetch("/api/insights/progress", {
          method: isCompleting ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industryId: selectedIndustry,
            stepId,
            stepType,
          }),
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    } else {
      localStorage.setItem(`progress-${selectedIndustry}`, JSON.stringify([...newCompleted]));
    }
  };

  const progress = currentChecklist
    ? Math.round((completedSteps.size / currentChecklist.steps.length) * 100)
    : 0;

  const completedByType = {
    requirement: currentChecklist?.steps.filter((s) => s.type === "requirement" && completedSteps.has(s.id)).length || 0,
    resource: currentChecklist?.steps.filter((s) => s.type === "resource" && completedSteps.has(s.id)).length || 0,
    certification: currentChecklist?.steps.filter((s) => s.type === "certification" && completedSteps.has(s.id)).length || 0,
  };

  return (
    <Card className="border-2 overflow-hidden h-full">
      <div className={`h-1 bg-gradient-to-r ${currentChecklist?.color || "from-primary to-purple-500"}`} />
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Getting Started
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Industry Selector - Compact */}
        <div className="flex flex-wrap gap-1">
          {industryChecklists.map((industry) => {
            const IndIcon = industry.icon;
            return (
              <button
                key={industry.id}
                onClick={() => {
                  setSelectedIndustry(industry.id);
                  setCompletedSteps(new Set());
                  setIsLoading(true);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                  selectedIndustry === industry.id
                    ? `bg-gradient-to-r ${industry.color} text-white`
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <IndIcon className="h-3 w-3" />
                {industry.name.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Progress Bar - Compact */}
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs font-bold text-primary">{progress}%</span>
          {progress === 100 && <Trophy className="h-3.5 w-3.5 text-yellow-600" />}
        </div>

        {/* Checklist - Always visible, compact */}
        <div className="space-y-1.5">
          {isLoading ? (
            <div className="py-2 text-center text-muted-foreground text-xs">Loading...</div>
          ) : (
            currentChecklist?.steps.map((step) => {
              const isCompleted = completedSteps.has(step.id);
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition-all ${
                    isCompleted
                      ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => toggleStep(step.id, step.type)}
                >
                  <div className={`flex-shrink-0 ${isCompleted ? "text-green-600" : "text-muted-foreground"}`}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </div>
                  <span className={`flex-1 truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                    {step.label}
                  </span>
                  {step.url && (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
