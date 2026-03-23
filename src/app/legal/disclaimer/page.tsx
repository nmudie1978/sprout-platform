import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Health & Safety Disclaimer | Endeavrly",
  description: "Health and safety disclaimer for using the Endeavrly platform",
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
            <p className="text-muted-foreground">Last updated: 23 March 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>Platform Role</h2>
            <p>
              Endeavrly is a platform that connects young people with career development opportunities
              and local work. We facilitate introductions between job seekers and job posters, but we
              do not supervise, manage, or control the work itself.
            </p>
            <p>
              Endeavrly is <strong>not an employer</strong>. We do not hire, employ, or
              contract workers. Any work arrangement is directly between the youth
              worker and the job poster. Endeavrly is not a party to any employment or service agreement between users.
            </p>
          </section>

          <section className="mb-8">
            <h2>User Responsibility</h2>
            <p>
              All users are responsible for:
            </p>
            <ul>
              <li>Assessing the safety and suitability of any work arrangement before it begins</li>
              <li>Ensuring any work complies with applicable Norwegian laws and regulations</li>
              <li>Taking reasonable precautions for personal safety</li>
              <li>Communicating clearly about expectations, requirements, and working conditions</li>
              <li>Reporting any concerns to Endeavrly and, where appropriate, to local authorities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>For Youth Workers</h2>
            <p>
              Before accepting any job, consider:
            </p>
            <ul>
              <li>Whether the task is within your abilities and comfort level</li>
              <li>Whether the work environment appears safe and appropriate</li>
              <li>Whether the job description matches what is actually being asked of you</li>
              <li>Whether you have informed a parent, guardian, or trusted adult about the arrangement</li>
            </ul>
            <p>
              You have the right to decline any work that makes you uncomfortable or
              that you believe is unsafe. You will not be penalised on the Platform for declining work.
            </p>
          </section>

          <section className="mb-8">
            <h2>For Job Posters</h2>
            <p>
              Job posters are responsible for:
            </p>
            <ul>
              <li>Providing safe and appropriate working conditions</li>
              <li>Complying with the Norwegian Working Environment Act (<em>Arbeidsmiljøloven</em>) and related regulations for young workers</li>
              <li>Accurately describing job requirements, conditions, and compensation</li>
              <li>Ensuring tasks are appropriate for the worker&apos;s age group</li>
              <li>Having appropriate liability insurance where required by law</li>
              <li>Not asking young workers to perform tasks beyond what was agreed in the job posting</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Limitation of Liability</h2>
            <p>
              Endeavrly does not supervise jobs or work performed through connections
              made on the Platform. To the fullest extent permitted by Norwegian law, we are not liable for:
            </p>
            <ul>
              <li>Injuries, accidents, or harm occurring during work</li>
              <li>The quality of work performed or received</li>
              <li>Payment disputes between users</li>
              <li>Actions or omissions of users on or off the Platform</li>
              <li>Loss of earnings, property, or other direct or indirect damages</li>
            </ul>
            <p>
              Nothing in this disclaimer limits liability for death or personal injury caused by negligence,
              fraud, or any other liability that cannot be excluded or limited under Norwegian law.
            </p>
          </section>

          <section className="mb-8">
            <h2>Payments</h2>
            <p>
              Endeavrly does not process, hold, or transfer payments between users. All payments are arranged
              and completed directly between the job poster and the youth worker, outside our Platform. We are not responsible for:
            </p>
            <ul>
              <li>Non-payment or late payment for completed work</li>
              <li>Payment disputes between users</li>
              <li>Tax obligations arising from earnings</li>
            </ul>
            <p>
              Users should keep their own records of work completed and payments received.
              For amounts above applicable thresholds, users may have tax reporting obligations
              under Norwegian law.
            </p>
          </section>

          <section className="mb-8">
            <h2>Insurance</h2>
            <p>
              Endeavrly does not provide insurance coverage for users. We recommend:
            </p>
            <ul>
              <li>Youth workers check whether their family&apos;s home insurance provides any relevant coverage</li>
              <li>Job posters ensure they have appropriate liability insurance for the work being performed</li>
              <li>Both parties clarify insurance arrangements before work begins</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Reporting Issues</h2>
            <p>
              While we do not supervise work arrangements, we take safety seriously.
              Please report:
            </p>
            <ul>
              <li>Unsafe or inappropriate job postings using the in-app reporting feature</li>
              <li>Inappropriate behaviour via our reporting and blocking tools</li>
              <li>Serious safety concerns to local authorities (Police: 112, Ambulance: 113, Fire: 110)</li>
            </ul>
            <p>
              See our <Link href="/legal/safety" className="text-primary hover:underline">Safety & Community Guidelines</Link> for more information on reporting and staying safe.
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
