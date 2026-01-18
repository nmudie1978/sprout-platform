# Age Safety System

This document describes the comprehensive age safety system that protects youth workers on the platform through server-side enforcement, age-based job filtering, and optional parent/guardian visibility.

## Overview

The age safety system ensures that:
1. Youth workers only see jobs appropriate for their age
2. Employers cannot set minimum ages below safe baselines
3. All age-related decisions are logged for compliance
4. Parents/guardians can optionally monitor their children's activity

## Core Principles

- **Server-side enforcement**: All age checks happen on the server. Client-side checks are for UX only.
- **Never expose DOB**: Date of birth is never sent to the client. Use age brackets instead.
- **Employers can raise, never lower**: Minimum age can be increased but never below the risk-based baseline.
- **Audit everything**: All eligibility decisions are logged for compliance and accountability.

## Data Model

### Risk Categories and Minimum Ages

| Risk Category | Minimum Age | Example Jobs |
|---------------|-------------|--------------|
| LOW_RISK | 15 | Tech help, errands, light pet care |
| MEDIUM_RISK | 16 | Dog walking, cleaning, snow clearing |
| HIGH_RISK | 18 | Power tools, chemicals, night work |

### Key Models

```prisma
// On MicroJob
riskCategory         JobRiskCategory @default(LOW_RISK)
minimumAge           Int             @default(15)
requiresAdultPresent Boolean         @default(false)
agePolicyVersion     Int?

// AgePolicy - Versioned policy storage
model AgePolicy {
  id         String          @id
  version    Int             @unique
  status     AgePolicyStatus // ACTIVE or ARCHIVED
  policyJson Json            // Policy rules as JSON
}

// AgeEligibilityAuditLog - Compliance logging
model AgeEligibilityAuditLog {
  id             String              @id
  workerId       String?
  jobId          String?
  action         AgeEligibilityAction
  reason         String
  requiredMinAge Int
  userAgeYears   Int?
  policyVersion  Int
  createdAt      DateTime
}
```

### Category → Risk Mapping

```typescript
// From src/lib/age-policy/policy.ts
const CATEGORY_RULES = [
  // LOW_RISK (15+)
  { category: "DOG_WALKING", riskCategory: "LOW_RISK", baselineMinAge: 15 },
  { category: "BABYSITTING", riskCategory: "LOW_RISK", baselineMinAge: 15 },
  { category: "TECH_HELP", riskCategory: "LOW_RISK", baselineMinAge: 15 },
  { category: "ERRANDS", riskCategory: "LOW_RISK", baselineMinAge: 15 },
  { category: "OTHER", riskCategory: "LOW_RISK", baselineMinAge: 15 },

  // MEDIUM_RISK (16+)
  { category: "CLEANING", riskCategory: "MEDIUM_RISK", baselineMinAge: 16 },
  { category: "SNOW_CLEARING", riskCategory: "MEDIUM_RISK", baselineMinAge: 16 },
  { category: "DIY_HELP", riskCategory: "MEDIUM_RISK", baselineMinAge: 16 },
];
```

## Enforcement Points

### 1. Job Publishing (Employer)

When an employer creates a job:

```typescript
// From src/app/api/jobs/route.ts
const agePolicyResult = applyAgePolicyToJob({
  category: validatedData.category,
  requestedMinAge,                    // Employer's requested minimum age
  requestedRequiresAdult: body.requiresAdultPresent,
});

// Result includes:
// - riskCategory: Derived from category
// - minimumAge: Max of (requested, baseline)
// - requiresAdultPresent: From employer or default
// - agePolicyVersion: Current policy version
// - wasMinAgeAdjusted: true if baseline was enforced
```

If the employer requests a minimum age below the baseline, it's automatically adjusted and logged:

```typescript
if (agePolicyResult.wasMinAgeAdjusted) {
  await logAgeEligibilityEvent({
    jobId: job.id,
    action: "JOB_PUBLISH_ADJUSTED",
    reason: `Employer requested ${requestedMinAge}, adjusted to ${minimumAge}`,
    requiredMinAge: minimumAge,
  });
}
```

### 2. Job Visibility (Worker)

When fetching jobs, age filtering is applied server-side:

```typescript
// From src/app/api/jobs/route.ts
if (session?.user?.role === "YOUTH" && session.user.id) {
  userAge = await getUserAge(session.user.id);

  if (userAge !== null) {
    // Only show jobs where minimumAge <= userAge
    const ageFilter = buildAgeEligibilityFilter(userAge, includeIneligible);
    Object.assign(where, ageFilter);
  }
}
```

The `includeIneligible` param allows showing "Next" jobs (future opportunities).

### 3. Job Application (Worker)

Before an application is created:

```typescript
// From src/app/api/applications/route.ts
const ageCheck = await canApplyToJob(session.user.id, validatedData.jobId);

if (!ageCheck.allowed) {
  // Log blocked attempt
  await logAgeEligibilityEvent({
    workerId: session.user.id,
    jobId: validatedData.jobId,
    action: "APPLY_BLOCKED",
    reason: ageCheck.reason,
    requiredMinAge: ageCheck.requiredAge,
    userAgeYears: ageCheck.userAge,
  });

  return { error: ageCheck.reason, code: "AGE_INELIGIBLE" };
}

// Log successful check
await logAgeEligibilityEvent({
  action: "APPLY_ALLOWED",
  reason: "Age eligibility check passed",
  ...
});
```

## Now/Next Recommendations

The system provides age-based job recommendations:

- **Now**: Jobs the user can apply for today
- **Next**: Preview of jobs that unlock at the next age threshold

### API Endpoint

```
GET /api/jobs/recommendations/age-based
```

Query params:
- `nowLimit`: Max "now" jobs (default: 6, max: 20)
- `nextLimit`: Max "next" preview jobs (default: 3, max: 10)
- `category`: Optional category filter

Response:
```json
{
  "success": true,
  "userAge": 16,
  "now": {
    "jobs": [...],
    "totalCount": 42,
    "message": "42 jobs available for you right now"
  },
  "next": {
    "ageThreshold": 18,
    "jobs": [...],
    "totalCount": 15,
    "message": "15 more jobs unlock when you turn 18",
    "preparationTips": [
      "Gain experience in your current age bracket",
      "Build your profile with completed jobs",
      "Collect positive reviews from employers"
    ]
  }
}
```

## Parent/Guardian Visibility Layer

Parents and guardians can optionally link with their youth workers to monitor activity.

### Key Features

- **Opt-in**: Youth worker must approve the link
- **Configurable scope**: Youth controls what guardian can see
- **No content access by default**: Guardians see metadata, not message content

### Linking Process

1. **Youth generates invite code**:
   ```
   POST /api/parent-guardian/link
   { "generateInvite": true }
   ```
   Returns: `{ "inviteCode": "ABC12345", "expiresAt": "..." }`

2. **Guardian claims code**:
   ```
   POST /api/parent-guardian/link/claim
   { "inviteCode": "ABC12345" }
   ```

3. **Link becomes active** - no approval needed since youth initiated

Alternatively, a guardian can request to link directly (requires youth approval).

### Visibility Scope

```json
{
  "canSeeApplications": true,
  "canSeeSavedJobs": true,
  "canSeeMessagesMeta": true,
  "canSeeMessageContent": false,
  "canSeeProfileBasics": true
}
```

### Activity Snapshot

```
GET /api/parent-guardian/snapshot
```

Returns aggregated activity for all linked youth:
- Profile basics (jobs completed, rating, earnings)
- Recent applications with job details
- Saved jobs
- Message counts (not content)

## API Reference

### Age Policy Utilities

```typescript
import {
  computeAgeYears,
  deriveAgeBracket,
  canApplyToJob,
  buildAgeEligibilityFilter,
  applyAgePolicyToJob,
  logAgeEligibilityEvent,
  getUnlockMessage,
} from "@/lib/age-policy";
```

### Parent/Guardian APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/parent-guardian/profile` | GET | Get guardian profile |
| `/api/parent-guardian/profile` | POST | Create guardian profile |
| `/api/parent-guardian/profile` | PUT | Update guardian profile |
| `/api/parent-guardian/link` | GET | Get link requests |
| `/api/parent-guardian/link` | POST | Create link request or invite |
| `/api/parent-guardian/link/[id]` | PUT | Accept/reject/update link |
| `/api/parent-guardian/link/[id]` | DELETE | Revoke link |
| `/api/parent-guardian/link/claim` | POST | Claim invite code |
| `/api/parent-guardian/snapshot` | GET | Get activity snapshot |

## Audit Logging

All age-related decisions are logged to `AgeEligibilityAuditLog`:

| Action | Description |
|--------|-------------|
| `VISIBILITY_HIDDEN` | Job hidden from user due to age |
| `VISIBILITY_SHOWN` | Job visible to user |
| `APPLY_BLOCKED` | Application rejected due to age |
| `APPLY_ALLOWED` | Application age check passed |
| `JOB_PUBLISH_ADJUSTED` | Minimum age auto-corrected to baseline |

## Policy Versioning

The system supports versioned policies for future changes:

1. Current policy is `ACTIVE`
2. New policy is created as `ACTIVE`, old becomes `ARCHIVED`
3. Jobs store `agePolicyVersion` at publish time
4. Audit logs reference policy version for compliance

## Security Considerations

1. **Never trust client**: Age checks are duplicated server-side
2. **DOB protection**: Only age brackets sent to client
3. **Audit trail**: All decisions logged with context
4. **Baseline enforcement**: System prevents unsafe minimums
5. **Guardian scope limits**: No message content by default

## Future Enhancements

1. **Policy admin UI**: Allow admins to update policy rules
2. **Granular categories**: More detailed sub-categories
3. **Guardian alerts**: Notifications for concerning activity
4. **Age verification**: Integration with eID for age verification
5. **Regional policies**: Support different rules by region
