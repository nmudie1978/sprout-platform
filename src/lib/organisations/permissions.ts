/**
 * Organisational role → permission matrix.
 *
 * Distinct from entitlements. Entitlements answer "does this organisation's
 * licence include this capability?". Permissions answer "is this person, in
 * this role, allowed to perform this action?". Both must pass.
 *
 * Pure and table-driven so the whole matrix is readable in one screen and
 * testable without a database.
 */

import { OrgRole } from "@prisma/client";

export type OrgPermission =
  // Organisation administration
  | "org:view_settings"
  | "org:edit_settings"
  | "org:manage_domains"
  // People
  | "members:list"
  | "members:invite"
  | "members:change_role"
  | "members:remove"
  | "members:assign_advisor"
  // Cohorts
  | "cohorts:list"
  | "cohorts:create"
  | "cohorts:edit"
  | "cohorts:assign_members"
  // Access codes
  | "codes:list"
  | "codes:create"
  | "codes:edit"
  // Analytics
  | "analytics:view_aggregate"
  | "analytics:view_assigned_individuals"
  | "analytics:view_cohort_individuals"
  | "analytics:export"
  // Commercial (read-only for the organisation; Endeavrly owns the writes)
  | "licence:view";

const NONE: readonly OrgPermission[] = [];

/**
 * The matrix. Read it top to bottom as "what this role can do".
 *
 * PARTICIPANT and PARENT hold NO organisational permissions at all. They are
 * members of the organisation, not administrators of it — their experience is
 * their own personal Endeavrly journey, unchanged.
 */
export const ROLE_PERMISSIONS: Record<OrgRole, readonly OrgPermission[]> = {
  [OrgRole.PARTICIPANT]: NONE,
  [OrgRole.PARENT]: NONE,

  [OrgRole.ADVISOR]: [
    "members:list",
    "cohorts:list",
    "analytics:view_aggregate",
    // Individual-level detail, but ONLY for participants explicitly assigned
    // to them — and only if the organisation's settings allow it at all.
    "analytics:view_assigned_individuals",
  ],

  [OrgRole.EDUCATOR]: [
    "members:list",
    "cohorts:list",
    "analytics:view_aggregate",
    "analytics:view_cohort_individuals",
  ],

  // Managers are deliberately aggregate-first. They run programmes; they do
  // not need to read one young person's reflections to do that.
  [OrgRole.MANAGER]: [
    "members:list",
    "cohorts:list",
    "cohorts:create",
    "cohorts:edit",
    "cohorts:assign_members",
    "analytics:view_aggregate",
    "analytics:export",
    "licence:view",
    "org:view_settings",
  ],

  [OrgRole.ORGANISATION_ADMIN]: [
    "org:view_settings",
    "org:edit_settings",
    "org:manage_domains",
    "members:list",
    "members:invite",
    "members:change_role",
    "members:remove",
    "members:assign_advisor",
    "cohorts:list",
    "cohorts:create",
    "cohorts:edit",
    "cohorts:assign_members",
    "codes:list",
    "codes:create",
    "codes:edit",
    "analytics:view_aggregate",
    "analytics:export",
    "licence:view",
  ],
};

/** Roles that see any organisation-facing surface at all. */
export const STAFF_ROLES: readonly OrgRole[] = [
  OrgRole.ADVISOR,
  OrgRole.EDUCATOR,
  OrgRole.MANAGER,
  OrgRole.ORGANISATION_ADMIN,
];

export function isStaffRole(role: OrgRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function roleHasPermission(role: OrgRole, permission: OrgPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Human labels for the admin and organisation portals. Kept beside the matrix
 * so a new role can never be added without someone deciding what to call it.
 */
export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  [OrgRole.PARTICIPANT]: "Participant",
  [OrgRole.PARENT]: "Parent",
  [OrgRole.ADVISOR]: "Advisor",
  [OrgRole.EDUCATOR]: "Educator",
  [OrgRole.MANAGER]: "Manager",
  [OrgRole.ORGANISATION_ADMIN]: "Organisation admin",
};

export const ORG_ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  [OrgRole.PARTICIPANT]: "Student, young person or programme participant.",
  [OrgRole.PARENT]: "Parent or guardian of a participant.",
  [OrgRole.ADVISOR]: "Career, employment or NAV advisor. Sees assigned participants.",
  [OrgRole.EDUCATOR]: "Teacher, lecturer or tutor. Sees their own cohorts.",
  [OrgRole.MANAGER]: "Programme owner. Aggregated insight across cohorts.",
  [OrgRole.ORGANISATION_ADMIN]: "Manages people, cohorts, codes and settings.",
};
