"use client";

/**
 * DEV-ONLY visual harness for the onboarding sidebar spotlight.
 *
 *   /dev/onboarding-spotlight?mode=spotlight&target=/insights
 *   /dev/onboarding-spotlight?mode=modal
 *
 * `spotlight` renders the real sidebar + a standalone TourSpotlight aimed at a
 * target href (verifies the hole lands on the right item). `modal` renders the
 * full walkthrough over the sidebar (verifies the transparent overlay + card).
 * Not linked anywhere; used with headless Chrome to eyeball the result.
 */

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarNav } from "@/components/sidebar-nav";
import { TourSpotlight } from "@/components/onboarding/tour-spotlight";
import { OrientationWalkthrough } from "@/components/onboarding/orientation-walkthrough";

export default function OnboardingSpotlightDevPage() {
  const [qc] = useState(() => new QueryClient());
  const params = useSearchParams();
  const mode = params.get("mode") ?? "spotlight";
  const target = params.get("target") ?? "/careers/radar";

  return (
    <QueryClientProvider client={qc}>
      <div className="dark">
        <div className="flex min-h-screen bg-[hsl(var(--background))]">
          <SidebarNav userRole="YOUTH" userName="Dev" userEmail="dev@example.com" />
          <main className="flex-1 p-8 text-foreground">
            <h1 className="text-xl font-semibold">Dashboard (dev harness)</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Main content sits here behind the walkthrough.
            </p>
          </main>

          {mode === "modal" ? (
            <OrientationWalkthrough open onComplete={() => {}} />
          ) : (
            <TourSpotlight targetHref={target} active />
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}
