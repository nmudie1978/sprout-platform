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
      { id: "t-req-2", type: "requirement", label: "Øv på problemløsning" },
      { id: "t-req-3", type: "requirement", label: "Bygg en portefølje med prosjekter" },
      { id: "t-res-1", type: "resource", label: "Fullfør freeCodeCamp kurs", url: "https://www.freecodecamp.org" },
      { id: "t-res-2", type: "resource", label: "Ta CS50 (Harvard)", url: "https://cs50.harvard.edu" },
      { id: "t-res-3", type: "resource", label: "Prøv Codecademy", url: "https://www.codecademy.com" },
      { id: "t-cert-1", type: "certification", label: "Google IT Support Certificate" },
      { id: "t-cert-2", type: "certification", label: "AWS Cloud Practitioner" },
      { id: "t-cert-3", type: "certification", label: "Meta Frontend Developer" },
    ],
  },
  {
    id: "green",
    name: "Grønn Energi",
    icon: Wrench,
    color: "from-green-500 to-teal-500",
    steps: [
      { id: "g-req-1", type: "requirement", label: "Fullfør VGS eller yrkesfag" },
      { id: "g-req-2", type: "requirement", label: "Ta HMS-kurs" },
      { id: "g-req-3", type: "requirement", label: "Søk lærlingplass" },
      { id: "g-res-1", type: "resource", label: "Utforsk Vilbli.no", url: "https://www.vilbli.no" },
      { id: "g-res-2", type: "resource", label: "Les om bransjen på Energi Norge", url: "https://www.energinorge.no" },
      { id: "g-res-3", type: "resource", label: "Finn muligheter på Offshore.no", url: "https://www.offshore.no" },
      { id: "g-cert-1", type: "certification", label: "Fagbrev Energimontør" },
      { id: "g-cert-2", type: "certification", label: "GWO Basic Safety" },
      { id: "g-cert-3", type: "certification", label: "Havvind-sertifisering" },
    ],
  },
  {
    id: "health",
    name: "Helse & Omsorg",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    steps: [
      { id: "h-req-1", type: "requirement", label: "Fullfør Helse- og oppvekstfag VG1" },
      { id: "h-req-2", type: "requirement", label: "Få praksis/sommerjobb i helsesektoren" },
      { id: "h-req-3", type: "requirement", label: "Utvikle kommunikasjonsevner" },
      { id: "h-res-1", type: "resource", label: "Les på Helsedirektoratet", url: "https://www.helsedirektoratet.no" },
      { id: "h-res-2", type: "resource", label: "Utforsk Utdanning.no - Helse", url: "https://utdanning.no/tema/helse" },
      { id: "h-res-3", type: "resource", label: "Sjekk NSF (Sykepleierforbundet)", url: "https://www.nsf.no" },
      { id: "h-cert-1", type: "certification", label: "Fagbrev Helsefagarbeider" },
      { id: "h-cert-2", type: "certification", label: "Autorisasjon Helsepersonell" },
    ],
  },
  {
    id: "creative",
    name: "Kreative Tjenester",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    steps: [
      { id: "c-req-1", type: "requirement", label: "Bygg en portefølje med arbeid" },
      { id: "c-req-2", type: "requirement", label: "Lær kreative verktøy (Adobe, Figma)" },
      { id: "c-req-3", type: "requirement", label: "Start å dele arbeid på sosiale medier" },
      { id: "c-res-1", type: "resource", label: "Ta kurs på Skillshare", url: "https://www.skillshare.com" },
      { id: "c-res-2", type: "resource", label: "Lær på Canva Design School", url: "https://www.canva.com/designschool" },
      { id: "c-res-3", type: "resource", label: "YouTube Creator Academy", url: "https://creatoracademy.youtube.com" },
      { id: "c-cert-1", type: "certification", label: "Google Digital Marketing" },
      { id: "c-cert-2", type: "certification", label: "Meta Social Media Marketing" },
      { id: "c-cert-3", type: "certification", label: "Adobe Certified Professional" },
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
    <Card className="border-2 overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${currentChecklist?.color || "from-primary to-purple-500"}`} />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Getting Started Checklist
        </CardTitle>
        <CardDescription>Track your progress toward your dream career</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Industry Selector */}
        <div className="flex flex-wrap gap-2">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedIndustry === industry.id
                    ? `bg-gradient-to-r ${industry.color} text-white`
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <IndIcon className="h-3.5 w-3.5" />
                {industry.name}
              </button>
            );
          })}
        </div>

        {/* Progress Overview */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <span className="font-semibold">{currentChecklist?.name}</span>
            </div>
            {progress === 100 && (
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                <Trophy className="h-3 w-3 mr-1" />
                Fullført!
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fremgang</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {Object.entries(completedByType).map(([type, count]) => {
              const config = typeConfig[type as keyof typeof typeConfig];
              const total = currentChecklist?.steps.filter((s) => s.type === type).length || 0;
              return (
                <div key={type} className="p-2 rounded-lg bg-background">
                  <div className={`text-lg font-bold ${config.color}`}>
                    {count}/{total}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{config.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checklist */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <span className="font-semibold text-sm">Sjekkliste</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2 mt-2"
              >
                {isLoading ? (
                  <div className="py-4 text-center text-muted-foreground">
                    Laster fremgang...
                  </div>
                ) : (
                  currentChecklist?.steps.map((step) => {
                    const config = typeConfig[step.type];
                    const StepIcon = config.icon;
                    const isCompleted = completedSteps.has(step.id);

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleStep(step.id, step.type)}
                      >
                        <div
                          className={`flex-shrink-0 ${
                            isCompleted ? "text-green-600" : "text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                isCompleted ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {step.label}
                            </span>
                            {step.url && (
                              <a
                                href={step.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${isCompleted ? "opacity-50" : ""}`}
                        >
                          <StepIcon className={`h-3 w-3 mr-1 ${config.color}`} />
                          {config.label}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Motivation */}
        {progress > 0 && progress < 100 && (
          <div className="p-3 rounded-lg bg-primary/5 border flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Bra jobba! Du er på god vei. Fortsett å fullføre steg for å nå målet ditt i{" "}
              {currentChecklist?.name}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
