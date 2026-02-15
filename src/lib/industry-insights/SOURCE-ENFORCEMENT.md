# Industry Insights - Source Enforcement

## Overview

All Industry Insights content must be derived from, summarised from, or inspired by **approved sources only** (Tier-1 or Tier-2).

## Tier-1 Sources (Global Research & Consulting)

| Source | ID | Use Cases |
|--------|-----|-----------|
| Visual Capitalist | `visual_capitalist` | Macro trends, rankings, visual explanations |
| World Economic Forum | `world_economic_forum` | Future of Jobs, skills demand, AI impact |
| McKinsey & Company | `mckinsey` | Technology research, AI, workforce transformation |
| OECD | `oecd` | Employment statistics, education outcomes |
| World Bank | `world_bank` | Global economic trends, development indicators |
| WHO | `who` | Healthcare workforce, health sector employment |
| ILO | `ilo` | Labour market trends, youth employment |
| UNESCO | `unesco` | Education trends, skills for the future |
| BCG | `bcg` | Workforce strategy, industry trends |
| Deloitte | `deloitte` | Workforce trends, skills analysis |

## Tier-2 Sources (Industry Specialists & Labor Market)

| Source | ID | Use Cases |
|--------|-----|-----------|
| Accenture | `accenture` | Digital transformation, telecom, technology innovations |
| FierceWireless | `fierce_wireless` | Wireless technology, telecom industry analysis |
| TelecomTV | `telecom_tv` | Global telecom news, service provider insights |
| Network World | `network_world` | Networking, telecom, IT infrastructure |
| Glassdoor | `glassdoor` | Labor market trends, hiring trends, salary benchmarks |

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
- `TIER1_SOURCES` enum with Tier-1 source IDs
- `TIER2_SOURCES` enum with Tier-2 source IDs
- `ALL_APPROVED_SOURCE_METADATA` combined metadata lookup
- `DISALLOWED_SOURCES` list for explicit blocking
- `isTier1Source()` - validates a Tier-1 source ID
- `isTier2Source()` - validates a Tier-2 source ID
- `isApprovedSource()` - validates any approved source ID
- `isValidApprovedUrl()` - validates URLs against approved domains
- `validateSourceMeta()` - comprehensive validation for module creation
- `checkContentTone()` - detects hype language with suggested replacements

### 2. Data Provider
**File:** `/src/lib/insights-refresh.ts`

- `Tier1Provider` class - returns data with approved source metadata
- `validateSourceBeforeSave()` - called before any database write
- `getDataProvider()` - always returns Tier1Provider (env var ignored for security)
- `verifyAndRefreshIndustryInsights()` - validates source before regenerating modules
- `initializeInsightsModules()` - validates source before creating new modules

### 3. API Routes
**File:** `/src/app/api/insights/modules/route.ts`

- GET response includes `source` object with approved source attribution
- Response meta includes `approvedSources` list and `sourcePolicy` statement
- POST (admin refresh) delegates to library functions with validation

**File:** `/src/app/api/insights/refresh/route.ts`

- Calls `verifyAndRefreshIndustryInsights()` which has built-in validation

### 4. UI Layer
**File:** `/src/app/(dashboard)/insights/page.tsx`

- All hardcoded data uses only approved source citations
- "About the Data" section lists approved sources
- Industry cards link to approved source articles only

### 5. Database Schema
**File:** `/prisma/schema.prisma`

- `IndustryInsightsModule.sourceMeta` stores source attribution as JSON
- JSON structure includes `sourceId` which must be an approved source

## Content Guidelines

1. **No Hype Language**: Avoid words like "exploding", "game-changing", "must-learn"
2. **Neutral Tone**: Use "growing", "in demand", "notable" instead of sensational terms
3. **Youth Appropriate**: Content should be explanatory, not promotional
4. **Proper Attribution**: Every module must include source attribution

## Adding New Sources

To add a new Tier-1 source:

1. Add to `TIER1_SOURCES` enum in `tier1-sources.ts`
2. Add metadata to `TIER1_SOURCE_METADATA` object
3. Add to relevant industry whitelists
4. Update this documentation

To add a new Tier-2 source:

1. Add to `TIER2_SOURCES` enum in `tier1-sources.ts`
2. Add metadata to `TIER2_SOURCE_METADATA` object
3. Add to relevant industry whitelists
4. Update this documentation

**Important**: New sources must be credible and recognised. Do not add:
- News outlets
- Social media platforms
- Corporate blogs
- Local/regional government statistics
- Industry newsletters
