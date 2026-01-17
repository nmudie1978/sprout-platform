"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Star,
  Code,
  Wrench,
  Heart,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  tip: string;
  exampleAnswer?: string;
  difficulty: "easy" | "medium" | "hard";
}

interface IndustryQuestions {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  questions: Question[];
}

const industryQuestions: IndustryQuestions[] = [
  {
    id: "general",
    name: "General",
    icon: MessageSquare,
    color: "from-slate-500 to-gray-600",
    questions: [
      {
        id: "g1",
        question: "Tell me about yourself",
        tip: "Keep it brief (2 min). Focus on relevant experience, skills, and why you're interested in this role.",
        exampleAnswer: "I'm a motivated person who enjoys [relevant skill]. I've gained experience through [examples], and I'm excited about this opportunity because [connection to role].",
        difficulty: "easy",
      },
      {
        id: "g2",
        question: "Why do you want to work here?",
        tip: "Research the company beforehand. Mention specific things that attract you - their values, projects, or growth.",
        difficulty: "easy",
      },
      {
        id: "g3",
        question: "What are your strengths and weaknesses?",
        tip: "For strengths, give examples. For weaknesses, show self-awareness and what you're doing to improve.",
        exampleAnswer: "My strength is [skill with example]. A weakness I'm working on is [genuine weakness], and I'm improving by [specific action].",
        difficulty: "medium",
      },
      {
        id: "g4",
        question: "Where do you see yourself in 5 years?",
        tip: "Show ambition but be realistic. Connect your goals to the company's growth path.",
        difficulty: "medium",
      },
      {
        id: "g5",
        question: "Tell me about a challenge you've overcome",
        tip: "Use the STAR method: Situation, Task, Action, Result. Focus on what you learned.",
        difficulty: "medium",
      },
    ],
  },
  {
    id: "tech",
    name: "Tech & IT",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    questions: [
      {
        id: "t1",
        question: "What programming languages/technologies do you know?",
        tip: "Be honest about your skill level. It's okay to be learning - show enthusiasm for growth.",
        difficulty: "easy",
      },
      {
        id: "t2",
        question: "Tell me about a project you've built",
        tip: "Describe the problem, your approach, technologies used, and what you learned. Have your portfolio ready.",
        difficulty: "easy",
      },
      {
        id: "t3",
        question: "How do you stay updated with technology?",
        tip: "Mention specific resources: newsletters, YouTube channels, courses, communities you follow.",
        difficulty: "easy",
      },
      {
        id: "t4",
        question: "How do you approach debugging a problem?",
        tip: "Show systematic thinking: reproduce issue, check logs, isolate the problem, test hypotheses.",
        difficulty: "medium",
      },
      {
        id: "t5",
        question: "Explain a technical concept to a non-technical person",
        tip: "Use analogies and simple language. This tests communication skills crucial for teamwork.",
        difficulty: "hard",
      },
    ],
  },
  {
    id: "green",
    name: "Green Energy",
    icon: Wrench,
    color: "from-green-500 to-teal-500",
    questions: [
      {
        id: "gr1",
        question: "Why are you interested in the energy sector?",
        tip: "Show genuine passion for sustainability and Norway's energy transition. Mention specific projects.",
        difficulty: "easy",
      },
      {
        id: "gr2",
        question: "How do you handle working in challenging physical conditions?",
        tip: "Give examples of outdoor work, physical challenges, or shift work you've done.",
        difficulty: "medium",
      },
      {
        id: "gr3",
        question: "Describe your approach to safety at work",
        tip: "Safety is critical in this industry. Show you take it seriously with specific examples.",
        difficulty: "medium",
      },
      {
        id: "gr4",
        question: "Tell me about your technical certifications",
        tip: "List relevant certs (fagbrev, safety courses). If you don't have them yet, show your plan to get them.",
        difficulty: "easy",
      },
      {
        id: "gr5",
        question: "How do you work in a team on physical projects?",
        tip: "Emphasize communication, following procedures, and supporting colleagues.",
        difficulty: "medium",
      },
    ],
  },
  {
    id: "health",
    name: "Healthcare",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    questions: [
      {
        id: "h1",
        question: "Why do you want to work in healthcare?",
        tip: "Be genuine about your motivation to help others. Personal stories can be powerful here.",
        difficulty: "easy",
      },
      {
        id: "h2",
        question: "How do you handle stressful situations?",
        tip: "Give specific examples. Show you can stay calm and prioritize patient care.",
        difficulty: "medium",
      },
      {
        id: "h3",
        question: "Tell me about a time you showed empathy",
        tip: "Healthcare requires emotional intelligence. Share a genuine story about understanding others.",
        difficulty: "medium",
      },
      {
        id: "h4",
        question: "How do you handle difficult patients or family members?",
        tip: "Show patience, communication skills, and understanding that people are often scared or frustrated.",
        difficulty: "hard",
      },
      {
        id: "h5",
        question: "What would you do if you made a mistake?",
        tip: "Honesty and accountability are crucial. Report it, learn from it, prevent it happening again.",
        difficulty: "hard",
      },
    ],
  },
  {
    id: "creative",
    name: "Creative",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    questions: [
      {
        id: "c1",
        question: "Walk me through your portfolio",
        tip: "Have your best work ready. Explain your process, not just the final result.",
        difficulty: "easy",
      },
      {
        id: "c2",
        question: "How do you handle creative feedback or criticism?",
        tip: "Show you're open to feedback and see it as improvement, not personal criticism.",
        difficulty: "medium",
      },
      {
        id: "c3",
        question: "What's your creative process?",
        tip: "Describe your workflow: research, ideation, drafts, refinement. Show you have structure.",
        difficulty: "medium",
      },
      {
        id: "c4",
        question: "How do you stay creative and inspired?",
        tip: "Mention specific sources of inspiration, communities, and how you avoid creative blocks.",
        difficulty: "easy",
      },
      {
        id: "c5",
        question: "Tell me about a project that didn't go as planned",
        tip: "Show resilience and problem-solving. What did you learn and how did you adapt?",
        difficulty: "hard",
      },
    ],
  },
];

const difficultyColors = {
  easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function InterviewPrepBank() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("general");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const currentIndustry = industryQuestions.find((i) => i.id === selectedIndustry);

  return (
    <Card className="border-2 overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${currentIndustry?.color || "from-primary to-purple-500"}`} />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Interview Prep Bank
        </CardTitle>
        <CardDescription>Practice common interview questions with tips</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Industry Selector */}
        <div className="flex flex-wrap gap-2">
          {industryQuestions.map((industry) => {
            const Icon = industry.icon;
            return (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedIndustry === industry.id
                    ? `bg-gradient-to-r ${industry.color} text-white`
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {industry.name}
              </button>
            );
          })}
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {currentIndustry?.questions.map((question) => (
            <div
              key={question.id}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedQuestion(
                    expandedQuestion === question.id ? null : question.id
                  )
                }
                className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge className={difficultyColors[question.difficulty]}>
                    {question.difficulty}
                  </Badge>
                  <span className="font-medium text-sm">{question.question}</span>
                </div>
                {expandedQuestion === question.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {expandedQuestion === question.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t"
                  >
                    <div className="p-4 space-y-4 bg-muted/30">
                      {/* Tip */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                            Tip
                          </p>
                          <p className="text-sm text-muted-foreground">{question.tip}</p>
                        </div>
                      </div>

                      {/* Example Answer */}
                      {question.exampleAnswer && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                            <Star className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                              Example Structure
                            </p>
                            <p className="text-sm text-muted-foreground italic">
                              "{question.exampleAnswer}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Pro Tip */}
        <div className="p-4 rounded-lg bg-primary/5 border">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">Pro Tip</p>
              <p className="text-xs text-muted-foreground">
                Practice answering these questions out loud - it's very different from just reading them.
                Record yourself or practice with a friend to get comfortable speaking about yourself.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
