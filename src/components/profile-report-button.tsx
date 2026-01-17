"use client";

import { useSession } from "next-auth/react";
import { ReportModal } from "@/components/report-modal";

interface ProfileReportButtonProps {
  userId: string;
  displayName: string;
}

export function ProfileReportButton({ userId, displayName }: ProfileReportButtonProps) {
  const { data: session } = useSession();

  // Don't show report button if not logged in or if viewing own profile
  if (!session?.user || session.user.id === userId) {
    return null;
  }

  return (
    <ReportModal
      targetType="USER"
      targetId={userId}
      targetName={displayName}
    />
  );
}
