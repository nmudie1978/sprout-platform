import { Star, ExternalLink, ArrowRight, CheckCircle2, Users, Route, Shield, Heart } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "For Parents — Endeavrly",
  description: "How parents and professionals can help young people explore careers by sharing their own real career paths.",
};

export default function ForParentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-primary mb-8">
            <Star className="h-6 w-6" />
            <span className="font-semibold">Endeavrly</span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
            Your career story can change a young person&apos;s future
          </h1>

          <p className="text-lg text-foreground leading-relaxed">
            Most young people only see the career paths around them &mdash; their parents, their
            teachers, a few roles on TV. They have no idea how many ways there are to build a life.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mt-4">
            Your career path &mdash; the twists, the changes, the unexpected turns &mdash; is
            exactly what they need to see.
          </p>
        </div>

        {/* Why it matters */}
        <div className="mt-16 pt-10 border-t border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Why your path matters
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Young people are told to &ldquo;pick a career&rdquo; without knowing what real careers look
            like. School shows them textbooks. The internet shows them influencers. Neither shows
            them the real, non-linear, sometimes messy paths that most people actually walk.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/30">
              <div className="flex items-start gap-3">
                <Route className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Real paths aren&apos;t straight lines</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You probably didn&apos;t end up where you thought you would at 16. That&apos;s the point.
                    When a young person sees that a psychiatrist started in a completely different country,
                    or that a tech director never went to university &mdash; it opens up possibilities they
                    didn&apos;t know existed.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Your experience is their advantage</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Parents and professionals have decades of career knowledge that young people never
                    get to access. By sharing your timeline &mdash; the jobs, the moves, the pivots &mdash;
                    you give them something no textbook can: proof that there are many ways to get where
                    you want to go.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">It takes 5 minutes, and it&apos;s anonymous</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You choose a display name, add the milestones in your career, and link it to the
                    careers it relates to. No account needed. No personal details exposed. Your contribution
                    is reviewed before it goes live, and young people see it as a &ldquo;Real Career
                    Path&rdquo; alongside their journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 pt-10 border-t border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            How it works
          </h2>
          <div className="space-y-4">
            {[
              { step: 1, title: "Tell us about yourself", desc: "A display name, your current role, and your country. That's it." },
              { step: 2, title: "Add your career timeline", desc: "The key milestones — age, role, what happened. As many or as few as you like." },
              { step: 3, title: "Link it to careers", desc: "Which careers does your path relate to? Search and tag them so the right young people see it." },
              { step: 4, title: "Add a headline and advice", desc: "One sentence that sums up your path, and one piece of advice for someone starting out." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety */}
        <div className="mt-16 pt-10 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-rose-500" />
            <h2 className="text-xl font-semibold text-foreground">
              Safe and reviewed
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Every contribution is reviewed by our team before it&apos;s shown to young people.
            We check for accuracy, appropriateness, and relevance. Your email is optional and only
            used if we need to clarify something &mdash; it&apos;s never shown publicly.
            No personal contact information is displayed anywhere on the platform.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 pt-10 border-t border-border text-center">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Ready to share your path?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
            It takes about 5 minutes. No account required. Your career story could be the thing
            that helps a young person see a future they didn&apos;t know was possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contribute"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Share your career path
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/parents-paths"
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              Browse submitted paths
            </Link>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-16 pt-10 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Want to know more about what Endeavrly does?{" "}
            <Link href="/about" className="text-foreground underline underline-offset-4 hover:text-primary">
              Read about the platform
            </Link>.
            Have questions or concerns?{" "}
            <Link href="/report" className="text-foreground underline underline-offset-4 hover:text-primary">
              Report a concern
            </Link>{" "}
            or read our{" "}
            <Link href="/legal/privacy" className="text-foreground underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
