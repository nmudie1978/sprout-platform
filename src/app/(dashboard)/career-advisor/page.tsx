"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Spotlight } from "@/components/ui/spotlight";
import { Sparkles, Loader2, LogIn } from "lucide-react";
import { CareerTwinView } from "@/components/career-twin/career-twin-view";

// Career Twin is the single, primary AI experience. The legacy generic
// "Career Advisor" chat tab and the floating chat widget have been retired —
// there is one AI concept: a possible future version of yourself, not a
// support bot. See the Endeavrly design system (Career Twin section).
const TWIN_DESCRIPTION =
  "Talk to one possible future version of yourself — what this path could feel like, what it takes, and what to explore before you commit.";

export default function CareerTwinPage() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const careerParam = searchParams.get("career");

  const isAuthenticated = status === "authenticated";
  const isLoadingAuth = status === "loading";

  // Loading auth
  if (isLoadingAuth) {
    return (
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 max-w-4xl relative">
        <PageHeader title="Career" gradientText="Twin" description={TWIN_DESCRIPTION} icon={Sparkles} />
        <Card className="mt-8">
          <CardContent className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signed out
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 max-w-4xl relative">
        <PageHeader title="Career" gradientText="Twin" description={TWIN_DESCRIPTION} icon={Sparkles} />
        <Card className="mt-8">
          <CardContent className="py-16 text-center">
            <div className="p-4 rounded-pill bg-primary/20 w-fit mx-auto mb-6">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sign in to meet your Career Twin</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a free account or sign in to talk to one possible future
              version of yourself — and explore a path before you commit to it.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/auth/signin">
                <Button className="bg-primary hover:bg-primary/90">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline">Create Account</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signed in — Career Twin is the whole experience.
  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 max-w-4xl relative overflow-hidden">
      {/* Subtle spotlight sweep — dark-mode only, plays once on mount. */}
      <div className="absolute inset-0 -z-[5] hidden dark:block pointer-events-none">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-1/4" fill="hsl(166 72% 55%)" />
      </div>

      <PageHeader title="Career" gradientText="Twin" description={TWIN_DESCRIPTION} icon={Sparkles} />

      <div className="mt-8">
        <CareerTwinView initialCareerId={careerParam} />
      </div>
    </div>
  );
}
