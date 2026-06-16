import type { CareerLocalizationEntry } from "./types";

/**
 * Sweden per-career overrides (Approach A). Real, CITED data only — any figure
 * that cannot be verified is OMITTED (suppressed), never invented. Careers with
 * no entry render with `isLocalized: false` (salary + Norwegian education path
 * suppressed). See docs/superpowers/specs/2026-06-16-nordic-salary-data.md
 *
 * salary: APPROXIMATE gross MONTHLY ranges (kr/mån) from Swedish salary sources
 *   (SCB register data via allaloner.se, union surveys, lönestatistik portals).
 *   Ranges vary by region, sector and experience. PENDING OWNER REVIEW.
 * educationPath: the typical Swedish route (gymnasium → högskola/universitet/YH),
 *   from official programme / study-guide pages.
 *
 * Held back (no salary shown until verified): `doctor` (the salary source could
 * not be confirmed — education path kept; card shows no salary).
 */
export const SV_CAREER_LOCALIZATION: Record<string, CareerLocalizationEntry> = {
  "software-developer": {
    description:
      "Du designar, skriver och underhåller programvara – från appar och webbtjänster till system som driver företag och samhälle.",
    salary: {
      value: "38 800–72 500 kr/mån (median ca 52 500 kr/mån)",
      source: "https://allaloner.se/yrken/systemutvecklare-och-programmerare",
    },
    educationPath: {
      value:
        "Gymnasiet (naturvetenskap eller teknik) följt av civilingenjör i datateknik (300 hp, 5 år) eller högskoleingenjör (180 hp, 3 år), t.ex. vid KTH, Chalmers eller LTH.",
      source:
        "https://www.kth.se/utbildning/civilingenjor/datateknik/behorighet-och-antagning-1.924447",
    },
  },
  "registered-nurse": {
    description:
      "Du vårdar och stödjer patienter genom sjukdom och tillfrisknande och samarbetar med läkare för säker, personcentrerad vård.",
    salary: {
      value: "27 500–47 400 kr/mån (genomsnitt ca 42 900 kr/mån)",
      source: "https://lonestatistik.se/sjukskoterska-lon/",
    },
    educationPath: {
      value:
        "Gymnasium (naturvetenskap eller vård- och omsorg) följt av sjuksköterskeprogrammet (180 hp, 3 år) med examen som legitimerad sjuksköterska.",
      source:
        "https://www.shh.se/sv/utbildningar/grundniva/sjukskoterskeprogrammet/sjukskoterskeprogrammet-behorighet-och-urval/",
    },
  },
  electrician: {
    description:
      "Du installerar, underhåller och felsöker elektriska system i allt från bostäder och kontor till industri och infrastruktur.",
    salary: {
      value: "27 700–47 300 kr/mån (median ca 37 900 kr/mån)",
      source: "https://allaloner.se/yrken/elektriker",
    },
    educationPath: {
      value:
        "Treårigt El- och energiprogram på gymnasiet (inriktning Elteknik) med APL; därefter kan man vidareutbilda sig via YH inom automation eller elteknik.",
      source:
        "https://utbildningsguiden.skolverket.se/gymnasieskolan/gymnasieskolans-program/el--och-energiprogrammet",
    },
  },
  plumber: {
    description:
      "Du installerar och underhåller rör-, värme- och ventilationssystem samt vatten och avlopp i byggnader.",
    salary: {
      value: "31 900–54 000 kr/mån (SCB-genomsnitt ca 41 400 kr/mån 2024)",
      source:
        "https://www.byggnadsarbetaren.se/blogginlagg/41-400-enligt-scb-men-i-vast-nar-ackordet-over-54-000/",
    },
    educationPath: {
      value:
        "Treårigt VVS- och fastighetsprogram på gymnasiet (inriktning VVS) med APL; YH-utbildning inom VVS-teknik finns för specialisering.",
      source:
        "https://utbildningsguiden.skolverket.se/gymnasieskolan/gymnasieskolans-program/vvs--och-fastighetsprogrammet",
    },
  },
  carpenter: {
    description:
      "Du bygger, renoverar och bygger om hus och lokaler – från stomme och tak till inredning och fönster.",
    salary: {
      value: "31 800–42 200 kr/mån (median ca 37 900 kr/mån)",
      source: "https://allaloner.se/yrken/hantverkare",
    },
    educationPath: {
      value:
        "Treårigt Bygg- och anläggningsprogram (inriktning Husbyggnad); efter gymnasiet en lärlingsfas (ca 36 månader) för yrkesbevis från BYN.",
      source:
        "https://utbildningsguiden.skolverket.se/gymnasieskolan/gymnasieskolans-program/bygg--och-anlaggningsprogrammet",
    },
  },
  doctor: {
    description:
      "Du utreder, diagnostiserar och behandlar sjukdomar och skador och bär det medicinska ansvaret för patienters hälsa.",
    // salary held back — source could not be confirmed; card shows no salary.
    educationPath: {
      value:
        "Gymnasium (naturvetenskap) följt av läkarprogrammet (360 hp, 6 år), därefter AT/BT-tjänstgöring för legitimation och valfri ST-utbildning till specialist.",
      source: "https://utbildning.ki.se/program/2la21-lakarprogrammet",
    },
  },
  solicitor: {
    description:
      "Som jurist eller advokat företräder du klienter, tolkar lagar och hjälper människor och organisationer att navigera rättssystemet.",
    salary: {
      value: "35 000–67 000 kr/mån",
      source:
        "https://xn--lnexperten-ecb.se/ekonomi/yrken-loner/advokat-lon/advokat-lon-i-sverige-2024-2025/",
    },
    educationPath: {
      value:
        "Juristprogrammet (4,5 år, 270 hp) vid t.ex. Lund, Stockholm eller Göteborg; advokattiteln kräver ytterligare praktik och advokatexamen.",
      source: "https://www.lu.se/studera/juristprogrammet-JAJUS",
    },
  },
  accountant: {
    description:
      "Du sköter företags löpande bokföring, bokslut och deklarationer – en nyckelroll för att hålla ekonomin i ordning.",
    salary: {
      value: "32 600–58 200 kr/mån (median ca 42 400 kr/mån)",
      source: "https://allaloner.se/yrken/redovisningsekonom",
    },
    educationPath: {
      value:
        "Ekonomiprogrammet på gymnasiet följt av en 2-årig YH-utbildning till redovisningsekonom, eller en högskoleutbildning i ekonomi.",
      source: "https://www.gymnasium.se/yrkesguiden/redovisningsekonom-22053",
    },
  },
  psychologist: {
    description:
      "Du utreder, bedömer och behandlar psykisk ohälsa och stödjer människor att förstå och hantera tankar, känslor och beteenden.",
    salary: {
      value: "36 200–48 900 kr/mån (genomsnitt ca 42 800 kr/mån)",
      source: "https://lonstatistik.se/psykolog-lon/",
    },
    educationPath: {
      value:
        "Femåriga psykologprogrammet vid universitet, följt av ett års handledd praktik (PTP) för psykologlegitimation.",
      source: "https://hpguiden.se/allt-om-hogskoleprovet/bli-psykolog",
    },
  },
  "police-officer": {
    description:
      "Du skyddar allmänheten, förebygger brott och upprätthåller lag och ordning i samhället.",
    salary: {
      value: "31 000–55 000 kr/mån (genomsnitt ca 42 400 kr/mån)",
      source: "https://8till5.se/artiklar/polis-lon/",
    },
    educationPath: {
      value:
        "Högskoleförberedande gymnasium, därefter polisutbildningen (2,5 år) vid t.ex. Södertörn, Umeå eller Växjö, avslutad med aspirantpraktik.",
      source: "https://www.gymnasium.se/yrkesguiden/polis-11183",
    },
  },
  chef: {
    description:
      "Du skapar måltidsupplevelser på restauranger, hotell och storkök och omvandlar råvaror till mat som berör.",
    salary: {
      value: "27 300–36 300 kr/mån (median ca 31 000 kr/mån)",
      source: "https://allaloner.se/yrken/kock",
    },
    educationPath: {
      value:
        "Restaurang- och livsmedelsprogrammet (inriktning Kök och servering) med APL; vidareutbildning via YH eller folkhögskola.",
      source:
        "https://www.gymnasium.se/om-gymnasiet/restaurang-och-livsmedelsprogrammet-rl-20723",
    },
  },
  hairdresser: {
    description:
      "Du klipper, färgar och stylar hår och skapar både stil och självförtroende hos dina kunder i salongen.",
    salary: {
      value: "27 200–31 000 kr/mån",
      source: "https://raknalon.se/lon/frisor",
    },
    educationPath: {
      value:
        "Hantverksprogrammet med inriktning frisör (3 år), följt av ca 3 000 timmars betald praktik på salong och gesällprov.",
      source: "https://www.gymnasium.se/yrkesguiden/frisor-11082",
    },
  },
  "data-analyst": {
    description:
      "Du samlar in, bearbetar och tolkar data för att hjälpa organisationer fatta välgrundade beslut.",
    salary: {
      value: "41 800–77 700 kr/mån",
      source: "https://allaloner.se/yrken/dataanalytiker",
    },
    educationPath: {
      value:
        "Vanligast en kandidatexamen (180 hp) i statistik, datavetenskap eller matematik, alternativt en tvåårig YH-utbildning som dataanalytiker.",
      source: "https://allastudier.se/utbildningar/dataanalys",
    },
  },
  "civil-engineer": {
    description:
      "Du löser komplexa tekniska problem inom allt från bygg och infrastruktur till energi och IT.",
    salary: {
      value: "50 300–73 300 kr/mån",
      source: "https://www.sverigesingenjorer.se/lon/civilingenjor-lon/",
    },
    educationPath: {
      value:
        "Civilingenjörsexamen (300 hp, 5 år) vid t.ex. KTH, Chalmers eller LTH, med inriktningar som bygg, maskinteknik eller datateknik.",
      source:
        "https://www.kth.se/utbildning/civilingenjor/oppen-ingang/oppen-ingang-civilingenjor-300-hp-1.4276",
    },
  },
  "graphic-designer": {
    description:
      "Du skapar visuell kommunikation – logotyper, trycksaker, digitala gränssnitt och varumärkesidentiteter.",
    salary: {
      value: "36 900–49 800 kr/mån",
      source: "https://allaloner.se/yrken/grafisk-formgivare",
    },
    educationPath: {
      value:
        "Kandidatexamen i grafisk design (180 hp) eller en tvåårig YH-utbildning inom grafisk produktion och form.",
      source: "https://www.yhutbildningar.se/utbildning/yh-utbildning-grafisk-design",
    },
  },
  "marketing-manager": {
    description:
      "Du leder företagets marknadsföringsstrategi, driver varumärkesarbete och ansvarar för kampanjer och marknadsanalys.",
    salary: {
      value: "43 600–114 900 kr/mån",
      source: "https://jobbland.se/lon/marknadschef",
    },
    educationPath: {
      value:
        "Kandidatexamen (180 hp) i marknadsföring eller företagsekonomi, gärna kompletterad med master och flera års erfarenhet från marknadsroller.",
      source: "https://www.studentum.se/yrkesguiden/marknadschef-24642",
    },
  },
  dentist: {
    description:
      "Du undersöker, diagnostiserar och behandlar tänder och munhälsa för patienter i alla åldrar.",
    salary: {
      value: "44 000–76 600 kr/mån",
      source: "https://allaloner.se/yrken/tandlakare",
    },
    educationPath: {
      value:
        "Tandläkarprogrammet (300 hp, 5 år) vid Karolinska Institutet, Göteborg, Malmö eller Umeå.",
      source: "https://utbildning.ki.se/program/2tl19-tandlakarprogrammet",
    },
  },
  pharmacist: {
    description:
      "Du säkerställer korrekt läkemedelsanvändning, ger rådgivning och arbetar med läkemedelsutveckling eller apoteksverksamhet.",
    salary: {
      value: "42 100–88 800 kr/mån",
      source: "https://allaloner.se/yrken/apotekare",
    },
    educationPath: {
      value:
        "Apotekarprogrammet (300 hp, 5 år) vid Göteborg, Uppsala eller Umeå, med krav på kemi 2, biologi 2 och matematik 4.",
      source: "https://www.gu.se/studera/hitta-utbildning/apotekarprogrammet-f2app",
    },
  },
  "social-worker": {
    description:
      "Du stödjer individer och familjer i utsatta situationer och arbetar med rådgivning, myndighetsutövning och socialt arbete.",
    salary: {
      value: "37 000–43 100 kr/mån",
      source: "https://allaloner.se/yrken/socialsekreterare",
    },
    educationPath: {
      value:
        "Socionomprogrammet (210 hp, 3,5 år) vid svenska lärosäten som Umeå, Stockholm eller Göteborg.",
      source: "https://www.saco.se/studier/studieval/yrken-a-o/socionom/",
    },
  },
  journalist: {
    description:
      "Du undersöker, skriver och rapporterar nyheter och samhällsfrågor för press, radio, tv och digitala medier.",
    salary: {
      value: "33 300–58 300 kr/mån",
      source: "https://jobbland.se/lon/journalist",
    },
    educationPath: {
      value:
        "Journalistprogrammet (180 hp, 3 år) vid t.ex. Stockholm eller Göteborg, med en termins praktik på ett mediehus.",
      source: "https://www.su.se/sok-kurser-och-program/hjook-1.411871",
    },
  },
  architect: {
    description:
      "Du gestaltar och projekterar byggnader och stadsrum – från skiss och bygglov till färdigt hus.",
    salary: {
      value: "38 900–62 400 kr/mån",
      source: "https://allaloner.se/yrken/arkitekt",
    },
    educationPath: {
      value:
        "Arkitektutbildningen (300 hp, 5 år) vid KTH, LTH, Chalmers eller Umeå, med antagning via betyg och/eller arkitektprov.",
      source: "https://www.saco.se/studier/studieval/yrken-a-o/arkitekt-byggnadsarkitekt/",
    },
  },
  "preschool-teacher": {
    description:
      "Du planerar och leder pedagogisk verksamhet för barn 1–5 år och skapar en trygg och stimulerande miljö.",
    salary: {
      value: "34 100–39 200 kr/mån",
      source: "https://allaloner.se/yrken/forskollarare",
    },
    educationPath: {
      value:
        "Förskollärarprogrammet (210 hp, 3,5 år) vid lärarutbildande högskolor, med 20 veckors verksamhetsförlagd utbildning (VFU).",
      source: "https://www.umu.se/utbildning/program/forskollararprogrammet/",
    },
  },
};
