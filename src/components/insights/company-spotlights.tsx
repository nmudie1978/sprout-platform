"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
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
  // Tech companies
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
    id: "amazon",
    name: "Amazon",
    industry: "tech",
    logo: "📦",
    location: "Global",
    hiring: true,
    website: "https://www.amazon.jobs",
    roles: ["Developer", "Data Engineer", "Solutions Architect"],
  },
  // Green energy companies
  {
    id: "siemens",
    name: "Siemens Energy",
    industry: "green",
    logo: "⚡",
    location: "Europe",
    hiring: true,
    website: "https://www.siemens.com/careers",
    roles: ["Engineer", "Technician", "Energy Specialist"],
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
  {
    id: "orsted",
    name: "Ørsted",
    industry: "green",
    logo: "🌊",
    location: "Denmark",
    hiring: true,
    website: "https://orsted.com/en/careers",
    roles: ["Offshore Technician", "Engineer", "Project Manager"],
  },
  // Healthcare companies & hospitals
  {
    id: "mayo-clinic",
    name: "Mayo Clinic",
    industry: "health",
    logo: "🏥",
    location: "USA",
    hiring: true,
    website: "https://jobs.mayoclinic.org",
    roles: ["Nurse", "Medical Assistant", "Healthcare Admin"],
  },
  {
    id: "cleveland-clinic",
    name: "Cleveland Clinic",
    industry: "health",
    logo: "🏥",
    location: "USA",
    hiring: true,
    website: "https://jobs.clevelandclinic.org",
    roles: ["Registered Nurse", "Patient Care", "Technician"],
  },
  {
    id: "kaiser",
    name: "Kaiser Permanente",
    industry: "health",
    logo: "🏥",
    location: "USA",
    hiring: true,
    website: "https://jobs.kaiserpermanente.org",
    roles: ["Nurse", "Medical Assistant", "Pharmacy Tech"],
  },
  {
    id: "nhs",
    name: "NHS",
    industry: "health",
    logo: "🏥",
    location: "UK",
    hiring: true,
    website: "https://www.jobs.nhs.uk",
    roles: ["Nurse", "Healthcare Support", "Mental Health"],
  },
  {
    id: "philips",
    name: "Philips Healthcare",
    industry: "health",
    logo: "💡",
    location: "Europe",
    hiring: true,
    website: "https://www.careers.philips.com",
    roles: ["Healthcare Tech", "Clinical Specialist", "Engineer"],
  },
  {
    id: "unitedhealth",
    name: "UnitedHealth Group",
    industry: "health",
    logo: "🏥",
    location: "USA",
    hiring: true,
    website: "https://careers.unitedhealthgroup.com",
    roles: ["Care Coordinator", "Nurse", "Health Coach"],
  },
  // Creative companies
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
    id: "netflix",
    name: "Netflix",
    industry: "creative",
    logo: "🎬",
    location: "Global",
    hiring: true,
    website: "https://jobs.netflix.com",
    roles: ["Content Creator", "Designer", "Producer"],
  },
  {
    id: "adobe",
    name: "Adobe",
    industry: "creative",
    logo: "🎨",
    location: "Global",
    hiring: true,
    website: "https://www.adobe.com/careers.html",
    roles: ["Designer", "Product Manager", "Marketing"],
  },
];

interface CompanySpotlightsProps {
  industryTypes?: string[];
}

export function CompanySpotlights({ industryTypes = [] }: CompanySpotlightsProps) {
  // Filter companies based on user's career goal industry types
  const filteredCompanies = industryTypes.length > 0
    ? companies.filter((c) => industryTypes.includes(c.industry))
    : companies;

  // Get industry labels for display
  const industryLabels: Record<string, string> = {
    tech: "Tech & AI",
    green: "Green Energy",
    health: "Healthcare",
    creative: "Creative",
  };

  const activeIndustries = industryTypes.length > 0
    ? industryTypes.map(t => industryLabels[t] || t).join(", ")
    : "all industries";

  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary to-purple-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Company Spotlights
        </CardTitle>
        <CardDescription>
          {industryTypes.length > 0
            ? `Top employers hiring in ${activeIndustries} based on your career goals`
            : "Top employers actively hiring young talent"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
