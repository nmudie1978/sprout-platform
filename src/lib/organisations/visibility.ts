/**
 * Data-visibility rules — the privacy boundary from section 19 of the spec.
 *
 * The question this file answers is NOT "does the licence include analytics?"
 * (entitlements) nor "is this person an admin?" (permissions). It is the
 * narrower and more consequential one:
 *
 *     May this staff member see THIS young person's individual data?
 *
 * Every gate below must pass. Any one of them failing means aggregate-only.
 * The default answer is no; each "yes" has to be earned by an explicit,
 * auditable decision made by either the organisation or the young person.
 *
 *   1. The organisation has switched on individual views at all.
 *   2. The staff role is permitted individual views by the role matrix.
 *   3. The relationship exists — assigned advisor, or educator of that cohort.
 *   4. The young person has consented to share, if the org requires consent.
 *
 * Pure functions, no database. The callers assemble the facts; this file
 * decides. That split is what makes the rules reviewable.
 */

import { OrgRole } from "@prisma/client";

import { roleHasPermission } from "./permissions";

export interface OrganisationPrivacySettings {
  allowIndividualParticipantView: boolean;
  advisorCanViewAssignedDetail: boolean;
  educatorCanViewCohortDetail: boolean;
  managerCanViewIndividualDetail: boolean;
  minimumAggregateGroupSize: number;
  requireParticipantDataSharingConsent: boolean;
}

/** Conservative defaults, used when an organisation has no settings row yet. */
export const DEFAULT_PRIVACY_SETTINGS: OrganisationPrivacySettings = {
  allowIndividualParticipantView: false,
  advisorCanViewAssignedDetail: true,
  educatorCanViewCohortDetail: false,
  managerCanViewIndividualDetail: false,
  minimumAggregateGroupSize: 5,
  requireParticipantDataSharingConsent: true,
};

export interface IndividualViewRequest {
  viewerRole: OrgRole;
  settings: OrganisationPrivacySettings;
  /** Is the viewer an advisor explicitly assigned to this participant? */
  isAssignedAdvisor: boolean;
  /** Does the viewer share a cohort with this participant, as its educator? */
  sharesCohortAsEducator: boolean;
  /** Has the participant agreed to share journey progress with this org? */
  participantHasConsented: boolean;
}

export type IndividualViewDenialReason =
  | "ORGANISATION_DISALLOWS_INDIVIDUAL_VIEW"
  | "ROLE_DISALLOWS_INDIVIDUAL_VIEW"
  | "NO_RELATIONSHIP_TO_PARTICIPANT"
  | "PARTICIPANT_HAS_NOT_CONSENTED";

export type IndividualViewDecision =
  | { allowed: true }
  | { allowed: false; reason: IndividualViewDenialReason };

/**
 * May this viewer see individual-level data for one participant?
 *
 * Note the ordering: the organisation-level switch is checked first, so an
 * institution that has not opted in gets a single clear answer regardless of
 * who is asking. ORGANISATION_ADMIN is NOT exempt — administering an
 * organisation is not a reason to read a young person's reflections.
 */
export function canViewIndividualParticipant(
  request: IndividualViewRequest
): IndividualViewDecision {
  const { viewerRole, settings } = request;

  if (!settings.allowIndividualParticipantView) {
    return { allowed: false, reason: "ORGANISATION_DISALLOWS_INDIVIDUAL_VIEW" };
  }

  // Which individual-view permission, if any, does this role hold — and has
  // the organisation left it switched on?
  let roleAllows = false;
  let relationshipHolds = false;

  switch (viewerRole) {
    case OrgRole.ADVISOR:
      roleAllows =
        settings.advisorCanViewAssignedDetail &&
        roleHasPermission(viewerRole, "analytics:view_assigned_individuals");
      relationshipHolds = request.isAssignedAdvisor;
      break;

    case OrgRole.EDUCATOR:
      roleAllows =
        settings.educatorCanViewCohortDetail &&
        roleHasPermission(viewerRole, "analytics:view_cohort_individuals");
      relationshipHolds = request.sharesCohortAsEducator;
      break;

    case OrgRole.MANAGER:
      // Off by default and deliberately awkward to turn on. A manager's job
      // is programme-shaped, and programmes are measured in aggregate.
      roleAllows = settings.managerCanViewIndividualDetail;
      relationshipHolds = true;
      break;

    default:
      // PARTICIPANT, PARENT, ORGANISATION_ADMIN.
      roleAllows = false;
      relationshipHolds = false;
  }

  if (!roleAllows) {
    return { allowed: false, reason: "ROLE_DISALLOWS_INDIVIDUAL_VIEW" };
  }
  if (!relationshipHolds) {
    return { allowed: false, reason: "NO_RELATIONSHIP_TO_PARTICIPANT" };
  }
  if (settings.requireParticipantDataSharingConsent && !request.participantHasConsented) {
    return { allowed: false, reason: "PARTICIPANT_HAS_NOT_CONSENTED" };
  }

  return { allowed: true };
}

/**
 * k-anonymity floor for aggregates.
 *
 * "3 of 4 students in this class chose nursing" is not an aggregate — it is
 * a near-identification. Below the threshold the UI must show "not enough
 * data yet" rather than a number.
 */
export function canShowAggregate(
  groupSize: number,
  settings: OrganisationPrivacySettings
): boolean {
  return groupSize >= Math.max(1, settings.minimumAggregateGroupSize);
}

/**
 * Suppress a set of aggregate counts that would otherwise identify someone.
 * Returns null when the whole group is too small to report on at all.
 */
export function redactAggregate<T extends { count: number }>(
  rows: T[],
  groupSize: number,
  settings: OrganisationPrivacySettings
): T[] | null {
  if (!canShowAggregate(groupSize, settings)) return null;
  // Individual buckets below the floor are dropped rather than shown, so a
  // long tail of one-person categories can't be read off the chart.
  return rows.filter((row) => row.count >= settings.minimumAggregateGroupSize);
}
