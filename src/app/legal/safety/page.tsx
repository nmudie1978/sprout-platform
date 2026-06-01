import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Safety & Community Guidelines | Endeavrly",
  description: "Safety and community guidelines for using the Endeavrly platform",
};

export default function SafetyGuidelinesPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Safety & Community Guidelines</h1>
            <p className="text-muted-foreground">Last updated: 1 June 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>Our Commitment to Safety</h2>
            <p>
              Endeavrly is a career-exploration platform built safety-first for young people aged
              15&ndash;23. Safety isn&apos;t a feature bolted on &mdash; it shapes what the platform
              deliberately does <em>not</em> do. These guidelines explain how we keep it a calm,
              protected space.
            </p>
          </section>

          <section className="mb-8">
            <h2>Safety by Design</h2>
            <p>
              We remove whole categories of risk by design:
            </p>
            <ul>
              <li><strong>No open social or messaging features</strong> — there are no DMs, friend requests, or chats between users, so there is no channel for grooming or harassment.</li>
              <li><strong>No public profiles or contact sharing</strong> — your details aren&apos;t broadcast, and emails/phone numbers are hidden by default.</li>
              <li><strong>No jobs, payments, or marketplace</strong> — Endeavrly does not connect you with paid work or handle money, so there are no transactions or strangers to meet.</li>
              <li><strong>No popularity or comparison mechanics</strong> — no followers, leaderboards, or public rankings.</li>
              <li><strong>Minimal data</strong> — we collect only what the experience needs. See our <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Age-Appropriate Content & AI</h2>
            <p>
              Content is written for a 15&ndash;23 audience. Our AI features (the Career Advisor and
              Career Twin) operate within strict guardrails: they stay on careers and education, never
              provide therapy or medical advice, and, if someone seems distressed, gently point to a
              trusted adult or a support line rather than trying to counsel. AI responses are guidance,
              not fact &mdash; see our <Link href="/legal/disclaimer" className="text-primary hover:underline">Disclaimer</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2>Reporting & Moderation</h2>
            <p>
              If you see content or behaviour that feels wrong, use the in-app <strong>Report</strong>
              tools to flag it for our moderation team. All reports are reviewed, we act where needed
              (including removing content or suspending accounts), and you will never be penalised for
              reporting in good faith.
            </p>
          </section>

          <section className="mb-8">
            <h2>Emergency Situations</h2>
            <p>
              If you are in immediate danger, contact emergency services first:
            </p>
            <ul>
              <li><strong>Police:</strong> 112</li>
              <li><strong>Ambulance:</strong> 113</li>
              <li><strong>Fire:</strong> 110</li>
            </ul>
            <p>
              If you&apos;re struggling, please also reach out to a trusted adult or a support line
              (in Norway, Mental Helse: 116 123).
            </p>
          </section>

          <section className="mb-8">
            <h2>For Parents and Guardians</h2>
            <p>
              We encourage open conversations between young people and their families about exploring
              careers. You can:
            </p>
            <ul>
              <li>Explore the platform together and talk through what they&apos;re discovering</li>
              <li>Share your own career path to help young people, via <Link href="/for-parents" className="text-primary hover:underline">For Parents</Link> &mdash; no account needed</li>
              <li>Contact us at any time with questions or concerns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Related Policies</h2>
            <p>
              Please also review our other policies:
            </p>
            <ul>
              <li><Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
              <li><Link href="/legal/eligibility" className="text-primary hover:underline">Age & Eligibility</Link></li>
              <li><Link href="/legal/disclaimer" className="text-primary hover:underline">Disclaimer</Link></li>
            </ul>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Contact Us</p>
            <p className="text-muted-foreground">
              For safety concerns or questions about these guidelines, contact us at:{" "}
              <a href="mailto:safety@endeavrly.no" className="text-primary hover:underline">safety@endeavrly.no</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
