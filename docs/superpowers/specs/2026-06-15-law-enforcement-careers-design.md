# Law Enforcement & Investigation careers + Genetics/Forensics radar grouping

Date: 2026-06-15
Branch: `feat/law-enforcement-careers` (worktree, based off `feat/dna-genetics-careers`)

## Context

The owner asked for two large career batches: a **Genetics & Biotechnology**
cluster and a **Law Enforcement & Investigation** cluster (policing, detective,
forensics, intelligence, cyber-crime, counter-terror, border).

A parallel session already implemented and committed the **genetics half**
(60 careers, `bb935c5`, "one card per line"). This spec covers the **remaining
work**, which this branch owns:

1. The **Law Enforcement & Investigation** careers (curated).
2. Two **radar preset** groupings so both clusters are discoverable.
3. Realism employers for the new law-enforcement roles.

Owner decisions (this session): **fold into existing categories** (no new
`CareerCategory` enum) and **curate sensibly** (collapse seniority ladders and
synonyms; seniority shown via the salary curve, not separate cards).

## Placement

- Law-enforcement roles → `PUBLIC_SERVICE_SAFETY` (police/safety already lives
  there; the genetics session also placed `forensic-dna-analyst`,
  `crime-laboratory-geneticist`, `dna-evidence-specialist` there).
- No new `CareerCategory` — adding one forces edits across the exhaustive
  `Record<CareerCategory, _>` tables, matching weights, labels and radar
  sectors. Established pattern is to fold in and group via radar presets.

## Curated career set (~32 net-new)

Skipped because they already exist: `police-officer`, `detective`,
`forensic-scientist`, `forensic-dna-analyst`, `crime-laboratory-geneticist`,
`dna-evidence-specialist`, `customs-officer`, `immigration-officer`,
`coast-guard-officer`, `corrections-officer`, `probation-officer`,
`digital-forensics-analyst`.

- **Policing:** roads-policing-officer, police-dog-handler, mounted-police-officer,
  armed-response-officer, public-order-officer
- **Detective / Investigation:** homicide-detective, financial-crime-investigator,
  cybercrime-investigator, organized-crime-investigator, counter-terrorism-officer,
  anti-corruption-investigator, drug-enforcement-investigator,
  human-trafficking-investigator, wildlife-crime-investigator
- **Forensics & CSI:** crime-scene-investigator, fingerprint-examiner,
  ballistics-expert, forensic-toxicologist, bloodstain-pattern-analyst
- **Intelligence:** intelligence-officer, criminal-intelligence-analyst,
  surveillance-officer, undercover-officer, osint-analyst, crime-analyst,
  criminal-profiler
- **Specialist:** hostage-negotiator, close-protection-officer,
  bomb-disposal-officer, anti-money-laundering-investigator
- **Cyber:** malware-analyst
- **Border:** border-force-officer

Collapsed ladders/synonyms (one card each, seniority via salary curve):
Detective Constable→Chief Inspector → existing `detective`; Fraud/Financial
Crime/AML kept as financial-crime-investigator + anti-money-laundering-investigator;
Tactical Firearms/SWAT → armed-response-officer; Riot Control → public-order-officer;
Computer Forensics / Digital Evidence → existing digital-forensics-analyst.

## Per-career data

Norway-first: Politiet, Kripos (NCIS), PST (security service), Økokrim
(economic & environmental crime), Tolletaten (customs), E-tjenesten,
Politihøgskolen (3-yr bachelor) as the entry route. Real `keySkills` /
`dailyTasks`, explicit `workSetting` / `peopleIntensity` / `sector`, valid
`entryRoute` + `gradeBand` (per the recent data-quality sweep). `avgSalary`
best-effort (unverified → freshness disclaimer). No `pathType` (matches the
existing `police-officer`, which carries none, so the dedicated-route links
don't misfire).

## Realism employers

New `src/lib/career-employers-realism-lawenforcement.ts`
(`REALISM_EMPLOYERS_LAWENF: Record<string, Employer[]>`), wired into
`getTopEmployers` and the has-employer guard in `career-employers.ts` (same
pattern as `REALISM_EMPLOYERS_AI` etc.). Real Norwegian agencies.

## Radar presets (grouping)

`src/components/discovery/career-radar.tsx`:

- `PRESET_GENETICS_BIOTECH` — the 60 genetics IDs from `bb935c5`.
- `PRESET_FORENSICS_INVESTIGATION` — the 32 new law-enforcement IDs ∪ existing
  forensic/policing IDs (police-officer, detective, forensic-scientist,
  forensic-dna-analyst, crime-laboratory-geneticist, dna-evidence-specialist,
  digital-forensics-analyst, customs-officer, immigration-officer,
  corrections-officer, probation-officer, border-force-officer).

Wire each into `PresetFilterKey`, `PRESET_FILTER_OPTIONS` (labels "Genetics &
Biotechnology", "Forensics & Investigation"), and the `matchesPreset` switch
(id-Set membership, like the other curated presets).

## Out of scope / deferred (flag to owner)

- **Genetics curation** — the parallel session committed the uncurated 60
  (e.g. `medical-geneticist`+`clinical-geneticist`, `crispr-engineer`+
  `gene-editing-scientist`+`crispr-research-scientist`, `crop-improvement-scientist`+
  `livestock-breeding-specialist`, `digital-biology-scientist`,
  `human-enhancement-researcher`). Reconciling that to "curate sensibly" means
  deleting another session's just-committed cards across branches — too risky to
  do unsupervised. Left as an owner decision.
- The duplicate genetics copy on the main line (`528932a`, no realism modules)
  vs the canonical `feat/dna-genetics-careers` (`bb935c5`) needs owner reconcile.

## Verification

Integrity suite (`career-data-integrity.test.ts` — dup/divergent/malformed
guard), `career-employers.test.ts`, `career-dna.test.ts`, `tsc --noEmit`.
