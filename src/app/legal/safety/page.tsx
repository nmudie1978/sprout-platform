import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Safety & Community Guidelines | Sprout",
  description: "Safety and community guidelines for using the Sprout platform",
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
            <h2>Our Commitment to Safety</h2>
            <p>
              Sprout is designed with safety as a core principle. We connect young people with
              appropriate work opportunities in a protected environment. These guidelines help
              ensure everyone has a positive and safe experience.
            </p>
          </section>

          <section className="mb-8">
            <h2>Appropriate Tasks Only</h2>
            <p>
              All jobs posted on Sprout must be appropriate for young workers. The following
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
          </section>

          <section className="mb-8">
            <h2>Communication Guidelines</h2>
            <p>
              All communication should remain professional and work-focused:
            </p>
            <ul>
              <li>Keep conversations on the Sprout platform when possible</li>
              <li>Never pressure anyone to share personal contact information</li>
              <li>Do not request meetings outside of agreed work arrangements</li>
              <li>Report any communication that makes you uncomfortable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Meeting Safely</h2>
            <p>
              When meeting for work, use common sense and prioritise your safety:
            </p>
            <ul>
              <li>Tell a parent, guardian, or trusted adult where you will be</li>
              <li>Meet in public places when possible for initial introductions</li>
              <li>Trust your instincts — if something feels wrong, leave</li>
              <li>Have a way to contact someone if you need help</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Reporting and Blocking</h2>
            <p>
              If you encounter inappropriate behaviour, you can:
            </p>
            <ul>
              <li><strong>Report</strong> — Flag a user, job posting, or message for review</li>
              <li><strong>Block</strong> — Prevent a user from contacting you</li>
            </ul>
            <p>
              All reports are reviewed by our team. We take safety concerns seriously and
              will take action where necessary, including removing users from the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>Emergency Situations</h2>
            <p>
              If you are in immediate danger or witness a crime:
            </p>
            <ul>
              <li><strong>Norway Emergency Services:</strong> 112 (Police), 113 (Ambulance), 110 (Fire)</li>
              <li>Contact local authorities first — do not rely solely on platform reporting</li>
              <li>After ensuring your safety, you may also report to Sprout</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>For Parents and Guardians</h2>
            <p>
              We encourage open communication between young people and their parents or guardians
              about their activities on Sprout. You can:
            </p>
            <ul>
              <li>Review the types of jobs your young person is interested in</li>
              <li>Discuss safety practices before they accept work</li>
              <li>Be available as a point of contact during jobs</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>How Does Payment Work?</h2>
            <p>
              Sprout does not process payments or hold money. Workers and employers agree
              payment terms directly with each other.
            </p>
            <ul>
              <li>Discuss and agree on payment before starting any work</li>
              <li>Make sure you understand how and when you will be paid</li>
              <li>Cash payment at the end of a job is common for small jobs</li>
              <li>Keep records of completed work if requested</li>
            </ul>
            <p className="text-muted-foreground">
              This approach allows Sprout to stay focused on safety, trust, and connecting
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
              For safety concerns or questions about these guidelines, contact us at:
              [safety@sprout.no]
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
