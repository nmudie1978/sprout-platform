"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Banknote,
  Flame,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  BarChart3,
  Globe,
  Clock,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { CareerGoal } from "@/lib/goals/types";

// Industry data with detailed stats
const INDUSTRY_DATA: Record<string, {
  name: string;
  emoji: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  growth: number;
  growthLabel: string;
  avgSalary: string;
  entrySalary: string;
  openPositions: string;
  topDemand: string[];
  hotRoles: { title: string; growth: number }[];
  remoteScore: number;
  futureOutlook: string;
  keyTrend: string;
}> = {
  tech: {
    name: "Technology & IT",
    emoji: "💻",
    color: "blue",
    gradientFrom: "from-blue-500",
    gradientTo: "to-cyan-500",
    growth: 23,
    growthLabel: "+23% job growth",
    avgSalary: "650,000 kr",
    entrySalary: "480,000 kr",
    openPositions: "12,400+",
    topDemand: ["Cloud Computing", "AI/ML", "Cybersecurity", "Full-Stack Dev"],
    hotRoles: [
      { title: "AI Engineer", growth: 45 },
      { title: "Cloud Architect", growth: 32 },
      { title: "DevOps Engineer", growth: 28 },
      { title: "Data Scientist", growth: 25 },
    ],
    remoteScore: 85,
    futureOutlook: "Exceptional",
    keyTrend: "AI integration across all sectors driving massive demand",
  },
  healthcare: {
    name: "Healthcare",
    emoji: "🏥",
    color: "red",
    gradientFrom: "from-red-500",
    gradientTo: "to-pink-500",
    growth: 18,
    growthLabel: "+18% job growth",
    avgSalary: "580,000 kr",
    entrySalary: "420,000 kr",
    openPositions: "8,200+",
    topDemand: ["Nursing", "Mental Health", "Elder Care", "Digital Health"],
    hotRoles: [
      { title: "Nurse Specialist", growth: 22 },
      { title: "Health Tech", growth: 35 },
      { title: "Mental Health Pro", growth: 28 },
      { title: "Care Coordinator", growth: 18 },
    ],
    remoteScore: 20,
    futureOutlook: "Very Strong",
    keyTrend: "Aging population creating sustained demand",
  },
  green: {
    name: "Green Energy",
    emoji: "🌱",
    color: "green",
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-500",
    growth: 20,
    growthLabel: "+20% job growth",
    avgSalary: "620,000 kr",
    entrySalary: "450,000 kr",
    openPositions: "5,800+",
    topDemand: ["Wind Energy", "Solar Tech", "EV Infrastructure", "Sustainability"],
    hotRoles: [
      { title: "Wind Technician", growth: 38 },
      { title: "Solar Installer", growth: 30 },
      { title: "EV Specialist", growth: 42 },
      { title: "Energy Analyst", growth: 25 },
    ],
    remoteScore: 25,
    futureOutlook: "Excellent",
    keyTrend: "Norway's green transition accelerating rapidly",
  },
  creative: {
    name: "Creative & Media",
    emoji: "🎨",
    color: "purple",
    gradientFrom: "from-purple-500",
    gradientTo: "to-pink-500",
    growth: 14,
    growthLabel: "+14% job growth",
    avgSalary: "520,000 kr",
    entrySalary: "380,000 kr",
    openPositions: "4,100+",
    topDemand: ["UX Design", "Content Creation", "Video Production", "Digital Marketing"],
    hotRoles: [
      { title: "UX Designer", growth: 25 },
      { title: "Content Creator", growth: 32 },
      { title: "Video Editor", growth: 20 },
      { title: "Brand Strategist", growth: 18 },
    ],
    remoteScore: 80,
    futureOutlook: "Strong",
    keyTrend: "AI tools amplifying creative productivity",
  },
  trades: {
    name: "Skilled Trades",
    emoji: "🔧",
    color: "amber",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-500",
    growth: 15,
    growthLabel: "+15% job growth",
    avgSalary: "560,000 kr",
    entrySalary: "400,000 kr",
    openPositions: "7,500+",
    topDemand: ["Electricians", "Plumbers", "HVAC", "Construction"],
    hotRoles: [
      { title: "Electrician", growth: 20 },
      { title: "Heat Pump Tech", growth: 35 },
      { title: "Automation Tech", growth: 28 },
      { title: "Industrial Mech", growth: 18 },
    ],
    remoteScore: 5,
    futureOutlook: "Very Strong",
    keyTrend: "Shortage of skilled workers driving wages up",
  },
  finance: {
    name: "Finance & Business",
    emoji: "📊",
    color: "slate",
    gradientFrom: "from-slate-500",
    gradientTo: "to-zinc-500",
    growth: 12,
    growthLabel: "+12% job growth",
    avgSalary: "680,000 kr",
    entrySalary: "500,000 kr",
    openPositions: "6,200+",
    topDemand: ["FinTech", "Data Analytics", "Risk Management", "ESG"],
    hotRoles: [
      { title: "FinTech Developer", growth: 30 },
      { title: "ESG Analyst", growth: 28 },
      { title: "Data Analyst", growth: 22 },
      { title: "Risk Manager", growth: 15 },
    ],
    remoteScore: 70,
    futureOutlook: "Strong",
    keyTrend: "Digital transformation and ESG focus",
  },
};

// Map career titles to industry keys
function getIndustryFromGoal(goalTitle: string): string {
  const lower = goalTitle.toLowerCase();

  if (lower.includes("developer") || lower.includes("software") ||
      lower.includes("data") || lower.includes("engineer") ||
      lower.includes("it ") || lower.includes("cyber") ||
      lower.includes("ai") || lower.includes("programmer") ||
      lower.includes("tech")) {
    return "tech";
  }
  if (lower.includes("health") || lower.includes("nurse") ||
      lower.includes("medical") || lower.includes("care") ||
      lower.includes("doctor") || lower.includes("pharmacy") ||
      lower.includes("therapist")) {
    return "healthcare";
  }
  if (lower.includes("energy") || lower.includes("wind") ||
      lower.includes("solar") || lower.includes("electric") ||
      lower.includes("green") || lower.includes("sustain") ||
      lower.includes("environment")) {
    return "green";
  }
  if (lower.includes("design") || lower.includes("creative") ||
      lower.includes("content") || lower.includes("media") ||
      lower.includes("video") || lower.includes("art") ||
      lower.includes("music") || lower.includes("market")) {
    return "creative";
  }
  if (lower.includes("electrician") || lower.includes("plumb") ||
      lower.includes("mechanic") || lower.includes("construction") ||
      lower.includes("carpenter") || lower.includes("hvac") ||
      lower.includes("technician") || lower.includes("welder")) {
    return "trades";
  }
  if (lower.includes("finance") || lower.includes("account") ||
      lower.includes("business") || lower.includes("bank") ||
      lower.includes("invest") || lower.includes("consult")) {
    return "finance";
  }

  return "tech"; // Default
}

// Mini bar chart component
function MiniBarChart({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = (value / max) * 100;
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Growth indicator with animation
function GrowthIndicator({ growth, color }: { growth: number; color: string }) {
  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={`${(growth / 50) * 176} 176`}
          className={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold">+{growth}%</span>
      </div>
    </div>
  );
}

export function IndustrySnapshot() {
  const { data: session } = useSession();
  const isYouth = session?.user?.role === "YOUTH";

  // Fetch user's goals
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    },
    enabled: !!session?.user?.id && isYouth,
  });

  const primaryGoal: CareerGoal | null = goalsData?.primaryGoal || null;

  // Get industry based on primary goal or default to tech
  const industryKey = primaryGoal ? getIndustryFromGoal(primaryGoal.title) : "tech";
  const industry = INDUSTRY_DATA[industryKey];

  // Color mappings for Tailwind
  const colorClasses: Record<string, { text: string; bg: string; border: string; ring: string }> = {
    blue: { text: "text-blue-600", bg: "bg-blue-500", border: "border-blue-200 dark:border-blue-800", ring: "ring-blue-500" },
    red: { text: "text-red-600", bg: "bg-red-500", border: "border-red-200 dark:border-red-800", ring: "ring-red-500" },
    green: { text: "text-green-600", bg: "bg-green-500", border: "border-green-200 dark:border-green-800", ring: "ring-green-500" },
    purple: { text: "text-purple-600", bg: "bg-purple-500", border: "border-purple-200 dark:border-purple-800", ring: "ring-purple-500" },
    amber: { text: "text-amber-600", bg: "bg-amber-500", border: "border-amber-200 dark:border-amber-800", ring: "ring-amber-500" },
    slate: { text: "text-slate-600", bg: "bg-slate-500", border: "border-slate-200 dark:border-slate-800", ring: "ring-slate-500" },
  };

  const colors = colorClasses[industry.color];

  if (isLoading) {
    return (
      <Card className="border-2 animate-pulse">
        <CardContent className="py-8">
          <div className="h-6 bg-muted rounded w-48 mb-4" />
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${colors.border} overflow-hidden`}>
      {/* Gradient header bar */}
      <div className={`h-1.5 bg-gradient-to-r ${industry.gradientFrom} ${industry.gradientTo}`} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-3xl p-2 rounded-xl bg-gradient-to-br ${industry.gradientFrom} ${industry.gradientTo} bg-opacity-10`}>
              {industry.emoji}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {industry.name}
                <Badge variant="secondary" className="text-[10px]">2026</Badge>
              </CardTitle>
              {primaryGoal && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Based on your goal: <span className="font-medium">{primaryGoal.title}</span>
                </p>
              )}
            </div>
          </div>
          <GrowthIndicator growth={industry.growth} color={colors.text} />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className={`h-3.5 w-3.5 ${colors.text}`} />
              <span className="text-[10px] font-medium text-muted-foreground">Growth</span>
            </div>
            <p className={`text-lg font-bold ${colors.text}`}>{industry.growthLabel}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-1.5 mb-1">
              <Banknote className="h-3.5 w-3.5 text-green-600" />
              <span className="text-[10px] font-medium text-muted-foreground">Avg Salary</span>
            </div>
            <p className="text-lg font-bold text-green-600">{industry.avgSalary}</p>
            <p className="text-[10px] text-muted-foreground">Entry: {industry.entrySalary}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-[10px] font-medium text-muted-foreground">Open Positions</span>
            </div>
            <p className="text-lg font-bold text-indigo-600">{industry.openPositions}</p>
            <p className="text-[10px] text-muted-foreground">in Norway</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-1.5 mb-1">
              <Globe className="h-3.5 w-3.5 text-cyan-600" />
              <span className="text-[10px] font-medium text-muted-foreground">Remote Friendly</span>
            </div>
            <p className="text-lg font-bold text-cyan-600">{industry.remoteScore}%</p>
            <MiniBarChart value={industry.remoteScore} max={100} color="from-cyan-500 to-blue-500" />
          </div>
        </div>

        {/* Hot Roles Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-semibold">Hottest Roles in 2026</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {industry.hotRoles.map((role, index) => (
              <div
                key={role.title}
                className="flex items-center justify-between p-2 rounded-lg border bg-gradient-to-r from-muted/30 to-transparent hover:from-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${colors.text}`}>#{index + 1}</span>
                  <span className="text-sm font-medium">{role.title}</span>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                >
                  +{role.growth}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Top Demand Skills */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Top Demand Skills</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {industry.topDemand.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className={`text-xs ${colors.border}`}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Key Trend Highlight */}
        <div className={`p-3 rounded-lg bg-gradient-to-r ${industry.gradientFrom}/10 ${industry.gradientTo}/10 border ${colors.border}`}>
          <div className="flex items-start gap-2">
            <Sparkles className={`h-4 w-4 ${colors.text} mt-0.5 flex-shrink-0`} />
            <div>
              <p className="text-xs font-semibold mb-0.5">Key Trend</p>
              <p className="text-sm text-muted-foreground">{industry.keyTrend}</p>
            </div>
          </div>
        </div>

        {/* Future Outlook */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-sm">
              <span className="text-muted-foreground">Future Outlook:</span>{" "}
              <span className={`font-semibold ${colors.text}`}>{industry.futureOutlook}</span>
            </span>
          </div>
          <Link href="/careers">
            <Button variant="ghost" size="sm" className="text-xs">
              Explore Careers
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Set Goal CTA if no goal */}
        {!primaryGoal && isYouth && (
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Set a career goal</p>
                <p className="text-xs text-muted-foreground">Get personalised industry insights</p>
              </div>
              <Link href="/goals">
                <Button size="sm" variant="outline" className="border-purple-300 dark:border-purple-700">
                  Set Goal
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
