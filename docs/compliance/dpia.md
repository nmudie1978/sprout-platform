# Data Protection Impact Assessment (DPIA) — Endeavrly

**Status: DRAFT — requires DPO / legal counsel review and sign-off before public launch.**
Prepared: 2026-06-11 · Controller: Endeavrly AS · Contact: privacy@endeavrly.no

This DPIA addresses launch-audit compliance blocker #2. A DPIA is **mandatory**
under GDPR Art. 35 here because the processing involves (a) large-scale
processing of a **vulnerable group — children/young people**, and (b)
**profiling/personalisation** (AI-personalised roadmaps and the Career Twin).
It must be completed and signed before serving the public.

---

## 1. Description of the processing (Art. 35(7)(a))

**What the service does:** A career-exploration platform for people aged 15–30.
Users explore careers, build a personalised roadmap, and talk to an AI
"future-self" (Career Twin) and AI advisor.

**Personal data collected:**
| Data | Purpose | Source |
|------|---------|--------|
| Email | Account identity, sign-in, password reset | User |
| Password (bcrypt hash) | Authentication | User |
| Date of birth / age | Eligibility floor (15–30) + roadmap personalisation | User |
| Country | Localisation of content/currency | User |
| Name / display name | Personalisation | User |
| Self-reported interests, strengths, subjects, reflections, saved careers, goals | Career exploration features | User |
| AI conversation transcripts (Career Twin, chat) | Provide + continue the AI experience | User + model |
| IP (anonymised /24·/48 at rest), user agent, consent timestamps | Security, rate-limiting, consent record | Derived |

**Special categories:** None intentionally collected. Free-text reflections /
AI chat could incidentally contain sensitive disclosures; mitigations in §4.

**Recipients / sub-processors:** Supabase (DB hosting, EU region); Vercel
(hosting); OpenAI (AI generation — **US transfer**); Resend (transactional
email); Sentry (error monitoring; **session replay disabled** — no DOM
recording). International transfers rely on SCCs (documented in the privacy
policy).

**Retention:** Account data until deletion (soft-delete + 30-day grace → hard
purge cron). AI transcripts purged at 2 years; audit logs at 3 years; consent
records — _add to purge job (open item)_.

## 2. Necessity & proportionality (Art. 35(7)(b))

- **Data minimisation:** Only the data needed to run the service is collected;
  no tracking ads, no behavioural profiling for advertising, no social/
  marketplace features, no third-party analytics cookies.
- **Lawful basis (Art. 6):** Performance of a contract (Art. 6(1)(b)) for core
  account + career-exploration features; legitimate interest (Art. 6(1)(f)) for
  security/rate-limiting on anonymised IP. **AI personalisation/profiling**
  needs its own necessity test — see §3/§5.
- **Age / Art. 8 (children's consent):** The platform serves under-18s from age
  15. GDPR Art. 8 sets the digital-consent age at **13–16 per member state**
  (Norway 13; Spain 14; Germany/Netherlands/Ireland 16; France 15). **Open
  decision for counsel (§5).**

## 3. Risks to data subjects (Art. 35(7)(c))

| # | Risk | Affected | Likelihood | Severity |
|---|------|----------|-----------|----------|
| R1 | Under-16 minors' data processed without a valid lawful basis where local consent age is 16 (DE/NL/IE) | Minors | Medium | High |
| R2 | AI "career advice" inaccuracy steering a young person's life decision (hallucination, unverified salary/pathway data) | Minors | Medium | Medium |
| R3 | Sensitive disclosure in free-text/AI chat (distress, health) being stored/processed | Minors | Low–Med | High |
| R4 | Transfer of minors' data to a US AI sub-processor (OpenAI) | Minors | Medium | Medium |
| R5 | Account takeover exposing a minor's profile | Minors | Low | High |
| R6 | Excess retention of identifiable data | All | Low | Medium |

## 4. Measures to mitigate (Art. 35(7)(d)) — implemented

- **Minimisation & no profiling-for-ads:** enforced in product design.
- **AI safety (R2):** Career Twin framed as "one possible future, not a
  prediction"; AI disclaimers on chat + a dedicated `/legal/disclaimer`; salary
  figures labelled "Estimated"; output passed through `isResponseSafe`
  guardrails. _Open: close the salary-freshness / link-rot data-accuracy backlog._
- **Distress handling (R3):** `classifyIntent` routes unsafe/distress inputs to a
  supportive, non-diagnostic response with a nudge to a trusted adult; distress
  signals are NOT persisted into model context.
- **Transfers (R4):** SCCs documented; Sentry PII off + **session replay
  disabled**; IP anonymised at rest.
- **Account security (R5):** bcrypt passwords, JWT sessions, single-use hashed
  password-reset tokens, rate-limited auth, admin Portal on signed JWT + bcrypt.
- **Retention (R6):** soft-delete + 30-day purge cron; 2-year AI-transcript
  purge; full GDPR export + erasure endpoints; versioned re-consent.
- **Rights:** self-service export/delete; parent/guardian channel via
  privacy@endeavrly.no (documented in the privacy & cookie policies).

## 5. Residual risk & decisions required BEFORE launch (owner / counsel)

These cannot be resolved in code and are the blocker:

1. **Lawful-basis sign-off for under-16s (R1).** Counsel to confirm Art. 6(1)(b)
   (contract) genuinely covers under-16 processing — including AI
   personalisation — in each target country, **or** age-gate the signup floor to
   16 in member states whose consent age is 16 (DE/NL/IE). _Note: CLAUDE.md
   records the guardian-consent gate was deliberately removed; any re-gating is
   an explicit product+legal decision, not an engineering one._
2. **Approve this DPIA** and assign a DPO/owner.
3. **Decide AI-personalisation basis** — is profiling "necessary for the
   contract", or does it need a separate basis/notice?
4. **Confirm SCCs** with OpenAI/Sentry/Resend/Vercel are executed and current.

## 6. Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| DPO / Legal | _________ | _____ | ☐ Approve ☐ Changes needed |
| Product owner | _________ | _____ | ☐ Approve ☐ Changes needed |

_Until both rows are signed, the platform should not be opened to the public in
member states where the lawful basis for under-16 processing is unresolved._
