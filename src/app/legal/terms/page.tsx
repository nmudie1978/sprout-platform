import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
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
            <p className="text-muted-foreground">Last updated: 23 March 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the Endeavrly platform (&quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you are under 18 years of age, your parent or legal guardian must also agree to these Terms on your behalf before you may use the Platform.
            </p>
            <p>
              If you do not agree to these Terms, you must not access or use the Platform. We recommend that you read these Terms carefully before creating an account.
            </p>
          </section>

          <section className="mb-8">
            <h2>2. Description of Service</h2>
            <p>
              Endeavrly is a career development and community jobs platform designed for young people aged 15 to 23 in Norway. The Platform helps youth explore career paths, develop skills, build responsibility, and connect with appropriate local work opportunities.
            </p>
            <p>
              Endeavrly operates as a <strong>connection platform</strong>. We are not an employer, staffing agency, or work broker. We do not supervise, direct, or control any work performed through connections made on the Platform. Any arrangement between a youth worker and a job poster is solely between those parties.
            </p>
          </section>

          <section className="mb-8">
            <h2>3. User Eligibility</h2>
            <h3>3.1 Youth Users (Job Seekers)</h3>
            <p>To register as a youth user, you must:</p>
            <ul>
              <li>Be between 15 and 23 years old</li>
              <li>Be legally permitted to reside and, where applicable, work in Norway</li>
              <li>Provide truthful and accurate information about your age during registration</li>
              <li>If under 18, obtain verifiable consent from a parent or legal guardian</li>
            </ul>

            <h3>3.2 Adult Users (Job Posters)</h3>
            <p>To register as a job poster, you must:</p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Complete identity verification as required by the Platform</li>
              <li>Comply with all applicable Norwegian labour laws relating to the employment of young workers, including the Working Environment Act (<em>Arbeidsmiljøloven</em>)</li>
            </ul>
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
            <h3>5.1 General Conduct</h3>
            <p>All users agree not to:</p>
            <ul>
              <li>Harass, bully, discriminate against, or threaten any other user</li>
              <li>Post false, misleading, or fraudulent information</li>
              <li>Misrepresent your identity, age, skills, or experience</li>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Attempt to contact minors outside the structured messaging features provided by the Platform</li>
              <li>Collect, store, or share personal information of other users without their consent</li>
              <li>Interfere with the operation or security of the Platform</li>
            </ul>

            <h3>5.2 Job Postings</h3>
            <p>Job posters must ensure that all listings:</p>
            <ul>
              <li>Accurately describe the work, location, expected duration, and compensation</li>
              <li>Comply with Norwegian labour law, including restrictions on working hours and conditions for minors</li>
              <li>Do not involve hazardous materials, dangerous equipment, or environments unsuitable for young workers</li>
              <li>Do not require work during prohibited hours for minors under Norwegian law</li>
              <li>Offer fair compensation for the work described</li>
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
              Endeavrly is committed to the safety of all users, particularly young people. We implement structured messaging, moderation, and reporting features to reduce risk. However, the Platform cannot guarantee the behaviour of individual users.
            </p>
            <p>You acknowledge that:</p>
            <ul>
              <li>You are responsible for assessing the safety and suitability of any work arrangement</li>
              <li>Endeavrly does not conduct background checks on users unless otherwise stated</li>
              <li>You should report any concerns using the in-app reporting tools or by contacting us directly</li>
              <li>In an emergency, you should contact local emergency services (112, 113, or 110 in Norway) before contacting Endeavrly</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by Norwegian law, Endeavrly shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Platform.
            </p>
            <p>
              Endeavrly does not supervise work arrangements and is not liable for injuries, property damage, payment disputes, or any loss arising from interactions between users. Our total liability for any claim shall not exceed the amount you have paid to Endeavrly in the twelve months preceding the claim, or NOK 1,000, whichever is greater.
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
              Content you submit to the Platform (such as profile information or job postings) remains yours, but you grant Endeavrly a non-exclusive, worldwide, royalty-free licence to use, display, and distribute that content in connection with operating the Platform.
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
