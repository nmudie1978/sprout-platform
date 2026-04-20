import Link from "next/link";

/**
 * Employer accounts are paused while Endeavrly focuses on the
 * career-exploration product. Employer data is retained so accounts
 * can be restored when the small-jobs marketplace re-opens.
 *
 * This page sits outside the (dashboard) segment so the dashboard
 * layout's role-check can redirect here without looping.
 */
export default function EmployerPausedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Employer accounts are paused
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Endeavrly is currently focused on helping young people explore
          careers. The small-jobs side of the platform is temporarily
          offline while we get the safety and verification guardrails
          right.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your account and any jobs you posted are preserved. We&rsquo;ll
          email the address on file when employer features return.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/api/auth/signout"
            className="rounded-lg border px-5 py-2.5 text-sm hover:bg-muted transition-colors"
          >
            Sign out
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-foreground text-background px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
