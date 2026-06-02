# RUNBOOK — Retire shadowing

**Migration:** `20260602000001_retire_shadowing`
**Type:** ⚠️ DESTRUCTIVE — drops `ShadowRequest`, `ShadowReflection` (with their rows)
and the `ShadowRequestStatus` / `ShadowFormat` / `ShadowLearningGoal` enums.
**Stacks on:** `20260602000000_drop_jobs_marketplace` (Phase B).

## Pre-flight (read-only)
```sql
SELECT 'ShadowRequest' t, count(*) FROM "ShadowRequest"
UNION ALL SELECT 'ShadowReflection', count(*) FROM "ShadowReflection";
```
The shadowing feature was hostless/unreachable, so these are expected near-zero.

## Apply
Auto-applies on the next prod deploy via the build's `prisma migrate deploy`
(same path as Phase B). Take a Supabase backup before merging.

## Verify
`SHADOW_*` values remain in the `TimelineEventType` enum on purpose (dropping
enum values is a separate destructive change); nothing produces them anymore.
After deploy: open `/my-journey` — the UNDERSTAND lens now shows 2 steps
(Industry Outlook → Action Plan); `/shadows` 404s.

## Rollback
Restore the pre-migration backup. Dropped data is not recoverable from the app.
