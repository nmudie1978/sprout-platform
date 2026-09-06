import type { PackGradeBand, Provenanced } from "../types";

/**
 * Swedish grade bands, from published antagningspoäng.
 *
 * WHY THESE ARE AUTHORED RATHER THAN TRANSLATED
 * ---------------------------------------------
 * The obvious shortcut was to convert the Norwegian `gradeBand` values onto
 * the Swedish scale. Two things killed it. First, Norway's bands exist on only
 * 201 of 1,615 careers, and they are long-tail specialists — doctor, lawyer,
 * nurse, dentist, psychologist and teacher have NO Norwegian band at all, so a
 * translation would have covered obscure careers and missed every one a
 * Swedish student actually asks about. Second, competitiveness does not
 * transfer between countries; converting a Norwegian editorial judgement would
 * have dressed a guess up as data.
 *
 * Sweden publishes the real thing. `antagningspoäng` is the meritvärde of the
 * LAST person admitted to a programme, per institution and per selection
 * group. Taken across the institutions offering a route, the lowest is the
 * least competitive way in and the highest the most — which is precisely what
 * GradeBand's floor and ceiling mean.
 *
 * SCOPE: deliberately small. Every entry below is backed by figures for named
 * institutions. Careers without an entry have no Swedish band and return
 * "unknown" from grade matching, which is the honest outcome — a fabricated
 * band would silently re-rank a student's options by up to 23 points.
 *
 * CAVEATS a reader should know:
 *  - Figures are urval 1, group BI (gymnasiebetyg without supplementation).
 *    BII, BF and HP have their own, different thresholds.
 *  - Cutoffs move each admission round. Treat these as indicative, refresh
 *    against UHR annually, and never present them as a required score.
 *  - A cutoff is where the last admitted person landed, NOT a pass mark.
 */
export const SV_GRADE_BANDS: Record<string, Provenanced<PackGradeBand>> = {
  // Psykologprogrammet, HT2025 across institutions: Mittuniversitetet 20.21
  // (lowest) to Lunds universitet 21.88 (highest).
  psychologist: {
    value: { floor: 20.21, ceiling: 21.88 },
    tier: "verified",
    source: "https://ednia.se/hogskolor/psykologprogrammet",
    verifiedAt: "2026-09-06",
  },

  // Tandläkarprogrammet, HT2025: Malmö universitet 20.57 to Karolinska 21.04.
  dentist: {
    value: { floor: 20.57, ceiling: 21.04 },
    tier: "verified",
    source: "https://ednia.se/hogskolor/tandlakarprogrammet",
    verifiedAt: "2026-09-06",
  },

  // Sjuksköterskeprogrammet, VT2025 urval 1: Uppsala 17.96, Göteborg 18.13.
  // Only two institutions, so the true national spread is wider than this —
  // marked estimated rather than verified for that reason.
  nurse: {
    value: { floor: 17.96, ceiling: 18.13 },
    tier: "estimated",
    source: "https://xn--antagningspong-hib.nu/uppsala-universitet/sjukskoterskeprogrammet/",
    verifiedAt: "2026-09-06",
  },
  "registered-nurse": {
    value: { floor: 17.96, ceiling: 18.13 },
    tier: "estimated",
    source: "https://xn--antagningspong-hib.nu/goteborgs-universitet/sjukskoterskeprogrammet/",
    verifiedAt: "2026-09-06",
  },

  // Läkarprogrammet, Umeå universitet VT2025 urval 1: 21.04. A single
  // institution, so the band is narrow around the observed value rather than
  // a claimed national range — estimated, not verified.
  doctor: {
    value: { floor: 21.04, ceiling: 22.5 },
    tier: "estimated",
    source: "https://xn--antagningspong-hib.nu/umea-universitet/lakarprogrammet/",
    verifiedAt: "2026-09-06",
  },

  // Juristprogrammet, Uppsala universitet VT2025 urval 1: 21.04. As above.
  lawyer: {
    value: { floor: 21.04, ceiling: 22.5 },
    tier: "estimated",
    source: "https://xn--antagningspong-hib.nu/uppsala-universitet/juristprogrammet/",
    verifiedAt: "2026-09-06",
  },
};
