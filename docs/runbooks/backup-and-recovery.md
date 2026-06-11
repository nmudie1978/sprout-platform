# Runbook — Database Backup & Recovery

Owner: _<assign before launch>_ · Last reviewed: 2026-06-11

This runbook closes launch-audit operations finding #4: there was no documented
backup/restore procedure, despite a **nightly hard-delete cron** and
`prisma migrate deploy` running automatically on every production build.

> ⚠️ Two items below MUST be verified in the live Supabase project before public
> launch — they are configuration, not code, so they can't be asserted from the
> repo: (1) the PITR window is enabled, (2) a backup is taken before risky
> migrations.

## 1. What we rely on

- **Database:** Supabase (Postgres), EU region. Connection via the Supavisor
  pooler (`aws-1-eu-west-1.pooler.supabase.com:6543`) — see `src/lib/prisma.ts`.
- **Backups:** Supabase automated daily backups + Point-in-Time Recovery (PITR)
  on paid plans. **Verify in Supabase → Database → Backups** which is active and
  the retention window (PITR is typically 7 days on Pro).
- **Health:** `GET /api/health` runs `SELECT 1` (does NOT check Redis — see
  audit #4-5).

## 2. Targets (set + agree before launch)

| Metric | Target |
|--------|--------|
| RPO (max data loss) | ≤ 24h with daily backups; ≤ 5 min with PITR |
| RTO (time to restore) | ≤ 2h |

## 3. Standing risks this runbook guards

1. **Nightly GDPR purge** — `src/app/api/cron/purge-deleted-data/route.ts`
   hard-deletes users past their 30-day soft-delete grace and cascades. A bug or
   bad data could delete more than intended. It is `CRON_SECRET`-gated and
   Sentry-escalates on failure, but there is **no pre-purge snapshot**.
2. **Auto-migrate on deploy** — `scripts/build.mjs` runs `prisma migrate deploy`
   on every production build with no manual gate and no pre-migration snapshot.
   A failing migration can half-apply. (Note: Supabase RLS has historically
   broken `DROP TABLE` migrations — pre-scan `pg_policies` for destructive ones.)

## 4. Before any risky change (destructive migration, bulk data op)

1. Take an on-demand backup: Supabase → Database → Backups → **Backup now**
   (or `pg_dump` via the direct connection to off-site storage).
2. Note the timestamp + the migration/op being run.
3. Run the change. If it fails, go to §5.

## 5. Restore procedure

### 5a. Point-in-Time Recovery (preferred — granular)
1. Supabase → Database → Backups → **Point in Time**.
2. Choose the timestamp **just before** the incident.
3. Restore (this provisions a recovered DB). Confirm the connection string and
   update `DATABASE_URL` / `DIRECT_URL` in Vercel if the host changes.
4. Redeploy / verify `GET /api/health` returns 200 and a smoke login works.

### 5b. Daily backup restore (coarser, ≤24h RPO)
1. Supabase → Database → Backups → choose the most recent good daily backup →
   **Restore**.
2. Same post-restore verification as 5a.

### 5c. Accidental purge of specific users
If the purge cron deleted records it shouldn't have: use PITR (5a) to a point
just before the `0 3 * * *` purge run, export the affected rows, and re-import
them into the live DB (don't wholesale-restore if other writes happened since).

## 6. Post-incident

- Record what happened, the restore point used, and data lost (if any) in the
  incident log.
- If a migration caused it, add a regression guard / fix the migration before
  re-deploying (the build will retry `migrate deploy`).

## 7. Pre-launch checklist

- [ ] Confirm PITR is enabled + note the retention window.
- [ ] Confirm daily automated backups are on.
- [ ] Assign an owner for this runbook + an on-call contact.
- [ ] Verify `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` are set in Vercel prod
      (else error capture is a silent no-op — audit #4-1).
- [ ] Add a heartbeat/alert confirming the nightly purge cron actually ran
      (a wrong `CRON_SECRET` currently 403s invisibly).
- [ ] Dry-run a PITR restore once so the steps above are proven, not theoretical.
