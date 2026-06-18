"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, HelpCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CareerRadar } from "@/components/discovery/career-radar";
import { DiscoveryQuizDialog } from "@/components/discovery/discovery-quiz-dialog";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Career, DiscoveryPreferences } from "@/lib/career-pathways";
import { useSubtleHint } from "@/hooks/use-subtle-hint";
import { SpotlightHint } from "@/components/ui/spotlight-hint";
import { useTranslations } from "next-intl";
import { DegreeToCareers } from "@/components/discovery/degree-to-careers";


function CareerRadarPageContent() {
  const { data: session } = useSession();
  const [showDiscoveryQuiz, setShowDiscoveryQuiz] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  const isYouth = session?.user?.role === "YOUTH";
  const t = useTranslations();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.user?.id && isYouth,
    staleTime: 5 * 60 * 1000,
  });

  const discoveryPreferences: DiscoveryPreferences | null =
    (profileData?.discoveryPreferences as DiscoveryPreferences) || null;

  // Spotlight — guides new users to "What I like" / "Start Discovery", but
  // only once they've sat idle on the radar for 20s (no taps, keys, or
  // scrolling). An engaged user exploring the radar never sees it; it's a
  // gentle nudge for someone who seems stuck. useSubtleHint resets its timer
  // on every interaction, so the 20s is true inactivity.
  const radarHint = useSubtleHint({
    hintKey: "radar-spotlight",
    enabled: isYouth && !profileLoading,
    delayMs: 20000,
    durationMs: 4000,
  });

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
      <div className="absolute inset-0 -z-10 bg-primary/5 pointer-events-none dark:hidden" />

      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title={t('radar.titlePrefix')}
            gradientText={t('radar.titleGradient')}
            description={t('radar.description')}
            icon={Sparkles}
          />
          <RadarGuideTips />
        </div>
      </div>

      <div className="mt-4 max-w-3xl mx-auto">
        <DegreeToCareers onOpen={setSelectedCareer} />
      </div>

      {isYouth ? (
        <div className="mt-4 max-w-3xl mx-auto relative">
          {profileLoading ? (
            <div className="rounded-card border border-border/30 bg-card/40 p-8 text-center text-sm text-muted-foreground/60 animate-pulse">
              {t('radar.loading')}
            </div>
          ) : (
            <>
              <GradeRangePill
                preferences={discoveryPreferences}
                onChange={() => setShowDiscoveryQuiz(true)}
              />
              <CareerRadar
                preferences={discoveryPreferences}
                onEditPreferences={() => setShowDiscoveryQuiz(true)}
              />
            </>
          )}
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

      {/* Spotlight — highlights the "What I like" / "Start Discovery" CTA */}
      <SpotlightHint
        visible={radarHint.visible}
        onDismiss={radarHint.dismiss}
        text="Tell us what you like to see your matches"
        targetSelector='[data-spotlight="radar-cta"]'
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

/**
 * GradeRangePill — subtle indicator showing the active
 * excludeUniversity filter, with a Change link that opens the quiz.
 * Renders nothing when the filter isn't set, so first-time users don't
 * see an empty-state pill that doesn't explain itself. First-time
 * discovery of the filter happens through the quiz dialog entrypoint
 * ("Tell us what you like"), not through this pill.
 */
function GradeRangePill({
  preferences,
  onChange,
}: {
  preferences: DiscoveryPreferences | null;
  onChange: () => void;
}) {
  const excludeUni = preferences?.excludeUniversity;
  if (!excludeUni) return null;

  return (
    <div className="mb-3 flex items-center gap-2 flex-wrap text-xs">
      <span className="text-muted-foreground/60">Adjusted for:</span>
      {excludeUni && (
        <span className="inline-flex items-center gap-1 rounded-pill border border-warning/30 bg-warning/10 px-2 py-0.5 text-warning font-medium">
          No university
        </span>
      )}
      <button
        type="button"
        onClick={onChange}
        className="ml-auto text-muted-foreground/70 hover:text-foreground underline-offset-2 hover:underline"
      >
        Change
      </button>
    </div>
  );
}

// ── Radar Guide Tips ────────────────────────────────────────────────

const RADAR_TIPS = [
  {
    title: "How the radar works",
    description: "The radar maps careers to your preferences — subjects you enjoy, how you like to work, and whether you prefer people or solo work. Dots closer to the centre are stronger matches.",
  },
  {
    title: "Tap a dot to explore",
    description: "Each dot is a real career. Tap it to see the full breakdown — salary, growth outlook, typical day, and what qualifications you need.",
  },
  {
    title: "Compare careers",
    description: "Use the Compare feature to put two or more careers side by side. See how they differ in salary, education path, growth, and how well they match your profile.",
  },
  {
    title: "Save anything you want to come back to",
    description: "Heart a career on its detail sheet to keep it in your Saved Careers tray on the right edge of the radar — and anywhere else Saved Careers appears (your Dashboard too). Nothing's lost; it's always one tap away.",
  },
  {
    title: "Save a whole comparison",
    description: "Built a Compare that you want to revisit? Save it from the Compare view and it lands in the Saved Comparisons tray. Open one tap later to reload the exact same shortlist — great for weighing two paths over a few days.",
  },
  {
    title: "Update your preferences",
    description: "The radar is only as good as what you tell it. Tap 'Edit preferences' to change your subjects, work style, or people preference — the radar updates instantly.",
  },
  {
    title: "Set your career goal",
    description: "Found something interesting? Set it as your career goal from the career detail sheet. That unlocks the full My Journey experience \u2014 roadmap, voice narration, and a Momentum list of concrete next moves. You can change it anytime.",
  },
];

function RadarGuideTips() {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative inline-flex items-center justify-center rounded-pill transition-all shrink-0 mt-2",
            "h-8 w-8 border border-border/40 bg-background/60 text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground",
            open && "bg-primary/10 border-primary/40 text-primary",
          )}
          aria-label="How to use Career Radar"
          title="How to use Career Radar"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0 shadow-sm border-border/60"
        side="bottom"
        sideOffset={8}
        align="end"
      >
        <div className="p-4 space-y-2">
          <p className="text-sm font-semibold leading-tight">{RADAR_TIPS[tip].title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{RADAR_TIPS[tip].description}</p>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5 bg-muted/10">
          <div className="flex items-center gap-1">
            {RADAR_TIPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-pill transition-all duration-200",
                  i === tip ? "w-3 bg-primary" : i < tip ? "w-1 bg-primary/40" : "w-1 bg-muted-foreground/25",
                )}
              />
            ))}
            <span className="text-xs text-muted-foreground/60 ml-1.5">{tip + 1}/{RADAR_TIPS.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon" variant="ghost" className="h-6 w-6"
              onClick={() => setTip(Math.max(0, tip - 1))}
              disabled={tip === 0}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant={tip === RADAR_TIPS.length - 1 ? "default" : "ghost"}
              className={cn("h-6", tip === RADAR_TIPS.length - 1 ? "w-auto px-2 text-xs" : "w-6")}
              onClick={() => {
                if (tip < RADAR_TIPS.length - 1) setTip(tip + 1);
                else setOpen(false);
              }}
            >
              {tip === RADAR_TIPS.length - 1 ? "Got it" : <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
