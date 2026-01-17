"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Users,
  ExternalLink,
  Star,
  Briefcase,
  TrendingUp,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry: string;
  logo: string;
  location: string;
  size: string;
  youthFriendly: boolean;
  hiring: boolean;
  description: string;
  perks: string[];
  website: string;
  roles: string[];
}

const companies: Company[] = [
  {
    id: "equinor",
    name: "Equinor",
    industry: "green",
    logo: "⚡",
    location: "Stavanger, Bergen, Oslo",
    size: "21,000+ ansatte",
    youthFriendly: true,
    hiring: true,
    description: "Norges ledende energiselskap med fokus på fornybar energi og offshore vind.",
    perks: ["Lærlingprogram", "Graduate program", "Konkurransedyktig lønn"],
    website: "https://www.equinor.com/careers",
    roles: ["Energimontør", "Prosesstekniker", "Ingeniør", "IT"],
  },
  {
    id: "dnb",
    name: "DNB",
    industry: "tech",
    logo: "🏦",
    location: "Oslo, Bergen, Trondheim",
    size: "9,000+ ansatte",
    youthFriendly: true,
    hiring: true,
    description: "Norges største bank med stor satsing på teknologi og digitalisering.",
    perks: ["Tech-akademi", "Fleksibel arbeidstid", "Sommerjobber"],
    website: "https://www.dnb.no/karriere",
    roles: ["Utvikler", "Data Analyst", "UX Designer", "Kundeservice"],
  },
  {
    id: "oda",
    name: "Oda (kolonial.no)",
    industry: "tech",
    logo: "🛒",
    location: "Oslo",
    size: "2,000+ ansatte",
    youthFriendly: true,
    hiring: true,
    description: "Europas mest effektive nettbutikk for dagligvarer, bygget på teknologi.",
    perks: ["Startup-kultur", "Moderne tech-stack", "Gratis lunsj"],
    website: "https://careers.oda.com",
    roles: ["Utvikler", "Lagermedarbeider", "Sjåfør", "Data Engineer"],
  },
  {
    id: "oslo-universitetssykehus",
    name: "Oslo Universitetssykehus",
    industry: "health",
    logo: "🏥",
    location: "Oslo",
    size: "24,000+ ansatte",
    youthFriendly: true,
    hiring: true,
    description: "Et av Europas største universitetssykehus med mange karrieremuligheter.",
    perks: ["Lærlingplasser", "Videreutdanning", "Stabil arbeidsgiver"],
    website: "https://oslo-universitetssykehus.no/jobb",
    roles: ["Helsefagarbeider", "Sykepleier", "Portør", "IT-support"],
  },
  {
    id: "vg-schibsted",
    name: "Schibsted / VG",
    industry: "creative",
    logo: "📰",
    location: "Oslo",
    size: "5,000+ ansatte",
    youthFriendly: true,
    hiring: true,
    description: "Nordens største mediekonsern med fokus på innovasjon og digitale medier.",
    perks: ["Kreativt miljø", "Graduate program", "Moderne kontorer"],
    website: "https://schibsted.com/career",
    roles: ["Journalist", "Designer", "Utvikler", "Markedsfører"],
  },
  {
    id: "statkraft",
    name: "Statkraft",
    industry: "green",
    logo: "💧",
    location: "Oslo, Bergen + distrikter",
    size: "5,000+ ansatte",
    youthFriendly: true,
    hiring: true,
    description: "Europas største produsent av fornybar energi med hovedkontor i Norge.",
    perks: ["Internasjonale muligheter", "Trainee-program", "Bærekraft fokus"],
    website: "https://www.statkraft.com/careers",
    roles: ["Tekniker", "Ingeniør", "Analytiker", "IT"],
  },
];

const industryFilters = [
  { id: "all", label: "Alle", color: "from-primary to-purple-500" },
  { id: "tech", label: "Tech", color: "from-blue-500 to-cyan-500" },
  { id: "green", label: "Grønn Energi", color: "from-green-500 to-teal-500" },
  { id: "health", label: "Helse", color: "from-red-500 to-pink-500" },
  { id: "creative", label: "Kreativ", color: "from-purple-500 to-pink-500" },
];

export function CompanySpotlights() {
  const [filter, setFilter] = useState<string>("all");

  const filteredCompanies = filter === "all"
    ? companies
    : companies.filter((c) => c.industry === filter);

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary to-purple-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Company Spotlights
        </CardTitle>
        <CardDescription>Top employers actively hiring young talent in Norway</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {industryFilters.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setFilter(ind.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === ind.id
                  ? `bg-gradient-to-r ${ind.color} text-white`
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>

        {/* Company Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="p-4 rounded-xl border-2 hover:border-primary/50 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{company.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{company.name}</h3>
                    {company.youthFriendly && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-[10px]">
                        <Star className="h-3 w-3 mr-0.5" />
                        Youth-Friendly
                      </Badge>
                    )}
                    {company.hiring && (
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 text-[10px]">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        Hiring
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {company.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {company.size}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-3">
                {company.description}
              </p>

              <div className="mt-3">
                <p className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Aktuelle roller:
                </p>
                <div className="flex flex-wrap gap-1">
                  {company.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-[10px]">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {company.perks.map((perk) => (
                  <span
                    key={perk}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                  >
                    {perk}
                  </span>
                ))}
              </div>

              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Se ledige stillinger
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
