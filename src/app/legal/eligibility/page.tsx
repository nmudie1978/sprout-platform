import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Age & Eligibility | Endeavrly",
  description: "Age requirements and eligibility criteria for using the Endeavrly platform",
};

export default function EligibilityPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Age & Eligibility</h1>
            <p className="text-muted-foreground">Last updated: 1 June 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>Who Can Use Endeavrly</h2>
            <p>
              Endeavrly is a career-exploration platform built for young people aged
              <strong> 15&ndash;23</strong>. It is not a jobs marketplace and does not offer paid
              work &mdash; so there are no job-poster or employer accounts.
            </p>
          </section>

          <section className="mb-8">
            <h2>Youth Users (Ages 15–23)</h2>
            <p>
              To register on Endeavrly, you must:
            </p>
            <ul>
              <li>Be between <strong>15 and 23 years old</strong></li>
              <li>Provide an accurate date of birth at sign-up</li>
            </ul>
            <p>
              Everyone aged 15&ndash;23 gets the <strong>same full access</strong> to the platform
              &mdash; career exploration, My Journey, Career Radar, the AI Advisor and Career Twin,
              and your Library. Age is used to tailor your roadmap (for example, education routes),
              not to lock features.
            </p>
          </section>

          <section className="mb-8">
            <h2>Age Verification</h2>
            <p>
              We verify age at sign-up via your date of birth (and, where available, Vipps). This is
              a one-time eligibility check so the platform stays a space for 15&ndash;23 year olds.
              We collect minimal information and do not require identity documents.
            </p>
          </section>

          <section className="mb-8">
            <h2>Account Suspension</h2>
            <p>
              Accounts may be suspended or removed if:
            </p>
            <ul>
              <li>False age information was provided during registration</li>
              <li>A user no longer meets the 15&ndash;23 eligibility requirement</li>
              <li>Our <Link href="/legal/safety" className="text-primary hover:underline">Safety &amp; Community Guidelines</Link> are violated</li>
            </ul>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Questions about eligibility?</p>
            <p className="text-muted-foreground">
              Contact us at: <a href="mailto:support@endeavrly.no" className="text-primary hover:underline">support@endeavrly.no</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
