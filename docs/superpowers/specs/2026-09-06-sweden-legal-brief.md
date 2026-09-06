# Sweden launch — brief for legal counsel

**Prepared:** 2026-09-06
**Needed by:** mid-September 2026 (launch 30 September)
**Why this is urgent:** every other launch task is engineering-bound and under
our control. This one is not, and it is the likeliest single cause of a missed
date.

## What Endeavrly is

A career-exploration platform for young people. Users are **15 and over**
(`PLATFORM_MINIMUM_AGE = 15`, enforced at signup; no upper limit). It shows
careers, salary ranges, education routes, and includes an AI career assistant.
It is not a job marketplace — the small-jobs surface is disabled.

Operated by **Endeavrly AS, Oslo, Norway**. Currently launched in Norway,
Spain, Sweden and Denmark; the 30 September launch markets **Norway and
Sweden**.

## What we need

We are adding Swedish users at volume and our legal pages are Norway-only.
Specifically, `src/app/legal/{terms,privacy,disclaimer,cookies}` currently
assert:

- Governing law: **Norwegian law**
- Jurisdiction: **exclusive jurisdiction of the courts of Oslo**
- Supervisory authority: **Datatilsynet**
- Consumer complaint body: **Forbrukerrådet**
- Controller: **Endeavrly AS, Oslo**

For Swedish users we believe the equivalents are Swedish law, **IMY**
(Integritetsskyddsmyndigheten) as supervisory authority, and **ARN**
(Allmänna reklamationsnämnden) as consumer body — but that is our
assumption, not advice, and the point of this brief.

## Questions

1. **Controller and establishment.** Endeavrly AS is Norwegian. Serving
   Swedish minors at volume — does GDPR's one-stop-shop apply with
   Datatilsynet as lead authority, or do we need a Swedish establishment
   or representative? Does IMY become directly competent?
2. **Governing law and jurisdiction.** Can the terms keep Norwegian law and
   Oslo jurisdiction for Swedish consumers, given consumer-protection rules
   that preserve local forum rights? Should the clause be per-country?
3. **Age of consent.** Our floor is a flat **15**, above the digital-consent
   age in both countries (we understand 13 in each). Is the flat floor
   defensible, and does the guardian-consent write-gate need to differ for
   Sweden?
4. **AI assistant.** The product includes an AI career assistant used by
   minors, with a crisis-detection path that surfaces country-specific
   helplines. Any Swedish-specific duties — and does the AI Act's
   transparency obligation bite here?
5. **Profiling.** Career matching profiles minors (interests, grades,
   preferences) to rank careers. Any constraint on profiling under-18s in
   Sweden beyond the GDPR baseline?
6. **Documents to change.** Do we need a separate Swedish privacy notice and
   terms, or one document with per-country annexes? Does either need Swedish
   translation as a legal matter (we have a `sv` locale)?

## What we will do with the answer

Extract a `src/lib/legal/jurisdictions.ts` carrying governing law, courts,
supervisory authority, consumer body, controller entity and emergency numbers
per country, and parameterise the four legal pages. The engineering is small;
the content is what we need from you.

## Also worth flagging

`docs/compliance/dpia.md` was written for a Norway-first launch. It likely
needs a Swedish addendum or a redo — please advise which.
