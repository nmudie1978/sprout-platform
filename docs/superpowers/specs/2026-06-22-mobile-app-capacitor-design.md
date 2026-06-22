# Endeavrly Mobile Apps (iOS + Android) — Design

**Date:** 2026-06-22
**Status:** Approved design, ready for implementation planning
**Approach:** Capacitor wrap of the existing Next.js web app + a native-feature layer

---

## 1. Goal & constraints

Produce credible, store-listed **iOS and Android** apps for Endeavrly.

Decisions made during brainstorming (these frame every choice below):

| Dimension | Decision |
|---|---|
| **Primary driver** | Credibility / discoverability — being a "real app" in the App Store & Play Store. Not deep native UX, not push-led retention (push is a bonus). |
| **Who builds** | You + Claude Code build the app; a contractor handles only narrow native/submission gaps. One maintainable codebase. |
| **v1 scope** | Full feature parity with the web app (Journey, Careers, Radar, Compare, Insights, Library, Profile, Admin). |
| **Timeline** | ASAP — target ~4 weeks to submission. |
| **Auth** | Email/password only. **No third-party social login → Sign in with Apple is NOT required.** |

Non-negotiables inherited from `CLAUDE.md`: youth-safety first, privacy by design, no in-app payments, no spam notifications, calm tone, Journey UX quality preserved.

---

## 2. Why Capacitor (and not Expo / local-bundle / PWA)

Full parity + credibility + weeks + you-build has essentially one sensible answer.

- **Capacitor wrap (chosen):** packages the *existing* web app into real native apps. Full parity is automatic because it *is* the web app. Web deploys update the app instantly, no resubmission.
- **Expo / React Native rebuild (rejected):** best native feel, but rebuilding full parity (Radar charts, Compare, Insights, Admin, 1,300+ careers) is many months and re-solves solved problems. Only worth it if native UX were the goal.
- **Capacitor + local static bundle (deferred to phase 2):** ships its own front-end bundle, talks to backend via API. Feels instant, works partly offline, reads unambiguously as "an app." Blocked for v1 because the App Router uses **server actions**, which can't static-export — refactoring them to API routes breaks the "weeks" timeline.
- **PWABuilder / PWA wrappers (rejected):** fast, but Apple treats PWA wrappers harshly — too fragile for a credibility play.

---

## 3. Architecture

Capacitor generates native iOS (Xcode) and Android (Android Studio) projects that host a WebView. For v1 the WebView **loads the live production site** via Capacitor `server.url`.

```
┌──────────────────────────────┐
│  Native shell (iOS / Android) │   Xcode / Android Studio projects
│  • Splash, icon, status bar   │   genuine native chrome
│  • Capacitor plugin bridge    │   push, biometric, share, offline…
│  ┌──────────────────────────┐ │
│  │ WebView → endeavrly.com   │ │   existing Next.js app, full parity
│  └──────────────────────────┘ │
└──────────────────────────────┘
        │ HTTPS (same Supabase auth cookies as web)
        ▼
   Existing backend (Supabase + Prisma + API routes) — unchanged except §6
```

**Capacitor config (`capacitor.config.ts`):**
- `server.url = "https://endeavrly.com"` (the live app)
- `server.allowNavigation` restricted to Endeavrly domains
- `server.cleartext = false`
- App ID e.g. `com.endeavrly.app`; app name "Endeavrly"

**Trade-off (stated honestly):** this is a *managed remote WebView*. It carries an online dependency (covered by the offline-fallback screen, §4) and can attract Apple rule-4.2 scrutiny (deliberately mitigated in §5). Phase 2 (local bundle) removes both, when desired.

**Auth in the WebView:** Supabase email/password session cookies behave as on web. No OAuth redirect handling needed (email/password only). Verify session persistence across app cold-starts early in Phase 1.

---

## 4. Native-feature layer (Capacitor plugins)

The work that makes it a real app, not a bookmark. Web-side glue = you+Claude; native plumbing = contractor.

| Feature | Plugin | Purpose |
|---|---|---|
| **Push notifications** (opt-in, calm) | `@capacitor/push-notifications` + APNs/FCM | Bonus retention + strongest 4.2 signal |
| Native splash & icon | `@capacitor/splash-screen` | Launch experience |
| Status bar / safe areas | `@capacitor/status-bar` | Notch / home-indicator correctness |
| Offline fallback | `@capacitor/network` | Native "you're offline" screen when no connection |
| Native share | `@capacitor/share` | Share a career / Journey PDF |
| Biometric login | `capacitor-native-biometric` | Face ID / fingerprint re-entry |
| Haptics | `@capacitor/haptics` | Subtle feedback at key Journey moments |
| Deep / universal links | `@capacitor/app` | `endeavrly.com/journey?…` opens in-app |

**Push notification rules (CLAUDE.md alignment — `<critical_notes>` "no spam notifications", calm tone):**
- Strictly **opt-in** (explicit in-app prompt, off by default).
- Low-frequency, meaningful-only: e.g. "your roadmap is ready", a weekly insight.
- **No** streaks, nags, gamification, or comparison/viral mechanics.

---

## 5. App Store review hardening (Apple rule 4.2)

Defense against "this is just a website" = genuine native value present from day one:

- Opt-in push notifications (single biggest factor)
- Native offline screen
- Biometric login
- Native share
- Native splash / icon / status-bar chrome
- Universal links routing into the app

If a reviewer still pushes back, the fallback is the **phase-2 local bundle**. The above clears review for the large majority of comparable apps.

---

## 6. Backend additions (small, isolated)

Only one new concern — device tokens for push. Everything else reuses the current backend untouched.

- **`DeviceToken` Prisma model:** `id` (UUID PK), `userId`, `token`, `platform` (`ios` | `android`), `created_at`, `updated_at`, soft-delete (`deleted_at`). Conforms to `<data_model_rules>`.
- **`POST /api/push/register`** — upsert a device token for the signed-in user (called after login + on token refresh).
- **`POST /api/push/unregister`** — soft-delete on logout.
- **Send service** — small server-side helper to APNs/FCM, triggered by existing calm events (roadmap ready, weekly insight). No new user-facing data collection; tokens are not behavioral profiling.

All push endpoints behind existing auth + rate limiting.

---

## 7. Division of labour

**You + Claude Code:**
- Add Capacitor; `capacitor.config.ts`; install + wire all plugins
- Web-side glue: push registration/opt-in UI, offline detection + screen, deep-link routing, biometric gate, share hooks, safe-area CSS
- `DeviceToken` model + register/unregister endpoints + send service
- App icons, splash assets, store listing copy & screenshots
- Apple App Privacy label + Google Play Data Safety form content
- Wire existing GDPR erasure to a visible in-Profile account-deletion control

**Contractor (narrow native specialist — a few days):**
- Apple Developer + Google Play account setup; signing certificates; provisioning profiles
- APNs key + FCM project configuration (native push plumbing)
- Xcode / Android Studio build configuration
- First store submission + handling review replies

---

## 8. Youth-platform store compliance

Mostly already satisfied — privacy-by-design pays off:

- ✅ No third-party ads / behavioral tracking; privacy policy exists; reporting + admin moderation exist
- ☐ **In-app account deletion** — surface existing GDPR erasure as a visible Profile control (both stores now *require* this)
- ☐ **Apple App Privacy "nutrition label"** + **Google Play Data Safety form** (straightforward given minimal data)
- ☐ **Age rating:** target ~12+ (Apple) / Teen (Google); declare target audience **15+** to stay out of Google Play "Families" obligations
- ✅ **Sign in with Apple:** not required (email/password only)
- ☐ **Permission usage strings** in `Info.plist` for push + Face ID

---

## 9. Testing

- Web glue via existing approach (`webapp-testing` / headless verification)
- Real-device QA: TestFlight (iOS) + Play internal-testing track (Android)
- Verify on physical devices before submission: push opt-in + delivery, biometric login, offline screen, deep links, auth persistence across cold start, safe areas on a notched device

---

## 10. Phased timeline (~4 weeks)

| Phase | Duration | Outcome |
|---|---|---|
| **0 — Accounts** | Days (parallel) | Apple Developer + Play Console accounts; bundle IDs (contractor or you) |
| **1 — Shell** | Week 1 | Capacitor added; app loads endeavrly.com on both platforms; icons, splash, safe areas; auth persists; internal build runs |
| **2 — Native layer** | Week 2 | Push (opt-in) + `DeviceToken` backend; offline screen; biometric; share; deep links |
| **3 — Compliance & QA** | Week 3 | Store assets; privacy labels; account-deletion control; real-device QA |
| **4 — Submit** | Week 4 | Submit both stores; contractor handles review replies |

---

## 11. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Apple 4.2 "just a website" rejection | Native-feature layer (§5); phase-2 local bundle as fallback |
| Online dependency (remote WebView) | Native offline fallback screen; phase 2 removes it |
| Auth persistence in WebView | Verify session survives cold start early in Phase 1 |
| Push conflicting with "no spam" principle | Strictly opt-in, calm, meaningful-only; no gamification |
| Maintenance burden | Single codebase — the central reason for this approach |
| Server actions can't static-export | v1 loads live site (avoids it); phase 2 refactors to API if local bundle is pursued |

---

## 12. Out of scope (v1)

- Local static bundle / offline-first SPA (→ phase 2)
- Expo / React Native native rebuild
- Any in-app payments (forbidden by `CLAUDE.md`)
- New social / comparison / viral mechanics
- Native UI redesign — v1 is the web UI in a credible native shell

---

## 13. Future phases (not v1)

- **Phase 2:** refactor server actions → API routes; ship a local Capacitor bundle for instant load + true offline; removes online dependency and any residual 4.2 risk.
- **Phase 3 (optional):** selectively rebuild the highest-traffic screens (e.g. Journey) in native components for premium feel, keeping the rest in the WebView (hybrid).
