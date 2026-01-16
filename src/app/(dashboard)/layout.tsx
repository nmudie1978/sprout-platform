import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navigation } from "@/components/navigation";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get current pathname to avoid redirect loops
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";

  // Only redirect employers if they're NOT already on an employer page
  if (session.user.role === "EMPLOYER" && !pathname.startsWith("/employer")) {
    redirect("/employer/dashboard");
  }

  // Fetch profile data based on role
  let userAvatarId: string | null = null;
  let displayName: string | null = null;
  let userProfilePic: string | null = null;

  if (session.user.role === "YOUTH") {
    const youthProfile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { avatarId: true, displayName: true },
    });
    userAvatarId = youthProfile?.avatarId || null;
    displayName = youthProfile?.displayName || null;
  } else if (session.user.role === "EMPLOYER") {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
      select: { companyName: true, companyLogo: true },
    });
    displayName = employerProfile?.companyName || null;
    userProfilePic = employerProfile?.companyLogo || null;
  }

  return (
    <div className="min-h-screen">
      <Navigation
        userRole={session.user.role}
        userName={displayName || session.user.email || "User"}
        userAvatarId={userAvatarId}
        userProfilePic={userProfilePic}
      />
      <main>{children}</main>
      <AiChatWidget />
    </div>
  );
}
