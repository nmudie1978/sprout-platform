# RUNBOOK — Phase B: Drop the jobs marketplace

**Migration:** `20260602000000_drop_jobs_marketplace`
**Type:** ⚠️ DESTRUCTIVE — permanently drops 19 tables (with all their rows), 16 enum
types, and the `VaultItem.jobId` column.
**Author context:** Completes the job-poster/marketplace removal started in Phase A
(`20260601000000_drop_employer_role_and_profile`, PR #57).

---

## What it drops

**Tables (19):** `MicroJob`, `Application`, `SavedJob`, `Review`, `Earning`,
`Recommendation`, `Conversation`, `Message`, `PaymentAgreement`,
`ConversationReport`, `JobCompletion`, `StructuredFeedback`, `JobTemplate`,
`StandardJobCategory`, `StandardJobTemplate`, `FavoriteWorker`, `WorkerNote`,
`WorkerCareerSnapshot`, `MessageTemplate`.

**Enums (16):** `JobRiskCategory`, `PaymentMethod`, `PaymentAgreementStatus`,
`JobStatus`, `ApplicationStatus`, `PayType`, `JobCategory`, `EarningStatus`,
`ConversationStatus`, `MessageTemplateDirection`, `MessageIntent`,
`ConversationReportCategory`, `ConversationReportStatus`, `JobCompletionOutcome`,
`SupervisionLevel`, `ResponsibilityLevel`.

**Column:** `VaultItem.jobId` (+ its index and FK).

**Kept** (not marketplace): `Swipe`, `ProQuestion`/`ProAnswer`, `Badge`,
`UserBlock`, `TrustSignal`, `Community`/`CommunityReport`, `Notification`, the
`YouthProfile.completedJobsCount` / `averageRating` / `reliabilityScore` columns
(now unwritten, settling at defaults).

---

## ⚠️ Before you apply — READ THIS

1. **This auto-applies on the next prod deploy.** The prod build runs
   `prisma generate && prisma migrate deploy && …`. The moment this branch merges
   to `main` and Vercel (project **v0-youth-platform** → endeavrly.com) builds,
   `migrate deploy` will run this migration against the production database.
   **So "apply to prod" = "merge + deploy."** Do the backup *first*.

2. **Take a backup first.** From the Supabase dashboard for the prod project:
   *Database → Backups → create an on-demand backup* (or `pg_dump` the prod
   `DATABASE_URL`). There is **no automatic rollback** — recovery = restore backup.

3. **Confirm the target is really prod, and never `prisma migrate reset`.**
   (See memory: "Never reset Prisma against prod.")

---

## Pre-flight: prod-data check (how much data will be destroyed)

Run **read-only** against the prod DB to see the blast radius before deploying.
Use the prod `DATABASE_URL` (the real Supabase project), e.g.:

```bash
psql "$PROD_DATABASE_URL" -c '
  SELECT ''MicroJob'' t, count(*) FROM "MicroJob"
  UNION ALL SELECT ''Application'', count(*) FROM "Application"
  UNION ALL SELECT ''Conversation'', count(*) FROM "Conversation"
  UNION ALL SELECT ''Message'', count(*) FROM "Message"
  UNION ALL SELECT ''JobCompletion'', count(*) FROM "JobCompletion"
  UNION ALL SELECT ''Earning'', count(*) FROM "Earning"
  UNION ALL SELECT ''Review'', count(*) FROM "Review"
  UNION ALL SELECT ''VaultItem w/ jobId'', count(*) FROM "VaultItem" WHERE "jobId" IS NOT NULL;
'
```

If these are all near-zero (expected — the marketplace was never live to real
users), the drop is low-risk. If any table holds real user data you care about,
export it before proceeding.

---

## Applying

### Option A — via deploy (normal path)
Merge this PR to `main`. The prod build runs `prisma migrate deploy`, which
applies this migration and records it in `_prisma_migrations`. Verify after
(below).

### Option B — manual, ahead of deploy
```bash
# Verify you are pointed at PROD and have a backup, THEN:
DATABASE_URL="$PROD_DATABASE_URL" npx prisma migrate deploy
```
`migrate deploy` only applies migrations not yet in `_prisma_migrations`; it is
idempotent and safe to run once.

---

## Verify after applying

```bash
# All dropped tables should be gone (expect 0 rows):
psql "$PROD_DATABASE_URL" -c "
  SELECT tablename FROM pg_tables
  WHERE schemaname='public'
    AND tablename IN ('MicroJob','Application','Conversation','Message','Earning','Review','JobCompletion');
"
# App health: sign in, open /dashboard, /my-journey, /careers, admin analytics.
# Admin analytics/metrics now report 0 for jobs/earnings/applications (by design).
```

---

## Rollback
No forward rollback. To revert: restore the pre-migration backup. (The dropped
data is not recoverable from the app.)
