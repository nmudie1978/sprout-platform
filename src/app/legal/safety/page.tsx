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
            <p className="text-muted-foreground">Last updated: 23 March 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>Our Commitment to Safety</h2>
            <p>
              Endeavrly is designed with safety as a core principle. We connect young people with
              appropriate work opportunities and career development tools in a protected environment.
              These guidelines help ensure everyone has a positive and safe experience.
            </p>
          </section>

          <section className="mb-8">
            <h2>Appropriate Tasks Only</h2>
            <p>
              All jobs posted on Endeavrly must be appropriate for young workers. The following
              types of work are not permitted:
            </p>
            <ul>
              <li>Medical or healthcare tasks requiring professional qualifications</li>
              <li>Childcare for infants or very young children without supervision</li>
              <li>Work involving hazardous materials or dangerous equipment</li>
              <li>Tasks that require working alone in private residences with unfamiliar adults</li>
              <li>Work during prohibited hours for minors under Norwegian law</li>
              <li>Any task that could put a young person at physical or emotional risk</li>
            </ul>
            <p>
              Job postings that violate these rules will be removed. Repeat offenders will be
              permanently banned from the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>Communication Guidelines</h2>
            <p>
              All communication between users should remain professional and work-focused:
            </p>
            <ul>
              <li>Use the structured messaging features provided by the Platform</li>
              <li>Never pressure anyone to share personal contact information</li>
              <li>Do not request meetings outside of agreed work arrangements</li>
              <li>Do not send personal, inappropriate, or off-topic messages</li>
              <li>Report any communication that makes you uncomfortable</li>
            </ul>
            <p>
              Communication between minors and adults is restricted to structured message formats.
              Free-text messaging with minors is not permitted on the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>Meeting Safely</h2>
            <p>
              When meeting for work, use common sense and prioritise your safety:
            </p>
            <ul>
              <li>Tell a parent, guardian, or trusted adult where you will be and when you expect to return</li>
              <li>Meet in public places when possible for initial introductions</li>
              <li>Trust your instincts — if something feels wrong, leave</li>
              <li>Have your phone charged and a way to contact someone if you need help</li>
              <li>Do not go to a location you are unfamiliar with without telling someone</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Reporting and Blocking</h2>
            <p>
              If you encounter inappropriate behaviour, you can:
            </p>
            <ul>
              <li><strong>Report</strong> — flag a user, job posting, or message for review by our moderation team</li>
              <li><strong>Block</strong> — prevent a user from contacting you or viewing your profile</li>
            </ul>
            <p>
              All reports are reviewed by our team. We take safety concerns seriously and
              will take action where necessary, including suspending or removing users from the Platform.
              You will not be penalised for making a report in good faith.
            </p>
          </section>

          <section className="mb-8">
            <h2>Emergency Situations</h2>
            <p>
              If you are in immediate danger or witness a crime, contact emergency services first:
            </p>
            <ul>
              <li><strong>Police:</strong> 112</li>
              <li><strong>Ambulance:</strong> 113</li>
              <li><strong>Fire:</strong> 110</li>
            </ul>
            <p>
              Do not rely solely on platform reporting in an emergency. After ensuring your safety,
              you may also report the incident to Endeavrly so we can take appropriate action on the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>For Parents and Guardians</h2>
            <p>
              We encourage open communication between young people and their parents or guardians
              about their activities on Endeavrly. You can:
            </p>
            <ul>
              <li>Review the types of jobs your young person is interested in</li>
              <li>Discuss safety practices before they accept work</li>
              <li>Be available as a point of contact during jobs</li>
              <li>Contact us at any time with questions or concerns about your child&apos;s safety</li>
              <li>Revoke guardian consent at any time, which will restrict your child&apos;s ability to apply for jobs</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>How Does Payment Work?</h2>
            <p>
              Endeavrly does not process payments or hold money. Workers and employers agree
              payment terms directly with each other.
            </p>
            <ul>
              <li>Discuss and agree on payment before starting any work</li>
              <li>Make sure you understand how and when you will be paid</li>
              <li>Cash payment at the end of a job is common for small jobs</li>
              <li>Keep records of completed work and payments received</li>
            </ul>
            <p className="text-muted-foreground">
              This approach allows Endeavrly to stay focused on safety, trust, and connecting
              young people with local opportunities.
            </p>
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
              <li><Link href="/legal/disclaimer" className="text-primary hover:underline">Health & Safety Disclaimer</Link></li>
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
