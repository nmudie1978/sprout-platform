# Mobile App — Phase 1: Capacitor Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce runnable iOS and Android apps that wrap the live Endeavrly web app (`https://endeavrly.com`) in a native Capacitor shell, with app icons and a splash screen, verified to launch and stay logged in on a simulator/emulator.

**Architecture:** Capacitor generates native iOS (Xcode) and Android (Android Studio) projects whose WebView loads the live production site via `server.url`. Phase 1 is **purely additive native scaffolding** — it adds Capacitor config + native projects + a placeholder web dir, and touches **no shared Next.js/web code** (so it cannot affect the live website). Native UX tuning (status bar, push, offline, etc.) is Phase 2.

**Tech Stack:** Capacitor 6 (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`), `@capacitor/assets` for icon/splash generation, Vitest for the config guard test. Existing app is Next 16 + React 19.

**Prerequisites (one-time, on this Mac):**
- Xcode installed + `xcode-select --install` + CocoaPods (`sudo gem install cocoapods` or `brew install cocoapods`)
- Android Studio installed with an SDK + at least one AVD (emulator) created
- An iOS Simulator available (comes with Xcode)
- Apple Developer + Google Play accounts already exist (done) — not needed until Phase 4 submission

**Dev tip (not a task):** To test against your local dev server instead of production, temporarily set `server.url` to `http://<your-LAN-IP>:3000` and `server.cleartext = true`, run `next dev`, then `npx cap sync`. Revert before committing.

---

### Task 1: Install Capacitor dependencies

**Files:**
- Modify: `package.json` (dependencies added by npm)

- [ ] **Step 1: Install runtime + CLI + platform packages**

Run:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm install -D @capacitor/assets
```
Expected: installs succeed; `package.json` gains `@capacitor/*` entries.

- [ ] **Step 2: Verify the CLI resolves**

Run: `npx cap --version`
Expected: prints a version like `6.x.x` with no error.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build(mobile): add Capacitor core, CLI, iOS, Android, assets deps"
```

---

### Task 2: Create the placeholder web directory

Capacitor requires a `webDir` containing an `index.html`, even though the app loads the live site over the network. This placeholder is only shown for the brief moment before the remote URL loads (and is the natural home for the Phase 2 offline fallback).

**Files:**
- Create: `mobile/www/index.html`

- [ ] **Step 1: Create the placeholder page**

Create `mobile/www/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover"
    />
    <title>Endeavrly</title>
    <style>
      html,
      body {
        margin: 0;
        height: 100%;
        background: #9bccd4;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #0b2b30;
      }
    </style>
  </head>
  <body>
    <p>Loading Endeavrly…</p>
  </body>
</html>
```

- [ ] **Step 2: Verify the file exists**

Run: `cat mobile/www/index.html | head -1`
Expected: prints `<!doctype html>`.

- [ ] **Step 3: Commit**

```bash
git add mobile/www/index.html
git commit -m "build(mobile): add Capacitor webDir placeholder page"
```

---

### Task 3: Create the Capacitor config (TDD)

**Files:**
- Create: `tests/mobile/capacitor-config.test.ts`
- Create: `capacitor.config.ts`

- [ ] **Step 1: Write the failing guard test**

Create `tests/mobile/capacitor-config.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import config from "../../capacitor.config";

describe("capacitor.config", () => {
  it("uses the Endeavrly app identity", () => {
    expect(config.appId).toBe("com.endeavrly.app");
    expect(config.appName).toBe("Endeavrly");
    expect(config.webDir).toBe("mobile/www");
  });

  it("loads the live production site over HTTPS only", () => {
    expect(config.server?.url).toBe("https://endeavrly.com");
    expect(config.server?.cleartext).toBe(false);
  });

  it("restricts in-app navigation to Endeavrly domains", () => {
    const allow = config.server?.allowNavigation ?? [];
    expect(allow).toContain("endeavrly.com");
    expect(allow).toContain("*.endeavrly.com");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- tests/mobile/capacitor-config.test.ts`
Expected: FAIL — cannot resolve module `../../capacitor.config` (file does not exist yet).

- [ ] **Step 3: Create the config**

Create `capacitor.config.ts`:
```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.endeavrly.app",
  appName: "Endeavrly",
  // Placeholder bundle shown briefly before the remote site loads.
  webDir: "mobile/www",
  server: {
    // Phase 1: the WebView loads the live production app. Every web deploy
    // updates the app instantly with no store resubmission.
    url: "https://endeavrly.com",
    // Top-level navigations are confined to Endeavrly domains; external
    // links (universities, YouTube, etc.) open in the system browser.
    allowNavigation: ["endeavrly.com", "*.endeavrly.com"],
    // HTTPS only — never allow plaintext in committed config.
    cleartext: false,
  },
};

export default config;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:run -- tests/mobile/capacitor-config.test.ts`
Expected: PASS — all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add capacitor.config.ts tests/mobile/capacitor-config.test.ts
git commit -m "build(mobile): add Capacitor config (loads live site) + guard test"
```

---

### Task 4: Add the iOS and Android native platforms

**Files:**
- Create: `ios/` (generated native Xcode project)
- Create: `android/` (generated native Android Studio project)

- [ ] **Step 1: Add the iOS platform**

Run: `npx cap add ios`
Expected: creates `ios/` and runs `pod install`; ends with "sync finished" / no error. (If CocoaPods is missing, install it per Prerequisites and re-run.)

- [ ] **Step 2: Add the Android platform**

Run: `npx cap add android`
Expected: creates `android/`; ends with "sync finished" / no error.

- [ ] **Step 3: Sync the web layer + config into both platforms**

Run: `npx cap sync`
Expected: "Copying web assets from mobile/www" + "Updating iOS/Android" with no error.

- [ ] **Step 4: Verify the generated `.gitignore` files exist**

Run: `test -f ios/.gitignore && test -f android/.gitignore && echo OK`
Expected: prints `OK` (Capacitor generates these to exclude Pods/build artifacts).

- [ ] **Step 5: Commit the native projects**

```bash
git add ios android
git commit -m "build(mobile): add generated iOS and Android Capacitor projects"
```

---

### Task 5: Generate app icons and splash screen

**Files:**
- Create: `assets/icon.png` (1024×1024, square, brand mark on solid background)
- Create: `assets/splash.png` (2732×2732, brand mark centred on `#9BCCD4`)
- Create: `assets/splash-dark.png` (2732×2732, brand mark centred on `#0a0a0a`)
- Modify: `ios/` and `android/` icon/splash resources (generated by the tool)

- [ ] **Step 1: Create the three source assets**

Produce the three PNGs at the exact sizes above using the existing brand (the emerald `Navigation2` mark + `#9BCCD4` light brand colour, matching `src/app/icon.tsx` and the layout `themeColor`). Export from your design tool or generate from the existing brand mark. Place them in a new `assets/` directory at the repo root.

Verify: `file assets/icon.png` reports `1024 x 1024`, and both splash files report `2732 x 2732`.

- [ ] **Step 2: Generate platform icon/splash sets**

Run: `npx @capacitor/assets generate --iconBackgroundColor "#9BCCD4" --splashBackgroundColor "#9BCCD4" --splashBackgroundColorDark "#0a0a0a"`
Expected: writes icon and splash resources into `ios/App/App/Assets.xcassets` and `android/app/src/main/res/*`; prints a success summary with no error.

- [ ] **Step 3: Sync the generated assets**

Run: `npx cap sync`
Expected: "sync finished" with no error.

- [ ] **Step 4: Commit**

```bash
git add assets ios android
git commit -m "build(mobile): app icons + splash screen from Endeavrly brand"
```

---

### Task 6: Add Capacitor npm scripts

**Files:**
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Add the scripts**

In `package.json`, add these four entries to the `"scripts"` object (place them after `"test:coverage"`):
```json
    "cap:sync": "cap sync",
    "cap:ios": "cap run ios",
    "cap:android": "cap run android",
    "cap:assets": "capacitor-assets generate --iconBackgroundColor \"#9BCCD4\" --splashBackgroundColor \"#9BCCD4\" --splashBackgroundColorDark \"#0a0a0a\"",
```

- [ ] **Step 2: Verify the scripts parse**

Run: `npm run cap:sync`
Expected: runs `cap sync` and prints "sync finished" with no error.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "build(mobile): add cap:sync / cap:ios / cap:android / cap:assets scripts"
```

---

### Task 7: Verify on the iOS Simulator

This is a manual verification task — the deliverable is a screenshot and confirmed behaviour, not code.

- [ ] **Step 1: Launch on a simulator**

Run: `npm run cap:ios`
(When prompted, pick an iPhone Simulator with a notch, e.g. iPhone 15.)
Expected: Xcode build succeeds; the Simulator boots; the Endeavrly app launches showing the splash, then the live site loads.

- [ ] **Step 2: Confirm the live app loads**

In the Simulator, confirm the Endeavrly landing/sign-in screen renders (not a blank page or the placeholder "Loading Endeavrly…").

- [ ] **Step 3: Confirm login + session persistence**

Sign in with an email/password test account. Then fully quit the app in the Simulator (swipe up / stop and relaunch via `npm run cap:ios`).
Expected: on relaunch you are **still signed in** (Supabase session cookie persisted in the WebView).

- [ ] **Step 4: Capture a screenshot**

In the Simulator: Device → Screenshot (or `Cmd+S`). Save it to `docs/superpowers/plans/assets/phase1-ios.png`.

- [ ] **Step 5: Note any safe-area overlap**

Check whether the top header or bottom navigation sits under the notch/status bar or home indicator. Record the result in the commit message below. (Fixing overlap is deferred to the Phase 2 StatusBar plugin — do **not** edit shared web CSS here.)

- [ ] **Step 6: Commit the screenshot**

```bash
mkdir -p docs/superpowers/plans/assets
git add docs/superpowers/plans/assets/phase1-ios.png
git commit -m "test(mobile): iOS simulator verification screenshot (safe-area: <ok|overlap noted>)"
```

---

### Task 8: Verify on the Android Emulator

- [ ] **Step 1: Launch on an emulator**

Run: `npm run cap:android`
(Ensure an AVD is running or selectable.)
Expected: Gradle build succeeds; the emulator launches the Endeavrly app showing the splash, then the live site loads.

- [ ] **Step 2: Confirm the live app loads**

Confirm the Endeavrly landing/sign-in screen renders.

- [ ] **Step 3: Confirm login + session persistence**

Sign in, fully close the app, relaunch via `npm run cap:android`.
Expected: still signed in on relaunch.

- [ ] **Step 4: Capture a screenshot**

Use the emulator's screenshot control. Save to `docs/superpowers/plans/assets/phase1-android.png`.

- [ ] **Step 5: Commit the screenshot**

```bash
git add docs/superpowers/plans/assets/phase1-android.png
git commit -m "test(mobile): Android emulator verification screenshot"
```

---

### Task 9: Final Phase 1 verification

- [ ] **Step 1: Run the full test suite + typecheck**

Run:
```bash
npm run test:run
npm run typecheck
```
Expected: all tests pass (including the new `tests/mobile/capacitor-config.test.ts`); typecheck clean.

- [ ] **Step 2: Confirm no shared web code changed**

Run: `git diff --name-only main...HEAD -- src/ next.config.js`
Expected: **no output** — Phase 1 touched only `capacitor.config.ts`, `mobile/`, `ios/`, `android/`, `assets/`, `tests/mobile/`, `package.json`, and `docs/`. (If anything under `src/` appears, that is a Phase 1 scope violation — revert it.)

- [ ] **Step 3: Phase 1 complete**

The apps build and run on both platforms, load the live site, and keep the user signed in. Ready for Phase 2 (native-feature layer + `DeviceToken` backend).

---

## Self-Review notes (author)

- **Spec coverage (Phase 1 rows of §10):** Capacitor added ✓ (Tasks 1–4), loads endeavrly.com on both platforms ✓ (Tasks 7–8), icons + splash ✓ (Task 5), auth persists ✓ (Tasks 7–8 Step 3), internal build runs ✓ (Tasks 7–8). Bundle IDs (`com.endeavrly.app`) set in Task 3.
- **Out of scope here (correctly deferred):** push/`DeviceToken` backend, offline screen, biometric, share, deep links, status-bar/safe-area tuning, store assets, privacy labels, submission — all Phase 2+.
- **Type consistency:** `appId` `com.endeavrly.app`, `webDir` `mobile/www`, `server.url` `https://endeavrly.com` are identical across the config (Task 3), the guard test (Task 3), and the verification grep (Task 9).
- **No shared-web-code changes:** enforced by Task 9 Step 2 — keeps the live website untouched.
