-- Performance — compound indexes for hot-path queries
--
-- Cohort dashboard: teacher filters by (teacherId, deletedAt IS NULL)
--   → the two single-column indexes above force a scan + merge.
-- CohortMembership: youth lists own classes ordered by joinedAt DESC
--   → the youthId-only index works but the compound with joinedAt
--     avoids a separate sort step.
-- MicroJob: the youth-facing /api/jobs GET runs with WHERE status =
--   'POSTED' AND minimumAge <= userAge on every page load. The
--   existing (status, category) covers one combination but not the
--   bare age filter; (status, minimumAge) closes that gap.
--
-- CREATE INDEX IF NOT EXISTS keeps the migration idempotent for the
-- rare case the index already exists in an ad-hoc environment.

CREATE INDEX IF NOT EXISTS "Cohort_teacherId_deletedAt_idx"
  ON "Cohort" ("teacherId", "deletedAt");

CREATE INDEX IF NOT EXISTS "CohortMembership_youthId_joinedAt_idx"
  ON "CohortMembership" ("youthId", "joinedAt");

CREATE INDEX IF NOT EXISTS "MicroJob_status_minimumAge_idx"
  ON "MicroJob" ("status", "minimumAge");
