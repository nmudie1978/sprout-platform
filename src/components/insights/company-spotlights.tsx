"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, TrendingUp, Globe, ChevronDown } from "lucide-react";

type Region = "norway" | "europe" | "worldwide";

interface Company {
  id: string;
  name: string;
  industry: string;
  logo: string;
  location: string;
  country: string;
  region: Region;
  hiring: boolean;
  website: string;
  roles: string[];
}

// Companies organized by region
const companies: Company[] = [
  // NORWAY
  { id: "dnb", name: "DNB", industry: "tech", logo: "🏦", location: "Oslo", country: "Norway", region: "norway", hiring: true, website: "https://www.dnb.no/om-oss/karriere", roles: ["Utvikler", "Data Analyst"] },
  { id: "telenor", name: "Telenor", industry: "tech", logo: "📱", location: "Fornebu", country: "Norway", region: "norway", hiring: true, website: "https://www.telenor.no/karriere", roles: ["Software Engineer", "Cloud"] },
  { id: "equinor", name: "Equinor", industry: "green", logo: "⚡", location: "Stavanger", country: "Norway", region: "norway", hiring: true, website: "https://www.equinor.com/careers", roles: ["Ingeniør", "Tekniker"] },
  { id: "statkraft", name: "Statkraft", industry: "green", logo: "💧", location: "Oslo", country: "Norway", region: "norway", hiring: true, website: "https://www.statkraft.no/karriere", roles: ["Energiingeniør", "Analytiker"] },
  { id: "ous", name: "Oslo Universitetssykehus", industry: "health", logo: "🏥", location: "Oslo", country: "Norway", region: "norway", hiring: true, website: "https://oslo-universitetssykehus.no/jobb", roles: ["Sykepleier", "Helsefag"] },
  { id: "nrk", name: "NRK", industry: "creative", logo: "📺", location: "Oslo", country: "Norway", region: "norway", hiring: true, website: "https://www.nrk.no/informasjon/karriere-i-nrk-1.5765", roles: ["Journalist", "Produsent"] },

  // EUROPE
  { id: "spotify", name: "Spotify", industry: "tech", logo: "🎵", location: "Stockholm", country: "Sweden", region: "europe", hiring: true, website: "https://www.lifeatspotify.com", roles: ["Developer", "Designer"] },
  { id: "klarna", name: "Klarna", industry: "tech", logo: "💳", location: "Stockholm", country: "Sweden", region: "europe", hiring: true, website: "https://www.klarna.com/careers", roles: ["Engineer", "Product"] },
  { id: "siemens", name: "Siemens Energy", industry: "green", logo: "⚡", location: "Munich", country: "Germany", region: "europe", hiring: true, website: "https://www.siemens-energy.com/careers", roles: ["Engineer", "Technician"] },
  { id: "vestas", name: "Vestas", industry: "green", logo: "🌬️", location: "Aarhus", country: "Denmark", region: "europe", hiring: true, website: "https://www.vestas.com/en/careers", roles: ["Wind Tech", "Engineer"] },
  { id: "orsted", name: "Ørsted", industry: "green", logo: "🌊", location: "Copenhagen", country: "Denmark", region: "europe", hiring: true, website: "https://orsted.com/en/careers", roles: ["Offshore", "Project Mgr"] },
  { id: "philips", name: "Philips Healthcare", industry: "health", logo: "💡", location: "Amsterdam", country: "Netherlands", region: "europe", hiring: true, website: "https://www.careers.philips.com", roles: ["Clinical", "Engineer"] },

  // WORLDWIDE
  { id: "google", name: "Google", industry: "tech", logo: "🔍", location: "Global", country: "USA", region: "worldwide", hiring: true, website: "https://careers.google.com", roles: ["Developer", "UX Designer"] },
  { id: "microsoft", name: "Microsoft", industry: "tech", logo: "💻", location: "Global", country: "USA", region: "worldwide", hiring: true, website: "https://careers.microsoft.com", roles: ["Software Eng", "Cloud"] },
  { id: "amazon", name: "Amazon", industry: "tech", logo: "📦", location: "Global", country: "USA", region: "worldwide", hiring: true, website: "https://www.amazon.jobs", roles: ["Developer", "Solutions"] },
  { id: "tesla", name: "Tesla", industry: "green", logo: "🚗", location: "Global", country: "USA", region: "worldwide", hiring: true, website: "https://www.tesla.com/careers", roles: ["Engineer", "Technician"] },
  { id: "netflix", name: "Netflix", industry: "creative", logo: "🎬", location: "Global", country: "USA", region: "worldwide", hiring: true, website: "https://jobs.netflix.com", roles: ["Content", "Producer"] },
  { id: "adobe", name: "Adobe", industry: "creative", logo: "🎨", location: "Global", country: "USA", region: "worldwide", hiring: true, website: "https://www.adobe.com/careers.html", roles: ["Designer", "Marketing"] },
];

const regionLabels: Record<Region, string> = {
  norway: "Norway",
  europe: "Europe",
  worldwide: "Worldwide",
};

interface CompanySpotlightsProps {
  industryTypes?: string[];
  userCountry?: string;
}

export function CompanySpotlights({ industryTypes = [], userCountry = "Norway" }: CompanySpotlightsProps) {
  // Default to user's country region
  const defaultRegion: Region = userCountry.toLowerCase() === "norway" ? "norway" : "europe";
  const [selectedRegion, setSelectedRegion] = useState<Region>(defaultRegion);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  // Filter by region first, then by industry if specified
  const regionFiltered = companies.filter((c) => {
    if (selectedRegion === "worldwide") return true;
    if (selectedRegion === "europe") return c.region === "europe" || c.region === "norway";
    return c.region === selectedRegion;
  });

  const filteredCompanies = industryTypes.length > 0
    ? regionFiltered.filter((c) => industryTypes.includes(c.industry))
    : regionFiltered;

  // Limit display
  const displayCompanies = filteredCompanies.slice(0, 6);

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary to-purple-500" />
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Company Spotlights
          </CardTitle>

          {/* Region Filter */}
          <div className="relative">
            <button
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full border hover:bg-muted transition-colors"
            >
              <Globe className="h-3 w-3" />
              {regionLabels[selectedRegion]}
              <ChevronDown className="h-3 w-3" />
            </button>

            {showRegionDropdown && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-background border rounded-md shadow-lg py-1 min-w-[120px]">
                {(["norway", "europe", "worldwide"] as Region[]).map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      setShowRegionDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors ${
                      selectedRegion === region ? "bg-muted font-medium" : ""
                    }`}
                  >
                    {regionLabels[region]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {displayCompanies.map((company) => (
            <a
              key={company.id}
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-md border hover:border-primary/50 transition-all group"
            >
              <span className="text-lg">{company.logo}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-xs truncate group-hover:text-primary">
                    {company.name}
                  </span>
                  {company.hiring && (
                    <TrendingUp className="h-3 w-3 text-green-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" />
                  {company.location}
                </div>
              </div>
            </a>
          ))}
        </div>
        {filteredCompanies.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No companies found for selected filters
          </p>
        )}
      </CardContent>
    </Card>
  );
}
