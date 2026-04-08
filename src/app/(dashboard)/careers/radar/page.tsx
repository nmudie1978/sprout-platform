"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { CareerRadar } from "@/components/discovery/career-radar";
import { DiscoveryQuizDialog } from "@/components/discovery/discovery-quiz-dialog";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import type { Career, DiscoveryPreferences } from "@/lib/career-pathways";

export default function CareerRadarPage() {
  const { data: session } = useSession();
  const [showDiscoveryQuiz, setShowDiscoveryQuiz] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  const isYouth = session?.user?.role === "YOUTH";

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.user?.id && isYouth,
  });

  const discoveryPreferences: DiscoveryPreferences | null =
    (profileData?.discoveryPreferences as DiscoveryPreferences) || null;

  // Listen for radar dot clicks → open the existing career detail sheet
  useEffect(() => {
    const handler = (e: Event) => {
      const c = (e as CustomEvent<Career>).detail;
      if (c) setSelectedCareer(c);
    };
    window.addEventListener("open-career-detail", handler);
    return () => window.removeEventListener("open-career-detail", handler);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 pointer-events-none" />

      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/careers">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Explore Careers
        </Link>
      </Button>

      <PageHeader
        title="My"
        gradientText="Career Radar"
        description="Careers mapped to what you like — including ones you've probably never heard of."
        icon={Sparkles}
      />

      {isYouth ? (
        <div className="mt-4 max-w-3xl">
          <CareerRadar
            preferences={discoveryPreferences}
            onEditPreferences={() => setShowDiscoveryQuiz(true)}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Sign in as a youth account to use the Career Radar.
        </p>
      )}

      {isYouth && (
        <DiscoveryQuizDialog
          open={showDiscoveryQuiz}
          onClose={() => setShowDiscoveryQuiz(false)}
          initialValue={discoveryPreferences}
        />
      )}

      <CareerDetailSheet
        career={selectedCareer}
        onClose={() => setSelectedCareer(null)}
      />
    </div>
  );
}
