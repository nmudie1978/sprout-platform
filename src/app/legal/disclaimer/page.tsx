import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Platform Disclaimer | Endeavrly",
  description: "Disclaimer and safety information for the Endeavrly platform",
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
            <h1 className="text-3xl font-bold">Platform Disclaimer</h1>
            <p className="text-muted-foreground">Last updated: March 2026</p>
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
            <h2>What Endeavrly Is</h2>
            <p>
              Endeavrly is a <strong>career exploration and development platform</strong> for
              young people aged 15–23. Our primary purpose is to help users discover their
              strengths, understand career paths, and take meaningful steps toward their future.
            </p>
            <p>
              The platform provides:
            </p>
            <ul>
              <li>A guided journey framework (Discover, Understand, Grow)</li>
              <li>Career research tools and industry insights</li>
              <li>Personalised career roadmaps</li>
              <li>Goal tracking and reflection tools</li>
              <li>A small jobs marketplace connecting youth with local opportunities</li>
            </ul>
            <p>
              Endeavrly is <strong>not an employer</strong>. We do not hire, employ, or
              contract workers. Any work arrangement made through the jobs marketplace is
              directly between the youth and the job poster.
            </p>
          </section>

          <section className="mb-8">
            <h2>Career Guidance Disclaimer</h2>
            <p>
              The career information, roadmaps, and insights provided on Endeavrly are for
              <strong> informational and exploratory purposes only</strong>. They do not
              constitute professional career advice, educational guidance, or employment
              recommendations.
            </p>
            <p>
              Career roadmaps are AI-generated based on general industry data and should
              be used as a starting point for exploration, not as a definitive plan. Users
              should consult with school counsellors, career advisors, or other qualified
              professionals for personalised guidance.
            </p>
          </section>

          <section className="mb-8">
            <h2>User Responsibility</h2>
            <p>All users are responsible for:</p>
            <ul>
              <li>Verifying career information independently before making decisions</li>
              <li>Consulting with trusted adults, guardians, or professional advisors</li>
              <li>Assessing the safety and suitability of any job opportunities</li>
              <li>Ensuring any work complies with applicable laws and regulations</li>
              <li>Communicating clearly about expectations and requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>For Youth Users</h2>
            <p>When using the platform, remember:</p>
            <ul>
              <li>Career exploration is a journey — there are no wrong answers</li>
              <li>The information here supplements, but does not replace, professional guidance</li>
              <li>Before accepting any job, inform a parent, guardian, or trusted adult</li>
              <li>You have the right to decline any opportunity that makes you uncomfortable</li>
              <li>Your data and journey progress are private and belong to you</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>For Job Posters</h2>
            <p>Job posters using the small jobs marketplace are responsible for:</p>
            <ul>
              <li>Providing safe working conditions</li>
              <li>Complying with Norwegian labour laws for young workers</li>
              <li>Accurately describing job requirements and conditions</li>
              <li>Ensuring tasks are appropriate for the worker&apos;s age</li>
              <li>Having appropriate insurance where required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Data & Privacy</h2>
            <p>
              Endeavrly is built with a <strong>privacy-first approach</strong>. We collect
              minimal data, do not use tracking ads, and do not engage in behavioural profiling.
              Journey data and career research are stored securely and belong to the user.
            </p>
            <p>
              See our <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link> for
              full details on data handling.
            </p>
          </section>

          <section className="mb-8">
            <h2>Limitation of Liability</h2>
            <p>Endeavrly is not liable for:</p>
            <ul>
              <li>Career decisions made based on information provided on the platform</li>
              <li>Accuracy of AI-generated roadmaps or career insights</li>
              <li>Injuries, accidents, or harm occurring during work arranged through the jobs marketplace</li>
              <li>Payment disputes between users of the jobs marketplace</li>
              <li>Actions of users on or off the platform</li>
            </ul>
            <p>
              [PLACEHOLDER: Specific limitation of liability language to be drafted
              by legal counsel in accordance with Norwegian consumer protection law.]
            </p>
          </section>

          <section className="mb-8">
            <h2>Reporting Issues</h2>
            <p>
              We take safety seriously. Please report:
            </p>
            <ul>
              <li>Inappropriate content or behaviour via our reporting feature</li>
              <li>Inaccurate career information that could mislead users</li>
              <li>Unsafe job postings via our reporting feature</li>
              <li>Serious safety concerns to local authorities</li>
            </ul>
            <p>
              See our <Link href="/legal/safety" className="text-primary hover:underline">Safety & Community Guidelines</Link> for more information.
            </p>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Notes for Legal Review:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Review disclaimer in context of career guidance regulations</li>
              <li>Ensure compliance with Norwegian consumer protection law</li>
              <li>Review AI-generated content disclaimer requirements</li>
              <li>Consider GDPR implications for youth data handling</li>
              <li>Review liability for jobs marketplace separately from career tools</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
