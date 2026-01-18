# Accuracy-First Learning Recommendations

This document describes the verified learning recommendations system that ensures only real, current, and appropriate courses are shown to users.

## Core Principle

**Accuracy is more important than completeness.**

We would rather show no recommendations than show hallucinated, outdated, or inappropriate courses. Trust is paramount for youth users.

## Hard Rules (Non-Negotiable)

1. **Never hallucinate courses, certifications, providers, or URLs**
2. **If verification confidence is not HIGH, exclude the resource**
3. **Return explicit "no results" message when nothing meets quality bar**
4. **Do not fill gaps with placeholders or guesses**

## Data Model

### VerifiedLearningResource

```prisma
model VerifiedLearningResource {
  id                    String
  title                 String                    // Official course name
  provider              String                    // e.g., "Coursera", "Google"
  providerType          LearningProviderType      // UNIVERSITY | PUBLIC_BODY | INDUSTRY_CERT | ONLINE_PLATFORM
  deliveryMode          LearningDeliveryMode      // ONLINE | IN_PERSON | HYBRID
  regionScope           LearningRegionScope       // LOCAL | REGIONAL | INTERNATIONAL
  duration              String                    // e.g., "6 weeks", "Self-paced"
  cost                  String                    // "Free", "Paid", or amount
  certificationType     LearningCertificationType // Type of credential offered
  ageSuitability        String                    // e.g., "16+", "All ages"
  prerequisiteLevel     LearningPrerequisiteLevel // NONE | BASIC | INTERMEDIATE | ADVANCED
  officialUrl           String                    // MUST be real, verified URL
  status                LearningResourceStatus    // VERIFIED | PENDING_VERIFICATION | VERIFICATION_FAILED | ARCHIVED
  lastVerifiedAt        DateTime?                 // When we last confirmed it exists
  relevantCareers       String[]                  // Career paths this supports
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `VERIFIED` | Actively verified as available - can be shown to users |
| `PENDING_VERIFICATION` | Awaiting verification - not shown to users |
| `VERIFICATION_FAILED` | Could not verify - never shown to users |
| `ARCHIVED` | Previously valid, now discontinued |

## Verified Providers Registry

Only courses from these providers can be included:

### Major Online Platforms
- Coursera (coursera.org)
- edX (edx.org)
- LinkedIn Learning (linkedin.com/learning)
- Udemy (udemy.com) - only high-enrollment courses
- FutureLearn (futurelearn.com)
- Khan Academy (khanacademy.org)
- freeCodeCamp (freecodecamp.org)
- Codecademy (codecademy.com)

### Industry Certification Bodies
- Google Career Certificates (grow.google)
- Microsoft Learn (learn.microsoft.com)
- AWS Training (aws.amazon.com/training)
- CompTIA (comptia.org)
- Cisco Networking Academy (netacad.com)
- HubSpot Academy (academy.hubspot.com)
- Meta Blueprint (facebookblueprint.com)

### Norwegian Public Bodies
- NAV (nav.no)
- Utdanning.no (utdanning.no)
- Kompetanse Norge / HK-dir (kompetansenorge.no)

### Universities
Only well-known universities with verifiable course pages.

## URL Validation

All URLs are validated against trusted domains before a resource can be marked as VERIFIED:

```typescript
const trustedDomains = [
  "coursera.org",
  "edx.org",
  "linkedin.com",
  // ... see full list in src/lib/verified-learning.ts
];
```

URLs from unknown domains are automatically rejected.

## Age Suitability

For youth users (16-20), every resource is checked for:

1. **Explicit minimum age requirements**
2. **Academic prerequisites** (e.g., "requires bachelor's degree")
3. **Content appropriateness**

Resources unsuitable for under-18s are either excluded or clearly flagged.

## API Endpoint

### GET /api/learning/recommendations

Returns verified learning recommendations for the authenticated user.

**Query Parameters:**
- `careers`: Comma-separated career goals (optional)
- `includeInternational`: "true" or "false" (default: true)
- `maxResults`: Number (default: 7, max: 10)

**Response (success):**
```json
{
  "success": true,
  "message": "These recommendations are based on verified providers and current offerings.",
  "localRegional": [...],
  "international": [...],
  "totalCount": 5,
  "meta": {
    "verificationNote": "All resources verified within the last 90 days."
  }
}
```

**Response (no results):**
```json
{
  "success": false,
  "message": "No verified courses were found that meet accuracy, age, and relevance requirements at this time.",
  "nextSteps": [
    "Check back later as we regularly verify new courses",
    "Explore foundational skills on Khan Academy or freeCodeCamp",
    "Search Utdanning.no for Norwegian education options"
  ],
  "localRegional": [],
  "international": [],
  "totalCount": 0
}
```

## Verification Process

### 90-Day Re-verification

All resources must be re-verified every 90 days:

1. Resources older than 90 days are marked `PENDING_VERIFICATION`
2. Verification checks:
   - Does the provider still exist?
   - Is the course still offered?
   - Is the URL still valid?
   - Has the content/pricing changed?
3. If verification fails, resource is marked `VERIFICATION_FAILED`

### Manual Verification

```typescript
await updateResourceVerification(
  resourceId,
  true, // or false if verification failed
  "Verified via provider website on 2026-01-18"
);
```

### Automated Stale Detection

```typescript
// Run as scheduled job
const count = await markStaleResourcesForVerification();
console.log(`${count} resources marked for re-verification`);
```

## Adding New Resources

### Validation Before Insert

```typescript
const validation = validateLearningResource({
  title: "Google IT Support Professional Certificate",
  provider: "Coursera",
  officialUrl: "https://www.coursera.org/professional-certificates/google-it-support",
  ageSuitability: "All ages",
});

if (!validation.valid) {
  console.error("Validation failed:", validation.errors);
  // DO NOT INSERT
}
```

### Required Fields

All of these must be populated with real data:
- `title` - Official course name
- `provider` - From verified registry
- `officialUrl` - Validated against trusted domains
- `duration` - Actual duration
- `cost` - Real pricing
- `ageSuitability` - Verified appropriate for youth

### Seeding Data

When adding seed data:
1. Visit the official course page
2. Verify all details are current
3. Set `status: "VERIFIED"` and `lastVerifiedAt: new Date()`
4. Run validation before insert

## UI Behavior

### When Results Exist
- Show "Verified" badge in header
- Display verification note
- Group by Local/Regional vs International
- Show all metadata (duration, cost, delivery mode, certificate type)

### When No Results
- Clear message explaining why
- List of next steps
- Fallback links to trusted general resources (Utdanning.no, NAV)
- **Never show placeholder or made-up courses**

## Maintenance

### Scheduled Jobs

1. **Weekly**: Run `markStaleResourcesForVerification()` to flag old resources
2. **Weekly**: Review `PENDING_VERIFICATION` resources and verify manually
3. **Monthly**: Audit `VERIFICATION_FAILED` resources for potential restoration

### Monitoring

Watch for:
- High rate of verification failures (provider may have changed)
- Zero results for common career paths (need more verified content)
- User feedback about broken links

## Future Improvements

1. **Automated URL checking** - Periodic HEAD requests to verify URLs are still valid
2. **Provider API integrations** - Direct data feeds from Coursera, edX, etc.
3. **User feedback loop** - Allow users to report broken/outdated links
4. **Price monitoring** - Alert when course pricing changes significantly
5. **Regional expansion** - Add more local providers for different markets
