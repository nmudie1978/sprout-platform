"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Code,
  Wrench,
  Heart,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  options: {
    text: string;
    scores: { tech: number; green: number; health: number; creative: number };
  }[];
}

const questions: Question[] = [
  {
    id: "work-style",
    question: "How do you prefer to work?",
    options: [
      { text: "Solving puzzles and logical problems", scores: { tech: 3, green: 1, health: 0, creative: 1 } },
      { text: "Working with my hands and physical tasks", scores: { tech: 0, green: 3, health: 1, creative: 1 } },
      { text: "Helping and supporting other people", scores: { tech: 0, green: 0, health: 3, creative: 1 } },
      { text: "Creating and designing new things", scores: { tech: 1, green: 0, health: 0, creative: 3 } },
    ],
  },
  {
    id: "environment",
    question: "What work environment appeals to you most?",
    options: [
      { text: "Modern office or working from home", scores: { tech: 3, green: 0, health: 0, creative: 2 } },
      { text: "Outdoors or industrial settings", scores: { tech: 0, green: 3, health: 0, creative: 0 } },
      { text: "Hospitals, clinics, or care facilities", scores: { tech: 0, green: 0, health: 3, creative: 0 } },
      { text: "Studios, agencies, or freelancing", scores: { tech: 1, green: 0, health: 0, creative: 3 } },
    ],
  },
  {
    id: "motivation",
    question: "What motivates you most at work?",
    options: [
      { text: "Building innovative solutions", scores: { tech: 3, green: 1, health: 0, creative: 2 } },
      { text: "Contributing to sustainability and the environment", scores: { tech: 1, green: 3, health: 1, creative: 0 } },
      { text: "Making a difference in people's lives", scores: { tech: 0, green: 1, health: 3, creative: 1 } },
      { text: "Expressing myself and inspiring others", scores: { tech: 0, green: 0, health: 1, creative: 3 } },
    ],
  },
  {
    id: "learning",
    question: "How do you prefer to learn new things?",
    options: [
      { text: "Online courses and documentation", scores: { tech: 3, green: 1, health: 1, creative: 2 } },
      { text: "Hands-on training and apprenticeships", scores: { tech: 1, green: 3, health: 2, creative: 1 } },
      { text: "Structured education with mentorship", scores: { tech: 1, green: 1, health: 3, creative: 1 } },
      { text: "Self-directed experimentation", scores: { tech: 2, green: 0, health: 0, creative: 3 } },
    ],
  },
  {
    id: "salary-vs-passion",
    question: "What matters more to you?",
    options: [
      { text: "High earning potential and career growth", scores: { tech: 3, green: 2, health: 1, creative: 1 } },
      { text: "Job security and steady work", scores: { tech: 1, green: 3, health: 2, creative: 0 } },
      { text: "Meaningful work that helps others", scores: { tech: 0, green: 2, health: 3, creative: 1 } },
      { text: "Creative freedom and flexibility", scores: { tech: 2, green: 0, health: 0, creative: 3 } },
    ],
  },
  {
    id: "social",
    question: "How social do you want your work to be?",
    options: [
      { text: "Collaborative teams with some solo work", scores: { tech: 3, green: 1, health: 1, creative: 2 } },
      { text: "Small teams with hands-on collaboration", scores: { tech: 1, green: 3, health: 1, creative: 1 } },
      { text: "Working closely with people every day", scores: { tech: 0, green: 1, health: 3, creative: 1 } },
      { text: "Independent work with client interaction", scores: { tech: 1, green: 0, health: 0, creative: 3 } },
    ],
  },
];

const industryInfo = {
  tech: {
    name: "Technology & AI",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    description: "Build apps, analyze data, and shape the digital future.",
  },
  green: {
    name: "Grønn Energi & Maritim",
    icon: Wrench,
    color: "from-green-500 to-teal-500",
    description: "Power Norway's sustainable future with hands-on technical work.",
  },
  health: {
    name: "Helse & Omsorg",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    description: "Make a real difference in people's lives through care and support.",
  },
  creative: {
    name: "Kreative Tjenester",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    description: "Express yourself through design, content, and visual storytelling.",
  },
};

type IndustryKey = keyof typeof industryInfo;

export function CareerQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateResults = () => {
    const scores = { tech: 0, green: 0, health: 0, creative: 0 };

    answers.forEach((answerIndex, questionIndex) => {
      const question = questions[questionIndex];
      const option = question.options[answerIndex];
      scores.tech += option.scores.tech;
      scores.green += option.scores.green;
      scores.health += option.scores.health;
      scores.creative += option.scores.creative;
    });

    const maxScore = Math.max(...Object.values(scores));
    const total = scores.tech + scores.green + scores.health + scores.creative;

    return Object.entries(scores)
      .map(([key, score]) => ({
        id: key as IndustryKey,
        score,
        percentage: Math.round((score / total) * 100),
        isTop: score === maxScore,
      }))
      .sort((a, b) => b.score - a.score);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setIsStarted(false);
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  if (!isStarted) {
    return (
      <Card className="border-2 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <CardTitle>Career Industry Quiz</CardTitle>
          <CardDescription>
            Find out which industry matches your personality and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              {questions.length} quick questions
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Takes about 2 minutes
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Get personalized industry recommendations
            </div>
          </div>
          <Button
            onClick={() => setIsStarted(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Start Quiz
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const results = calculateResults();
    const topResult = results[0];
    const TopIcon = industryInfo[topResult.id].icon;

    return (
      <Card className="border-2 overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${industryInfo[topResult.id].color}`} />
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${industryInfo[topResult.id].color} flex items-center justify-center shadow-lg`}
          >
            <TopIcon className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Your Top Match
          </CardTitle>
          <CardDescription className="text-lg font-semibold text-foreground mt-2">
            {industryInfo[topResult.id].name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {industryInfo[topResult.id].description}
          </p>

          {/* All Results */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Your Industry Fit:</p>
            {results.map((result, index) => {
              const Icon = industryInfo[result.id].icon;
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    result.isTop ? "border-primary bg-primary/5" : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md bg-gradient-to-br ${industryInfo[result.id].color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-sm">{industryInfo[result.id].name}</span>
                      {result.isTop && (
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                          Best Match
                        </Badge>
                      )}
                    </div>
                    <span className="font-bold">{result.percentage}%</span>
                  </div>
                  <Progress value={result.percentage} className="h-2" />
                </motion.div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetQuiz} className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
            <Button className="flex-1" asChild>
              <a href={`#${topResult.id}`}>
                Explore {industryInfo[topResult.id].name.split(" ")[0]}
                <ChevronRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          {currentQuestion > 0 && (
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-2 mb-4" />
        <CardTitle className="text-lg">{question.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full p-4 text-left rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-sm"
              >
                {option.text}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
