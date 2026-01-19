"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sprout, AlertCircle, Loader2 } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const isEmployer = searchParams.get("role") === "employer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(isEmployer ? "EMPLOYER" : "YOUTH");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate age and bracket from date of birth
  const calculateAgeInfo = (dob: string) => {
    if (!dob) return { age: null, bracket: null };
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    const bracket = age >= 15 && age <= 17 ? "SIXTEEN_SEVENTEEN" : age >= 18 && age <= 20 ? "EIGHTEEN_TWENTY" : null;
    return { age, bracket };
  };

  const ageInfo = calculateAgeInfo(dateOfBirth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate terms acceptance
      if (!acceptedTerms || !acceptedPrivacy) {
        throw new Error("You must accept the Terms of Service and Privacy Policy to create an account");
      }

      // Validate password match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      // Validate date of birth for youth
      if (role === "YOUTH") {
        if (!dateOfBirth) {
          throw new Error("Date of birth is required");
        }
        if (ageInfo.age === null || ageInfo.age < 15 || ageInfo.age > 20) {
          throw new Error("Youth workers must be between 15 and 20 years old");
        }
      }

      // Create the user account with password
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          dateOfBirth: role === "YOUTH" ? dateOfBirth : undefined,
          ageBracket: role === "YOUTH" ? ageInfo.bracket : null,
          acceptedTerms,
          acceptedPrivacy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      toast({
        title: "Account created!",
        description: "You can now sign in with your email and password.",
      });

      // Redirect to signin page
      router.push("/auth/signin");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
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
      {/* Blobs hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-20 -left-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="hidden sm:block absolute top-20 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <Card className="w-full max-w-md shadow-2xl border-2 sm:hover-lift">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-2">
            <Sprout className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-base text-center">
            Join Sprout to gain practical experience and build your future
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* VIPPS Sign Up Button - Only shown when VIPPS is enabled */}
          {process.env.NEXT_PUBLIC_VIPPS_ENABLED === "true" && (
            <div className="space-y-4 mb-6">
              <Button
                type="button"
                className="w-full h-12 sm:h-11 bg-[#ff5b24] hover:bg-[#e54d1c] text-white font-semibold"
                onClick={() => signIn("vipps", { callbackUrl: "/auth/complete-profile" })}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
                </svg>
                Sign up with Vipps
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Quickest way to sign up. Your age will be verified automatically.
              </p>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign up with email
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 sm:h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-11 sm:h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="h-11 sm:h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <select
                id="role"
                className="flex h-11 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="YOUTH">Youth Worker (looking for jobs)</option>
                <option value="EMPLOYER">Job Poster (posting tasks)</option>
              </select>
            </div>

            {role === "YOUTH" && (
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                  className="h-11 sm:h-10"
                />
                {dateOfBirth && ageInfo.age !== null && (
                  <p className={`text-xs ${ageInfo.age >= 15 && ageInfo.age <= 20 ? "text-green-600" : "text-red-500"}`}>
                    {ageInfo.age >= 15 && ageInfo.age <= 20
                      ? `You are ${ageInfo.age} years old - eligible to join!`
                      : ageInfo.age < 15
                        ? "You must be at least 15 years old to register"
                        : "Youth workers must be 20 or younger. Consider registering as a job poster."}
                  </p>
                )}
              </div>
            )}

            {/* Terms & Privacy - Combined Checkbox */}
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

              {role === "YOUTH" && ageInfo.age !== null && ageInfo.age < 18 && (
                <div className="flex items-start space-x-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Guardian consent required.</strong> Since you're under 18, a parent or guardian will need to approve your account before you can apply for jobs.
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-10"
              disabled={loading || !acceptedTerms || !acceptedPrivacy}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground/70">
            Vipps and BankID login coming in production
          </p>
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
