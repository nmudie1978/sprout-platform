# Industry Insights - Source Policy

This document defines the source policy for Industry Insights content.

## Core Principle

Industry Insights must be:
- **Credible** - from internationally recognised institutions or specialist publications
- **Calm** - educational, not sensational
- **Educational** - helping youth understand industries and careers
- **Long-term relevant** - timeless over fresh
- **Understandable** - written for 15-23 year olds
- **Trusted** - by parents, schools, and educators

Industry Insights are **NOT**:
- A news feed
- A blog aggregator
- Opinion content
- Influencer commentary
- "Latest headlines"

## Source Whitelists Location

The source whitelists are defined in:
```
/src/lib/industry-insights/tier1-sources.ts
```

This is the single source of truth for all approved sources.

## Tier-1 Source Categories

### Global Research & Policy Bodies
| Source | ID | Use Cases |
|--------|-----|-----------|
| World Economic Forum | `world_economic_forum` | Future of Jobs, skills demand, AI impact |
| OECD | `oecd` | Employment statistics, education outcomes |
| World Bank | `world_bank` | Global economic trends, development indicators |
| WHO | `who` | Healthcare workforce, health sector employment |
| ILO | `ilo` | Labour market trends, youth employment |
| UNESCO | `unesco` | Education trends, skills for the future |

### Consulting & Analysis Firms
| Source | ID | Use Cases |
|--------|-----|-----------|
| McKinsey & Company | `mckinsey` | Technology research, workforce transformation |
| Boston Consulting Group | `bcg` | Workforce strategy, industry trends |
| Deloitte Insights | `deloitte` | Workforce trends, skills analysis |

### Visual Publishers
| Source | ID | Use Cases |
|--------|-----|-----------|
| Visual Capitalist | `visual_capitalist` | Macro trends, rankings, visual explanations |

## Tier-2 Source Categories

Tier-2 sources supplement Tier-1 with industry-specific publications and specialist platforms. Same content rules apply.

### Consulting (Specialist)
| Source | ID | Use Cases |
|--------|-----|-----------|
| Accenture | `accenture` | Digital transformation, telecom, technology innovations |

### Industry Publications
| Source | ID | Use Cases |
|--------|-----|-----------|
| FierceWireless | `fierce_wireless` | Wireless technology, telecom industry analysis |
| TelecomTV | `telecom_tv` | Global telecom news, service provider insights |
| Network World | `network_world` | Networking, telecom, IT infrastructure |

### Labor Market Platforms
| Source | ID | Use Cases |
|--------|-----|-----------|
| Glassdoor | `glassdoor` | Labor market trends, hiring trends, salary benchmarks |

## Industry-Specific Whitelists

Each industry has a subset of approved sources. Content for an industry may **ONLY** use sources from its whitelist.

### Technology / IT
- Visual Capitalist
- World Economic Forum
- McKinsey
- BCG
- Deloitte
- Accenture (Tier-2)
- FierceWireless (Tier-2)
- TelecomTV (Tier-2)
- Network World (Tier-2)
- Glassdoor (Tier-2)

### Healthcare / Medicine
- WHO (primary)
- OECD
- World Economic Forum
- McKinsey

### Trades / Construction
- ILO (primary)
- OECD
- World Economic Forum
- Deloitte

### Finance / Economics
- World Bank (primary)
- OECD
- World Economic Forum
- McKinsey
- Deloitte

### Education
- UNESCO (primary)
- OECD
- World Economic Forum

### Logistics / Supply Chain
- World Economic Forum
- OECD
- World Bank
- McKinsey

### Creative Industries
- UNESCO
- OECD
- World Economic Forum
- Visual Capitalist

### General / Cross-Industry
- World Economic Forum
- OECD
- McKinsey
- Visual Capitalist
- BCG
- Deloitte
- Accenture (Tier-2)
- Glassdoor (Tier-2)

## Disallowed Sources

The following are **NEVER** permitted:
- News websites (TechCrunch, BBC, CNN, etc.)
- Tech/industry blogs (Medium, Substack)
- Social media (Twitter, LinkedIn, Reddit)
- YouTube and video platforms
- Government statistics agencies (BLS, regional statistics)
- Company marketing and blogs
- Podcasts as primary sources
- RSS feeds and news aggregators

See `DISALLOWED_SOURCES` in tier1-sources.ts for the complete list.

## Content Handling Rules

### No Raw Content
- Do NOT display full external articles
- Do NOT embed feeds
- Do NOT copy text verbatim

### Summarise & Translate
All insights must be:
- Summarised from the source
- Rewritten in plain, neutral language
- Adapted for a youth audience

### No Hype Language

**Avoid:**
- "exploding", "game-changing", "must-learn"
- "guaranteed", "top salaries", "future-proof"
- "revolutionary", "unprecedented", "massive"

**Use instead:**
- "growing", "changing", "in demand"
- "commonly", "competitive", "long-term relevant"
- "significant", "notable", "substantial"

## Insight Structure

Every insight must include:
1. **Title** - clear, neutral (max 100 chars)
2. **Body** - 2-4 sentence explanation in plain language
3. **Source attribution** - approved source ID (Tier-1 or Tier-2)
4. **Why this matters** - 1 sentence (optional)
5. **Industry tags** - relevant industry categories

## Update Cadence

- Updates: Monthly or quarterly
- No daily refresh
- Timeless relevance > freshness
- Tier-2 content reviewed quarterly for accuracy and relevance

## Adding a New Industry

To add a new industry:

1. Add the industry key to `IndustryCategory` type in tier1-sources.ts
2. Create an entry in `INDUSTRY_SOURCE_WHITELISTS` with:
   - `industry`: the category key
   - `name`: human-readable name
   - `description`: what the industry covers
   - `allowedSources`: array of ApprovedSourceId values
   - `notes`: guidance for content creators
3. Only use sources from `TIER1_SOURCES` or `TIER2_SOURCES`
4. Run validation on all existing content for the new industry

## Adding a New Tier-1 Source

Before adding a new source, verify it meets **ALL** criteria:
- Internationally recognised institution
- Public or research-based organisation
- Consulting/analysis firm with global credibility
- Official public sector or industry body

To add:
1. Add to `TIER1_SOURCES` enum
2. Add metadata to `TIER1_SOURCE_METADATA` (name, URL, domain, use cases)
3. Add to relevant industry whitelists
4. Update this documentation

## Adding a New Tier-2 Source

Before adding a new source, verify it meets criteria:
- Recognised industry publication or specialist platform
- Credible analysis or labor market data
- Not a news aggregator or opinion blog

To add:
1. Add to `TIER2_SOURCES` enum
2. Add metadata to `TIER2_SOURCE_METADATA` (name, URL, domain, use cases)
3. Add to relevant industry whitelists
4. Update this documentation

## Validation

Source validation is enforced:
- At module creation time
- At module update time
- Through the `validateSourceMeta()` and `validateInsightStructure()` functions
- Both Tier-1 and Tier-2 sources pass through the same validation pipeline

If validation fails, the content will not be saved.

## Related Files

- `/src/lib/industry-insights/tier1-sources.ts` - Source definitions and validation (both tiers)
- `/src/lib/industry-insights/SOURCE-ENFORCEMENT.md` - Enforcement documentation
- `/src/lib/insights-refresh.ts` - Refresh system using approved sources
- `/src/app/(dashboard)/insights/page.tsx` - Industry Insights page
