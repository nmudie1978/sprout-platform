import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Endeavrly",
  description: "Privacy Policy for the Endeavrly platform",
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
            <p className="text-muted-foreground">Last updated: 23 March 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy explains how Endeavrly AS (&quot;Endeavrly&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses, stores, and shares your personal data when you use our platform. We are committed to protecting your privacy, particularly because many of our users are young people.
            </p>
            <p>
              This policy is written in accordance with the EU General Data Protection Regulation (GDPR) and the Norwegian Personal Data Act (<em>Personopplysningsloven</em>).
            </p>
          </section>

          <section className="mb-8">
            <h2>2. Data Controller</h2>
            <p>The data controller responsible for your personal data is:</p>
            <ul>
              <li>Endeavrly AS</li>
              <li>Oslo, Norway</li>
              <li>Email: <a href="mailto:privacy@endeavrly.no" className="text-primary hover:underline">privacy@endeavrly.no</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>3. Information We Collect</h2>

            <h3>3.1 Information You Provide</h3>
            <ul>
              <li><strong>Account information:</strong> email address and authentication credentials</li>
              <li><strong>Profile information:</strong> name, date of birth, skills, interests, career goals, and optional profile photo</li>
              <li><strong>Journey data:</strong> your reflections, strengths, career explorations, and learning progress</li>
              <li><strong>Job-related data:</strong> job applications, structured messages, and feedback</li>
              <li><strong>Guardian information:</strong> where a user is under 18, we collect limited parent or guardian contact details for consent purposes</li>
            </ul>

            <h3>3.2 Information Collected Automatically</h3>
            <ul>
              <li>Device type, browser type, and operating system</li>
              <li>IP address (truncated or anonymised where possible)</li>
              <li>Pages visited and features used</li>
              <li>Session duration and interaction patterns</li>
            </ul>

            <h3>3.3 Information We Do Not Collect</h3>
            <p>We do not collect or process:</p>
            <ul>
              <li>Financial or payment information (we do not process payments)</li>
              <li>Biometric data</li>
              <li>Data relating to political opinions, religious beliefs, trade union membership, or sexual orientation</li>
              <li>Behavioural profiling for advertising purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>4. How We Use Your Information</h2>
            <p>We use your personal data to:</p>
            <ul>
              <li>Provide and operate the Platform, including account management and authentication</li>
              <li>Enable the My Journey feature, including career exploration and skill development tracking</li>
              <li>Facilitate connections between youth workers and job posters through structured messaging</li>
              <li>Verify user age and, where required, guardian consent</li>
              <li>Moderate content and enforce our Safety Guidelines</li>
              <li>Respond to reports and safeguarding concerns</li>
              <li>Send essential service communications (e.g., account verification, safety alerts)</li>
              <li>Improve and maintain the Platform through aggregated, anonymised usage analytics</li>
            </ul>
            <p>
              We do not use your data for targeted advertising, behavioural profiling, or sale to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2>5. Legal Basis for Processing</h2>
            <p>Under GDPR, we process your personal data on the following legal bases:</p>
            <ul>
              <li><strong>Performance of contract (Art. 6(1)(b)):</strong> processing necessary to provide the Platform and its features to you</li>
              <li><strong>Consent (Art. 6(1)(a)):</strong> where you have given explicit consent, such as for optional analytics cookies or marketing communications. You may withdraw consent at any time.</li>
              <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> for platform security, fraud prevention, and service improvement, where these interests are not overridden by your rights</li>
              <li><strong>Legal obligation (Art. 6(1)(c)):</strong> where we are required to process data to comply with applicable law</li>
            </ul>

            <h3>5.1 Processing Data of Minors</h3>
            <p>
              For users under 16 years of age, we obtain verifiable parental or guardian consent before processing personal data, in accordance with GDPR Article 8 and Norwegian law. Users aged 16 and over may consent independently to data processing in the context of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2>6. Data Sharing and Disclosure</h2>

            <h3>6.1 Between Users</h3>
            <p>
              When you apply for a job or interact with another user, limited profile information (such as your first name, age bracket, and relevant skills) may be visible to that user. Full contact details are not shared unless you choose to provide them.
            </p>

            <h3>6.2 Service Providers (Data Processors)</h3>
            <p>We share data with a limited number of trusted service providers who help us operate the Platform. Each is bound by a data processing agreement (DPA) and processes data only on our instructions:</p>
            <ul>
              <li><strong>Hosting:</strong> Vercel Inc. — application hosting, EU/US regions. DPA in force; EU Standard Contractual Clauses apply to any US transfer.</li>
              <li><strong>Database:</strong> Supabase Inc. — PostgreSQL database hosting, EU region (Frankfurt). DPA in force.</li>
              <li><strong>Transactional email:</strong> Resend (Resend Inc.) — used for account verification, guardian-consent emails, and safety notifications. No marketing email.</li>
              <li><strong>Error monitoring:</strong> Sentry (Functional Software Inc.) — captures anonymised error traces. Personal data is scrubbed at source.</li>
              <li><strong>Product analytics:</strong> Vercel Analytics and Speed Insights — collects anonymised page views, device type and performance metrics. No cookies, no cross-site tracking, no behavioural profiling, and no personal data.</li>
              <li><strong>Authentication:</strong> NextAuth.js — open-source, self-hosted; sessions are stored in our own database, not a third party.</li>
              <li><strong>AI content generation (optional features):</strong> OpenAI — used only to generate personalised career roadmaps and narration when you request them. Prompts exclude direct identifiers (name, email).</li>
            </ul>
            <p>
              We do not use advertising, retargeting, social-media pixels, or behavioural-profiling processors.
            </p>

            <h3>6.3 Legal Requirements</h3>
            <p>
              We may disclose personal data where required by law, court order, or regulatory authority, or where necessary to protect the safety of a user, particularly a minor.
            </p>
          </section>

          <section className="mb-8">
            <h2>7. International Data Transfers</h2>
            <p>
              We store data primarily within the European Economic Area (EEA). Where data is processed by service providers outside the EEA (for example, infrastructure services with US-based components), we ensure adequate safeguards are in place, including EU Standard Contractual Clauses or an adequacy decision by the European Commission.
            </p>
          </section>

          <section className="mb-8">
            <h2>8. Data Retention</h2>
            <p>We retain personal data only for as long as necessary for the purposes described in this policy:</p>
            <ul>
              <li><strong>Active accounts:</strong> data is retained for the duration of your account</li>
              <li><strong>Deleted accounts:</strong> personal data is erased within 30 days of account deletion, except where retention is required by law</li>
              <li><strong>Job applications:</strong> retained for 12 months after the related job has closed</li>
              <li><strong>Reports and safeguarding records:</strong> retained for up to 3 years, or longer where required for legal proceedings</li>
              <li><strong>Anonymised analytics data:</strong> may be retained indefinitely as it cannot identify individuals</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>9. Your Rights</h2>
            <p>Under GDPR, you have the following rights in relation to your personal data:</p>
            <ul>
              <li><strong>Right of access:</strong> request a copy of the personal data we hold about you</li>
              <li><strong>Right to rectification:</strong> request correction of inaccurate or incomplete data</li>
              <li><strong>Right to erasure:</strong> request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Right to restrict processing:</strong> request that we limit how we use your data</li>
              <li><strong>Right to data portability:</strong> receive your data in a structured, machine-readable format</li>
              <li><strong>Right to object:</strong> object to processing based on legitimate interests</li>
              <li><strong>Right to withdraw consent:</strong> withdraw consent at any time, without affecting the lawfulness of processing before withdrawal</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <a href="mailto:privacy@endeavrly.no" className="text-primary hover:underline">privacy@endeavrly.no</a>. We will respond within 30 days. You may also delete your account and associated data through your profile settings.
            </p>
            <p>
              If you are under 18, your parent or guardian may exercise these rights on your behalf.
            </p>
          </section>

          <section className="mb-8">
            <h2>10. Children&apos;s Privacy</h2>
            <p>
              Endeavrly is designed for users aged 15 and above. We take the privacy of young users seriously and implement the following protections:
            </p>
            <ul>
              <li>We collect only the minimum data necessary for the Platform to function</li>
              <li>We do not serve targeted advertising or engage in behavioural profiling</li>
              <li>We require parental or guardian consent for users under 16</li>
              <li>Personal contact information is not publicly displayed</li>
              <li>Communication between minors and adults is restricted to structured messaging formats</li>
              <li>Parents or guardians may request access to, correction of, or deletion of their child&apos;s data at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>11. Data Security</h2>
            <p>We implement appropriate technical and organisational measures to protect your data, including:</p>
            <ul>
              <li>Encryption of data in transit (TLS/HTTPS) and at rest</li>
              <li>Role-based access controls limiting who can access personal data</li>
              <li>Regular security reviews and monitoring</li>
              <li>Secure authentication with magic link or verified login methods</li>
              <li>Row-level security policies in our database</li>
            </ul>
            <p>
              No system can guarantee absolute security. If we become aware of a data breach that is likely to result in a risk to your rights, we will notify you and the Norwegian Data Protection Authority (Datatilsynet) within 72 hours.
            </p>
          </section>

          <section className="mb-8">
            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or through a notice on the Platform. The updated policy will indicate the new effective date at the top of this page.
            </p>
          </section>

          <section className="mb-8">
            <h2>13. Complaints</h2>
            <p>
              If you believe we have not handled your personal data in accordance with applicable law, you have the right to lodge a complaint with:
            </p>
            <ul>
              <li>Us first, at <a href="mailto:privacy@endeavrly.no" className="text-primary hover:underline">privacy@endeavrly.no</a></li>
              <li>The Norwegian Data Protection Authority (Datatilsynet): <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">datatilsynet.no</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>14. Contact Us</h2>
            <p>For any questions about this Privacy Policy or our data practices, contact us at:</p>
            <ul>
              <li>Email: <a href="mailto:privacy@endeavrly.no" className="text-primary hover:underline">privacy@endeavrly.no</a></li>
              <li>Post: Endeavrly AS, Oslo, Norway</li>
            </ul>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="text-muted-foreground">
              This Privacy Policy should be reviewed by a qualified data protection professional before being relied upon. It is provided as a working draft and does not constitute legal advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
