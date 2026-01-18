# My Growth Journey

The My Growth section guides youth workers through a structured 3-stage career journey: **Explore → Build → Apply**.

## Design Principles

1. **Users must never feel lost** - The Journey Map is always visible, showing exactly which stage they're in
2. **Single source of truth** - All stage configuration lives in `src/lib/growth/stage-config.ts`
3. **Progressive unlocking** - Users must complete readiness requirements to advance
4. **Context awareness** - Each stage shows relevant content and actions

## Architecture

### Routes

| Route | Purpose |
|-------|---------|
| `/growth` | Dashboard with "Next Stop" logic |
| `/growth/explore` | Career discovery and goal setting |
| `/growth/build` | Skills development and profile building |
| `/growth/apply` | Job applications and opportunities |
| `/growth/short-term` | Short-term progress tracking (sub-page) |
| `/growth/career-path` | Career path details (sub-page) |
| `/growth/vault` | Saved items and achievements (sub-page) |
| `/growth/pro-insights` | Professional insights (sub-page) |
| `/growth/insights` | Industry insight videos (sub-page) |

### Key Files

```
src/lib/growth/
├── stage-config.ts        # Stage definitions and readiness logic
└── progress-helpers.ts    # Progress computation utilities

src/components/growth/
├── journey-map.tsx        # Subway-style stage visualization
├── stage-banner.tsx       # Context banner for each stage
└── honest-progress-section.tsx  # Progress display component

src/app/(dashboard)/growth/
├── layout.tsx             # Shared layout with JourneyMap
├── page.tsx               # Dashboard with Next Stop card
├── explore/page.tsx       # Explore stage
├── build/page.tsx         # Build stage
└── apply/page.tsx         # Apply stage

src/app/api/growth/
└── readiness/route.ts     # Readiness check endpoint
```

## Stage Configuration

The `STAGES` constant in `stage-config.ts` defines:

```typescript
interface StageConfig {
  id: StageId;          // "explore" | "build" | "apply"
  label: string;        // Display name
  description: string;  // Short description
  route: string;        // URL path
  nextStage: StageId | null;  // Next stage in sequence
  icon: LucideIcon;     // Stage icon
  microcopy: string;    // Short helper text
  stopNumber: number;   // 1, 2, or 3
}
```

## Readiness System

### Readiness Check

The system tracks four readiness criteria:

| Criteria | Description | Required for |
|----------|-------------|--------------|
| `hasTargetCareer` | User has set at least one career goal | Build, Apply |
| `hasSkillTags` | User has skills in their profile | Apply |
| `hasLocationPreference` | User has set their city | Apply |
| `hasCV` | User has proof items in vault | - |

### Stage Advancement

- **Explore → Build**: Requires `hasTargetCareer`
- **Build → Apply**: Requires `hasSkillTags` AND `hasLocationPreference`

### API Endpoint

```
GET /api/growth/readiness
```

Returns:
```json
{
  "hasTargetCareer": true,
  "hasSkillTags": false,
  "hasLocationPreference": true,
  "hasCV": false
}
```

## Journey Map Component

The `JourneyMap` component renders a subway-style visualization:

```tsx
<JourneyMap readiness={readinessData} />
```

Features:
- Three stations (dots) connected by a line
- Current stage highlighted with ring
- Completed stages filled with checkmark
- Progress bar animates between stages
- "You're on stop X of 3" indicator
- "Continue to next stop" button (disabled if not ready)

### Compact Variant

For mobile, use `JourneyMapCompact`:

```tsx
<JourneyMapCompact readiness={readinessData} />
```

## Stage Banner Component

Each stage page should include a context banner:

```tsx
<StageBanner stageId="explore" />
```

The banner shows:
- Stage icon with color
- Title and description
- Purpose statement (italic microcopy)

Color schemes:
- **Explore**: Blue gradient
- **Build**: Amber gradient
- **Apply**: Emerald gradient

## Dashboard "Next Stop" Logic

The dashboard (`/growth`) determines the suggested stage:

1. No career goals → Suggest **Explore**
2. Has career but missing skills/location → Suggest **Build**
3. Ready to apply → Suggest **Apply**

```typescript
function getSuggestedStage(readiness: ReadinessCheck): StageId {
  if (!readiness.hasTargetCareer) return "explore";
  if (!readiness.hasSkillTags || !readiness.hasLocationPreference) return "build";
  return "apply";
}
```

## Content Mapping

### Explore Stage
- Career goal management
- Browse all careers link
- Industry insights
- Pro insights
- AI career suggestions

### Build Stage
- Skills progress for active career goal
- Honest progress section
- Small jobs link
- Short-term tracking link
- Learning path link
- Vault link

### Apply Stage
- Application readiness checklist
- Small jobs (quick wins)
- External job search (finn.no)
- Traineeship links
- Profile and vault links

## Adding New Stages (Future)

1. Add stage ID to `StageId` type
2. Add config to `STAGES` constant
3. Update `STAGE_ORDER` array
4. Update `TOTAL_STAGES` constant
5. Create page at `/growth/[stage]/page.tsx`
6. Update readiness logic if needed

## Testing Checklist

- [ ] Navigate to `/growth` - should show dashboard with Next Stop
- [ ] Click through Explore, Build, Apply - Journey Map updates
- [ ] Set a career goal - should unlock Build stage
- [ ] Add skills and location - should unlock Apply stage
- [ ] Mobile view shows compact Journey Map
- [ ] Continue button disabled when not ready
- [ ] All sub-pages accessible from stage pages
