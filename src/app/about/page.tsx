import { Download, Users, ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

export const metadata = {
  title: "About Endeavrly",
  description: "Why Endeavrly exists and how it helps young people explore careers, gain independence, and understand themselves.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12">
          <BrandMark size="lg" href="/" className="mb-8" wordmarkClassName="text-primary" />

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400/80 mb-3">
            The Career Operating System for young people
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Why Endeavrly Exists
          </h1>
          <p className="text-xl font-medium text-foreground leading-snug mb-6">
            See your possible future before you commit to it.
          </p>

          <p className="text-lg text-foreground leading-relaxed">
            Most young people are expected to make career decisions without ever experiencing real work,
            without understanding what careers actually exist, and without a way to figure out what
            they&apos;re genuinely good at.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mt-4">
            Endeavrly helps you explore careers, understand the reality, and build a path forward &mdash;
            before the pressure to choose becomes overwhelming.
          </p>

          {/* A single download: the white paper. */}
          <div className="mt-6">
            <a
              href="/api/reports/white-paper"
              download="endeavrly-white-paper.pdf"
              className="inline-flex items-center gap-2 rounded-lg border border-teal-500/40 bg-teal-500/10 px-4 py-2.5 text-sm font-medium text-teal-700 dark:text-teal-300 hover:bg-teal-500/15 hover:border-teal-500/60 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download the white paper (PDF)
            </a>
          </div>
        </div>

        {/* The Framework */}
        <div className="mt-16 pt-10 border-t border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            The framework: Discover, Understand, Clarity
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Everything in Endeavrly is built around three lenses, in sequence &mdash; each one gives you
            what you need for the next.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="p-4 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/30 motion-safe:animate-fade-in-up motion-safe:opacity-0"
              style={{ animationDelay: "0s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold shrink-0">1</span>
                <h3 className="font-semibold text-foreground">Discover</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A high-level view of any career &mdash; what it is, the pay, and whether it&apos;s worth a closer look.
              </p>
            </div>

            <div
              className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 motion-safe:animate-fade-in-up motion-safe:opacity-0"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">2</span>
                <h3 className="font-semibold text-foreground">Understand</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                What the role really involves day to day &mdash; and what it takes to qualify.
              </p>
            </div>

            <div
              className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 motion-safe:animate-fade-in-up motion-safe:opacity-0"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">3</span>
                <h3 className="font-semibold text-foreground">Clarity</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The full timeline and milestones, so you can move forward with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* For Parents */}
        <div className="mt-16 pt-10 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-foreground">
              Parents and professionals
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your career path &mdash; the twists, the pivots, the unexpected turns &mdash; is exactly what young
            people need to see. By sharing your real career timeline, you help them understand that there are
            many ways to build a life, not just the ones they see around them.
          </p>
          <Link
            href="/for-parents"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 hover:border-emerald-500/60 transition-colors"
          >
            Learn how to contribute your career path
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Closing */}
        <div className="mt-16 pt-10 border-t border-border">
          <p className="text-muted-foreground leading-relaxed">
            If you have questions or concerns, you can reach us through the{" "}
            <Link href="/report" className="text-foreground underline underline-offset-4 hover:text-primary">
              Report a concern
            </Link>{" "}
            page or the contact details in our{" "}
            <Link href="/legal/privacy" className="text-foreground underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
