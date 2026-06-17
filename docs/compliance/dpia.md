# Data Protection Impact Assessment (DPIA) — Endeavrly

**Status: DRAFT FOR SIGN-OFF — requires review by a Norwegian privacy advisor / DPO and the controller's signature before public launch (§7).**
Prepared: 2026-06-11 · Last updated: 2026-06-17 · Controller: Endeavrly AS (Oslo, Norway) · Contact: privacy@endeavrly.no

A DPIA is **mandatory** under GDPR Art. 35 here because the processing involves
(a) large-scale processing of personal data about a **vulnerable group —
children / young people**, and (b) **profiling / personalisation** (the
AI-personalised roadmap and the AI "Career Twin"). Both appear on Datatilsynet's
list of processing that requires a DPIA.

**Regulatory frame:** Norway is in the EEA, so the GDPR applies, implemented
domestically as the **Personal Data Act (*personopplysningsloven*, 2018)**.
Supervisory authority: **Datatilsynet** (the Norwegian Data Protection Authority).

---

## 0. Launch decision — Norway-first (scope of this DPIA)

This DPIA assesses a **Norway-first launch**. That matters because the GDPR Art. 8
digital-consent age is set per country, and **Norway sets it at 13**
(*personopplysningsloven* §5). Endeavrly's eligibility floor is **15**, so **every
user is at or above Norway's self-consent age** — no guardian-consent mechanism is
required for the Norwegian audience.

If/when the service is opened to other EEA countries, the consent age rises in
some (Germany / Netherlands / Ireland = 16; France = 15; Spain = 14; Denmark /
Sweden = 13). A pan-EEA launch must re-test the lawful basis per country (see R1).
**Recommendation: launch Norway-first; treat broader-EEA rollout as a separate
assessment.**

---

## 1. Description of the processing (Art. 35(7)(a))

**What the service does:** A career-exploration platform, open to anyone aged
**15 or older** (no upper age limit; positioned for youth, typically 15–23, and
open to career-changers of any age). Users explore careers, build a personalised
roadmap, save reflections, and talk to an AI "future-self" (Career Twin) and AI
advisor.

**Personal data collected:**
| Data | Purpose | Source | Lawful basis |
|------|---------|--------|--------------|
| Email | Account identity, sign-in, password reset | User | Contract (6(1)(b)) |
| Password (bcrypt hash) | Authentication | User | Contract |
| Date of birth / age | Eligibility floor (15+) + roadmap personalisation | User | Contract / Consent |
| Country | Localisation of content/currency | User | Contract |
| Name / display name | Personalisation | User | Contract |
| Self-reported interests, strengths, subjects, reflections, saved careers, goals, interest levels, quiz/radar results | Career-exploration features | User | Contract / Consent |
| AI conversation transcripts (Career Twin, AI chat) | Provide + continue the AI experience | User + model | Contract / Consent |
| Safeguarding reports filed/received | Trust & safety | User / admin | Legal obligation / Legitimate interest |
| IP (anonymised to /24·/48 at rest), user agent, consent timestamps + version | Security, rate-limiting, consent record | Derived | Legitimate interest (6(1)(f)) |

**Special categories (Art. 9):** None intentionally collected. Free-text
reflections and AI chat *could* incidentally contain sensitive disclosures
(health, distress); see distress mitigations in §4 (R3).

**Recipients / sub-processors:**
| Sub-processor | Role | Data received | Location / transfer |
|---------------|------|---------------|---------------------|
| Supabase | Auth + database hosting | All stored personal data | EU region |
| Vercel | Application hosting | Data in transit / logs | EU region; US parent |
| OpenAI | AI generation (roadmap, Career Twin, reality summaries) | User-provided prompt content (career interest, free-text the user submits to the AI). No email/password. | **US transfer** |
| Resend | Transactional email (password reset) | Email address, message content | EU region (eu-west-1); verified domain endeavrly.com |
| Sentry | Error monitoring | Error metadata only. **Session Replay disabled** (`replaysSessionSampleRate: 0`, `replaysOnErrorSampleRate: 0`) + `sendDefaultPii: false` (`sentry.client.config.ts`) | US; **SCCs** |
| YouTube Data API | Career video search | Career keywords only — **no user PII** | US (no personal data sent) |

International transfers to US processors (OpenAI, Sentry, Vercel parent) rely on
**Standard Contractual Clauses (SCCs)** and/or the **EU-US Data Privacy
Framework** where the processor is certified. Confirm each is executed (§5.4).

**Retention:** Account data is kept until the user deletes it (soft-delete +
30-day grace → hard-purge cron, daily). AI transcripts purged at 2 years; audit
logs at 3 years. Consent records and `dateOfBirth` retention — see §5 open items.

## 2. Necessity & proportionality (Art. 35(7)(b))

- **Data minimisation:** Only data needed to run the service is collected. No
  tracking ads, no behavioural profiling for advertising, no third-party
  analytics cookies, no social/marketplace features, no public ranking. Admin
  moderation views and the GDPR data export were tightened in 2026-06 to stop
  exposing other users' contact data (see §4, R6/R7).
- **Lawful basis (Art. 6):**
  - *Contract (6(1)(b))* — core account + career-exploration features.
  - *Consent (6(1)(a))* — viable for the Norwegian audience because all users
    are ≥15, above Norway's Art. 8 digital-consent age of 13. Consent is the
    cleanest basis for the AI-personalisation/profiling layer.
  - *Legitimate interest (6(1)(f))* — security and rate-limiting on anonymised IP.
- **AI personalisation/profiling** is assessed in §3 (R2) and §5.3 — its basis
  (contract vs. separate consent) is a decision for counsel.

## 3. Risks to data subjects (Art. 35(7)(c))

| # | Risk | Affected | Likelihood | Severity |
|---|------|----------|-----------|----------|
| R1 | Under-16 minors' data processed without a valid basis in EEA countries whose consent age is 16 (DE/NL/IE) | Minors | Low (Norway-first) / Medium (pan-EEA) | High |
| R2 | AI "career advice" inaccuracy steering a young person's decision (hallucination, unverified salary/pathway data) | Minors | Medium | Medium |
| R3 | Sensitive disclosure in free-text / AI chat (distress, health) being stored/processed | Minors | Low–Med | High |
| R4 | Transfer of minors' data to a US AI sub-processor (OpenAI) | Minors | Medium | Medium |
| R5 | Account takeover exposing a minor's profile | Minors | Low | High |
| R6 | Excess retention of identifiable data (e.g. `dateOfBirth` kept indefinitely) | All | Low | Medium |
| R7 | Exposure of one user's identity/contact data to another party (moderation UI, data export) | Minors | Low | High |

## 4. Measures to mitigate (Art. 35(7)(d)) — implemented

- **Minimisation & no profiling-for-ads:** enforced in product design.
- **AI safety (R2):** Career Twin framed as "one possible future, not a
  prediction"; AI disclaimers on chat + a dedicated `/legal/disclaimer`; salary
  figures labelled "Estimated"; output passed through `isResponseSafe`
  guardrails; non-embeddable / off-topic reality videos filtered server-side.
  _Open: close the salary-freshness / link-rot data-accuracy backlog._
- **Distress handling (R3):** `classifyIntent` routes unsafe/distress inputs to a
  supportive, non-diagnostic response nudging toward a trusted adult; distress
  signals are **not** persisted into model context.
- **Transfers (R4):** SCCs documented; Sentry PII scrubbing on + **session replay
  disabled**; IP anonymised at rest; only prompt content (no credentials) sent to
  OpenAI.
- **Account security (R5):** bcrypt password hashes, JWT sessions, single-use
  hashed password-reset tokens, **Redis-backed** rate-limiting (fails closed in
  prod if Redis is unset), admin Portal on signed JWT + bcrypt.
- **Retention (R6):** soft-delete + 30-day hard-purge cron; 2-year AI-transcript
  purge; full GDPR self-service export + erasure endpoints; versioned re-consent.
- **Cross-user data exposure (R7):** moderation UI no longer renders reporter /
  reported-user emails (id + displayName only); the GDPR export redacts the
  `targetId` of users a person reported. _(Fixed 2026-06-17, this change set.)_
- **Rights:** self-service export/delete; parent/guardian channel via
  privacy@endeavrly.no (documented in the privacy & cookie policies).

## 5. Residual risk & decisions required BEFORE launch (controller / counsel)

These cannot be resolved in code and are the remaining blocker:

1. **Lawful-basis sign-off (R1).** For a **Norway-first** launch, confirm the
   basis (Consent 6(1)(a), since all users are ≥15 > Norway's age 13, and/or
   Contract 6(1)(b)) is sound and reflected in the privacy notice. For any
   later **pan-EEA** rollout, re-test per country and, where consent age is 16
   (DE/NL/IE), either secure a compliant basis or age-gate the floor to 16 there.
   _Note: CLAUDE.md records the guardian-consent gate was deliberately removed;
   re-gating is an explicit product+legal decision, not an engineering default._
2. **Approve this DPIA** and decide whether a **DPO** is required (Art. 37 —
   likely not mandatory at launch scale, but assess).
3. **Decide the AI-personalisation basis** — is profiling "necessary for the
   contract", or does it need separate consent + notice?
4. **Confirm transfer mechanisms** (SCCs / EU-US DPF) with OpenAI, Sentry,
   Vercel, Resend are executed and current.
5. **Close the data-minimisation open items:** `dateOfBirth` is purged when the
   account is purged (30 days post-deletion) but is retained for the full account
   lifetime — decide whether it must persist or can be reduced to a derived age
   once eligibility is confirmed. Also confirm whether the schema's optional
   **identity-verification** path (Vipps/BankID — collects `fullName` +
   `phoneNumber`) is enabled at launch; if so, cover it in the notice + a DPA.
6. **Operational accountability:** maintain the Art. 30 record of processing;
   ensure a personal-data breach process exists (notify Datatilsynet within
   **72 hours** of becoming aware; notify affected data subjects if high risk);
   add a success heartbeat/alert to the retention-purge cron so a silent failure
   is detected.

## 6. Process — what happens after this DPIA is populated

1. Finalise this document and decide/record the lawful basis (§5.1); update the
   public privacy notice to state it (remove "under legal review").
2. Have it **reviewed** by a Norwegian privacy advisor / lawyer (and DPO if
   appointed).
3. **Implement the §5 mitigations** that are still open before launch.
4. The **controller signs** §7 (Endeavrly AS). The DPIA is **kept on file** — it
   is **not** submitted to Datatilsynet in the normal case.
5. **Prior consultation (Art. 36)** with Datatilsynet is required **only if** the
   residual risk remains **high and cannot be mitigated**. Otherwise the service
   may launch. (Datatilsynet then has up to 8 weeks, extendable by 6, to advise.)
6. **Review** the DPIA on any material change (new data, new AI use) or at least
   annually.

## 7. Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Privacy advisor / DPO | _________ | _____ | ☐ Approve ☐ Changes needed |
| Controller (Endeavrly AS) | _________ | _____ | ☐ Approve ☐ Changes needed |

_Until both rows are signed, the platform should not be opened to the public._
