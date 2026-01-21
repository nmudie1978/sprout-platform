"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Building,
  Car,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Info,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Safeguarding rules that must be accepted
const SAFEGUARDING_RULES = [
  {
    id: "public-workplace",
    icon: Building,
    title: "Public or registered workplace",
    description: "The shadowing takes place at an official workplace location.",
  },
  {
    id: "no-private-transport",
    icon: Car,
    title: "No private transport offered",
    description: "You arrange your own transport to and from the location.",
  },
  {
    id: "clear-times",
    icon: Clock,
    title: "Clear start and end times",
    description: "The schedule is agreed in advance with defined times.",
  },
  {
    id: "no-isolated",
    icon: Users,
    title: "No isolated 1:1 scenarios",
    description: "Other people will be present or nearby during the shadow.",
  },
];

interface SafeguardingRulesProps {
  accepted: boolean;
  onAccept: (accepted: boolean) => void;
  disabled?: boolean;
}

export function SafeguardingRules({
  accepted,
  onAccept,
  disabled = false,
}: SafeguardingRulesProps) {
  return (
    <Card className={cn(
      "transition-all duration-200",
      accepted && "border-emerald-500/50 bg-emerald-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-medium">Safety First</h3>
            <p className="text-xs text-muted-foreground">
              These rules keep everyone safe
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {SAFEGUARDING_RULES.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="p-1.5 rounded-lg bg-muted shrink-0 mt-0.5">
                <rule.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{rule.title}</p>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={accepted}
              onCheckedChange={(checked) => onAccept(checked === true)}
              disabled={disabled}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium">
                I understand and accept these safety rules
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                These rules are in place to protect you during the shadow experience.
              </p>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

// Age Gating Component
interface AgeGatingNoticeProps {
  youthAgeBand: "UNDER_SIXTEEN" | "SIXTEEN_SEVENTEEN" | "EIGHTEEN_TWENTY" | null;
  guardianNotified?: boolean;
  onGuardianNotify?: () => void;
}

export function AgeGatingNotice({
  youthAgeBand,
  guardianNotified = false,
  onGuardianNotify,
}: AgeGatingNoticeProps) {
  const requiresConsent = youthAgeBand === "UNDER_SIXTEEN";

  if (!requiresConsent) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span className="text-sm">You can manage this request independently.</span>
      </div>
    );
  }

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
            <Info className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-800 dark:text-amber-200">
              Guardian Awareness Required
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Since you're under 16, a parent or guardian should know about this
              shadowing experience before you attend.
            </p>

            {guardianNotified ? (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-700 dark:text-emerald-400">
                  Guardian has been notified
                </span>
              </div>
            ) : onGuardianNotify && (
              <Button
                onClick={onGuardianNotify}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                <Phone className="h-4 w-4 mr-2" />
                Notify Guardian
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Host Verification Badge
interface HostVerificationBadgeProps {
  isVerified: boolean;
  companyName?: string;
}

export function HostVerificationBadge({
  isVerified,
  companyName,
}: HostVerificationBadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg",
      isVerified ? "bg-emerald-500/10" : "bg-muted"
    )}>
      {isVerified ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm text-emerald-700 dark:text-emerald-400">
            {companyName || "Verified Host"}
          </span>
          <Badge variant="secondary" className="text-xs">
            ID Verified
          </Badge>
        </>
      ) : (
        <>
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {companyName || "Host"} - Verification pending
          </span>
        </>
      )}
    </div>
  );
}

// Report Issue Component
interface ReportIssueProps {
  onReport: (details: string) => void;
  isSubmitting?: boolean;
}

export function ReportIssue({ onReport, isSubmitting }: ReportIssueProps) {
  const [details, setDetails] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (details.trim().length >= 10) {
      onReport(details);
      setDetails("");
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Something felt uncomfortable</span>
      </button>
    );
  }

  return (
    <Card className="border-rose-500/50 bg-rose-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <h3 className="font-medium text-rose-800 dark:text-rose-200">
            Report an Issue
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          Your safety matters. Please share what happened and we'll review it promptly.
          This report is confidential.
        </p>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Describe what happened or what made you uncomfortable..."
          className="w-full p-3 rounded-lg border bg-background text-sm resize-none"
          rows={4}
        />

        <div className="flex items-center justify-between mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={details.trim().length < 10 || isSubmitting}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Emergency Contact Input
interface EmergencyContactProps {
  contact: string;
  phone: string;
  onChange: (contact: string, phone: string) => void;
  required?: boolean;
}

export function EmergencyContactInput({
  contact,
  phone,
  onChange,
  required = false,
}: EmergencyContactProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">
          Emergency Contact {required && <span className="text-rose-500">*</span>}
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Someone we can reach if needed
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={contact}
          onChange={(e) => onChange(e.target.value, phone)}
          placeholder="Parent/Guardian name"
          className="w-full p-2.5 rounded-lg border bg-background text-sm"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => onChange(contact, e.target.value)}
          placeholder="Phone number"
          className="w-full p-2.5 rounded-lg border bg-background text-sm"
        />
      </div>
    </div>
  );
}
