# Hybrid Language Policy (en-GB / nb-NO)

**This platform uses a hybrid bilingual approach.**

The platform serves Norwegian youth and operates with English as the primary language, with Norwegian (Bokmal) support for UI chrome and on-demand content translation.

## Overview

| Layer | Language | Mechanism |
|-------|----------|-----------|
| **UI chrome** (nav, buttons, labels) | en-GB / nb-NO | `next-intl` message files |
| **AI Chat / Career Advisor** | English only | `ENGLISH_ONLY_RULE` guardrail |
| **Long-form curated content** (Insights) | en-GB (default), nb-NO on demand | AI translation via `/api/translate` |
| **User-generated content** | Any language | Stored as-is |

## How It Works

### 1. Static UI Translations (next-intl)

Message files live in `messages/en-GB.json` and `messages/nb-NO.json`. These cover:
- Navigation labels
- Insights page section headers
- User menu items
- Common actions (save, cancel, close)

Locale is persisted via `NEXT_LOCALE` cookie and optionally synced to `UserPreferences.preferredLocale` in the database for logged-in users.

### 2. AI Chat — English Only

All AI chat/career advisor responses remain **English only**. This is enforced through:

**System Prompt Rule** (`src/lib/ai-guardrails.ts`):
```
LANGUAGE REQUIREMENT (MANDATORY - NO EXCEPTIONS):
- Output language: English (en) only.
- Always respond in English, even if the user writes in another language.
```

**Context-aware enforcement:**
- `shouldEnforceEnglishOnly("chat")` → `true`
- `shouldEnforceEnglishOnly("translation")` → `false`

**Language Detection Guard:**
- `detectNonEnglishResponse()` checks AI chat responses for non-English patterns
- Non-English chat responses are silently regenerated
- This guard is NOT applied to translation operations

### 3. On-Demand Content Translation

Long-form curated content (Industry Insights) can be translated to Norwegian on demand:
- User clicks "Translate to Norwegian" button on insight components
- Content is sent to `POST /api/translate` which uses OpenAI `gpt-4o-mini`
- Translations are cached in `TranslationCache` table (30-day TTL)
- Users can toggle between original and translated text

### 4. User Input Handling

- Users can type in any language (input is not blocked)
- User input is stored as-is in the database
- AI chat responses derived from non-English input are still returned in English

### 5. Norwegian Terminology

Some Norwegian terms are allowed in English context when they describe local concepts:
- `fagbrev` (trade certificate)
- `lærling` (apprentice)
- `sommerjobb` (summer job)
- `skattekort` (tax card)
- `NAV` (employment service)
- `videregående` (secondary school)

These terms should always be explained in English when used in chat.

### 6. HTML & Routing

- HTML lang attribute: `<html lang={locale}>` (dynamic based on cookie)
- No locale-based URL routing (cookie-based detection)
- No Accept-Language header processing
- Route structure unchanged

### 7. Database Content

- **System-generated chat**: Must be English
- **Translations**: Cached in `TranslationCache` table
- **User preferences**: `UserPreferences.preferredLocale`
- **User-generated**: Can be any language

## Copy Guidelines

When writing UI copy for message files:
- Use simple, clear language suitable for ages 15-23
- Norwegian translations should be hand-written (not AI-generated) for UI chrome
- Avoid slang, regional idioms, or complex legal language
- Prefer short sentences and active voice
- Be friendly but professional

## QA Checklist

Before releasing, verify:

- [ ] Toggle to nb-NO → UI chrome switches to Norwegian instantly
- [ ] Toggle back to en-GB → UI chrome reverts to English
- [ ] In nb-NO, open chat → AI responses remain in English
- [ ] In nb-NO, click "Translate" on insights → content translates
- [ ] Translate same content twice → second time loads from cache (fast)
- [ ] Refresh page → locale persists via cookie
- [ ] Log out/in → locale syncs from DB preference
- [ ] All message keys exist in both en-GB.json and nb-NO.json

## Files Reference

| File | Purpose |
|------|---------|
| `src/i18n/config.ts` | Locale list, default locale, cookie name |
| `src/i18n/request.ts` | Server-side locale resolver |
| `messages/en-GB.json` | English UI translations |
| `messages/nb-NO.json` | Norwegian UI translations |
| `src/app/api/locale/route.ts` | Locale persistence API |
| `src/hooks/use-locale-switch.ts` | Client-side locale toggle |
| `src/lib/translate/translator.ts` | AI translation service with caching |
| `src/app/api/translate/route.ts` | Translation API endpoint |
| `src/hooks/use-translate-content.ts` | Client-side translation hook |
| `src/lib/ai-guardrails.ts` | English-only rule + context bypass |
| `src/components/user-avatar-menu.tsx` | Language toggle in avatar menu |
| `prisma/schema.prisma` | `UserPreferences.preferredLocale` + `TranslationCache` |

## Adding New AI Features

When adding new AI-powered features:

1. Determine the context: `"chat"` (English-only) or `"translation"` (multilingual)
2. For chat: Import and include `ENGLISH_ONLY_RULE` in your system prompt
3. For chat: Use `detectNonEnglishResponse()` to check AI output
4. For translation: Use `translateText()` or `translateBatch()` from `src/lib/translate/translator.ts`
5. Use `shouldEnforceEnglishOnly(context)` to conditionally apply guardrails

---

*Last updated: February 2026*
