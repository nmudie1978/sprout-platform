# English-Only Language Policy

**This application is English-only by design.**

This is a product and technical requirement, not just a copy preference. The platform serves Norwegian youth but operates entirely in English to maintain consistency and simplicity.

## Overview

- All user-facing text is in English
- All AI-generated content is in English
- No automatic language switching or locale-based rendering
- The app behaves consistently regardless of user location

## Why English-Only?

1. **Simplicity**: Single-language codebase is easier to maintain
2. **Consistency**: All users see the same interface and content
3. **AI Reliability**: English prompts produce more consistent AI outputs
4. **Global Accessibility**: English is widely understood in Norway, especially among youth

## Implementation Details

### 1. UI Copy & Components

- All UI strings (navigation, buttons, labels, helper text, empty states, errors) are in English
- No i18n frameworks are used (no `next-intl`, no locale routing, no language toggles)
- Future components must default to English copy

### 2. AI-Generated Content

All AI outputs must be in English. This is enforced through:

**System Prompt Rule** (`src/lib/ai-guardrails.ts`):
```
LANGUAGE REQUIREMENT (MANDATORY - NO EXCEPTIONS):
- Output language: English (en) only.
- Always respond in English, even if the user writes in another language.
- Do NOT translate your response into other languages.
- Do NOT switch languages mid-response.
```

**Language Detection Guard**:
- The `detectNonEnglishResponse()` function checks AI responses for non-English patterns
- If non-English content is detected, the response is silently regenerated
- Fallback responses are used if regeneration fails
- Users never see the language detection process

### 3. User Input Handling

- Users can type in any language (input is not blocked)
- User input is stored as-is in the database
- AI responses derived from non-English input are still returned in English

### 4. Norwegian Terminology

Some Norwegian terms are allowed when they describe local concepts:
- `fagbrev` (trade certificate)
- `lærling` (apprentice)
- `sommerjobb` (summer job)
- `skattekort` (tax card)
- `NAV` (employment service)
- `videregående` (secondary school)

These terms should always be explained in English when used.

### 5. HTML & Routing

- HTML lang attribute: `<html lang="en">`
- No locale-based routing
- No Accept-Language header processing
- Content does not vary by region or browser language

### 6. Database Content

- **System-generated**: Must be English (AI responses, notifications, system messages)
- **User-generated**: Can be any language (profiles, messages, reviews)

See the Prisma schema header for this policy reminder.

## Copy Guidelines

When writing UI copy:

- Use simple, clear English suitable for ages 15-20
- Avoid slang, regional idioms, or complex legal language
- Prefer short sentences and active voice
- Be friendly but professional

## QA Checklist

Before releasing, verify:

- [ ] Switch browser language to non-English → UI remains English
- [ ] Enter non-English text in chat → AI responses are still English
- [ ] All AI-generated text is English only
- [ ] No translation toggles or locale flags exist in the UI
- [ ] HTML lang attribute is set to "en"

## Files Reference

Key files implementing this policy:

| File | Purpose |
|------|---------|
| `src/lib/ai-guardrails.ts` | English-only rule, language detection |
| `src/app/api/chat/route.ts` | AI response language checking |
| `src/app/layout.tsx` | HTML lang="en" attribute |
| `prisma/schema.prisma` | Database language policy comment |
| `docs/english-only.md` | This documentation |

## Adding New AI Features

When adding new AI-powered features:

1. Import and include `ENGLISH_ONLY_RULE` in your system prompt
2. Use `detectNonEnglishResponse()` to check AI output
3. Handle non-English responses gracefully (regenerate or fallback)
4. Log language issues for monitoring (don't expose to users)

Example:
```typescript
import {
  ENGLISH_ONLY_RULE,
  detectNonEnglishResponse,
  getEnglishOnlyRegenerationPrompt,
} from "@/lib/ai-guardrails";

// In your system prompt
const systemPrompt = `Your instructions here...

${ENGLISH_ONLY_RULE}`;

// After getting AI response
const languageCheck = detectNonEnglishResponse(response);
if (languageCheck.isNonEnglish) {
  // Handle regeneration or fallback
}
```

---

*Last updated: January 2026*
