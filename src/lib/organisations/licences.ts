/**
 * Licence lifecycle and seat arithmetic — pure.
 *
 * The commercial questions the admin portal, the nightly expiry job and the
 * join path all need to agree on: is there room, is it about to lapse, what
 * is it worth. One implementation so those three surfaces cannot drift.
 */

import { LicenceStatus } from "@prisma/client";

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** How many days before expiry a licence starts appearing in alerts. */
export const RENEWAL_ALERT_WINDOW_DAYS = 30;
/** Seat utilisation at which an organisation is "approaching its limit". */
export const SEAT_ALERT_THRESHOLD = 0.9;

export interface SeatCheckInput {
  userLimit: number | null;
  activeUserCount: number;
}

export type SeatCheck =
  | { allowed: true; remaining: number | null }
  | { allowed: false; remaining: 0 };

/**
 * Is there room for one more member?
 *
 * Enforced at JOIN time only. Deliberately never applied retroactively —
 * see the note in entitlements/resolve.ts about not stripping access from
 * young people already using the product.
 */
export function checkSeatAvailable(input: SeatCheckInput): SeatCheck {
  if (input.userLimit === null) return { allowed: true, remaining: null };
  const remaining = input.userLimit - input.activeUserCount;
  if (remaining <= 0) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining };
}

/** 0–1, or null when the licence is unlimited. */
export function seatUtilisation(input: SeatCheckInput): number | null {
  if (input.userLimit === null || input.userLimit <= 0) return null;
  return input.activeUserCount / input.userLimit;
}

export function isApproachingSeatLimit(input: SeatCheckInput): boolean {
  const utilisation = seatUtilisation(input);
  return utilisation !== null && utilisation >= SEAT_ALERT_THRESHOLD;
}

export function daysUntil(date: Date | null, now: Date = new Date()): number | null {
  if (!date) return null;
  return Math.ceil((date.getTime() - now.getTime()) / MS_PER_DAY);
}

export interface LicenceLifecycleInput {
  status: LicenceStatus;
  startDate: Date;
  endDate: Date | null;
  trialEndsAt: Date | null;
}

/**
 * The status a licence should hold right now.
 *
 * Returns the CURRENT status when no transition is due, so the nightly job
 * can write only where the two differ. Cancelled and suspended licences are
 * terminal from the job's point of view — a human put them there and a
 * clock should not take them out.
 */
export function derivedLicenceStatus(
  licence: LicenceLifecycleInput,
  now: Date = new Date()
): LicenceStatus {
  if (licence.status === LicenceStatus.CANCELLED) return LicenceStatus.CANCELLED;
  if (licence.status === LicenceStatus.SUSPENDED) return LicenceStatus.SUSPENDED;

  if (licence.endDate && licence.endDate.getTime() <= now.getTime()) {
    return LicenceStatus.EXPIRED;
  }

  // A trial whose trial window closed but whose contract term runs on has
  // been converted; promote it rather than expiring it.
  if (
    licence.status === LicenceStatus.TRIAL &&
    licence.trialEndsAt &&
    licence.trialEndsAt.getTime() <= now.getTime()
  ) {
    return licence.endDate && licence.endDate.getTime() > now.getTime()
      ? LicenceStatus.ACTIVE
      : LicenceStatus.EXPIRED;
  }

  return licence.status;
}

export type CommercialAlertKind =
  | "LICENCE_EXPIRING"
  | "LICENCE_EXPIRED"
  | "TRIAL_ENDING"
  | "SEAT_LIMIT_APPROACHING"
  | "SEAT_LIMIT_REACHED"
  | "NO_LICENCE";

export interface CommercialAlert {
  kind: CommercialAlertKind;
  organisationId: string;
  organisationName: string;
  /** Ordering hint for the dashboard: lower sorts first. */
  severity: 1 | 2 | 3;
  message: string;
}

export interface AlertInput {
  organisationId: string;
  organisationName: string;
  licence: (LicenceLifecycleInput & SeatCheckInput) | null;
}

/**
 * Turn the licence estate into the alert list on the admin dashboard.
 * Pure, so the alert wording and thresholds are testable without fixtures.
 */
export function buildCommercialAlerts(
  organisations: AlertInput[],
  now: Date = new Date()
): CommercialAlert[] {
  const alerts: CommercialAlert[] = [];

  for (const org of organisations) {
    const base = { organisationId: org.organisationId, organisationName: org.organisationName };

    if (!org.licence) {
      alerts.push({
        ...base,
        kind: "NO_LICENCE",
        severity: 2,
        message: `${org.organisationName} has no licence.`,
      });
      continue;
    }

    const { licence } = org;
    const status = derivedLicenceStatus(licence, now);
    const days = daysUntil(licence.endDate, now);

    if (status === LicenceStatus.EXPIRED) {
      alerts.push({
        ...base,
        kind: "LICENCE_EXPIRED",
        severity: 1,
        message: `${org.organisationName}'s licence has expired.`,
      });
    } else if (days !== null && days <= RENEWAL_ALERT_WINDOW_DAYS && days >= 0) {
      alerts.push({
        ...base,
        kind: "LICENCE_EXPIRING",
        severity: 1,
        message: `${org.organisationName}'s licence expires in ${days} day${days === 1 ? "" : "s"}.`,
      });
    }

    const trialDays = daysUntil(licence.trialEndsAt, now);
    if (
      status === LicenceStatus.TRIAL &&
      trialDays !== null &&
      trialDays <= RENEWAL_ALERT_WINDOW_DAYS &&
      trialDays >= 0
    ) {
      alerts.push({
        ...base,
        kind: "TRIAL_ENDING",
        severity: 2,
        message: `${org.organisationName}'s trial ends in ${trialDays} day${
          trialDays === 1 ? "" : "s"
        }.`,
      });
    }

    const seats = checkSeatAvailable(licence);
    if (!seats.allowed) {
      alerts.push({
        ...base,
        kind: "SEAT_LIMIT_REACHED",
        severity: 1,
        message: `${org.organisationName} has reached its user limit (${licence.userLimit}).`,
      });
    } else if (isApproachingSeatLimit(licence)) {
      alerts.push({
        ...base,
        kind: "SEAT_LIMIT_APPROACHING",
        severity: 3,
        message: `${org.organisationName} is at ${Math.round(
          (seatUtilisation(licence) ?? 0) * 100
        )}% of its user limit.`,
      });
    }
  }

  return alerts.sort((a, b) => a.severity - b.severity);
}

/**
 * Annual recurring revenue across the estate, in minor currency units.
 *
 * Only TRIAL and ACTIVE licences count, and only those with an annualised
 * value recorded. Trials are reported separately from committed ARR because
 * counting unconverted pilots as revenue is how forecasts go wrong.
 */
export function summariseRevenue(
  licences: { status: LicenceStatus; annualValueMinor: number | null }[]
): { arrMinor: number; trialPipelineMinor: number; mrrMinor: number } {
  let arrMinor = 0;
  let trialPipelineMinor = 0;

  for (const licence of licences) {
    const value = licence.annualValueMinor ?? 0;
    if (licence.status === LicenceStatus.ACTIVE) arrMinor += value;
    else if (licence.status === LicenceStatus.TRIAL) trialPipelineMinor += value;
  }

  return { arrMinor, trialPipelineMinor, mrrMinor: Math.round(arrMinor / 12) };
}
