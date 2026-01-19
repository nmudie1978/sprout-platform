import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal - Sprout",
  description: "Sprout Platform Administration Dashboard",
  robots: "noindex, nofollow", // Prevent search engine indexing
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900">
      {children}
    </div>
  );
}
