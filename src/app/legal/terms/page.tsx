import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";
import { PAYMENT_COPY } from "@/lib/copy/payments";

export const metadata = {
  title: "Terms of Service | Endeavrly",
  description: "Terms of Service for using the Endeavrly platform",
};

export default function TermsOfServicePage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500/20 to-pink-500/20 border border-teal-500/20">
            <FileText className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: 1 June 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the Endeavrly platform (&quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
            </p>
            <p>
              If you do not agree to these Terms, you must not access or use the Platform. We recommend that you read these Terms carefully before creating an account.
            </p>
          </section>

          <section className="mb-8">
            <h2>2. Description of Service</h2>
            <p>
              Endeavrly is a career-exploration platform for people aged 15 and older (built with young people starting out in mind). The Platform helps you explore careers, understand realistic education pathways, reflect on your direction, and build clarity about your future.
            </p>
            <p>
              Endeavrly is <strong>not</strong> a jobs marketplace, recruiter, employer, or staffing agency. It does not connect you with paid work and does not process payments. The career information it provides is general guidance, not professional careers advice (see our <Link href="/legal/disclaimer" className="text-primary hover:underline">Disclaimer</Link>).
            </p>
          </section>

          <section className="mb-8">
            <h2>3. User Eligibility</h2>
            <p>To register on Endeavrly, you must:</p>
            <ul>
              <li>Be between 15 and 30 years old</li>
              <li>Provide a truthful and accurate date of birth during registration</li>
            </ul>
            <p>
              See our <Link href="/legal/eligibility" className="text-primary hover:underline">Age &amp; Eligibility</Link> page for details. (Recognised schools may be offered separate teacher access.)
            </p>
          </section>

          <section className="mb-8">
            <h2>4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Keep your login credentials secure and not share them with others</li>
              <li>Notify us immediately if you become aware of any unauthorised use of your account</li>
              <li>Not create more than one account per person</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that contain inaccurate information or that violate these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2>5. User Conduct</h2>
            <p>All users agree not to:</p>
            <ul>
              <li>Harass, bully, discriminate against, or threaten any other user</li>
              <li>Post false, misleading, or fraudulent information</li>
              <li>Misrepresent your identity or age</li>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Collect, store, or share personal information of other users without their consent</li>
              <li>Interfere with the operation or security of the Platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>6. {PAYMENT_COPY.terms.title}</h2>
            <p>{PAYMENT_COPY.terms.body}</p>
            <p className="text-sm text-muted-foreground mt-4">
              {PAYMENT_COPY.terms.clarification}
            </p>
          </section>

          <section className="mb-8">
            <h2>7. Safety</h2>
            <p>
              Endeavrly is committed to the safety of all users, particularly young people. We use a safety-by-design approach with moderation and reporting features and no open social or contact-sharing mechanics. However, the Platform cannot guarantee the behaviour of individual users.
            </p>
            <p>You acknowledge that:</p>
            <ul>
              <li>You should report any inappropriate content or behaviour using the in-app reporting tools or by contacting us directly</li>
              <li>In an emergency, you should contact local emergency services (112, 113, or 110 in Norway) before contacting Endeavrly</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by Norwegian law, Endeavrly shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Platform.
            </p>
            <p>
              The career information and AI-generated content on the Platform are general guidance and may be approximate or out of date; Endeavrly is not liable for decisions made in reliance on it. Because the Platform is free to use, our total liability for any claim shall not exceed NOK 1,000.
            </p>
            <p>
              Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded under Norwegian law.
            </p>
          </section>

          <section className="mb-8">
            <h2>9. Intellectual Property</h2>
            <p>
              The Platform, including its design, text, graphics, logos, and software, is owned by Endeavrly and protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of the Platform without our prior written consent.
            </p>
            <p>
              Content you submit to the Platform (such as profile information or your reflections) remains yours, but you grant Endeavrly a non-exclusive, worldwide, royalty-free licence to use, display, and distribute that content in connection with operating the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>10. Dispute Resolution</h2>
            <p>
              If a dispute arises between you and another user, we encourage you to first attempt to resolve it directly. You may use the in-app reporting tools to notify us of issues.
            </p>
            <p>
              Any dispute arising out of or in connection with these Terms shall be governed by Norwegian law and subject to the exclusive jurisdiction of the courts of Oslo, Norway. If you are a consumer, you retain any rights to bring proceedings in your local jurisdiction as provided by applicable law.
            </p>
            <p>
              You may also submit complaints to the Norwegian Consumer Council (<em>Forbrukerrådet</em>) or through the European Commission&apos;s Online Dispute Resolution platform.
            </p>
          </section>

          <section className="mb-8">
            <h2>11. Termination</h2>
            <p>
              You may close your account at any time through your profile settings or by contacting us. Upon closure, your personal data will be handled in accordance with our Privacy Policy.
            </p>
            <p>
              We may suspend or terminate your account if we reasonably believe that you have violated these Terms, posed a safety risk to other users, or engaged in unlawful activity. We will provide notice of termination where practicable, except where immediate action is necessary to protect user safety.
            </p>
          </section>

          <section className="mb-8">
            <h2>12. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. When we make material changes, we will notify you by email or through a notice on the Platform at least 30 days before the changes take effect. Your continued use of the Platform after the effective date constitutes acceptance of the updated Terms.
            </p>
            <p>
              If you do not agree with the updated Terms, you must stop using the Platform and close your account.
            </p>
          </section>

          <section className="mb-8">
            <h2>13. Contact Information</h2>
            <p>
              For questions about these Terms, contact us at:
            </p>
            <ul>
              <li>Email: <a href="mailto:legal@endeavrly.no" className="text-primary hover:underline">legal@endeavrly.no</a></li>
              <li>Post: Endeavrly AS, Oslo, Norway</li>
            </ul>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="text-muted-foreground">
              These Terms of Service should be reviewed by qualified legal counsel before being relied upon. They are provided as a working draft and do not constitute legal advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
