"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, ArrowLeft, ArrowRight, ShieldCheck, Heart } from "lucide-react";

/**
 * Sign-up — DOB-first stepped flow.
 *
 * Step 1: ask for date of birth ONLY. The age determines which path the
 * user takes. Under-15 hits a calm rejection. 16-17 sees a friendly note
 * about needing a parent. 18+ goes straight to the basic form.
 *
 * Step 2: collect the rest of the details (email, password, first name,
 * parent email if under 18, terms). Auto-login on success and route to
 * the dashboard where onboarding picks up.
 */
function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const isEmployer = searchParams.get("role") === "employer";

  // ── Step state ────────────────────────────────────────────────────
  type Step = "dob" | "details";
  const [step, setStep] = useState<Step>("dob");

  // ── Form state ────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [acceptedAll, setAcceptedAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // Employer flow uses a different role; we ignore most of this if so.
  const role = isEmployer ? "EMPLOYER" : "YOUTH";

  // ── Age computation ───────────────────────────────────────────────
  const calculateAgeInfo = (dob: string) => {
    if (!dob) return { age: null as number | null, bracket: null as string | null };
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    let bracket: string | null = null;
    if (age >= 15 && age <= 17) bracket = "SIXTEEN_SEVENTEEN";
    else if (age >= 18 && age <= 23) bracket = "EIGHTEEN_TWENTY";
    return { age, bracket };
  };

  const ageInfo = calculateAgeInfo(dateOfBirth);
  const isUnder18 = ageInfo.age !== null && ageInfo.age < 18;
  const isUnder15 = ageInfo.age !== null && ageInfo.age < 15;
  const isOver23 = ageInfo.age !== null && ageInfo.age > 23;
  const isEligible =
    ageInfo.age !== null && ageInfo.age >= 15 && ageInfo.age <= 23;

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!acceptedAll) {
        throw new Error("Please accept the Terms and Privacy Policy to continue.");
      }
      if (!firstName.trim()) {
        throw new Error("Tell us your first name.");
      }
      if (password.length < 8) {
        throw new Error("Password needs to be at least 8 characters.");
      }
      if (role === "YOUTH") {
        if (!isEligible) {
          throw new Error("Endeavrly is for ages 15–23.");
        }
        if (isUnder18 && !guardianEmail.trim()) {
          throw new Error("We need a parent or guardian email so they can confirm.");
        }
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          // lastName is collected later in profile setup if needed
          lastName: firstName.trim(),
          email,
          password,
          role,
          dateOfBirth: role === "YOUTH" ? dateOfBirth : undefined,
          ageBracket: role === "YOUTH" ? ageInfo.bracket : null,
          guardianEmail: role === "YOUTH" && isUnder18 ? guardianEmail.trim() : undefined,
          acceptedTerms: acceptedAll,
          acceptedPrivacy: acceptedAll,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      // Auto-login immediately
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast({
          title: "Account created",
          description: "Please sign in to continue.",
        });
        router.push("/auth/signin");
        return;
      }

      toast({
        title: "Welcome to Endeavrly",
        description: isUnder18
          ? "We've notified your parent. You can start exploring now."
          : "Let's get you set up.",
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Hold on",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-teal-500/5" />
      <div className="hidden sm:block absolute top-20 -left-4 w-72 h-72 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="hidden sm:block absolute top-20 -right-4 w-72 h-72 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <Card className="w-full max-w-md shadow-2xl border-2 sm:hover-lift">
        <CardContent className="p-6 sm:p-8">
          {/* ── Step 1: Date of Birth ─────────────────────────────── */}
          {step === "dob" && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 mb-3">
                  <Sparkles className="h-5 w-5 text-teal-500" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">First, when were you born?</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Endeavrly is built for 15&ndash;23 year olds. We just need this so we can set things up properly.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Date of birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="h-12 text-base"
                  autoFocus
                />
                {/* Live age feedback */}
                {dateOfBirth && ageInfo.age !== null && (
                  <div className="pt-1">
                    {isUnder15 && (
                      <p className="text-xs text-rose-500 leading-relaxed">
                        Endeavrly is for ages 15 and up. We hope to see you when you&rsquo;re a bit older.
                      </p>
                    )}
                    {isOver23 && (
                      <p className="text-xs text-rose-500 leading-relaxed">
                        Endeavrly is for 15&ndash;23 year olds. If you&rsquo;re posting jobs,{" "}
                        <Link
                          href="/auth/signup?role=employer"
                          className="text-teal-500 hover:underline"
                        >
                          sign up as a job poster
                        </Link>
                        .
                      </p>
                    )}
                    {isEligible && !isUnder18 && (
                      <p className="text-xs text-teal-500 leading-relaxed">
                        Perfect &mdash; you&rsquo;re {ageInfo.age}. You&rsquo;re all set to continue.
                      </p>
                    )}
                    {isEligible && isUnder18 && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-teal-500/[0.06] border border-teal-500/20 mt-1">
                        <ShieldCheck className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          You&rsquo;re {ageInfo.age}. Because you&rsquo;re under 18, we&rsquo;ll need to send a quick note to a parent or guardian. Nothing complicated &mdash; they just tap a link to confirm.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="button"
                className="w-full h-12 text-base"
                disabled={!isEligible}
                onClick={() => setStep("details")}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-teal-500 hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {/* ── Step 2: Details ───────────────────────────────────── */}
          {step === "details" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep("dob")}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors -ml-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {isUnder18 ? "Almost there" : "Let's get you set up"}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isUnder18
                    ? "Just a few details and a parent email so we can let them know."
                    : "Just a few details and you're in."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="What should we call you?"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  maxLength={50}
                  className="h-11"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Your email
                </Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11"
                />
              </div>

              {isUnder18 && (
                <div className="space-y-2 p-3 rounded-lg bg-teal-500/[0.04] border border-teal-500/20">
                  <Label
                    htmlFor="guardianEmail"
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300"
                  >
                    <Heart className="h-3 w-3" />
                    Parent or guardian email
                  </Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    inputMode="email"
                    placeholder="parent@email.com"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    required
                    className="h-11 bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    We&rsquo;ll send them a link to confirm. You can start exploring straight away &mdash; some things will unlock once they confirm.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  id="accept"
                  checked={acceptedAll}
                  onCheckedChange={(checked) => setAcceptedAll(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-teal-500 hover:underline" target="_blank">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="text-teal-500 hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={loading || !acceptedAll}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating your account&hellip;
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SignUpLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpLoading />}>
      <SignUpForm />
    </Suspense>
  );
}
