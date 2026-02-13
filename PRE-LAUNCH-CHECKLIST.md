# Pre-Launch Checklist

Critical items to complete before production deployment.

## Security Requirements

### ⚠️ CRITICAL: Install Redis for Rate Limiting
**Status:** NOT INSTALLED

Rate limiting currently falls back to in-memory storage, which does NOT work across multiple server instances. Before deploying to production:

1. Install the Upstash Redis package:
   ```bash
   npm install @upstash/redis
   ```

2. Configure environment variables:
   ```
   UPSTASH_REDIS_REST_URL=your-upstash-url
   UPSTASH_REDIS_REST_TOKEN=your-upstash-token
   ```

3. Verify rate limiting works in staging environment

**Why this matters:** Without Redis, attackers can bypass rate limits by having their requests hit different server instances. This affects:
- Admin login brute force protection
- AI chat abuse prevention (expensive API calls)
- Notification spam protection

**Files affected:** `src/lib/rate-limit.ts`

---

## Completed Security Fixes (2026-01-20)

- [x] Removed guardian consent token exposure from API response
- [x] Fixed age validation inconsistency (now enforces 16-20 across all endpoints)
- [x] Added Redis-ready rate limiting with Upstash support
- [x] Added RLS context helpers for Prisma queries

---

## Other Pre-Launch Items

- [ ] Configure production email service for guardian consent emails
- [ ] Set up error tracking (Sentry recommended)
- [ ] Review and enable CSP headers
- [ ] Verify all environment variables are set in production
- [ ] Run full security audit on staging
