"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Clock,
  Coins,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface EducationPath {
  id: string;
  name: string;
  duration: string;
  durationYears: number;
  cost: number; // Total cost in NOK
  earnWhileLearning: number; // Monthly income while studying
  startingSalary: number;
  fiveYearSalary: number;
  description: string;
  pros: string[];
}

const educationPaths: EducationPath[] = [
  {
    id: "bootcamp",
    name: "Bootcamp / Selvlært",
    duration: "3-12 mnd",
    durationYears: 0.75,
    cost: 50000, // Bootcamp fees
    earnWhileLearning: 15000, // Part-time work
    startingSalary: 420000,
    fiveYearSalary: 650000,
    description: "Intensive coding bootcamp or self-taught path with online resources",
    pros: ["Raskest vei til jobb", "Lav kostnad", "Praktisk fokus"],
  },
  {
    id: "fagbrev",
    name: "Fagbrev (Lærling)",
    duration: "2-4 år",
    durationYears: 3,
    cost: 0, // Free + you earn money
    earnWhileLearning: 12000, // Lærlinglønn
    startingSalary: 450000,
    fiveYearSalary: 580000,
    description: "Yrkesfaglig utdanning med lærlingplass i bedrift",
    pros: ["Lønn under opplæring", "Høy jobbsikkerhet", "Praktisk erfaring"],
  },
  {
    id: "bachelor",
    name: "Bachelor (3 år)",
    duration: "3 år",
    durationYears: 3,
    cost: 15000, // Semesteravgift + materiell
    earnWhileLearning: 8000, // Deltidsjobb
    startingSalary: 480000,
    fiveYearSalary: 680000,
    description: "Universitets- eller høyskoleutdanning",
    pros: ["Bred kompetanse", "Akademisk nettverk", "Flere karriereveier"],
  },
  {
    id: "master",
    name: "Master (5 år)",
    duration: "5 år",
    durationYears: 5,
    cost: 25000,
    earnWhileLearning: 6000,
    startingSalary: 520000,
    fiveYearSalary: 780000,
    description: "Full universitetsgrad med spesialisering",
    pros: ["Høyest startlønn", "Lederstillinger", "Forskning/spesialisering"],
  },
];

export function EducationROICalculator() {
  const [selectedPaths, setSelectedPaths] = useState<string[]>(["bootcamp", "fagbrev"]);

  const togglePath = (pathId: string) => {
    if (selectedPaths.includes(pathId)) {
      if (selectedPaths.length > 1) {
        setSelectedPaths(selectedPaths.filter((id) => id !== pathId));
      }
    } else if (selectedPaths.length < 3) {
      setSelectedPaths([...selectedPaths, pathId]);
    }
  };

  const calculateROI = (path: EducationPath) => {
    // Calculate total investment (cost + opportunity cost)
    const opportunityCost = path.durationYears * 400000; // Could have earned ~400k/year
    const earningsDuringStudy = path.earnWhileLearning * 12 * path.durationYears;
    const totalInvestment = path.cost + opportunityCost - earningsDuringStudy;

    // Calculate 5-year earnings after graduation
    const avgSalary = (path.startingSalary + path.fiveYearSalary) / 2;
    const fiveYearEarnings = avgSalary * 5;

    // ROI calculation
    const roi = Math.round(((fiveYearEarnings - totalInvestment) / totalInvestment) * 100);

    // Time to "break even" compared to starting work immediately
    const breakEvenYears = totalInvestment / path.startingSalary;

    return {
      totalInvestment,
      fiveYearEarnings,
      roi,
      breakEvenYears: Math.round(breakEvenYears * 10) / 10,
      netGain: fiveYearEarnings - totalInvestment,
    };
  };

  const selectedPathData = useMemo(() => {
    return selectedPaths.map((pathId) => {
      const path = educationPaths.find((p) => p.id === pathId)!;
      return {
        ...path,
        roi: calculateROI(path),
      };
    });
  }, [selectedPaths]);

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-primary" />
          Education ROI Calculator
        </CardTitle>
        <CardDescription>Compare education paths and their return on investment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Path Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select paths to compare (up to 3)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {educationPaths.map((path) => (
              <button
                key={path.id}
                onClick={() => togglePath(path.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedPaths.includes(path.id)
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{path.name}</span>
                  {selectedPaths.includes(path.id) && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {path.duration}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 bg-muted/50 rounded-tl-lg">Kategori</th>
                {selectedPathData.map((path) => (
                  <th key={path.id} className="p-3 bg-muted/50 text-center last:rounded-tr-lg">
                    {path.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Varighet
                </td>
                {selectedPathData.map((path) => (
                  <td key={path.id} className="p-3 text-center">{path.duration}</td>
                ))}
              </tr>
              <tr className="border-b bg-muted/20">
                <td className="p-3 font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  Total investering
                </td>
                {selectedPathData.map((path) => (
                  <td key={path.id} className="p-3 text-center">
                    {path.roi.totalInvestment.toLocaleString("no-NO")} kr
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium">Startlønn</td>
                {selectedPathData.map((path) => (
                  <td key={path.id} className="p-3 text-center">
                    {path.startingSalary.toLocaleString("no-NO")} kr
                  </td>
                ))}
              </tr>
              <tr className="border-b bg-muted/20">
                <td className="p-3 font-medium">Lønn etter 5 år</td>
                {selectedPathData.map((path) => (
                  <td key={path.id} className="p-3 text-center">
                    {path.fiveYearSalary.toLocaleString("no-NO")} kr
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  5-års ROI
                </td>
                {selectedPathData.map((path) => {
                  const isHighest = path.roi.roi === Math.max(...selectedPathData.map((p) => p.roi.roi));
                  return (
                    <td key={path.id} className="p-3 text-center">
                      <Badge className={isHighest ? "bg-green-600" : "bg-muted text-muted-foreground"}>
                        {path.roi.roi}%
                      </Badge>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b bg-muted/20">
                <td className="p-3 font-medium">Break-even tid</td>
                {selectedPathData.map((path) => (
                  <td key={path.id} className="p-3 text-center">
                    ~{path.roi.breakEvenYears} år
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pros for each path */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {selectedPathData.map((path) => (
            <div key={path.id} className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold mb-2">{path.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{path.description}</p>
              <ul className="space-y-1">
                {path.pros.map((pro, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Key Insight */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">Key Insight</p>
              <p className="text-xs text-muted-foreground">
                While longer education paths have higher starting salaries, shorter paths like bootcamps
                and apprenticeships often have the best ROI due to earlier entry into the workforce and
                lower costs. Consider your personal circumstances and career goals.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
