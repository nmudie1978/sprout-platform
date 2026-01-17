# Community Guardian Feature

## Overview

The Community Guardian feature provides an optional, community-level moderation layer that enables trusted adults to help moderate local job postings and user activity without accessing private data. This feature is designed to enhance safety while maintaining user privacy.

## Key Principles

- **Privacy First**: Guardians cannot access private messages or sensitive personal data
- **Community Scoped**: Each guardian is assigned to a specific community
- **Optional**: Communities can operate without guardians - reports still work
- **Soft Freeze**: Paused jobs/users aren't deleted, just hidden
- **Audit Trail**: All guardian actions are logged for compliance

## Feature Components

### 1. Community Reports

Users can report job posts or other users for various reasons:
- Inappropriate Content
- Suspected Scam
- Safety Concern
- Harassment
- Spam
- Underpayment (below legal minimum)
- Other

**Report Flow:**
1. User clicks "Report" button on job or profile
2. Selects reason and optionally adds details
3. Report is created and assigned to the appropriate community
4. If community has a guardian, they are notified
5. If no guardian, report goes to platform admin queue

### 2. Guardian Dashboard (`/guardian`)

The guardian dashboard provides:
- **Overview Stats**: Open reports, under review, total jobs, paused items
- **Reports Tab**: List of reports with claim/view actions
- **Job Posts Tab**: All jobs in the community with pause status

### 3. Report Actions

Guardians can take the following actions on reports:
- **Claim**: Assign the report to themselves for review
- **Add Note**: Add internal notes about the investigation
- **Pause Target**: Temporarily hide a job post or restrict a user
- **Escalate**: Flag for admin review (serious violations)
- **Resolve/Dismiss**: Close the report with appropriate status

### 4. Guardian Capabilities

| Can Do | Cannot Do |
|--------|-----------|
| View job posts in their community | Access private messages |
| View reports assigned to them | See user financial data |
| Pause/unpause job posts | Delete content permanently |
| Pause users (soft freeze) | Override admin decisions |
| Add notes to reports | Access data outside their community |
| Escalate to admin | View sensitive personal information |

## Database Schema

### New Models

```prisma
model Community {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  location    String?
  isActive    Boolean  @default(true)
  guardians   CommunityGuardian[]
  reports     CommunityReport[]
  jobs        MicroJob[]
}

model CommunityGuardian {
  id              String   @id @default(cuid())
  communityId     String
  guardianUserId  String
  isActive        Boolean  @default(true)
  assignedAt      DateTime @default(now())
  deactivatedAt   DateTime?
  community       Community
  guardian        User
}

model CommunityReport {
  id                      String
  communityId             String
  reporterUserId          String
  targetType              CommunityReportTargetType
  targetId                String
  reason                  String
  details                 String?
  status                  CommunityReportStatus
  assignedGuardianUserId  String?
  guardianNote            String?
  escalatedToAdmin        Boolean
  actionTaken             String?
  actionTakenAt           DateTime?
}
```

### Modified Models

**User Model:**
- Added `isPaused`, `pausedAt`, `pausedReason`, `pausedById` fields

**MicroJob Model:**
- Added `isPaused`, `pausedAt`, `pausedReason`, `pausedById` fields
- Added `communityId` relation

## API Endpoints

### Community Reports
- `POST /api/community-reports` - Create a new report
- `GET /api/community-reports` - List reports (guardian/admin)
- `GET /api/community-reports/[id]` - Get report details
- `PATCH /api/community-reports/[id]` - Take action on report

### Guardian
- `GET /api/guardian` - Get guardian overview/assignment info
- `GET /api/guardian/posts` - Get job posts in guardian's community

### Admin (Community Management)
- `GET /api/admin/communities` - List all communities
- `POST /api/admin/communities` - Create a new community
- `GET /api/admin/communities/[id]/guardian` - Get guardian for community
- `POST /api/admin/communities/[id]/guardian` - Assign guardian
- `DELETE /api/admin/communities/[id]/guardian` - Remove guardian

## UI Components

### ReportModal
A dialog component for submitting reports:
```tsx
<ReportModal
  targetType="JOB_POST" | "USER"
  targetId={id}
  targetName={name}
/>
```

### GuardianBadge
Badge component showing guardian status:
```tsx
<GuardianBadge communityName="Oslo" size="md" />
```

### CommunityGuardedBadge
Badge showing a job is in a guarded community:
```tsx
<CommunityGuardedBadge
  communityName="Oslo"
  guardianName="John Doe"
/>
```

### PausedBadge
Badge indicating paused status:
```tsx
<PausedBadge reason="Under review" />
```

## Row Level Security (RLS)

The feature includes Supabase RLS policies to ensure:

1. **Community table**: Readable by all, writable by admins only
2. **CommunityGuardian table**: Readable by admins/guardians, writable by admins
3. **CommunityReport table**:
   - Reporters can see their own reports
   - Guardians can see reports in their community
   - Admins can see all reports

## Audit Logging

Guardian actions are logged with these audit types:
- `GUARDIAN_ASSIGNED`
- `GUARDIAN_DEACTIVATED`
- `REPORT_CLAIMED`
- `REPORT_ESCALATED`
- `JOB_PAUSED`
- `JOB_UNPAUSED`
- `USER_PAUSED`
- `USER_UNPAUSED`

## Navigation Integration

- Guardians see a "Guardian" link in the navigation bar
- This link only appears when the user has guardian privileges
- Users with the `COMMUNITY_GUARDIAN` role get a dedicated navigation set

## Best Practices

### For Guardians
1. Claim reports before investigating
2. Add notes to document your investigation
3. Use pause sparingly - it's a soft action
4. Escalate serious violations to admin
5. Resolve reports with appropriate status

### For Admins
1. Create communities before assigning guardians
2. Verify guardian candidates before assignment
3. Review escalated reports promptly
4. Deactivate guardians who violate policies

## Testing

To test the feature:
1. Create a community via admin API
2. Assign a user as guardian
3. Create a job post in that community
4. Submit a report as another user
5. Log in as guardian and process the report

## Security Considerations

- All guardian actions require server-side permission checks
- Community scope is enforced at the API level
- Guardians cannot elevate their own privileges
- Sensitive data is excluded from guardian queries
