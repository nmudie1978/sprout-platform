"use client";

/**
 * DEV PAGE: Explore Careers "Front Door" preview.
 *
 * Renders <CareerFrontDoor> with mock careers — no auth, no API — so the
 * layout can be eyeballed (and headless-screenshotted) in both states:
 * "Your top matches" and the Career Radar invite. Visit /dev/front-door.
 */

import { useState } from "react";
import type { Career, CareerCategory } from "@/lib/career-pathways";
import { CareerFrontDoor } from "@/components/careers/career-front-door";

function c(o: Partial<Career> & { id: string }): Career {
  return {
    title: o.id,
    emoji: "💼",
    description: "A sample career used for the dev preview.",
    avgSalary: "550,000 - 750,000 kr/year",
    educationPath: "",
    keySkills: [],
    dailyTasks: [],
    growthOutlook: "stable",
    ...o,
  };
}

const CAREERS: Career[] = [
  c({ id: "Software Engineer", emoji: "💻", growthOutlook: "high", educationRoute: "university", avgSalary: "750,000 - 1,100,000 kr/year" }),
  c({ id: "Wind Turbine Technician", emoji: "🌬️", growthOutlook: "high", educationRoute: "vocational", workSetting: "outdoors", avgSalary: "650,000 - 900,000 kr/year" }),
  c({ id: "Electrician", emoji: "⚡", growthOutlook: "high", educationRoute: "vocational", workSetting: "hands-on", avgSalary: "600,000 - 850,000 kr/year" }),
  c({ id: "Plumber", emoji: "🔧", educationRoute: "vocational", workSetting: "hands-on", avgSalary: "580,000 - 820,000 kr/year" }),
  c({ id: "Crane Operator", emoji: "🏗️", educationRoute: "certification", workSetting: "outdoors", avgSalary: "650,000 - 950,000 kr/year" }),
  c({ id: "Offshore Driller", emoji: "🛢️", educationRoute: "on-the-job", workSetting: "outdoors", avgSalary: "900,000 - 1,400,000 kr/year" }),
  c({ id: "Air Traffic Controller", emoji: "🛫", educationRoute: "certification", avgSalary: "950,000 - 1,300,000 kr/year", growthOutlook: "high" }),
  c({ id: "Nurse", emoji: "🩺", growthOutlook: "high", peopleIntensity: "high", educationRoute: "university", avgSalary: "560,000 - 720,000 kr/year" }),
  c({ id: "Teacher", emoji: "🍎", peopleIntensity: "high", educationRoute: "university", avgSalary: "520,000 - 680,000 kr/year" }),
  c({ id: "Social Worker", emoji: "🤝", peopleIntensity: "high", educationRoute: "university", avgSalary: "500,000 - 650,000 kr/year" }),
  c({ id: "Physiotherapist", emoji: "💪", peopleIntensity: "high", educationRoute: "university", growthOutlook: "high", avgSalary: "560,000 - 740,000 kr/year" }),
  c({ id: "Carpenter", emoji: "🪚", educationRoute: "vocational", workSetting: "hands-on", avgSalary: "560,000 - 780,000 kr/year" }),
  c({ id: "Welder", emoji: "🔥", educationRoute: "vocational", workSetting: "hands-on", avgSalary: "580,000 - 900,000 kr/year" }),
  c({ id: "Data Scientist", emoji: "📊", growthOutlook: "high", educationRoute: "university", avgSalary: "800,000 - 1,200,000 kr/year" }),
  c({ id: "Chef", emoji: "👨‍🍳", educationRoute: "vocational", workSetting: "hands-on", peopleIntensity: "medium", avgSalary: "450,000 - 700,000 kr/year" }),
  c({ id: "Pilot", emoji: "✈️", educationRoute: "certification", growthOutlook: "high", avgSalary: "900,000 - 1,500,000 kr/year" }),
];

const getCategoryForCareer = (): CareerCategory | undefined => undefined;

export default function FrontDoorDevPage() {
  const [withMatches, setWithMatches] = useState(true);

  const recommendationMap = new Map<string, number>(
    withMatches
      ? [
          ["Software Engineer", 92],
          ["Data Scientist", 86],
          ["Air Traffic Controller", 81],
          ["Nurse", 74],
        ]
      : [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Front Door preview</h1>
        <button
          className="text-xs rounded border border-border px-2 py-1"
          onClick={() => setWithMatches((v) => !v)}
        >
          {withMatches ? "Show invite state" : "Show matches state"}
        </button>
      </div>
      <CareerFrontDoor
        careers={CAREERS}
        recommendationMap={recommendationMap}
        getCategoryForCareer={getCategoryForCareer}
        userCountry={null}
        onOpen={(career) => alert(`Open: ${career.title}`)}
      />
    </div>
  );
}
