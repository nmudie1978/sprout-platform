# Industry Insights - Tier-1 Source Enforcement

## Overview

All Industry Insights content must be derived from, summarised from, or inspired by **Tier-1 sources only**.

## Allowed Sources (Tier-1)

| Source | ID | Use Cases |
|--------|-----|-----------|
| Visual Capitalist | `visual_capitalist` | Macro trends, rankings, visual explanations |
| World Economic Forum | `world_economic_forum` | Future of Jobs, skills demand, AI impact |
| McKinsey & Company | `mckinsey` | Technology research, AI, workforce transformation |

## Explicitly Disallowed Sources

- TechCrunch, Medium, HackerNews, Reddit
- Twitter/X, LinkedIn, YouTube
- BLS.gov, Bureau of Labor Statistics
- NAV, NHO, Abelia, SSB, Virke (Norwegian sources)
- EIA.gov, IRENA
- Adobe, Skillshare
- IKT-Norge, Kreativt Forum
- Any blog or newsletter

## Enforcement Locations

### 1. Source Definition & Validation
**File:** `/src/lib/industry-insights/tier1-sources.ts`

Contains:
- `TIER1_SOURCES` enum with allowed source IDs
- `DISALLOWED_SOURCES` list for explicit blocking
- `isTier1Source()` - validates a source ID
- `isValidTier1Url()` - validates URLs against Tier-1 domains
- `validateSourceMeta()` - comprehensive validation for module creation
- `checkContentTone()` - detects hype language with suggested replacements

### 2. Data Provider
**File:** `/src/lib/insights-refresh.ts`

- `Tier1Provider` class - only returns data with Tier-1 source metadata
- `validateSourceBeforeSave()` - called before any database write
- `getDataProvider()` - always returns Tier1Provider (env var ignored for security)
- `verifyAndRefreshIndustryInsights()` - validates source before regenerating modules
- `initializeInsightsModules()` - validates source before creating new modules

### 3. API Routes
**File:** `/src/app/api/insights/modules/route.ts`

- GET response includes `source` object with Tier-1 attribution
- Response meta includes `tier1Sources` list and `sourcePolicy` statement
- POST (admin refresh) delegates to library functions with validation

**File:** `/src/app/api/insights/refresh/route.ts`

- Calls `verifyAndRefreshIndustryInsights()` which has built-in validation

### 4. UI Layer
**File:** `/src/app/(dashboard)/insights/page.tsx`

- All hardcoded data uses only Tier-1 source citations
- "About the Data" section lists only Tier-1 sources
- Industry cards link to WEF/McKinsey articles only
- Skills data attributed to WEF Future of Jobs Report
- AI Impact data attributed to WEF and McKinsey

### 5. Database Schema
**File:** `/prisma/schema.prisma`

- `IndustryInsightsModule.sourceMeta` stores source attribution as JSON
- JSON structure includes `sourceId` which must be a Tier-1 source

## Content Guidelines

1. **No Hype Language**: Avoid words like "exploding", "game-changing", "must-learn"
2. **Neutral Tone**: Use "growing", "in demand", "notable" instead of sensational terms
3. **Youth Appropriate**: Content should be explanatory, not promotional
4. **Proper Attribution**: Every module must include source attribution

## Adding New Sources

To add a new Tier-1 source:

1. Add to `TIER1_SOURCES` enum in `tier1-sources.ts`
2. Add metadata to `TIER1_SOURCE_METADATA` object
3. Update `isValidTier1Url()` to recognize the new domain
4. Update this documentation

**Important**: New sources must be authoritative, globally recognized institutions. Do not add:
- News outlets
- Social media platforms
- Corporate blogs
- Local/regional government statistics
- Industry newsletters
