"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle, Info, Shield } from "lucide-react";
import { JobCategory } from "@prisma/client";

interface ComplianceViolation {
  code: string;
  severity: "critical" | "high" | "medium";
  message: string;
  rule: string;
}

interface ComplianceWarning {
  code: string;
  message: string;
  recommendation: string;
}

interface ComplianceResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
}

interface ComplianceCheckerProps {
  jobData: {
    title?: string;
    category?: JobCategory;
    payAmount?: number;
    payType?: "FIXED" | "HOURLY";
    duration?: number;
    startDate?: string;
    endDate?: string;
    isSchoolDay?: boolean;
    isSchoolHoliday?: boolean;
    requiresWorkingAlone?: boolean;
    involvesPrivateHome?: boolean;
  };
  onComplianceChange?: (eligible: boolean, ageGroups: string[]) => void;
}

interface ValidationResponse {
  valid: boolean;
  eligibleAgeGroups: string[];
  resultsForMinors: ComplianceResult;
  resultsForYoungAdults: ComplianceResult;
  summary: {
    canBePosted: boolean;
    visibleTo: string;
    totalViolations: number;
    totalWarnings: number;
  };
}

export function ComplianceChecker({
  jobData,
  onComplianceChange,
}: ComplianceCheckerProps) {
  const [validationResult, setValidationResult] =
    useState<ValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce validation requests
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      // Only validate if we have minimum required data
      if (!jobData.category || !jobData.payAmount) {
        return;
      }

      setIsValidating(true);
      setError(null);

      try {
        const response = await fetch("/api/jobs/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...jobData,
            title: jobData.title || "Draft Job",
            description: "Draft description",
          }),
        });

        if (response.ok) {
          const result: ValidationResponse = await response.json();
          setValidationResult(result);
          onComplianceChange?.(result.valid, result.eligibleAgeGroups);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Validation failed");
          onComplianceChange?.(false, []);
        }
      } catch {
        setError("Failed to check compliance");
        onComplianceChange?.(false, []);
      } finally {
        setIsValidating(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    jobData.category,
    jobData.payAmount,
    jobData.payType,
    jobData.duration,
    jobData.startDate,
    jobData.endDate,
    jobData.isSchoolDay,
    jobData.isSchoolHoliday,
    jobData.requiresWorkingAlone,
    jobData.involvesPrivateHome,
    onComplianceChange,
  ]);

  if (!jobData.category && !jobData.payAmount) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-primary-600" />
        <h3 className="font-medium text-gray-900">
          Norwegian Labor Law Compliance
        </h3>
        {isValidating && (
          <span className="text-sm text-gray-500 animate-pulse">
            Checking...
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-md mb-3">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {validationResult && (
        <div className="space-y-4">
          {/* Overall status */}
          <div
            className={`flex items-center gap-2 p-3 rounded-md ${
              validationResult.valid
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {validationResult.valid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p
                className={`font-medium ${
                  validationResult.valid ? "text-green-800" : "text-red-800"
                }`}
              >
                {validationResult.valid
                  ? "Job can be posted"
                  : "Job cannot be posted"}
              </p>
              <p className="text-sm text-gray-600">
                {validationResult.summary.visibleTo}
              </p>
            </div>
          </div>

          {/* Eligible age groups */}
          {validationResult.eligibleAgeGroups.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Visible to:</span>
              {validationResult.eligibleAgeGroups.map((group) => (
                <span
                  key={group}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  Ages {group}
                </span>
              ))}
            </div>
          )}

          {/* Violations for minors */}
          {validationResult.resultsForMinors.violations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Issues for minors (15-17):
              </p>
              {validationResult.resultsForMinors.violations.map(
                (violation, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                      violation.severity === "critical"
                        ? "bg-red-50 text-red-700"
                        : violation.severity === "high"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{violation.message}</p>
                      <p className="text-xs opacity-80">{violation.rule}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Violations for young adults */}
          {validationResult.resultsForYoungAdults.violations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Issues for young adults (18-20):
              </p>
              {validationResult.resultsForYoungAdults.violations.map(
                (violation, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                      violation.severity === "critical"
                        ? "bg-red-50 text-red-700"
                        : violation.severity === "high"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{violation.message}</p>
                      <p className="text-xs opacity-80">{violation.rule}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Warnings */}
          {(validationResult.resultsForMinors.warnings.length > 0 ||
            validationResult.resultsForYoungAdults.warnings.length > 0) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Warnings:</p>
              {[
                ...validationResult.resultsForMinors.warnings,
                ...validationResult.resultsForYoungAdults.warnings,
              ]
                .filter(
                  (w, i, arr) =>
                    arr.findIndex((x) => x.code === w.code) === i
                )
                .map((warning, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-md bg-blue-50 text-sm text-blue-700"
                  >
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p>{warning.message}</p>
                      <p className="text-xs opacity-80">
                        {warning.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simple badge showing which age groups can see a job
 */
export function AgeGroupBadges({
  eligibleAgeGroups,
  size = "sm",
}: {
  eligibleAgeGroups: string[];
  size?: "sm" | "md";
}) {
  if (!eligibleAgeGroups || eligibleAgeGroups.length === 0) {
    return null;
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <div className="flex flex-wrap gap-1">
      {eligibleAgeGroups.map((group) => (
        <span
          key={group}
          className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${
            group === "15-17"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          Ages {group}
        </span>
      ))}
    </div>
  );
}

/**
 * Compact compliance indicator for job cards
 */
export function ComplianceIndicator({
  eligibleAgeGroups,
}: {
  eligibleAgeGroups: string[];
}) {
  const allEligible =
    eligibleAgeGroups.includes("15-17") && eligibleAgeGroups.includes("18-20");
  const minorsOnly = eligibleAgeGroups.includes("15-17") && !eligibleAgeGroups.includes("18-20");
  const adultsOnly = !eligibleAgeGroups.includes("15-17") && eligibleAgeGroups.includes("18-20");

  if (allEligible) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
        <Shield className="h-3 w-3" />
        All ages
      </span>
    );
  }

  if (minorsOnly) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
        <Shield className="h-3 w-3" />
        Ages 15-17 only
      </span>
    );
  }

  if (adultsOnly) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <Shield className="h-3 w-3" />
        Ages 18+ only
      </span>
    );
  }

  return null;
}
