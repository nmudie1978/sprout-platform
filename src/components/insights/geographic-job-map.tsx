"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Building2,
  TrendingUp,
  Users,
} from "lucide-react";

interface RegionData {
  id: string;
  name: string;
  jobCount: number;
  topIndustries: string[];
  avgSalary: string;
  growth: string;
  highlight?: string;
}

const regions: RegionData[] = [
  {
    id: "oslo",
    name: "Oslo",
    jobCount: 45000,
    topIndustries: ["Tech", "Finans", "Media", "Konsulent"],
    avgSalary: "520 000 kr",
    growth: "+8%",
    highlight: "Norges tech-hovedstad",
  },
  {
    id: "bergen",
    name: "Bergen",
    jobCount: 18000,
    topIndustries: ["Maritim", "Energi", "Media", "Helse"],
    avgSalary: "480 000 kr",
    growth: "+5%",
    highlight: "Sterk i maritim sektor",
  },
  {
    id: "trondheim",
    name: "Trondheim",
    jobCount: 12000,
    topIndustries: ["Tech", "Forskning", "Utdanning", "Helse"],
    avgSalary: "470 000 kr",
    growth: "+6%",
    highlight: "Studentby med voksende tech",
  },
  {
    id: "stavanger",
    name: "Stavanger",
    jobCount: 15000,
    topIndustries: ["Energi", "Offshore", "Tech", "Helse"],
    avgSalary: "530 000 kr",
    growth: "+7%",
    highlight: "Energi-hovedstaden",
  },
  {
    id: "tromso",
    name: "Tromsø",
    jobCount: 5000,
    topIndustries: ["Forskning", "Fiskeri", "Reiseliv", "Helse"],
    avgSalary: "450 000 kr",
    growth: "+4%",
    highlight: "Nordlys og arktisk forskning",
  },
  {
    id: "kristiansand",
    name: "Kristiansand",
    jobCount: 6000,
    topIndustries: ["Prosessindustri", "Tech", "Reiseliv", "Helse"],
    avgSalary: "460 000 kr",
    growth: "+4%",
  },
  {
    id: "drammen",
    name: "Drammen/Buskerud",
    jobCount: 8000,
    topIndustries: ["Logistikk", "Industri", "Helse", "Handel"],
    avgSalary: "470 000 kr",
    growth: "+3%",
  },
  {
    id: "alesund",
    name: "Ålesund/Møre og Romsdal",
    jobCount: 7000,
    topIndustries: ["Maritim", "Fiskeri", "Industri", "Reiseliv"],
    avgSalary: "460 000 kr",
    growth: "+5%",
    highlight: "Maritim klynge",
  },
];

export function GeographicJobMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>("oslo");

  const selectedData = regions.find((r) => r.id === selectedRegion);

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Job Market by Region
        </CardTitle>
        <CardDescription>Explore job opportunities across Norway</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Simple Map Visualization */}
        <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4 min-h-[300px]">
          {/* Norway outline approximation with positioned city markers */}
          <svg viewBox="0 0 200 300" className="w-full h-64 mx-auto">
            {/* Simplified Norway shape */}
            <path
              d="M100 10 L130 30 L140 80 L150 120 L145 160 L130 200 L120 250 L100 280 L80 290 L60 270 L50 230 L55 180 L60 140 L70 100 L80 50 L100 10"
              className="fill-primary/10 stroke-primary/30"
              strokeWidth="2"
            />

            {/* City markers */}
            {[
              { id: "oslo", x: 105, y: 230, size: 12 },
              { id: "bergen", x: 55, y: 205, size: 10 },
              { id: "trondheim", x: 90, y: 150, size: 9 },
              { id: "stavanger", x: 55, y: 235, size: 9 },
              { id: "tromso", x: 110, y: 60, size: 7 },
              { id: "kristiansand", x: 75, y: 260, size: 7 },
              { id: "drammen", x: 95, y: 235, size: 6 },
              { id: "alesund", x: 60, y: 165, size: 7 },
            ].map((city) => {
              const region = regions.find((r) => r.id === city.id);
              const isSelected = selectedRegion === city.id;
              return (
                <g key={city.id}>
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={city.size}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "fill-primary stroke-primary"
                        : "fill-primary/60 stroke-primary/60 hover:fill-primary"
                    }`}
                    strokeWidth={isSelected ? 3 : 1}
                    onClick={() => setSelectedRegion(city.id)}
                  />
                  <text
                    x={city.x}
                    y={city.y - city.size - 5}
                    textAnchor="middle"
                    className={`text-[8px] font-medium ${
                      isSelected ? "fill-primary" : "fill-muted-foreground"
                    }`}
                  >
                    {region?.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
            Klikk på en by for detaljer
          </div>
        </div>

        {/* Region Details */}
        {selectedData && (
          <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">{selectedData.name}</h3>
              </div>
              {selectedData.highlight && (
                <Badge className="bg-primary/20 text-primary">
                  {selectedData.highlight}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-background">
                <Building2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xl font-bold text-primary">
                  {selectedData.jobCount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Ledige stillinger</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xl font-bold">{selectedData.avgSalary}</div>
                <div className="text-xs text-muted-foreground">Snittslønn</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
                <div className="text-xl font-bold text-green-600">{selectedData.growth}</div>
                <div className="text-xs text-muted-foreground">Vekst</div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2">Toppbransjer:</p>
              <div className="flex flex-wrap gap-2">
                {selectedData.topIndustries.map((industry) => (
                  <Badge key={industry} variant="secondary">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">
              {regions.reduce((sum, r) => sum + r.jobCount, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Totalt ledige</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{regions.length}</div>
            <div className="text-xs text-muted-foreground">Regioner</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-600">+5.5%</div>
            <div className="text-xs text-muted-foreground">Snitt vekst</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">480k</div>
            <div className="text-xs text-muted-foreground">Nasjonal snittslønn</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
