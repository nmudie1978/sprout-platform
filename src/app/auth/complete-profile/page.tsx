"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sprout, AlertCircle, Loader2, User, Briefcase, CheckCircle } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { toast } = useToast();

  const [role, setRole] = useState<"YOUTH" | "EMPLOYER" | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate age from VIPPS birthdate
  const calculateAge = (birthdate: string): number | null => {
    if (!birthdate) return null;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = session?.user?.vippsProfile?.birthdate
    ? calculateAge(session.user.vippsProfile.birthdate)
    : null;

  const isUnder18 = age !== null && age < 18;
  const canBeYouth = age === null || (age >= 15 && age <= 20);
  const canBeEmployer = age === null || age >= 18;

  // Redirect if not a new VIPPS user
  useEffect(() => {
    if (status === "authenticated" && !session?.user?.isNewVippsUser) {
      // User already has a complete profile, redirect to dashboard
      const destination = session?.user?.role === "EMPLOYER"
        ? "/employer/dashboard"
        : "/dashboard";
      router.push(destination);
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
    if (!role) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          acceptedTerms,
          acceptedPrivacy,
          companyName: role === "EMPLOYER" ? companyName : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete profile");
      }

      toast({
        title: "Welcome to Sprout!",
        description: data.message,
      });

      // Update session to reflect new role
      await update();

      // Redirect to appropriate dashboard
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
      <div className="hidden sm:block absolute top-20 -left-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="hidden sm:block absolute top-20 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <Card className="w-full max-w-md shadow-2xl border-2 sm:hover-lift">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-2">
            <Sprout className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-base text-center">
            {session?.user?.vippsProfile?.name && (
              <span className="block mb-2">
                Welcome, <strong>{session.user.vippsProfile.name}</strong>!
              </span>
            )}
            Choose how you want to use Sprout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>I want to...</Label>
              <div className="grid grid-cols-1 gap-3">
                {/* Youth Worker Option */}
                <button
                  type="button"
                  onClick={() => canBeYouth && setRole("YOUTH")}
                  disabled={!canBeYouth}
                  className={`relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    role === "YOUTH"
                      ? "border-green-500 bg-green-500/10"
                      : canBeYouth
                        ? "border-border hover:border-primary/50 hover:bg-accent"
                        : "border-border opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    role === "YOUTH" ? "bg-green-500 text-white" : "bg-muted"
                  }`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Find jobs</span>
                      {role === "YOUTH" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Browse and apply for local micro-jobs
                    </p>
                    {!canBeYouth && age !== null && (
                      <p className="text-xs text-red-500 mt-1">
                        Youth workers must be between 15-20 years old
                      </p>
                    )}
                  </div>
                </button>

                {/* Employer Option */}
                <button
                  type="button"
                  onClick={() => canBeEmployer && setRole("EMPLOYER")}
                  disabled={!canBeEmployer}
                  className={`relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    role === "EMPLOYER"
                      ? "border-blue-500 bg-blue-500/10"
                      : canBeEmployer
                        ? "border-border hover:border-primary/50 hover:bg-accent"
                        : "border-border opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    role === "EMPLOYER" ? "bg-blue-500 text-white" : "bg-muted"
                  }`}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Post jobs</span>
                      {role === "EMPLOYER" && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Post tasks and hire local youth workers
                    </p>
                    {!canBeEmployer && age !== null && (
                      <p className="text-xs text-red-500 mt-1">
                        You must be 18+ to post jobs
                      </p>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Company Name (for employers) */}
            {role === "EMPLOYER" && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company or Display Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Your name or business"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="h-11 sm:h-10"
                />
                <p className="text-xs text-muted-foreground">
                  This will be shown to youth workers when you post jobs
                </p>
              </div>
            )}

            {/* Terms & Privacy */}
            {role && (
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

                {/* Guardian consent notice for youth under 18 */}
                {role === "YOUTH" && isUnder18 && (
                  <div className="flex items-start space-x-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      <strong>Guardian consent required.</strong> Since you're under 18, a parent or guardian will need to approve your account before you can apply for jobs.
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 sm:h-10"
              disabled={!role || loading || !acceptedTerms || !acceptedPrivacy || (role === "EMPLOYER" && !companyName.trim())}
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
