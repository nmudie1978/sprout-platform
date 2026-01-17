"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  UserCheck,
  Mail,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { AccountStatus } from "@prisma/client";
import { useState } from "react";

interface VerificationStatusProps {
  compact?: boolean;
}

export function VerificationStatus({ compact = false }: VerificationStatusProps) {
  const { data: session } = useSession();
  const [requestingConsent, setRequestingConsent] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState("");
  const [consentRequested, setConsentRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  const { role, accountStatus, youthProfile, employerProfile } = session.user;

  // If account is ACTIVE, show nothing (or a success badge in non-compact mode)
  if (accountStatus === AccountStatus.ACTIVE) {
    if (compact) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Account Verified
                </p>
                <p className="text-xs text-muted-foreground">
                  Your account is fully verified and active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Handle different account statuses
  const statusConfig = {
    ONBOARDING: {
      icon: Clock,
      title: "Complete Your Setup",
      color: "amber",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200",
      iconBgColor: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-400",
    },
    PENDING_VERIFICATION: {
      icon: Shield,
      title: "Verification Required",
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200",
      iconBgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    SUSPENDED: {
      icon: AlertTriangle,
      title: "Account Suspended",
      color: "red",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200",
      iconBgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-700 dark:text-red-400",
    },
    BANNED: {
      icon: Ban,
      title: "Account Banned",
      color: "red",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200",
      iconBgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-700 dark:text-red-400",
    },
  };

  const status = accountStatus as keyof typeof statusConfig;
  const config = statusConfig[status] || statusConfig.ONBOARDING;
  const StatusIcon = config.icon;

  // Determine what action is needed
  let actionNeeded = "";
  let actionDescription = "";
  let actionButton = null;

  if (role === "YOUTH") {
    if (status === "PENDING_VERIFICATION" && !youthProfile?.guardianConsent) {
      actionNeeded = "Guardian Consent Required";
      actionDescription =
        "As you're under 18, we need your parent or guardian to approve your account before you can apply to jobs.";

      if (!consentRequested) {
        actionButton = (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Guardian's email address"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                size="sm"
                disabled={!guardianEmail || requestingConsent}
                onClick={async () => {
                  setRequestingConsent(true);
                  setError(null);
                  try {
                    const res = await fetch("/api/guardian-consent", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ guardianEmail }),
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.error || "Failed to send request");
                    }
                    setConsentRequested(true);
                  } catch (err: any) {
                    setError(err.message);
                  } finally {
                    setRequestingConsent(false);
                  }
                }}
              >
                {requestingConsent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-1" />
                    Send
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
        );
      } else {
        actionButton = (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Request sent to {guardianEmail}! Ask your guardian to check their email.
            </AlertDescription>
          </Alert>
        );
      }
    } else if (status === "ONBOARDING") {
      // Don't show anything for ONBOARDING youth - ProfileStrengthCompact handles this
      // Return null for compact mode, or nothing for full mode
      if (compact) return null;
      return null;
    }
  } else if (role === "EMPLOYER") {
    // CRITICAL: Check BankID verification first - required to contact youth
    const isVerifiedAdult = session.user.isVerifiedAdult || employerProfile?.eidVerified;

    if (!isVerifiedAdult) {
      actionNeeded = "BankID Verification Required";
      actionDescription =
        "To protect young people on our platform, BankID verification is required before you can contact youth workers. This is a mandatory safety measure.";
      actionButton = (
        <Link href="/employer/settings">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Shield className="h-4 w-4 mr-1" />
            Verify with BankID
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      );
    } else if (!employerProfile?.ageVerified) {
      actionNeeded = "Age Verification Required";
      actionDescription =
        "To protect our young users, we need to verify that you're 18 or older before you can post jobs.";
      actionButton = (
        <Link href="/employer/settings">
          <Button size="sm">
            <UserCheck className="h-4 w-4 mr-1" />
            Verify Age
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      );
    } else if (status === "ONBOARDING") {
      actionNeeded = "Complete Your Profile";
      actionDescription = "Finish setting up your employer profile to post jobs.";
      actionButton = (
        <Link href="/employer/settings">
          <Button size="sm" variant="outline">
            <ChevronRight className="h-4 w-4 mr-1" />
            Complete Profile
          </Button>
        </Link>
      );
    }
  }

  // Compact mode
  if (compact && actionNeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Alert className={`${config.bgColor} ${config.borderColor}`}>
          <StatusIcon className={`h-4 w-4 ${config.textColor}`} />
          <AlertTitle className={config.textColor}>{actionNeeded}</AlertTitle>
          <AlertDescription className="mt-2">
            {actionButton}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  // Full card mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`${config.borderColor} ${config.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.iconBgColor}`}>
              <StatusIcon className={`h-5 w-5 ${config.textColor}`} />
            </div>
            <div>
              <CardTitle className={`text-base ${config.textColor}`}>
                {config.title}
              </CardTitle>
              <CardDescription>
                {actionNeeded || "Action required to use all features"}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={`ml-auto ${config.borderColor} ${config.textColor}`}
            >
              {status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{actionDescription}</p>
          {actionButton}
        </CardContent>
      </Card>
    </motion.div>
  );
}
