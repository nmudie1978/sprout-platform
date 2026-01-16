import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Sprout",
  description: "Privacy Policy for the Sprout platform",
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
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
            <h2>1. Introduction</h2>
            <p>
              [PLACEHOLDER: Introduce your privacy policy. Explain that this policy describes how Sprout collects, uses, and shares personal information. Reference GDPR compliance and Norwegian data protection law (Personopplysningsloven).]
            </p>
          </section>

          <section className="mb-8">
            <h2>2. Data Controller</h2>
            <p>
              [PLACEHOLDER: Identify who is responsible for data processing:]
            </p>
            <ul>
              <li>Company name: [Your company name]</li>
              <li>Organization number: [Norwegian org number]</li>
              <li>Address: [Your registered address]</li>
              <li>Email: [privacy@sprout.com]</li>
              <li>Data Protection Officer (if applicable): [Contact details]</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>3. Information We Collect</h2>
            <h3>3.1 Information You Provide</h3>
            <p>
              [PLACEHOLDER: List all data collected directly from users:]
            </p>
            <ul>
              <li>Account information (email, password)</li>
              <li>Profile information (name, age bracket, skills, profile photo)</li>
              <li>Job application data</li>
              <li>Messages and communications</li>
              <li>Payment information (if applicable)</li>
            </ul>

            <h3>3.2 Information Collected Automatically</h3>
            <p>
              [PLACEHOLDER: List automatically collected data:]
            </p>
            <ul>
              <li>Device information</li>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Usage data and analytics</li>
              <li>Cookies (reference Cookie Policy)</li>
            </ul>

            <h3>3.3 Special Categories of Data</h3>
            <p>
              [PLACEHOLDER: Address any sensitive data. Note: Age data for minors requires special consideration under GDPR Article 8.]
            </p>
          </section>

          <section className="mb-8">
            <h2>4. How We Use Your Information</h2>
            <p>
              [PLACEHOLDER: Explain all purposes for data processing:]
            </p>
            <ul>
              <li>Providing and maintaining the platform</li>
              <li>Matching youth with job opportunities</li>
              <li>Communicating with users</li>
              <li>Processing applications and payments</li>
              <li>Improving our services</li>
              <li>Ensuring safety and security</li>
              <li>Compliance with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>5. Legal Basis for Processing</h2>
            <p>
              [PLACEHOLDER: Under GDPR, explain the legal basis for each type of processing:]
            </p>
            <ul>
              <li><strong>Contract:</strong> Processing necessary to provide our services</li>
              <li><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing)</li>
              <li><strong>Legitimate Interests:</strong> For improving and securing our services</li>
              <li><strong>Legal Obligation:</strong> Where required by law</li>
            </ul>
            <p>
              [PLACEHOLDER: Note special rules for processing data of minors under 16 - requires parental consent under GDPR Article 8.]
            </p>
          </section>

          <section className="mb-8">
            <h2>6. Data Sharing and Disclosure</h2>
            <h3>6.1 Sharing Between Users</h3>
            <p>
              [PLACEHOLDER: Explain what information is shared between youth and employers when they connect through the platform.]
            </p>

            <h3>6.2 Third-Party Service Providers</h3>
            <p>
              [PLACEHOLDER: List categories of third-party processors:]
            </p>
            <ul>
              <li>Hosting providers (e.g., Vercel, Supabase)</li>
              <li>Authentication services</li>
              <li>Payment processors (if applicable)</li>
              <li>Analytics providers</li>
              <li>Email service providers</li>
            </ul>

            <h3>6.3 Legal Requirements</h3>
            <p>
              [PLACEHOLDER: Explain when data may be disclosed to authorities.]
            </p>
          </section>

          <section className="mb-8">
            <h2>7. International Data Transfers</h2>
            <p>
              [PLACEHOLDER: If using services outside the EEA (e.g., US-based services), explain the safeguards in place such as Standard Contractual Clauses or EU-US Data Privacy Framework.]
            </p>
          </section>

          <section className="mb-8">
            <h2>8. Data Retention</h2>
            <p>
              [PLACEHOLDER: Explain how long different types of data are kept:]
            </p>
            <ul>
              <li>Active account data: Duration of account</li>
              <li>Deleted accounts: [X days/months]</li>
              <li>Job posting history: [X months/years]</li>
              <li>Application data: [X months/years]</li>
              <li>Legal/compliance records: As required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>9. Your Rights</h2>
            <p>
              [PLACEHOLDER: Under GDPR, users have the following rights:]
            </p>
            <ul>
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to certain processing</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p>
              [PLACEHOLDER: Explain how users can exercise these rights (email, in-app settings, etc.)]
            </p>
          </section>

          <section className="mb-8">
            <h2>10. Children&apos;s Privacy</h2>
            <p>
              [PLACEHOLDER: Important section for a youth platform. Address:]
            </p>
            <ul>
              <li>Minimum age requirements</li>
              <li>Parental consent requirements for users under 16</li>
              <li>Additional protections for minor users</li>
              <li>How parents/guardians can manage their child&apos;s data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>11. Data Security</h2>
            <p>
              [PLACEHOLDER: Describe security measures in place:]
            </p>
            <ul>
              <li>Encryption (in transit and at rest)</li>
              <li>Access controls</li>
              <li>Regular security assessments</li>
              <li>Employee training</li>
              <li>Incident response procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>12. Changes to This Policy</h2>
            <p>
              [PLACEHOLDER: Explain how users will be notified of privacy policy changes and when changes take effect.]
            </p>
          </section>

          <section className="mb-8">
            <h2>13. Complaints</h2>
            <p>
              [PLACEHOLDER: Explain how to lodge complaints:]
            </p>
            <ul>
              <li>Contact us first at: [privacy@sprout.com]</li>
              <li>Norwegian Data Protection Authority (Datatilsynet): datatilsynet.no</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>14. Contact Us</h2>
            <p>
              [PLACEHOLDER: Provide contact information for privacy inquiries:]
            </p>
            <ul>
              <li>Email: [privacy@sprout.com]</li>
              <li>Address: [Your registered business address]</li>
            </ul>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Important Notes for Implementation:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Have this policy reviewed by a GDPR/data protection specialist</li>
              <li>Ensure compliance with Norwegian Data Protection Authority guidelines</li>
              <li>Special attention needed for processing data of minors (under 16)</li>
              <li>Document all data processing activities in a Record of Processing Activities (ROPA)</li>
              <li>Consider appointing a Data Protection Officer if required</li>
              <li>Keep this policy updated as your data practices change</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
