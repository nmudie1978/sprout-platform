"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Navigation2, Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { toast } = useToast();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if not a new VIPPS user
  useEffect(() => {
    if (status === "authenticated" && !session?.user?.isNewVippsUser) {
      // User already has a complete profile, redirect to dashboard
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect unauthenticated users
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "YOUTH",
          acceptedTerms,
          acceptedPrivacy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete profile");
      }

      toast({
        title: "Welcome to Endeavrly!",
        description: data.message,
      });

      // Update session to reflect new role
      await update();

      // Redirect to the dashboard
      router.push(data.redirectUrl);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
      <div className="hidden sm:block absolute top-20 -left-4 w-72 h-72 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="hidden sm:block absolute top-20 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <Card className="w-full max-w-md shadow-2xl border-2 sm:hover-lift">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-2">
            <Navigation2 className="h-10 w-10 text-emerald-500 fill-emerald-500" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-base text-center">
            {session?.user?.vippsProfile?.name && (
              <span className="block mb-2">
                Welcome, <strong>{session.user.vippsProfile.name}</strong>!
              </span>
            )}
            Just one more step to start exploring careers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Terms & Privacy */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms-privacy"
                  checked={acceptedTerms && acceptedPrivacy}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true;
                    setAcceptedTerms(isChecked);
                    setAcceptedPrivacy(isChecked);
                  }}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms-privacy"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-primary hover:underline font-medium" target="_blank">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="text-primary hover:underline font-medium" target="_blank">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <p className="text-xs text-muted-foreground pl-7">
                Also see our{" "}
                <Link href="/legal/safety" className="text-primary hover:underline" target="_blank">
                  Safety Guidelines
                </Link>
                ,{" "}
                <Link href="/legal/eligibility" className="text-primary hover:underline" target="_blank">
                  Age & Eligibility
                </Link>
                , and{" "}
                <Link href="/legal/disclaimer" className="text-primary hover:underline" target="_blank">
                  Disclaimer
                </Link>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-10"
              disabled={loading || !acceptedTerms || !acceptedPrivacy}
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
