# Industry Insights 90-Day Verify & Refresh System

This document describes the quarterly verification and refresh system for the Industry Insights page.

## Overview

The system ensures all Industry Insights content is verified and refreshed on a configurable schedule (default: 90 days). It intelligently detects when data has changed significantly and regenerates content only when needed, avoiding unnecessary AI calls.

## Architecture

### Prisma Model

```prisma
model IndustryInsightsModule {
  id                  String               @id @default(uuid())
  key                 String               @unique    // e.g., "growing_industries"
  title               String
  description         String?
  contentJson         Json                 // Structured module data
  renderedSummary     String?              @db.Text   // AI-generated summary
  sourceMeta          Json?                // Data sources used
  lastGeneratedAt     DateTime
  lastVerifiedAt      DateTime
  refreshCadenceDays  Int                  @default(90)
  status              InsightsModuleStatus
  changeThreshold     Json                 // Delta thresholds per module
  version             Int                  @default(1)
}
```

### Status Flow

```
ACTIVE → (cadence exceeded) → VERIFY_DUE → (delta detected) → REGENERATING → ACTIVE
                                         ↓
                              (no delta) → ACTIVE (just update lastVerifiedAt)
```

## Module Configuration

Each module has its own refresh cadence and delta thresholds:

| Module Key | Title | Cadence | Delta Logic |
|------------|-------|---------|-------------|
| `growing_industries` | Industry Growth | 90 days | >5% change in growth rates |
| `ai_impact` | AI Impact | 180 days | >10% change in stats |
| `in_demand_skills` | Skills Demand | 90 days | >10% change in demand scores |
| `regional_insights` | Regional Market | 90 days | >5% change in pay ranges |
| `how_to_get_started` | Getting Started | 365 days | Resource URL changes |

## API Endpoints

### GET /api/insights/modules

Fetch all active modules for display. Automatically initializes modules on first load.

**Response:**
```json
{
  "modules": [
    {
      "key": "growing_industries",
      "title": "Industry Growth",
      "content": {...},
      "summary": "...",
      "version": 1,
      "lastUpdated": "2025-01-18T...",
      "verifiedThisQuarter": true
    }
  ],
  "meta": {
    "allVerifiedThisQuarter": true,
    "lastVerification": "2025-01-18T...",
    "totalModules": 5
  }
}
```

### GET /api/insights/refresh

Check which modules need verification. **Admin only.**

**Response:**
```json
{
  "needsVerification": true,
  "modules": [
    {
      "key": "growing_industries",
      "title": "Industry Growth",
      "lastVerifiedAt": "2024-10-15T...",
      "refreshCadenceDays": 90,
      "daysSinceVerified": 95
    }
  ]
}
```

### POST /api/insights/refresh

Trigger the verify and refresh job. Can be called by:
- Admin users (via session)
- Cron jobs (via `x-cron-secret` header)

**Headers (for cron):**
```
x-cron-secret: <CRON_SECRET from env>
```

**Response:**
```json
{
  "success": true,
  "durationMs": 2340,
  "result": {
    "modulesChecked": 5,
    "modulesVerified": 3,
    "modulesRegenerated": 2,
    "errors": []
  }
}
```

## Cron Setup

### Vercel Cron (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/insights/refresh",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

This runs the refresh job at 3 AM UTC every Sunday.

### Environment Variables

```env
# Secret for authenticating cron requests
CRON_SECRET=your-secure-random-string

# OpenAI API key for AI-generated summaries (optional)
OPENAI_API_KEY=sk-...
```

## How Delta Detection Works

Each module type has specific delta logic:

### Industry Growth (`growing_industries`)
- Compares growth percentages
- Threshold: >5% absolute change triggers regeneration
- Example: Tech goes from +23% to +29% (6% delta) → regenerate

### AI Impact (`ai_impact`)
- Compares statistical values
- Threshold: >10% relative change
- Example: "150,000+" to "180,000+" jobs → regenerate

### Skills Demand (`in_demand_skills`)
- Compares demand scores
- Threshold: >10% change in top 5 skills
- Detects new skills entering top rankings

### Regional Insights (`regional_insights`)
- Compares wage ranges and sector lists
- Threshold: >5% wage change or sector additions

### Getting Started (`how_to_get_started`)
- Compares resource URLs and certifications
- Any broken link or new resource → regenerate

## Adding New Modules

1. Add module key to `MODULE_CONFIGS` in `src/lib/insights-refresh.ts`:

```typescript
export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  // ...existing modules
  new_module_key: {
    title: "New Module Title",
    description: "Description for new module",
    defaultCadenceDays: 90,
    defaultThreshold: {
      someMetric: 0.10  // 10% change threshold
    }
  }
};
```

2. Add delta calculation in `calculateDelta()`:

```typescript
case "new_module_key": {
  const oldData = oldContent.someArray || [];
  const newData = newContent.someArray || [];
  // Calculate percentage change
  const delta = calculateSomeChange(oldData, newData);
  return {
    hasSignificantChange: delta > threshold.someMetric,
    changeDetails: { someMetric: delta }
  };
}
```

3. Add data fetching in MockProvider (or implement real data provider):

```typescript
async fetchModuleData(moduleKey: string): Promise<any> {
  switch (moduleKey) {
    case "new_module_key":
      return this.fetchNewModuleData();
    // ...
  }
}
```

## UI Display

The Industry Insights page shows a verification status footer:

- **Green dot + "Updated regularly"**: Always shown
- **Checkmark + "Verified this quarter"**: Shown when all modules have been verified within 90 days

No "outdated" warnings are ever shown to users. The system handles freshness silently in the background.

## Testing

### Manual Testing

1. Run `prisma db push` to apply schema changes
2. Visit `/insights` to trigger module initialization
3. As admin, POST to `/api/insights/refresh` to test refresh

### Simulating Stale Data

In development, you can manually set `lastVerifiedAt` to an older date:

```sql
UPDATE "IndustryInsightsModule"
SET "lastVerifiedAt" = NOW() - INTERVAL '100 days'
WHERE key = 'growing_industries';
```

Then trigger a refresh to test delta detection.

## Future Improvements

1. **Real Data Providers**: Replace MockProvider with actual API integrations (BLS, OECD, etc.)
2. **Admin Dashboard**: Add admin UI to view module status and trigger manual refreshes
3. **Email Alerts**: Notify admins when regeneration fails
4. **A/B Testing**: Test different refresh cadences per module
5. **Regional Customization**: Support different data sets per user region
