import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Disclaimer | Endeavrly",
  description: "Disclaimer for using the Endeavrly career-exploration platform",
};

export default function DisclaimerPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Disclaimer</h1>
            <p className="text-muted-foreground">Last updated: 1 June 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>Platform Role</h2>
            <p>
              Endeavrly is a career-exploration and information platform for young people
              (ages 15&ndash;23). It helps you explore careers, understand realistic education
              pathways, and reflect on your direction.
            </p>
            <p>
              Endeavrly is <strong>not</strong> a jobs marketplace, recruiter, employer, or
              staffing agency, and it does <strong>not</strong> process payments or connect you
              with paid work. It is also not a substitute for professional careers guidance from a
              school counsellor, careers adviser, or other qualified professional.
            </p>
          </section>

          <section className="mb-8">
            <h2>Information, Not Advice</h2>
            <p>
              The career information on Endeavrly &mdash; including salary ranges, growth outlooks,
              education routes, entry requirements, and timelines &mdash; is provided for general
              guidance only. It is drawn from public sources, may be approximate, and can become out
              of date or vary by country, region, employer, and individual circumstances.
            </p>
            <ul>
              <li>Figures are estimates and ranges, not guarantees.</li>
              <li>Always verify important details (e.g. entry requirements, application deadlines, fees) with official sources before making decisions.</li>
              <li>Any decisions you make about your education or career are your own.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>AI Features</h2>
            <p>
              Some features &mdash; such as the AI Career Advisor and Career Twin &mdash; generate
              responses using AI. These are intended to help you think and explore. They can be
              incomplete or wrong, and the Career Twin is <strong>a simulation, not a prediction</strong>
              of your future. Treat AI output as a starting point and check anything important.
            </p>
          </section>

          <section className="mb-8">
            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by Norwegian law, Endeavrly is not liable for decisions
              made, or actions taken, in reliance on information or AI-generated content on the
              Platform, nor for any loss arising from inaccurate, incomplete, or out-of-date content.
            </p>
            <p>
              Nothing in this disclaimer limits liability for death or personal injury caused by
              negligence, fraud, or any other liability that cannot be excluded or limited under
              Norwegian law.
            </p>
          </section>

          <section className="mb-8">
            <h2>Reporting & Safety</h2>
            <p>
              We take safety seriously. Please report any inappropriate content or behaviour using the
              in-app reporting tools. For a personal emergency or immediate danger, contact local
              authorities directly (Police: 112, Ambulance: 113, Fire: 110).
            </p>
            <p>
              See our <Link href="/legal/safety" className="text-primary hover:underline">Safety &amp; Community Guidelines</Link> for more on reporting and staying safe.
            </p>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="text-muted-foreground">
              This disclaimer should be reviewed by qualified legal counsel before being relied upon. It is provided as a working draft and does not constitute legal advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
