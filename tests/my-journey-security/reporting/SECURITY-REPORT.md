# My Journey Security Report

**Date**: 2026-03-25
**Scope**: My Journey feature — all API routes, state management, and data flow
**Framework**: Vitest with mocked Prisma and NextAuth
**Tests**: 124 tests across 8 test files

---

## Executive Summary

The My Journey feature has a **solid security foundation**. Authentication and authorization are consistently enforced across all endpoints. User data isolation is strong — all database queries are scoped to the authenticated session user ID, and no user-supplied identifiers are trusted for ownership decisions.

Several concrete vulnerabilities were identified and **remediated during this assessment**:

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | Error message leakage in `/api/journey/complete` | Medium | **FIXED** |
| 2 | Missing YOUTH role check on export/import endpoints | Low | **FIXED** |
| 3 | Goal data POST accepts arbitrary client-supplied journey state | Medium | **FIXED** |
| 4 | Goal data deactivation not wrapped in transaction | Medium | **FIXED** |
| 5 | No server-side URL validation for saved items | Medium | **FIXED** |
| 6 | No server-side HTML sanitization for stored text | Medium | **FIXED** |
| 7 | No input length limits on journey text fields | Low | Open |
| 8 | No rate limiting on journey mutation endpoints | Low | Open |
| 9 | npm audit: 9 vulnerabilities (8 moderate, 1 high) | Varies | Open |

---

## Detailed Findings

### 1. FIXED: Error Message Leakage (Medium)

**Location**: `src/app/api/journey/complete/route.ts` (catch block)

**Before**: The 500 error response included `error.message`, which could leak Prisma error details, database schema information, or internal file paths to the client.

**After**: Returns generic `"Failed to complete journey step"` message. Detailed error is logged server-side only.

**Test**: `api/api-hardening.test.ts` > "REMEDIATED: /api/journey/complete returns generic error in 500"

---

### 2. FIXED: Missing Role Check on Export/Import (Low)

**Location**: `src/app/api/journey/export/route.ts`, `src/app/api/journey/import/route.ts`

**Before**: Only checked `session?.user?.id` — inconsistent with all other journey endpoints that also require `role === 'YOUTH'`.

**After**: Both endpoints now check `session.user.role !== 'YOUTH'`, matching the pattern of all other journey routes.

**Test**: `auth/authentication.test.ts` > "REMEDIATED: Export endpoint now enforces YOUTH role"

---

### 3. FIXED: Goal Data State Forgery (Medium)

**Location**: `src/app/api/journey/goal-data/route.ts` (POST handler)

**Before**: Accepted `journeyState` and `journeyCompletedSteps` directly from the client without validation. A user could forge their goal-scoped journey to any arbitrary state, including non-existent states or impossible completion combinations.

**After**:
- `journeyState` is validated against `JOURNEY_STATES` array; invalid values default to `REFLECT_ON_STRENGTHS`
- `journeyCompletedSteps` is filtered to only include valid state IDs
- Invalid state IDs are silently removed

**Test**: `tampering/journey-integrity.test.ts` > "SECURITY FINDING: Goal data POST accepts client-supplied journey state"

---

### 4. FIXED: Goal Data Race Condition (Medium)

**Location**: `src/app/api/journey/goal-data/route.ts` (POST handler)

**Before**: Goal deactivation (`updateMany`) and goal upsert were separate database operations, creating a race condition window where concurrent requests could leave multiple goals active.

**After**: Both operations wrapped in `prisma.$transaction()` for atomicity.

---

### 5. FIXED: Server-Side URL Validation (Medium)

**Location**: `src/app/api/journey/saved-items/route.ts` (POST handler)

**Before**: URLs were stored without scheme validation. `javascript:`, `data:`, `vbscript:`, and other dangerous URL schemes were accepted and stored. The `safeHref()` function only existed as a client-side rendering guard.

**After**: Server-side URL validation rejects any URL that doesn't use `http:` or `https:` protocol. Invalid URLs return 400.

---

### 6. FIXED: Server-Side HTML Sanitization (Medium)

**Location**: `src/lib/journey/orchestrator.ts` (new `sanitizeStepCompletionData` function)
**Integration**: `src/app/api/journey/complete/route.ts`

**Before**: User-supplied text in step completion data (strengths, career names, reflections, etc.) was stored verbatim. While React auto-escapes on render, this created a stored XSS risk if any component used `dangerouslySetInnerHTML` or if data was consumed by non-React clients.

**After**: All text fields in step completion data are sanitized by stripping HTML tags and null bytes before storage. The `sanitizeStepCompletionData()` function processes all step types.

**Utility**: `src/lib/validation/sanitize.ts` provides reusable `stripHtmlTags`, `sanitizeText`, `sanitizeStringArray`, and `safeUrl` functions.

---

### 7. OPEN: No Input Length Limits on Journey Text Fields (Low)

**Observation**: Most journey text fields (strengths, career names, reflections) have no server-side length limits. The notes endpoint uses Zod with `max(200)` for titles, but step completion data has no maximum length enforcement.

**Risk**: A user could submit extremely large arrays or strings, potentially causing storage bloat or slow queries.

**Recommendation**: Add reasonable maximum lengths to `validateStepCompletionData`. For example: strengths max 100 chars each, arrays max 50 items, reflection text max 5000 chars.

**Priority**: Low — no immediate security impact, more of a robustness concern.

---

### 8. OPEN: No Rate Limiting on Journey Mutation Endpoints (Low)

**Observation**: Job application endpoints have rate limiting, but journey mutation endpoints (complete, skip, reset, goal-data) do not. A client could rapidly fire requests.

**Risk**: Low — operations are scoped to the authenticated user's own data, so abuse only affects their own state.

**Recommendation**: Consider rate limiting `POST /api/journey/complete` and `POST /api/journey/reset` if abuse patterns emerge.

**Priority**: Low — no cross-user impact.

---

### 9. OPEN: Dependency Vulnerabilities (Varies)

**npm audit results**: 9 vulnerabilities (8 moderate, 1 high)
- **High**: Next.js (multiple advisories including DoS, request smuggling)
- **Moderate**: `chevrotain`, `lodash-es`, `langium`, `mermaid` (transitive)

**Risk**: The Next.js vulnerabilities are primarily DoS-related and require specific configurations. The transitive dependencies are in optional charting/diagramming functionality.

**Recommendation**: Monitor for Next.js security patches. Consider upgrading when the major version bump is feasible.

---

## Security Posture Assessment

### Strong Areas

| Area | Assessment |
|------|------------|
| **Authentication** | All 20+ journey endpoints require authenticated session |
| **Role enforcement** | YOUTH role required on all endpoints (after fix) |
| **User isolation** | All DB queries scoped to `session.user.id` — no user-supplied IDs trusted |
| **IDOR protection** | Composite keys (`userId_goalId`) prevent cross-user goal access |
| **State validation** | `JOURNEY_STATES.includes()` check prevents unknown state injection |
| **Step ordering** | Orchestrator enforces sequential progression — can't skip to ACT |
| **Mandatory step protection** | `OPTIONAL_JOURNEY_STATES` array prevents skipping mandatory steps |
| **Note ownership** | `findFirst({ profileId })` verifies note ownership before update/delete |
| **Snapshot ownership** | Snapshot operations require matching `profileId` |
| **SQL injection** | Prisma parameterized queries used throughout — no raw SQL |
| **Prototype pollution** | JSON.parse/stringify cycle prevents `__proto__` pollution |
| **Session strategy** | JWT-based with 30-day expiry and proper signing |

### Verified Attack Scenarios

| Scenario | Result |
|----------|--------|
| A. Unauthenticated access to My Journey routes | **BLOCKED** (401) |
| B. Unauthenticated API calls to save/load | **BLOCKED** (401) |
| C. User A fetches User B's journey | **BLOCKED** (session scoping) |
| D. User A updates User B's journey | **BLOCKED** (session scoping) |
| E. Tamper payload to unlock Understand/Act | **BLOCKED** (orchestrator) |
| F. Forged progress percentage | **BLOCKED** (server-calculated) |
| G. XSS in saved fields | **MITIGATED** (sanitization + React escaping) |
| H. Oversized payload | **ACCEPTED** (no limit — low priority) |
| I. Hidden/readonly field modification | **BLOCKED** (Zod + session scoping) |
| J. Replayed request with altered IDs | **BLOCKED** (session scoping) |
| K. Goal linkage manipulation | **BLOCKED** (composite key with userId) |
| L. Local storage tampering | **NO SERVER IMPACT** (API re-validates) |
| M. Error response internal leakage | **FIXED** (generic messages) |
| N. Dependency vulnerabilities | **DOCUMENTED** (9 issues) |
| O. Corrupted journey state | **HANDLED** (orchestrator normalizes) |

---

## Test Coverage Summary

| Test File | Tests | Category |
|-----------|-------|----------|
| `auth/authentication.test.ts` | 20 | Auth enforcement on all endpoints |
| `authorization/data-isolation.test.ts` | 11 | Cross-user data isolation, IDOR |
| `tampering/journey-integrity.test.ts` | 10 | State forgery, bypass attempts |
| `tampering/client-side.test.ts` | 10 | Replay attacks, prototype pollution |
| `input-validation/injection.test.ts` | 40 | XSS, malformed payloads, unicode |
| `api/api-hardening.test.ts` | 14 | Mass assignment, error leakage |
| `regression/ci-security-gate.test.ts` | 10 | CI regression checks |
| `dependency/dependency-audit.test.ts` | 9 | Deps, secrets, config safety |
| **Total** | **124** | |

---

## Files Modified (Remediations)

| File | Change |
|------|--------|
| `src/app/api/journey/complete/route.ts` | Generic error messages, input sanitization |
| `src/app/api/journey/export/route.ts` | Added YOUTH role check |
| `src/app/api/journey/import/route.ts` | Added YOUTH role check |
| `src/app/api/journey/goal-data/route.ts` | State validation, transaction wrapping |
| `src/app/api/journey/saved-items/route.ts` | Server-side URL scheme validation |
| `src/lib/journey/orchestrator.ts` | Added `sanitizeStepCompletionData()` |
| `src/lib/journey/index.ts` | Export new sanitization function |
| `src/lib/validation/sanitize.ts` | New shared sanitization utilities |

---

## Recommendations for Future Development

1. **When adding new journey endpoints**: Follow the established pattern — `getServerSession` + `role === 'YOUTH'` + `userId: session.user.id` scoping
2. **When rendering user content**: Never use `dangerouslySetInnerHTML`. React auto-escaping is the primary XSS defense. Server-side sanitization is defense-in-depth.
3. **When adding new user text fields**: Use `sanitizeText()` from `src/lib/validation/sanitize.ts`
4. **When accepting URLs from users**: Validate with `safeUrl()` or check protocol at the API level
5. **Error handling**: Always return generic error messages in catch blocks. Log details server-side.
6. **Goal data**: The `journeySummary` JSON blob is still accepted from the client for goal data. Consider server-side summary reconstruction instead of trusting client-supplied summaries.
