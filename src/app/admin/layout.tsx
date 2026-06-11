import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin Portal - Endeavrly",
  description: "Endeavrly Platform Administration Dashboard",
  robots: "noindex, nofollow", // Prevent search engine indexing
};

// Admin pages render PII (user emails, reports). Middleware already gates
// /admin/* on the Portal session cookie, but relying on it alone makes the
// matcher a single point of failure. This server-side guard is belt-and-
// suspenders: any admin page that somehow escapes the matcher still can't
// render without a valid admin session. The login page is exempt (it must be
// reachable while signed out) — identified via the x-pathname header the
// middleware sets.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") || "";
  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login");

  if (!isLogin && !(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {children}
    </div>
  );
}
