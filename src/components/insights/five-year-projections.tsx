"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Info,
  ArrowUpRight,
} from "lucide-react";

interface Projection {
  industry: string;
  current: number;
  year1: number;
  year3: number;
  year5: number;
  trend: "up" | "down" | "stable";
  drivers: string[];
  color: string;
}

const projections: Projection[] = [
  {
    industry: "Technology & AI",
    current: 100,
    year1: 115,
    year3: 145,
    year5: 180,
    trend: "up",
    drivers: ["AI-vekst", "Digitalisering", "Remote arbeid"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    industry: "Grønn Energi",
    current: 100,
    year1: 112,
    year3: 135,
    year5: 165,
    trend: "up",
    drivers: ["Klimamål", "Havvind-satsing", "EU Green Deal"],
    color: "from-green-500 to-teal-500",
  },
  {
    industry: "Helse & Omsorg",
    current: 100,
    year1: 108,
    year3: 125,
    year5: 150,
    trend: "up",
    drivers: ["Eldrebølge", "Kompetansemangel", "Velferdsteknologi"],
    color: "from-red-500 to-pink-500",
  },
  {
    industry: "Kreative Tjenester",
    current: 100,
    year1: 106,
    year3: 118,
    year5: 135,
    trend: "up",
    drivers: ["Digital innhold", "Merkevarebygging", "Sosiale medier"],
    color: "from-purple-500 to-pink-500",
  },
  {
    industry: "Finans & Banking",
    current: 100,
    year1: 98,
    year3: 95,
    year5: 90,
    trend: "down",
    drivers: ["Automatisering", "Fintech", "Konsolidering"],
    color: "from-emerald-600 to-green-700",
  },
  {
    industry: "Detaljhandel",
    current: 100,
    year1: 96,
    year3: 90,
    year5: 85,
    trend: "down",
    drivers: ["E-handel", "Automatisering", "Endrede vaner"],
    color: "from-amber-500 to-orange-500",
  },
];

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
  return <Minus className="h-4 w-4 text-yellow-600" />;
};

export function FiveYearProjections() {
  const maxValue = Math.max(...projections.flatMap((p) => [p.year1, p.year3, p.year5]));

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              5-Year Industry Projections
            </CardTitle>
            <CardDescription>Expected job market growth by industry (2025-2030)</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Januar 2025
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Projection Bars */}
        <div className="space-y-4">
          {projections.map((proj) => (
            <div key={proj.industry} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendIcon trend={proj.trend} />
                  <span className="font-medium text-sm">{proj.industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      proj.trend === "up"
                        ? "text-green-600"
                        : proj.trend === "down"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {proj.year5 > 100 ? "+" : ""}
                    {proj.year5 - 100}%
                  </span>
                  <span className="text-xs text-muted-foreground">i 2030</span>
                </div>
              </div>

              {/* Multi-year bar visualization */}
              <div className="flex items-center gap-1 h-6">
                {/* Current (baseline) */}
                <div
                  className="h-full bg-muted rounded-l"
                  style={{ width: `${(100 / maxValue) * 100}%` }}
                />
                {/* Year 1 growth */}
                <div
                  className={`h-full bg-gradient-to-r ${proj.color} opacity-40`}
                  style={{
                    width: `${((proj.year1 - 100) / maxValue) * 100}%`,
                    marginLeft: "-1px",
                  }}
                />
                {/* Year 3 growth */}
                <div
                  className={`h-full bg-gradient-to-r ${proj.color} opacity-60`}
                  style={{
                    width: `${((proj.year3 - proj.year1) / maxValue) * 100}%`,
                    marginLeft: "-1px",
                  }}
                />
                {/* Year 5 growth */}
                <div
                  className={`h-full bg-gradient-to-r ${proj.color} rounded-r`}
                  style={{
                    width: `${((proj.year5 - proj.year3) / maxValue) * 100}%`,
                    marginLeft: "-1px",
                  }}
                />
              </div>

              {/* Milestones */}
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Nå (100)</span>
                <span>2026 ({proj.year1})</span>
                <span>2028 ({proj.year3})</span>
                <span>2030 ({proj.year5})</span>
              </div>

              {/* Drivers */}
              <div className="flex flex-wrap gap-1">
                {proj.drivers.map((driver) => (
                  <span
                    key={driver}
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      proj.trend === "up"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : proj.trend === "down"
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                    }`}
                  >
                    {driver}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <span>Nå</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/40" />
            <span>2026</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/60" />
            <span>2028</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>2030</span>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-sm text-green-700 dark:text-green-400">
                Sterkest vekst
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Technology & AI</span> forventes å vokse 80% innen 2030,
              drevet av AI-revolusjon og digitalisering.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-sm text-red-700 dark:text-red-400">
                Automatiseringsrisiko
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Finans & Detaljhandel</span> vil se færre stillinger
              pga. automatisering og endrede forbrukervaner.
            </p>
          </div>
        </div>

        {/* Source */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Projeksjonene er basert på analyser fra NAV, SSB, og internasjonale arbeidsmarkedsrapporter.
            Faktisk utvikling kan avvike basert på teknologisk utvikling og økonomiske forhold.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
