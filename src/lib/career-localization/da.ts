import type { CareerLocalizationEntry } from "./types";

/**
 * Denmark per-career overrides (Approach A). Real, CITED data only — any figure
 * that cannot be verified is OMITTED (suppressed), never invented. Careers with
 * no entry render with `isLocalized: false` (salary + Norwegian education path
 * suppressed). See docs/superpowers/specs/2026-06-16-nordic-salary-data.md
 *
 * salary: APPROXIMATE gross MONTHLY ranges (kr/md.) from Danish sources — mostly
 *   loen.dk (Danmarks Statistik LONS20, P25–P75 interquartile), plus union /
 *   sector sources. PENDING OWNER REVIEW.
 * educationPath: the typical Danish route (ungdomsuddannelse → universitet /
 *   professionshøjskole / erhvervsuddannelse), from official institution pages.
 *
 * Note: electrician/plumber figures are derived from hourly rates published by
 *   workplacedenmark.dk (Danmarks Statistik) — treat as approximate.
 */
export const DA_CAREER_LOCALIZATION: Record<string, CareerLocalizationEntry> = {
  "software-developer": {
    description:
      "Som softwareudvikler designer og bygger du digitale produkter og systemer – fra mobilapps til komplekse virksomhedsplatforme.",
    salary: {
      value: "35.000–55.000 kr/md.",
      source:
        "https://studerende.ida.dk/snart-nyuddannet/loen/softwareudvikler-loen-din-kommende-startloen/",
    },
    educationPath: {
      value:
        "Gymnasial uddannelse (STX/HTX/HHX) efterfulgt af en professionsbachelor i softwareudvikling (3,5 år) eller en civilingeniøruddannelse i softwareteknologi (5 år).",
      source: "https://www.ucn.dk/uddannelser/softwareudvikling/job-og-karriere/",
    },
  },
  "registered-nurse": {
    description:
      "Som sygeplejerske plejer og behandler du patienter, koordinerer pleje og er en central del af sundhedsteamet på hospitaler og i kommuner.",
    salary: {
      value: "28.800–34.200 kr/md.",
      source: "https://ansogningshjaelpen.dk/sygeplejerske-loen-2025-komplet-guide/",
    },
    educationPath: {
      value:
        "Gymnasial uddannelse (eller SOSU-assistent) efterfulgt af en 3,5-årig professionsbachelor som sygeplejerske, der giver autorisation fra Styrelsen for Patientsikkerhed.",
      source: "https://www.ucsyd.dk/uddannelse/sygeplejerske",
    },
  },
  electrician: {
    description:
      "Som elektriker installerer og vedligeholder du elektriske anlæg i boliger, erhvervsbygninger og industri – et håndværk med stor efterspørgsel.",
    salary: {
      value: "ca. 38.000–52.000 kr/md. (afledt af timeløn)",
      source:
        "https://workplacedenmark.dk/da/working-conditions/pay-and-working-hours/hourly-rate-electricians",
    },
    educationPath: {
      value:
        "Erhvervsuddannelse (EUD): grundforløb 1+2 efterfulgt af et vekslende hovedforløb med skoleperioder og læreplads, i alt ca. 4 år, afsluttet med svendebrev.",
      source: "https://eucnordvest.dk/eud-eux-teknisk/erhvervsuddannelser/elektriker/",
    },
  },
  plumber: {
    description:
      "Som VVS-montør installerer og servicerer du varme-, ventilations- og sanitetsanlæg – et håndværk med faste jobs og gode overenskomstlønninger.",
    salary: {
      value: "ca. 38.000–55.000 kr/md. (afledt af timeløn)",
      source:
        "https://workplacedenmark.dk/da/working-conditions/pay-and-working-hours/hourly-rate-plumbers",
    },
    educationPath: {
      value:
        "Erhvervsuddannelse (EUD) via VVS-energiuddannelsens grundforløb 2 og et vekslende hovedforløb (skole + læreplads), i alt ca. 4 år, afsluttet med svendebrev.",
      source: "https://vvs-energiuddannelsen.dk/vvs-og-blikkenslager/",
    },
  },
  carpenter: {
    description:
      "Som tømrer opfører og renoverer du trækonstruktioner i byggeriet – fra tage og facader til indvendigt snedkerarbejde.",
    salary: {
      value: "30.000–38.000 kr/md.",
      source: "https://dagensnyt.dk/toemrer-loen/",
    },
    educationPath: {
      value:
        "Erhvervsuddannelse (EUD) som tømrer (Træfagenes Byggeuddannelse): grundforløb 1+2 efterfulgt af et vekslende hovedforløb, i alt 3,5–4,5 år, afsluttet med svendeprøve.",
      source: "https://eucnordvest.dk/eud-eux/teknisk/toemrer/",
    },
  },
  doctor: {
    description:
      "Som læge undersøger, diagnosticerer og behandler du patienter – et krævende og meningsfyldt fag med stor indflydelse på menneskers liv og helbred.",
    salary: {
      value: "40.000–57.000 kr/md. (nyuddannet til speciallæge)",
      source: "https://dagensnyt.dk/laege-loen/",
    },
    educationPath: {
      value:
        "6-årig universitetsuddannelse i medicin (3 år bachelor + 3 år kandidat, cand.med.) efterfulgt af 12 måneders Klinisk Basisuddannelse (KBU); autorisation fra Styrelsen for Patientsikkerhed.",
      source: "https://www.sdu.dk/da/uddannelse/bachelor/medicin",
    },
  },
  solicitor: {
    description:
      "Som advokat rådgiver og repræsenterer du klienter i juridiske sager – fra erhvervsret og kontrakter til straffesager og familieretlige tvister.",
    salary: {
      value: "57.890–93.281 kr/md. (P25–P75)",
      source: "https://loen.dk/advokat",
    },
    educationPath: {
      value:
        "5-årig juridisk universitetsuddannelse (BA.jur. + cand.jur.) efterfulgt af 3 års arbejde som advokatfuldmægtig, Advokatuddannelsen og bestået prøve; beskikkelse fra Justitsministeriet.",
      source: "https://www.advokatsamfundet.dk/uddannelse/sadan-bliver-du-advokat/",
    },
  },
  accountant: {
    description:
      "Som revisor hjælper du virksomheder med regnskab, revision og skatterådgivning – en nøglerolle i erhvervslivet med vej til statsautoriseret revisor.",
    salary: {
      value: "50.100–78.900 kr/md. (P25–P75)",
      source: "https://loen.dk/revisor",
    },
    educationPath: {
      value:
        "HA-bachelor (3 år) → kandidat cand.merc.aud. (2 år, på CBS, SDU, AU eller AAU) → min. 3 års erfaring → bestået statsautorisationseksamen hos Erhvervsstyrelsen.",
      source: "https://www.fsr.dk/blivrevisor",
    },
  },
  psychologist: {
    description:
      "Som psykolog udreder, behandler og rådgiver du mennesker med psykiske udfordringer – i klinik, skoler, virksomheder eller forskning.",
    salary: {
      value: "45.100–58.900 kr/md. (P25–P75)",
      source: "https://loen.dk/psykolog",
    },
    educationPath: {
      value:
        "3-årig bachelor i psykologi efterfulgt af en 2-årig kandidat (cand.psych.); herefter kræves autorisation fra Styrelsen for Patientsikkerhed.",
      source:
        "https://stps.dk/sundhedsfaglig/autorisation/soeg-autorisation/psykolog/psykolog-uddannet-i-danmark",
    },
  },
  "police-officer": {
    description:
      "Som politibetjent opretholder du lov og orden, efterforsker forbrydelser og hjælper borgere – et varieret job med høj mening og samfundsansvar.",
    salary: {
      value: "41.600–50.000 kr/md. (P25–P75)",
      source: "https://loen.dk/politibetjent",
    },
    educationPath: {
      value:
        "3-årig politibetjentuddannelse (professionsbachelor) på Politiskolen med vekslende skole og praktik; kræver gymnasial/erhvervsfaglig uddannelse, dansk statsborgerskab og kørekort.",
      source: "https://politi.dk/om-politiet/politiskolen/politibetjent",
    },
  },
  chef: {
    description:
      "Som kok tilbereder du mad på restauranter, hoteller og cateringvirksomheder – et kreativt håndværk, der forener teknik, smag og gæstfrihed.",
    salary: {
      value: "28.700–40.100 kr/md. (P25–P75)",
      source: "https://loen.dk/kok",
    },
    educationPath: {
      value:
        "Erhvervsuddannelse (EUD) som gastronom med speciale kok – ca. 4 år og 3 måneder med vekslende skole og praktik; kræver folkeskolens afgangseksamen (min. 2,0 i dansk og matematik).",
      source:
        "https://www.3f.dk/find-svar/uddannelse/erhvervsuddannelse/erhvervsuddannelser-inden-for-3fs-omraader/bliv-uddannet-gastronom",
    },
  },
  hairdresser: {
    description:
      "Som frisør skaber du stil og selvtillid – du klipper, farver og former hår og bygger tætte relationer med dine kunder i salonen.",
    salary: {
      value: "29.250–39.356 kr/md. (P25–P75)",
      source: "https://loen.dk/frisoer",
    },
    educationPath: {
      value:
        "Frisøruddannelsen er en 4-årig erhvervsuddannelse (EUD/EUX) med grundforløb på erhvervsskole og oplæring i salon – søg via optagelse.dk.",
      source: "https://www.blivfrisor.dk/",
    },
  },
  "data-analyst": {
    description:
      "Som dataanalytiker omsætter du store datamængder til indsigter og beslutningsgrundlag, der driver virksomhedens strategi fremad.",
    salary: {
      value: "58.500–88.000 kr/md. (P25–P75)",
      source: "https://loen.dk/data-analyst",
    },
    educationPath: {
      value:
        "Typisk en professionsbachelor i dataanalyse (1½ år top-up) eller en bachelor i datalogi/HA(it.) efterfulgt af kandidat – søg via optagelse.dk.",
      source: "https://www.ek.dk/videregaaende-uddannelser/dataanalyse",
    },
  },
  "civil-engineer": {
    description:
      "Som bygningsingeniør projekterer og overvåger du byggerier og anlægsarbejder – fra boliger til broer og infrastruktur.",
    salary: {
      value: "51.500–76.400 kr/md. (P25–P75)",
      source: "https://loen.dk/bygningsingenioer",
    },
    educationPath: {
      value:
        "Civilingeniøruddannelsen er en 5-årig universitetsuddannelse (bachelor + kandidat) inden for fx byggeteknik på DTU, AAU eller SDU – søg via optagelse.dk.",
      source:
        "https://studerende.ida.dk/snart-nyuddannet/loen/civilingenioer-loen-hvad-tjener-du-som-nyuddannet/",
    },
  },
  "graphic-designer": {
    description:
      "Som grafisk designer formgiver du visuelle fortællinger – fra logoer og kampagner til digitale interfaces – og skaber udtryk der kommunikerer.",
    salary: {
      value: "37.500–52.500 kr/md. (P25–P75)",
      source: "https://loen.dk/grafisk-designer",
    },
    educationPath: {
      value:
        "Typisk en 3,5-årig professionsbachelor i kommunikationsdesign eller en 2-årig designteknolog (erhvervsakademi), fx på KEA eller NEXT – søg via optagelse.dk.",
      source: "https://www.ug.dk/uddannelser/erhvervsakademiuddannelser/designerhverv/designteknolog",
    },
  },
  "marketing-manager": {
    description:
      "Som marketingchef leder du virksomhedens markedsføringsstrategi, styrer kampagner og sætter retning for brand og vækst.",
    salary: {
      value: "62.400–105.800 kr/md. (P25–P75)",
      source: "https://loen.dk/marketingchef",
    },
    educationPath: {
      value:
        "Typisk en HA-bachelor (3 år) eller cand.merc. i markedsføring (5 år) fra fx CBS, AU eller SDU, kombineret med ledelseserfaring – søg via optagelse.dk.",
      source: "https://www.cbs.dk/uddannelse/bachelor/ha-almen",
    },
  },
  dentist: {
    description:
      "Som tandlæge undersøger og behandler du tænder og mund, hjælper patienter med at bevare et sundt smil og forebygger tandsygdomme.",
    salary: {
      value: "55.300–86.900 kr/md. (P25–P75)",
      source: "https://loen.dk/tandlaege",
    },
    educationPath: {
      value:
        "5-årig universitetsuddannelse i odontologi (bachelor + kandidat) på Københavns Universitet eller Aarhus Universitet, efterfulgt af autorisation.",
      source:
        "https://www.studentum.dk/studieguiden/adgangskrav-uddannelser/Adgangskrav_tandl_ge_saadan_kommer_du_ind_paa_odontologiuddannelsen__d19860.html",
    },
  },
  pharmacist: {
    description:
      "Som farmaceut sikrer du sikker og korrekt brug af lægemidler – på apotek, i sygehus eller i lægemiddelindustrien.",
    salary: {
      value: "63.100–95.000 kr/md. (P25–P75)",
      source: "https://loen.dk/farmaceut",
    },
    educationPath: {
      value:
        "5-årig universitetsuddannelse (bachelor + kandidat, cand.pharm.) på Københavns Universitet eller Syddansk Universitet – søg via optagelse.dk.",
      source: "https://www.sdu.dk/da/uddannelse/kandidat/farmaceut/adgangskrav",
    },
  },
  "social-worker": {
    description:
      "Som socialrådgiver hjælper du mennesker i udsatte situationer med at navigere i systemet og finde løsninger på sociale og personlige udfordringer.",
    salary: {
      value: "39.400–47.400 kr/md. (P25–P75)",
      source: "https://loen.dk/socialraadgiver",
    },
    educationPath: {
      value:
        "Socialrådgiveruddannelsen er en 3,5-årig professionsbachelor på professionshøjskoler som VIA UC, UC SYD og KP – søg via optagelse.dk.",
      source:
        "https://socialraadgiverne.dk/faggruppe/studerende/socialraadgiveruddannelsen/",
    },
  },
  journalist: {
    description:
      "Som journalist researcher, skriver og formidler du historier der informerer og engagerer – på aviser, radio, tv og digitale medier.",
    salary: {
      value: "44.400–63.300 kr/md. (P25–P75)",
      source: "https://loen.dk/journalist",
    },
    educationPath: {
      value:
        "Journalistuddannelsen er en 4-årig professionsbachelor på Danmarks Medie- og Journalisthøjskole (DMJX) i Aarhus eller København – optagelse via optagelsesprøve.",
      source: "https://www.dmjx.dk/uddannelser/journalistuddannelsen/journalistik",
    },
  },
  architect: {
    description:
      "Som arkitekt designer du bygninger og byrum – du forener æstetik, funktion og bæredygtighed i alt fra boliger til offentlige institutioner.",
    salary: {
      value: "49.500–65.600 kr/md. (P25–P75)",
      source: "https://loen.dk/arkitekt",
    },
    educationPath: {
      value:
        "5-årig universitetsuddannelse (bachelor + kandidat, cand.arch.) på Det Kongelige Akademi eller Arkitektskolen Aarhus – optagelse via optagelsesprøve.",
      source: "https://kglakademi.dk/da/optagelseskrav-arkitektur",
    },
  },
  "preschool-teacher": {
    description:
      "Som pædagog understøtter du børns trivsel, leg og læring i daginstitutioner og skoler – du bygger trygge relationer og skaber rum for udvikling.",
    salary: {
      value: "36.500–43.800 kr/md. (median–P75)",
      source: "https://loen.dk/paedagog",
    },
    educationPath: {
      value:
        "Pædagoguddannelsen er en 3,5-årig professionsbachelor på professionshøjskoler som UC SYD, KP eller VIA UC med to betalte praktikperioder – søg via optagelse.dk.",
      source: "https://bupl.dk/paedagogik-og-profession/profession-og-uddannelse/bliv-paedagog",
    },
  },
};
