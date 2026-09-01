import { redirect } from "next/navigation";

/**
 * Legacy route. NextAuth's `pages.verifyRequest` points here, and it used to
 * render a "we sent you a magic link to sign in" card — which was never true:
 * Endeavrly signs in with credentials, and no magic link was ever issued. A
 * screen that claims an email is on its way when nothing was sent is worse
 * than no screen at all.
 *
 * It now forwards to the real post-signup screen, so old bookmarks and the
 * NextAuth config both land somewhere honest.
 */
export default function VerifyPage() {
  redirect("/auth/check-email");
}
