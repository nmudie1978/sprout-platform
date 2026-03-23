import { Card, CardContent } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | Endeavrly",
  description: "Cookie Policy for the Endeavrly platform",
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
            <p className="text-muted-foreground">Last updated: 23 March 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-2">
        <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to the site operator. Similar technologies such as local storage and session storage may also be used for the same purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2>2. How We Use Cookies</h2>
            <p>Endeavrly uses cookies for the following purposes:</p>
            <ul>
              <li>Keeping you signed in to your account</li>
              <li>Remembering your preferences (such as light or dark mode)</li>
              <li>Protecting the security of your account</li>
              <li>Understanding how the Platform is used so we can improve it</li>
            </ul>
            <p>
              We do not use cookies for advertising, behavioural profiling, or tracking across other websites.
            </p>
          </section>

          <section className="mb-8">
            <h2>3. Types of Cookies We Use</h2>

            <h3>3.1 Strictly Necessary Cookies</h3>
            <p>
              These cookies are essential for the Platform to function. They cannot be disabled. Without them, you would not be able to sign in or use core features.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Cookie</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>next-auth.session-token</td>
                    <td>Authentication and session management</td>
                    <td>7 days</td>
                  </tr>
                  <tr>
                    <td>next-auth.csrf-token</td>
                    <td>Prevents cross-site request forgery attacks</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>next-auth.callback-url</td>
                    <td>Stores redirect URL during sign-in</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>endeavrly_admin_session</td>
                    <td>Admin panel authentication (admin users only)</td>
                    <td>7 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3.2 Functional Cookies</h3>
            <p>
              These cookies remember your preferences to provide a better experience. They are stored in your browser&apos;s local storage.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Storage Key</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>theme</td>
                    <td>Remembers your light or dark mode preference</td>
                    <td>Persistent</td>
                  </tr>
                  <tr>
                    <td>journey-goal-banner-dismissed</td>
                    <td>Remembers if you dismissed the goal reminder</td>
                    <td>Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3.3 Analytics</h3>
            <p>
              Endeavrly does not currently use third-party analytics cookies. We may collect anonymised, aggregated usage data through server-side logging to understand how the Platform is used and to improve it. This data cannot identify individual users.
            </p>
            <p>
              If we introduce analytics cookies in the future, we will update this policy and request your consent before setting them.
            </p>

            <h3>3.4 Marketing and Advertising</h3>
            <p>
              Endeavrly does not use marketing or advertising cookies. We do not serve targeted ads or track you across other websites.
            </p>
          </section>

          <section className="mb-8">
            <h2>4. Third-Party Cookies</h2>
            <p>The following third-party services may set cookies or process data when you use the Platform:</p>
            <ul>
              <li><strong>Vercel:</strong> our hosting provider may set performance-related cookies. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vercel&apos;s Privacy Policy</a>.</li>
              <li><strong>Supabase:</strong> our database provider processes data on our behalf within the EU. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase&apos;s Privacy Policy</a>.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>5. Managing Your Cookie Preferences</h2>

            <h3>5.1 Browser Settings</h3>
            <p>You can manage or delete cookies through your browser settings:</p>
            <ul>
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
            <p>
              Please note that blocking strictly necessary cookies will prevent the Platform from functioning correctly. You may not be able to sign in or use core features.
            </p>

            <h3>5.2 Local Storage</h3>
            <p>
              Functional preferences stored in local storage can be cleared through your browser&apos;s developer tools or by clearing all site data for endeavrly.no.
            </p>
          </section>

          <section className="mb-8">
            <h2>6. Cookies and Young Users</h2>
            <p>
              Because many of our users are minors, we take a minimal approach to cookies. We only use cookies that are strictly necessary for the Platform to function or that improve your experience. We do not use any cookies that profile, track, or target young users.
            </p>
            <p>
              For users under 16, parental or guardian consent covers the use of strictly necessary cookies as part of the Platform&apos;s operation.
            </p>
          </section>

          <section className="mb-8">
            <h2>7. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time, particularly if we introduce new features or third-party services. The updated policy will indicate the new effective date at the top of this page.
            </p>
          </section>

          <section className="mb-8">
            <h2>8. Contact Us</h2>
            <p>For questions about our use of cookies, contact us at:</p>
            <ul>
              <li>Email: <a href="mailto:privacy@endeavrly.no" className="text-primary hover:underline">privacy@endeavrly.no</a></li>
              <li>Post: Endeavrly AS, Oslo, Norway</li>
            </ul>
          </section>

          <hr className="my-8" />

          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="text-muted-foreground">
              This Cookie Policy should be reviewed by qualified legal counsel before being relied upon. It is provided as a working draft and does not constitute legal advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
