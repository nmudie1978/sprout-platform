"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Loader2 } from "lucide-react";

export default function AcceptTermsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;

    setLoading(true);
    try {
      const response = await fetch("/api/legal/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to record acceptance");
      }

      toast({
        title: "Terms accepted",
        description: "Thank you for accepting our terms.",
      });

      router.push("/dashboard");
      router.refresh();
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-lg border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sprout className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Updated Terms</CardTitle>
          <CardDescription className="text-base">
            Please review and accept our Terms of Service and Privacy Policy to continue using Sprout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Before you continue, please take a moment to review our policies:
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="text-primary hover:underline" target="_blank">
                  Terms of Service
                </Link>{" "}
                — How you can use Sprout
              </li>
              <li>
                <Link href="/legal/privacy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </Link>{" "}
                — How we handle your data
              </li>
              <li>
                <Link href="/legal/safety" className="text-primary hover:underline" target="_blank">
                  Safety Guidelines
                </Link>{" "}
                — Our community standards
              </li>
              <li>
                <Link href="/legal/eligibility" className="text-primary hover:underline" target="_blank">
                  Age & Eligibility
                </Link>{" "}
                — Who can use Sprout
              </li>
              <li>
                <Link href="/legal/disclaimer" className="text-primary hover:underline" target="_blank">
                  Disclaimer
                </Link>{" "}
                — Important liability information
              </li>
            </ul>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border">
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="accept-terms"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I have read and agree to the{" "}
              <Link href="/legal/terms" className="text-primary hover:underline font-medium" target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-primary hover:underline font-medium" target="_blank">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            onClick={handleAccept}
            disabled={!accepted || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Accept and Continue"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
