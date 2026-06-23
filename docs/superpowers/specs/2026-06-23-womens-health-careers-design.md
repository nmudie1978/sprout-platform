# Women's Health & Reproductive Care careers — additions

**Date:** 2026-06-23
**Surface:** career catalogue (`src/lib/career-pathways.ts`, `HEALTHCARE_LIFE_SCIENCES`) + discipline map.

## Goal
Add the missing women's-health / reproductive-care careers from the owner's
list, with accurate Norwegian-context data (salary, study path, growth) so they
appear in browse/search/radar, get study-paths & universities (via the
discipline map), and get automatic "if you like X you also enjoy Y" links (via
the existing cluster engine — no curated list needed).

## Audit outcome
Of 43 unique titles, 11 already exist (OB-GYN, Endocrinologist, Paediatrician,
Internal Medicine Physician, General/Colorectal/Oncological/Breast Surgeon,
Midwife, Sonographer, Genetic Counsellor; Family Physician ≈ existing GP). The
rest are added below.

## Consolidations (owner-approved)
- **Reproductive Endocrinologist** absorbs *Fertility Specialist*, *IVF
  Specialist*, *Reproductive Medicine Consultant* (one specialty, many lay names).
- **Obstetric & Labour-Ward Nurse** absorbs *Labor & Delivery Nurse*.
- **Embryologist** absorbs *IVF Laboratory Scientist*.

## The 25 new careers (id → discipline bucket)
**Physician specialties / surgery → `medicine`:** gynaecologist,
reproductive-endocrinologist, maternal-fetal-medicine-specialist,
urogynaecologist, gynaecological-oncologist, menopause-specialist,
sexual-health-physician, family-planning-specialist, womens-health-physician,
adolescent-medicine-specialist, preventive-medicine-physician, andrologist,
pelvic-reconstructive-surgeon.

**Nursing & allied → `nursing-allied-health`:** certified-nurse-midwife,
womens-health-nurse-practitioner, obstetric-nurse, fertility-nurse,
neonatal-nurse, lactation-consultant, pelvic-floor-physiotherapist,
maternal-health-dietitian.

**Lab science → `biology-life-sciences`:** embryologist.

**Mental health → `psychology`:** womens-health-psychologist.

**Counselling → `social-work`:** sexual-health-counsellor, fertility-counsellor.

## Data conventions
- All in `HEALTHCARE_LIFE_SCIENCES`. British spelling to match the existing
  cluster (Gynaecologist, Urogynaecologist, …).
- **Doctors:** `educationRoute: university`, `entryRoute: profesjonsstudium`,
  `gradeBand {5,6,highly-competitive}`, salary anchored to the existing
  Obstetrician & Gynaecologist band (≈ 0.95M–1.95M kr depending on
  hospital-specialist vs generalist).
- **Nurses / allied:** bachelor- or master-entry, salary in the Registered
  Nurse → advanced-practice band (≈ 0.54M–1.15M).
- **Embryologist:** master-entry biomedical, ESHRE certification noted.
- Required fields per integrity test: title, emoji, description, avgSalary,
  educationPath, keySkills[], dailyTasks[], growthOutlook; plus workSetting,
  peopleIntensity, sector, educationRoute, entryRoute, gradeBand for richness
  (these power the cluster/related engine).
- `lastVerifiedAt`/`sourceUrl` omitted (estimates, not a fresh SSB pull) — they
  fall back to the freshness baseline.

## Also
- `career-discipline-map.json`: one entry per new id (coverage test enforces).
- Related-career links: automatic from the cluster engine — no curated map.

## Out of scope (deferred)
- "Women's Health & Reproductive Care" family browse-filter / radar preset.
- Realism-employer overrides (the healthcare hospital fallback already covers
  these roles).
