# Institutional, Commercial & Access Management

How Endeavrly supports institutional customers alongside direct consumers,
without changing anything about the direct consumer experience.

Status: Phases 1–4 complete, Phase 5 partial. Migration authored, **not yet
applied** — see [Migration](#migration).

---

## 1. The one idea

> Every user has an Endeavrly identity and a personal experience.
> Institutional membership adds organisational context on top.

Concretely, this means the institutional layer is **purely additive**:

- `User`, `YouthProfile` and every journey table are untouched. Not one
  column changed; the migration contains no `DROP` and no `ALTER COLUMN`.
- A user with no organisation and no subscription resolves to
  `PLATFORM_BASELINE_MODULES` — the entire consumer product as it stands.
- Joining an organisation can only ever *add* capabilities. A school with a
  minimal licence cannot take Clarity away from a student who already had it.
- Leaving or being removed from an organisation deletes a membership row and
  nothing else. The personal account, journey and reflections are unaffected.

There is a test for each of those claims in
`src/lib/entitlements/__tests__/resolve.test.ts`.

---

## 2. Data model

Everything new lives at the end of `prisma/schema.prisma` under one banner
comment. Nothing is interleaved with existing models.

```
User ─┬─ YouthProfile                      (existing, untouched)
      ├─ PersonalSubscription  0..1        NEW — tier only, no payments
      ├─ OrganisationMembership 0..n       NEW — the join to institutions
      ├─ AccessCodeRedemption   0..n       NEW
      └─ ParentChildLink        0..n       NEW — consent-gated both ways

Organisation ─┬─ OrganisationSettings   1   privacy/enrolment policy
              ├─ OrganisationDomain    0..n verified email domains
              ├─ OrganisationMembership 0..n
              ├─ Licence               0..n commercial agreements
              ├─ OrgCohort             0..n
              ├─ AccessCode            0..n
              ├─ OrganisationInvitation 0..n
              ├─ AdvisorAssignment     0..n advisor → participant
              └─ OrgAuditLog           0..n

Licence ── LicencePlan  0..1   (a licence carries its OWN module list)
OrgCohort ── OrgCohortMembership ── OrganisationMembership
```

### Decisions worth knowing

**Cohort membership hangs off `OrganisationMembership`, not `User`.** This
makes it structurally impossible to place someone in a cohort of an
organisation they don't belong to.

**A licence copies its modules from the plan, then owns them.** Editing a
plan changes only what *future* licences inherit. A commercial repackaging can
never silently alter what an existing customer bought.

**`EntitlementSourceType` is a TypeScript union, not a database enum.** It is
computed during resolution and never stored, so persisting it would create a
second source of truth that could drift.

**Invitation tokens are stored as SHA-256 hashes.** The raw token exists only
in the recipient's email. A database leak yields nothing replayable. This
mirrors the existing `PasswordResetToken` convention.

**Commercial audit is a separate table from the safeguarding `AuditLog`.** A
GDPR export of a young person's safety record must not sweep up an unrelated
commercial trail, and vice versa.

### Relationship to the existing `Cohort`

The pre-existing `Cohort` / `CohortMembership` pair is **school mode**:
teacher-owned, joined by a 6-character code, with no organisation. It is
untouched and still works.

`OrgCohort` / `OrgCohortMembership` are the organisation-scoped equivalents.
Two models coexist deliberately — merging them would have meant altering a
table the live teacher flow reads and writes.

*Future merge path:* create an `Organisation` of type `SCHOOL` per teacher
cohort, migrate each `CohortMembership` to an `OrganisationMembership` with
role `PARTICIPANT` plus an `OrgCohortMembership`, map the teacher to role
`EDUCATOR`, then retire the old pair. Deferred until school mode has enough
usage to justify the migration.

---

## 3. The Entitlements Engine

`src/lib/entitlements/`

| File | Role |
|---|---|
| `modules.ts` | The capability catalogue, the baseline, and the role ceiling |
| `types.ts` | Plain-data input/output shapes (no Prisma models) |
| `resolve.ts` | **Pure** resolution — the entire rulebook |
| `service.ts` | The only place that loads entitlement inputs from the DB |
| `guard.ts` | What feature code calls |

### Resolution

```
BASELINE  (every signed-in user, always)
    ∪
PERSONAL SUBSCRIPTION   if active and unexpired
    ∪
for each ORGANISATION MEMBERSHIP that is:
      ACTIVE, unexpired, at an ACTIVE/ONBOARDING organisation,
      on a TRIAL/ACTIVE licence that has started and not ended
  →  (licence.enabledModules ∪ accessCode.moduleOverrides)
       ∩ ROLE_PERMITTED_MODULES[role]
    =
EFFECTIVE ENTITLEMENTS
```

**The role intersection is the load-bearing part.** It is why a school buying
`ADVANCED_ANALYTICS` does not hand cohort analytics to its fifteen-year-olds,
and why an access code cannot smuggle a staff module to a participant.

`resolveEntitlements(input, now)` is pure: same input and same instant always
gives the same output. `now` is a parameter rather than a `new Date()` call so
expiry is directly testable and a batch job can resolve many users against one
consistent instant.

### What resolution deliberately does not do

- **Seat limits.** Being over `userLimit` never strips access from users who
  already have it — that would punish young people for a commercial dispute
  between adults. Seats are enforced at *join* time, inside the join
  transaction.
- **Age.** Age is a personalisation signal in this product, never a gate.
- **Data visibility.** What an advisor may *see* is a separate question,
  answered by `lib/organisations/visibility.ts`.

### Caching

Results are held for 60s in a bounded in-process map, with the same reasoning
as the session-field cache in `lib/auth.ts`. Every admin mutation that could
change access calls `invalidateEntitlements` / `invalidateAllEntitlements`.

Tenancy is deliberately **not** cached — a stale grant is a mild commercial
error, a stale membership is a data breach.

### Using it

```ts
// API route
const gate = await requireModule(EntitlementModule.CAREER_TWIN);
if (!gate.ok) return gate.response;

// Server component
const canUse = await userHasModule(userId, EntitlementModule.CAREER_TWIN);
```

Ask about a **capability**, never a plan. There is no supported way to ask
"is this user on Enterprise?" — that is the point.

**Existing features are not gated.** Every shipped surface is in the baseline,
so wrapping them would be a no-op today and a liability tomorrow: a future
edit to the baseline would silently switch off something real users rely on.
Gate new capabilities; leave the existing product alone.

---

## 4. Access control

Three distinct questions, three distinct files. All must pass.

| Question | File |
|---|---|
| Does the licence include this capability? | `entitlements/resolve.ts` |
| May this role perform this action? | `organisations/permissions.ts` |
| May this person see *that* young person's data? | `organisations/visibility.ts` |

### Tenant isolation

`requireOrgAccess(organisationId, permission)` in `organisations/access.ts` is
the single chokepoint. No route handler trusts an `organisationId` from a URL
or body; the guard re-derives the caller's membership from the database on
every request and fails closed.

`withOrgAccess` in `route-helpers.ts` is the only way to obtain an
`OrgAccessContext`, and `tenantScope(context)` is the only sanctioned way to
build an organisation-scoped query — so a cross-tenant read is a visible
mistake rather than a silent one.

Non-membership returns **404, not 403**: a 403 for an organisation id confirms
that organisation exists. Non-members get the same answer either way.

### Roles

| Role | Organisational permissions |
|---|---|
| `PARTICIPANT` | **None.** They are a member, not an administrator. |
| `PARENT` | **None.** |
| `ADVISOR` | List members, view aggregates, view *assigned* individuals |
| `EDUCATOR` | List members, view aggregates, view *own cohort* individuals |
| `MANAGER` | Cohorts, aggregates, export, licence view |
| `ORGANISATION_ADMIN` | Members, invitations, codes, cohorts, settings |

`ORGANISATION_ADMIN` holds no individual-visibility permission at all.
Administering an organisation is not a reason to read a young person's journey.

### Privacy boundary

Individual-level visibility requires **all four** gates to pass:

1. The organisation has switched individual views on (`false` by default).
2. The role is permitted it, and the organisation left that sub-switch on.
3. The relationship exists — assigned advisor, or educator of that cohort.
4. The young person has consented, where the organisation requires consent
   (`true` by default).

Aggregates carry a **k-anonymity floor** (default 5, minimum 3). Below it the
API returns `suppressed: true` and no numbers. Individual buckets below the
floor are dropped, so a long tail of one-person categories can't be read off
a chart.

The analytics endpoint reads only counting tables. It cannot return
reflections, notes or journey text because it never queries them.

---

## 5. Joining

Four routes in, one write path.

```
ACCESS CODE ─┐
INVITATION ──┤
DOMAIN ──────┼─→ joinOrganisation()  ─→ membership + cohort + entitlement invalidation
ADMIN ───────┘        │
                      └─ seat check and membership write share ONE transaction,
                         so two simultaneous joins can't both take the last seat
```

**An existing Endeavrly account is never duplicated.** Joining adds a
membership row and touches nothing else. Re-joining reuses the same row via
the `(userId, organisationId)` unique, so a student who left and came back
doesn't accumulate ghosts — and their data-sharing consent is never silently
reset.

### Access codes

Validation ladder, first failure wins (telling someone which of five rules
they tripped is useful; telling them all five leaks the code's configuration):

`status → expiry → usage limit → already-redeemed → domain rules`

The redemption row is claimed *before* the membership is created — the
`(accessCodeId, userId)` unique is the concurrency guard. If the subsequent
seat check fails, the claim is released so the young person isn't locked out
of a code they never got to use.

Codes can never grant `ORGANISATION_ADMIN`, and their module overrides are
bounded by what the organisation's own licence covers.

### Email domains

A matching verified domain produces an **offer**, never an enrolment.
`AUTO_JOIN` exists but an organisation has to choose it deliberately. Free-mail
domains (`gmail.com`, `outlook.com`, …) cannot be claimed — otherwise a single
school could claim an enrolment offer over a large share of the platform.

---

## 6. Portals

### Internal — `/admin/*`

Reuses the existing Admin Portal session (`endeavrly_admin_session`,
`ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`), already gated in `src/middleware.ts`
and `src/app/admin/layout.tsx`. No second authentication system was
introduced. `requireSuperAdmin()` in `lib/admin/platform-guard.ts` is the
equivalent gate for the API routes, which the page matcher does not cover.

Pages: `/admin/organisations`, `/admin/organisations/[id]` (10 tabs),
`/admin/licence-plans`.

The internal portal surfaces **no participant-level data at all**.

### Organisation — `/organisation/[slug]/*`

A separate top-level route, not part of the youth dashboard, so institutional
complexity never leaks into the young person's experience. Guarded by
`requirePortalAccess` in the layout *and* in each page, so a page added later
can't ship unguarded.

Participants and parents are redirected to `/dashboard` — they have no portal,
by design.

### Consumer — `/join`

The only institutional surface an ordinary user meets, and only if someone
hands them a code. It names the organisation, states plainly what will and
won't be shared, and offers an unticked consent box. Joining works whether or
not they tick it.

For users who do belong to an organisation, a quiet strip appears on the
dashboard. It renders **nothing** for everyone else.

---

## 7. Lifecycle

`/api/cron/licence-lifecycle`, nightly at 02:00 (`vercel.json`, `CRON_SECRET`).

Expires lapsed licences, memberships, invitations and access codes; promotes
converted trials; refreshes denormalised seat counts.

This job is a **tidy-up, not the enforcement point**. `resolveEntitlements`
already refuses an expired licence on every request, so if the job never ran
nobody would retain access they shouldn't. What it does is make the stored
state match reality, so dashboards and seat counts tell the truth.

---

## 8. Migration

`prisma/migrations/20260828120000_institutional_access_management/`

**Not applied.** `DATABASE_URL` in `.env` points at the production Supabase
database, so the SQL was generated by diffing schema files
(`prisma migrate diff`) rather than by touching any database.

Verified additive: **zero** `DROP TABLE`, `DROP COLUMN` or `ALTER COLUMN`
statements. It creates new enums and new tables only.

To apply:

```bash
# 1. Confirm which database you are pointing at. Refuse if it is production
#    and you did not mean it.
echo $DATABASE_URL

# 2. Apply
npx prisma migrate deploy

# 3. Seed the licence plans (idempotent, production-safe)
npm run db:seed-licence-plans
```

Rollback is `DROP TABLE` on the new tables plus `DROP TYPE` on the new enums;
nothing pre-existing is modified, so no data can be lost by reverting.

### Bootstrapping the first organisation

1. Sign in at `/admin/login`.
2. `npm run db:seed-licence-plans` (or create plans in the portal).
3. `/admin/organisations` → **New organisation**.
4. Open it → **Issue licence** → set seats, dates and modules.
5. Set status to `ACTIVE`.
6. Promote its first admin: the only route today is a direct
   `OrganisationMembership` row with role `ORGANISATION_ADMIN` — see
   [Future work](#10-future-work).

---

## 9. Files

**Schema and data**
```
prisma/schema.prisma                                    +~560 lines, additive
prisma/migrations/20260828120000_institutional_.../     525 lines SQL
prisma/seed-licence-plans.ts                            7 plans, idempotent
```

**Entitlements** — `src/lib/entitlements/`
`modules.ts` · `types.ts` · `resolve.ts` · `service.ts` · `guard.ts`
`__tests__/resolve.test.ts` (36) · `__tests__/plan-pricing-parity.test.ts` (9)

**Organisations** — `src/lib/organisations/`
`permissions.ts` · `visibility.ts` · `access.ts` · `access-codes.ts` ·
`invitations.ts` · `domains.ts` · `licences.ts` · `membership-service.ts` ·
`audit.ts` · `validation.ts` · `route-helpers.ts` · `portal-guard.ts`
`__tests__/access-control.test.ts` (83)

**API**
```
/api/admin/platform/overview
/api/admin/platform/organisations            GET POST
/api/admin/platform/organisations/[id]       GET PATCH DELETE
/api/admin/platform/organisations/[id]/licences  GET POST
/api/admin/platform/licences/[id]            PATCH
/api/admin/platform/licence-plans            GET POST
/api/admin/platform/licence-plans/[id]       PATCH
/api/organisations/[id]/members              GET POST
/api/organisations/[id]/members/[mid]        PATCH DELETE
/api/organisations/[id]/invitations          GET POST DELETE
/api/organisations/[id]/cohorts              GET POST
/api/organisations/[id]/cohorts/[cid]        PATCH POST
/api/organisations/[id]/access-codes         GET POST
/api/organisations/[id]/analytics            GET
/api/organisations/[id]/settings             GET PATCH
/api/organisations/[id]/advisors             GET POST
/api/join/access-code                        GET POST
/api/join/invitation                         GET POST
/api/me/entitlements                         GET
/api/me/organisations                        GET PATCH
/api/cron/licence-lifecycle                  GET
```

**UI**
```
src/app/admin/organisations/{page,[id]/page}.tsx
src/app/admin/licence-plans/page.tsx
src/components/admin/{platform-shell,new-organisation-dialog,
                      issue-licence-dialog,module-grid}.tsx
src/app/organisation/[slug]/{layout,page,portal-nav}.tsx
src/app/organisation/[slug]/{people,cohorts,access,analytics,settings}/
src/app/join/{page,join-client}.tsx
src/components/organisations/organisation-context.tsx
```

**Modified (3 files, all additive)**
```
prisma/schema.prisma                     new block + 5 User back-relations
vercel.json                              one cron entry
package.json                             one script
src/app/(dashboard)/dashboard/page.tsx   one import + one component
```

---

## 10. Future work

**Not built, deliberately.**

1. **Promote the first organisation admin from the portal.** Today it needs a
   direct database row. A "grant admin" action on the organisation page is the
   obvious next step and the most-felt gap.
2. **Send invitation emails.** Tokens are generated and links are returned to
   the admin to copy. Wiring `lib/mail.ts` is small; it was left out because
   deliverability for bulk institutional sends needs its own decision.
3. **Domain verification.** The `verificationToken` column and
   `domainVerificationRecord()` exist; the DNS TXT check does not.
4. **Registration-time domain offer.** `matchEmailToOrganisation` is written
   and tested but not yet called from `/api/auth/signup` — that touches the
   live signup path and deserves its own change.
5. **Parent portal.** `ParentChildLink` and the `PARENT_PORTAL` module exist;
   no parent-facing UI was built.
6. **Phase 5 completion.** Renewal workflows, contract documents, churn
   analytics. The data model carries the fields.
7. **Phase 6.** SSO, public API, integrations. `API_ACCESS` and
   `CUSTOM_INTEGRATIONS` are registered so a licence can already be sold with
   them; nothing consumes them yet. These are substantial security surfaces
   and should be designed on their own, not bolted on.
8. **Merge school mode into organisations** — see §2.
