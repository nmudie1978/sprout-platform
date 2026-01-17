import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Age & Eligibility | Sprout",
  description: "Age requirements and eligibility criteria for using the Sprout platform",
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
            <p className="text-muted-foreground">Last updated: [DATE]</p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Placeholder - To be reviewed by legal counsel before launch
        </Badge>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>Who Can Use Sprout</h2>
            <p>
              Sprout is designed for young people in Norway seeking appropriate work opportunities.
              Our platform has specific requirements depending on your role.
            </p>
          </section>

          <section className="mb-8">
            <h2>Youth Workers (Job Seekers)</h2>
            <p>
              To register as a youth worker on Sprout, you must:
            </p>
            <ul>
              <li>Be between <strong>15 and 20 years old</strong></li>
              <li>Be legally permitted to work in Norway</li>
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
                  <td className="p-2 border-b">15-17 years</td>
                  <td className="p-2 border-b">Guardian consent required before applying for jobs</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">18-20 years</td>
                  <td className="p-2 border-b">No guardian consent required</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2>Adults (Job Posters / Employers)</h2>
            <p>
              To post jobs on Sprout, you must:
            </p>
            <ul>
              <li>Be at least <strong>18 years old</strong></li>
              <li>Complete identity verification (BankID or equivalent)</li>
              <li>Agree to follow all applicable employment laws for young workers</li>
            </ul>
            <p>
              Identity verification is required for all adults before they can contact
              youth workers. This helps protect young people on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>Guardian Consent</h2>
            <p>
              For youth workers under 18, we require guardian consent before they can
              apply for jobs. This ensures that a parent or guardian is aware of their
              activity on the platform.
            </p>
            <ul>
              <li>Guardian consent is requested via email during registration</li>
              <li>The guardian must confirm they approve of the young person using Sprout</li>
              <li>Guardian consent can be revoked at any time by contacting us</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Restricted Categories</h2>
            <p>
              Certain job categories may have additional age restrictions based on
              Norwegian labour law:
            </p>
            <ul>
              <li>Some jobs may only be available to those 16 or older</li>
              <li>Night work and certain hours are restricted for minors</li>
              <li>Hazardous work is prohibited for all workers under 18</li>
            </ul>
            <p>
              Job postings on Sprout will indicate any specific age requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2>Verification Process</h2>
            <p>
              Sprout uses the following methods to verify users:
            </p>
            <ul>
              <li><strong>Youth (15-20):</strong> Vipps login or age verification during sign-up</li>
              <li><strong>Adults (18+):</strong> BankID or equivalent identity verification</li>
            </ul>
            <p>
              These verification methods help ensure users are who they say they are
              and meet our age requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2>Account Suspension</h2>
            <p>
              Accounts may be suspended or removed if:
            </p>
            <ul>
              <li>False age information was provided</li>
              <li>A user no longer meets eligibility requirements</li>
              <li>Our <Link href="/legal/safety" className="text-primary hover:underline">Safety Guidelines</Link> are violated</li>
            </ul>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Questions about eligibility?</p>
            <p className="text-muted-foreground">
              Contact us at: [support@sprout.no]
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
