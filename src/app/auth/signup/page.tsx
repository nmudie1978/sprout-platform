"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LAUNCHED_COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { PLATFORM_MIN_AGE } from "@/lib/safety/age";
import { Sparkles, Loader2, ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Sign-up — DOB-first stepped flow.
 *
 * Step 1: ask for date of birth ONLY, to enforce the 15–30 eligibility
 * floor. Under-15 and over-30 hit a calm rejection; everyone 15–30
 * continues the same way (no guardian step — age is a roadmap signal,
 * not a gate; see CLAUDE.md <age_policy>).
 *
 * Step 2: collect the rest of the details (email, password, first name,
 * terms). Auto-login on success and route to the dashboard where
 * onboarding picks up.
 */
function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const isTeacher = searchParams.get("role") === "teacher";
  const isAdultSignup = isTeacher;

  // ── Step state ────────────────────────────────────────────────────
  // Teachers skip the DOB-age-gate step because the 15–30 eligibility
  // logic only applies to youth; they prove 18+ via DOB in the details step.
  type Step = "dob" | "details";
  const [step, setStep] = useState<Step>(isAdultSignup ? "details" : "dob");

  // If the user lands on /auth/signup as a youth, enters an over-30 DOB,
  // and clicks the "sign up as a teacher" link, Next.js soft-navigates.
  // The component re-renders but useState is preserved, so step would
  // still be "dob" and the user would stay stuck. Flip to details as soon
  // as we see the adult flag.
  useEffect(() => {
    if (isAdultSignup) {
      setStep("details");
    }
  }, [isAdultSignup]);

  // ── Form state ────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [acceptedAll, setAcceptedAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // Role picked by URL query (?role=teacher); default youth.
  const role = isTeacher ? "TEACHER" : "YOUTH";

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
    // ageBracket is a deprecated/inert signal; only the youth bands are
    // meaningful, and older users send null (no bracket) so the server's
    // bracket cross-check is skipped for them.
    let bracket: string | null = null;
    if (age >= PLATFORM_MIN_AGE && age <= 17) bracket = "SIXTEEN_SEVENTEEN";
    else if (age >= 18 && age <= 23) bracket = "EIGHTEEN_TWENTY";
    return { age, bracket };
  };

  const ageInfo = calculateAgeInfo(dateOfBirth);
  const isUnderMinAge = ageInfo.age !== null && ageInfo.age < PLATFORM_MIN_AGE;
  // No upper eligibility limit — anyone 15+ is welcome. We only reject
  // implausible input (a sanity guard, not a product gate).
  const isImplausibleAge = ageInfo.age !== null && ageInfo.age > 100;
  const isEligible =
    ageInfo.age !== null &&
    ageInfo.age >= PLATFORM_MIN_AGE &&
    ageInfo.age <= 100;

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Normalise email once, up front — trim + lowercase so the account is
    // created and later logged into in a consistent form.
    const normalisedEmail = email.trim().toLowerCase();

    try {
      if (!acceptedAll) {
        throw new Error("Please accept the Terms and Privacy Policy to continue.");
      }
      if (!firstName.trim()) {
        throw new Error("Tell us your first name.");
      }
      if (!normalisedEmail || !normalisedEmail.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }
      if (password.length < 8) {
        throw new Error("Password needs to be at least 8 characters.");
      }
      if (role === "YOUTH") {
        if (!isEligible) {
          throw new Error("Endeavrly is for ages 15 and up. Please check your date of birth.");
        }
      }
      if (role === "TEACHER") {
        if (!dateOfBirth) {
          throw new Error("Please enter your date of birth.");
        }
        if (ageInfo.age === null || ageInfo.age < 18) {
          throw new Error("You must be 18 or older.");
        }
      }

      // Teachers send their DOB too so the API can enforce the 18+ floor
      // server-side. Youth signup shape is unchanged.
      const sendDob = role === "YOUTH" || role === "TEACHER";

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          surname: surname.trim(),
          lastName: surname.trim() || firstName.trim(),
          email: normalisedEmail,
          password,
          role,
          dateOfBirth: sendDob ? dateOfBirth : undefined,
          ageBracket: role === "YOUTH" ? ageInfo.bracket : null,
          country: role === "YOUTH" ? country : undefined,
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
        email: normalisedEmail,
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
        description: "Let's get you set up.",
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
                  We use this to shape your roadmap around where you are now &mdash; not to limit who can join. Endeavrly is for anyone 15 or older.
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
                    {isUnderMinAge && (
                      <p className="text-xs text-rose-500 leading-relaxed">
                        Endeavrly is for ages 15 and up. We hope to see you when you&rsquo;re a bit older.
                      </p>
                    )}
                    {isImplausibleAge && (
                      <p className="text-xs text-rose-500 leading-relaxed">
                        That date doesn&rsquo;t look right &mdash; please check your date of birth.
                      </p>
                    )}
                    {isEligible && (
                      <p className="text-xs text-teal-500 leading-relaxed">
                        Perfect &mdash; you&rsquo;re {ageInfo.age}. You&rsquo;re all set to continue.
                      </p>
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
              {/* Youth flow has a DOB step to go back to. Teachers land
                  straight on details, so their Back button goes to the
                  landing page instead. */}
              {isAdultSignup ? (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors -ml-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep("dob")}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors -ml-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              )}

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {isTeacher
                    ? "Create your teacher account"
                    : "Let's get you set up"}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isTeacher
                    ? "Teacher accounts use a school email (e.g. *.skole.no, *.vgs.no, *.edu). You'll get a class code to share with your students."
                    : "Just a few details and you're in."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    maxLength={50}
                    className="h-11"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Surname
                  </Label>
                  <Input
                    id="surname"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    maxLength={50}
                    className="h-11"
                  />
                </div>
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

              {isAdultSignup && (
                <div className="space-y-2">
                  <Label htmlFor="adultDob" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Date of birth
                  </Label>
                  <Input
                    id="adultDob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    required
                    className="h-11"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    You must be 18 or older. We don&apos;t share this.
                  </p>
                </div>
              )}

              {!isAdultSignup && (
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Where are you based?
                  </Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country" className="h-11">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAUNCHED_COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Helps us show you the right education routes and pathways for your country.
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
