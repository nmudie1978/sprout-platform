# Life Skills Track - Test Checklist

## Overview
This document provides a comprehensive test checklist for verifying the Life Skills Track implementation.

---

## Pre-Test Setup

### Database Setup
- [ ] Run database migration: `npx prisma db push`
- [ ] Seed life skill cards: `npx prisma db seed`
- [ ] Verify LifeSkillCard table has 10 cards
- [ ] Verify RLS policies are applied (check Supabase dashboard)

### Test Users Needed
1. Youth user (age 16-17) - Primary tester
2. Youth user (age 18+) - Secondary tester
3. Employer user (verified)

---

## Core Functionality Tests

### 1. Life Skill Cards Seeded
- [ ] **PASS**: 10 life skill cards exist in database
- [ ] **PASS**: All cards have unique keys
- [ ] **PASS**: All cards have title, body, and tags

Cards to verify:
1. `FIRST_JOB_ACCEPTED` - "Your first job"
2. `FIRST_MESSAGE_TO_ADULT` - "Keep it simple"
3. `ARRIVING_ON_TIME` - "Being on time"
4. `RUNNING_LATE` - "If you're running late"
5. `CLARIFY_THE_TASK` - "Agree what 'done' means"
6. `DECLINING_A_JOB` - "Saying no politely"
7. `PRICE_AND_PAYMENT` - "Money talk (no stress)"
8. `SAFETY_BOUNDARIES` - "Your boundaries matter"
9. `AFTER_THE_JOB` - "Wrap up well"
10. `WHEN_SOMETHING_FEELS_OFF` - "Trust your gut"

---

## Trigger System Tests

### 2. Event Recording
- [ ] **PASS**: JOB_ACCEPTED event recorded when youth's application is accepted
- [ ] **PASS**: CONVERSATION_STARTED event recorded when youth creates conversation
- [ ] **PASS**: MESSAGE_SENT_FIRST event recorded on youth's first ever message
- [ ] **PASS**: Events are idempotent (duplicate events don't create multiple records)

### 3. Rules-Based Triggers
- [ ] **PASS**: JOB_ACCEPTED triggers card recommendation
- [ ] **PASS**: CONVERSATION_STARTED triggers "Keep it simple" tip
- [ ] **PASS**: MESSAGE_SENT_FIRST triggers "Keep it simple" tip
- [ ] **PASS**: RUNNING_LATE template triggers "Running late" tip
- [ ] **PASS**: Only youth users receive tips (employers don't)

### 4. Recommendation Creation
- [ ] **PASS**: Recommendation created after relevant event
- [ ] **PASS**: Recommendation links to correct card
- [ ] **PASS**: Recommendation source is "RULES"
- [ ] **PASS**: User doesn't get same card twice

---

## API Tests

### 5. GET /api/life-skills/recommendations
- [ ] **PASS**: Returns pending recommendations for authenticated youth
- [ ] **PASS**: Returns empty array for employers
- [ ] **PASS**: Returns empty array when tips are disabled
- [ ] **FAIL**: Returns 401 for unauthenticated users

### 6. POST /api/life-skills/events
- [ ] **PASS**: Records valid event type
- [ ] **FAIL**: Rejects invalid event type (400)
- [ ] **FAIL**: Returns 401 for unauthenticated users
- [ ] **PASS**: Returns recorded: false for non-youth users

### 7. POST /api/life-skills/views
- [ ] **PASS**: "shown" action marks recommendation as shown
- [ ] **PASS**: "dismiss" action dismisses recommendation
- [ ] **PASS**: "save" action saves card for later
- [ ] **FAIL**: Rejects missing recommendationId (400)
- [ ] **FAIL**: Rejects invalid action (400)

### 8. GET /api/life-skills/saved
- [ ] **PASS**: Returns saved cards for authenticated youth
- [ ] **PASS**: Returns empty array for new users

### 9. GET/PATCH /api/life-skills/preferences
- [ ] **PASS**: GET returns current showLifeSkills preference
- [ ] **PASS**: PATCH updates showLifeSkills preference
- [ ] **PASS**: Default is true for new users

---

## UI Tests

### 10. Tip Modal (Bottom Sheet)
- [ ] **PASS**: Modal appears when recommendation is available
- [ ] **PASS**: Modal shows card title and body
- [ ] **PASS**: Modal shows relevant tags
- [ ] **PASS**: "Got it" button dismisses modal
- [ ] **PASS**: "Save for later" button saves card
- [ ] **PASS**: Modal closes after saving (with brief success state)
- [ ] **PASS**: Click outside modal dismisses it

### 11. Settings Toggle
- [ ] **PASS**: Toggle visible on profile page (youth only)
- [ ] **PASS**: Toggle reflects current preference
- [ ] **PASS**: Toggling off hides future tips
- [ ] **PASS**: Toggling on allows tips again

### 12. Saved Cards Display
- [ ] **PASS**: Saved cards section appears on profile
- [ ] **PASS**: Shows "No saved tips" when empty
- [ ] **PASS**: Displays saved cards with title and body
- [ ] **PASS**: Shows tags on each saved card

---

## AI Integration Tests (when LIFE_SKILLS_AI_ENABLED=true)

### 13. AI Tool Function
- [ ] **PASS**: AI can call recommendLifeSkillCard function
- [ ] **PASS**: AI only recommends from whitelist
- [ ] **FAIL**: AI recommendation with invalid card key fails
- [ ] **PASS**: AI recommendation creates entry with source=AI
- [ ] **PASS**: AI doesn't recommend cards user already has

---

## Privacy & Safety Tests

### 14. User Controls
- [ ] **PASS**: Tips can be completely disabled
- [ ] **PASS**: No tips shown when disabled
- [ ] **PASS**: User data not shared externally
- [ ] **PASS**: No personally identifiable information in recommendations

### 15. Non-Judgmental Content
- [ ] **PASS**: All card content is supportive
- [ ] **PASS**: No gamification or scoring
- [ ] **PASS**: No psychological profiling
- [ ] **PASS**: Cards can be dismissed without consequence

---

## RLS Policy Tests

### 16. Row Level Security
- [ ] **PASS**: Users can only read their own events
- [ ] **PASS**: Users can only read their own recommendations
- [ ] **PASS**: Users can only read/write their own views
- [ ] **PASS**: All users can read active cards

---

## Performance Tests

### 17. Response Times
- [ ] **PASS**: Recommendations load in < 500ms
- [ ] **PASS**: Event recording completes in < 500ms
- [ ] **PASS**: Modal renders without jank

---

## Test Commands

```bash
# Run database seed
npx prisma db seed

# Check cards exist
npx prisma studio
# Navigate to LifeSkillCard table

# Build verification
npm run build

# Start dev server
npm run dev

# Test as youth user:
# 1. Apply for a job -> get accepted -> should see tip
# 2. Start a conversation -> should see tip
# 3. Check profile -> saved cards section visible
# 4. Toggle tips off/on in profile settings
```

---

## Sign-Off

| Tester | Date | Environment | Status |
|--------|------|-------------|--------|
| | | | |

---

## Notes
- All tip content is pre-approved and cannot be modified by AI
- Tips are shown one at a time to avoid overwhelming users
- The feature is designed to be supportive, not surveillance
- No data is shared with third parties
