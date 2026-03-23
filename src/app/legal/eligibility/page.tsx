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
            <p className="text-muted-foreground">Last updated: 23 March 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>Who Can Use Endeavrly</h2>
            <p>
              Endeavrly is designed for young people in Norway seeking career development support and
              appropriate work opportunities. Our Platform has specific requirements depending on your role.
            </p>
          </section>

          <section className="mb-8">
            <h2>Youth Users (Ages 15–23)</h2>
            <p>
              To register as a youth user on Endeavrly, you must:
            </p>
            <ul>
              <li>Be between <strong>15 and 23 years old</strong></li>
              <li>Be legally permitted to reside in Norway</li>
              <li>Provide accurate information about your age during registration</li>
            </ul>

            <h3>Age Groups and Requirements</h3>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Age</th>
                  <th className="text-left p-2 border-b">Requirements</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">15–17 years</td>
                  <td className="p-2 border-b">Guardian consent required before applying for jobs. Career exploration and journey features are available without guardian consent.</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">18–23 years</td>
                  <td className="p-2 border-b">No guardian consent required. Full access to all Platform features.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2>Adults (Job Posters)</h2>
            <p>
              To post jobs on Endeavrly, you must:
            </p>
            <ul>
              <li>Be at least <strong>18 years old</strong></li>
              <li>Complete identity verification (BankID or equivalent)</li>
              <li>Agree to comply with all applicable Norwegian employment laws for young workers</li>
            </ul>
            <p>
              Identity verification is required for all adults before they can post jobs or
              contact youth users. This helps protect young people on our Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>Guardian Consent</h2>
            <p>
              For youth users under 18, we require guardian consent before they can
              apply for jobs. This ensures that a parent or legal guardian is aware of their
              activity on the Platform.
            </p>
            <ul>
              <li>Guardian consent is requested via email during registration</li>
              <li>The guardian must confirm they approve of the young person using Endeavrly for job-related features</li>
              <li>Guardian consent can be revoked at any time by contacting us at <a href="mailto:support@endeavrly.no" className="text-primary hover:underline">support@endeavrly.no</a></li>
              <li>Revoking consent will restrict the user&apos;s ability to apply for jobs but will not delete their account or journey progress</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Restricted Categories</h2>
            <p>
              Certain job categories may have additional age restrictions based on
              Norwegian labour law (<em>Arbeidsmiljøloven</em>):
            </p>
            <ul>
              <li>Some jobs may only be available to those aged 16 or older</li>
              <li>Night work (between 21:00 and 06:00) is restricted for workers under 18</li>
              <li>Hazardous work is prohibited for all workers under 18</li>
              <li>Working hours for minors are limited in accordance with Norwegian law</li>
            </ul>
            <p>
              Job postings on Endeavrly will indicate any specific age requirements where applicable.
            </p>
          </section>

          <section className="mb-8">
            <h2>Verification Process</h2>
            <p>
              Endeavrly uses the following methods to verify users:
            </p>
            <ul>
              <li><strong>Youth (15–23):</strong> age verification during sign-up via date of birth and, where available, Vipps login</li>
              <li><strong>Adults (18+):</strong> BankID or equivalent identity verification</li>
            </ul>
            <p>
              These verification methods help ensure users meet our age requirements and
              that adults interacting with minors have been identified.
            </p>
          </section>

          <section className="mb-8">
            <h2>Account Suspension</h2>
            <p>
              Accounts may be suspended or removed if:
            </p>
            <ul>
              <li>False age information was provided during registration</li>
              <li>A user no longer meets eligibility requirements</li>
              <li>Our <Link href="/legal/safety" className="text-primary hover:underline">Safety & Community Guidelines</Link> are violated</li>
              <li>A guardian revokes consent for a minor&apos;s account</li>
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
