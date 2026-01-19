"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Briefcase, GraduationCap, Globe, MapPin } from "lucide-react";
import {
  buildLiveSearchLinksForCareer,
  type LocationMode,
  type SearchLinks,
} from "@/lib/jobs/liveSearchLinks";

interface RealWorldExamplesLinksProps {
  careerTitle: string;
}

function SearchLinkGroup({
  title,
  icon: Icon,
  links,
  iconColor,
}: {
  title: string;
  icon: React.ElementType;
  links: SearchLinks;
  iconColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3 w-3 ${iconColor}`} />
        <span className="text-[11px] font-medium">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] px-2"
          asChild
        >
          <a
            href={links.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-2.5 w-2.5 mr-1" />
            LinkedIn
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] px-2"
          asChild
        >
          <a
            href={links.indeedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-2.5 w-2.5 mr-1" />
            Indeed
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] px-2"
          asChild
        >
          <a
            href={links.googleUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-2.5 w-2.5 mr-1" />
            Google
          </a>
        </Button>
      </div>
    </div>
  );
}

export function RealWorldExamplesLinks({ careerTitle }: RealWorldExamplesLinksProps) {
  const [locationMode, setLocationMode] = useState<LocationMode>("global");

  const links = buildLiveSearchLinksForCareer({
    title: careerTitle,
    locationMode,
  });

  const locationOptions: { value: LocationMode; label: string; icon: React.ElementType }[] = [
    { value: "global", label: "Global", icon: Globe },
    { value: "norway", label: "Norway", icon: MapPin },
    { value: "remote", label: "Remote", icon: Globe },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Briefcase className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold">Real-World Examples</h3>
        </div>

        {/* Location Toggle */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
          {locationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setLocationMode(option.value)}
              className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${
                locationMode === option.value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pl-1">
        <SearchLinkGroup
          title="Start here (Entry / Junior)"
          icon={GraduationCap}
          links={links.entry}
          iconColor="text-green-500"
        />

        <SearchLinkGroup
          title="Professional roles"
          icon={Briefcase}
          links={links.professional}
          iconColor="text-blue-500"
        />
      </div>

      <p className="text-[9px] text-muted-foreground text-center">
        Live searches (external). Availability changes.
      </p>
    </div>
  );
}
