"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sprout, Shield, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface ConsentInfo {
  displayName: string;
  email: string;
  age: number | null;
  alreadyConsented: boolean;
  consentedAt: string | null;
  accountCreatedAt: string;
}

export default function GuardianConsentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [consentInfo, setConsentInfo] = useState<ConsentInfo | null>(null);

  // Form state
  const [guardianName, setGuardianName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMonitoring, setAgreeMonitoring] = useState(false);
  const [confirmRelationship, setConfirmRelationship] = useState(false);

  useEffect(() => {
    fetchConsentInfo();
  }, [token]);

  async function fetchConsentInfo() {
    try {
      const response = await fetch(`/api/guardian-consent?token=${token}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid consent link");
      }
      const data = await response.json();
      setConsentInfo(data);
    } catch (err: any) {
      setError(err.message || "Failed to load consent request");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!guardianName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!agreeTerms || !agreeMonitoring || !confirmRelationship) {
      setError("Please agree to all terms to provide consent");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/guardian-consent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          consent: true,
          guardianName: guardianName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit consent");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit consent");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
        <Card className="w-full max-w-lg">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <p className="text-muted-foreground">Loading consent request...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !consentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white dark:from-red-950 dark:to-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Invalid or Expired Link</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please ask your child to send a new consent request.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (consentInfo?.alreadyConsented) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Consent Already Provided</CardTitle>
            <CardDescription>
              You have already given consent for {consentInfo.displayName}'s account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Consent was provided on {new Date(consentInfo.consentedAt!).toLocaleDateString()}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Consent Provided Successfully</CardTitle>
            <CardDescription>
              Thank you for approving {consentInfo?.displayName}'s account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {consentInfo?.displayName} can now apply to jobs and message job posters on Sprout.
              We'll ensure their safety through our moderation systems.
            </p>
            <div className="pt-4">
              <Button variant="outline" onClick={() => window.close()}>
                Close this page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="h-10 w-10 text-green-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Sprout
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Guardian Consent Request</h1>
          <p className="text-muted-foreground">
            Your child has requested permission to use Sprout Youth Platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>About This Request</CardTitle>
                <CardDescription>
                  Review the information below and provide your consent
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Youth Information */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3">Account Information</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Display Name:</span>
                  <span className="font-medium">{consentInfo?.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{consentInfo?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age:</span>
                  <span className="font-medium">{consentInfo?.age} years old</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Created:</span>
                  <span className="font-medium">
                    {new Date(consentInfo?.accountCreatedAt || "").toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* What Sprout Is */}
            <div className="space-y-2">
              <h3 className="font-semibold">What is Sprout?</h3>
              <p className="text-sm text-muted-foreground">
                Sprout is a platform that connects young people (ages 15-20) with local micro-jobs
                like babysitting, dog walking, lawn care, and more. We prioritise safety with
                verified job posters, messaging moderation, and age-appropriate job listings.
              </p>
            </div>

            {/* Safety Measures */}
            <div className="space-y-2">
              <h3 className="font-semibold">Our Safety Measures</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>All job posters must verify their identity (18+ only)</li>
                <li>Messages are monitored for inappropriate content</li>
                <li>Youth can report any concerns directly to our team</li>
                <li>No personal address or detailed location sharing</li>
                <li>Profile photos use avatars only (no real photos)</li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Consent Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="guardianName">Your Full Name (Guardian/Parent)</Label>
                <Input
                  id="guardianName"
                  placeholder="Enter your full name"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="confirmRelationship"
                    checked={confirmRelationship}
                    onCheckedChange={(checked) => setConfirmRelationship(checked === true)}
                  />
                  <Label htmlFor="confirmRelationship" className="text-sm leading-tight cursor-pointer">
                    I confirm that I am the parent or legal guardian of {consentInfo?.displayName}
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeTerms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                  />
                  <Label htmlFor="agreeTerms" className="text-sm leading-tight cursor-pointer">
                    I have read and agree to Sprout's{" "}
                    <a href="/legal/terms" target="_blank" className="text-primary underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/legal/privacy" target="_blank" className="text-primary underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeMonitoring"
                    checked={agreeMonitoring}
                    onCheckedChange={(checked) => setAgreeMonitoring(checked === true)}
                  />
                  <Label htmlFor="agreeMonitoring" className="text-sm leading-tight cursor-pointer">
                    I understand that {consentInfo?.displayName} will be able to apply for jobs,
                    communicate with job posters, and share their availability on Sprout
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !guardianName || !agreeTerms || !agreeMonitoring || !confirmRelationship}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Give Consent"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You can revoke consent at any time by contacting support@sprout.no
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
