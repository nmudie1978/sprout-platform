# Safety Invariants

**THIS DOCUMENT IS THE PRODUCT CONSTITUTION**

These safety invariants are NON-NEGOTIABLE. Any changes to these rules require explicit review and documentation of the reasoning.

---

## A) Age Band Policy

Sprout is designed for young people aged **16-20**.

### Age Bands

| Age Band | Code | Access Level |
|----------|------|--------------|
| Under 16 | `UNDER_16` | **HARD BLOCKED** - Cannot use platform |
| 16-17 | `AGE_16_17` | Access with minor-safe defaults |
| 18-20 | `AGE_18_20` | Full access (target audience) |
| Over 20 | `OVER_20` | Allowed (outside target range) |
| Unknown | `UNKNOWN` | Blocked until age verified |

### Implementation

```typescript
// Source: /src/lib/safety/age.ts
export const PLATFORM_MIN_AGE = 16;
export const PLATFORM_MAX_AGE = 20;
export const ADULT_AGE = 18;
```

### Enforcement Points

1. **Signup** (`/api/auth/signup`): Server-side validation blocks under-16
2. **Middleware** (`/src/middleware.ts`): Routes sensitive actions through consent checks
3. **API Routes**: Use `checkPlatformAccess()` for all protected endpoints
4. **Page Components**: Verify access server-side before rendering

---

## B) Under-16 Handling (MVP)

**DECISION: HARD BLOCK**

Users under 16 cannot create accounts or use the platform.

### Rationale
- Simplest, safest MVP approach
- Aligns with Norwegian labor law for most job categories
- No complex guardian consent flows needed initially

### User Experience
- Clear error message during signup: "Sprout is for users aged 16-20"
- Redirect to `/not-eligible` page with friendly messaging
- Encourage user to return when they turn 16

### Code
```typescript
// /src/app/api/auth/signup/route.ts
if (age < PLATFORM_MIN_AGE) {
  return NextResponse.json({
    error: `Sprout is for users aged ${PLATFORM_MIN_AGE}-${PLATFORM_MAX_AGE}.`
  }, { status: 400 });
}
```

---

## C) Guardian Consent (16-17 Year Olds)

Users aged 16-17 require guardian consent for sensitive actions.

### Sensitive Actions
- Applying to jobs
- Sending/receiving messages
- Sharing contact information

### Implementation
```typescript
// Check consent status
const access = await checkPlatformAccess(userId, true); // true = sensitive action
if (!access.allowed) {
  // Redirect to guardian consent flow
}
```

### Guardian Consent Flow
1. User enters guardian's email
2. System sends verification email with secure token
3. Guardian clicks link to verify
4. User can now perform sensitive actions

### Database Fields
```prisma
model YouthProfile {
  guardianEmail      String?
  guardianConsent    Boolean  @default(false)
  guardianConsentAt  DateTime?
  guardianToken      String?  @unique
}
```

---

## D) Minor-Safe Defaults (16-17)

For users aged 16-17:

### Messaging Protections
- Block sharing of personal contact details (phone, email, address)
- Warning prompts for off-platform requests
- All conversations logged for safety review

### UI Protections
- Report button prominently visible
- Block user option easily accessible
- Safety tips displayed in messaging UI

### Job Restrictions
- Risk-based job filtering (see Age Safety System)
- HIGH_RISK jobs (18+) hidden from feed
- MEDIUM_RISK jobs available with appropriate warnings

---

## E) Employer Requirements

### Age Verification
- Employers MUST be 18+ to post jobs
- Age verified via DOB input (BankID optional)
- `EmployerProfile.ageVerified` must be `true` to post

### Adult Verification (for contacting youth)
- BankID verification recommended
- Required in production environment
- `User.isVerifiedAdult` checked before messaging youth

---

## F) Audit & Compliance

### What We Log
- All age eligibility decisions
- Guardian consent requests/approvals
- Account status changes
- Blocked actions with reasons

### Database
```prisma
model AgeEligibilityAuditLog {
  action         AgeEligibilityAction
  reason         String
  requiredMinAge Int
  userAge        Int?
  policyVersion  Int
}
```

---

## G) Landing Page Claims

**CRITICAL: Marketing claims MUST match implementation**

Current claims on landing page:
- "Guardian Consent" - **TRUE** (for 16-17 year olds)
- "Verified Posters" - **TRUE** (age verification required)
- "Ages 16-20" - **TRUE** (platform target audience)

If implementation changes, landing page MUST be updated to match.

---

## H) Canonical Source Files

| File | Purpose |
|------|---------|
| `/src/lib/safety/age.ts` | Age calculation, bands, access checks |
| `/src/lib/safety.ts` | Safety gates, consent checks |
| `/src/lib/age-policy/` | Job-specific age rules |
| `/src/middleware.ts` | Route protection |
| `/src/app/api/auth/signup/route.ts` | Signup validation |

---

## I) Future Changes

Any changes to these invariants MUST:
1. Be documented with clear reasoning
2. Update this document
3. Update landing page claims
4. Run full regression testing
5. Be reviewed by product owner

**DO NOT** modify safety invariants without explicit authorization.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-19 | Initial safety invariants - 16+ minimum age |

---

*Last updated: January 2026*
