"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Code, Wrench, Heart, Palette, Clock, BookOpen, GraduationCap } from "lucide-react";

interface IndustryInfo {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  timeline: string;
  firstStep: string;
  resources: { name: string; url: string }[];
  certification: string;
}

const industries: IndustryInfo[] = [
  {
    id: "tech",
    name: "Technology & AI",
    shortName: "Tech",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    timeline: "3-6 months for basics",
    firstStep: "Learn basic programming (Python or JavaScript)",
    resources: [
      { name: "freeCodeCamp", url: "https://www.freecodecamp.org" },
      { name: "CS50", url: "https://cs50.harvard.edu" },
    ],
    certification: "Google IT Support",
  },
  {
    id: "green",
    name: "Green Energy",
    shortName: "Green",
    icon: Wrench,
    color: "from-green-500 to-teal-500",
    timeline: "1-2 years with apprenticeship",
    firstStep: "Complete VGS or vocational training",
    resources: [
      { name: "Vilbli.no", url: "https://www.vilbli.no" },
      { name: "Energi Norge", url: "https://www.energinorge.no" },
    ],
    certification: "Energy Technician Certificate",
  },
  {
    id: "health",
    name: "Healthcare",
    shortName: "Health",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    timeline: "2-3 years for certification",
    firstStep: "Complete Health & Care VG1",
    resources: [
      { name: "Helsedirektoratet", url: "https://www.helsedirektoratet.no" },
      { name: "Utdanning.no", url: "https://utdanning.no/tema/helse" },
    ],
    certification: "Healthcare Worker Certificate",
  },
  {
    id: "creative",
    name: "Creative Services",
    shortName: "Creative",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    timeline: "6-12 months to build portfolio",
    firstStep: "Build a portfolio with your work",
    resources: [
      { name: "Skillshare", url: "https://www.skillshare.com" },
      { name: "Canva School", url: "https://www.canva.com/designschool" },
    ],
    certification: "Google Digital Marketing",
  },
];

interface HowToStartProps {
  industryTypes?: string[];
}

export function HowToStart({ industryTypes = [] }: HowToStartProps) {
  // Default to first industry in user's goals, or tech
  const defaultIndustry = industryTypes.length > 0 ? industryTypes[0] : "tech";
  const [selectedIndustry, setSelectedIndustry] = useState<string>(defaultIndustry);

  const currentIndustry = industries.find((i) => i.id === selectedIndustry) || industries[0];
  const Icon = currentIndustry.icon;

  return (
    <Card className="border-2 overflow-hidden h-full">
      <div className={`h-1 bg-gradient-to-r ${currentIndustry.color}`} />
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-primary" />
          How to Start
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Industry Selector */}
        <div className="flex flex-wrap gap-1">
          {industries.map((industry) => {
            const IndIcon = industry.icon;
            return (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                  selectedIndustry === industry.id
                    ? `bg-gradient-to-r ${industry.color} text-white`
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <IndIcon className="h-3 w-3" />
                {industry.shortName}
              </button>
            );
          })}
        </div>

        {/* Industry Info */}
        <div className="space-y-2">
          {/* Timeline */}
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <Clock className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Timeline</p>
              <p className="text-xs font-medium truncate">{currentIndustry.timeline}</p>
            </div>
          </div>

          {/* First Step */}
          <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
            <Icon className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">First Step</p>
              <p className="text-xs font-medium">{currentIndustry.firstStep}</p>
            </div>
          </div>

          {/* Resources */}
          <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
            <BookOpen className="h-3.5 w-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground mb-1">Free Resources</p>
              <div className="flex flex-wrap gap-1">
                {currentIndustry.resources.map((resource) => (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {resource.name}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Certification */}
          <div className="flex items-center justify-between p-2 rounded-md border">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-[10px] text-muted-foreground">Recommended Cert:</span>
            </div>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
              {currentIndustry.certification}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
