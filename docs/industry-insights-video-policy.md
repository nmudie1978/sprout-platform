# Industry Insights - Video Policy

This document defines the video sourcing policy for Industry Insights content.

## Core Principle

Industry Insight videos must be:
- **Credible** - from internationally recognised institutions only
- **Educational** - explaining systems and trends, not opinions
- **Brief** - 2-6 minutes target, 8 minutes maximum
- **Appropriate** - suitable for 16-20 year olds and trusted by parents/educators
- **Non-promotional** - no company marketing or influencer content

## Video Source Whitelist Location

The video source whitelist is defined in:
```
/src/lib/industry-insights/video-policy.ts
```

This is the single source of truth for all approved video sources.

## Tier-1 Video Sources

### Global Research & Policy Bodies
| Source | ID | Permitted Content |
|--------|-----|-------------------|
| World Economic Forum | `wef` | Future of jobs, AI impact, workforce trends |
| OECD | `oecd` | Employment statistics, education outcomes |
| UNESCO | `unesco` | Education, skills for the future |
| ILO | `ilo` | Labour market trends, youth employment |

### Healthcare Specific
| Source | ID | Permitted Content |
|--------|-----|-------------------|
| WHO | `who` | Healthcare workforce, health sector trends |
| NHS (UK) | `nhs` | Healthcare careers, medical professions |

### Educational
| Source | ID | Permitted Content |
|--------|-----|-------------------|
| MIT OpenCourseWare | `mit_ocw` | Short explainers only (max 6 min) |

### Conditional Sources
| Source | ID | Conditions |
|--------|-----|------------|
| TED | `ted` | System explanations ONLY, not personality-driven talks |

## Disallowed Video Sources

The following are **NEVER** permitted:

### News & Media
- CNBC, Bloomberg, BBC, CNN, ABC, CBS, NBC, Fox
- Vice, Vox, BuzzFeed
- Any news organisation

### YouTube Creators & Influencers
- Individual YouTubers (regardless of credibility)
- Podcast clips
- "Day in the life" content creators
- Career coaches and lifestyle influencers

### Corporate & Marketing
- Company recruitment videos
- Corporate training content
- Product demonstrations

### Universities (with exceptions)
- University marketing videos
- Admissions content
- Graduation speeches
- **Exception**: MIT OpenCourseWare short explainers

### TEDx
- TEDx content (only main TED channel permitted)
- TED personality-driven talks

### Entertainment Adjacent
- Reality TV clips
- Celebrity career content
- Entertainment news

See `DISALLOWED_VIDEO_CHANNELS` in video-policy.ts for the complete blocklist.

## Video Length Constraints

| Constraint | Duration |
|------------|----------|
| Target minimum | 2 minutes |
| Target maximum | 6 minutes |
| Absolute maximum | 8 minutes |
| Warning threshold | 7 minutes |

Videos longer than 8 minutes will be **rejected**.
Videos 7-8 minutes will generate a **warning**.

## Content Requirements

### Required for Every Video
1. **Title** - Clear, neutral description (max 100 chars)
2. **Description** - 2-4 sentences explaining what the video covers
3. **Source attribution** - Channel name matching Tier-1 source
4. **Duration** - Must be validated against length constraints
5. **Industry tag** - Which industry category this applies to

### No Hype Language
Video descriptions must avoid:
- "must-watch", "incredible", "mind-blowing"
- "game-changing", "revolutionary"
- Salary promises or job guarantees
- "Future-proof your career"

### Written Context Required
Every video MUST have written context that:
- Explains what the video covers
- Sets appropriate expectations
- Provides educational framing
- Never uses auto-play

## Video Validation

All videos are validated at:
1. **Seed time** - Initial video data is validated before database insert
2. **Regeneration time** - When videos are refreshed on the 90-day cycle
3. **Manual addition** - Any manual video additions are validated

### Validation Function
```typescript
import { validateVideo } from "@/lib/industry-insights";

const result = validateVideo({
  sourceId: "wef",           // Optional Tier-1 source ID
  channel: "World Economic Forum",
  title: "Future of Jobs Report",
  duration: "4:32",
  description: "An overview of workforce trends...",
});

if (!result.valid) {
  console.error(result.errors);
}

if (result.warnings.length > 0) {
  console.warn(result.warnings);
}
```

## Adding Videos Safely

### Manual Video Addition
1. Verify the video comes from a Tier-1 source
2. Check the duration is under 8 minutes (ideally 2-6 minutes)
3. Ensure the content is educational and system-level
4. Write a neutral, educational description
5. Use the `validateVideo()` function before saving
6. If validation fails, do not add the video

### Automated Video Refresh
The 90-day refresh cycle in `video-freshness.ts`:
1. Marks videos as `REFRESH_DUE` after 90 days
2. Calls `regenerateVideo()` to replace stale content
3. `regenerateVideo()` validates new videos against policy
4. Invalid videos are rejected with error messages

### Seed Data
Initial videos in `seedInitialVideos()`:
1. All seed videos are validated against policy before insert
2. Non-compliant seed data will throw an error
3. Seed data should only contain Tier-1 compliant videos

## Refresh Cycle

- **Freshness period**: 90 days
- **Check frequency**: Daily (via cron) or on-demand
- **Status flow**: ACTIVE → REFRESH_DUE → ARCHIVED (when replaced)

## Related Files

- `/src/lib/industry-insights/video-policy.ts` - Source whitelist and validation
- `/src/lib/industry-insights/video-freshness.ts` - Freshness system and regeneration
- `/src/lib/industry-insights/index.ts` - Public exports
- `/docs/industry-insights-source-policy.md` - General source policy (text insights)

## Summary

| Rule | Enforcement |
|------|-------------|
| Tier-1 sources only | `validateVideo()` checks channel |
| Max 8 minutes | `validateVideoDuration()` rejects longer |
| No influencers | `isDisallowedChannel()` blocklist |
| No hype titles | `isDisallowedTitle()` blocklist |
| Written context | Required description field |
| 90-day refresh | `checkIndustryInsightFreshness()` |
