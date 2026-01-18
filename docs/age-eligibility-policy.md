# Age Eligibility Policy System

**SAFETY CRITICAL**: This document describes the age-based job eligibility system that protects youth workers by enforcing minimum age requirements for different job types.

## Overview

The Age Eligibility Policy System ensures that:
- Youth workers only see and can apply for jobs appropriate for their age
- Employers cannot set minimum ages below safe baselines for each job type
- All eligibility decisions are logged for compliance and auditing
- Policy changes are versioned and traceable

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Job Listing │  │ Job Detail  │  │ Apply Button (disabled  │  │
│  │ (filtered)  │  │ (age badge) │  │ if ineligible)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER SIDE (Authoritative)                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ GET /api/jobs   │  │ POST /api/apps  │  │ POST /api/jobs  │  │
│  │ (filter by age) │  │ (age check)     │  │ (enforce floor) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│            │                   │                   │             │
│            └───────────────────┼───────────────────┘             │
│                                │                                 │
│                                ▼                                 │
│                    ┌───────────────────────┐                     │
│                    │  Age Policy Utilities │                     │
│                    │  (Single Source)      │                     │
│                    └───────────────────────┘                     │
│                                │                                 │
│                                ▼                                 │
│                    ┌───────────────────────┐                     │
│                    │    AgePolicy Table    │                     │
│                    │    (Versioned)        │                     │
│                    └───────────────────────┘                     │
│                                │                                 │
│                                ▼                                 │
│                    ┌───────────────────────┐                     │
│                    │ AgeEligibilityAuditLog│                     │
│                    │    (Never deleted)    │                     │
│                    └───────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## Risk Categories

Jobs are classified into three risk categories, each with a baseline minimum age:

| Risk Category | Minimum Age | Examples |
|---------------|-------------|----------|
| `LOW_RISK` | 15+ | Tech help, errands, photography, online tasks |
| `MEDIUM_RISK` | 16+ | Dog walking, snow clearing, cleaning, pet sitting |
| `HIGH_RISK` | 18+ | Babysitting, DIY with tools, home maintenance |

### Category-to-Risk Mapping

Located in `/src/lib/age-policy/category-risk-map.ts`:

```typescript
// HIGH_RISK (18+)
BABYSITTING: 'HIGH_RISK',
DIY_HELP: 'HIGH_RISK',

// MEDIUM_RISK (16+)
DOG_WALKING: 'MEDIUM_RISK',
SNOW_CLEARING: 'MEDIUM_RISK',
CLEANING: 'MEDIUM_RISK',

// LOW_RISK (15+)
TECH_HELP: 'LOW_RISK',
ERRANDS: 'LOW_RISK',
OTHER: 'LOW_RISK',
```

## Database Schema

### AgePolicy Table

Stores versioned policy configurations:

```prisma
model AgePolicy {
  id          String          @id @default(uuid())
  version     Int             @unique  // Monotonically increasing
  status      AgePolicyStatus @default(ACTIVE)
  policyJson  Json            // Risk category -> min age mapping
  description String?
  createdById String?
  createdAt   DateTime
  archivedAt  DateTime?       // When superseded
}
```

Policy JSON format:
```json
{
  "LOW_RISK": { "minAge": 15 },
  "MEDIUM_RISK": { "minAge": 16 },
  "HIGH_RISK": { "minAge": 18 }
}
```

### AgeEligibilityAuditLog Table

Records all eligibility decisions:

```prisma
model AgeEligibilityAuditLog {
  id              String               @id
  workerId        String?              // Who tried to apply
  jobId           String               // Which job
  employerId      String?              // Who posted the job
  action          AgeEligibilityAction // APPLY_BLOCKED, APPLY_ALLOWED, JOB_PUBLISH_ADJUSTED
  reason          String               // Human-readable explanation
  requiredMinAge  Int                  // The job's minimum age
  userAge         Int?                 // Worker's age (null for job publish)
  userAgeBracket  String?              // AGE_15, AGE_16, etc.
  policyVersion   Int                  // For traceability
  createdAt       DateTime
}
```

### MicroJob Age Fields

```prisma
model MicroJob {
  // ... other fields ...
  riskCategory         JobRiskCategory @default(LOW_RISK)
  minimumAge           Int             @default(15)
  requiresAdultPresent Boolean         @default(false)
  agePolicyVersion     Int?            // Policy version at publish
}
```

## Server-Side Enforcement

### Job Creation (POST /api/jobs)

1. Determine risk category from job category
2. Get baseline minimum age from active policy
3. If employer requests lower age, auto-correct to baseline
4. Log adjustment if correction occurred
5. Store `riskCategory`, `minimumAge`, and `agePolicyVersion`

### Application (POST /api/applications)

1. Get user's date of birth (server-side only)
2. Calculate user's age using `computeAgeYears()`
3. Compare to job's `minimumAge`
4. If ineligible: return 403, log `APPLY_BLOCKED`
5. If eligible: proceed, log `APPLY_ALLOWED`

**No bypass paths** - every application must pass this check.

### Job Listing (GET /api/jobs)

For authenticated youth users:
- Filter jobs where `minimumAge <= userAge`
- Show age badge on job cards
- Optionally show ineligible jobs with "locked" indicator

## Client-Side UX

### Job Cards

Display age eligibility clearly:
- Green badge with checkmark: User is eligible
- Red badge with lock: User is ineligible
- Neutral badge: Age unknown

### Apply Button

- Hidden/disabled if user is ineligible
- Shows message: "You must be at least {minAge} to apply"
- CTA: "Show jobs suitable for my age"

### Privacy

**Never send actual DOB to client**. Instead:
- Use `ageBracket` enum (AGE_15, AGE_16, etc.)
- Or `canApplyToMinAge` (max minAge user qualifies for)

## Policy Management

### Viewing Policies (Admin)

```http
GET /api/admin/age-policy
GET /api/admin/age-policy?active=true
```

### Creating New Policy Version

```http
POST /api/admin/age-policy
Content-Type: application/json

{
  "policyJson": {
    "LOW_RISK": { "minAge": 15 },
    "MEDIUM_RISK": { "minAge": 16 },
    "HIGH_RISK": { "minAge": 18 }
  },
  "description": "Updated policy - raised MEDIUM_RISK to 17"
}
```

This will:
1. Archive the current ACTIVE policy
2. Create new version with incremented version number
3. Set new policy as ACTIVE

### Rollback

To rollback, create a new version with the previous policy's JSON.
Never delete old versions - keep audit trail.

## Age Calculation

Single source of truth: `computeAgeYears(dateOfBirth, now)`

```typescript
function computeAgeYears(dateOfBirth: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = now.getMonth() - dateOfBirth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dateOfBirth.getDate())) {
    age--
  }
  return age
}
```

## Testing

Run tests:
```bash
npm test -- src/lib/age-policy/__tests__
```

Key test cases:
- 15-year-old cannot apply to 16+ and 18+ jobs
- 16-17 year-old cannot apply to 18+ jobs
- 18+ can apply to all jobs
- Employer cannot set minAge below baseline (auto-corrected + logged)
- Age calculation handles edge cases (leap years, birthday today, etc.)

## Seeding

Initial policy (v1) is seeded in `prisma/seed-age-policy.ts`:

```bash
npx ts-node prisma/seed-age-policy.ts
```

Or as part of main seed:
```bash
npx prisma db seed
```

## File Locations

| File | Purpose |
|------|---------|
| `src/lib/age-policy/index.ts` | Core utilities and types |
| `src/lib/age-policy/utils.ts` | Extended utilities (filtering, display) |
| `src/lib/age-policy/policy.ts` | Category rules and constraints |
| `src/lib/age-policy/category-risk-map.ts` | Category → Risk mapping |
| `src/lib/age-policy/validation.ts` | Zod schemas |
| `src/app/api/admin/age-policy/route.ts` | Admin policy management |
| `src/lib/age-policy/__tests__/age-policy.test.ts` | Tests |
| `prisma/seed-age-policy.ts` | Initial policy seed |

## Compliance & Audit

All eligibility decisions are logged in `AgeEligibilityAuditLog`:

- **APPLY_BLOCKED**: Worker attempted to apply but was under minimum age
- **APPLY_ALLOWED**: Worker met age requirement and was allowed to apply
- **JOB_PUBLISH_ADJUSTED**: Employer tried to set age below baseline, auto-corrected

Logs include:
- Policy version (for traceability)
- Worker age at time of check (not DOB)
- Reason (human-readable)
- Timestamp

**Never delete audit logs** - they are required for compliance.

## Safety Guarantees

1. **Server-side authoritative**: Client checks are UX only; server enforces
2. **No bypass paths**: Every application goes through age check
3. **Baseline enforcement**: Employers cannot lower age below category baseline
4. **Audit trail**: All decisions logged with policy version
5. **Versioned policy**: Changes traceable, old versions preserved
6. **Privacy**: DOB never sent to client

## Updating the Policy

To change minimum ages:

1. Plan the change and get approval
2. Create new policy version via admin API
3. Old policy is automatically archived
4. All new jobs use new policy version
5. Existing jobs keep their `agePolicyVersion`
6. Monitor audit logs for unexpected blocks

To add a new job category:

1. Add to `CATEGORY_RISK_MAP` in `category-risk-map.ts`
2. Determine appropriate risk level
3. Test with existing policy
4. Deploy
