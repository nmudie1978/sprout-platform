"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  ExternalLink,
  Star,
  TrendingUp,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry: string;
  logo: string;
  location: string;
  hiring: boolean;
  website: string;
  roles: string[];
}

const companies: Company[] = [
  {
    id: "google",
    name: "Google",
    industry: "tech",
    logo: "🔍",
    location: "Global",
    hiring: true,
    website: "https://careers.google.com",
    roles: ["Developer", "Data Analyst", "UX Designer"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    industry: "tech",
    logo: "💻",
    location: "Global",
    hiring: true,
    website: "https://careers.microsoft.com",
    roles: ["Software Engineer", "Cloud Architect", "PM"],
  },
  {
    id: "siemens",
    name: "Siemens",
    industry: "green",
    logo: "⚡",
    location: "Europe",
    hiring: true,
    website: "https://www.siemens.com/careers",
    roles: ["Engineer", "Technician", "Energy Specialist"],
  },
  {
    id: "philips",
    name: "Philips",
    industry: "health",
    logo: "💡",
    location: "Europe",
    hiring: true,
    website: "https://www.careers.philips.com",
    roles: ["Healthcare Tech", "Engineer", "Designer"],
  },
  {
    id: "spotify",
    name: "Spotify",
    industry: "creative",
    logo: "🎵",
    location: "Stockholm",
    hiring: true,
    website: "https://www.lifeatspotify.com",
    roles: ["Developer", "Designer", "Content"],
  },
  {
    id: "vestas",
    name: "Vestas",
    industry: "green",
    logo: "🌬️",
    location: "Denmark",
    hiring: true,
    website: "https://www.vestas.com/en/careers",
    roles: ["Wind Technician", "Engineer", "Analyst"],
  },
];

const industryFilters = [
  { id: "all", label: "All", color: "from-primary to-purple-500" },
  { id: "tech", label: "Tech", color: "from-blue-500 to-cyan-500" },
  { id: "green", label: "Green Energy", color: "from-green-500 to-teal-500" },
  { id: "health", label: "Healthcare", color: "from-red-500 to-pink-500" },
  { id: "creative", label: "Creative", color: "from-purple-500 to-pink-500" },
];

export function CompanySpotlights() {
  const [filter, setFilter] = useState<string>("all");

  const filteredCompanies = filter === "all"
    ? companies
    : companies.filter((c) => c.industry === filter);

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary to-purple-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Company Spotlights
        </CardTitle>
        <CardDescription>Top employers actively hiring young talent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {industryFilters.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setFilter(ind.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filter === ind.id
                  ? `bg-gradient-to-r ${ind.color} text-white`
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>

        {/* Company Grid - Compact Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <a
              key={company.id}
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{company.logo}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {company.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" />
                    {company.location}
                  </div>
                </div>
                {company.hiring && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-[9px] px-1.5 py-0">
                    <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                    Hiring
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {company.roles.slice(0, 3).map((role) => (
                  <Badge key={role} variant="secondary" className="text-[9px] px-1.5 py-0">
                    {role}
                  </Badge>
                ))}
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
