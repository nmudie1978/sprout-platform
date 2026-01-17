"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Calculator,
  MapPin,
  Briefcase,
  TrendingUp,
  Info,
} from "lucide-react";

interface SalaryData {
  role: string;
  baseSalary: number; // Entry level in NOK
  maxSalary: number;
  growthPerYear: number; // Percentage increase per year of experience
}

const salaryData: Record<string, SalaryData[]> = {
  tech: [
    { role: "Junior Utvikler", baseSalary: 450000, maxSalary: 800000, growthPerYear: 8 },
    { role: "IT Support", baseSalary: 380000, maxSalary: 550000, growthPerYear: 5 },
    { role: "Data Analyst", baseSalary: 420000, maxSalary: 750000, growthPerYear: 7 },
    { role: "UX Designer", baseSalary: 400000, maxSalary: 700000, growthPerYear: 6 },
  ],
  green: [
    { role: "Energimontør", baseSalary: 420000, maxSalary: 650000, growthPerYear: 5 },
    { role: "Havvind-tekniker", baseSalary: 480000, maxSalary: 750000, growthPerYear: 6 },
    { role: "Elektriker", baseSalary: 400000, maxSalary: 600000, growthPerYear: 4 },
    { role: "Skipsmekaniker", baseSalary: 450000, maxSalary: 680000, growthPerYear: 5 },
  ],
  health: [
    { role: "Helsefagarbeider", baseSalary: 380000, maxSalary: 520000, growthPerYear: 3 },
    { role: "Sykepleier", baseSalary: 450000, maxSalary: 600000, growthPerYear: 4 },
    { role: "Apotek-assistent", baseSalary: 360000, maxSalary: 480000, growthPerYear: 3 },
    { role: "Ambulansearbeider", baseSalary: 420000, maxSalary: 580000, growthPerYear: 4 },
  ],
  creative: [
    { role: "Grafisk Designer", baseSalary: 350000, maxSalary: 550000, growthPerYear: 5 },
    { role: "Innholdsskaper", baseSalary: 320000, maxSalary: 600000, growthPerYear: 8 },
    { role: "Videoredigerer", baseSalary: 340000, maxSalary: 520000, growthPerYear: 5 },
    { role: "Sosiale Medier-spesialist", baseSalary: 360000, maxSalary: 550000, growthPerYear: 6 },
  ],
};

const locationMultipliers: Record<string, { name: string; multiplier: number }> = {
  oslo: { name: "Oslo", multiplier: 1.15 },
  bergen: { name: "Bergen", multiplier: 1.05 },
  trondheim: { name: "Trondheim", multiplier: 1.03 },
  stavanger: { name: "Stavanger", multiplier: 1.10 },
  other: { name: "Andre steder", multiplier: 1.0 },
};

const industryConfig = {
  tech: { name: "Technology & AI", color: "from-blue-500 to-cyan-500" },
  green: { name: "Grønn Energi", color: "from-green-500 to-teal-500" },
  health: { name: "Helse & Omsorg", color: "from-red-500 to-pink-500" },
  creative: { name: "Kreative Tjenester", color: "from-purple-500 to-pink-500" },
};

export function SalaryCalculator() {
  const [industry, setIndustry] = useState<string>("tech");
  const [roleIndex, setRoleIndex] = useState<number>(0);
  const [experience, setExperience] = useState<number>(0);
  const [location, setLocation] = useState<string>("oslo");

  const roles = salaryData[industry] || [];
  const selectedRole = roles[roleIndex];

  const calculation = useMemo(() => {
    if (!selectedRole) return { salary: 0, monthly: 0, hourly: 0 };

    // Calculate salary based on experience
    const experienceBonus = Math.min(experience * selectedRole.growthPerYear, 50); // Cap at 50% increase
    const baseSalaryWithExp = selectedRole.baseSalary * (1 + experienceBonus / 100);

    // Apply location multiplier
    const locationMult = locationMultipliers[location]?.multiplier || 1;
    const adjustedSalary = Math.min(baseSalaryWithExp * locationMult, selectedRole.maxSalary);

    // Round to nearest 10k
    const finalSalary = Math.round(adjustedSalary / 10000) * 10000;

    return {
      salary: finalSalary,
      monthly: Math.round(finalSalary / 12),
      hourly: Math.round(finalSalary / 1950), // ~1950 working hours per year
    };
  }, [selectedRole, experience, location]);

  return (
    <Card className="border-2 overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${industryConfig[industry as keyof typeof industryConfig]?.color || "from-primary to-purple-500"}`} />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Salary Calculator
        </CardTitle>
        <CardDescription>Estimate your earning potential in Norway</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Industry Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Industry</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(industryConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  setIndustry(key);
                  setRoleIndex(0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  industry === key
                    ? `bg-gradient-to-r ${config.color} text-white`
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {config.name}
              </button>
            ))}
          </div>
        </div>

        {/* Role Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role, index) => (
              <button
                key={role.role}
                onClick={() => setRoleIndex(index)}
                className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${
                  roleIndex === index
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                {role.role}
              </button>
            ))}
          </div>
        </div>

        {/* Location Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(locationMultipliers).map(([key, loc]) => (
              <button
                key={key}
                onClick={() => setLocation(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  location === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {loc.name}
                {loc.multiplier > 1 && (
                  <span className="ml-1 opacity-70">+{Math.round((loc.multiplier - 1) * 100)}%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Slider */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Years of Experience
            </span>
            <span className="text-primary font-bold">{experience} years</span>
          </label>
          <Slider
            value={[experience]}
            onValueChange={(value) => setExperience(value[0])}
            max={10}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Entry level</span>
            <span>10+ years</span>
          </div>
        </div>

        {/* Results */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-1">Estimated Annual Salary</p>
            <div className="text-4xl font-bold text-primary">
              {calculation.salary.toLocaleString("no-NO")} kr
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground">Monthly (before tax)</p>
              <p className="text-lg font-semibold">{calculation.monthly.toLocaleString("no-NO")} kr</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground">Hourly Rate</p>
              <p className="text-lg font-semibold">{calculation.hourly} kr/time</p>
            </div>
          </div>
        </div>

        {/* Salary Range Note */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            <span className="font-semibold">Note:</span> Actual salaries vary based on company size,
            specific skills, and market conditions. Range for {selectedRole?.role}:{" "}
            {selectedRole?.baseSalary.toLocaleString("no-NO")} - {selectedRole?.maxSalary.toLocaleString("no-NO")} kr/year.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
