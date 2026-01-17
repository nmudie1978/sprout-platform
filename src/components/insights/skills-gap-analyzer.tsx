"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Industry {
  id: string;
  name: string;
  requiredSkills: string[];
  color: string;
}

const industries: Industry[] = [
  {
    id: "tech",
    name: "Technology & AI",
    requiredSkills: ["programming", "problem-solving", "communication", "digital literacy", "english", "data analysis", "teamwork"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "green",
    name: "Grønn Energi",
    requiredSkills: ["technical skills", "safety awareness", "physical fitness", "teamwork", "problem-solving", "norwegian"],
    color: "from-green-500 to-teal-500",
  },
  {
    id: "health",
    name: "Helse & Omsorg",
    requiredSkills: ["empathy", "communication", "norwegian", "patience", "teamwork", "physical stamina", "attention to detail"],
    color: "from-red-500 to-pink-500",
  },
  {
    id: "creative",
    name: "Kreative Tjenester",
    requiredSkills: ["creativity", "design tools", "communication", "self-promotion", "time management", "english"],
    color: "from-purple-500 to-pink-500",
  },
];

export function SkillsGapAnalyzer() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("tech");

  // Fetch user's profile to get their skills
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) return null;
      return response.json();
    },
  });

  const userSkills = useMemo(() => {
    if (!profile?.skillTags) return [];
    return profile.skillTags.map((skill: string) => skill.toLowerCase());
  }, [profile]);

  const currentIndustry = industries.find((i) => i.id === selectedIndustry);

  const analysis = useMemo(() => {
    if (!currentIndustry) return { matched: [], missing: [], score: 0 };

    const matched = currentIndustry.requiredSkills.filter((skill) =>
      userSkills.some(
        (userSkill: string) =>
          userSkill.includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill)
      )
    );

    const missing = currentIndustry.requiredSkills.filter(
      (skill) => !matched.includes(skill)
    );

    const score = Math.round(
      (matched.length / currentIndustry.requiredSkills.length) * 100
    );

    return { matched, missing, score };
  }, [currentIndustry, userSkills]);

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">Loading your skills...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${currentIndustry?.color || "from-primary to-purple-500"}`} />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Skills Gap Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Industry Selector */}
        <div className="flex flex-wrap gap-2">
          {industries.map((industry) => (
            <button
              key={industry.id}
              onClick={() => setSelectedIndustry(industry.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedIndustry === industry.id
                  ? `bg-gradient-to-r ${industry.color} text-white`
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {industry.name}
            </button>
          ))}
        </div>

        {userSkills.length === 0 ? (
          <div className="text-center py-6 bg-muted/30 rounded-xl">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              Add skills to your profile to see your gap analysis
            </p>
            <Button asChild size="sm">
              <Link href="/profile">
                Update Profile
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Score */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={selectedIndustry}
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${currentIndustry?.color} text-white shadow-lg`}
              >
                <div>
                  <div className="text-3xl font-bold">{analysis.score}%</div>
                  <div className="text-xs opacity-80">Match</div>
                </div>
              </motion.div>
              <p className="mt-3 text-sm text-muted-foreground">
                {analysis.score >= 80
                  ? "Great match! You have most skills needed."
                  : analysis.score >= 50
                  ? "Good foundation. Focus on the gaps below."
                  : "Building your skills will help you break into this field."}
              </p>
            </div>

            {/* Skills You Have */}
            {analysis.matched.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Skills You Have ({analysis.matched.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.matched.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to Develop */}
            {analysis.missing.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  Skills to Develop ({analysis.missing.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-orange-300 text-orange-700 dark:text-orange-400"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Industry Readiness</span>
                <span>{analysis.matched.length}/{currentIndustry?.requiredSkills.length} skills</span>
              </div>
              <Progress value={analysis.score} className="h-2" />
            </div>

            {/* Tip */}
            <div className="p-3 rounded-lg bg-primary/5 border flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Tip:</span> Complete jobs in {currentIndustry?.name}
                to build relevant experience and fill these skill gaps naturally.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
