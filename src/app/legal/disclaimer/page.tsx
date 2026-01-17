import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Health & Safety Disclaimer | Sprout",
  description: "Health and safety disclaimer for using the Sprout platform",
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
            <h1 className="text-3xl font-bold">Health & Safety Disclaimer</h1>
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
            <h2>Platform Role</h2>
            <p>
              Sprout is a platform that connects young people with job opportunities.
              We facilitate introductions between job seekers and job posters, but we
              do not supervise, manage, or control the work itself.
            </p>
            <p>
              Sprout is <strong>not an employer</strong>. We do not hire, employ, or
              contract workers. Any work arrangement is directly between the youth
              worker and the job poster.
            </p>
          </section>

          <section className="mb-8">
            <h2>User Responsibility</h2>
            <p>
              All users are responsible for:
            </p>
            <ul>
              <li>Assessing the safety and suitability of work arrangements</li>
              <li>Ensuring work complies with applicable laws and regulations</li>
              <li>Taking reasonable precautions for personal safety</li>
              <li>Communicating clearly about expectations and requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>For Youth Workers</h2>
            <p>
              Before accepting any job, consider:
            </p>
            <ul>
              <li>Whether the task is within your abilities and comfort level</li>
              <li>Whether the work environment appears safe</li>
              <li>Whether the job description matches what is being asked</li>
              <li>Whether you have informed a parent, guardian, or trusted adult</li>
            </ul>
            <p>
              You have the right to decline any work that makes you uncomfortable or
              that you believe is unsafe.
            </p>
          </section>

          <section className="mb-8">
            <h2>For Job Posters</h2>
            <p>
              Job posters are responsible for:
            </p>
            <ul>
              <li>Providing safe working conditions</li>
              <li>Complying with Norwegian labour laws for young workers</li>
              <li>Accurately describing job requirements and conditions</li>
              <li>Ensuring tasks are appropriate for the worker's age</li>
              <li>Having appropriate insurance where required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Limitation of Liability</h2>
            <p>
              Sprout does not supervise jobs or work performed through connections
              made on the platform. We are not liable for:
            </p>
            <ul>
              <li>Injuries, accidents, or harm occurring during work</li>
              <li>Quality of work performed or received</li>
              <li>Payment disputes between users</li>
              <li>Actions of users on or off the platform</li>
              <li>Loss of earnings, property, or other damages</li>
            </ul>
            <p>
              [PLACEHOLDER: Specific limitation of liability language to be drafted
              by legal counsel in accordance with Norwegian consumer protection law.]
            </p>
          </section>

          <section className="mb-8">
            <h2>Payments</h2>
            <p>
              Sprout does not handle payments between users. All payments are arranged
              and completed outside our platform. We are not responsible for:
            </p>
            <ul>
              <li>Non-payment or late payment</li>
              <li>Payment disputes</li>
              <li>Tax obligations arising from earnings</li>
            </ul>
            <p>
              Users should keep their own records of work completed and payments received.
            </p>
          </section>

          <section className="mb-8">
            <h2>Insurance</h2>
            <p>
              Sprout does not provide insurance coverage for users. We recommend:
            </p>
            <ul>
              <li>Youth workers check if their family's insurance provides any coverage</li>
              <li>Job posters ensure they have appropriate liability insurance</li>
              <li>Both parties clarify insurance arrangements before work begins</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Reporting Issues</h2>
            <p>
              While we cannot supervise work arrangements, we take safety seriously.
              Please report:
            </p>
            <ul>
              <li>Unsafe job postings via our reporting feature</li>
              <li>Inappropriate behaviour via our Safety Guidelines</li>
              <li>Serious safety concerns to local authorities</li>
            </ul>
            <p>
              See our <Link href="/legal/safety" className="text-primary hover:underline">Safety & Community Guidelines</Link> for more information.
            </p>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Important Notes for Implementation:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Have this disclaimer reviewed by legal counsel</li>
              <li>Ensure compliance with Norwegian consumer protection law</li>
              <li>Consider whether additional liability waivers are needed</li>
              <li>Review insurance requirements and recommendations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
