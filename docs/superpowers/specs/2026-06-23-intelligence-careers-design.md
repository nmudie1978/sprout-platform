# Intelligence & Security careers — additions

**Date:** 2026-06-23
**Surface:** career catalogue (`src/lib/career-pathways.ts`) + discipline map.

## Goal
Add the missing intelligence-analysis / security careers from the owner's list,
with accurate Norwegian-context data (salary, study path, growth). Existing
coverage is strong on military (Forsvaret/E-tjenesten) and police forensics but
thin on civil/strategic/commercial intelligence.

## Audit outcome
11 of ~55 unique titles already exist (Military Intelligence Analyst, Criminal
Intelligence Analyst, OSINT Analyst, SIGINT Analyst (E-tjenesten), Digital
Forensics Analyst, Malware Analyst, Intelligence Officer, Surveillance Officer,
Electronic Warfare Specialist). The rest → 24 new cards after consolidating
synonyms.

## Consolidations (owner-approved)
- **Intelligence Case Officer (HUMINT)** absorbs Case Officer / HUMINT Collector
  / Operations Officer / Field Intelligence Officer / Intelligence Operations
  Specialist.
- **Defence Intelligence Officer** absorbs Air / Naval / Army Intelligence
  Officer + Defence Intelligence Advisor.
- **Chief Intelligence Officer (Intelligence Director)** absorbs Intelligence
  Director.
- **Cyber Threat Intelligence Analyst** absorbs generic Threat Intelligence
  Analyst + Cyber Intelligence Officer + Cyber Intelligence Director.
- **Geopolitical Intelligence Analyst & Risk Consultant** absorbs Geopolitical
  Risk Consultant.
- **Protective Security & Vetting Officer** absorbs Vetting Officer + Security
  Investigator.
- **Regional & Foreign-Affairs Analyst** absorbs Cultural Intelligence
  Specialist.
- Skipped as already-covered/too-generic: Cyber Operations Officer (≈ existing
  Cyber Officer), Network Intelligence Specialist, Intelligence Software
  Engineer (≈ Software Engineer), Counterterrorism Specialist (≈ Counterterror
  Analyst + existing Counter-Terrorism Officer).

## The 24 new cards (category → discipline bucket)
**`PUBLIC_SERVICE_SAFETY`:** intelligence-analyst (pub-admin),
strategic-intelligence-analyst (pub-admin), counterterrorism-analyst
(pub-admin), intelligence-case-officer (pub-admin),
technical-surveillance-officer (pub-admin), intelligence-collection-manager
(pub-admin), counter-intelligence-officer (pub-admin),
protective-security-officer (pub-admin), chief-intelligence-officer
(pub-admin), intelligence-consultant (pub-admin),
geopolitical-intelligence-analyst (political-science-ir),
regional-affairs-analyst (political-science-ir), intelligence-linguist
(humanities-languages).

**`TECHNOLOGY_IT`:** cyber-threat-intelligence-analyst (cybersecurity),
security-intelligence-researcher (cybersecurity), insider-threat-analyst
(cybersecurity), intelligence-data-scientist (data-science-ai),
ai-intelligence-researcher (data-science-ai), intelligence-systems-architect
(computer-science-software).

**`MILITARY_DEFENCE`:** defence-intelligence-officer (military-defence),
sigint-operator (military-defence), reconnaissance-specialist
(military-defence), targeting-analyst (military-defence), geoint-analyst
(military-defence).

## Data conventions
- Norwegian-context employers (Forsvaret, E-tjenesten, PST, NSM, police, plus
  private security/consulting firms). Salaries realistic public-sector /
  tech-sector bands.
- Required integrity fields + workSetting/peopleIntensity/sector/educationRoute/
  entryRoute/gradeBand for the cluster engine.
- One `career-discipline-map.json` entry per new id (coverage test enforces).

## Scope / safety
Public, legitimate career cards only — analyst/officer roles real defence,
security and consulting employers advertise. No operational tradecraft.

## Out of scope (deferred)
- A dedicated "Intelligence" browse-filter / radar preset grouping.
