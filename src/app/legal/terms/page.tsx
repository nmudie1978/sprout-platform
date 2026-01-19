import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle } from "lucide-react";
import { PAYMENT_COPY } from "@/lib/copy/payments";

export const metadata = {
  title: "Terms of Service | Sprout",
  description: "Terms of Service for using the Sprout platform",
};

export default function TermsOfServicePage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: [DATE]</p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Placeholder - Replace with actual legal text
        </Badge>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>1. Agreement to Terms</h2>
            <p>
              [PLACEHOLDER: Insert your agreement to terms clause here. This should explain that by accessing or using Sprout, users agree to be bound by these Terms of Service.]
            </p>
          </section>

          <section className="mb-8">
            <h2>2. Description of Service</h2>
            <p>
              [PLACEHOLDER: Describe what Sprout is - a platform connecting youth workers with employers for micro-jobs and short-term work opportunities. Clarify that Sprout is a marketplace/platform and not an employer.]
            </p>
          </section>

          <section className="mb-8">
            <h2>3. User Eligibility</h2>
            <h3>3.1 Youth Users</h3>
            <p>
              [PLACEHOLDER: Define age requirements for youth users. In Norway, consider:
              - Minimum age for platform use (e.g., 13 or 16 with parental consent)
              - Age verification requirements
              - Parental consent requirements for users under 16
              - Work restrictions for different age groups under Norwegian law]
            </p>
            <h3>3.2 Employer Users</h3>
            <p>
              [PLACEHOLDER: Define requirements for employers including:
              - Minimum age (18+)
              - Age verification process
              - Responsibility for compliance with youth employment laws]
            </p>
          </section>

          <section className="mb-8">
            <h2>4. User Accounts</h2>
            <p>
              [PLACEHOLDER: Cover account creation, security responsibilities, accurate information requirements, and account termination conditions.]
            </p>
          </section>

          <section className="mb-8">
            <h2>5. User Conduct</h2>
            <h3>5.1 General Conduct</h3>
            <p>
              [PLACEHOLDER: Define acceptable use, prohibited activities, and consequences for violations. Include prohibitions on:
              - Harassment or discrimination
              - Fraudulent job postings
              - Misrepresentation of skills or experience
              - Unsafe or illegal work]
            </p>
            <h3>5.2 Job Postings</h3>
            <p>
              [PLACEHOLDER: Requirements for job postings including accuracy, legal compliance, appropriate pay rates, and safe working conditions.]
            </p>
          </section>

          <section className="mb-8">
            <h2>6. {PAYMENT_COPY.terms.title}</h2>
            <p>{PAYMENT_COPY.terms.body}</p>
            <p className="text-sm text-muted-foreground mt-4">
              {PAYMENT_COPY.terms.clarification}
            </p>
          </section>

          <section className="mb-8">
            <h2>7. Safety and Liability</h2>
            <p>
              [PLACEHOLDER: Important section covering:
              - User safety responsibilities
              - Background check disclaimers
              - Limitation of liability
              - Insurance requirements (if any)
              - Emergency procedures]
            </p>
          </section>

          <section className="mb-8">
            <h2>8. Intellectual Property</h2>
            <p>
              [PLACEHOLDER: Cover ownership of platform content, user-generated content rights, and trademark usage.]
            </p>
          </section>

          <section className="mb-8">
            <h2>9. Dispute Resolution</h2>
            <p>
              [PLACEHOLDER: Explain how disputes between users or with the platform will be handled. Consider:
              - Internal dispute resolution process
              - Mediation/arbitration clauses
              - Governing law (Norwegian law)
              - Jurisdiction]
            </p>
          </section>

          <section className="mb-8">
            <h2>10. Termination</h2>
            <p>
              [PLACEHOLDER: Explain when and how accounts can be terminated, either by the user or by Sprout.]
            </p>
          </section>

          <section className="mb-8">
            <h2>11. Changes to Terms</h2>
            <p>
              [PLACEHOLDER: Explain how users will be notified of changes to these terms and when changes take effect.]
            </p>
          </section>

          <section className="mb-8">
            <h2>12. Contact Information</h2>
            <p>
              [PLACEHOLDER: Provide contact information for legal inquiries:]
            </p>
            <ul>
              <li>Email: [legal@sprout.com]</li>
              <li>Address: [Your registered business address]</li>
            </ul>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Important Notes for Implementation:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Have these terms reviewed by a lawyer familiar with Norwegian law</li>
              <li>Ensure compliance with Norwegian youth employment regulations</li>
              <li>Consider GDPR requirements for data processing</li>
              <li>Update the "Last updated" date when making changes</li>
              <li>Keep a version history of terms changes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
