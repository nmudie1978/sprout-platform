"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CareerRadar } from "@/components/discovery/career-radar";
import { DiscoveryQuizDialog } from "@/components/discovery/discovery-quiz-dialog";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import type { Career, DiscoveryPreferences } from "@/lib/career-pathways";

function CareerRadarPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isFirstReveal = searchParams.get("reveal") === "1";
  const [showDiscoveryQuiz, setShowDiscoveryQuiz] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [revealDismissed, setRevealDismissed] = useState(false);

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

      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="My"
          gradientText="Career Radar"
          description="Careers mapped to what you like — including ones you've probably never heard of."
          icon={Sparkles}
        />
        {/* First-reveal banner — only on the redirect from onboarding */}
        {isFirstReveal && !revealDismissed && discoveryPreferences && (
          <div className="mt-3 rounded-xl border border-teal-500/30 bg-teal-500/5 p-3 sm:p-4 flex items-start gap-3 relative">
            <div className="h-8 w-8 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-teal-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                Here are your matches.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Some you&rsquo;ll know. Some you won&rsquo;t. Tap any dot to learn what the role actually involves &mdash; or open the report below to scan the full list.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRevealDismissed(true)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {isYouth ? (
        <div className="mt-4 max-w-3xl mx-auto">
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

export default function CareerRadarPage() {
  return (
    <Suspense fallback={null}>
      <CareerRadarPageContent />
    </Suspense>
  );
}
