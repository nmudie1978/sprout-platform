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

  // ── Batch 2 (salaries: loen.dk = Danmarks Statistik LONS20, P25–P75) ──
  physiotherapist: {
    description:
      "Som fysioterapeut hjælper du mennesker med at genvinde bevægelse og styrke efter skader, sygdom eller operation.",
    salary: { value: "39.357–46.697 kr/md.", source: "https://loen.dk/fysioterapeut" },
    educationPath: {
      value:
        "Gymnasial uddannelse efterfulgt af en 3,5-årig professionsbachelor i fysioterapi; autorisation fra Styrelsen for Patientsikkerhed.",
      source: "https://kp.dk/uddannelser/fysioterapeut/",
    },
  },
  veterinarian: {
    description:
      "Som dyrlæge diagnosticerer og behandler du syge dyr – fra familiens kæledyr til landbrugets husdyr.",
    salary: { value: "51.006–66.588 kr/md.", source: "https://loen.dk/dyrl%C3%A6ge" },
    educationPath: {
      value:
        "Studentereksamen med matematik, fysik og kemi, efterfulgt af en 5,5-årig veterinæruddannelse (cand.med.vet.) og autorisation hos Fødevarestyrelsen.",
      source: "https://www.ddd.dk/om-ddd/tal-og-fakta/veterinaeruddannelsen/",
    },
  },
  "mechanical-engineer": {
    description:
      "Som maskiningeniør designer og optimerer du maskiner, produktionsanlæg og mekaniske systemer på tværs af industrier.",
    salary: { value: "53.997–77.259 kr/md.", source: "https://loen.dk/maskiningeni%C3%B8r" },
    educationPath: {
      value:
        "3,5-årig diplomingeniøruddannelse (adgang med matematik A, fysik B – typisk via STX, HTX eller EUX); ingen efterfølgende autorisation kræves.",
      source: "https://www.via.dk/uddannelser/maskiningenioer",
    },
  },
  "electrical-engineer": {
    description:
      "Som elektroingeniør udvikler og vedligeholder du elektriske systemer – fra energianlæg og styreteknik til avanceret elektronik.",
    salary: { value: "55.083–78.039 kr/md.", source: "https://loen.dk/elektroingeni%C3%B8r" },
    educationPath: {
      value:
        "3,5-årig diplomingeniør i Elektroteknologi (adgang med matematik A, fysik B, kemi C – typisk via HTX, STX eller EUX).",
      source: "https://www.dtu.dk/da/uddannelse/diplomingenioer/uddannelsesretninger/elektroteknologi",
    },
  },
  "web-developer": {
    description:
      "Som webudvikler bygger du hjemmesider og webapplikationer og omsætter designs til fungerende digitale løsninger.",
    salary: { value: "42.052–63.539 kr/md.", source: "https://loen.dk/webudvikler" },
    educationPath: {
      value:
        "Typisk en 2-årig erhvervsakademiuddannelse (datamatiker eller multimediedesigner), evt. efterfulgt af en 1,5-årig professionsbachelor i webudvikling.",
      source: "https://www.zealand.dk/fuldtid/webudvikling-pba/",
    },
  },
  "cybersecurity-analyst": {
    description:
      "Som it-sikkerhedsanalytiker beskytter du virksomheders systemer og data mod cybertrusler, hacks og datasikkerhedsbrud.",
    salary: { value: "47.849–74.118 kr/md.", source: "https://loen.dk/it-sikkerhedsspecialist" },
    educationPath: {
      value:
        "Professionsbachelor i it-sikkerhed er en 1,5-årig overbygning på en adgangsgivende erhvervsakademi- eller bacheloruddannelse.",
      source: "https://www.ucn.dk/uddannelser/it-sikkerhed/",
    },
  },
  "cloud-engineer": {
    description:
      "Som cloud engineer designer og drifter du skalerbare cloud-infrastrukturer, der holder virksomheders digitale tjenester kørende.",
    salary: { value: "47.675–71.339 kr/md.", source: "https://loen.dk/cloud-engineer" },
    educationPath: {
      value:
        "Typisk en datamatiker- eller softwareudvikleruddannelse (erhvervsakademi/professionsbachelor), suppleret med cloud-certificeringer (AWS, Azure, Google Cloud).",
      source: "https://loen.dk/cloud-engineer",
    },
  },
  "ux-designer": {
    description:
      "Som UX-designer skaber du digitale oplevelser, der er intuitive og behagelige at bruge – med brugeren i centrum.",
    salary: { value: "37.488–52.542 kr/md.", source: "https://loen.dk/ux-designer" },
    educationPath: {
      value:
        "Fx en 3-årig bachelor i Digital Design og Interaktive Teknologier (ITU) eller en designteknolog/multimediedesigner-uddannelse – søg via optagelse.dk.",
      source: "https://itu.dk/Uddannelser/Bacheloruddannelser/Digital-Design-og-Interaktive-Teknologier",
    },
  },
  "product-manager": {
    description:
      "Som produktchef driver du udviklingen af digitale produkter fra idé til lancering og arbejder tæt med både tech og forretning.",
    salary: { value: "55.372–92.761 kr/md.", source: "https://loen.dk/product-manager" },
    educationPath: {
      value:
        "De fleste produktchefer har en kandidatuddannelse (cand.merc., cand.it. eller civilingeniør) bygget oven på en relevant bachelor – søg via optagelse.dk.",
      source: "https://www.sdu.dk/da/uddannelse/kandidat/candmerc",
    },
  },
  "project-manager": {
    description:
      "Som projektleder koordinerer du teams og ressourcer for at levere projekter til tiden, inden for budget og med det rette resultat.",
    salary: { value: "59.874–91.829 kr/md.", source: "https://loen.dk/projektleder" },
    educationPath: {
      value:
        "Projektledere kommer fra mange baggrunde (cand.merc., civilingeniør, cand.it., HD); mange supplerer med en PMP- eller PRINCE2-certificering.",
      source: "https://loen.dk/projektleder",
    },
  },
  "sales-representative": {
    description:
      "Du møder kunder, præsenterer produkter og indgår aftaler – sælgerrollen kombinerer personlig kontakt med kommercielt drive.",
    salary: { value: "42.016–67.946 kr/md.", source: "https://loen.dk/saelger" },
    educationPath: {
      value:
        "De fleste sælgere starter med en erhvervsuddannelse som salgsassistent (EUD, ca. 2 år) eller tager en HHX og går direkte i praktik.",
      source: "https://www.ug.dk/uddannelser-til-unge/erhvervsuddannelser/detailhandelsuddannelsen",
    },
  },
  "real-estate-agent": {
    description:
      "Som ejendomsmægler guider du købere og sælgere sikkert igennem bolighandlen med juridisk og finansiel ekspertise.",
    salary: { value: "39.588–60.785 kr/md.", source: "https://loen.dk/ejendomsmaegler" },
    educationPath: {
      value:
        "Typisk en finansøkonom (2 år) eller finansbachelor (3,5 år) suppleret med akademifag i ejendomshandel og mindst 2 års relevant erfaring.",
      source: "https://www.de.dk/uddannelse-kurser/bliv-ejendomsmaegler",
    },
  },
  "bus-driver": {
    description:
      "Som buschauffør sørger du for, at passagerer kommer sikkert og til tiden frem – i by, forstæder og på tværs af landet.",
    salary: { value: "35.597–42.953 kr/md.", source: "https://loen.dk/buschauffoer" },
    educationPath: {
      value:
        "Buschaufføruddannelsen er en erhvervsuddannelse (EUD) på ca. 2 år, der kombinerer skole og praktik og giver de nødvendige kørekortskategorier.",
      source:
        "https://www.3f.dk/find-svar/uddannelse/erhvervsuddannelse/erhvervsuddannelser-inden-for-3fs-omraader/bliv-uddannet-buschauffoer",
    },
  },
  "truck-driver": {
    description:
      "Lastbilchauffører er rygraden i Danmarks varetransport – du kører gods sikkert frem på tværs af landet og Europa.",
    salary: { value: "36.935–46.120 kr/md.", source: "https://loen.dk/lastbilchauffoer" },
    educationPath: {
      value:
        "Godschaufføruddannelsen er en erhvervsuddannelse (EUD) på ca. 3 år med kørekort C/CE; alternativt et målrettet AMU-forløb med lastbilkørekort.",
      source: "https://www.eucsj.dk/eud/dit-forloeb-paa-eud/vejgodstransport/",
    },
  },
  "flight-attendant": {
    description:
      "Som kabinepersonale sikrer du passagerers sikkerhed og komfort i luften – et job med variation og internationale destinationer.",
    salary: { value: "34.888–52.295 kr/md.", source: "https://loen.dk/stewardesse" },
    educationPath: {
      value:
        "Ingen fast formel uddannelse; flyselskaberne uddanner selv kabinepersonale via et 4–10 ugers kursus med afsluttende Cabin Crew Attestation (CCA).",
      source:
        "https://www.trafikstyrelsen.dk/arbejdsomraader/luftfart/uddannelse-og-certificering-paa-luftfartsomraadet/uddannelse-som-kabinepersonale",
    },
  },
  firefighter: {
    description:
      "Brandmænd rykker ud til brande, ulykker og redningsopgaver – et job der kræver mod, sammenhold og fysisk form.",
    salary: { value: "38.976–52.570 kr/md.", source: "https://loen.dk/brandmand" },
    educationPath: {
      value:
        "Uddannelsen består af Grunduddannelse Indsats (GUI) og Funktionsuddannelse Indsats (FUI), typisk via ansættelse i et kommunalt brandvæsen eller Falck.",
      source:
        "https://www.brs.dk/da/redningsberedskab-myndighed/uddannelse/uddannelser-og-kurser/saadan-bliver-du-brandmand/",
    },
  },
  paramedic: {
    description:
      "Som ambulancebehandler yder du akut livreddende hjælp og stabiliserer patienter undervejs til hospitalet.",
    salary: { value: "39.702–48.637 kr/md.", source: "https://loen.dk/ambulancebehandler" },
    educationPath: {
      value:
        "Ambulancebehandleruddannelsen er en erhvervsuddannelse på ca. 4,5 år, der veksler mellem skole og praktik hos et ambulanceselskab.",
      source: "https://unord.dk/uddannelser/ambulancebehandler",
    },
  },
  midwife: {
    description:
      "Jordemødre støtter kvinder og familier gennem graviditet, fødsel og den tidlige barselsperiode.",
    salary: { value: "39.086–50.538 kr/md.", source: "https://loen.dk/jordemoder" },
    educationPath: {
      value:
        "Jordemoderuddannelsen er en 3,5-årig professionsbachelor med halvdelen af tiden som klinisk praktik; optag via gymnasial eller relevant erhvervsfaglig uddannelse.",
      source: "https://www.ucn.dk/uddannelser/jordemoder/",
    },
  },
  "dental-hygienist": {
    description:
      "Tandplejere forebygger og behandler tandproblemer selvstændigt og er en vigtig del af det danske tandplejesystem.",
    salary: { value: "35.548–45.167 kr/md.", source: "https://loen.dk/tandplejer" },
    educationPath: {
      value:
        "En 3-årig professionsbachelor, der udbydes på Aarhus Universitet og Københavns Universitet; adgang via gymnasial eller relevant erhvervsuddannelse.",
      source: "https://www.dansketandplejere.dk/faget-og-professionen/uddannelsen-til-tandplejer/",
    },
  },
  "occupational-therapist": {
    description:
      "Ergoterapeuter hjælper mennesker med at mestre hverdagens aktiviteter efter sygdom, skade eller funktionsnedsættelse.",
    salary: { value: "39.872–48.020 kr/md.", source: "https://loen.dk/ergoterapeut" },
    educationPath: {
      value:
        "Ergoterapeutuddannelsen er en 3,5-årig professionsbachelor med teori og klinisk praktik; adgang via gymnasial eller relevant erhvervsuddannelse.",
      source: "https://www.ucn.dk/uddannelser/ergoterapeut/",
    },
  },
  radiographer: {
    description:
      "Som radiograf tager du røntgenbilleder og udfører billeddiagnostik, der hjælper læger med at stille præcise diagnoser.",
    salary: { value: "38.123–49.455 kr/md.", source: "https://loen.dk/radiograf" },
    educationPath: {
      value:
        "Professionsbachelor i radiografi (3,5 år med klinisk praktik) på fx UCL eller Professionshøjskolen Absalon; autorisation efter endt uddannelse.",
      source: "https://phabsalon.dk/uddannelser/radiograf/adgangskrav-til-radiografuddannelsen",
    },
  },
  dietitian: {
    description:
      "Som klinisk diætist rådgiver du patienter og borgere om kost og ernæring med udgangspunkt i deres sundhed og sygdomsbillede.",
    salary: { value: "34.162–43.867 kr/md.", source: "https://loen.dk/diaetist" },
    educationPath: {
      value:
        "Professionsbachelor i ernæring og sundhed / klinisk diætist (3,5 år) på fx VIA eller UC SYD; autorisation fra Styrelsen for Patientsikkerhed.",
      source: "https://www.ucsyd.dk/uddannelse/ernaering-og-sundhed",
    },
  },
  optician: {
    description:
      "Som autoriseret optometrist undersøger du folks syn, tilpasser briller og kontaktlinser og opdager tidlige tegn på øjensygdomme.",
    salary: { value: "45.382–52.663 kr/md.", source: "https://loen.dk/optiker" },
    educationPath: {
      value:
        "Professionsbachelor i optometri (3,5 år inkl. klinisk praktik) på EK i København; giver autorisation som optometrist.",
      source: "https://ek.dk/uddannelser/professionsbachelor/optometri",
    },
  },
  welder: {
    description:
      "Som svejser samler og bearbejder du metaldele med avancerede svejseteknikker inden for industri, byggeri og offshore.",
    salary: { value: "41.291–55.274 kr/md.", source: "https://loen.dk/svejser" },
    educationPath: {
      value:
        "Erhvervsuddannelse (EUD) som smed med svejserspeciale (ca. 3–4 år: GF1 + GF2 + hovedforløb i vekselforløb); adgang med folkeskolens afgangseksamen (min. 2,0).",
      source: "https://www.zbc.dk/ungdomsuddannelse/erhvervsuddannelse/teknologi-byggeri-og-transport/svejser/",
    },
  },
  baker: {
    description:
      "Som bager bager du brød, wienerbrød og kager – enten i et håndværksbageri eller i industriel produktion.",
    salary: { value: "31.092–41.343 kr/md.", source: "https://loen.dk/baker" },
    educationPath: {
      value:
        "Erhvervsuddannelse (EUD) som bager og konditor (op til 4,5 år) med specialer som detailbager, håndværksbager eller konditor.",
      source: "https://techcollege.dk/uddannelser/bager-og-konditor/",
    },
  },
  painter: {
    description:
      "Som bygningsmaler behandler og forskønner du overflader på bygninger – indvendigt og udvendigt – med maling, tapet og specialbelægninger.",
    salary: { value: "35.366–45.140 kr/md.", source: "https://loen.dk/maler" },
    educationPath: {
      value:
        "Erhvervsuddannelse (EUD) som bygningsmaler (ca. 3,5–4 år: GF1 + GF2 + hovedforløb i vekselforløb); adgang med folkeskolens afgangseksamen (min. 2,0).",
      source: "https://www.tec.dk/erhvervsuddannelser/vaelg-erhvervsuddannelse/bygningsmaleruddannelsen/",
    },
  },
  bricklayer: {
    description:
      "Som murer opfører og renoverer du bygninger af mursten, beton og fliser og er en uundværlig håndværker på enhver byggeplads.",
    salary: { value: "41.527–53.795 kr/md.", source: "https://loen.dk/murer" },
    educationPath: {
      value:
        "Erhvervsuddannelse (EUD) som murer (ca. 4–4,5 år: GF1 + GF2 + hovedforløb i vekselforløb); adgang med folkeskolens afgangseksamen (min. 2,0).",
      source: "https://www.aarhustech.dk/erhvervsuddannelser/murer/",
    },
  },
  "financial-analyst": {
    description:
      "Som finansanalytiker vurderer du aktier, obligationer og virksomheders økonomiske sundhed og rådgiver investorer og virksomheder.",
    salary: { value: "61.467–88.909 kr/md.", source: "https://loen.dk/finansanalytiker" },
    educationPath: {
      value:
        "HA/BSc(B) (3 år) efterfulgt af cand.merc. i finansiering og regnskab (FIR, 2 år) på fx CBS.",
      source: "https://studieordninger.cbs.dk/2025/kan/1318",
    },
  },
  auditor: {
    description:
      "Som revisor kontrollerer og rådgiver du virksomheder om regnskaber, skat og økonomi – som statsautoriseret revisor er du en anerkendt tillidsperson.",
    salary: { value: "50.108–78.897 kr/md.", source: "https://loen.dk/revisor" },
    educationPath: {
      value:
        "HA/BSc(B) (3 år) + cand.merc.aud. (2 år) på fx CBS, AU eller SDU, herefter 3 års godkendt revisionserfaring og bestået revisoreksamen.",
      source: "https://cbs.dk/uddannelse/kandidat/candmercaud-revisorkandidat/adgangskrav",
    },
  },
};
