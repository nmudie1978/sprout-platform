import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cookie, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | Sprout",
  description: "Cookie Policy for the Sprout platform",
};

export default function CookiePolicyPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20">
            <Cookie className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
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
            <h2>1. What Are Cookies?</h2>
            <p>
              [PLACEHOLDER: Explain what cookies are - small text files stored on a user&apos;s device when they visit a website. Mention that similar technologies (local storage, session storage, pixels) may also be used.]
            </p>
          </section>

          <section className="mb-8">
            <h2>2. How We Use Cookies</h2>
            <p>
              [PLACEHOLDER: Explain the general purposes for using cookies on Sprout, such as:]
            </p>
            <ul>
              <li>Keeping you signed in</li>
              <li>Remembering your preferences</li>
              <li>Understanding how you use the platform</li>
              <li>Improving our services</li>
              <li>Ensuring security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>3. Types of Cookies We Use</h2>

            <h3>3.1 Strictly Necessary Cookies</h3>
            <p>
              [PLACEHOLDER: These cookies are essential for the website to function. They cannot be disabled. Examples:]
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>[session_token]</td>
                    <td>Authentication and session management</td>
                    <td>[Session/X days]</td>
                  </tr>
                  <tr>
                    <td>[csrf_token]</td>
                    <td>Security - prevents cross-site request forgery</td>
                    <td>[Session]</td>
                  </tr>
                  <tr>
                    <td>[cookie_consent]</td>
                    <td>Stores your cookie preferences</td>
                    <td>[1 year]</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3.2 Functional Cookies</h3>
            <p>
              [PLACEHOLDER: These cookies enable enhanced functionality and personalization. Examples:]
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>[theme]</td>
                    <td>Remembers dark/light mode preference</td>
                    <td>[1 year]</td>
                  </tr>
                  <tr>
                    <td>[locale]</td>
                    <td>Remembers language preference</td>
                    <td>[1 year]</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3.3 Analytics Cookies</h3>
            <p>
              [PLACEHOLDER: These cookies help us understand how visitors use the website. Examples:]
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>[_ga]</td>
                    <td>Google Analytics - distinguishes users</td>
                    <td>[2 years]</td>
                  </tr>
                  <tr>
                    <td>[_gid]</td>
                    <td>Google Analytics - distinguishes users</td>
                    <td>[24 hours]</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              [Note: If not using Google Analytics, update this section with your actual analytics provider or remove if no analytics are used.]
            </p>

            <h3>3.4 Marketing Cookies</h3>
            <p>
              [PLACEHOLDER: If you use marketing/advertising cookies, list them here. If not, you can state that you do not currently use marketing cookies.]
            </p>
          </section>

          <section className="mb-8">
            <h2>4. Third-Party Cookies</h2>
            <p>
              [PLACEHOLDER: List any third-party services that may set cookies:]
            </p>
            <ul>
              <li><strong>Authentication:</strong> [NextAuth.js/your auth provider]</li>
              <li><strong>Analytics:</strong> [Google Analytics/Plausible/etc.]</li>
              <li><strong>Hosting:</strong> [Vercel/your hosting provider]</li>
              <li><strong>Storage:</strong> [Supabase/your storage provider]</li>
            </ul>
            <p>
              [PLACEHOLDER: Link to third-party privacy policies where applicable.]
            </p>
          </section>

          <section className="mb-8">
            <h2>5. Managing Your Cookie Preferences</h2>
            <h3>5.1 Cookie Consent</h3>
            <p>
              [PLACEHOLDER: Explain how users can manage consent through your cookie banner/settings. Under GDPR/ePrivacy, consent is required for non-essential cookies.]
            </p>

            <h3>5.2 Browser Settings</h3>
            <p>
              [PLACEHOLDER: Explain how users can manage cookies through their browser:]
            </p>
            <ul>
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
            </ul>
            <p>
              [PLACEHOLDER: Note that blocking all cookies may affect website functionality.]
            </p>

            <h3>5.3 Opt-Out Links</h3>
            <p>
              [PLACEHOLDER: If using third-party analytics or advertising, provide opt-out links:]
            </p>
            <ul>
              <li>Google Analytics Opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>6. Cookie Consent for Minors</h2>
            <p>
              [PLACEHOLDER: Important for a youth platform. Address how cookie consent works for users under 16, and any parental consent requirements.]
            </p>
          </section>

          <section className="mb-8">
            <h2>7. Updates to This Policy</h2>
            <p>
              [PLACEHOLDER: Explain how users will be notified of changes to the cookie policy.]
            </p>
          </section>

          <section className="mb-8">
            <h2>8. Contact Us</h2>
            <p>
              [PLACEHOLDER: Provide contact information for cookie-related inquiries:]
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
              <li>Implement a cookie consent banner that appears on first visit</li>
              <li>Allow users to accept/reject different categories of cookies</li>
              <li>Don&apos;t load non-essential cookies until consent is given</li>
              <li>Keep a record of user consent</li>
              <li>Review this policy whenever you add new third-party services</li>
              <li>Consider using a cookie consent management platform</li>
              <li>Ensure compliance with both GDPR and ePrivacy Directive</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
