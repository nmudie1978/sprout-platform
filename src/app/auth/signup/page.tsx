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
  const [ageBracket, setAgeBracket] = useState<string>("EIGHTEEN_TWENTY");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

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

      // Create the user account with password
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          ageBracket: role === "YOUTH" ? ageBracket : null,
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
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
      <div className="absolute top-20 -left-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-20 -right-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <Card className="w-full max-w-md shadow-2xl border-2 hover-lift">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="YOUTH">Youth (looking for jobs & careers)</option>
                <option value="EMPLOYER">Employer (posting jobs)</option>
              </select>
            </div>

            {role === "YOUTH" && (
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <select
                  id="age"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={ageBracket}
                  onChange={(e) => setAgeBracket(e.target.value)}
                >
                  <option value="SIXTEEN_SEVENTEEN">16-17 years old</option>
                  <option value="EIGHTEEN_TWENTY">18-20 years old</option>
                </select>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-primary hover:underline font-medium" target="_blank">
                    Terms of Service
                  </Link>
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="privacy"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <Link href="/legal/privacy" className="text-primary hover:underline font-medium" target="_blank">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/cookies" className="text-primary hover:underline font-medium" target="_blank">
                    Cookie Policy
                  </Link>
                </label>
              </div>

              {role === "YOUTH" && ageBracket === "SIXTEEN_SEVENTEEN" && (
                <div className="flex items-start space-x-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    If you're under 16, a parent or guardian must consent to these terms on your behalf.
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
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
