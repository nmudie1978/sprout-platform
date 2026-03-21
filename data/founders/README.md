# Founder Spotlights Data

This directory contains the data for the "Build Your Own Path" founder spotlights feature.

## Files

- `spotlights.json` - Array of founder spotlight entries
- `metadata.json` - Store metadata (counts, last refresh)
- `url-cache.json` - URL verification cache (24-hour TTL)

## Adding New Spotlights

### Option 1: Admin API (Recommended)

```bash
curl -X POST http://localhost:3000/api/admin/founders \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: YOUR_ADMIN_KEY" \
  -d '{
    "title": "From school project to real business",
    "founderName": "Jane Doe",
    "founderAgeAtStart": 17,
    "country": "United States",
    "whatTheyBuilt": "An app that connects local tutors with students",
    "whyItMatters": "Shows that identifying a real problem can lead to a viable business",
    "keyLesson": "Start by solving a problem you personally understand",
    "sourceName": "Forbes",
    "sourceUrl": "https://www.forbes.com/path/to/article",
    "publishedDateISO": "2024-06-15",
    "tags": ["youth", "tech", "student"]
  }'
```

### Option 2: Seed Script

Edit `scripts/seed-founder-spotlights.ts` and add entries to `REAL_FOUNDER_SPOTLIGHTS`, then run:

```bash
npx tsx scripts/seed-founder-spotlights.ts
```

### Option 3: Direct JSON Edit

Edit `spotlights.json` directly. Each entry must have:

```json
{
  "id": "uuid",
  "title": "Story title",
  "founderName": "Real name",
  "founderAgeAtStart": 17,
  "country": "Country",
  "whatTheyBuilt": "Factual description",
  "whyItMatters": "Inspirational framing",
  "keyLesson": "Key takeaway",
  "sourceName": "Publication name",
  "sourceUrl": "https://...",
  "publishedDateISO": "2024-01-15",
  "tags": ["youth", "tech"],
  "verified": false,
  "addedAtISO": "2024-01-20T12:00:00.000Z"
}
```

After editing, run verification:

```bash
curl -X PUT http://localhost:3000/api/admin/founders \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: YOUR_ADMIN_KEY" \
  -d '{"action": "reverify-all"}'
```

## Verification Requirements

All spotlights must pass URL verification before being displayed:

1. Source URL must use HTTPS
2. URL must return HTTP 200-399
3. URL must respond within 8 seconds
4. Verification is cached for 24 hours

## CRITICAL RULES

1. **NO FABRICATED STORIES** - Every spotlight must be sourced from a real publication
2. **NO INVENTED QUOTES** - Only include what's stated in the source
3. **NO UNVERIFIED CLAIMS** - Age, achievements, etc. must be in the source
4. **PRODUCTION ONLY SHOWS VERIFIED** - Only verified=true spotlights are displayed

If you cannot find a reliable source for a story, DO NOT add it.
