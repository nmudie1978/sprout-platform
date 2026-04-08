"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  Shield,
  X,
} from "lucide-react";

interface ConsentInfo {
  displayName: string;
  email: string;
  age: number | null;
  alreadyConsented: boolean;
  consentedAt: string | null;
  accountCreatedAt: string;
}

/**
 * Guardian Consent Page
 * ---------------------
 * The first thing a parent ever sees of Endeavrly. The job of this page is
 * NOT to collect consent — that's the easy part. The job is to *reassure*
 * the parent that this platform is safe, calm, well-designed, and worth
 * trusting their kid to.
 *
 * The structure leads with the kid's identity, then explains what
 * Endeavrly is in plain English, then names what the platform deliberately
 * does NOT do (no in-app payments, no open chat, no behavioural profiling),
 * then asks for the parent's name and a single confirmation tick.
 */
export default function GuardianConsentPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [consentInfo, setConsentInfo] = useState<ConsentInfo | null>(null);

  // Form state
  const [guardianName, setGuardianName] = useState("");
  const [relationship, setRelationship] = useState<string>("Parent");
  const [agreeAll, setAgreeAll] = useState(false);

  useEffect(() => {
    fetchConsentInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError("Please enter your name.");
      return;
    }
    if (!agreeAll) {
      setError("Please confirm to continue.");
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
          relationship,
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

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg border-0 shadow-none">
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error / invalid link state ──
  if (error && !consentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-10 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold mb-1">This link doesn&rsquo;t work</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              If you believe this is a mistake, ask the person who signed up to send a fresh link from their account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Already consented state ──
  if (consentInfo?.alreadyConsented) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-10 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-teal-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold mb-1">Already confirmed</h1>
              <p className="text-sm text-muted-foreground">
                You confirmed {consentInfo.displayName}&rsquo;s account on{" "}
                {new Date(consentInfo.consentedAt!).toLocaleDateString()}.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Nothing more to do — they&rsquo;re all set.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Success state ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-10 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-teal-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold mb-1">Thank you</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {consentInfo?.displayName} can now use everything Endeavrly has to offer.
              </p>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              You can close this tab.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main consent form ──
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Brand mark */}
        <div className="flex items-center gap-2 mb-10">
          <div className="h-7 w-7 rounded-lg bg-teal-500/15 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-teal-500" />
          </div>
          <span className="text-sm font-bold tracking-tight">Endeavrly</span>
        </div>

        {/* Hero — leads with the kid's identity */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold mb-2">
            Hello
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
            {consentInfo?.displayName} just signed up to Endeavrly.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-prose">
            They&rsquo;re {consentInfo?.age ?? "under 18"}, which means we need a parent or guardian to know about it.
            We just need a moment of your time and a single tick to confirm.
          </p>
        </div>

        {/* What it is */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            What is Endeavrly?
          </h2>
          <p className="text-base leading-relaxed text-foreground/85">
            Endeavrly is a calm, structured place for 15&ndash;23 year olds to explore careers in real depth &mdash; what jobs actually involve, what it takes to qualify, what the day-to-day looks like, and how to map a path toward something they&rsquo;re interested in.
          </p>
          <p className="text-base leading-relaxed text-foreground/85 mt-3">
            We sit alongside school career counsellors and{" "}
            <a
              href="https://utdanning.no"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 dark:text-teal-400 hover:underline"
            >
              utdanning.no
            </a>
            , not in place of them. Your child can spend time exploring careers in their own time, between conversations with you, their teachers, and their counsellor.
          </p>
        </section>

        {/* What we deliberately do — and don't do */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            How we keep things safe
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  What we do
                </span>
              </div>
              <ul className="text-sm text-foreground/85 space-y-1.5 leading-relaxed">
                <li>Honest career information from real sources</li>
                <li>Age-appropriate content only</li>
                <li>Structured messaging with verified job posters</li>
                <li>Clear &ldquo;Report&rdquo; options on every screen</li>
                <li>GDPR-compliant by design</li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <X className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  What we don&rsquo;t do
                </span>
              </div>
              <ul className="text-sm text-foreground/85 space-y-1.5 leading-relaxed">
                <li>No in-app payments, ever</li>
                <li>No open chat with strangers</li>
                <li>No behavioural profiling or tracking ads</li>
                <li>No likes, streaks, or follower counts</li>
                <li>No selling data to anyone</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What your child can do */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            What your child can do on Endeavrly
          </h2>
          <ul className="space-y-2.5">
            {[
              {
                icon: Eye,
                title: "Explore careers in depth",
                body: "Watch day-in-the-life videos, read about real responsibilities, and compare paths side by side.",
              },
              {
                icon: Sparkles,
                title: "See careers they&rsquo;ve never heard of",
                body: "A personalised radar surfaces options that match their interests &mdash; including vocational paths, not just university tracks.",
              },
              {
                icon: Shield,
                title: "Apply for small local jobs (only after your confirmation)",
                body: "Babysitting, dog walking, tech help &mdash; from verified job posters in their area. No money flows through Endeavrly itself.",
              },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border bg-card p-4"
              >
                <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-0.5">
                    <span dangerouslySetInnerHTML={{ __html: item.title }} />
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: item.body }} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* The form */}
        <section className="rounded-2xl border-2 bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-1">Confirm</h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Just a name and a single tick. Takes ten seconds.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName" className="text-xs uppercase tracking-wider text-muted-foreground">
                Your name
              </Label>
              <Input
                id="guardianName"
                placeholder="Your full name"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship" className="text-xs uppercase tracking-wider text-muted-foreground">
                Your relationship to {consentInfo?.displayName}
              </Label>
              <select
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Parent">Parent</option>
                <option value="Legal guardian">Legal guardian</option>
                <option value="Other">Other (explain on request)</option>
              </select>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="agreeAll"
                checked={agreeAll}
                onCheckedChange={(checked) => setAgreeAll(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="agreeAll" className="text-sm leading-relaxed cursor-pointer text-foreground/85">
                I confirm I&rsquo;m {consentInfo?.displayName}&rsquo;s parent or guardian, and I&rsquo;m happy for them to use Endeavrly. I&rsquo;ve read the{" "}
                <Link href="/legal/terms" target="_blank" className="text-teal-600 dark:text-teal-400 hover:underline">
                  Terms
                </Link>
                {" "}and{" "}
                <Link href="/legal/privacy" target="_blank" className="text-teal-600 dark:text-teal-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
              disabled={submitting || !guardianName || !agreeAll}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming&hellip;
                </>
              ) : (
                "Confirm"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-1 leading-relaxed">
              You can withdraw consent at any time by emailing{" "}
              <a href="mailto:support@endeavrly.no" className="text-teal-600 dark:text-teal-400 hover:underline">
                support@endeavrly.no
              </a>
            </p>
          </form>
        </section>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground mt-8">
          Endeavrly is built in Norway, for 15&ndash;23 year olds. Safety-by-design, privacy-first.
        </p>
      </div>
    </div>
  );
}
